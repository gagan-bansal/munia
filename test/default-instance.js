const t = require('tap')
const assert = require('assert')
const sinon = require('sinon')
const ip = require('ip')
const os = require('os')
const MockDate = require('mockdate')

let outSpy = sinon.spy(process.stdout, 'write')
let errSpy = sinon.spy(process.stderr, 'write')
sinon.stub(process, 'pid').value(123)
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
t.equal( process.stdout.write.getCall(-1).args[0],
  '{"time":946684800000,"level":"error","message":"print error","hostname":"my-machine","hostip":"127.0.0.1","pid":123}\n',
  'log error')

lg.warn('print warn')
t.equal( process.stdout.write.getCall(-1).args[0],
  '{"time":946684800000,"level":"warn","message":"print warn","hostname":"my-machine","hostip":"127.0.0.1","pid":123}\n',
  'log warn')

lg.info('print info')
t.equal(process.stdout.write.getCall(-1).args[0],
  '{"time":946684800000,"level":"info","message":"print info","hostname":"my-machine","hostip":"127.0.0.1","pid":123}\n',
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

sinon.restore()
