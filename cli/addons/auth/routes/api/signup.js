import { Schema, Email, Password } from '@untydev/expresso'

export async function post (req) {
  const { apis, respond } = req.service

  await apis.auth.createAccount(req.service, req.body)

  respond({
    status: 201,
    json: {
      error: null,
      message: 'Account created.'
    }
  })
}

post.rateLimit = {
  window: '1m',
  limit: 10
}

post.validateReq = {
  body: Schema.object({
    email: Email.schema.required(),
    password: Password.schema.required()
  }).required()
}
