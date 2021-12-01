const t = require('tap')
const assert = require('assert')
const sinon = require('sinon')
const ip = require('ip')
const os = require('os')
const MockDate = require('mockdate')
const tmp = require('tmp')
const fs = require('fs')

sinon.stub(process.env, 'NODE_ENV').value(null)
sinon.stub(process, 'pid').value(123)
sinon.stub(ip, 'address').returns('127.0.0.1')
sinon.stub(os, 'hostname').returns('my-machine')
MockDate.set('2000-01-01')
sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-330)

const munia = require('../lib/index.js')
const defaultLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']

// stream option
  const tmpOut = tmp.fileSync();
  const outStream = fs.createWriteStream(tmpOut.name, {fd: tmpOut.fd})
  sinon.spy(outStream, 'write')

  let log = munia({outStream})
  defaultLevels.forEach(level => {
    t.type(log[level], 'function', `with stream option, instance has function ${level}`)
  })
  const logLevels = ['error', 'warn', 'info']
  logLevels.forEach(level => {
    log[level](`print ${level} with stream option`)
    t.same(JSON.parse(outStream.write.getCall(-1).args[0]),
      JSON.parse(`{"time":946684800000,"level":"${level}","message":"print ${level} with stream option","hostname":"my-machine","hostip":"127.0.0.1","pid":123}`),
      `print ${level} with stream option`)
  })

setTimeout(() => {
  //tmpError.removeCallback()
  tmpOut.removeCallback()
  sinon.restore()
}, 200)

