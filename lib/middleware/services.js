import path from 'node:path'
import url from 'node:url'
import { DepGraph } from 'dependency-graph'

import Service from './services/service.js'
import { readDirectories } from '../utils.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export async function useServices (express, config, logger, database) {
  const paths = [
    // Built-in services.
    path.resolve(__dirname, '..', 'services'),

    // Client services.
    path.join(config.get('src.path'), 'services')
  ]

  const graph = new DepGraph()

  let items = (await readDirectories(paths))
    .filter(e => e.isDirectory() && (!config.has(`services.${e.name}.enabled`) || (config.has(`services.${e.name}.enabled`) && config.get(`services.${e.name}.enabled`))))
    .map(e => ({ name: e.name, path: path.join(e.path, e.name) }))

  for (const item of items) {
    graph.addNode(item.name, item)
  }

  for (const item of items) {
    if (config.has(`services.${item.name}.deps`)) {
      const deps = config.get(`services.${item.name}.deps`)
      for (const dep of deps) {
        graph.addDependency(item.name, dep)
      }
    }
  }

  items = graph.overallOrder().map(name => graph.getNodeData(name))

  for (const item of items) {
    const service = new Service(item.name, item.path, config, logger, database)
    await service.init(express)
  }
}
