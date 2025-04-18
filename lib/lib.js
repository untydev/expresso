import App from './app.js'

/**
 * Creates a new application.
 * @returns {App}
 */
export default function expresso () {
  return new App()
}

/**
 * Application error type.
 */
export { default as AppError } from './error.js'

/**
 * Schema definitions.
 */
export { default as Schema } from 'joi'

/**
 * Sequelize types.
 */
export { DataTypes as Model } from 'sequelize'
