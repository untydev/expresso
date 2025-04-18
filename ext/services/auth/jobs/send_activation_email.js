function makeActivationLink (config, code) {
  if (process.env.NODE_ENV === 'production') {
    return `https://${config.get('domain')}/activate?code=${code}`
  } else {
    return `http://localhost:${config.get('port')}/activate?code=${code}`
  }
}

export default async function (job) {
  const { config, emails, data } = job
  await emails.send('activate', {
    from: config.get('services.auth.sender'),
    to: data.username,
    subject: `Welcome to ${config.get('name')}!`,
    data: {
      appName: config.get('name'),
      appDomain: config.get('domain'),
      activationLink: makeActivationLink(config, data.code)
    }
  })
}
