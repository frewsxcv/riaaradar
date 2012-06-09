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

// Query the database
exports.query = function (mbid, callback) {
    var query = format(cachedRawQuery, mbid);
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
readFile("query.sql", "ascii", function (err, rawQuery) {
    if (err) {
        throw err;
    } else {
        cachedRawQuery = rawQuery;
        console.log("Query loaded and cached");
    }
});
