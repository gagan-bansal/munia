const t = require('tap')
const sinon = require('sinon')
const ip = require('../lib/local-ip-address.js')
const os = require('os')
const MockDate = require('mockdate')
const tmp = require('tmp')
const fs = require('fs')

let outSpy = sinon.spy(process.stdout, 'write')
sinon.stub(process.env, 'NODE_ENV').value(null)
sinon.stub(process, 'pid').value(123)
sinon.stub(ip, 'address').returns('127.0.0.1')
sinon.stub(os, 'hostname').returns('my-machine')
MockDate.set('2000-01-01')
sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-330)

const munia = require('../lib/index.js')

// time options

  const log = munia({timeFormat: 'epoch'})
  log.info('time format as epoch')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":946684800000,"app":"munia","level":"info","message":"time format as epoch","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
    'time format as epoch')

  const log2 = munia({timeFormat: 'iso'})
  log2.info('time format as iso')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":"2000-01-01T00:00:00.000Z","app":"munia","level":"info","message":"time format as iso","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
    'time format as iso')

  const log3 = munia({timeFormat: 'local'})
  log3.info('time format as local')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"info","message":"time format as local","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
    'time format as local')

  function myTime () {
    return function () {
      const d = new Date()
      return [d.getHours(), d.getMinutes(), d.getSeconds()].join(':')
    }
  }

  const log4 = munia({time: myTime})
  log4.info('custom time format, time option as function')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time": "5:30:0","app":"munia","level":"info","message":"custom time format, time option as function","hostname":"my-machine","hostip":"127.0.0.1","pid":123}'),
    'custom time format, time option as function')

sinon.restore()
