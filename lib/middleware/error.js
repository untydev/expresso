import { ReqError } from '../errors.js'

export function useError (express, config, logger) {
  if (process.env.NODE_ENV === 'production') {
    express.use((err, req, res, next) => {
      res.status(err.statusCode || ReqError.BAD_REQUEST).json({
        message: err.message
      })
    })
  } else {
    express.use((err, req, res, next) => {
      logger.error(err.stack)
      res.status(err.statusCode || ReqError.BAD_REQUEST).json({
        message: err.message,
        stack: err.stack
      })
    })
  }
}
