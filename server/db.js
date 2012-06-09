var readFile = require("fs").readFile;
var format = require("util").format;
var PgClient = require("pg").Client;
var config = require("./config.js");

// Will hold a cached copy of the raw query
var cachedRawQuery;

// Connect to PostgreSQL
var pgClient = new PgClient(config.pgSettings);

pgClient.connect(function (err) {
    if (err) {
        throw err;
    } else {
        console.log("Connected to PostgreSQL database");
    }
});

// Generate a SQL query that finds the parents of the release group MBID
exports.genQuery = function (mbid) {
    return format(cachedRawQuery, mbid);
};

// Query the database
exports.query = function (query, callback) {
    pgClient.query(query, function (err, result) {
        var labels = [];
        if (!err && result) {
            result.rows.forEach(function (row) {
                labels.push(row);
            });
        }
        callback(labels);
    });
};

// Upon loading of this file, cache the query
readFile("query.sql", "ascii", function(err, rawQuery) {
    if (err) {
        throw err;
    } else {
        cachedRawQuery = rawQuery;
        console.log("Query loaded and cached");
    }
});
