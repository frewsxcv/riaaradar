define(["jquery"], function ($) {
    /**
     * @methodOf RIAARadar-MBz-Artist
     * @param {String} callback Function to be executed on the image URL
     * @param {function} callback Function to be executed on the image URL
     */
    var artistImage = function (mbid, callback) {
        $.ajax({
            url: 'http://ws.audioscrobbler.com/2.0/' +
            '?method=artist.getimages' +
            '&mbid=' + mbid +
            '&api_key=92ae3bd20202652a8631cf7527555bf2' +
            '&format=json' +
            '&limit=1',
            dataType: 'json',
            success: function (data) {
                if (data.images && data.images.image) {
                    callback(data.images.image.sizes.size[2]['#text']);       
                }
            }
        });
    };

    var albumArt = function (callback) { }

    return {
        artistImage: artistImage,
        albumArt: albumArt
    }
});
