# Configuration

## General

### `src`

Sets the path to the app source.

- **Default value:** `app`

### `port`

Sets the port on which the app will listen.

- **Default value:** `8000`
- **Environment alias:** `PORT`

### `name`

Sets the name of the application.

- **Default value:** `Expresso App`

### `domain`

Sets the name from which the app will be served.

- **Default value:** `example.com`
- **Environment alias:** `DOMAIN`

## Proxy

### `proxy.trust`

A list of trusted proxies.

- **Default value:** `['loopback']`

### `static.paths`

A list of paths for serving static files.

- **Default value:** `[{ path: 'public', prefix: '/public' }]`

## Logs

### `logs.path`

Sets a path to the directory where application logs will be stored.

- **Default value:** `logs`
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

## Data

### `data.path`

Sets a path to the directory where application data will be stored.

- **Default value:** `data`
- **Environment alias:** `DATA_PATH`

## HTTP

### `http.body.format`

Specifies the format of HTTP body requests: `json`.

- **Default value:** `json`

### `http.body.limit`

Specifies the maximum length of HTTP body requests.

- **Default value:** `10kb`

## Session

### `session.store`

Selects a session store: `false`, `cookie`.

- **Default value:** `false`

### `session.age`

Sets the session age.

- **Default value:** `7d`

### `session.keys`

A list of keys used for signing the session cookie.

- **Environment alias:** `SESSION_KEYS`

## Views

### `views.engine`

A templating engine used for rendering: `false`, `liquid`.

- **Default value:** `liquid`

### `views.cache`

Enables or disables views caching.

- **Development value:** `false`
- **Production value:** `true`

## Models

### `models.store`

Selects a store for app models: `sqlite`.

- **Default value:** `sqlite`

### `models.path`

Sets a path under `data.path` for an SQLite database.

- **Development value:** `models-dev.db`
- **Production value:** `models.db`

### `models.sync.force`

See [Model synchronization](https://sequelize.org/docs/v6/core-concepts/model-basics/#model-synchronization).

- **Development value:** `true`
- **Production value:** `false`

### `models.sync.alter`

See [Model synchronization](https://sequelize.org/docs/v6/core-concepts/model-basics/#model-synchronization).

- **Development value:** `true`
- **Production value:** `false`

## Jobs

### `jobs.adapter`

A queue used for handling job execution: `false`, `better-queue`.

- **Default value:** `better-queue`

## Emails

### `emails.provider`

A provider used for sending emails: `false`, `resend`.

- **Default value:** `false`

## Services

### `services.auth.enabled`

Enables or disables Auth service.

### `services.sqlite.enabled`

Enables or disables SQLite database support.

- **Default value:** `false`

### `services.*.enabled`

Enables or disables a particular service.