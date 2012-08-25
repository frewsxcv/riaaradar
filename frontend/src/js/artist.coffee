define ['jquery', 'cs!lastfm', 'musicbrainz'], ($, LastFm, MBz) ->

  class Artist
    constructor: (artistXml) ->
      $artistXml = $ artistXml

      @mbid = $artistXml.attr("id")
      @name = $artistXml.children("name").text()
      @disambig = $artistXml.children("disambiguation").text()

    getReleases: (callback) =>
      MBz.getReleases @mbid, ($releases) ->
        callback $releases

    getImage: (callback) =>
      LastFm.getArtistImage(@mbid, callback)

    toHtml: ->
      """
      <li class='artist'>
        <div class='image'></div>
        <div class='text'>
          <div class='title'>#{ @name }</div>
          <div class='disambig'>#{ @disambig }</div>
          <div class='info'></div>
          <div class='tags'></div>
        </div>
      </li>
      """
