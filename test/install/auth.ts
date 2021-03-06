import tape = require('tape')
import promisifyTape from 'tape-promise'
import path = require('path')
import {
  prepare,
  testDefaults,
} from '../utils'
import {installPkgs, install} from '../../src'
import registryMock = require('pnpm-registry-mock')
import RegClient = require('anonymous-npm-registry-client')
import rimraf = require('rimraf-then')

const test = promisifyTape(tape)

test('a package that need authentication', async function (t: tape.Test) {
  const project = prepare(t)

  const client = new RegClient()

  const data = await new Promise((resolve, reject) => {
    client.adduser('http://localhost:4873', {
      auth: {
        username: 'foo',
        password: 'bar',
        email: 'foo@bar.com',
      }
    }, (err: Error, data: Object) => err ? reject(err) : resolve(data))
  })

  await installPkgs(['needs-auth'], testDefaults({
    rawNpmConfig: {
      '//localhost:4873/:_authToken': data['token'],
    },
  }))

  const m = project.requireModule('needs-auth')

  t.ok(typeof m === 'function', 'needs-auth() is available')
})

test('a package that need authentication reuses authorization tokens for tarball fetching', async function (t: tape.Test) {
  const project = prepare(t)

  const client = new RegClient()

  const data = await new Promise((resolve, reject) => {
    client.adduser('http://localhost:4873', {
      auth: {
        username: 'foo',
        password: 'bar',
        email: 'foo@bar.com',
      }
    }, (err: Error, data: Object) => err ? reject(err) : resolve(data))
  })

  await installPkgs(['needs-auth'], testDefaults({
    registry: 'http://127.0.0.1:4873',
    rawNpmConfig: {
      '//127.0.0.1:4873/:_authToken': data['token'],
    },
  }))

  const m = project.requireModule('needs-auth')

  t.ok(typeof m === 'function', 'needs-auth() is available')
})

test('a package that need authentication reuses authorization tokens for tarball fetching when meta info is cached', async function (t: tape.Test) {
  const project = prepare(t)

  const client = new RegClient()

  const data = await new Promise((resolve, reject) => {
    client.adduser('http://localhost:4873', {
      auth: {
        username: 'foo',
        password: 'bar',
        email: 'foo@bar.com',
      }
    }, (err: Error, data: Object) => err ? reject(err) : resolve(data))
  })

  const opts = testDefaults({
    registry: 'http://127.0.0.1:4873',
    rawNpmConfig: {
      '//127.0.0.1:4873/:_authToken': data['token'],
    },
  })

  await installPkgs(['needs-auth'], opts)

  await rimraf('node_modules')
  await rimraf(path.join('..', '.registry'))
  await rimraf(path.join('..', '.store'))

  await install(opts)

  const m = project.requireModule('needs-auth')

  t.ok(typeof m === 'function', 'needs-auth() is available')
})
