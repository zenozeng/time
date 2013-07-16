$('document').ready ->
  $('#path').on 'tap1', 'li', ->
    view.tree $(this).attr('id')
  $('#items').on 'tap1', '.item', ->
    if window.moveMode is on
      view.move window.moveItem, $(this).attr('id')
    else
      view.clockToggle $(this).attr('id')
  $('#items').on 'taphold', '.item', (event) ->
    view.removeItem $(this).attr('id'), "Remove `#{$(this).text()}` ?"
  $('body').on 'tap2', '.item', ->
    view.tree $(this).attr('id')
  $('body').on 'tap3', =>
    view.addItem "inbox"
  $('#tree').on 'swipeleft', ->
    if view.currentPath() == 'root'
      view.section 'config'
    else
      view.section 'operation'
  $('#operation, #config').on 'swiperight', ->
    view.section 'tree'
  $('#tree').on 'swiperight', ->
    view.summary()
  $('#summary').on 'swipeleft', ->
    view.section 'tree'
  $('#rename').click ->
    view.rename()
  $('#editLogs').click ->
    view.editLogs()
  $('#move').click ->
    view.move()
  $('#logs').on 'swipeleft', ->
    view.section 'tree'
  $('#logs').on 'swiperight', ->
    view.section 'tree'
  $('#logs').on 'click', '.remove', ->
    view.removeLog $(this).parent().attr('id')
  $('#logs').on 'click', '.edit', ->
    view.editLog $(this).parent().attr('id')
  $('#exportData').on 'click', ->
    view.exportData()
  $('#dayStartAt').on 'click', ->
    dayStartAt = prompt("Day Start At (current is #{config.dayStartAt}): ")
    return unless dayStartAt
    dayStartAt = parseFloat dayStartAt
    config.set 'dayStartAt', dayStartAt

  # enable swipeleft and swiperight, but scroll up and down.
  $('body').on 'movestart', (e) ->
    if ((e.distX > e.distY && e.distX < -e.distY) || (e.distX < e.distY && e.distX > -e.distY))
      e.preventDefault()


  fileSelect = document.getElementById("importData")
  fileElem = document.getElementById("fileElem")
  fileSelect.addEventListener "click", (e) ->
    fileElem.click();
