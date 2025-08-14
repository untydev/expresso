import { Schema, Password } from '@untydev/expresso'

export async function post (req, res) {
  const { models, AppError } = req.service
  const { email, password } = req.body

  const user = await models.user.findOne({
    where: { email }
  })
  
  if (!user || !Password.verify(password, user.password)) {
    throw new Error('Invalid credentials', AppError.HTTP_UNAUTHORIZED)
  }

  if (!user.isActive) {
    throw new AppError('Account not activated', AppError.HTTP_FORBIDDEN)
  }

  req.session.uid = user.id
  res.status(200).send()
}

post.validateReq = {
  body: Schema.object({
    email: Schema.string().min(3).max(64).required(),
    password: Password.schema.required()
  }).required()
}
