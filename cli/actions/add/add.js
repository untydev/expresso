import addAuthAction from './actions/add_auth.js'

export default function (context) {
  const { CliError } = context
  const action = context.args._[0]
  context.args = { ...context.args, _: context.args._.slice(1) }

  if (action === 'auth') {
    return addAuthAction(context)
  } else {
    throw new CliError(`unknown action: add ${action}`)
  }
}
