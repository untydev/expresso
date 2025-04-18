import Joi from 'joi'

export async function post (req, res) {
  const { jobs, db, AppError } = req
  const { code } = req.body

  const user = db.findUserByActivationCode.get(code)
  if (!user) {
    throw new AppError('Invalid or expired code', AppError.HTTP_BAD_REQUEST)
  }

  db.activateUserById.run(user.id)

  jobs.schedule('send_welcome_email', {
    username: user.username
  })

  res.json({ message: 'Account activated. You can now sign in.' })
}

post.rateLimit = {
  window: '1m',
  limit: 10
}

post.validateBody = Joi.object({
  code: Joi.string().min(26).max(26).required()
}).required()
