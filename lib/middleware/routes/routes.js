import nodeFs from 'node:fs'
import nodePath from 'node:path'
import nodeUrl from 'node:url'
import { glob } from 'glob'
import ms from 'ms'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import { isFunction } from '@untydev/types'
import Joi from 'joi'

import { validate, rewrite } from '../../utils.js'

const slowDownSchema = Joi.object({
  window: Joi.string().required(),
  after: Joi.number().integer().required(),
  delay: Joi.string().required(),
  message: Joi.string()
}).unknown(false)

const rateLimitSchema = Joi.object({
  window: Joi.string().required(),
  limit: Joi.number().integer().required(),
  message: Joi.string()
}).unknown(false)

const validateReqSchema = Joi.object({
  params: Joi.object().instance(Joi.constructor),
  query: Joi.object().instance(Joi.constructor),
  headers: Joi.object().instance(Joi.constructor),
  body: Joi.object().instance(Joi.constructor)
}).unknown(false)

function validateReq (options) {
  const validators = []

  if (options.params) {
    validators.push((req) => {
      req.params = validate(options.params, req.params)
    })
  }

  if (options.query) {
    validators.push((req) => {
      // req.query is immutable
      /* req.query = */ validate(options.query, req.query)
    })
  }

  if (options.headers) {
    validators.push((req) => {
      req.headers = validate(options.headers, req.headers)
    })
  }

  if (options.body) {
    validators.push((req) => {
      req.body = validate(options.body, req.body)
    })
  }

  return (req, res, next) => {
    validators.forEach(v => v(req))
    next()
  }
}

function toURLPath (path) {
  return nodePath.join(
    nodePath.dirname(path), nodePath.basename(path, nodePath.extname(path))
  ).replace(/\\/g, '/')
}

function makeRespond (req, res) {
  return (how) => {
    if (how.view) {
      const { views } = req.service
      views.render(how.view, { ...req.flash(), ...how.data })
        .then((html) => {
          res.set('Content-Type', 'text/html')
          res.send(html)
        })
        .catch(() => {
          res.status(500).send()
        })
    } else if (how.redirect) {
      if (how.message) {
        req.flash('message', how.message)
      }
      res.redirect(how.redirect)
    } else if (how.json) {
      if (how.status) {
        res.status(how.status)
      }
      res.json(how.json)
    } else if (how.status) {
      res.status(how.status).send()
    }
  }
}

function makeFlash (req, res) {
  return (key, value) => {
    return req.flash(key, value)
  }
}

export default async function (context) {
  const { config, logger, express, AppError } = context
  const routesPath = nodePath.join(context.path, 'routes')

  // Stop processing if routes directory does not exist.
  if (!nodeFs.existsSync(routesPath)) {
    logger.detail(`Routes : ${routesPath} (missing)`)
    return
  }

  // Fail abruptly if routes is not a directory.
  if (!nodeFs.lstatSync(routesPath).isDirectory()) {
    throw new AppError(`Routes path is not a directory: ${routesPath}`)
  }

  const files = await glob('**/*.js', {
    cwd: routesPath,
    nodir: true
  })

  const router = Router()

  router.use((req, res, next) => {
    req.service = Object.create(null)
    Object.assign(req.service, context)
    req.service.respond = makeRespond(req, res)
    next()
  })

  for (const file of files) {
    let fullPath = `/${context.name}/${toURLPath(file)}`

    if (fullPath.endsWith('/index')) {
      fullPath = fullPath.replace('/index', '')
    }

    if (config.has('routes.rewrite')) {
      fullPath = rewrite(fullPath, config.get('routes.rewrite'))
    }

    const handlers = await import(nodeUrl.pathToFileURL(nodePath.join(routesPath, file)))

    for (const method in handlers) {
      const handler = handlers[method]

      if (!isFunction(handler)) {
        throw new AppError('Route handler must be a function')
      }

      const middleware = []

      if (handler.slowDown) {
        const options = validate(slowDownSchema, handler.slowDown)
        middleware.push(slowDown({
          windowMs: ms(options.window),
          delayAfter: options.after,
          delay: ms(options.delay),
          message: options.message
        }))
      }

      if (handler.rateLimit) {
        const options = validate(rateLimitSchema, handler.rateLimit)
        middleware.push(rateLimit({
          windowMs: ms(options.window),
          limit: options.limit,
          message: options.message
        }))
      }

      if (handler.validateReq) {
        const options = validate(validateReqSchema, handler.validateReq)
        middleware.push(validateReq({
          query: options.query,
          params: options.params,
          headers: options.headers,
          body: options.body
        }))
      }

      if (method === 'default') {
        router.use(fullPath, ...middleware, handler)
        logger.detail(`* ${fullPath}`)
      } else {
        router[method.toLowerCase()](fullPath, ...middleware, handler)
        logger.detail(`${method.toUpperCase()} ${fullPath}`)
      }
    }
  }

  express.use(router)
}

