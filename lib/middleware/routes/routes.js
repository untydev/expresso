import nodeFs from 'node:fs'
import nodePath from 'node:path'
import nodeUrl from 'node:url'
import ms from 'ms'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import { isString } from '@untydev/types'

import AppError from '../../error.js'
import { walkDirSync } from '../../utils.js'

function validateBody ({ schema }) {
  return function (req, res, next) {
    const { error } = schema.validate(req.body)
    if (error) {
      throw new AppError(error.details[0].message, AppError.BAD_REQUEST)
    }
    next()
  }
}

export default async function (context) {
  const { config } = context
  const routesDir = nodePath.join(context.path, 'routes')
  if (!nodeFs.existsSync(routesDir) || !nodeFs.statSync(routesDir).isDirectory()) {
    return
  }

  const routes = []

  walkDirSync(routesDir, (routePath) => {
    const parsedPath = nodePath.parse(nodePath.relative(routesDir, routePath))
    let urlPath = ''

    if (parsedPath.dir.length > 0) {
      urlPath = `/${parsedPath.dir}`
    }

    if (parsedPath.name === 'index') {
      urlPath = '/'
    } else if (parsedPath.name !== '_all') {
      urlPath = `${urlPath}/${parsedPath.name}`
    }

    routes.push({ path: urlPath, file: routePath, name: parsedPath.name })
  })

  const router = Router()

  router.use((req, res, next) => {
    req.service = Object.create(null)
    Object.assign(req.service, context)
    next()
  })

  const prefix = config.has(`services.${context.name}.routes.prefix`)
    ? config.get(`services.${context.name}.routes.prefix`)
    : `/${context.name}`

  for (const route of routes) {
    const mod = await import(nodeUrl.pathToFileURL(route.file))

    for (const method in mod) {
      const handler = mod[method]
      const stack = []

      if (handler.rateLimit) {
        stack.push(rateLimit({
          windowMs: ms(handler.rateLimit.window),
          limit: handler.rateLimit.limit,
          message: handler.rateLimit.message
        }))
      }

      if (handler.slowDown) {
        stack.push(slowDown({
          windowMs: ms(handler.slowDown.window),
          delayAfter: handler.slowDown.after,
          delay: isString(handler.slowDown.delay) ? ms(handler.slowDown.delay) : handler.slowDown.delay,
          message: handler.slowDown.message
        }))
      }

      if (handler.validateBody) {
        stack.push(validateBody({
          schema: handler.validateBody
        }))
      }

      stack.push(handler)

      if (route.name === '_all' && method === 'default') {
        router.use(route.path, ...stack)
      } else {
        router[method](route.path, ...stack)
      }
    }

    context.express.use(prefix, router)
  }
}
