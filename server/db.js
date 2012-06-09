var readFile = require("fs").readFile;
var format = require("util").format;

// Will hold a cached copy of the raw query
var cachedRawQuery;

// Upon loading of this file, cache the query
readFile("query.sql", "ascii", function(err, rawQuery) {
    if (err) {
        throw err;
    } else {
        cachedRawQuery = rawQuery;
        console.log("Query loaded and cached");
    }
});

// Generate a SQL query that finds the parents of the release group MBID
exports.genQuery = function (mbid) {
    return format(cachedRawQuery, mbid);
};
