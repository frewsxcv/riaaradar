define(["jquery"], function ($) {
    var baseApi = "http://www.musicbrainz.org/ws/2/";

    var queryMusicbrainz = function (query, callback) {
        $.ajax({
            url: query,
            dataType: 'xml',
            //headers: {'User-Agent': 'RIAA Radar/0.1 Alpha (founders@frelsi.org)'},
            success: callback,
            failure: function () {
                alert('Unable to connect to the MusicBrainz servers');
            }
        });
    };

    // Queries the MusicBrainz database for artists
    var artistSearch = function (name, callback) {
        var query = baseApi + 'artist?query=' + encodeURIComponent(name) + '&limit=10',
            artists = [];
        queryMusicbrainz(query, function (data) {
            var $artists = $(data).find('artist-list').children();
            callback($artists);
        });
    };

    // Get the releases of a specific release group
    // TODO: This only gets the first page of results (100 releases)
    var getReleases = function (relGroupMbid, callback) {
        var query = baseApi + "release?artist=" + relGroupMbid + "&limit=100&inc=labels+release-groups";
        queryMusicbrainz(query, function (data) {
            var $releases = $(data).find('release-list').children();
            callback($releases);
        });
    };

    var groupReleases = function (releases) {
        var groupedRels = {},
            key;
        releases.forEach(function (rel) {
            if (!groupedRels.hasOwnProperty(rel.type)) {
                groupedRels[rel.type] = {};
            }
            if (!groupedRels[rel.type].hasOwnProperty(rel.groupMbid)) {
                groupedRels[rel.type][rel.groupMbid] = [];
            }
            groupedRels[rel.type][rel.groupMbid].push(rel);
        });
        return groupedRels;
    };
   

    return {
        artistSearch: artistSearch,
        getReleases: getReleases,
        groupReleases: groupReleases
    };
});
