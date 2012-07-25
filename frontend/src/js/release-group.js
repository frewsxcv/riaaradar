define(["lastfm", "jquery"], function (LastFm, $) {

    // MusicBrainz release group from API
    var ReleaseGroup = function ($mbRelGroup) {
        // Title of the release
        this.title = $mbRelGroup.children('title').text();

        // MusicBrainz identifier associated with the release
        this.mbid = $mbRelGroup.attr('id');

        // Type of release
        this.type = $mbRelGroup.attr('type');

        // Year of release
        this.year = parseInt($mbRelGroup.children('first-release-date').text(), 10);
    };

    ReleaseGroup.prototype.getAlbumArt = LastFm.getAlbumArt;

    ReleaseGroup.prototype.getRiaaStatus = function (callback) {
        /*
        if (ReleaseGroup.prototype.lastSent === undefined) {
            ReleaseGroup.prototype.lastSent = (new Date()).getTime();
            console.log("sending at: " + ReleaseGroup.prototype.lastSent);
        } else {
            var delta = ((new Date()).getTime() - ReleaseGroup.prototype.lastSent);
            if (delta < 1000) {
                ReleaseGroup.prototype.lastSent += 1000;
                console.log("delta: " + delta);
                console.log("diff: " + (1000 - delta));
            } else {
                ReleaseGroup.prototype.lastSent += delta;
            }
            console.log("sending at: " + ReleaseGroup.prototype.lastSent);
            var delta = 1000 - ((new Date()).getTime() - ReleaseGroup.prototype.lastSent);
            console.log("Delta: " + delta);
        }
        */

        /*
        $.ajax({
            url: "http://musicbrainz.org/ws/2/release?release-group=" + this.mbid + "&inc=labels",
            dataType: 'xml',
            success: function (data) {
                $(data).find("release").each(function () {
                });
            },
            failure: function () {
                alert('Unable to connect to the MusicBrainz servers');
            }
        });
        */
        callback({"name": "meow"});
        /*
        $.ajax({
            url: '/server?mbid=' + this.mbid,
            dataType: 'json',
            success: function (status) {
                callback(status);
            }
        });
        */
    };

    ReleaseGroup.prototype.getThumbnailHtml = function () {
        var html = [
            "<li class='span3'>",
            "<div class='thumbnail'>",
            "<img src='style/img/noartist.png' alt=''>",
            "<div class='caption'>",
            this.title,
            "</div></div></li>"
        ].join("");
        return html;
    };

    return ReleaseGroup;
});
