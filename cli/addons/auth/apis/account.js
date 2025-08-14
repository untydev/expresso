import { Schema, Email, Password, ulid, validate } from '@untydev/expresso'

function makeActivationLink (config, code) {
  if (process.env.NODE_ENV === 'production') {
    return `https://${config.get('domain')}/activate?activationCode=${code}`
  } else {
    return `http://localhost:${config.get('port')}/activate?activationCode=${code}`
  }
}

export async function createAccount (service, data) {
  const { config, logger, jobs, models, AppError } = service
  const { email, password } = data

  validate(Schema.object({
    email: Email.schema.required(),
    password: Password.schema.required()
  }), data)

  const user = await models.user.findOne({
    where: { email }
  })

  if (user) {
    if (user.isActive) {
      throw new AppError('Email already taken', AppError.HTTP_CONFLICT)
    }

    const activationLink = makeActivationLink(config, user.activationCode)

    jobs.perform('send_account_activation_link', {
      email: user.email,
      link: activationLink
    })

    logger.debug(`Activation code : ${user.activationCode}`)
    logger.debug(`Activation link : ${activationLink}`)

    return
  }

  const passwordHash = Password.hash(password)
  const activationCode = ulid()

  try {
    models.user.create({
      email,
      password: passwordHash,
      activationCode
    })
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new AppError('Email already taken', AppError.HTTP_CONFLICT)
    }
    throw error
  }

  const activationLink = makeActivationLink(config, activationCode)

  logger.debug(`Activation code : ${activationCode}`)
  logger.debug(`Activation link : ${activationLink}`)

  jobs.perform('send_account_activation_link', {
    email,
    link: activationLink
  })
}

export async function activateAccount (req) {

}

export async function signIn (req) {

}

export async function signOut (req) {

}
