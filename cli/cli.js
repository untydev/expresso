#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import minimist from 'minimist'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

function copyDirectory (src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath) // Recursive copy
    } else {
      fs.copyFileSync(srcPath, destPath) // Copy files
    }
  }
}

const args = minimist(process.argv.slice(2))

switch (args._[0]) {
  case 'init':
    init()
    break
}

function init () {
  const src = path.join(__dirname, 'template')
  const dst = process.cwd()

  if (!fs.existsSync('config')) {
    copyDirectory(path.join(src, 'config'), path.join(dst, 'config'))
  } else {
    console.log('config already exists, skipping')
  }

  if (!fs.existsSync('src')) {
    copyDirectory(path.join(src, 'src'), path.join(dst, 'src'))
  } else {
    console.log('src already exists, skipping')
  }

  if (!fs.existsSync('.gitignore')) {
    fs.copyFileSync(path.join(src, '.gitignore'), path.join(dst, '.gitignore'))
  } else {
    console.log('.gitignore already exists, skipping')
  }
}
