define(["lastfm", "jquery", "label"], function (LastFm, $, Label) {
    // MusicBrainz release group from API
    var Release = function (mbRelease) {
        var $mbRelease = $(mbRelease);

        // Title of the release
        this.title = $mbRelease.children("title").text();

        // MusicBrainz identifier associated with the release
        this.mbid = $mbRelease.attr("id");

        // Country of release
        this.country = $mbRelease.children("country").text();

        // Type of release
        this.type = $mbRelease.children("release-group").attr("type");

        // MBID of release group of this release
        this.groupMbid = $mbRelease.children("release-group").attr("id");

        // Title of release group of this release
        this.groupTitle = $mbRelease.children("release-group").children("title").text();

        // Primary type
        // Do I need to implement this?

        // Secondary type
        // Do I need to implement this?

        // Music labels released under
        var labels = [];
        $mbRelease.find("label-info").each(function () {
            labels.push(new Label(this));
        });
        this.labels = labels;
    };

    Release.prototype.getAlbumArt = function () {
        LastFm.getAlbumArt(this.mbid);
    };

    Release.prototype.getRiaaPath = function (callback) {
        var query = "/server?mbid=" + this.labels[0].mbid;
        console.log(query);
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
