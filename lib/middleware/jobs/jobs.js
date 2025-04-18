import nodePath from 'node:path'
import nodeFs from 'node:fs'
import nodeUrl from 'node:url'
import { isFunction } from '@untydev/types'

const __dirname = nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url))

async function createAdapter (context) {
  const { AppError, config } = context
  const name = config.get('jobs.adapter')

  if (name === false) {
    const NullAdapter = await import(
      nodeUrl.pathToFileURL(
        nodePath.join(__dirname, 'adapters', 'NullAdapter.js')))
    return new NullAdapter.default(context)
  } else if (name === 'better-queue') {
    const BetterQueueAdapter = await import(
      nodeUrl.pathToFileURL(
        nodePath.join(__dirname, 'adapters', 'BetterQueueAdapter.js')))
    return new BetterQueueAdapter.default(context)
  } else {
    throw new AppError(`Job queue adapter is not supported: ${name}`)
  }
}

export default async function useJobs (context) {
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

  const adapter = await createAdapter(context)
  const queues = new Map()

  for (const jobEntry of jobEntries) {
    const mod = await import(nodeUrl.pathToFileURL(jobEntry.path))
    if (!isFunction(mod.default)) {
      throw new AppError('Job file must export a single function as a default export', AppError.JOB_INVALID)
    }

    const queue = adapter.createQueue(jobEntry.name, mod.default)
    queues.set(jobEntry.name, queue)
  }

  const perform = async (name, data) => {
    const queue = queues.get(name)
    return queue.push(data)
  }

  context.extend('jobs', { perform })
}
