# Api

## App

### `expresso()`

Creates and returns `App` class instance.

```js
import expresso from '@untydev/expresso'

const app = expresso()
```

### `async App.start()`

Starts the application.

```js
import expresso from '@untydev/expresso'

await expresso().start()
```

### `App.on(string, cb)`

Subscribes to events emitted by the application:

- `ready` - Emitted when the application is fully operational.

```js
const app = expresso()

app.on('ready', () => {
  console.log('app is ready')
})

await app.start()
```

### `App.version()`

Returns the used Expresso version.

```js
const app = expresso()

console.log(app.version)
```

### `App.config()`

Returns the current configuration.

```js
import expresso from '@untydev/expresso'

const app = expresso()

console.log(app.config.get('name'))
```

### `App.logger()`

Returns the logger instance.

```js
import expresso from '@untydev/expresso'

const app = expresso()

app.logger.info('Hello')
```

### `App.express()`

Returns an instance of the express app.

```js
import expresso from '@untydev/expresso`

const app = expresso()

const express = app.express
```

### `App.server()`

Returns the server instance.

```js
import expresso from '@untydev/expresso'

const app = expresso()

app.server.on('error', (err) => {
  console.error(err)
})
```

## Jobs

## Emails

## Views