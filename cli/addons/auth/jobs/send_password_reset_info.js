export default async function (job) {
  const { data } = job
  const { emails, config } = job.service

  await emails.send('password_reset_confirmation', {
    from: config.get('services.auth.sender'),
    to: data.username,
    subject: `Welcome to ${config.get('name')}!`
  })
}
