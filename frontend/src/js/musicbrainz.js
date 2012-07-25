define(["jquery", "artist"], function ($, Artist) {
    var baseAPI = "http://www.musicbrainz.org/ws/2/";

    // Queries the MusicBrainz database for artists
    var artistSearch = function (name, callback) {
        var mbzQuery = baseAPI + 'artist?query=' +
                encodeURIComponent(name) + '&limit=10',
            artists = [];
        $.ajax({
            url: mbzQuery,
            dataType: 'xml',
            success: function (data) {
                $(data).find('artist-list').children(function () {
                });
                $(data).find('artist-list').each(function () {
                    artists.push(new Artist($(this)));
                    callback(new Artist($(this)));
                });
            },
            failure: function () {
                alert('Unable to connect to the MusicBrainz servers');
            }
        });
    };
    
    return {
        artistSearch: artistSearch
    };
});
