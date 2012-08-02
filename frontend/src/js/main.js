require(["musicbrainz", "jquery", "artist", "release"], function (Mbz, $, Artist, Release) {
    var $searchField,
        $searchButton,
        $results;

    // Shows the release groups of the given artist
    var showReleases = function (artist) {
        artist.getReleases(function ($releases) {
            var releases = [],
                groupedRels;
            $results.empty();
            $releases.each(function () {
                releases.push(new Release(this));
            });
            groupedRels = Mbz.groupReleases(releases);
            $.each(groupedRels, function (type, relGroups) {
                $results.append("<h3>" + type + "</h3>");
                $.each(relGroups, function (relGroupMbid, relGroup) {
                    $results.append("<h4>" + relGroup[0].groupTitle + "</h4>");
                    relGroup.forEach(function (rel) {
                        rel.getRiaaPath(function (path) {
                            console.log(rel.title);
                            console.log(path);
                            console.log("--------------");
                        });
                    });
                });
            });
        });
    };

    // Show the artists returned from the search query
    var showArtists = function () {
        var artistQuery = $searchField.val(),
            $thumbnails;
        if (artistQuery.length > 0) {
            $results.empty().append("<ul class='thumbnails'></ul>");
            $thumbnails = $("#results > .thumbnails");
            Mbz.artistSearch(artistQuery, function ($artists) {
                $artists.each(function () {
                    var artist = new Artist(this);
                    var $thumbHtml = $(artist.getThumbnailHtml());
                    $thumbHtml.click(function () {
                        showReleases(artist);
                    });
                    $thumbnails.append($thumbHtml);
                    artist.getImage(function (imageUrl) {
                        $thumbHtml.find('img').attr('src', imageUrl);
                    });
                });
            });
        }
    };

    $(document).ready(function () {
        if ($.support.cors) {
            $searchField = $("#search input").focus();
            $searchButton = $("#search button");
            $results = $("#results");
            $searchButton.click(showArtists);
            $searchField.keyup(function (evt) {
                if (evt.keyCode === 13) {
                    showArtists();
                }
            });
        } else {
            alert("Sorry, your browser doesn't support CORS.");
        }
    });
});
