import fs from 'node:fs'
import url from 'node:url'
import { Edge } from 'edge.js'

export default class Renderer {
  #logger
  #engine

  constructor (config, logger) {
    this.#logger = logger
    this.#engine = Edge.create({
      cache: config.get('views.cache')
    })
  }

  mount (path) {
    if (!fs.existsSync(path)) {
      return
    }

    if (!fs.statSync(path).isDirectory()) {
      this.#logger.error(`path '${path}' is not a directory`)
      return
    }

    this.#logger.debug(`views: '${path}'`)
    this.#engine.mount(url.pathToFileURL(path))
  }

  async render (name, data = {}) {
    return this.#engine.render(name, data)
  }
}
