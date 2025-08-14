export function is (req) {
  if (!req) {
    logger.warn('auth.is requires the caller to pass request object')
  }

  return req && req.session && req.session.uid
}

export function ensure (req) {
  if (!req) {
    logger.warn('auth.ensure requires the caller to pass request object')
  }

  if (!req || !req.session) {
    throw new req.service.AppError('User is not signed in', AppError.HTTP_UNAUTHORIZED)
  }
}
