import nodeFs from 'node:fs'
import nodePath from 'node:path'
import nodeUrl from 'node:url'

export function readVersion () {
  const currentSourceDir = nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url))
  const packageJson = JSON.parse(nodeFs.readFileSync(nodePath.join(currentSourceDir, '..', 'package.json')))
  return packageJson?.version ?? 'unknown'
}
