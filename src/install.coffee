class Install
  constructor: ->
    @webapp = "http://app.zenoes.com/clock/clock.webapp"

  tryit: ->
    return unless navigator.mozApps?
    request = navigator.mozApps.checkInstalled(@webapp)
    request.onsuccess = =>
      if (request.result) 
        # we're installed
      else
        # not installed
        @install()

  install: ->
    request = navigator.mozApps.install(@webapp)
    request.onsuccess = -> alert "Welcome to Zeno's Clock App!"
    request.onerror = -> alert "Whoops! Fail to Install this app!"

install = new Install
install.tryit()
