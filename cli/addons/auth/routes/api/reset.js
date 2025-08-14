import { Schema, Password, ulid } from '@untydev/expresso'

export async function get (req, res) {
  const { logger, models, jobs, AppError } = req.service
  const { email } = req.query

  const user = await models.user.findOne({
    where: { email }
  })

  if (!user) {
    throw new AppError('User not found', AppError.HTTP_NOT_FOUND)
  }

  const passwordResetCode = ulid()

  await models.user.update({
    passwordResetCode
  }, {
    where: { email }
  })

  jobs.perform('send_password_reset_link', {
    passwordResetCode
  })

  logger.debug(`Password reset code : ${passwordResetCode}`)

  res.status(200).send()
}

get.rateLimit = {
  window: '1m',
  limit: 10
}

get.validateReq = {
  query: Schema.object({
    email: Schema.string().min(3).max(64).required()
  }).required()
}

export async function post (req, res) {
  const { models, jobs, AppError } = req.service
  const { passwordResetCode, newPassword } = req.body

  const user = await models.user.findOne({
    where: { passwordResetCode }
  })
  
  if (!user) {
    throw new AppError('Invalid or expired code', AppError.HTTP_BAD_REQUEST)
  }

  const passwordHash = Password.hash(newPassword)

  await models.user.update({
    password: passwordHash,
    passwordResetCode: null
  }, {
    where: { passwordResetCode }
  })

  jobs.perform('send_password_reset_confirmation')

  res.status(200).send()
}

post.rateLimit = {
  window: '1m',
  limit: 10
}

post.validateReq = {
  body: Schema.object({
    passwordResetCode: Schema.string().min(26).max(26).required(),
    newPassword: Password.schema.required()
  }).required()
}
