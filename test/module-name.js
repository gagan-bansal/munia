const t = require('tap')
const assert = require('assert')
const sinon = require('sinon')
const ip = require('ip')
const os = require('os')
const MockDate = require('mockdate')

let outSpy = sinon.spy(process.stdout, 'write')
sinon.stub(process.env, 'NODE_ENV').value(null)
sinon.stub(process, 'pid').value(123)
sinon.stub(ip, 'address').returns('127.0.0.1')
sinon.stub(os, 'hostname').returns('my-machine')
MockDate.set('2000-01-01')
sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-330)

const munia = require('../lib/index.js')

// only module name
  let log = munia('main-module')
  t.type(log, 'object', 'munia returns a object')
  sinon.spy(log)

  const defaultLevels =  ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']

  defaultLevels.forEach(level => {
    t.type(log[level], 'function', `option as module name string, instance has function ${level}`)
  })

  log.error('print error')
  t.equal( process.stdout.write.getCall(-1).args[0],
    '{"time":946684800000,"level":"error","message":"print error","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"module":"main-module"}\n',
    'log error')

  log.warn('print warn')
  t.equal( process.stdout.write.getCall(-1).args[0],
    '{"time":946684800000,"level":"warn","message":"print warn","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"module":"main-module"}\n',
    'log warn')

  log.info('print info')
  t.equal(process.stdout.write.getCall(-1).args[0],
    '{"time":946684800000,"level":"info","message":"print info","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"module":"main-module"}\n',
    'print info')

  outSpy.restore()
  outSpy = sinon.spy(process.stdout, 'write')
  log.http('does not print http')
  t.ok(process.stdout.write.notCalled, 'does not print http')

  outSpy.restore()
  outSpy = sinon.spy(process.stdout, 'write')
  log.verbose('does not print verbose')
  t.ok(process.stdout.write.notCalled, 'does not print verbose')

  outSpy.restore()
  outSpy = sinon.spy(process.stdout, 'write')
  log.debug('does not print debug')
  t.ok(process.stdout.write.notCalled, 'does not print debug')

  outSpy.restore()
  outSpy = sinon.spy(process.stdout, 'write')
  log.silly('does not print silly')
  t.ok(process.stdout.write.notCalled, 'does not print silly')

// module name as config
  let log2 = munia({module: 'main-module'})
  t.type(log2, 'object', 'munia returns a object')
  sinon.spy(log2)

  defaultLevels.forEach(level => {
    t.type(log2[level], 'function', `module name as option, instance has function ${level}`)
  })

  log2.error('print error')
  t.equal( process.stdout.write.getCall(-1).args[0],
    '{"time":946684800000,"level":"error","message":"print error","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"module":"main-module"}\n',
    'log error')

  log2.warn('print warn')
  t.equal( process.stdout.write.getCall(-1).args[0],
    '{"time":946684800000,"level":"warn","message":"print warn","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"module":"main-module"}\n',
    'log warn')

  log2.info('print info')
  t.equal(process.stdout.write.getCall(-1).args[0],
    '{"time":946684800000,"level":"info","message":"print info","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"module":"main-module"}\n',
    'print info')

  outSpy.restore()
  outSpy = sinon.spy(process.stdout, 'write')
  log2.http('does not print http')
  t.ok(process.stdout.write.notCalled, 'does not print http')

  outSpy.restore()
  outSpy = sinon.spy(process.stdout, 'write')
  log2.verbose('does not print verbose')
  t.ok(process.stdout.write.notCalled, 'does not print verbose')

  outSpy.restore()
  outSpy = sinon.spy(process.stdout, 'write')
  log2.debug('does not print debug')
  t.ok(process.stdout.write.notCalled, 'does not print debug')

  outSpy.restore()
  outSpy = sinon.spy(process.stdout, 'write')
  log2.silly('does not print silly')
  t.ok(process.stdout.write.notCalled, 'does not print silly')

sinon.restore()

