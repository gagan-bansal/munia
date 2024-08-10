const t = require('tap')
const assert = require('assert')
const sinon = require('sinon')
const ip = require('../lib/local-ip-address.js')
const os = require('os')
const MockDate = require('mockdate')

let outSpy = sinon.spy(process.stdout, 'write')
let errSpy = sinon.spy(process.stderr, 'write')
sinon.stub(process, 'pid').value(123)
let nodeEnvStub = sinon.stub(process.env, 'NODE_ENV').value(null)
sinon.stub(ip, 'address').returns('127.0.0.1')
sinon.stub(os, 'hostname').returns('my-machine')
MockDate.set('2000-01-01')
sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-330)

const munia = require('../lib/index.js')
t.type(munia, 'function', 'munia is function')
const lg = munia()
t.type(lg, 'object', 'munia returns a object')
sinon.spy(lg)

const defaultLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']

defaultLevels.forEach(level => {
  t.type(lg[level], 'function', `default instance has function ${level}`)
})

lg.error('print error')
t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
  JSON.parse('{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"error","message":"print error","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
  'log error')

lg.warn('print warn')
t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
  JSON.parse('{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"warn","message":"print warn","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
  'log warn')

lg.info('print info')
t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
  JSON.parse('{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"info","message":"print info","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
  'print info')

outSpy.restore()
outSpy = sinon.spy(process.stdout, 'write')
lg.http('does not print http')
t.ok(process.stdout.write.notCalled, 'does not print http')

outSpy.restore()
outSpy = sinon.spy(process.stdout, 'write')
lg.verbose('does not print verbose')
t.ok(process.stdout.write.notCalled, 'does not print verbose')

outSpy.restore()
outSpy = sinon.spy(process.stdout, 'write')
lg.debug('does not print debug')
t.ok(process.stdout.write.notCalled, 'does not print debug')

outSpy.restore()
outSpy = sinon.spy(process.stdout, 'write')
lg.silly('does not print silly')
t.ok(process.stdout.write.notCalled, 'does not print silly')

outSpy.restore()
outSpy = sinon.spy(process.stdout, 'write')
nodeEnvStub = sinon.stub(process.env, 'NODE_ENV').value('development')
lg.silly('print silly if NODE_ENV is "development"')
t.ok(process.stdout.write.notCalled, 'print silly if NODE_ENV is "development"')

sinon.restore()
