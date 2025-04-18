import express from 'express'

export function createExpress (context) {
  const { config } = context
  const app = express()

  // Remove x-powered-by header from all responses.
  app.disable('x-powered-by')

  // Set trusted proxies if configured.
  app.set('trust proxies', config.get('proxy.trust'))

  // Return Express app instance.
  return app
}
