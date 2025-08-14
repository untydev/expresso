import nodeFs from 'node:fs'
import nodePath from 'node:path'
import nodeUrl from 'node:url'
import { glob } from 'glob'

export default async function useApis (context) {
  const { logger, extend, AppError } = context
  const apisPath = nodePath.join(context.path, 'apis')

  // Stop processing if apis directory does not exist.
  if (!nodeFs.existsSync(apisPath)) {
    logger.detail(`APIs : ${apisPath} (missing)`)
    return
  }

  // Fail abruptly if apis is not a directory.
  if (!nodeFs.lstatSync(apisPath).isDirectory()) {
    throw new AppError(`APIs path is not a directory: ${routesPath}`)
  }

  const files = await glob('**/*.js', {
    cwd: apisPath,
    nodir: true
  })

  for (const file of files) {
    const script = await import(nodeUrl.pathToFileURL(nodePath.join(apisPath, file)))

    for (const key in script) {
      if (key === 'default') {
        throw new AppError('Default exports in APIs are not supported')
      }

      const prop = script[key]
      const path = `${context.name}.${key}`

      logger.detail(`API ${path}`)

      extend(`apis.${path}`, prop, { exported: true })
    }
  }
}