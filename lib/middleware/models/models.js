import nodePath from 'node:path'
import nodeUrl from 'node:url'
import { isObject } from '@untydev/types'

import { readDirectories } from '../../utils.js'

export default async function (context) {
  const { AppError, sequelize } = context

  const path = nodePath.join(context.path, 'models')
  const entries = await readDirectories(path)

  for (const entry of entries) {
    if (entry.isDirectory()) {
      throw new AppError(`model cannot be a directory: ${entry.name}`)
    }

    const definition = await import(nodeUrl.pathToFileURL(nodePath.join(entry.parentPath, entry.name)))

    if (!isObject(definition.default)) {
      throw new AppError(`model must export a single object: ${entry.name}`)
    }

    const name = nodePath.basename(entry.name, nodePath.extname(entry.name))
    const model = await sequelize.define(name, definition.default)

    context.extend(`models.${name}`, model, { exported: true })
  }
}
