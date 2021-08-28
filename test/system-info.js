const t = require('tap')
const sinon = require('sinon')
const ip = require('ip')
const os = require('os')
const MockDate = require('mockdate')
const tmp = require('tmp')
const fs = require('fs')

let outSpy = sinon.spy(process.stdout, 'write')
sinon.stub(process, 'pid').value(123)
sinon.stub(ip, 'address').returns('127.0.0.1')
sinon.stub(os, 'hostname').returns('my-machine')
MockDate.set('2000-01-01')
sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-330)

const munia = require('../lib/index.js')

// system info options

  const log = munia({
    hostname: false,
    hostip: false,
    pid: false
  })
  log.info('system info should not get printed')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":946684800000,"level":"info","message":"system info should not get printed"}'),
    'system info should not get printed')

  const log2 = munia({
    hostname: 'prod-server',
    hostip: '10.0.0.1',
    pid: '567'
  })
  log2.info('system info passed as string')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":946684800000,"level":"info","message":"system info passed as string","hostname":"prod-server","hostip":"10.0.0.1","pid":"567"}'),
    'system info passed as string')

  const log3 = munia({
    hostname: () => 'DC1-' + os.hostname(),
    hostip: () => ip.address(),
    pid: () => 111
  })
  log3.info('system info passed as function')
  t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
    JSON.parse('{"time":946684800000,"level":"info","message":"system info passed as function","hostname":"DC1-my-machine","hostip":"127.0.0.1","pid":111}'),
    'system info passed as function')

sinon.restore()
