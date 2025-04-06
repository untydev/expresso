import App from './app.js'
import Joi from 'joi'

/**
 * Create a new application.
 * @returns {App}
 */
export default function expresso () {
  return new App()
}

export * from './errors.js'

export { Joi as Schema }