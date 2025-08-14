export default async function (job) {
  const { service, data } = job
  const { config, emails } = service

  await emails.send('account_activation_link', {
    from: config.get('services.auth.sender'),
    to: data.email,
    subject: `Welcome to ${config.get('name')}!`,
    data: { link: data.link }
  })
}
