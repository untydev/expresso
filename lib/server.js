import http from 'node:http'

export function createServer (express, config, logger) {
  const server = http.createServer(express)

  const originalListen = server.listen

  server.listen = function () {
    const listen = function () {
      originalListen.call(server, config.get('server.port'), () => {
        logger.info(`listening on http://127.0.0.1:${config.get('server.port')}`)
      })
    }

    server.on('error', function (err) {
      if (err.code === 'EADDRINUSE') {
        logger.error('Address already in use, retrying in 5 seconds...')

        setTimeout(() => {
          listen()
        }, 5000)
      } else {
        logger.error(err)
      }
    })

    listen()
  }

  return server
}
