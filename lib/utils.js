import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

export async function isDirectory (path) {
  try {
    return (await fsp.stat(path)).isDirectory()
  } catch {
    return false
  }
}

export async function readDirectory (path) {
  if (await isDirectory(path)) {
    return fsp.readdir(path, { withFileTypes: true })
  } else {
    return []
  }
}

export async function readDirectories (paths) {
  let entries = []

  for (const path of paths) {
    entries = (await readDirectory(path)).concat(entries)
  }

  return entries
}

export function walkDirSync (dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walkDirSync(fullPath, cb)
    } else {
      cb(fullPath)
    }
  }
}
