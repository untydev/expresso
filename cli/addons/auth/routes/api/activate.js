import { Schema } from '@untydev/expresso'

export async function post (req, res) {
  const { models, jobs, AppError } = req.service
  const { activationCode } = req.body

  const user = await models.user.findOne({
    where: { activationCode }
  })

  if (!user) {
    throw new AppError('Invalid or expired code', AppError.HTTP_BAD_REQUEST)
  }

  await models.user.update({
    isActive: true,
    activationCode: null
  }, {
    where: { activationCode }
  })

  jobs.perform('send_activation_confirmation', {
    email: user.email
  })

  res.status(200).send()
}

post.rateLimit = {
  window: '1m',
  limit: 10
}

post.validateReq = {
  body: Schema.object({
    activationCode: Schema.string().min(26).max(26).required()
  }).required()
}
