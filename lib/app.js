import EventEmitter from 'node:events'
import nodeFs from 'node:fs'

import AppError from './error.js'
import { createConfig } from './config.js'
import { createContext } from './context.js'
import { createExpress } from './express.js'
import { createLogger } from './logger.js'
import { createServer } from './server.js'
import { readVersion } from './version.js'
import { useError } from './middleware/error.js'
import { useLogger } from './middleware/logger.js'
import { useParser } from './middleware/parser.js'
import { useSecurity } from './middleware/security.js'
import { useServices } from './middleware/services.js'
import { useSession } from './middleware/session.js'
import { useStatic } from './middleware/static.js'

process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandled rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('uncaught exception thrown:', error)
  process.exit(1)
})

/**
 * An application class.
 */
export default class App extends EventEmitter {
  #context = null
  #version = 'unknown'
  #started = false

  /**
   * Creates a new application.
   */
  constructor () {
    super()

    // App context
    const context = createContext()

    // Lib version
    this.#version = readVersion()

    // App config
    context.extend('config', createConfig(context))

    // App logger
    context.extend('logger', createLogger(context))

    // Express.js
    context.extend('express', createExpress(context))

    // Http server
    context.extend('server', createServer(context))

    // App services
    context.extend('services', Object.create(null))

    // App error
    context.extend('AppError', AppError)

    // Save context
    this.#context = context
  }

  /**
   * Returns the version.
   */
  get version () {
    return this.#version
  }

  /**
   * Returns the configuration.
   */
  get config () {
    return this.#context.config
  }

  /**
   * Returns the logger.
   */
  get logger () {
    return this.#context.logger
  }

  /**
   * Returns the express instance.
   */
  get express () {
    return this.#context.express
  }

  /**
   * Returns the HTTP server.
   */
  get server () {
    return this.#context.server
  }

  /**
   * Starts the application.
   */
  async start () {
    // Prevent from starting the app more than once.
    if (this.#started) {
      throw new AppError('Application already started')
    }

    this.#started = true

    // Print the welcome message.
    this.logger.info('Starting application...\n')
    this.logger.info('            ( (       ')
    this.logger.info('             ) )      ')
    this.logger.info('           ........   ')
    this.logger.info('           |      |]    Expresso')
    this.logger.info(`           \\      /     v${this.version}`)
    this.logger.info('            `----\'   \n')

    // Make sure that the 'data' dir exists.
    const dataPath = this.config.get('data.path')

    if (!nodeFs.existsSync(dataPath)) {
      nodeFs.mkdirSync(dataPath, { recursive: true })
    }

    if (!nodeFs.lstatSync(dataPath).isDirectory()) {
      throw new AppError(`Data path is not a directory: '${dataPath}'`)
    }

    // Logger middleware
    useLogger(this.#context)

    // Security middleware
    useSecurity(this.#context)

    // Static middleware
    useStatic(this.#context)

    // Parser middleware
    useParser(this.#context)

    // Session middleware
    useSession(this.#context)

    // Services middleware
    await useServices(this.#context)

    // Error middleware
    useError(this.#context)

    // Listen for requests
    this.server.listen(() => {
      this.logger.info(`To see your app, visit http://localhost:${this.server.address().port}`)
      this.logger.info('To shut down, press <CTRL> + C at any time.\n')

      this.logger.debug('----------------------------------------')
      this.logger.debug(`${new Date()}\n`)
      this.logger.debug(`Environment : ${process.env.NODE_ENV ?? 'development'}`)
      this.logger.debug(`Port        : ${this.config.get('port')}`)
      this.logger.debug('----------------------------------------\n')

      this.emit('ready')
    })
  }
}
