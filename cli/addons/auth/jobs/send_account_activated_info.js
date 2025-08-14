export default async function (job) {
  const { data } = job
  const { emails, config } = job.service

  await emails.send('account_activated_info', {
    from: config.get('services.auth.sender'),
    to: data.email,
    subject: `Welcome to ${config.get('name')}!`
  })
}
