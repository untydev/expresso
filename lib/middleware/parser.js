import Express from 'express'

export function useParser (context) {
  const { express, config, AppError } = context
  const formats = config.get('http.body.formats')

  for (const format in formats) {
    const options = config.get(`http.body.formats.${format}`)

    if (format === 'json') {
      express.use(Express.json(options))
    } else if (format === 'urlencoded') {
      express.use(Express.urlencoded(options))
    } else {
      throw new AppError(`http body format is not supported: ${format}`)
    }
  }
}
