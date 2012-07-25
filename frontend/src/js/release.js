define(["lastfm", "jquery"], function (LastFm, $) {

    // MusicBrainz release group from API
    var Release = function ($mbRelease) {
        // Title of the release
        this.title = $mbRelease.children('title').text();

        // MusicBrainz identifier associated with the release
        this.mbid = $mbRelease.attr('id');

        // Type of release
        this.country = $mbRelease.children('country');

        this.labelMbid = $mbRelease.find("label").attr("id");
    };

    Release.prototype.getAlbumArt = LastFm.getAlbumArt;

    Release.prototype.getRiaaPath = function (callback) {
        var query = "/server?mbid=" + this.labelMbid;
        $.ajax({
            url: query,
            dataType: "json",
            success: function (data) {
                if (data.path !== undefined) {
                    callback(data.path);
                }
            },
            failure: function () {
                alert("Unable to connect to the RIAA Radar servers");
            }
        });

    };

    return Release;
});
