import path from 'node:path'
import sqlite3 from 'better-sqlite3'

export function useDatabase (express, config, logger) {
  if (!config.has('database')) {
    logger.debug('database is disabled')
    return
  }

  if (config.has('database.enabled') && !config.get('database.enabled')) {
    logger.debug('database is disabled')
    return
  }

  if (!config.has('database.type')) {
    logger.error('database type is not configured')
    logger.debug('database is disabled')
    return
  }

  if (config.get('database.type') === 'sqlite') {
    const dbPath = path.join(config.get('data.path'), 'app.db')
    const dbClient = sqlite3(dbPath)

    // Set journal mode to WAL
    dbClient.pragma('journal_mode = WAL')

    // Set synchronous to NORMAL
    dbClient.pragma('synchronous = NORMAL')

    // Set busy timeout to 5000ms (5 seconds)
    dbClient.pragma('busy_timeout = 5000')

    express.use(function (req, res, next) {
      req.database = dbClient
      next()
    })

    logger.debug('database is enabled')

    return dbClient
  } else {
    logger.error(`database type '${config.get('database.type')}' is not supported`)
    logger.debug('database is disabled')
  }
}
