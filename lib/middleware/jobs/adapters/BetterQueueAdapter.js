import nodePath from 'node:path'
import Queue from 'better-queue'
import SqliteStore from 'better-queue-sqlite'
import pc from 'picocolors'

import AppError from '../../../error.js'

export default class BetterQueueAdapter {
  #context

  constructor (context) {
    this.#context = context
  }

  createQueue (name, worker) {
    const store = new SqliteStore({
      path: nodePath.join(this.#context.config.get('data.path'), 'jobs.db')
    })

    const config = this.#context.config.get(`services.${this.#context.name}.jobs.${name}`)
    const options = { store }

    if (config.has('timeout')) {
      options.maxTimeout = config.get('timeout')
    }

    const queue = new Queue((data, cb) => {
      const start = Date.now()

      worker({ data, service: this.#context.service })
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

    const push = (data) => new Promise((resolve, reject) => {
      queue.push(data, (error, result) => {
        if (error) {
          switch (error) {
            case 'task_timeout':
              return reject(new AppError(`Job timed out: '${name}'`, AppError.JOB_TIMEOUT))

            default:
              return reject(new AppError(`Job failed: '${name}' (${error})`, AppError.JOB_UNEXPECTED))
          }
        } else {
          return resolve(result)
        }
      })
    })

    return { push }
  }
}
