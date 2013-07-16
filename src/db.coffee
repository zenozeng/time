class DB
  constructor: ->
    @readyCallbacks = []
    request = window.indexedDB.open("clock", 1)
    request.onerror = (e) =>
      console.error e
      alert "Database Error"
    request.onsuccess = =>
      @db = request.result
      @db.onversionchange = ->
        db.close()
        alert("Database UPDATE Needed, please Close ALL tabs and reload!")
      @readyCallbacks.map (callback) ->
        callback()
      
    request.onblocked = => alert "DB Blocked"

    request.onupgradeneeded = (event) ->
      db = event.target.result
      objectStoreNames = db.objectStoreNames
      oldVersion = event.oldVersion
      objectStore = db.createObjectStore("item", { keyPath: "id" })
      objectStore.createIndex("name", "name", { unique: false })
      objectStore.createIndex("parent", "parent", { unique: false })
      objectStore.createIndex("lastaccess", "lastaccess", { unique: false })
      objectStore = db.createObjectStore("clock", { keyPath: "id" })
      objectStore.createIndex("itemid", "itemid", { unique: false })
      objectStore.createIndex("clockin", "clockin", { unique: false })
      objectStore.createIndex("clockout", "clockout", { unique: false })
      
  ready: (callback) ->
    if @db?
      callback()
    else
      @readyCallbacks.push callback

  put: (objectStoreName, obj, callback) ->
    obj.id = UUID() unless obj.id?
    transaction = @db.transaction [objectStoreName], "readwrite"
    transaction.objectStore(objectStoreName).put obj
    transaction.oncomplete = =>
      debug.log obj
      callback() if isFn callback

  update: (objectStoreName, obj, callback) ->
    @get objectStoreName, obj.id, (ori) =>
      ori = {} unless ori?
      for key of obj
        ori[key] = obj[key]
      @put objectStoreName, ori, callback

  remove: (objectStoreName, ids, callback) ->
    ids = [ids] unless isArray ids
    transaction = @db.transaction [objectStoreName], "readwrite"
    transaction.oncomplete = -> callback() if isFn callback
    transaction.onerror = (e) -> alert e
    objectStore = transaction.objectStore objectStoreName
    `objectStore.delete(id)` for id in ids

  filter: (objectStoreName, test, callback) ->
    transaction = @db.transaction objectStoreName
    transaction.onerror = (e) -> alert e
    objectStore = transaction.objectStore objectStoreName
    items = []
    objectStore.openCursor().onsuccess = (event) ->
      cursor = event.target.result
      if(cursor)
        v = cursor.value
        if test(v)
          items.push v
        cursor.continue()
      else
        callback items

  count: (objectStoreName, args..., value, callback) ->
    @get objectStoreName, args[0], value, (items) ->
      items.length
    
  get: (objectStoreName, args..., callback) ->
    transaction = @db.transaction objectStoreName
    transaction.onerror = (e) -> alert e
    objectStore = transaction.objectStore objectStoreName
    items = []
    if args.length is 1
      value = args[0]
    if args.length is 2
      [key, value] = args
      
    if(key? && value?)
      keyRange = window.IDBKeyRange.only(value)
      index = objectStore.index(key)
      index.openCursor(keyRange).onsuccess = (event) ->
        cursor = event.target.result
        if(cursor)
          items.push(cursor.value)
          cursor.continue()
        else
          callback items

    if(!key? && value?)
      request = objectStore.get value
      request.onsuccess = (event) ->
        callback request.result

    if(!key? && !value?)
      objectStore.openCursor().onsuccess = (event) ->
        cursor = event.target.result
        if(cursor) 
          items.push cursor.value
          cursor.continue()
        else
          callback items

db = new DB
