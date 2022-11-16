const ip = require('ip')
const stringify = require('json-stringify-safe')
const os = require('os')
const extend = require('extend')
const Time = require('./time.js')
const {fileURLToPath} = require('url')
const path = require('path')
const {printf} = require('fast-printf')
const {serializeError, deserializeError} = require('serialize-error')

const defaults = {
  levels: () => ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
  logLevel: () => process.env.NODE_ENV === 'development' ? 'silly' : 'info',
  errorLevel: () => 'warn',
  hostname: () => os.hostname(),
  hostip: () => ip.address(),
  pid: () => process.pid,
  argv: () => true,
  app: () => path.basename(process.cwd())
}

module.exports = function (options = {}) {
  // TODO check default property from opts
  // if exist take them and rest as meta

  // opts is options only
  const [meta, opts] = getInitMeta(options)

  const outStream = opts.outStream || process.stdout
  const errStream = opts.errStream || opts.errorStream || process.stderr

  const time = setTime(opts)

  const levels = opts.levels || defaults.levels()
  const logLevel = setLogLevel(opts, levels)
  const allowedLevelIdx = levels.indexOf(logLevel)

  // error log error messages to stdout as well as to stderr
  const logErrorToStderr = opts.logErrorToStderr ||
    (process.env.NODE_ENV === 'development' ? false : true)
  const errorLevelIndex = logErrorToStderr ? setStderrLevelIndex(opts, levels)
    : -1

  const formatter = setFormatter(opts)

  const _systemMeta = setSystemMeta(opts)

  const error = function (str) {
    errStream.write(str + '\n')
  }

  const out = function (str) {
    outStream.write(str + '\n')
  }

  const sequence = opts.sequence || false

  function Logger (meta) {
    this._children = 0
    this._meta = sequence ? {sequence: '0'} : {}
    extend(this._meta, meta)
    this.appendLogMethods()
    if (opts.subLevels) this.setSubLevels(opts.subLevels)
  }

  Logger.prototype.child = function (childMeta) {
    let _meta = sequence ?
      {sequence: this._meta.sequence + '.' + this._children} : {}
    this._children += 1
    if (typeof childMeta === 'string') {
      _meta.module = parseModuleName(childMeta)
    } else if (typeof childMeta === 'object') {
      extend(_meta, this._meta, childMeta)
    }
    // return extend(true, {}, this, {_meta, _children: 0})
    return  new Logger(_meta)
  }

  Logger.prototype.appendLogMethods  = function () {
    levels
      .reduce((obj, level) => {
        const logIndex = levels.indexOf(level)
        if (logIndex > allowedLevelIdx) {
          obj[level] = () => {}
        } else if (logErrorToStderr && logIndex <= errorLevelIndex) {
          obj[level] = function() {
            if (arguments.length === 0) return
            const [message, meta] = parseLogMessage([...arguments])
            const logData = formatter(extend(
              {time: time(), level, message},
              _systemMeta, this._meta, meta
            ))
            out(logData)
            return error(logData)
          }
        } else {
          obj[level] = function() {
            if (arguments.length === 0) return
            const [message, meta] = parseLogMessage([...arguments])
            const logData = formatter(extend(
              {time: time(), level, message},
              _systemMeta, this._meta, meta
            ))
            return out(logData)
          }
        }
        return obj
      }, this)
  }

  Logger.prototype.setSubLevels = function (subLevels) {
    if (Array.isArray(subLevels)) {
      // TODO
    } else if (typeof subLevels === 'object') {
      for(let level in subLevels) {
        if (!Array.isArray(subLevels[level])) throw new Error(`subLevels option error, ${level} must be an array`)
        subLevels[level].forEach(sub => {
          if (levels.indexOf(level) <= allowedLevelIdx) {
            this[level][sub] = (msg, meta) => {
              return this[level](msg, extend({subLevel: sub}, meta))
            }
          } else {
            this[level][sub] = () => {}
          }
        })
      }
    }
  }
  // create logger for first instance
  const logger = new Logger(meta)
  return logger
}

function setSystemMeta (opts) {
  /** for these options can be
    * none (no option given): take from default,
    * false: do not print
    * string: print exact as given
    * function: that returns the value to print
   **/
  const meta = {}
  if (include(opts, 'hostname')) meta['hostname'] = setProperty(opts, 'hostname')
  if (include(opts, 'hostip')) meta['hostip'] = setProperty(opts, 'hostip')
  if (include(opts, 'pid')) meta['pid'] = setProperty(opts, 'pid')
  return meta
}

function setProperty (opts, prop) {
  // considiering it's never called for false option
  if (typeof opts[prop] === 'string') return opts[prop]
  else if (typeof opts[prop] === 'function') return opts[prop]()
  else return defaults[prop]()
}

function include (opts, prop) {
  return !(opts.hasOwnProperty(prop) && opts[prop] === false)
}

function setStderrLevelIndex (opts, levels) {
  return levels.indexOf(opts.errorLevel || defaults.errorLevel())
}

function setLogLevel (opts, levels) {
  const logLevel = process.env.MUNIA_LOG_LEVEL || opts.logLevel || defaults.logLevel()
  if (levels.indexOf(logLevel) < 0) throw new Error('logLevel was not found in levels')
  return logLevel
}

function setFormatter (opts) {
  if (opts.formatter) {
    if (typeof opts.formatter === 'function') {
      return opts.formatter
    } else {
      throw new Error('formatter is not function')
    }
  } else {
    return stringify
  }
}

function getInitMeta (opts) {
  let meta = {}
  if (typeof opts === 'string') {
    meta.module = parseModuleName(opts)
    opts = {}
  } else if (typeof opts === 'object') {
    if (opts.meta && typeof opts.meta === 'object')
      meta = opts.meta
    if (opts.module && typeof opts.module === 'string')
      meta.module = parseModuleName(opts.module)
  } else {
    opts = {}
  }
  // parse process arguments
  if (include(opts, 'argv')) {
    const argv = require('minimist')(process.argv.slice(2))
    if (argv._.length > 0) argv.commands = argv._
    delete argv._
    extend(meta, argv);
  }
  // parse app name
  if (include(opts, 'app')) meta.app = setProperty(opts, 'app')

  return [meta, opts]
}

function parseModuleName (str) {
  let filename
  try {
    filename = fileURLToPath(str)
  } catch (e) {
    // its not import.meta.url
    let isFile = false
    try {
      isFile = path.isAbsolute(str)
    } catch (e) {
      //its not __filename
    }
    if (isFile) filename = str
  }
  if (!filename) return str
  let cwd = process.cwd()
  return path.relative(cwd,filename)
}

function setTime (opts) {
  if (opts.time) {
    if (typeof opts.time === 'function') return opts.time()
  } else {
    return Time({timeFormat: opts.timeFormat})
  }
}

function parseLogMessage (args) {
  let msg = '', meta = {}
  if (typeof args[args.length - 1] === 'object') {
    meta = args.pop()
  }
  if (meta.hasOwnProperty('error')) meta.error = serializeError(meta.error)
  if (/%/.test(args[0])) msg = printf.apply(null, args)
  else msg = args.join(' ')
  return [msg, meta]
}

