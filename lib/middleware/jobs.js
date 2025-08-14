import nodePath from 'node:path'
import nodeFs from 'node:fs'
import nodeUrl from 'node:url'
import { isFunction } from '@untydev/types'
import Queue from 'better-queue'
import SqliteStore from 'better-queue-sqlite'
import ms from 'ms'
import pc from 'picocolors'

const __dirname = nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url))

function createOptions (context, name) {
  const { config } = context

  const options = {
    store: new SqliteStore({
      path: nodePath.join(config.get('data.path'), config.get('jobs.path'))
    })
  }

  const baseKey = `services.${context.name}.jobs.${name}`

  if (config.has(baseKey)) {
    if (config.has(`${baseKey}.timeout`)) {
      options.maxTimeout = ms(config.get(`${baseKey}.timeout`))
    }
  }

  return options
}

function createQueue (context, name, worker) {
  const options = createOptions(context, name)

  const queue = new Queue((data, cb) => {
    const start = Date.now()
    const options = { data, service: Object.create(null) }
    Object.assign(options.service, context)

    worker(options)
      .then((result) => {
        const time = Date.now() - start
        context.logger.debug(`RUN ${context.name}:${name} ${pc.green('OK')} ${pc.dim(`(${time}ms)`)}`)
        cb(null, result)
      })
      .catch((error) => {
        const time = Date.now() - start
        context.logger.debug(`RUN ${context.name}:${name} ${pc.red('FAIL')} ${pc.dim(`(${time}ms)`)}`)
        cb(error)
      })
  }, options)

  const push = (data) => {
    const promise = new Promise((resolve, reject) => {
      const { logger, AppError } = context
      queue.push(data, (error, result) => {
        if (error) {
          switch (error) {
            case 'task_timeout':
              reject(new AppError(`Job timed out: '${name}'`, AppError.JOB_TIMEOUT))
              break

            default:
              // TODO: Improve error logging when Error is passed to AppError
              console.log(error)
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
      context.logger.error(error.message)
    })

    return promise
  }

  return { push }
}

export async function useJobs (context) {
  const { AppError } = context

  const jobsDir = nodePath.join(context.path, 'jobs')
  if (!nodeFs.existsSync(jobsDir) || !nodeFs.statSync(jobsDir).isDirectory()) {
    return
  }

  let jobEntries = []
  try {
    jobEntries = nodeFs.readdirSync(jobsDir, { withFileTypes: true })
      .filter(entry => entry.isFile())
      .map(entry => ({ name: nodePath.basename(entry.name, nodePath.extname(entry.name)), path: nodePath.join(jobsDir, entry.name) }))
  } catch (err) {
    // TODO: handle the error
  }

  //const adapter = await createAdapter(context)
  const queues = new Map()

  for (const jobEntry of jobEntries) {
    const mod = await import(nodeUrl.pathToFileURL(jobEntry.path))
    if (!isFunction(mod.default)) {
      throw new AppError('Job file must export a single function as a default export', AppError.JOB_INVALID)
    }

    const queue = createQueue(context, jobEntry.name, mod.default)
    queues.set(jobEntry.name, queue)
  }

  const perform = (name, data) => {
    const queue = queues.get(name)
    return queue.push(data || Object.create(null))
  }

  context.extend('jobs', { perform })
}

