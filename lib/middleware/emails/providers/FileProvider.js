import nodeFs from 'node:fs'
import nodeFsp from 'node:fs/promises'
import nodePath from 'node:path'

export default class FileProvider {
  #context
  #basePath

  constructor (context) {
    this.#context = context
    const { config } = context
    this.#basePath = nodePath.join(config.get('data.path'), 'emails')

    nodeFs.mkdirSync(this.#basePath, { recursive: true })
  }

  async send (html, options) {
    const time = Date.now()
    const path = nodePath.join(this.#basePath, `${time}.html`)
    await nodeFsp.writeFile(path, html, 'utf8')
  }
}
