import nodePath from 'node:path'
import { Liquid } from 'liquidjs'

export function useViews (context) {
  const { config, logger } = context
  const engine = new Liquid({
    cache: config.get('views.cache'),
    root: nodePath.join(context.path, 'views'),
    layouts: [
      nodePath.join(config.get('src'), 'layouts'),
      nodePath.join(context.path, 'views', 'layouts')
    ],
    partials: [
      nodePath.join(config.get('src'), 'partials'),
      nodePath.join(context.path, 'views', 'partials')
    ],
    extname: '.liquid'
  })

  const render = async (name, data = Object.create(null)) => {
    try {
      const html = await engine.renderFile(name, data)
    } catch (error) {
      throw error
    }
  }

  context.extend('views', { render })
}

