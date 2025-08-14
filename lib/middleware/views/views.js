import nodePath from 'node:path'
import nodeUrl from 'node:url'

const __dirname = nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url))

async function createEngine (context) {
  const { AppError, config } = context
  const name = config.get('views.engine')

  if (name === false) {
    const NullEngine = await import(nodeUrl.pathToFileURL(nodePath.join(__dirname, 'engines', 'NullEngine.js')))
    // eslint-disable-next-line new-cap
    return new NullEngine.default()
  } else if (name === 'liquid') {
    const LiquidEngine = await import(nodeUrl.pathToFileURL(nodePath.join(__dirname, 'engines', 'LiquidEngine.js')))
    // eslint-disable-next-line new-cap
    return new LiquidEngine.default({
      cache: context.config.get('views.cache'),
      root: nodePath.join(context.path, 'views'),
      layouts: [
        nodePath.join(config.get('src'), 'layouts'),
        nodePath.join(context.path, 'views', 'layouts')
      ],
      partials: [
        nodePath.join(config.get('src'), 'partials'),
        nodePath.join(context.path, 'views', 'partials')
      ]
    })
  } else {
    throw new AppError(`View engine is not supported: ${name}`)
  }
}

export default async function useViews (context) {
  const engine = await createEngine(context)

  const render = async (name, data = {}) => {
    return engine.render(name, data)
  }

  context.extend('views', { render })
}
