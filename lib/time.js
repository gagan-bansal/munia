
// local time credit https://stackoverflow.com/a/28149561/713573
module.exports = function (options = {}) {
  let {timeFormat = 'epoch'} = options
  timeFormat = timeFormat.toLowerCase()
  if (timeFormat === 'epoch') {
    return function time () {
      return Date.now()
    }
  } else if (timeFormat === 'iso') {
    return function time () {
      return (new Date()).toISOString()
    }
  } else if (timeFormat === 'local') {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000; //offset in ms
    const tzOffsetString = calTzOffsetString()
    return function time () {
      return (new Date(Date.now() - tzOffset)).toISOString()
        .replace(/Z$/,'') + tzOffsetString
    }
  }
  function calTimestamp (local) {
    if (local) {
      return (new Date(Date.now() - tzOffset)).toISOString()
        .replace(/Z$/,'') + tzOffsetString
    } else {
      return (new Date()).toISOString()
    }
  }
}

function calTzOffsetString() {
  // credit https://stackoverflow.com/a/5114625/713573
	function pad(number, length){
		var str = "" + number
		while (str.length < length) {
			str = '0'+str
		}
		return str
	}
	var offset = new Date().getTimezoneOffset()
	offset = ((offset<0? '+':'-')+ // Note the reversed sign!
		pad(parseInt(Math.abs(offset/60)), 2) + ':' +
		pad(Math.abs(offset%60), 2))
  return offset
}

