import nodeFs from 'node:fs'
import nodePath from 'node:path'
import nodeProc from 'node:process'
import nodeUrl from 'node:url'
import { execSync } from 'node:child_process'
import Handlebars from 'handlebars'
import pc from 'picocolors'

const __dirname = nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url))

function renderFile (source, target, data) {
  const templateStr = nodeFs.readFileSync(source, 'utf8')

  const template = Handlebars.compile(templateStr)

  const rendered = template(data)

  nodeFs.writeFileSync(target, rendered, 'utf8')
}

function copyDirectory (source, target) {
  if (!nodeFs.existsSync(target)) {
    nodeFs.mkdirSync(target, { recursive: true })
  }

  const entries = nodeFs.readdirSync(source, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = nodePath.join(source, entry.name)
    const destPath = nodePath.join(target, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath) // Recursive copy
    } else {
      nodeFs.copyFileSync(srcPath, destPath) // Copy files
    }
  }
}

function ensureEmptyTarget (args, target) {
  if (args.force) {
    return
  }

  if (nodeFs.readdirSync(target).length > 0) {
    console.error(pc.red('Directory not empty'))
    process.exit(1)
  }
}

function installDependencies (args, target) {
  console.log(pc.cyan('Installing dependencies...'))

  try {
    const options = { cwd: target, encoding: 'utf8' }
    execSync('npm install', options)
    execSync('npm i -D nodemon', options)
    execSync('npm i -D standard', options)
  } catch (error) {
    console.error(pc.red('Failed to create the project'))
    process.exit(1)
  }
}

export default function (context) {
  const { args, CliError } = context
  const source = nodePath.join(__dirname, '..', '..', 'templates', 'basic')
  const target = args._[0] ? nodePath.join(nodeProc.cwd(), args._[0]) : nodeProc.cwd()

  nodeFs.mkdirSync(target, { recursive: true })

  ensureEmptyTarget(args, target)

  const configExists = nodeFs.existsSync(nodePath.join(target, 'config'))
  if (!configExists || args.force) {
    copyDirectory(nodePath.join(source, 'config'), nodePath.join(target, 'config'))
  } else {
    throw new CliError('Directory already exists: config')
  }

  const routesExists = nodeFs.existsSync(nodePath.join(target, 'routes'))
  if (!routesExists || args.force) {
    copyDirectory(nodePath.join(source, 'routes'), nodePath.join(target, 'routes'))
  } else {
    throw new CliError('Directory already exists: routes')
  }

  const binExists = nodeFs.existsSync(nodePath.join(target, 'bin'))
  if (!binExists || args.force) {
    copyDirectory(nodePath.join(source, 'bin'), nodePath.join(target, 'bin'))
  } else {
    throw new CliError('Directory already exists: bin')
  }

  const pkgExists = nodeFs.existsSync(nodePath.join(target, 'package.json'))
  if (!pkgExists || args.force) {
    renderFile(nodePath.join(source, 'package.json'), nodePath.join(target, 'package.json'), {
      name: 'Expresso App',
      bin: './bin'
    })
  } else {
    throw new CliError('File already exists: package.json')
  }

  const gitIgnoreExists = nodeFs.existsSync(nodePath.join(target, '.gitignore'))
  if (!gitIgnoreExists || args.force) {
    nodeFs.copyFileSync(nodePath.join(source, '.gitignore'), nodePath.join(target, '.gitignore'))
  } else {
    throw new CliError('File already exists: .gitignore')
  }

  if (args.install) {
    installDependencies(args, target)
  }

  return 'Done 🥳 To start your app, type \'npm start\''
}
