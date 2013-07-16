class Item
  add: (obj, callback) ->
    obj.lastaccess = new Date().getTime()
    db.put 'item', obj, callback
  get: (id, callback) ->
    if id is 'root'
      callback {id: 'root', name: 'Clock'}
    else
      db.get 'item', id, (item) ->
        if item
          callback item
        else
          callback null
  update: (obj, callback) -> db.update 'item', obj, callback
  parentid: (id, callback) ->
    # 返回父节点id
    @get id, (item) -> callback item && item.parent
  parent: (id, callback) ->
    @parentid id, (id) => @get id, (item) -> callback item
  parents: (id, andSelf..., callback) ->
    # 所有祖先节点，祖先拥有更小的index
    items = []
    iter = (id) =>
      @get id, (item) ->
        if item? 
          items.unshift item
        if item.parent?
          iter item.parent
        else
          items.pop() unless andSelf[0]
          callback items
    iter id
  move: (id, to, callback) ->
    @update {id: id, parent: to}, callback
  remove: (id, removeChildren, callback) ->
    removeItem = (id, callback) ->
      # 删除id为`id`的item，并移除相应的clock记录
      db.remove 'item', id, ->
        db.get 'clock', 'itemid', id, (items) ->
          ids = items.map (item) -> item.id
          db.remove 'clock', ids, ->
            callback() if isFn callback
    removeItems = (ids, callback) ->
      iter = (ids) ->
        id = ids.pop()
        if id?
          removeItem 'item', id, ->
          iter ids
        else
          callback() if isFn callback
      iter ids

    if removeChildren?
      @children id, (children) ->
        removeItems children.concat([id]), callback
    else
      @parentid id, (parentid) =>
        @children id, (children) =>
          children.map (child) => @move child.id, parentid
          removeItem id, callback
  children: (id, callback) -> db.get 'item', 'parent', id, callback
  sort: (items) ->
    # recent items will have smaller index
    items.sort (a, b) -> b.lastaccess - a.lastaccess

item = new Item  
