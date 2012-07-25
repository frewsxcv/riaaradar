define(["jquery"], function ($) {
    var getArtistImage = function (mbid, callback) {
        var defaultImage = "http://img.ehowcdn.com/article-new/ehow/images/a07/bg/74/easiest-album-art-itunes-8-800x800.jpg";
        $.ajax({
            url: 'http://ws.audioscrobbler.com/2.0/' +
                '?method=artist.getinfo' +
                '&mbid=' + mbid +
                '&api_key=92ae3bd20202652a8631cf7527555bf2' +
                '&format=json' +
                '&limit=1',
            dataType: 'json',
            success: function (data) {
                var ndx;
                if (!data.artist) {
                    callback(defaultImage);
                    return;
                }
                for (ndx = 4; ndx > 0; ndx -= 1) {
                    if (data.artist.image[ndx]['#text'].length > 0) {
                        callback(data.artist.image[ndx]['#text']);
                        return;
                    }
                }
                callback(defaultImage);
            },
            failure: function () {
                callback(defaultImage);
            }
        });
    };

    var getAlbumArt = function (callback) { };

    return {
        getArtistImage: getArtistImage,
        getAlbumArt: getAlbumArt
    };
});
