export default class NullAdapter {
  #context

  constructor (context) {
    this.#context = context
  }

  createQueue () {
    return {
      push: (name, data) => {
        this.#context.logger.warn('To push jobs, you need to configure a job queue adapter')
      }
    }
  }
}
