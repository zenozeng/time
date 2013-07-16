@UUID = ->
  microtime = (new Date()).getTime().toString(16)
  random = Math.random().toString().replace(/\./, '')
  random = parseInt(random).toString(16)
  ua = navigator.userAgent.replace(/[^0-9]/g, '')
  ua = parseInt(ua).toString(16)
  base = 'S' + microtime + random + ua + microtime + microtime; # make sure length is enough
  base = [
    base.substring(0, 8),
    base.substring(8, 12),
    base.substring(12, 16),
    base.substring(16, 20),
    base.substring(20, 32)
  ]
  base.join('-')

@isArray = (obj) ->
  Object.prototype.toString.call(obj) is '[object Array]'

@isFn = (fn) ->
  typeof fn is "function"

@duration = (delta) ->
  d = moment.duration(delta)
  arr = [d.years(), d.months(), d.days(), d.hours(), d.minutes(), d.seconds()]
  while (arr[0] == 0 && arr.length > 2)
    arr.shift()
  arr = arr.map (item) -> if item < 10 then '0'+item else item
  arr.join ' : '

@base64Encode = (str) ->
  btoa unescape(encodeURIComponent(str))
@base64Decode = (str) ->
  decodeURIComponent escape(atob(str))
