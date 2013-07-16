clockingUpdate = ->
  sum = parseInt($('.clocking').attr('data-sum'))
  clockin = parseInt $('.clocking').attr('data-clockin')
  delta = new Date().getTime() - clockin + sum
  clockData = duration(delta)
  $('.clocking').attr('data-clock', clockData) if sum?

class View
  constructor: ->
    setInterval clockingUpdate, 1000
  # return the standard HTML for an item
  itemHTML: (obj) -> "<li class=\"item\" id=\"#{obj.id}\">#{obj.name}</li>"
  append: (item) -> $('#items').append @itemHTML(item)
  tree: (id, callback) ->
    unless id?
      @tree 'root', callback
      return
    @setUrl "tree/"+id
    @updatePath id
    $('#items').html ''
    item.children id, (children) =>
      children = item.sort children
      children.map (child) => @append child
      @checkClock()
      unless $('#tree').is(':visible')
        @section 'tree'
      callback() if isFn callback
  currentPath: -> $('#path ul').find('li').last().attr('id')
  currentItem: -> @currentPath()
  updatePath: (id) ->
    item.parents id, true, (items) ->
      html = items.map (item) -> "<li id=\"#{item.id}\">#{item.name}</li>"
      html = html.join ''
      $('#path ul').html html
  addItem: ->
    obj = {}
    obj.name = prompt("Add an Item", "");
    return unless obj.name
    obj.parent = @currentPath()
    item.add obj, =>
      @refresh()
  rename: ->
    obj = {}
    obj.id = @currentItem()
    oriName = $('#'+obj.id).text();
    obj.name = prompt("New Name for #{oriName}", "");
    return unless obj.name
    item.update obj
  removeItem: (id, msg) ->
    confirm = window.confirm msg
    return unless confirm
    item.children id, (items) =>
      removeChildren = window.confirm "Remove all Children?" if items.length > 0
      item.remove id, removeChildren, => @refresh()
  setUrl: (url) ->
    baseUrl = window.location.href.split('#')[0]
    url = baseUrl + '#!/' + url
    window.history.pushState("Clock", "Clock", url);
  getUrl: ->
    url = window.location.href.split('#!/').pop()
    path = url.split '/'
  refresh: ->
    path = @getUrl()
    switch path[0]
      when 'tree' then @tree path[1]
      else @tree 'root'
  clockin: (id) ->
    jq = $('#'+id)
    $('.clocking').removeClass 'clocking'
    jq.addClass 'clocking'
    jq.attr('data-clockin', new Date().getTime())
    clock.sum id, 'today', (sum) =>
      jq.attr('data-sum', sum);
    clock.clockout()
    clock.clockin jq.attr('id')
  clockout: (id) ->
    $('#'+id).removeClass 'clocking'
    clock.clockout()
  clockToggle: (id) ->
    jq = $('#'+id)
    if jq.hasClass 'clocking'
      @clockout id
    else
      @clockin id
  checkClock: ->
    return unless clock.isClocking()
    current = clock.current.itemid
    @clockin current
  init: ->
    if clock.isClocking()
      @restore()
    else
      @tree 'root'
  section: (id) ->
    # switch to section#id
    $('section:visible').fadeOut ->
      $('section#'+id).fadeIn()
  restore: ->
    id = clock.current.itemid
    item.get id, (item) =>
      if item?
        @tree item.parent
      else
        @tree 'root'
  summary: (id) ->
    id = view.currentPath() unless id?
    @section 'summary'
    summary.display id
  editLogs: (id) ->
    id = view.currentPath() unless id?
    @section 'logs'
    clock.get id, (logs) ->
      html = ''
      logs = logs.reverse()
      for log in logs
        clockin = moment(log.clockin).format("YYYY-MM-DD HH:mm:ss")
        clockout = moment(log.clockout).format("YYYY-MM-DD HH:mm:ss")
        html += "<li id=\"#{log.id}\" class=\"log\">
          <input class=\"clockin\"  value=\"#{clockin}\">
          <input class=\"clockout\"  value=\"#{clockout}\">
          <input type=\"button\" value=\"Remove\" class=\"remove\">
          <input type=\"button\" value=\"Edit\" class=\"edit\">
          </li>"
      $('#logs ul').html html
  removeLog: (id) ->
    confirm = window.confirm "Remove this log?"
    return unless confirm
    db.remove 'clock', id
    $('#'+id).remove()
  editLog: (id) ->
    jq = $('#'+id)
    clockin = moment jq.find('.clockin').val()
    clockout = moment jq.find('.clockout').val()
    msg = "Update to: "+clockin.format()+'--'+clockout.format()+' ?'
    confirm = window.confirm msg
    return unless confirm?
    obj =
      id: id
      clockin: clockin.valueOf()
      clockout: clockout.valueOf()
    db.update 'clock', obj
  exportData: ->
    db.get 'item', (items) ->
      db.get 'clock', (clocks) ->
        obj = {item: items, clock: clocks}
        json = JSON.stringify obj
        mine = "mime/type"
        base64 = base64Encode json
        data = "data:#{mine};base64,#{base64}"
        window.location.href = data
  move: (id, to) ->
    unless id
      id = @currentPath()
    if id is to
      alert "Could not move to itself!"
      return
    if to
      name = $('#'+to).text()
      confirm = window.confirm "Move to #{name}?"
      if confirm
        item.move id, to, =>
          "callback"
          @refresh()
      window.moveMode = off
      @tree 'root'
    else
      alert "Go to the tree, and tap on the new parent"
      window.moveMode = on
      window.moveItem = id
      @tree 'root'
      
  importData: (file) ->
    reader = new FileReader()
    reader.onloadend = (e) ->
      confirm = window.confirm "Make Sure you've backed up your database!"
      return unless confirm
      
      text = e.target.result

      obj = JSON.parse text
      # obj shoude be something like this: {item: [ {}, {} ], clock: [ {}, {} ]}
      
      addCount = ->
        count = $('#importData').attr('data-count')
        count = parseInt(count) || 0;
        ++count;
        $('#importData').attr('data-count', count);

      items = obj.item
      for item in items
        db.put 'item', item, addCount

      logs = obj.clock
      for log in logs
        db.put 'clock', log, addCount
        
    reader.readAsText file
view = new View

db.ready ->
  view.init()
