export default class NullProvider {
  #context

  constructor (context) {
    this.#context = context
  }

  async send () {
    this.#context.logger.warn('To send emails, you need to configure an email provider')
  }
}
