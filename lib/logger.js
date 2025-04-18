import path from 'node:path'
import winston from 'winston'
import pc from 'picocolors'

const levelColors = {
  error: pc.red,
  warn: pc.yellow,
  info: pc.cyan,
  http: pc.magenta,
  verbose: pc.dim,
  debug: pc.dim,
  silly: pc.dim
}

function consoleFormat (name) {
  return winston.format.printf(({ level, message, stack }) => {
    const color = levelColors[level] || ((msg) => msg) // fallback to no color
    return color(`${level}: ${stack || message}`)
  })
}

export function createLogger (context) {
  const { config } = context
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
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        consoleFormat(config.get('name'))
      )
    }))
  }

  return logger
}
