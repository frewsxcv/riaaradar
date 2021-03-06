define(["jquery"], function ($) {
    var apiKey = "92ae3bd20202652a8631cf7527555bf2";

    var getArtistImage = function (mbid, callback) {
        var defaultImage = "http://img.ehowcdn.com/article-new/ehow/images/a07/bg/74/easiest-album-art-itunes-8-800x800.jpg";
        $.ajax({
            url: [
                "http://ws.audioscrobbler.com/2.0/",
                "?method=artist.getinfo",
                "&mbid=" + mbid,
                "&api_key=" + apiKey,
                "&format=json",
                "&limit=1"
            ].join(""),
            dataType: "json",
            success: function (data) {
                var ndx;
                if (!data.artist) {
                    callback(defaultImage);
                    return;
                }
                for (ndx = 4; ndx > 0; ndx -= 1) {
                    if (data.artist.image[ndx]["#text"].length > 0) {
                        callback(data.artist.image[ndx]["#text"]);
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

    var getAlbumArt = function (callback) {
        return "style/img/noartist.png";
    };

    var getTop50 = function(callback){
        $.ajax({
            url: [
                "http://ws.audioscrobbler.com/2.0/",
                "?method=chart.getTopTracks",
                "&api_key=" + apiKey,
                "&format=json",
                "&limit=50"
            ].join(""),
            dataType: "json",
            success: function(data){
                callback(data.tracks.track);
            },
            failure: function () {
                console.error("FAIL");
            }
        });
    };

    return {
        getArtistImage: getArtistImage,
        getAlbumArt: getAlbumArt,
        getTop50: getTop50
    };
});
