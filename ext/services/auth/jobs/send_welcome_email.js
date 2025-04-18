export default async function (job) {
  const { config, service, data } = job
  await service.emails.send('welcome', {
    from: config.get('services.auth.sender'),
    to: data.username,
    subject: `Welcome to ${config.get('name')}!`,
    data: {
      appName: config.get('name'),
      appDomain: config.get('domain')
    }
  })
}
