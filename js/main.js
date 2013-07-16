//@ sourceMappingURL=main.map
// Generated by CoffeeScript 1.6.1
var Clock, Config, DB, Debug, Install, Item, Summary, View, clock, clockingUpdate, config, count, db, debug, end, install, item, move, start, summary, timeout, view,
  __slice = [].slice;

$('document').ready(function() {
  var fileElem, fileSelect,
    _this = this;
  $('#path').on('tap1', 'li', function() {
    return view.tree($(this).attr('id'));
  });
  $('#items').on('tap1', '.item', function() {
    if (window.moveMode === true) {
      return view.move(window.moveItem, $(this).attr('id'));
    } else {
      return view.clockToggle($(this).attr('id'));
    }
  });
  $('#items').on('taphold', '.item', function(event) {
    return view.removeItem($(this).attr('id'), "Remove `" + ($(this).text()) + "` ?");
  });
  $('body').on('tap2', '.item', function() {
    return view.tree($(this).attr('id'));
  });
  $('body').on('tap3', function() {
    return view.addItem("inbox");
  });
  $('#tree').on('swipeleft', function() {
    if (view.currentPath() === 'root') {
      return view.section('config');
    } else {
      return view.section('operation');
    }
  });
  $('#operation, #config').on('swiperight', function() {
    return view.section('tree');
  });
  $('#tree').on('swiperight', function() {
    return view.summary();
  });
  $('#summary').on('swipeleft', function() {
    return view.section('tree');
  });
  $('#rename').click(function() {
    return view.rename();
  });
  $('#editLogs').click(function() {
    return view.editLogs();
  });
  $('#move').click(function() {
    return view.move();
  });
  $('#logs').on('swipeleft', function() {
    return view.section('tree');
  });
  $('#logs').on('swiperight', function() {
    return view.section('tree');
  });
  $('#logs').on('click', '.remove', function() {
    return view.removeLog($(this).parent().attr('id'));
  });
  $('#logs').on('click', '.edit', function() {
    return view.editLog($(this).parent().attr('id'));
  });
  $('#exportData').on('click', function() {
    return view.exportData();
  });
  $('#dayStartAt').on('click', function() {
    var dayStartAt;
    dayStartAt = prompt("Day Start At (current is " + config.dayStartAt + "): ");
    if (!dayStartAt) {
      return;
    }
    dayStartAt = parseFloat(dayStartAt);
    return config.set('dayStartAt', dayStartAt);
  });
  $('body').on('movestart', function(e) {
    if ((e.distX > e.distY && e.distX < -e.distY) || (e.distX < e.distY && e.distX > -e.distY)) {
      return e.preventDefault();
    }
  });
  fileSelect = document.getElementById("importData");
  fileElem = document.getElementById("fileElem");
  return fileSelect.addEventListener("click", function(e) {
    return fileElem.click();
  });
});

Clock = (function() {

  function Clock() {
    var last;
    last = localStorage.getItem('lastClock');
    if (last) {
      this.current = JSON.parse(last);
    }
    this.current = this.current || {};
  }

  Clock.prototype.stage = function() {
    return localStorage.setItem('lastClock', JSON.stringify(this.current));
  };

  Clock.prototype.save = function() {
    var obj;
    if ((this.current.clockin != null) && (this.current.clockout != null) && (this.current.itemid != null)) {
      db.put('clock', this.current);
      obj = {
        id: this.current.itemid,
        lastaccess: new Date().getTime()
      };
      return item.update(obj);
    }
  };

  Clock.prototype.get = function() {
    var args, callback, end, itemid, start, _i;
    itemid = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), callback = arguments[_i++];
    start = args[0];
    end = args[1];
    return db.get('clock', 'itemid', itemid, function(items) {
      items = items.filter(function(item) {
        if (!item.itemid || !item.clockin || !item.clockout) {
          return false;
        }
        if ((start == null) && (end == null)) {
          return true;
        }
        if ((start != null) && (end == null)) {
          if (item.clockout > start) {
            return true;
          }
        }
        if ((start == null) && (end != null)) {
          if (item.clockin < end) {
            return true;
          }
        }
        if ((start != null) && (end != null)) {
          if (item.clockout < start) {
            return false;
          }
          if (item.clockin > end) {
            return false;
          }
          return true;
        }
        return false;
      });
      items = items.map(function(item) {
        if ((start != null) && item.clockin < start) {
          item.clockin = start;
        }
        if ((end != null) && item.clockout > end) {
          item.clockout = end;
        }
        return item;
      });
      return callback(items);
    });
  };

  Clock.prototype.sum = function() {
    var args, callback, itemid, _i;
    itemid = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), callback = arguments[_i++];
    switch (args[0]) {
      case 'today':
        args[0] = new Date();
        args[0].setHours(0, 0, 0);
        args[0] = args[0].getTime() + config.dayStartAt * 3600 * 1000;
        args[1] = new Date().getTime();
        if (args[1] < args[0]) {
          args[1] = args[0];
          args[0] -= 24 * 3600 * 1000;
        }
    }
    return this.get(itemid, args[0], args[1], function(items) {
      var item, sum, _j, _len;
      sum = 0;
      for (_j = 0, _len = items.length; _j < _len; _j++) {
        item = items[_j];
        sum += item.clockout - item.clockin;
      }
      return callback(sum);
    });
  };

  Clock.prototype.isClocking = function() {
    return !!(this.current && this.current.clockin);
  };

  Clock.prototype.clockin = function(itemid) {
    this.current.itemid = itemid;
    this.current.clockin = new Date().getTime();
    return this.stage();
  };

  Clock.prototype.clockout = function() {
    this.current.clockout = new Date().getTime();
    this.save();
    this.current = {};
    return this.stage();
  };

  Clock.prototype.remove = function(id) {
    return db.remove('clock', id);
  };

  Clock.prototype.update = function(obj) {
    return db.update('clock', obj);
  };

  return Clock;

})();

clock = new Clock;

Config = (function() {

  function Config() {
    var key;
    this.dayStartAt = 5.5;
    this.config = localStorage.getItem('config');
    if (this.config != null) {
      this.config = JSON.parse(this.config);
      for (key in this.config) {
        if (this.config[key] != null) {
          this[key] = this.config[key];
        }
      }
    } else {
      this.config = {};
    }
  }

  Config.prototype.set = function(key, value) {
    if (value == null) {
      return;
    }
    this.config[key] = value;
    this[key] = value;
    return localStorage.setItem('config', JSON.stringify(this.config));
  };

  return Config;

})();

config = new Config;

DB = (function() {

  function DB() {
    var request,
      _this = this;
    this.readyCallbacks = [];
    request = window.indexedDB.open("clock", 1);
    request.onerror = function(e) {
      console.error(e);
      return alert("Database Error");
    };
    request.onsuccess = function() {
      _this.db = request.result;
      _this.db.onversionchange = function() {
        db.close();
        return alert("Database UPDATE Needed, please Close ALL tabs and reload!");
      };
      return _this.readyCallbacks.map(function(callback) {
        return callback();
      });
    };
    request.onblocked = function() {
      return alert("DB Blocked");
    };
    request.onupgradeneeded = function(event) {
      var db, objectStore, objectStoreNames, oldVersion;
      db = event.target.result;
      objectStoreNames = db.objectStoreNames;
      oldVersion = event.oldVersion;
      objectStore = db.createObjectStore("item", {
        keyPath: "id"
      });
      objectStore.createIndex("name", "name", {
        unique: false
      });
      objectStore.createIndex("parent", "parent", {
        unique: false
      });
      objectStore.createIndex("lastaccess", "lastaccess", {
        unique: false
      });
      objectStore = db.createObjectStore("clock", {
        keyPath: "id"
      });
      objectStore.createIndex("itemid", "itemid", {
        unique: false
      });
      objectStore.createIndex("clockin", "clockin", {
        unique: false
      });
      return objectStore.createIndex("clockout", "clockout", {
        unique: false
      });
    };
  }

  DB.prototype.ready = function(callback) {
    if (this.db != null) {
      return callback();
    } else {
      return this.readyCallbacks.push(callback);
    }
  };

  DB.prototype.put = function(objectStoreName, obj, callback) {
    var transaction,
      _this = this;
    if (obj.id == null) {
      obj.id = UUID();
    }
    transaction = this.db.transaction([objectStoreName], "readwrite");
    transaction.objectStore(objectStoreName).put(obj);
    return transaction.oncomplete = function() {
      debug.log(obj);
      if (isFn(callback)) {
        return callback();
      }
    };
  };

  DB.prototype.update = function(objectStoreName, obj, callback) {
    var _this = this;
    return this.get(objectStoreName, obj.id, function(ori) {
      var key;
      if (ori == null) {
        ori = {};
      }
      for (key in obj) {
        ori[key] = obj[key];
      }
      return _this.put(objectStoreName, ori, callback);
    });
  };

  DB.prototype.remove = function(objectStoreName, ids, callback) {
    var id, objectStore, transaction, _i, _len, _results;
    if (!isArray(ids)) {
      ids = [ids];
    }
    transaction = this.db.transaction([objectStoreName], "readwrite");
    transaction.oncomplete = function() {
      if (isFn(callback)) {
        return callback();
      }
    };
    transaction.onerror = function(e) {
      return alert(e);
    };
    objectStore = transaction.objectStore(objectStoreName);
    _results = [];
    for (_i = 0, _len = ids.length; _i < _len; _i++) {
      id = ids[_i];
      _results.push(objectStore.delete(id));
    }
    return _results;
  };

  DB.prototype.filter = function(objectStoreName, test, callback) {
    var items, objectStore, transaction;
    transaction = this.db.transaction(objectStoreName);
    transaction.onerror = function(e) {
      return alert(e);
    };
    objectStore = transaction.objectStore(objectStoreName);
    items = [];
    return objectStore.openCursor().onsuccess = function(event) {
      var cursor, v;
      cursor = event.target.result;
      if (cursor) {
        v = cursor.value;
        if (test(v)) {
          items.push(v);
        }
        return cursor["continue"]();
      } else {
        return callback(items);
      }
    };
  };

  DB.prototype.count = function() {
    var args, callback, objectStoreName, value, _i;
    objectStoreName = arguments[0], args = 4 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 2) : (_i = 1, []), value = arguments[_i++], callback = arguments[_i++];
    return this.get(objectStoreName, args[0], value, function(items) {
      return items.length;
    });
  };

  DB.prototype.get = function() {
    var args, callback, index, items, key, keyRange, objectStore, objectStoreName, request, transaction, value, _i;
    objectStoreName = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), callback = arguments[_i++];
    transaction = this.db.transaction(objectStoreName);
    transaction.onerror = function(e) {
      return alert(e);
    };
    objectStore = transaction.objectStore(objectStoreName);
    items = [];
    if (args.length === 1) {
      value = args[0];
    }
    if (args.length === 2) {
      key = args[0], value = args[1];
    }
    if ((key != null) && (value != null)) {
      keyRange = window.IDBKeyRange.only(value);
      index = objectStore.index(key);
      index.openCursor(keyRange).onsuccess = function(event) {
        var cursor;
        cursor = event.target.result;
        if (cursor) {
          items.push(cursor.value);
          return cursor["continue"]();
        } else {
          return callback(items);
        }
      };
    }
    if ((key == null) && (value != null)) {
      request = objectStore.get(value);
      request.onsuccess = function(event) {
        return callback(request.result);
      };
    }
    if ((key == null) && (value == null)) {
      return objectStore.openCursor().onsuccess = function(event) {
        var cursor;
        cursor = event.target.result;
        if (cursor) {
          items.push(cursor.value);
          return cursor["continue"]();
        } else {
          return callback(items);
        }
      };
    }
  };

  return DB;

})();

db = new DB;

Debug = (function() {

  function Debug() {
    console.log("debug on");
  }

  Debug.prototype.log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return console.log(JSON.stringify(args));
  };

  Debug.prototype.add = function() {
    var obj;
    obj = {};
    obj.name = "Test Example";
    obj.parent = "root";
    return item.add(obj);
  };

  Debug.prototype.clock = function() {
    return $('.item').first().trigger('tap1');
  };

  Debug.prototype.sub = function() {
    return $('.item').first().trigger('tap2');
  };

  return Debug;

})();

debug = new Debug;

this.UUID = function() {
  var base, microtime, random, ua;
  microtime = (new Date()).getTime().toString(16);
  random = Math.random().toString().replace(/\./, '');
  random = parseInt(random).toString(16);
  ua = navigator.userAgent.replace(/[^0-9]/g, '');
  ua = parseInt(ua).toString(16);
  base = 'S' + microtime + random + ua + microtime + microtime;
  base = [base.substring(0, 8), base.substring(8, 12), base.substring(12, 16), base.substring(16, 20), base.substring(20, 32)];
  return base.join('-');
};

this.isArray = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

this.isFn = function(fn) {
  return typeof fn === "function";
};

this.duration = function(delta) {
  var arr, d;
  d = moment.duration(delta);
  arr = [d.years(), d.months(), d.days(), d.hours(), d.minutes(), d.seconds()];
  while (arr[0] === 0 && arr.length > 2) {
    arr.shift();
  }
  arr = arr.map(function(item) {
    if (item < 10) {
      return '0' + item;
    } else {
      return item;
    }
  });
  return arr.join(' : ');
};

this.base64Encode = function(str) {
  return btoa(unescape(encodeURIComponent(str)));
};

this.base64Decode = function(str) {
  return decodeURIComponent(escape(atob(str)));
};

Install = (function() {

  function Install() {
    this.webapp = "http://app.zenoes.com/clock/clock.webapp";
  }

  Install.prototype.tryit = function() {
    var request,
      _this = this;
    if (navigator.mozApps == null) {
      return;
    }
    request = navigator.mozApps.checkInstalled(this.webapp);
    return request.onsuccess = function() {
      if (request.result) {

      } else {
        return _this.install();
      }
    };
  };

  Install.prototype.install = function() {
    var request;
    request = navigator.mozApps.install(this.webapp);
    request.onsuccess = function() {
      return alert("Welcome to Zeno's Clock App!");
    };
    return request.onerror = function() {
      return alert("Whoops! Fail to Install this app!");
    };
  };

  return Install;

})();

install = new Install;

install.tryit();

Item = (function() {

  function Item() {}

  Item.prototype.add = function(obj, callback) {
    obj.lastaccess = new Date().getTime();
    return db.put('item', obj, callback);
  };

  Item.prototype.get = function(id, callback) {
    if (id === 'root') {
      return callback({
        id: 'root',
        name: 'Clock'
      });
    } else {
      return db.get('item', id, function(item) {
        if (item) {
          return callback(item);
        } else {
          return callback(null);
        }
      });
    }
  };

  Item.prototype.update = function(obj, callback) {
    return db.update('item', obj, callback);
  };

  Item.prototype.parentid = function(id, callback) {
    return this.get(id, function(item) {
      return callback(item && item.parent);
    });
  };

  Item.prototype.parent = function(id, callback) {
    var _this = this;
    return this.parentid(id, function(id) {
      return _this.get(id, function(item) {
        return callback(item);
      });
    });
  };

  Item.prototype.parents = function() {
    var andSelf, callback, id, items, iter, _i,
      _this = this;
    id = arguments[0], andSelf = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), callback = arguments[_i++];
    items = [];
    iter = function(id) {
      return _this.get(id, function(item) {
        if (item != null) {
          items.unshift(item);
        }
        if (item.parent != null) {
          return iter(item.parent);
        } else {
          if (!andSelf[0]) {
            items.pop();
          }
          return callback(items);
        }
      });
    };
    return iter(id);
  };

  Item.prototype.move = function(id, to, callback) {
    return this.update({
      id: id,
      parent: to
    }, callback);
  };

  Item.prototype.remove = function(id, removeChildren, callback) {
    var removeItem, removeItems,
      _this = this;
    removeItem = function(id, callback) {
      return db.remove('item', id, function() {
        return db.get('clock', 'itemid', id, function(items) {
          var ids;
          ids = items.map(function(item) {
            return item.id;
          });
          return db.remove('clock', ids, function() {
            if (isFn(callback)) {
              return callback();
            }
          });
        });
      });
    };
    removeItems = function(ids, callback) {
      var iter;
      iter = function(ids) {
        id = ids.pop();
        if (id != null) {
          removeItem('item', id, function() {});
          return iter(ids);
        } else {
          if (isFn(callback)) {
            return callback();
          }
        }
      };
      return iter(ids);
    };
    if (removeChildren != null) {
      return this.children(id, function(children) {
        return removeItems(children.concat([id]), callback);
      });
    } else {
      return this.parentid(id, function(parentid) {
        return _this.children(id, function(children) {
          children.map(function(child) {
            return _this.move(child.id, parentid);
          });
          return removeItem(id, callback);
        });
      });
    }
  };

  Item.prototype.children = function(id, callback) {
    return db.get('item', 'parent', id, callback);
  };

  Item.prototype.sort = function(items) {
    return items.sort(function(a, b) {
      return b.lastaccess - a.lastaccess;
    });
  };

  return Item;

})();

item = new Item;

end = move = start = {};

count = timeout = null;

document.addEventListener('touchstart', function(event) {
  start = event;
  if (!(start.timeStamp - end.timeStamp < 350)) {
    count = 0;
  }
  if (timeout != null) {
    return clearTimeout(timeout);
  }
});

document.addEventListener('touchmove', function(event) {
  return move = event;
});

document.addEventListener('touchend', function(event) {
  var fn;
  end = event;
  ++count;
  if (end.timeStamp - start.timeStamp < 1) {
    return;
  }
  if (end.timeStamp - start.timeStamp > 600) {
    event = new CustomEvent("taphold", {
      bubbles: true,
      cancelable: true
    });
    return start.target.dispatchEvent(event);
  }
  if (move.timeStamp > start.timeStamp) {
    return;
  }
  event = new CustomEvent("tap" + count, {
    bubbles: true,
    cancelable: true
  });
  fn = function() {
    return start.target.dispatchEvent(event);
  };
  return timeout = setTimeout(fn, 300);
});

Summary = (function() {

  function Summary() {
    this.prefix = "SUMMARY";
  }

  Summary.prototype.display = function(id) {
    var _this = this;
    $('#summary').html('');
    item.get(id, function(item) {
      return _this.show(item);
    });
    return item.children(id, function(children) {
      var child, _i, _len, _results;
      if (!((children != null) && children.length > 0)) {
        return;
      }
      _results = [];
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        child = children[_i];
        _results.push(_this.show(child));
      }
      return _results;
    });
  };

  Summary.prototype.show = function(item) {
    var display, offset,
      _this = this;
    $('#summary').append("<div class=\"item\">" + item.name + "</div>");
    display = function(start, end, text) {
      var elemId;
      elemId = [_this.prefix, start.getTime(), end.getTime(), item.id].join('-');
      $('#summary').append("<div id=\"" + elemId + "\" class=\"sum\">" + text + "</div>");
      return _this.sum(item.id, start.getTime(), end.getTime());
    };
    start = new Date();
    start.setHours(0, 0, 0);
    start.setTime(start.getTime() + config.dayStartAt * 3600 * 1000);
    end = new Date();
    if (start.getTime() > end.getTime()) {
      start.setTime(start.getTime() - 24 * 3600 * 1000);
    }
    display(start, end, 'TODAY');
    end = start;
    start.setTime(start.getTime() - 24 * 3600 * 1000);
    display(start, end, 'YESTODAY');
    start = new Date();
    start.setHours(0, 0, 0);
    offset = start.getDay();
    if (offset === 0) {
      offset = 7;
    }
    start.setTime(start.getTime() - (offset - 1) * 24 * 3600 * 1000);
    end = new Date();
    display(start, end, 'THIS WEEK');
    start = new Date();
    start.setHours(0, 0, 0);
    start.setDate(1);
    end = new Date();
    display(start, end, 'THIS MONTH');
    start = new Date('1970-01-01');
    end = new Date();
    return display(start, end, 'SUM');
  };

  Summary.prototype.sum = function(itemid, start, end) {
    var addToElem, elemId, iter,
      _this = this;
    elemId = [this.prefix, start, end, itemid].join('-');
    addToElem = function(item) {
      return clock.sum(item.id, start, end, function(sum) {
        var jq, ori;
        jq = $('#' + elemId);
        ori = jq.attr('data-sum') || 0;
        sum += parseInt(ori);
        jq.attr('data-sum', sum);
        return jq.attr('data-clock', duration(sum));
      });
    };
    item.get(itemid, function(item) {
      return addToElem(item);
    });
    iter = function(_itemid) {
      return item.children(_itemid, function(children) {
        var child, _i, _len, _results;
        if (!((children != null) && children.length > 0)) {
          return;
        }
        _results = [];
        for (_i = 0, _len = children.length; _i < _len; _i++) {
          child = children[_i];
          addToElem(child);
          _results.push(iter(child.id));
        }
        return _results;
      });
    };
    return iter(itemid);
  };

  return Summary;

})();

summary = new Summary;

clockingUpdate = function() {
  var clockData, clockin, delta, sum;
  sum = parseInt($('.clocking').attr('data-sum'));
  clockin = parseInt($('.clocking').attr('data-clockin'));
  delta = new Date().getTime() - clockin + sum;
  clockData = duration(delta);
  if (sum != null) {
    return $('.clocking').attr('data-clock', clockData);
  }
};

View = (function() {

  function View() {
    setInterval(clockingUpdate, 1000);
  }

  View.prototype.itemHTML = function(obj) {
    return "<li class=\"item\" id=\"" + obj.id + "\">" + obj.name + "</li>";
  };

  View.prototype.append = function(item) {
    return $('#items').append(this.itemHTML(item));
  };

  View.prototype.tree = function(id, callback) {
    var _this = this;
    if (id == null) {
      this.tree('root', callback);
      return;
    }
    this.setUrl("tree/" + id);
    this.updatePath(id);
    $('#items').html('');
    return item.children(id, function(children) {
      children = item.sort(children);
      children.map(function(child) {
        return _this.append(child);
      });
      _this.checkClock();
      if (!$('#tree').is(':visible')) {
        _this.section('tree');
      }
      if (isFn(callback)) {
        return callback();
      }
    });
  };

  View.prototype.currentPath = function() {
    return $('#path ul').find('li').last().attr('id');
  };

  View.prototype.currentItem = function() {
    return this.currentPath();
  };

  View.prototype.updatePath = function(id) {
    return item.parents(id, true, function(items) {
      var html;
      html = items.map(function(item) {
        return "<li id=\"" + item.id + "\">" + item.name + "</li>";
      });
      html = html.join('');
      return $('#path ul').html(html);
    });
  };

  View.prototype.addItem = function() {
    var obj,
      _this = this;
    obj = {};
    obj.name = prompt("Add an Item", "");
    if (!obj.name) {
      return;
    }
    obj.parent = this.currentPath();
    return item.add(obj, function() {
      return _this.refresh();
    });
  };

  View.prototype.rename = function() {
    var obj, oriName;
    obj = {};
    obj.id = this.currentItem();
    oriName = $('#' + obj.id).text();
    obj.name = prompt("New Name for " + oriName, "");
    if (!obj.name) {
      return;
    }
    return item.update(obj);
  };

  View.prototype.removeItem = function(id, msg) {
    var confirm,
      _this = this;
    confirm = window.confirm(msg);
    if (!confirm) {
      return;
    }
    return item.children(id, function(items) {
      var removeChildren;
      if (items.length > 0) {
        removeChildren = window.confirm("Remove all Children?");
      }
      return item.remove(id, removeChildren, function() {
        return _this.refresh();
      });
    });
  };

  View.prototype.setUrl = function(url) {
    var baseUrl;
    baseUrl = window.location.href.split('#')[0];
    url = baseUrl + '#!/' + url;
    return window.history.pushState("Clock", "Clock", url);
  };

  View.prototype.getUrl = function() {
    var path, url;
    url = window.location.href.split('#!/').pop();
    return path = url.split('/');
  };

  View.prototype.refresh = function() {
    var path;
    path = this.getUrl();
    switch (path[0]) {
      case 'tree':
        return this.tree(path[1]);
      default:
        return this.tree('root');
    }
  };

  View.prototype.clockin = function(id) {
    var jq,
      _this = this;
    jq = $('#' + id);
    $('.clocking').removeClass('clocking');
    jq.addClass('clocking');
    jq.attr('data-clockin', new Date().getTime());
    clock.sum(id, 'today', function(sum) {
      return jq.attr('data-sum', sum);
    });
    clock.clockout();
    return clock.clockin(jq.attr('id'));
  };

  View.prototype.clockout = function(id) {
    $('#' + id).removeClass('clocking');
    return clock.clockout();
  };

  View.prototype.clockToggle = function(id) {
    var jq;
    jq = $('#' + id);
    if (jq.hasClass('clocking')) {
      return this.clockout(id);
    } else {
      return this.clockin(id);
    }
  };

  View.prototype.checkClock = function() {
    var current;
    if (!clock.isClocking()) {
      return;
    }
    current = clock.current.itemid;
    return this.clockin(current);
  };

  View.prototype.init = function() {
    if (clock.isClocking()) {
      return this.restore();
    } else {
      return this.tree('root');
    }
  };

  View.prototype.section = function(id) {
    return $('section:visible').fadeOut(function() {
      return $('section#' + id).fadeIn();
    });
  };

  View.prototype.restore = function() {
    var id,
      _this = this;
    id = clock.current.itemid;
    return item.get(id, function(item) {
      if (item != null) {
        return _this.tree(item.parent);
      } else {
        return _this.tree('root');
      }
    });
  };

  View.prototype.summary = function(id) {
    if (id == null) {
      id = view.currentPath();
    }
    this.section('summary');
    return summary.display(id);
  };

  View.prototype.editLogs = function(id) {
    if (id == null) {
      id = view.currentPath();
    }
    this.section('logs');
    return clock.get(id, function(logs) {
      var clockin, clockout, html, log, _i, _len;
      html = '';
      logs = logs.reverse();
      for (_i = 0, _len = logs.length; _i < _len; _i++) {
        log = logs[_i];
        clockin = moment(log.clockin).format("YYYY-MM-DD HH:mm:ss");
        clockout = moment(log.clockout).format("YYYY-MM-DD HH:mm:ss");
        html += "<li id=\"" + log.id + "\" class=\"log\">          <input class=\"clockin\"  value=\"" + clockin + "\">          <input class=\"clockout\"  value=\"" + clockout + "\">          <input type=\"button\" value=\"Remove\" class=\"remove\">          <input type=\"button\" value=\"Edit\" class=\"edit\">          </li>";
      }
      return $('#logs ul').html(html);
    });
  };

  View.prototype.removeLog = function(id) {
    var confirm;
    confirm = window.confirm("Remove this log?");
    if (!confirm) {
      return;
    }
    db.remove('clock', id);
    return $('#' + id).remove();
  };

  View.prototype.editLog = function(id) {
    var clockin, clockout, confirm, jq, msg, obj;
    jq = $('#' + id);
    clockin = moment(jq.find('.clockin').val());
    clockout = moment(jq.find('.clockout').val());
    msg = "Update to: " + clockin.format() + '--' + clockout.format() + ' ?';
    confirm = window.confirm(msg);
    if (confirm == null) {
      return;
    }
    obj = {
      id: id,
      clockin: clockin.valueOf(),
      clockout: clockout.valueOf()
    };
    return db.update('clock', obj);
  };

  View.prototype.exportData = function() {
    return db.get('item', function(items) {
      return db.get('clock', function(clocks) {
        var base64, data, json, mine, obj;
        obj = {
          item: items,
          clock: clocks
        };
        json = JSON.stringify(obj);
        mine = "mime/type";
        base64 = base64Encode(json);
        data = "data:" + mine + ";base64," + base64;
        return window.location.href = data;
      });
    });
  };

  View.prototype.move = function(id, to) {
    var confirm, name,
      _this = this;
    if (!id) {
      id = this.currentPath();
    }
    if (id === to) {
      alert("Could not move to itself!");
      return;
    }
    if (to) {
      name = $('#' + to).text();
      confirm = window.confirm("Move to " + name + "?");
      if (confirm) {
        item.move(id, to, function() {
          "callback";          return _this.refresh();
        });
      }
      window.moveMode = false;
      return this.tree('root');
    } else {
      alert("Go to the tree, and tap on the new parent");
      window.moveMode = true;
      window.moveItem = id;
      return this.tree('root');
    }
  };

  View.prototype.importData = function(file) {
    var reader;
    reader = new FileReader();
    reader.onloadend = function(e) {
      var addCount, confirm, items, log, logs, obj, text, _i, _j, _len, _len1, _results;
      confirm = window.confirm("Make Sure you've backed up your database!");
      if (!confirm) {
        return;
      }
      text = e.target.result;
      obj = JSON.parse(text);
      addCount = function() {
        count = $('#importData').attr('data-count');
        count = parseInt(count) || 0;
        ++count;
        return $('#importData').attr('data-count', count);
      };
      items = obj.item;
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        db.put('item', item, addCount);
      }
      logs = obj.clock;
      _results = [];
      for (_j = 0, _len1 = logs.length; _j < _len1; _j++) {
        log = logs[_j];
        _results.push(db.put('clock', log, addCount));
      }
      return _results;
    };
    return reader.readAsText(file);
  };

  return View;

})();

view = new View;

db.ready(function() {
  return view.init();
});
