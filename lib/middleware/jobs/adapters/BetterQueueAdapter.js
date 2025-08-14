import nodePath from 'node:path'
import Queue from 'better-queue'
import SqliteStore from 'better-queue-sqlite'
import ms from 'ms'
import pc from 'picocolors'

export default class BetterQueueAdapter {
  #context

  constructor (context) {
    this.#context = context
  }

  createQueue (name, worker) {
    const options = this.#createOptions(name)

    const queue = new Queue((data, cb) => {
      const start = Date.now()
      const options = { data, service: Object.create(null) }
      Object.assign(options.service, this.#context)

      worker(options)
        .then((result) => {
          const time = Date.now() - start
          this.#context.logger.debug(`RUN ${this.#context.name}:${name} ${pc.green('OK')} ${pc.dim(`(${time}ms)`)}`)
          cb(null, result)
        })
        .catch((error) => {
          const time = Date.now() - start
          this.#context.logger.debug(`RUN ${this.#context.name}:${name} ${pc.red('FAIL')} ${pc.dim(`(${time}ms)`)}`)
          cb(error)
        })
    }, options)

    const push = (data) => {
      const promise = new Promise((resolve, reject) => {
        const { logger, AppError } = this.#context
        queue.push(data, (error, result) => {
          if (error) {
            switch (error) {
              case 'task_timeout':
                reject(new AppError(`Job timed out: '${name}'`, AppError.JOB_TIMEOUT))
                break

              default:
                reject(new AppError(`Job failed: '${name}' (${error})`, AppError.JOB_UNEXPECTED))
                break
            }
          } else {
            resolve(result)
          }
        })
      })

      promise.catch((error) => {
        // Prevents Unhandled Rejection event.
        this.#context.logger.error(error.message)
      })

      return promise
    }

    return { push }
  }

  #createOptions (name) {
    const options = {
      store: new SqliteStore({
        path: nodePath.join(this.#context.config.get('data.path'), this.#context.config.get('jobs.path'))
      })
    }

    const { config } = this.#context
    const baseKey = `services.${this.#context.name}.jobs.${name}`

    if (config.has(baseKey)) {
      if (config.has(`${baseKey}.timeout`)) {
        options.maxTimeout = ms(config.get(`${baseKey}.timeout`))
      }
    }

    return options
  }
}
