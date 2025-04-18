export default async function (context) {
  const { sqlite, extend } = context

  if (!sqlite) {
    throw new Error('sqlite must be enabled to use the auth service')
  }

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT 0,
      activation_code TEXT,
      created_at INTEGER NOT NULL
    );
  `)

  extend('private.db.findUserByUsername', sqlite.prepare('SELECT * FROM users WHERE username = ?'))
  extend('private.db.findUserByActivationCode', sqlite.prepare('SELECT * FROM users WHERE activation_code = ?'))
  extend('private.db.createUser', sqlite.prepare('INSERT INTO users (username, password, activation_code, created_at) VALUES (?, ?, ?, ?)'))
  extend('private.db.activateUserById', sqlite.prepare('UPDATE users SET is_active = 1, activation_code = NULL WHERE id = ?'))
}
