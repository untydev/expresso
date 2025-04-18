import bcrypt from 'bcrypt'
import Joi from 'joi'
import { ulid } from 'ulid'

export async function get (req, res) {
  const { config } = req

  res.renderView('signup', {
    appName: config.get('name')
  })
}

export async function post (req, res) {
  const { db, jobs, AppError } = req
  const { username, password } = req.body

  const user = db.findUserByUsername.get(username)
  if (user) {
    if (user.is_active) {
      throw new AppError('Username already taken', AppError.HTTP_CONFLICT)
    }

    jobs.schedule('send_activation_email', { username, code: user.activation_code })
    return res.status(201).send()
  }

  const hash = bcrypt.hashSync(password, 10)
  const code = ulid()

  try {
    db.createUser.run(username, hash, code, Date.now())
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new AppError('Username already taken', AppError.HTTP_CONFLICT)
    }
    throw error
  }

  jobs.schedule('send_activation_email', { username, code })
  res.status(201).send()
}

post.rateLimit = {
  window: '1m',
  limit: 10
}

post.validateBody = Joi.object({
  username: Joi.string().min(3).max(64).required(),
  password: Joi.string().min(8).max(32).required()
}).required()
