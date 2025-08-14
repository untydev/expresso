import nodeFs from 'node:fs'
import nodeFsp from 'node:fs/promises'
import nodePath from 'node:path'
import nodeUrl from 'node:url'
import bcrypt from 'bcrypt'
import Joi from 'joi'

import AppError from './error.js'

export function readVersion () {
  const currentSourceDir = nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url))
  const packageJson = JSON.parse(nodeFs.readFileSync(nodePath.join(currentSourceDir, '..', 'package.json')))
  return packageJson.version ?? 'unknown'
}

export async function isDirectory (path) {
  try {
    return (await nodeFsp.stat(path)).isDirectory()
  } catch {
    return false
  }
}

export async function readDirectory (path) {
  if (await isDirectory(path)) {
    return nodeFsp.readdir(path, { withFileTypes: true })
  } else {
    return []
  }
}

export async function readDirectories (paths) {
  let entries = []
  paths = [].concat(paths)

  for (const path of paths) {
    entries = (await readDirectory(path)).concat(entries)
  }

  return entries
}

export function walkDirSync (dir, cb, level = 0) {
  const entries = nodeFs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = nodePath.join(dir, entry.name)

    if (entry.isDirectory()) {
      walkDirSync(fullPath, cb, level + 1)
    } else {
      cb(fullPath, level)
    }
  }
}

export function validate (schema, what) {
  if (!Joi.isSchema(schema)) {
    throw new AppError('Argument is not a valid Joi schema')
  }

  const { error, value } = schema.validate(what, { allowUnknown: false })
  if (error) {
    throw new AppError(error.details[0].message, AppError.HTTP_BAD_REQUEST)
  }

  return value
}

export function rewrite (path, rules = []) {
  function compileWildcardPrefix (pattern) {
    const wildcardIndex = pattern.indexOf('*')
    return wildcardIndex >= 0 ? pattern.slice(0, wildcardIndex) : pattern
  }
  
  function shouldExclude (path, excludes = []) {
    for (const excludePattern of excludes) {
      const excludePrefix = compileWildcardPrefix(excludePattern)
      if (path.startsWith(excludePrefix)) {
        return true
      }
    }
    return false
  }

  function rewriteSingle (path, { source, target, exclude = [] }) {
    const sourcePrefix = compileWildcardPrefix(source)
    const targetPrefix = compileWildcardPrefix(target)
  
    if (!path.startsWith(sourcePrefix)) {
      return null // No match
    }
  
    if (shouldExclude(path, exclude)) {
      return null // Excluded
    }
  
    const rest = path.slice(sourcePrefix.length)
    return targetPrefix + rest
  }

  for (const rule of rules) {
    const rewritten = rewriteSingle(path, rule)
    if (rewritten !== null) {
      return rewritten
    }
  }
  
  return path // No matching rule
}

export const Email = {
  schema: Joi.string().min(3).max(64)
}

export const Password = {
  hash: (password) => bcrypt.hashSync(password, 10),
  verify: (password, hash) => bcrypt.compareSync(password, hash),
  schema: Joi.string().min(8).max(32)
}
