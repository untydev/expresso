export default class NullEngine {
  #context

  constructor (context) {
    this.#context = context
  }

  async render () {
    this.#context.logger.warn('To render views, you need to configure the view engine')
  }
}
