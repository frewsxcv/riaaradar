/**
 * @constructor
 */
var Release = function (jObj) {
    /**
     * Title of the release
     * @type string
     */
    this.title = jObj.children('title').text();

    /**
     * MusicBrainz identifier associated with the release
     * @type string
     */
    this.mbid = jObj.attr('id');

    /**
     * Type of release
     * @type string
     */
    this.type = jObj.attr('type');

    /**
     * Year of release
     * @type integer
     */
    this.year = parseInt(jObj.children('first-release-date').text(), 10);
};
/**
 * @methodOf RIAARadar-MBz-Release
 * @param {function} callback Function to be executed on the
 *     album art URL
 */
Release.prototype.getAlbumArt = function (callback) {
};
/**
 * @methodOf RIAARadar-MBz-Release
 * @param {function} callback Function to be executed on a status
 *     object
 */
Release.prototype.getRiaaStatus = function (callback) {
    $.ajax({
        url: '/server?mbid=' + this.mbid,
        dataType: 'json',
        success: function (status) {
            callback(status);
        }
    });
};
