class Webapp
  constructor: ->
    @webapp = "http://app.zenoes.com/clock/clock.webapp"

  install: ->
    return unless navigator.mozApps?
    request = navigator.mozApps.checkInstalled(@webapp)
    request.onsuccess = =>
      if (request.result) 
        # we're installed
      else
        # not installed
        @install()
    request = navigator.mozApps.install(@webapp)
    request.onsuccess = -> alert "Welcome to Zeno's Clock App!"
    request.onerror = -> alert "Whoops! Fail to Install this app!"

new Webapp().install()
