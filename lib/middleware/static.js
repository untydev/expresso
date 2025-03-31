import Express from 'express'

export function useStatic (express, config, logger) {
  if (!config.has('static')) {
    logger.debug('static server is disabled')
    return
  }

  if (config.has('static.enabled') && !config.get('static.enabled')) {
    logger.debug('static server is disabled')
    return
  }

  if (!config.has('static.path')) {
    logger.error('static server path is not configured')
    logger.debug('static server is disabled')
    return
  }

  if (config.has('static.prefix') && config.get('static.prefix')) {
    express.use(`/${config.get('static.prefix')}`, Express.static(config.get('static.path')))
  } else {
    express.use(Express.static(config.get('static.path')))
  }

  logger.debug('static server enabled')
}
