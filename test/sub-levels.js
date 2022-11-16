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

// sub levels
  const subLevels = ['level1', 'level2', 'level3']
  let log = munia({subLevels: {
    info: subLevels,
    debug: subLevels
  }})
  t.type(log, 'object', 'munia returns a object')
  sinon.spy(log)
  sinon.spy(log.debug)

  const defaultLevels =  ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']
  const logLevels =  ['error', 'warn', 'info']

  defaultLevels.forEach(level => {
    t.type(log[level], 'function', `sub levels, instance has function ${level}`)
  })

  logLevels.forEach(level => {
    log[level](`print ${level} with sub levels`)
    t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
      JSON.parse(`{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"${level}","message":"print ${level} with sub levels","hostname":"my-machine","hostip":"127.0.0.1","pid":123}`),
      `print ${level} with sub levels`)
  })

  subLevels.forEach(subLevel => {
    t.type(log.info[subLevel], 'function', `sub levels, instance has function info.${subLevel}`)
    t.type(log.debug[subLevel], 'function', `sub levels, instance has function debug.${subLevel}`)
  })

  subLevels.forEach(subLevel => {
    log.info[subLevel](`print info: with sub level ${subLevel}`)
    t.same(JSON.parse(process.stdout.write.getCall(-1).args[0]),
      JSON.parse(`{"time":"2000-01-01T05:30:00.000+05:30","app":"munia","level":"info","message":"print info: with sub level ${subLevel}","hostname":"my-machine","hostip":"127.0.0.1","pid":123,"subLevel": "${subLevel}"}`),
      `print info: with sub level ${subLevel}`)
  })

  subLevels.forEach(subLevel => {
    outSpy.restore()
    outSpy = sinon.spy(process.stdout, 'write')
    let spySubLevel = sinon.spy(log.debug[subLevel])
    log.debug[subLevel](`does no print debug: with sub level ${subLevel}`)
    // console.log('called: ',log.debug[subLevel].called)
    // TODO t.ok(log.debug[subLevel].isCalled, `do not print debug.${subLevel} but called`)
    t.ok(process.stdout.write.notCalled, `does no print debug: with sub level ${subLevel}`)
  })

