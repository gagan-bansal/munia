const t = require('tap')
const assert = require('assert')
const sinon = require('sinon')
const ip = require('ip')
const os = require('os')
const MockDate = require('mockdate')
const tmp = require('tmp')
const fs = require('fs')

let outSpy = sinon.spy(process.stdout, 'write')
let errSpy = sinon.spy(process.stderr, 'write')
sinon.stub(process.env, 'NODE_ENV').value(null)
sinon.stub(process, 'pid').value(123)
sinon.stub(ip, 'address').returns('127.0.0.1')
sinon.stub(os, 'hostname').returns('my-machine')
MockDate.set('2000-01-01')
sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-330)

const munia = require('../lib/index.js')
const defaultLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']

// custom logLevel
  const log4 = munia({logErrorToStderr: true})

  defaultLevels.forEach(level => {
    t.type(log4[level], 'function', `default instance has function ${level}`)
  })

  const errLevels = ['error', 'warn']
  errLevels.forEach(level => {
    log4[level](`print ${level} to stderr and stdout with logErrorToStderr true`)
    assert.deepEqual(JSON.parse(process.stderr.write.getCall(-1).args[0]),
      JSON.parse(`{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"${level}","message":"print ${level} to stderr and stdout with logErrorToStderr true","hostname":"my-machine","hostip":"127.0.0.1","pid":123}`),
      `print ${level} to stderr with logErrorToStderr true`)

    assert.deepEqual(JSON.parse(process.stdout.write.getCall(-1).args[0]),
      JSON.parse(`{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"${level}","message":"print ${level} to stderr and stdout with logErrorToStderr true","hostname":"my-machine","hostip":"127.0.0.1","pid":123}`),
      `print ${level} to stdout with logErrorToStderr true`)
  })

  const outLevels = ['info']
  outLevels.forEach(level => {
    log4[level](`print ${level} to stdout with logErrorToStderr true`)
    t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
      JSON.parse(`{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"${level}","message":"print ${level} to stdout with logErrorToStderr true","hostname":"my-machine","hostip":"127.0.0.1","pid":123}`),
      `print ${level} to stdout with logErrorToStderr true`)
  })

  const silentLevels = ['http', 'verbose', 'debug', 'silly']
  silentLevels.forEach(level => {
    outSpy.restore()
    errSpy.restore()
    outSpy = sinon.spy(process.stdout, 'write')
    errSpy = sinon.spy(process.stderr, 'write')
    log4[level](`do not print ${level} to stderr or stdout with logErrorToStderr true`)
    t.ok(process.stdout.write.notCalled, `do not print ${level} to sdtout with logErrorToStderr true`)
    t.ok(process.stderr.write.notCalled, `do not print ${level} to stderr with logErrorToStderr true`)
  })

sinon.restore()
