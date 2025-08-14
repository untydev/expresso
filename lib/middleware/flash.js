import { isUndefined, isString, isObject } from '@untydev/types'

export function useFlash (context) {
  const { logger, express, AppError } = context

  express.use((req, res, next) => {
    if (!isObject(req.session)) {
      throw new AppError('Flash requires a session object')
    }

    const messages = req.session.flash || Object.create(null)

    delete req.session.flash

    req.flash = (key, message) => {
      if (isUndefined(key)) {
        return messages
      }

      if (isUndefined(message)) {
        return messages[key]
      }

      if (!isString(key)) {
        throw new AppError('Flash key must be a string')
      }

      if (!isString(message)) {
        throw new AppError('Flash message must be a string')
      }

      if (!req.session.flash) {
        req.session.flash = Object.create(null)
      }

      if (!isObject(req.session.flash)) {
        throw new AppError('Flash session property is not an object')
      }

      req.session.flash[key] = message
    }

    next()
  })
}