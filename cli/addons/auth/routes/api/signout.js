export async function get (req, res) {
  req.session = null
  res.status(200).send()
}
