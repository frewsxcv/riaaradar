define ["jquery"], ($) ->

  getImageDimensions = (src, callback) ->
    img = new Image()
    img.onload = ->
      callback(@width, @height)
    img.src = src

  getImageDimensions: getImageDimensions
