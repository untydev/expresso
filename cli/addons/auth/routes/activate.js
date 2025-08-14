import { Schema } from '@untydev/expresso'

export async function get (req) {
  const { respond } = req.service
  respond({ view: 'activate_account', data: { activationCode: req.query.activationCode } })
}

get.validateReq = {
  query: Schema.object({
    activationCode: Schema.string().required()
  })
}

export async function post (req) {
  const { models, jobs, respond, AppError } = req.service

  const user = await models.user.findOne({
    where: {
      activationCode: req.query.activationCode
    }
  })

  if (!user) {
    throw new AppError('Invalid or expired code', AppError.HTTP_BAD_REQUEST)
  }

  await models.user.update({
    isActive: true,
    activationCode: null
  }, {
    where: {
      activationCode: req.query.activationCode
    }
  })

  jobs.perform('send_account_activated_info', {
    email: user.email
  })

  respond({ redirect: '/signin', message: 'Your account has been activated. You can now sign in.' })
}

post.validateReq = {
  query: Schema.object({
    activationCode: Schema.string().required()
  })
}
