require(["musicbrainz", "jquery"], function(MBz, $) {
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
        MBz.artistSearch(query, function (artist) {
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
        $("#search-button").click(showSearch);
        var searchButton = document.getElementById('search-button'),
            searchField = document.getElementById('search-field');
        searchButton.addEventListener('click', showSearch);
        searchField.addEventListener('keyup', function (evt) {
            if (evt.keyCode === 13) {
                showSearch();
            }
        });
    }

    // Transition this out after complete transition to rwell
    if ($.support.cors) {
        $(document).ready(function () {
            registerActions();
            $("#search-field").focus();
        });
    } else {
        alert('Sorry, your browser doesn\'t support CORS');
    }
});
