import bcrypt from 'bcrypt'
import Joi from 'joi'

export async function post (req, res) {
  const { db, AppError } = req
  const { username, password } = req.body

  const user = db.findUserByUsername.get(username)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new AppError('Invalid credentials', AppError.HTTP_UNAUTHORIZED)
  }

  if (!user.is_active) {
    throw new AppError('Account not activated', AppError.HTTP_FORBIDDEN)
  }

  req.session.uid = user.id
  res.json({ message: 'Signed in' })
}

post.validateBody = Joi.object({
  username: Joi.string().min(3).max(64).required(),
  password: Joi.string().min(8).max(32).required()
}).required()
