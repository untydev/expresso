import nodePath from 'node:path'
import nodeFs from 'node:fs'
import JSON5 from 'json5'

function copyFiles (context) {
  const { args, basePath, CliError } = context

  const sourcePath = nodePath.join(basePath, 'addons', 'auth')
  const targetPath = nodePath.join('.', 'app', 'services', 'auth')

  if (nodeFs.existsSync(targetPath)) {
    if (args.force) {
      nodeFs.rmSync(targetPath, { recursive: true, force: true })
    } else {
      throw new CliError(`Target path already exists: ${targetPath}`)
    }
  }

  nodeFs.cpSync(sourcePath, targetPath, { recursive: true })
}

function applyConfig (context) {
  const { args, CliError } = context

  const configPath = nodePath.join('.', 'config', 'default.json5')
  let data = nodeFs.readFileSync(configPath, 'utf8')
  const json = JSON5.parse(data)

  if (json.services.auth && !args.force) {
    throw new CliError('Auth service configuration already exists')
  }

  json.services.auth = {
    enabled: true,
    sender: args.email || 'test@example.com',
    redirect: '/admin'
  }

  if (!json.routes.rewrite) {
    json.routes.rewrite = [{
      source: '/auth/*',
      target: '/*',
      exclude: ['/auth/api/*']
    }]
  }

  data = JSON5.stringify(json, null, 2)

  nodeFs.writeFileSync(configPath, data, 'utf8')
}

export default function (context) {
  copyFiles(context)
  applyConfig(context)

  return 'Done 🥳 Read the guide at https://github.com/untydev/expresso/doc/auth.md'
}
