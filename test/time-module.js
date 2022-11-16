const t = require('tap')
const sinon = require('sinon')
const MockDate = require('mockdate')

const time = require('../lib/time.js')
t.beforeEach(t => {
  MockDate.set('2000-01-01')
  sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-330)
})
t.afterEach(t => {
  MockDate.reset()
  sinon.restore()
})
t.test('time function', async t => {
  t.type(time, 'function', 'time is function')

  const ts = time({})
  t.type(ts, 'function', 'time returns function')
  t.equal(ts(), '2000-01-01T05:30:00.000+05:30', 'default time is local time')

  const tsEpoch = time({timeFormat: 'epoch'})
  t.equal(tsEpoch(), 946684800000, 'time with epoch option')

  const tsIso = time({timeFormat: 'iso'})
  t.equal(tsIso(), '2000-01-01T00:00:00.000Z', 'time with ISO option')

  const tsLocal = time({timeFormat: 'local'})
  t.equal(tsLocal(), '2000-01-01T05:30:00.000+05:30', 'time with local option')
})
