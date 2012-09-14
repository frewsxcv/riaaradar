status = undefined

utils = do ->
  preloadImg = (src, callback) ->
    img = new Image()
    img.onload = ->
      callback(img)
    img.src = src

  preloadImg: preloadImg


MBz = do ->
  base = 'http://www.musicbrainz.org/ws/2/'

  get = (query, callback) ->
    query = base + query
    $.ajax query,
      dataType: 'xml'
      #headers:
      #'User-Agent': 'RIAA Radar/0.1 Alpha (founders@frelsi.org)'
      success: callback
      failure: ->
        alert 'Unable to conect to the MusicBrainz servers'

  artistSearch: (artist, callback) ->
    artist = encodeURIComponent(artist)
    query = "artist?query=#{ artist }&limit=10"
    get query, (data) ->
      callback $(data).find('artist-list').children()

  getReleases: (relGroupMbid, callback) ->
    rels = []
    offset = 0
    query = "release?artist=#{relGroupMbid}&limit=100&offset=#{offset}&inc=labels+release-groups"
    status.show 'Getting releases'
    loop
      get query, (data) ->
        status.hide()
        relList = $(data).find('release-list')
        Math.ceil relList.attr('count')/100
        for xml in relList.children()
          rels.push new Release(xml)
        callback rels


LastFm = do ->
  key = '92ae3bd20202652a8631cf7527555bf2'
  base = 'http://ws.audioscrobbler.com/2.0/'

  getArtistImage: (mbid, callback) ->
    query = base + "?method=artist.getinfo&mbid=#{mbid}&api_key=#{key}&format=json&limit=1"
    defaultImg = 'img/noartistimg.jpg'
    $.ajax query,
      type: 'GET'
      dataType: 'jsonp'
      success: (data) ->
        imgs = data.artist?.image[..2].reverse()
        for img in imgs
          artistImg = img['#text']
          break if artistImg
        if artistImg
          callback artistImg

  getAlbumArt: (callback) ->
    callback 'img/noartist.png'

  getTop50: (callback) ->
    query = base + "?method=chart.getTopTracks&api_key=#{key}&format=json&limit=50"
    $.ajax query,
      type:'GET'
      dataType: 'jsonp'
      success: (data) ->
        callback data.tracks.track
      failure:
        console.error 'FAIL'


class Label
  constructor: (xml) ->
    $xml = $(xml)
    @mbid = $xml.attr('id')
    @name = $xml.children('name').text()

  equals: (label) ->
    @mbid == label.mbid and @name == label.name

  # TODO: Cache the path
  getRiaaPath: (callback) ->
    query = "/server?mbid=#{@mbid}"
    $.ajax query,
      dataType: 'json'
      success: (data) ->
        if data.path
          callback data.path
      failure: ->
        alert "Unable to connect to the RIAA Radar server"


###
Represents an artist in the RIAA Radar search
###
class Artist

  ###
  Constructs an Artist using the data from the Last.fm API
  Input: XML of a single artist from the Last.fm API
  ###
  constructor: (xml) ->
    $xml = $(xml)
    @mbid = $xml.attr('id')
    @name = $xml.children('name').text()
    @disambig = $xml.children('disambiguation').text()

  getReleaseManager: (callback) =>
    rm = new ReleaseManager
    status.show 'Querying MusicBrainz...'
    MBz.getReleases @mbid, (releases) ->
      rm.addReleases releases
      callback rm

  getImage: (callback) =>
    LastFm.getArtistImage(@mbid, callback)

  toHtml: ->
    """
    <li class='artist'>
      <div class='artist-img'></div>
      <div class='default-img'></div>
      <div class='text'>
        <div class='title'>#{ @name }</div>
        <div class='disambig'>#{ @disambig }</div>
        <div class='info'></div>
        <div class='tags'></div>
      </div>
    </li>
    """


class Release
  constructor: (xml) ->
    $xml = $(xml)

    @mbid = $xml.attr('id')
    @title = $xml.children('title').text()
    @type = $xml.children('release-group').attr('type')
    @labels = (new Label(xml) for xml in $xml.find('label'))

    group = $xml.children('release-group')
    @groupMbid = group.attr('id')
    @groupTitle = group.children('title').text()
    @groupDisambig = group.children('disambiguation').text()
    @groupType = group.find('secondary-type').text() or group.children('primary-type').text()


class ReleaseGroup
  constructor: (rel) ->
    @rels = [rel]  # is this necessary?
    @labels = []
    @mbid = rel.groupMbid
    @title = rel.groupTitle
    @type = rel.groupType
    @disambig = rel.groupDisambig

  # TODO: This could be cleaner
  addLabels: (newLabels) ->
    for newLabel in newLabels
      inCurr = false
      for currLabel in @labels
        if newLabel.equals(currLabel)
          inCurr = true
          break
      if not inCurr
        @labels.push newLabel

  addRelease: (rel) ->
    @rels.push rel
    @addLabels rel.labels

  toHtml: ->
    """STUFF HERE"""


class ReleaseManager
  constructor: ->
    @groups = {}
    @types = []

  addReleases: (releases) ->
    for rel in releases
      if rel.groupType not in @types
        @types.push rel.groupType
      if rel.groupMbid not of @groups
        @groups[rel.groupMbid] = new ReleaseGroup(rel)
      @groups[rel.groupMbid].addRelease(rel)

  getGroupsByType: (type) ->
    group for mbid, group of @groups when group.type == type


######################################################
######################################################
######################################################


class Search
  constructor: ->
    @$input = $ 'input'
    @$artists = $ '#artists'
    @$groups = $ '#release-groups'

  setUpSearch: ->
    # Set up search
    @$input.focus().keyup (e) =>
      query = @$input.val()
      if e.keyCode == 13 and query.length
        @showArtists query

  showArtist: (artist) ->
    $artist = $(artist.toHtml())
    $artist.click =>
      @showReleases(artist)
    @$artists.append $artist
    artist.getImage (src) ->
      utils.preloadImg src, (img) ->
        size = if img.width > img.height then 'auto 100%' else '100% auto'
        $artist.children('.artist-img').css
          'background-image': "url(#{ src })"
          'background-size': size
        $artist.children('.default-img').fadeOut(200)

  showArtists: (artistQuery) ->
    @$artists.empty()
    @$groups.empty()
    status.show 'Querying MusicBrainz...'
    MBz.artistSearch artistQuery, (artistsXml) =>
      status.hide()
      if artistsXml.length == 0
        console.log 'NO ARTISTS FOUND'
      for artistXml in artistsXml
        artist = new Artist(artistXml)
        @showArtist artist

  showReleases: (artist) ->
    @$artists.empty()
    @$groups.empty()
    artist.getReleaseManager (rm) =>
      for type in rm.types
        $rels = $ '<ol>'
        @$groups.append "<li>#{type}</li>"
        for group in rm.getGroupsByType(type)
          $rels.append "<li>&nbsp;&nbsp;#{group.title}</li>"
          for label in group.labels
            label.getRiaaPath (path) ->
              console.log label.name, path
              console.log '---------------------------------'
        @$groups.append $rels


class Status
  constructor: ->
    @$status = $ '#status'

  show: (str, time) ->
    @$status.text str
    @$status.slideDown 150
    if @timeoutId
      clearTimeout @timeoutId
    if time
      @timeoutId = setTimeout (=> @hide()), time

  hide: ->
    @$status.slideUp 150, =>


$ ->
  status = new Status
  if !$.support.cors
    status.show("Sorry, your browser doesn't support CORS, which is required to use this site.")
  else
    search = new Search()
    search.setUpSearch()

