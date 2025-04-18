import Express from 'express'

export function useParser ({ express, config }) {
  const format = config.get('http.body.format')

  if (format === false) {
    return
  }

  const options = {}

  if (config.has('http.body.limit')) {
    options.limit = config.get('http.body.limit')
  }

  if (format === 'json') {
    express.use(Express.json(options))
  } else {
    throw new Error(`http body format is not supported: ${format}`)
  }
}
