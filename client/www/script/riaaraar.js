/**
 * Queries the MusicBrainz database for artists
 * @param {string} name Name of the artist to search for
 * @param {function} callback Function to be executed for each Artist
 */
function artistSearch(name, callback) {
    var baseAPI = "http://www.musicbrainz.org/ws/2/",
        mbzQuery = baseAPI + 'artist?query=' +
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


/**
 * Shows the releases of the given artist
 * @param {Artist} artist The artist whose releases will be shown
 */
function showReleases(artist) {
    var results = $('#results'),
        result;
    artist.getReleases(function (releases) {
        results.empty();
        releases.sort(function (a, b) {
            return a.year < b.year ? -1 : 1;
        });

        $.each(releases, function () {
            this.generateResult(function (result) {
                results.append(result);
            });
        });
    });
}

function showSearch() {
    var query = $('#search-field').val(),
        results = $('#results');
    // Clear the previous results of the query
    results.empty();
    artistSearch(query, function (artist) {
        artist.generateResult(function (result) {
            result.click(function () {
                showReleases(artist);
            });
            results.append(result);
            artist.getImage(function (image) {
                result.css('background-image', 'url("' + image + '")');
            });
        });
    });
}

/**
 * Register actions on the website
 * TODO: Reimplement in jQuery
 */
function registerActions() {
    var searchButton = document.getElementById('search-button'),
        searchField = document.getElementById('search-field');
    searchButton.addEventListener('click', showSearch);
    searchField.addEventListener('keyup', function (evt) {
        if (evt.keyCode === 13) {
            showSearch();
        }
    });
}
