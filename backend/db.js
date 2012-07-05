var readFile = require("fs").readFile;
var format = require("util").format;
var PgClient = require("pg").Client;
var config = require("./config.js");

// Will hold a cached copy of the raw query
var cachedRawQuery;

// Create PostgreSQL client
var pgClient = new PgClient(config.pgSettings);

// Load the query from the file and cache it
var loadRawQuery = function (callback) {
    readFile("query.sql", "ascii", function (err, rawQuery) {
        if (err) {
            throw err;
        } else {
            cachedRawQuery = rawQuery;
            callback();
        }
    });
};

// Initialize Postgres connection
var connectDB = function (callback) {
    pgClient.connect(function (err) {
        if (err) {
            throw err;
        } else {
            callback();
        }
    });
};

// Query the database
var query = function (mbid, callback) {
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

// Initialize database components
var init = function (callback) {
    loadRawQuery(function () {
        connectDB(function () {
            console.log("Connected to database");
            callback();
        });
    });
};

exports.query = query;
exports.init = init;
