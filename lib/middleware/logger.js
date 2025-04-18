import pc from 'picocolors'

export function useLogger (context) {
  const { express, config, logger } = context

  if (config.get('logs.level') !== 'debug') {
    return
  }

  express.use(async (req, res, next) => {
    req.logger = logger

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
}
