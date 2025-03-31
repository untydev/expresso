import pc from 'picocolors'

export function useLogger (express, config, logger) {
  if (config.has('logs.request') && !config.get('logs.request')) {
    logger.debug('request logging is disabled')
    return
  }

  if (!config.has('logs.level') || config.get('logs.level') !== 'debug') {
    logger.debug('request logging is disabled')
    return
  }

  express.use(async (req, res, next) => {
    const path = req.path
    const start = Date.now()

    logger.debug(pc.dim(`${req.method.toUpperCase()} ${path}`))
    res.on('finish', () => {
      const time = Date.now() - start
      if (res.statusCode === 200) {
        logger.debug(`${req.method.toUpperCase()} ${path} ${pc.green(res.statusCode)} ${pc.dim((`(${time}ms)`))}`)
      } else {
        logger.debug(`${req.method.toUpperCase()} ${path} ${pc.red(res.statusCode)} ${pc.dim((`(${time}ms)`))}`)
      }
    })

    next()
  })

  logger.debug('request logging is enabled')
}
