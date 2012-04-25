define(["jquery", "Artist"], function ($, Artist) {
    /**
     * Queries the MusicBrainz database for artists
     * @param {string} name Name of the artist to search for
     * @param {function} callback Function to be executed for each Artist
     */
    var artistSearch = function (name, callback) {
        var baseAPI = "http://www.musicbrainz.org/ws/2/",
            mbzQuery = baseAPI + 'artist?query=' +
            encodeURIComponent(name) + '&limit=10';

        console.log($);

        $.ajax({
            url: mbzQuery,
            dataType: 'xml',
            success: function (data) {
                $(data).find('artist').each(function () {
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
    }
});
