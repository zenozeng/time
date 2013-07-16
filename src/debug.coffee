class Debug
  constructor: ->
    console.log "debug on"
  log: (args...) ->
    console.log JSON.stringify(args)
  add: ->
    obj = {}
    obj.name = "Test Example"
    obj.parent = "root"
    item.add obj
  clock: ->
    $('.item').first().trigger('tap1')
  sub: ->    
    $('.item').first().trigger('tap2')
    
debug = new Debug
