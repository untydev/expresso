import { Liquid } from 'liquidjs'

export default class LiquidEngine {
  #liquid

  constructor (options) {
    this.#liquid = new Liquid({
      cache: options.cache,
      root: options.root,
      layouts: options.layouts,
      partials: options.partials,
      extname: '.liquid'
    })
  }

  async render (name, data) {
    return this.#liquid.renderFile(name, data)
  }
}
