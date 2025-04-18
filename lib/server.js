import nodeHttp from 'node:http'

import { isInteger } from '@untydev/types'

/**
 * Creates an HTTP server.
 */
export function createServer (context) {
  const { express, config, logger } = context
  const server = nodeHttp.createServer(express)

  const originalListen = server.listen.bind(server)

  server.listen = function (...args) {
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error('Listen error: address already in use')
      } else {
        logger.error('Listen error:', error)
      }
    })

    if (isInteger(args[0])) {
      originalListen(...args)
    } else {
      originalListen(config.get('port'), ...args)
    }
  }

  return server
}
