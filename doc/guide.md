# Guide

## Routes

Routes are defined per-service, in `routes` directory. Expresso uses a file-based router, so all your routes are declarative.

### Defining routes

Create a `routes` directory in the service of your choice if it doesn't exist. Inside it, create a file called `example.js`. Open the file and declare your routes like this:

```js
export async function get (req, res) {
  // GET /example
}

export async function post (req, res) {
  // POST /example
}

export async function patch (req, res) {
  // PATCH /example
}

export async function delete (req, res) {
  // DELETE /example
}
```

`req.body` will contain parsed request body. `req.query` will containg parsed query parameters. `req.service` will contain objects like `config`, `models`, etc.

## Views

## Models

## Jobs

## Emails
