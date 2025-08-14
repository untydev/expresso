export async function get (req) {
  const { respond } = req.service
  respond({ view: 'create_account' })
}

export async function post (req) {
  const { apis, respond } = req.service
  
  try {
    await apis.auth.createAccount(req.service, req.body)
    respond({ redirect: '/signin', message: 'Please activate your account.' })
  } catch (error) {
    respond({ redirect: '/signup', message: error.message })
  }
}

post.rateLimit = {
  window: '1m',
  limit: 10
}
