import nodeFsp from 'node:fs/promises'
import nodePath from 'node:path'
import Handlebars from 'handlebars'
import makeOptions from '@untydev/options'
import mjml from 'mjml'

import NullProvider from './providers/NullProvider.js'
import FileProvider from './providers/FileProvider.js'
import ResendProvider from './providers/ResendProvider.js'
import SmtpProvider from './providers/SmtpProvider.js'
import AppError from '../../error.js'

function createProvider (context) {
  const { config } = context
  const name = config.get('emails.provider')

  if (name === false) {
    return new NullProvider(context)
  } else if (name === 'file') {
    return new FileProvider(context)
  } else if (name === 'smtp') {
    return new SmtpProvider(context)
  } else if (name === 'resend') {
    return new ResendProvider(context)
  } else {
    throw new AppError(`Email provider is not supported: ${name}`)
  }
}

export default async function useEmails (context) {
  const { logger } = context
  const provider = createProvider(context)
  const templatesPath = nodePath.join(context.path, 'emails')
  const compiledTemplates = new Map()

  const send = async (name, options) => {
    options = makeOptions(options, { data: {} })

    if (!compiledTemplates.has(name)) {
      // 1. Load MJML template.
      const templateStr = await nodeFsp.readFile(nodePath.join(templatesPath, `${name}.mjml`), 'utf8')

      // 2. Compile with Handlebars.
      const template = Handlebars.compile(templateStr)

      // 3. Cache the template.
      compiledTemplates.set(name, template)
    }

    // 1. Get the cached template.
    const template = compiledTemplates.get(name)

    // 2. Fill the data in MJML.
    const renderedMJML = template(options.data)

    // 3. Render MJML to HTML
    const { html, errors } = mjml(renderedMJML)

    if (errors.length) {
      logger.error(errors)
      throw new AppError(`Failed to render an email: '${name}'`, AppError.EMAIL_RENDER_ERROR)
    }

    // 4. Send the email.
    return provider.send(html, {
      from: options.from,
      to: options.to,
      subject: options.subject
    })
  }

  context.extend('emails', { send })
}
