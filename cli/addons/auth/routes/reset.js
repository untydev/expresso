export async function get (req, res) {
  const { views } = req.services
  views.render(res, 'reset_password')
}

export async function post (req, res) {
  req.flash('status', 'reset')
  res.redirect('/signin')
}