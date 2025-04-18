import nodeFs from 'node:fs'
import nodePath from 'node:path'
import nodeUrl from 'node:url'
import { Sequelize } from 'sequelize'
import { DepGraph } from 'dependency-graph'
import { isFunction } from '@untydev/types'

import useEmails from './emails/emails.js'
import useJobs from './jobs/jobs.js'
import useModels from './models/models.js'
import useRoutes from './routes/routes.js'
import useViews from './views/views.js'

import { readDirectories } from '../utils.js'

const __dirname = nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url))

async function useService (context) {
  await Promise.all([
    useModels(context),
    useViews(context),
    useEmails(context),
    useJobs(context),
    useRoutes(context)
  ])

  // Init the service.
  const initPath = nodePath.join(context.path, '_init.js')
  if (nodeFs.existsSync(initPath) && nodeFs.lstatSync(initPath).isFile()) {
    const initFile = await import(nodeUrl.pathToFileURL(initPath))
    if (isFunction(initFile.default)) {
      await initFile.default(context)
    }
  }
}

export async function useServices (context) {
  const { AppError, config } = context

  // Set up sequelize.
  const sequelize = new Sequelize({
    dialect: config.get('models.store'),
    storage: nodePath.join(config.get('data.path'), config.get('models.path')),
    logging: false
  })

  await sequelize.authenticate()

  if (config.has('models.sync')) {
    await sequelize.sync(config.get('models.sync'))
  }

  context.extend('sequelize', sequelize)

  const paths = [
    // Bundled services.
    nodePath.resolve(__dirname, '..', '..', 'ext', 'services'),

    // Client services.
    nodePath.join(config.get('src'), 'services')
  ]

  // todo: Resolve conflicts between bundled and client service names.

  const graph = new DepGraph()
  const entries = await readDirectories(paths)

  for (const entry of entries) {
    const path = nodePath.join(entry.parentPath, entry.name)

    // Only directories are valid services.
    if (!entry.isDirectory()) {
      throw new AppError(`service is not a directory: '${path}'`)
    }

    // Verify naming constraints (must be a slug).
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name)) {
      throw new AppError(`invalid service name: '${path}`)
    }

    // Skip this service if it's not enabled in the config.
    if (!config.get(`services.${entry.name}.enabled`)) {
      continue
    }

    graph.addNode(entry.name, { name: entry.name, path })
  }

  // Add dependencies.
  for (const name of graph.overallOrder()) {
    const data = graph.getNodeData(name)
    if (config.has(`services.${data.name}.deps`)) {
      config.get(`services.${data.name}.deps`)
        .forEach(dep => graph.addDependency(data.name, dep))
    }
  }

  // Order and initialize.
  for (const name of graph.overallOrder()) {
    const data = graph.getNodeData(name)

    await useService(context
      .derive()
      .extend('name', data.name)
      .extend('path', data.path))
  }
}
