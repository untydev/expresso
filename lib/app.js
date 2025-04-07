import fs from 'node:fs'
import config from 'config'
import express from 'express'

import { createLogger } from './logger.js'
import { createServer } from './server.js'
import { useDatabase } from './middleware/database.js'
import { useError } from './middleware/error.js'
import { useLogger } from './middleware/logger.js'
import { useParser } from './middleware/parser.js'
import { useSecurity } from './middleware/security.js'
import { useServices } from './middleware/services.js'
import { useSession } from './middleware/session.js'
import { useStatic } from './middleware/static.js'

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

export default class App {
  #logger
  #config
  #express
  #server

  /**
   * Constructs a new application.
   */
  constructor () {
    // App config
    this.#config = config

    // App logger
    this.#logger = createLogger(this.config)

    // Express.js
    this.#express = express()

    // Http server
    this.#server = createServer(this.express, this.config, this.logger)
  }

  /**
   * Returns the configuration.
   */
  get config () {
    return this.#config
  }

  /**
   * Returns the logger.
   */
  get logger () {
    return this.#logger
  }

  /**
   * Returns the express application.
   */
  get express () {
    return this.#express
  }

  /**
   * Returns the HTTP server.
   */
  get server () {
    return this.#server
  }

  /**
   * Starts the application.
   */
  async start () {
    this.#express.disable('x-powered-by')
    if (this.config.has('server.trustProxy')) {
      this.#express.set('trust proxy', this.config.get('server.trustProxy'))
    }

    // Make sure that the 'data' dir exists.
    const dataPath = this.config.get('data.path')
    if (fs.existsSync(dataPath) && !fs.statSync(dataPath).isDirectory()) {
      this.logger.error(`path '${dataPath}' is not a directory`)
      process.exit(-1)
    }

    fs.mkdirSync(dataPath, { recursive: true })

    // Parser middleware
    useParser(this.express, this.config, this.logger)

    // Logger middleware
    useLogger(this.express, this.config, this.logger)

    // Security middleware
    useSecurity(this.express)

    // Static middleware
    useStatic(this.express, this.config, this.logger)

    // Database middleware
    const db = useDatabase(this.express, this.config, this.logger)

    // Session middleware
    useSession(this.express, this.config, this.logger)

    // Services middleware
    await useServices(this.express, this.config, this.logger, db)

    // Error middleware
    useError(this.express, this.config, this.logger)

    // Listen for requests
    this.#server.listen()
  }
}
