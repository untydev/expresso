import AppError from '../error.js'

export function useError ({ express, logger }) {
  if (process.env.NODE_ENV === 'production') {
    express.use((err, req, res, next) => {
      res.status(err.category === 'http' && err.code ? err.code : AppError.HTTP_INTERNAL_SERVER_ERROR).json({
        message: err.message
      })
    })
  } else {
    express.use((err, req, res, next) => {
      logger.error(err.stack)
      res.status(err.category === 'http' && err.code ? err.code : AppError.HTTP_INTERNAL_SERVER_ERROR).json({
        message: err.message,
        stack: err.stack
      })
    })
  }
}
