/**
 * @author Corey Farwell <coreyf@rwell.org>
 */

/**
 * @class Core object that controls the RIAARadar website
 */
var RIAARadar = (function () {
    'use strict';

    /**
     * @class Various MusicBrainz related methods
     */
    var MBz = (function () {
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
         */
        Artist.prototype.getReleases = function () {
            console.error('getReleases not implemented yet');
        };

        /**
         * @constructor
         */
        function Release() {
            /**
             * MusicBrainz identifier associated with the release
             * @type string
             */
            this.mbid = '';
        }

        /**
         * Queries the MusicBrainz database for artists
         * @param {string} query Name of the artist to search for
         * @param {function} callback Callback of each Artist
         */
        function artistSearch(query, callback) {
            var mbzSearch = 'http://www.musicbrainz.org/ws/2/artist?query=',
                encodedQuery = encodeURIComponent(query);

            $.ajax({
                url: mbzSearch + encodedQuery,
                dataType: 'xml',
                success: function (data) {
                    $(data).find('artist').each(function (index) {
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
     * Register search button action
     */
    function registerButton() {
        $('#searchbutton').click(function () {
            var query = $('#searchfield').val(),
                resultsList = $("#results");

            if ($.support.cors) {
                resultsList.empty();
                MBz.artistSearch(query, function (artist) {
                    resultsList.append('<li>' + artist.name + '</li>');
                });
            } else {
                alert('Sorry, your browser doesn\'t support CORS');
            }
        });
    }

    return {
        init: function () {
            registerButton();
        }
    };
}());
