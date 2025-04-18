import nodeFs from 'node:fs'
import nodeFsp from 'node:fs/promises'
import nodePath from 'node:path'

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

export function walkDirSync (dir, cb) {
  const entries = nodeFs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = nodePath.join(dir, entry.name)

    if (entry.isDirectory()) {
      walkDirSync(fullPath, cb)
    } else {
      cb(fullPath)
    }
  }
}
