import path from 'node:path'
import winston from 'winston'
import pc from 'picocolors'

const customLevels = {
  levels: {
    alert: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    detail: 5
  },
  colors: {
    alert: pc.red,
    error: pc.red,
    warn: pc.yellow,
    info: pc.cyan,
    debug: pc.gray,
    detail: pc.dim
  }
}

function consoleFormat () {
  return winston.format.printf(({ level, message, stack }) => {
    const color = customLevels.colors[level] || ((msg) => msg) // fallback to no color
    return color(`${level}: ${stack || message}`)
  })
}

export function createLogger (context) {
  const { config } = context
  const logsPath = config.get('logs.path')
  const logger = winston.createLogger({
    levels: customLevels.levels,
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
