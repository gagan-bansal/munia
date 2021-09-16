const t = require('tap')
const assert = require('assert')
const sinon = require('sinon')
const ip = require('ip')
const os = require('os')
const MockDate = require('mockdate')

let outSpy = sinon.spy(process.stdout, 'write')
sinon.stub(process, 'pid').value(123)
sinon.stub(ip, 'address').returns('127.0.0.1')
sinon.stub(os, 'hostname').returns('my-machine')
MockDate.set('2000-01-01')
sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-330)

const munia = require('../lib/index.js')

// sub levels
  const subLevels = ['level1', 'level2', 'level3']
  let log = munia()

  log.info()
  t.ok(process.stdout.write.notCalled, 'log nothing')

  log.info('log message string')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":946684800000,"level":"info","message":"log message string","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
    'log message string')

  log.info('log message string and meta', {user: 'foo'})
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":946684800000,"level":"info","message":"log message string and meta","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"user":"foo"}'),
    'log message string and meta')

  log.info({ message: 'log meta', user: 'foo'})
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":946684800000,"level":"info","message":"log meta","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"user":"foo"}'),
    'log meta')

  log.info('log two', 'strings')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":946684800000,"level":"info","message":"log two strings","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
    'log two strings')

  log.info('log', 'namy', 'strings', 'with meta info', {user: 'foo'})
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":946684800000,"level":"info","message":"log namy strings with meta info","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"user":"foo"}'),
    'log namy strings with meta info')

  log.info('log printf %s and number %d', 'string', 100)
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":946684800000,"level":"info","message":"log printf string and number 100","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
    'log printf string')

  log.info('log %s placeholders %s: (%f)', 'namy', 'with meta info', 3.14, {user: 'foo'})
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":946684800000,"level":"info","message":"log namy placeholders with meta info: (3.14)","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"user":"foo"}'),
    'log namy placeholders with meta info')

  const err = new Error('error foo')
  log.error('log serialize error', {user: 'foo', error: err})
  let actual = JSON.parse(process.stdout.write.getCall(-1).args[0])
  t.ok(actual.error && actual.error.name === 'Error', 'error serialiezed with name')
  t.ok(actual.message && actual.error.message === 'error foo', 'error serialized with message')
  t.ok(actual.message && typeof actual.error.stack === 'string', 'error serialized with stack')
