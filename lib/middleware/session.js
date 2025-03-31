import cookieSession from 'cookie-session'
import ms from 'ms'

export function useSession (express, config, logger) {
  if (!config.has('session')) {
    logger.debug('session is disabled')
    return
  }

  if (config.has('session.enabled') && !config.get('session.enabled')) {
    logger.debug('session is disabled')
    return
  }

  if (!config.has('session.store')) {
    logger.error('session store is not configured')
    logger.debug('session is disabled')
    return
  }

  if (config.get('session.store') === 'cookie') {
    express.use(cookieSession({
      name: 'session',
      maxAge: ms(config.get('session.age')),
      keys: config.get('session.keys'),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }))
  } else {
    logger.error(`session store '${config.get('session.store')} is not supported`)
    logger.debug('session is disabled')
    return
  }

  logger.debug('session is enabled')
}
