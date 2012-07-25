require(["musicbrainz", "jquery"], function (MBz, $) {
    var $searchField,
        $searchButton,
        $results;

    // Shows the release groups of the given artist
    var showRelease = function (relGroup) {
        relGroup.getReleases(function (releases) {
            $results.empty();
            releases.forEach(function (release) {
                release.getRiaaPath(function (path) {
                    $results.append("<h3>" + release.title + "</h3><p>");
                    if (path.length === 0) {
                        $results.append("<span class='label label-success'>No path to RIAA member found</span>");
                    }
                    path.forEach(function (label, ndx) {
                        if (ndx === path.length - 1) {
                            $results.append("<span class='label label-important'>" + label.name + "</span> (<a href='" + label.sourceUrl + "'>source</a>)");
                        } else {
                            $results.append("<span class='label'>" + label.name + "</span>");
                        }
                        if (label.parentRel !== undefined) {
                            $results.append("---" + label.parentRel + "-->");
                        }
                    });
                    $results.append("</p>");
                });
            });
        });
    };

    // Shows the release groups of the given artist
    var showRelGroups = function (artist) {
        artist.getReleaseGroups(function (relGroupsMap) {
            var $thumbnails;
            $results.empty();
            $.each(relGroupsMap, function (type, relGroups) {
                $results.append("<h1>" + type + "</h1><ul class='thumbnails'></ul>");
                $thumbnails = $("#results > .thumbnails:last");
                relGroups.forEach(function (relGroup) {
                    var $thumbHtml = $(relGroup.getThumbnailHtml());
                    $thumbHtml.find('img').attr('src', 'http://img.ehowcdn.com/article-new/ehow/images/a07/bg/74/easiest-album-art-itunes-8-800x800.jpg');
                    $thumbHtml.click(function () {
                        showRelease(relGroup);
                    });
                    $thumbnails.append($thumbHtml);
                });
            });
        });
    };

    /*
    meow = function () {
        var $container = $('.thumbnails');
        $container.imagesLoaded(function () {
            $container.masonry({
                itemSelector : '.span3'
            });
        });
    };
    */

    /*
    function init_masonry(){
        var $container = $('#content');

        var gutter = 12;
        var min_width = 150;
        $container.imagesLoaded( function(){
            $container.masonry({
                itemSelector : '.box',
                gutterWidth: gutter,
                isAnimated: true,
                  columnWidth: function( containerWidth ) {
                    var num_of_boxes = (containerWidth/min_width | 0);

                    var box_width = (((containerWidth - (num_of_boxes-1)*gutter)/num_of_boxes) | 0) ;

                    if (containerWidth < min_width) {
                        box_width = containerWidth;
                    }

                    $('.box').width(box_width);

                    return box_width;
                  }
            });
        });
    }
     */

    // Show the artists returned from the search query
    var showArtists = function () {
        var artistQuery = $searchField.val(),
            $thumbnails;
        $results.empty().append("<ul class='thumbnails'></ul>");
        $thumbnails = $("#results > .thumbnails");
        MBz.artistSearch(artistQuery, function (artists) {
            artists.forEach(function (artist) {
                var $thumbHtml = $(artist.getThumbnailHtml());
                $thumbHtml.click(function () {
                    showRelGroups(artist);
                });
                $thumbnails.append($thumbHtml);
                artist.getImage(function (imageUrl) {
                    $thumbHtml.find('img').attr('src', imageUrl);
                });
            });
        });
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
