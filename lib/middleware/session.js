import cookieSession from 'cookie-session'
import ms from 'ms'

import AppError from '../error.js'

export function useSession (context) {
  const { express, config } = context
  const store = config.get('session.store')

  if (store === false) {
    return
  }

  if (store === 'cookie') {
    express.use(cookieSession({
      name: 'session',
      maxAge: ms(config.get('session.age')),
      keys: config.get('session.keys'),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }))
  } else {
    throw new AppError(`Session store is not supported: '${store}`)
  }
}
