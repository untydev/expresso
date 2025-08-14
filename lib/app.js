import EventEmitter from 'node:events'
import nodeFs from 'node:fs'
import nodePath from 'node:path'
import nodeUrl from 'node:url'

import { Sequelize } from 'sequelize'
import { DepGraph } from 'dependency-graph'
import { isFunction } from '@untydev/types'

import AppError from './error.js'
import { createConfig } from './config.js'
import { createContext } from './context.js'
import { createExpress } from './express.js'
import { createLogger } from './logger.js'
import { createServer } from './server.js'
import { readVersion } from './utils.js'
import { useEmails } from './middleware/emails.js'
import { useError } from './middleware/error.js'
import { useFlash } from './middleware/flash.js'
import { useJobs } from './middleware/jobs.js'
import { useLogger } from './middleware/logger.js'
import { useModels } from './middleware/models.js'
import { useParser } from './middleware/parser.js'
import { useRoutes } from './middleware/routes.js'
import { useSecurity } from './middleware/security.js'
import { useSession } from './middleware/session.js'
import { useStatic } from './middleware/static.js'
import { useViews } from './middleware/views.js'
import { readDirectories } from './utils.js'

const __dirname = nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url))

process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandled rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('uncaught exception thrown:', error)
  process.exit(1)
})

/**
 * Application class.
 */
export default class App extends EventEmitter {
  #context = null
  #version = 'unknown'
  #started = false

  /**
   * Creates a new application.
   */
  constructor () {
    super()

    // App context
    const context = createContext()

    // Lib version
    this.#version = readVersion()

    // App config
    context.extend('config', createConfig(context))

    // App logger
    context.extend('logger', createLogger(context))

    // Express.js
    context.extend('express', createExpress(context))

    // Http server
    context.extend('server', createServer(context))

    // App error
    context.extend('AppError', AppError)

    // Save context
    this.#context = context
  }

  /**
   * Returns the version.
   */
  get version () {
    return this.#version
  }

  /**
   * Returns the configuration.
   */
  get config () {
    return this.#context.config
  }

  /**
   * Returns the logger.
   */
  get logger () {
    return this.#context.logger
  }

  /**
   * Returns the express instance.
   */
  get express () {
    return this.#context.express
  }

  /**
   * Returns the HTTP server.
   */
  get server () {
    return this.#context.server
  }

  /**
   * Starts the application.
   */
  async start () {
    // Prevent from starting the app more than once.
    if (this.#started) {
      throw new AppError('Application already started')
    }

    this.#started = true

    // Print the welcome message.
    this.logger.info('Starting application...\n')
    this.logger.info('            ( (       ')
    this.logger.info('             ) )      ')
    this.logger.info('           ........   ')
    this.logger.info('           |      |]    Expresso')
    this.logger.info(`           \\      /     v${this.version}`)
    this.logger.info('            `----\'   \n')

    // Make sure that the 'data' dir exists.
    const dataPath = this.config.get('data.path')

    if (!nodeFs.existsSync(dataPath)) {
      nodeFs.mkdirSync(dataPath, { recursive: true })
    }

    if (!nodeFs.lstatSync(dataPath).isDirectory()) {
      throw new AppError(`Data path is not a directory: '${dataPath}'`)
    }

    // Logger middleware
    useLogger(this.#context)

    // Security middleware
    /*useSecurity(this.#context)*/

    // Static middleware
    useStatic(this.#context)

    // Parser middleware
    useParser(this.#context)

    // Session middleware
    useSession(this.#context)

    // Flash middleware
    useFlash(this.#context)

    // Load application
    await this.#load()

    // Error middleware
    useError(this.#context)

    // Listen for requests
    this.server.listen(() => {
      this.logger.info(`To see your app, visit http://localhost:${this.server.address().port}`)
      this.logger.info('To shut down, press <CTRL> + C at any time.\n')

      this.logger.debug('----------------------------------------')
      this.logger.debug(`${new Date()}\n`)
      this.logger.debug(`Environment : ${process.env.NODE_ENV ?? 'development'}`)
      this.logger.debug(`Port        : ${this.config.get('port')}`)
      this.logger.debug('----------------------------------------\n')

      this.emit('ready')
    })
  }
  
  async #load () {
    const { AppError, config } = this.#context

    async function useService (context) {
      await Promise.all([
        //useApis(context),
        //useModels(context),
        useViews(context),
        //useEmails(context),
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

    // Set up sequelize.
    const sequelize = new Sequelize({
      dialect: config.get('models.store'),
      storage: nodePath.join(config.get('data.path'), config.get('models.path')),
      logging: false
    })

    await sequelize.authenticate()

    this.#context.extend('sequelize', sequelize)

    const paths = [
      // Bundled services.
      nodePath.resolve(__dirname, 'services'),

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

      await useService(this.#context
        .derive()
        .extend('name', data.name)
        .extend('path', data.path)
      )
    }

    if (config.has('models.sync')) {
      await sequelize.sync(config.get('models.sync'))
    }
  }
}

