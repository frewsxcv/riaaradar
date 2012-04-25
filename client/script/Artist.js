define(["Release", "lastfm", "jquery"], function(Release, lastfm, $) {
    /**
     * @constructor
     * @param {jQuery object} jObj MusicBrainz artist from API
     */
    function Artist(jObj) {
        /** 
         * Name of the artist 
         * @type string 
         */
        this.name = jObj.children('name').text();

        /**
         * MusicBrainz identifier associated with the artist
         * @type string
         */
        this.mbid = jObj.attr('id');

        /**
         * Disambiguation comment to help distinguish identically named
         *     artists
         * @type string
         */
        this.disambig = jObj.children('disambiguation').text();
    }
    /**
     * @methodOf RIAARadar-MBz-Artist
     * @param {function} callback Function to be executed on the Releases
     */
    Artist.prototype.getReleases = function (callback) {
        var baseAPI = "http://www.musicbrainz.org/ws/2/",
            mbzQuery = baseAPI + 'release-group?artist=' + this.mbid;

        $.ajax({
            url: mbzQuery,
            dataType: 'xml',
            success: function (data) {
                var releases = [];
                $(data).find('release-group').each(function () {
                    releases.push(new Release($(this)));
                });
                callback(releases);
            },
            failure: function () {
                alert('Unable to connect to the MusicBrainz servers');
            }
        });
    };
    /**
     * @methodOf RIAARadar-MBz-Artist
     * @param {function} callback Function to be executed on the image URL
     */
    Artist.prototype.getImage = function (callback) {
        lastfm.artistImage(this.mbid, callback);
    }

    Artist.prototype.generateResult = function (callback) {
        callback($('<li><div class="results-body">' + this.name + 
            '<br>' + this.disambig + '</div></li>'));
    };

    return Artist;
});
