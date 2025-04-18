import { Resend } from 'resend'
import AppError from '../../../error.js'

export default class ResendProvider {
  #context = null
  #resend = null

  constructor (context) {
    this.#context = context
    this.#resend = new Resend(context.config.get('mailer.apiKey'))
  }

  async send (html, options) {
    this.#context.logger.info('sending email')
    const { error } = await this.#resend.emails.send({ html, ...options })
    if (error) {
      throw new AppError('Failed to send an email')
    }
  }
}
