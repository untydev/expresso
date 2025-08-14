#!/usr/bin/env node
import nodePath from 'node:path'
import nodeUrl from 'node:url'
import minimist from 'minimist'
import ora from 'ora'
import pc from 'picocolors'

import addAction from './actions/add/add.js'
import newAction from './actions/new/new.js'

class CliError extends Error {
  constructor (message) {
    super(message)
    this.cli = true
  }
}

const args = minimist(process.argv.slice(2))
const action = args._[0]
const context = {
  args: { ...args, _: args._.slice(1) },
  basePath: nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url)),
  CliError
}

const spinner = ora({
  text: '☕ Setting things up...',
  color: 'cyan'
}).start()

try {
  const message = (() => {
    if (action === 'new') {
      return newAction(context)
    } else if (action === 'add') {
      return addAction(context)
    } else {
      throw new CliError(`Unknown action: ${action}`)
    }
  })()

  spinner.succeed(pc.green(message))
} catch (error) {
  if (error.cli) {
    spinner.fail(error.message)
    process.exit(1)
  }

  throw error
}
