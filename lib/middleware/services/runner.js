import path from 'node:path'
import Queue from 'better-queue'
import SqliteStore from 'better-queue-sqlite'
import pc from 'picocolors'

import { JobError } from '../../errors.js'

export default class Runner {
  #name
  #config = null
  #logger = null
  #queues = new Map()

  constructor (name, config, logger) {
    this.#name = name
    this.#config = config
    this.#logger = logger
  }

  add (name, process) {
    const store = new SqliteStore({
      path: path.join(this.#config.get('data.path'), 'jobs.db')
    })

    const options = (() => {
      if (!this.#config.has(`services.${this.#name}.jobs.${name}`)) {
        return { store }
      }

      const config = this.#config.get(`services.${this.#name}.jobs.${name}`)
      return {
        store,
        maxTimeout: config.has('timeout') && config.get('timeout')
      }
    })()

    const queue = new Queue((data, cb) => {
      const start = Date.now()
      process({ data, config: this.#config, logger: this.#logger })
        .then((result) => {
          const time = Date.now() - start
          this.#logger.debug(`RUN ${this.#name}:${name} ${pc.green('OK')} ${pc.dim(`(${time}ms)`)}`)
          cb(null, result)
        })
        .catch((error) => {
          const time = Date.now() - start
          this.#logger.debug(`RUN ${this.#name}:${name} ${pc.red('FAIL')} ${pc.dim(`(${time}ms)`)}`)
          cb(error)
        })
    }, options)

    this.#queues.set(name, queue)
  }

  run (name, data) {
    return new Promise((resolve, reject) => {
      const queue = this.#queues.get(name)
      if (queue == null) {
        reject(new JobError(`job '${name}' not found`, JobError.CODE_NOT_FOUND))
        return
      }

      this.#logger.debug(pc.dim(`RUN ${this.#name}:${name}`))

      queue.push(data, (error, result) => {
        if (error) {
          switch (error) {
            case 'task_timeout':
              return reject(new JobError(`job: '${name}' timed out`, JobError.CODE_TIMEOUT))

            default:
              return reject(new JobError(`job: '${name}' failed (${error})`, JobError.CODE_UNEXPECTED))
          }
        } else {
          resolve(result)
        }
      })
    })
  }
}
