import config from 'config'
import Joi from 'joi'

import AppError from './error.js'

const schema = Joi.object({
  src: Joi.string().required(),
  port: Joi.number().integer().min(0).max(65535).required(),

  name: Joi.string().min(1).max(30).required(),
  domain: Joi.string().min(4).max(30).required(),

  proxy: Joi.object({
    trust: Joi.array().items(Joi.string()).required()
  }).required(),

  static: Joi.object({
    paths: Joi.array().items(Joi.object({
      path: Joi.string().required(),
      prefix: Joi.string()
    })).required()
  }).required(),

  logs: Joi.object({
    path: Joi.string().required(),
    level: Joi.string().valid('emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug'),
    console: Joi.boolean().required(),
    request: Joi.boolean().required()
  }).required(),

  data: Joi.object({
    path: Joi.string().required()
  }).required(),

  http: Joi.object({
    body: Joi.object({
      format: Joi.alternatives().try(
        Joi.string().valid('json'),
        Joi.boolean().valid(false)
      ).required(),
      limit: Joi.string()
    }).required()
  }).required(),

  session: Joi.object({
    store: Joi.alternatives().try(
      Joi.string().valid('cookie'),
      Joi.boolean().valid(false)
    ).required(),
    age: Joi.string().when('store', {
      is: 'cookie',
      then: Joi.string().required(),
      otherwise: Joi.optional()
    }),
    keys: Joi.array().items(Joi.string()).when('store', {
      is: 'cookie',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }).required(),

  models: Joi.object({
    store: Joi.string().valid('sqlite'),
    path: Joi.string().when('store', {
      is: 'sqlite',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    sync: Joi.object({
      force: Joi.boolean(),
      alter: Joi.boolean()
    })
  }).required(),

  views: Joi.object({
    engine: Joi.alternatives().try(
      Joi.string().valid('liquid'),
      Joi.boolean().valid(false)
    ).required(),
    cache: Joi.boolean().when('engine', {
      is: Joi.string(),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }).required(),

  jobs: Joi.object({
    adapter: Joi.alternatives().try(
      Joi.string().valid('better-queue'),
      Joi.boolean().valid(false)
    ).required()
  }).required(),

  emails: Joi.object({
    provider: Joi.alternatives().try(
      Joi.string().valid('smtp', 'resend'),
      Joi.boolean().valid(false)
    ).required()
  }).required(),

  services: Joi.object({
    auth: Joi.object({
      enabled: Joi.boolean().required(),
      sender: Joi.string().when('enabled', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    }).required(),
    sqlite: Joi.object({
      enabled: Joi.boolean().required(),
      package: Joi.string().valid('sqlite3', 'better-sqlite3').required()
    }).required()
  }).required().unknown(true)
}).required().unknown(true)

export function createConfig (context) {
  const { error } = schema.validate(config)
  if (error) {
    throw new AppError(`config is invalid: ${error.details[0].message}`)
  }

  return config
}
