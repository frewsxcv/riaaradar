require(["musicbrainz", "jquery", "artist", "release", "lastfm"], function (Mbz, $, Artist, Release, LastFm) {
    var $searchField,
        $searchButton,
        $results,
        $top50,
        $navSearch;


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

    var showLastFmTop50 = function () {
        LastFm.getLastFmTop50(function (tracks) {
            var counter = 1;
            //console.log(tracks);
            $.each(tracks.track, function(index, track){
                console.log(track.name);
                $chartBody.append(['<tr><td>' + (index + 1)+ '</td>',
                                   '<td>' + track.name + '</td>',
                                   '<td>' + track.artist.name + '</td>',
                                   '<td>' + track.playcount+ '</td></tr>',
                                   ].join("") );
            });
        });
    };

    var repopulateChartData = function(chart){
        $("chart-body.tr").remove();
        if (chart.indexOf("billboard") > -1){
            showBillBoardTop200();
        }
    };
    var updateChartSelection = function(selection){
        $("nav nav-pil > *").removeClass("active");
    };


    $(document).ready(function () {
        if ($.support.cors) {
            $('.dropdown-toggle').dropdown()
            $searchField = $("#search input").focus();
            $searchButton = $("#search button");
            $navSearch = $("#nav-search");
            $navBrand = $("a.brand");
            console.log($navBrand);
            $results = $("#results");

            //Charts jQuery
            $navCharts = $("#nav-charts");
            $chartBody = $("#chart-body");
            $lastFmChart = $("#lastFmChart");
            $lastFmButton = $("#lastFmButton");
            $billboardSongDropdown = $("#billboardSongDropdown");
            $billboardAlbumDropdown = $("#billboardAlbumDropdown");

            $searchButton.click(function(){
                showArtists();
            });

            $navSearch.click( function(){
                console.log("nav-search clicked");
                $("#searchPage").show();
                $("#chartsPage").hide();
            });

            $navBrand.click( function(){
                $("#chartsPage").hide();
                $("#searchPage").show();
            });

            $searchField.keyup(function (evt) {
                if (evt.keyCode === 13) {
                    showArtists();
                }
            });

            $billboardSongDropdown.click(function(){
                console.log("billboardSongDropdown selected!");
                updateChartSelection("#billBoardSongDropdown");
            //    $lastFmButton.toggleClass("active");
            });

            $billboardSongDropdown.click(function(){
                console.log("billboardSongDropdown selected!");
                $lastFmButton.toggleClass("active");
            });


            $navCharts.click(function(){

                $("#searchPage").hide();
                $("#chartsPage").show();
                $navSearch.toggleClass("active");
                $navCharts.toggleClass("active");
                showLastFmTop50();
            });
            /*$billboardChart.click(function(){
                populateChartData("#billboardChart");
            });*/
        } else {
            alert("Sorry, your browser doesn't support CORS.");
        }
    });
});
