import Express from 'express'

export function useStatic (context) {
  const { express, config } = context
  const paths = config.get('static.paths')
  for (const { path, ...rest } of paths) {
    if (rest.prefix) {
      express.use(`/${rest.prefix}`, Express.static(path))
    } else {
      express.use(Express.static(path))
    }
  }
}
