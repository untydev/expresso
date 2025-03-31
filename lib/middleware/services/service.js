import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { Router } from 'express'
import { isFunction } from '@untydev/types'

import Runner from './runner.js'
import Renderer from './renderer.js'
import { walkDirSync } from '../../utils.js'

export default class Service {
  #name
  #path
  #config
  #logger
  #database
  #runner
  #renderer
  #module

  constructor (name, path, config, logger, database) {
    this.#name = name
    this.#path = path
    this.#config = config
    this.#logger = logger
    this.#database = database
    this.#runner = new Runner(name, config, logger)
    this.#renderer = new Renderer(config, logger)
    this.#module = null
  }

  get name () {
    return this.#name
  }

  get path () {
    return this.#path
  }

  async init (express) {
    const moduleFile = path.join(this.path, `${this.name}.js`)
    if (fs.existsSync(moduleFile) && fs.statSync(moduleFile).isFile()) {
      this.#module = await import(url.pathToFileURL(moduleFile))
      if (isFunction(this.#module.onInit)) {
        await this.#module.onInit({ config: this.#config, logger: this.#logger, database: this.#database })
      }
    }

    await this.#initViews()
    await this.#initRoutes(express)
    await this.#initJobs()
  }

  async #initViews () {
    this.#renderer.mount(path.join(this.path, 'views'))
  }

  async #initRoutes (express) {
    const routesDir = path.join(this.path, 'routes')
    if (!fs.existsSync(routesDir) || !fs.statSync(routesDir).isDirectory()) {
      return
    }

    const router = Router()

    router.use(async (req, res, next) => {
      req.config = this.#config
      req.logger = this.#logger
      req.runJob = this.#runner.run.bind(this.#runner)
      res.renderView = async (name, data = {}) => {
        const html = await this.#renderer.render(name, data)
        res.set('Content-Type', 'text/html')
        res.send(html)
      }
      next()
    })

    if (this.#module != null && isFunction(this.#module.onRequest)) {
      router.use(this.#module.onRequest)
    }

    const routes = []

    walkDirSync(routesDir, (routePath) => {
      const parsedPath = path.parse(path.relative(routesDir, routePath))
      let urlPath = ''

      if (parsedPath.dir.length > 0) {
        urlPath = `/${parsedPath.dir}`
      }

      if (parsedPath.name !== 'index') {
        urlPath = `${urlPath}/${parsedPath.name}`
      } else {
        urlPath = '/'
      }

      routes.push({ path: urlPath, file: routePath })
    })

    for (const route of routes) {
      const mod = await import(url.pathToFileURL(route.file))

      for (const method in mod) {
        this.#logger.debug(`route: '${method.toUpperCase()} /${this.name}${route.path}'`)
        router[method](route.path, mod[method])
      }
    }

    express.use(`/${this.name}`, router)
  }

  async #initJobs () {
    const jobsDir = path.join(this.path, 'jobs')
    if (!fs.existsSync(jobsDir) || !fs.statSync(jobsDir).isDirectory()) {
      return
    }

    let jobEntries = []
    try {
      jobEntries = fs.readdirSync(jobsDir, { withFileTypes: true })
        .filter(entry => entry.isFile())
        .map(entry => ({ name: path.basename(entry.name, path.extname(entry.name)), path: path.join(jobsDir, entry.name) }))
    } catch (err) {

    }

    for (const jobEntry of jobEntries) {
      const mod = await import(url.pathToFileURL(jobEntry.path))
      if (!isFunction(mod.default)) {
        throw new Error('job file must export a single function as a default export')
      }
      this.#runner.add(jobEntry.name, mod.default)
    }
  }
}
