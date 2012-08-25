require(["musicbrainz", "jquery", "cs!artist", "release", "cs!utils"], function (Mbz, jQuery, Artist, Release, utils) {
    var $ = jQuery,
        $artists,
        $searchButton,
        $top50,
        $navSearch;

    // Shows the release groups of the given artist
    var showReleases = function (artist) {
        artist.getReleases(function ($releases) {
            //console.log($releases);
            /*
            var releases = [],
                groupedRels;
            $results.empty();
            $releases.each(function () {
                releases.push(new Release(this));
            });
            groupedRels = Mbz.groupReleases(releases);
            $.each(groupedRels, function (type, relGroups) {
                $results.append("<h2>" + type + "</h2>");
                $.each(relGroups, function (relGroupMbid, relGroup) {
                    $results.append("<h3>" + relGroup[0].groupTitle + "</h3>");
                    relGroup.forEach(function (rel) {
                        rel.getRiaaPath(function (path) {
                            if (path.hasOwnProperty("path")) {
                                console.log("!!!Affiliated!!!!");
                            }
                            console.log(rel.title);
                            console.log(path);
                            console.log("--------------");
                        });
                    });
                });
            });*/
        });
    };

    var showArtist = function () {
        var artist = new Artist(this),
            $artist = $(artist.toHtml());
        //console.log(artist);
        $artist.click(function () {
            showReleases(artist);
        });
        $artists.append($artist);
        artist.getImage(function (imageUrl) {
            $artist.children('div.image').css('background-image', "url('" + imageUrl + "')");
            utils.getImageDimensions(imageUrl, function (width, height) {
                //console.log("width: " + width);
                //console.log("height: " + height);
                if (width > height) {
                    $artist.children('div.image').css('background-size', "auto 100%");
                } else {
                    $artist.children('div.image').css('background-size', "100% auto");
                }
            });
        });
    };

    // Show the artists returned from the search query
    var showArtists = function (query) {
        $artists.empty();
        Mbz.artistSearch(query, function ($artists) {
            $artists.each(showArtist);
        });
    };

    // Registers events and focuses the search field
    var setUpSearch = function ($search) {
        $search.focus().keyup(function (e) {
            var query = $search.val();
            if (e.keyCode === 13 && query.length > 0) {
                showArtists(query);
            }
        });
    };

    // Cache all the static jQuery queries
    var cache = function () {
        $artists = $("#artists");
    };

    $(function () {
        if (!$.support.cors) {
            alert("Sorry, your browser doesn't support CORS.");
        } else {
            setUpSearch($("#search > input"));
            cache();
        }
    });
});
