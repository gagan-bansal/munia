## munia

**Simple and practical JSON Logger**

A JSON logger that can work very well without configuration, though it can be customised for standard logging options.

#### Installation

```sh
npm install munia --save
```

#### Usage
* Basic usage:
```javascript
const log = require('munia')()
log.info('simple and practical logger')
```
Output:

`{"time":"2000-01-01T05:30:00.000+05:30","level":"info", "message":"simple and practical logger", "hostname":"my-machine", "hostip":"127.0.0.1", "pid":123}`

* Pass module name:
```javascript
const munia = require('munia')
const log = munia('munia')
log.info('i can print module name')
```
Output:

`{"time":"2000-01-01T05:30:00.000+05:30","level":"info", "message":"i can print module name", "hostname":"my-machine", "hostip":"127.0.0.1", "pid":123,"module":"munia"}`

* Time in local time zone (default):
```javascript
const log = munia({timeFormat: 'local'})
log.info('time as local time zone')
```
Output:

`{"time":"2000-01-01T05:30:00.000+05:30", "level":"info", "message":"time as local time zone", "hostname":"my-machine", "hostip":"127.0.0.1", "pid":123}`

* Time as ISOString:
```javascript
const log = munia({timeFormat: 'ISO'})
log.info('time as ISOString format')
```

Output:

`{"time":"2000-01-01T00:00:00.000Z", "level":"info", "message":"time as ISOString format", "hostname":"my-machine", "hostip":"127.0.0.1", "pid":123}`

* Time as epoch:
```javascript
const log = munia({timeFormat: 'epoch'})
log.info('time as epoch')
```
Output:

`{"time": 946684800000, "level":"info", "message":"time as epoch", "hostname":"my-machine", "hostip":"127.0.0.1", "pid":123}`

* Log with meta info:
```javascript
const log = munia()
log.info('log userId also', {userId: 'foo'})
```
Output:

`{"time":"2000-01-01T05:30:00.000+05:30","level":"info", "message":"log userId also", "hostname":"my-machine", "hostip":"127.0.0.1", "pid":123, "userId":"foo"}`

* Do not include process id, host name and host ip. Any of these can be set as false.
```javascript
const log = munia({hostname: false, hostip: false, pid: false})
log.info('lean log')
```
Output:

`{"time":"2000-01-01T05:30:00.000+05:30","level":"info","message":"lean log"}`

* log time taken in execution like console.time and console.timeEnd

```javascript
const log = munia()
child = log.child(null, {enableTimeTaken:true})

child.info.time('API request')
setTimeout(() => {
  child.info.timeEnd('API request')
}, 1000)
```
Output:

`{"time": "2000-01-01T05:30:00.000+05:30", "level":"info", "message": "API request", "hostname":"my-machine", "hostip":"127.0.0.1", "pid":123,"timetaken":"Initiated"}`

`{"time": "2000-01-01T05:30:00.000+05:30", "level":"info", "message": "API request [time taken: 1004.496987ms]", "hostname":"my-machine", "hostip":"127.0.0.1", "pid":123, "app":"munia", "timetaken":1004.496987}`

* Custom log levels, default levels are `['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']` in priority order.
```javascript
const log = munia({
  levels: ['error', 'info', 'debug'],
  logLevel: 'debug'  //default log level is info
})
log.error('this is error message')
log.info('this is info message')
log.debug('this is debug message')
```
Output
```shell
{"time":"2000-01-01T05:30:00.000+05:30","level":"error","message":"this is error message","hostname":"my-machine","hostip":"127.0.0.1","pid":123}
{"time":"2000-01-01T05:30:00.000+05:30","level":"info","message":"this is info message","hostname":"my-machine","hostip":"127.0.0.1","pid":123}
{"time":"2000-01-01T05:30:00.000+05:30","level":"debug","message":"this is debug message","hostname":"my-machine","hostip":"127.0.0.1","pid":123}
```

#### Test

```shell
npm test
```

#### To be implemented

* Logger function after silly "limit" that run only n times. It would be helpful for debugging in for or while loop.

## License

Licensed under [MIT](./LICENSE).
