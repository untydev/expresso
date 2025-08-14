function makePasswordResetLink (config, code) {
  if (process.env.NODE_ENV === 'production') {
    return `https://${config.get('domain')}/activate?code=${code}`
  } else {
    return `http://localhost:${config.get('port')}/activate?code=${code}`
  }
}


export default async function () {

}
