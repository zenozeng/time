class Config
  constructor: ->
    @dayStartAt = 5.5 # New Day starts at 05:30
    @config = localStorage.getItem('config')
    if @config?
      @config = JSON.parse @config
      for key of @config
        if @config[key]?
          this[key] = @config[key]
    else
      @config = {}
  set: (key, value) ->
    return unless value?
    @config[key] = value
    this[key] = value
    localStorage.setItem 'config', JSON.stringify(@config)

config = new Config  
