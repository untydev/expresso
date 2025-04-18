#!/usr/bin/env node
import minimist from 'minimist'
import pc from 'picocolors'

import newAction from './actions/new/new.js'

const args = minimist(process.argv.slice(2))
const action = args._[0]
args._ = args._.slice(1)

if (action === 'new') {
  newAction(args)
} else {
  console.error(pc.red(`unknown action: ${action}`))
}
