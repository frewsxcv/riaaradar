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

    var fetchRiaaPath = function (labelMbid, callback) {
        var query = "/server?mbid=" + labelMbid;
        $.getJSON(query, function (data) {
            var ret = {"msg": "error"};
            if (data.path !== undefined) {
                if (data.path.length === 0) {
                    ret.msg = "no path";
                } else {
                    ret = {"path": data.path};
                }
            }
            callback(ret);
        });
    };

    // TODO: This should take into account multiple labels
    Release.prototype.getRiaaPath = function (callback) {
        if (this.labels.length > 0 && this.labels[0].name !== "[no label]") {
            fetchRiaaPath(this.labels[0].mbid, callback);
        } else {
            callback({"msg": "no labels"});
        }
    };

    return Release;
});
