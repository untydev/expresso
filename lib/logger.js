import path from 'node:path'
import config from 'config'
import winston from 'winston'

export function createLogger () {
  const logsPath = config.get('logs.path')
  const logger = winston.createLogger({
    level: config.get('logs.level'),
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: path.join(logsPath, 'error.log'), level: 'error' }),
      new winston.transports.File({ filename: path.join(logsPath, 'combined.log') })
    ]
  })

  if (config.get('logs.console')) {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }))
  }

  return logger
}
