class Summary
  constructor: ->
    @prefix = "SUMMARY"

  # 异步地展示id为ID的item的summary
  display: (id) ->
    $('#summary').html ''
    item.get id, (item) => @show item
    item.children id, (children) =>
      return unless children? && children.length > 0
      for child in children
        @show child
      
  # 展示某个item，不包括子孙
  show: (item) ->
    $('#summary').append "<div class=\"item\">#{item.name}</div>"
    display = (start, end, text) =>
      elemId = [@prefix, start.getTime(), end.getTime(), item.id].join '-'
      $('#summary').append "<div id=\"#{elemId}\" class=\"sum\">#{text}</div>"
      @sum item.id, start.getTime(), end.getTime()

    # today
    start = new Date()
    start.setHours(0, 0, 0)
    start.setTime(start.getTime() + config.dayStartAt*3600*1000)
    end = new Date()
    if start.getTime() > end.getTime()
      # 今天还没到，还在凌晨
      start.setTime(start.getTime() - 24*3600*1000)
    display start, end, 'TODAY'

    # yestoday
    end = new Date(start.getTime())
    start.setTime(start.getTime() - 24*3600*1000)
    display start, end, 'YESTODAY'

    # this week
    # 这个严格从周一到周日，不包括dayStartAt带来的offset
    start = new Date()
    start.setHours(0, 0, 0)
    offset = start.getDay()
    if(offset == 0) # sunday
      offset = 7
    start.setTime(start.getTime() - (offset - 1)*24*3600*1000)
    end = new Date()
    display start, end, 'THIS WEEK'

    # this month
    # 这个严格从每月1日开始，不包括dayStartAt带来的offset
    start = new Date()
    start.setHours(0, 0, 0)
    start.setDate(1)
    end = new Date()
    display start, end, 'THIS MONTH'

    # sum
    start = new Date('1970-01-01')
    end = new Date()
    display start, end, 'SUM'

  # 某个item的时间总和，包括其所有子孙项目
  # 直接异步地加在dom上
  sum: (itemid, start, end) ->
    elemId = [@prefix, start, end, itemid].join '-'

    # 把item的clock的sum加到elem上
    addToElem = (item) ->
      clock.sum item.id, start, end, (sum) ->
        jq = $('#'+elemId)
        ori = jq.attr('data-sum') || 0
        sum += parseInt ori
        jq.attr('data-sum', sum)
        jq.attr('data-clock', duration(sum))

    # 添加自身
    item.get itemid, (item) =>
      addToElem item

    # 遍历所有子孙
    iter = (_itemid) =>
      item.children _itemid, (children) =>
        return unless children? && children.length > 0
        for child in children
          addToElem child
          iter child.id
    iter itemid
    
summary = new Summary    
        
