import App from './app.js'

/**
 * Create a new application.
 * @returns {App}
 */
export default function expresso () {
  return new App()
}

export * from './errors.js'
