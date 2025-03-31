import Express from 'express'

export function useParser (express, config, logger) {
  if (!config.has('parser')) {
    logger.debug('parser is disabled')
    return
  }

  if (config.has('parser.enabled') && !config.get('parser.enabled')) {
    logger.debug('parser is disabled')
    return
  }

  if (!config.has('parser.format')) {
    logger.error('parser format is not configured')
    logger.debug('parser is disabled')
    return
  }

  const options = {}

  if (config.has('parser.limit')) {
    options.limit = config.get('parser.limit')
  }

  if (config.get('parser.format') === 'json') {
    express.use(Express.json(options))
  } else {
    logger.error(`parser format '${config.get('parser.format')}' is not supported`)
    logger.debug('parser is disabled')
    return
  }

  logger.debug('parser is enabled')
}
