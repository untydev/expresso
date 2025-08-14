import nodeCrypto from 'node:crypto'
import nodeFs from 'node:fs'
import nodePath from 'node:path'
import cookieSession from 'cookie-session'
import ms from 'ms'

import AppError from '../error.js'

export function useSession (context) {
  const { logger, express, config } = context
  const store = config.get('session.store')

  if (store === false) {
    return
  }

  if (store === 'cookie') {
    let keys = null

    if (!config.has('session.keys')) {
      if (process.env.NODE_ENV !== 'production') {
        const path = nodePath.join(config.get('data.path'), 'keys')

        if (nodeFs.existsSync(path)) {
          const data = nodeFs.readFileSync(path, 'utf8')
          keys = JSON.parse(data)
          logger.warn(`A pair of keys found in '${path}' will be used to sign session cookies`)
        } else {
          keys = [
            nodeCrypto.randomBytes(16).toString('hex'),
            nodeCrypto.randomBytes(16).toString('hex')
          ]

          nodeFs.writeFileSync(path, JSON.stringify(keys), 'utf8')
          logger.warn(`A pair of keys has been generated in '${path}' to sign session cookies`)
        }
      }
    }

    express.use(cookieSession({
      name: 'session',
      maxAge: ms(config.get('session.age')),
      keys: keys || config.get('session.keys'),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }))
  } else {
    throw new AppError(`Session store is not supported: '${store}`)
  }
}
