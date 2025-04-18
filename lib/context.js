import makeOptions from '@untydev/options'
import { set } from '@untydev/props'

function defineDeepProperty (obj, path, descriptor) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((acc, key) => acc[key], obj)

  Object.defineProperty(target, lastKey, descriptor)
}

export function createContext (parent) {
  const context = Object.create(null)

  Object.assign(context, parent)

  const extend = (path, value, opts) => {
    opts = makeOptions(opts, {
      exported: false,
      readonly: true
    })

    set(context, path, value)
    defineDeepProperty(context, path, {
      writable: !opts.readonly,
      configurable: !opts.readonly,
      enumerable: true
    })

    if (opts.exported && parent) {
      parent.extend(path, value, opts)
    }

    return context
  }

  const derive = () => {
    const derived = createContext(context)
    return derived
  }

  Object.defineProperties(context, {
    extend: {
      value: extend,
      writable: false,
      configurable: false,
      enumerable: false
    },
    derive: {
      value: derive,
      writable: false,
      configurable: false,
      enumerable: false
    }
  })

  return context
}
