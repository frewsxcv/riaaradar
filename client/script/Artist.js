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
    $.ajax({
        url: 'http://ws.audioscrobbler.com/2.0/' +
        '?method=artist.getimages' +
        '&mbid=' +
        this.mbid +
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

Artist.prototype.generateResult = function (callback) {
    callback($('<li><div class="results-body">' + this.name + 
        '<br>' + this.disambig + '</div></li>'));
};
