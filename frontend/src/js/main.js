require(["musicbrainz", "jquery"], function (MBz, $) {
    var $searchField,
        $searchButton,
        $results;

    // Shows the release groups of the given artist
    var showRelGroups = function (artist) {
        artist.getReleaseGroups(function (relGroups) {
            $results.empty();
            relGroups.sort(function (a, b) {
                return a.year < b.year ? -1 : 1;
            });
            relGroups.forEach(function (relGroup) {
                var $html = $(relGroup.getThumbnailHtml());
                $html.find('img').attr('src', 'http://img.ehowcdn.com/article-new/ehow/images/a07/bg/74/easiest-album-art-itunes-8-800x800.jpg');
                $results.append($html);
            });
        });
    };

    /*
    var meow = function () {
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
        var artistQuery = $searchField.val();
        $results.empty();
        MBz.artistSearch(artistQuery, function (artist) {
            var $thumbHtml = $(artist.getThumbnailHtml());
            $thumbHtml.click(function () {
                showRelGroups(artist);
            });
            $results.append($thumbHtml);
            artist.getImage(function (imageUrl) {
                $thumbHtml.find('img').attr('src', imageUrl);
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
            alert("Sorry, your browser doesn't support CORS");
        }
    });
});
