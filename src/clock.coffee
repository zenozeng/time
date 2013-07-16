class Clock
  constructor: ->
    last = localStorage.getItem 'lastClock'
    if last
      @current = JSON.parse last
    @current = @current || {}
  stage: -> localStorage.setItem 'lastClock', JSON.stringify(@current)
  save: ->
    if @current.clockin? && @current.clockout? && @current.itemid?
      db.put 'clock', @current
      obj = {id: @current.itemid, lastaccess: new Date().getTime()}
      item.update obj
  get: (itemid, args..., callback) ->
    # get the records of `itemid`
    start = args[0]
    end = args[1]
    db.get 'clock', 'itemid', itemid, (items) ->
      items = items.filter (item) ->
        # 验证有效性
        return false if !item.itemid || !item.clockin || !item.clockout
        # 取出有交集的项目
        return true if(not start? && not end?)
        if start? && not end?
          return true if item.clockout > start
        if not start? && end?
          return true if item.clockin < end
        if start? && end?
          return false if item.clockout < start
          return false if item.clockin > end
          return true
        false
      # 裁切边界
      items = items.map (item) ->
        if start? && item.clockin < start
          item.clockin = start
        if end? && item.clockout > end
          item.clockout = end
        item
      callback items
  sum: (itemid, args..., callback) ->
    switch args[0]
      when 'today'
        args[0] = new Date()
        args[0].setHours(0, 0, 0)
        args[0] = args[0].getTime() + config.dayStartAt*3600*1000
        args[1] = new Date().getTime()
        # 今天还没到，还在凌晨
        if args[1] < args[0]
          args[1] = args[0]
          args[0] -= 24*3600*1000
    @get itemid, args[0], args[1], (items) ->
      sum = 0
      sum += item.clockout - item.clockin for item in items
      callback sum
  isClocking: ->
    !!(@current && @current.clockin)
  clockin: (itemid) ->
    @current.itemid = itemid
    @current.clockin = new Date().getTime()
    @stage()
  clockout: ->
    @current.clockout = new Date().getTime()
    @save()
    @current = {}
    @stage()
  remove: (id) -> db.remove 'clock', id
  update: (obj) -> db.update 'clock', obj

clock = new Clock
