export async function get (req) {
  const { respond } = req.service
  respond({ view: 'access_account' })
}

export async function post (req) {
  const { apis, config, respond } = req.service

  try {
    await apis.signIn(req)
    respond({ redirect: config.get('services.auth.redirect') })
  } catch (error) {
    respond({ redirect: 'signin', message: error.message })
  }
}

post.rateLimit = {
  window: '1m',
  limit: 10
}