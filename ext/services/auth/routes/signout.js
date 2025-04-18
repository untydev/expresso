export async function get (req, res) {
  req.session = null
  res.json({ message: 'Signed out' })
}
