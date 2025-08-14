import nodePath from 'node:path'

async function createSqlite3 (context, path) {
  // Import the package
  const sqlite3 = await import('sqlite3')

  // Create the database
  const db = new sqlite3.default.Database(path)

  // Set journal mode to WAL
  db.run('PRAGMA journal_mode = WAL')

  // Set synchronous to NORMAL
  db.run('PRAGMA synchronous = NORMAL')

  // Set busy timeout to 5 seconds
  db.run('PRAGMA busy_timeout = 5000')

  return db
}

async function createBetterSqlite3 (context, path) {
  // Import the package
  const sqlite3 = await import('better-sqlite3')

  // Create the databse
  const db = sqlite3.default(path)

  // Set journal mode to WAL
  db.pragma('journal_mode = WAL')

  // Set synchronous to NORMAL
  db.pragma('synchronous = NORMAL')

  // Set busy timeout to 5 seconds
  db.pragma('busy_timeout = 5000')

  return db
}

async function createDb (context) {
  const { AppError, config } = context

  const path = nodePath.join(config.get('data.path'), 'app.db')
  const pkg = config.get('services.sqlite.package')

  if (pkg === 'sqlite3') {
    return createSqlite3(context, path)
  } else if (pkg === 'better-sqlite3') {
    return createBetterSqlite3(context, path)
  } else {
    throw new AppError(`Unknown sqlite package: ${pkg}`)
  }
}

/**
 * Initializes an SQLite database instance.
 */
export default async function (context) {
  // Create database using the configured library.
  const db = await createDb(context)

  // Make sqlite available to all services
  context.extend('public.sqlite', db)
}
