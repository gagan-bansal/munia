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

// meta info in initial config
  const log = munia({meta: {app: 'munia'}})
  t.type(log, 'object', 'munia returns a object')

  const defaultLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']

  defaultLevels.forEach(level => {
    t.type(log[level], 'function', `default instance has function ${level}`)
  })

  log.info('print info with initial meta')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"info","message":"print info with initial meta","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"app":"munia"}'),
    'print info with initial meta')

// custom levels
  const customLevels = ['error', 'info', 'debug']
  const missingLevels = ['warn', 'http', 'verbose', 'silly']

  const log2 = munia({levels: customLevels})
  t.type(log2, 'object', 'munia returns a object')

  customLevels.forEach(level => {
    t.type(log2[level], 'function', `instance with custom levels has function ${level}`)
  })

  missingLevels.forEach(level => {
    t.ok(log2[level] === undefined, `instance with custom levels does not has function ${level}`)
  })

  log2.error('print error with custom error level with custom levels')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"error","message":"print error with custom error level with custom levels","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
    'print error with custom error level with custom levels')

  log2.info('print info with custom levels')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"info","message":"print info with custom levels","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
    'print info with custom levels')

  outSpy.restore()
  outSpy = sinon.spy(process.stdout, 'write')
  log2.debug('does not print debug as log default level is info')
  t.ok(process.stdout.write.notCalled, 'does not print debug as log default level is info')

// custom logLevel
  const log3 = munia({logLevel: 'silly'})
  t.type(log3, 'object', 'munia returns a object')

  defaultLevels.forEach(level => {
    t.type(log3[level], 'function', `default instance has function ${level}`)
  })

  defaultLevels.forEach(level => {
    log3[level](`print ${level} with custom log level`)
    t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
      JSON.parse(`{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"${level}","message":"print ${level} with custom log level","hostname":"my-machine","hostip":"127.0.0.1","pid":123}`),
      `print ${level} with custom log level`)
  })

// custom levels and logLevel
  const log4 = munia({customLevels, logLevel: 'debug'})

  t.type(log4, 'object', 'munia returns a object')

  customLevels.forEach(level => {
    t.type(log4[level], 'function', `with custom level and logLevel instance has function ${level}`)
  })

  customLevels.forEach(level => {
    log4[level](`print ${level} with custom level and logLevel`)
    t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
      JSON.parse(`{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"${level}","message":"print ${level} with custom level and logLevel","hostname":"my-machine","hostip":"127.0.0.1","pid":123}`),
      `print ${level} with custom level and logLevel`)
  })

// wrong logLevel passed

  t.throws(() => {munia({logLevel: 'wrong'})}, 'should throw for wrong logLevel configured')

// formatter

  const formatter = function (json) {
    return [json.time, json.level, json.message].join('\t')
  }
  const log5 = munia({formatter})
  log5.info('tab separated output')
  t.same(process.stdout.write.getCall(-1).args[0],
    '2000-01-01T05:30:00.000+05:30\tinfo\ttab separated output\n',
    `tab separated output with custom formatter`)

// differnt levels' names
  const myLevels = ['app_error', 'app_info', 'app_debug']
  const log6 = munia({levels: myLevels, logLevel: 'app_debug'})

  t.type(log6, 'object', 'munia returns a object')

  myLevels.forEach(level => {
    t.type(log6[level], 'function', `with different levels name and logLevel instance has function ${level}`)
  })

  myLevels.forEach(level => {
    log6[level](`print ${level} with different levels name and logLevel`)
    t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
      JSON.parse(`{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"${level}","message":"print ${level} with different levels name and logLevel","hostname":"my-machine","hostip":"127.0.0.1","pid":123}`),
      `print ${level} with different levels name and logLevel`)
  })

sinon.restore()

