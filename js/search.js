/**
 * @author Corey Farwell <coreyf@rwell.org>
 */

/**
 * @class Core object that controls the RIAARadar website
 */
var RIAARadar = (function () {
    'use strict';

    /**
     * @namespace Various MusicBrainz related methods
     */
    var MBz = (function () {

        /**
         * Base URL for the MusicBrainz API
         * @type string
         */
        var baseAPI = "http://www.musicbrainz.org/ws/2/";

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
            var mbzQuery = baseAPI + 'release-group?artist=' + this.mbid;

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
                url: 'http://ws.audioscrobbler.com/2.0/'
                    + '?method=artist.getimages'
                    + '&mbid=' + this.mbid
                    + '&api_key=92ae3bd20202652a8631cf7527555bf2'
                    + '&format=json'
                    + '&limit=1',
                dataType: 'json',
                success: function (data) {
                    if (data.images && data.images.image) {
                        callback(data.images.image.sizes.size[2]['#text']);       
                    }
                }
            });
        };

        /**
         * @constructor
         */
        function Release(jObj) {
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
        }

        /**
         * Queries the MusicBrainz database for artists
         * @param {string} name Name of the artist to search for
         * @param {function} callback Function to be executed for each Artist
         */
        function artistSearch(name, callback) {
            var mbzQuery = baseAPI + 'artist?query=' +
                encodeURIComponent(name) + '&limit=10';

            $.ajax({
                url: mbzQuery,
                dataType: 'xml',
                success: function (data) {
                    $(data).find('artist').each(function () {
                        callback(new Artist($(this)));
                    });
                },
                failure: function () {
                    alert('Unable to connect to the MusicBrainz servers');
                }
            });
        }

        return {
            artistSearch: artistSearch
        };
    }());

    /**
     * Shows the releases of the given artist
     * @param {Artist} artist The artist whose releases will be shown
     */
    function showReleases(artist) {
        var results = $('#results'),
            result;
        artist.getReleases(function (releases) {
            results.empty();
            $.each(releases, function () {
                results.append($('<li>' + this.title + '</li>'));
            });
        });
    }

    function showSearch() {
        var query = $('#search-field').val(),
            results = $('#results');
        // Clear the previous results of the query
        results.empty();
        MBz.artistSearch(query, function (artist) {
            var result = $('<li><div id="results-body">' + artist.name + 
                '<br>' + artist.disambig + '</div></li>');
            result.click(function () {
                showReleases(artist);
            });
            results.append(result);
            artist.getImage(function (image) {
                result.css('background-image', 'url("' + image + '")');
            });
        });
    }

    /**
     * Register actions on the website
     */
    function registerActions() {
        $('#search-button').click(function () {
            showSearch();
        });

        $('#search-field').keypress(function (evt) {
            if (evt.keyCode === 13) {
                showSearch();
            }
        });
    }

    return {
        init: function () {
            if ($.support.cors) {
                registerActions();
            } else {
                alert('Sorry, your browser doesn\'t support CORS');
            }
        }
    };
}());
