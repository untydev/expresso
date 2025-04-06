# Expresso

Batteries included server framework built on Express.js

## Installation

Using NPM:

```sh
npm i @untydev/expresso
```

## Usage

Intialize the application:

```sh
expresso init
```

Start the application:

```sh
node src/app.js
```

## CLI

### `init`

Initializes the application. During the initialization process a `.js` file that starts the server is created along with configuration and `.gitignore` files.

## API

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

### `App.config()`

Returns the current configuration.

```js
import expresso from '@untydev/expresso'

const app = expresso()

console.log(app.config.get('server.port'))
```

### `App.logger()`

Returns the logger instance.

```js
import expresso from '@untydev/expresso'

const app = expresso()

app.logger.info('Hello')
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

## Configuration

### `server.port`

Sets the port on which the HTTP server will listen.

- **Development value:** `8000`
- **Production value:** `8000`
- **Environment alias:** `SERVER_PORT`

### `logs.path`

Sets a path to the directory where application logs will be stored.

- **Development value:** `logs`
- **Production value:** `logs`
- **Environment alias:** `LOGS_PATH`

### `logs.level`

Sets the log level. Available values: `emerg`, `alert`, `crit`, `error`, `warning`, `notice`, `info`, `debug`.

- **Development value:** `debug`
- **Production value:** `info`
- **Environment alias:** `LOGS_LEVEL`

### `logs.console`

Enables or disables logging to the console.

- **Development value:** `true`
- **Production value:** `false`

### `logs.request`

Enables or disables logging of HTTP requests.

- **Development value:** `true`
- **Production value:** `false`

### `data.path`

Sets a path to the directory where application data will be stored.

- **Development value:** `data`
- **Production value:** `data`
- **Environment alias:** `DATA_PATH`

## Route options

### `.rateLimit.window`

### `.rateLimit.limit`

### `.rateLimit.message`

### `.slowDown.window`

### `.slowDown.after`

### `.slowDown.delay`

### `.slowDown.message`

### `.validateBody`
