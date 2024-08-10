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
let hrtime = sinon.stub(process.hrtime, 'bigint').returns(1000)
sinon.stub(ip, 'address').returns('127.0.0.1')
sinon.stub(os, 'hostname').returns('my-machine')
MockDate.set('2000-01-01')
sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-330)

const munia = require('../lib/index.js')
const lg = munia()
t.type(lg.child, 'function', 'logger instance has child function')
// test child and functions
let child = lg.child();
t.type(child, 'object', 'child function returns a object')
let childSpy = sinon.spy(child)

const defaultLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']

defaultLevels.forEach(level => {
  t.type(child[level], 'function', `child instance has function ${level}`)
})

// check loguuid
child.info('has loguuid');
const actualLog = JSON.parse(process.stdout.write.getCall(-1).args[0])
t.hasProp(actualLog, 'loguuid', 'child has loguuid property');

// child with time enabled
let childWithTime = lg.child();
let childTimeSpy = sinon.spy(childWithTime)
const timeFunctions = ['time', 't', 'timeLog', 'tl', 'timeEnd', 'te']
defaultLevels.forEach(level => {
  t.type(childWithTime[level], 'function', `childWithTime instance has function ${level}`)
  timeFunctions.forEach( func => {
    t.type(childWithTime[level][func], 'function', `childWithTime\'s log function ${level} has function ${func}`)
  })
})
