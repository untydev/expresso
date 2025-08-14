# Auth

## Adding auth service

```sh
expresso add auth
```

## Command line options

### `--email=<string>`

Sets an email address used for sending emails.

- **Config path:** `services.auth.email`

### `--force`

Forces installation of Auth service in case files or configuration already exists.

## Configuration options

### `services.auth.enabled`

Enables or disables the Auth service.

- **Default value:** `true`

### `services.auth.email`

Configures an email address used for sending emails.

- **Default value:** `test@example.com`