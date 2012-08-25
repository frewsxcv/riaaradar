define ['jquery'], ($) ->
  apiKey = '92ae3bd20202652a8631cf7527555bf2'

  getArtistImage = (mbid, callback) ->
    query = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&mbid=#{ mbid }&api_key=#{ apiKey }&format=json&limit=1"
    defaultImg = 'img/noartistimg.jpg'
    $.ajax query,
      type: 'GET'
      dataType: 'jsonp'
      success: (data) ->
        imgs = data.artist?.image[..2].reverse()
        for img in imgs
          break if artistImg = img['#text']
        callback artistImg or defaultImg
      failure: ->
        callback defaultImg

  getArtistImage: getArtistImage
