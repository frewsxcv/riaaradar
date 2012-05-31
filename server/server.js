var http = require("http");
var url = require("url");
var PgClient = require("pg").Client; 
var readFile = require("fs").readFile;
var format = require("util").format;
var riaaLabels = require("./riaa.js").labels;
var config = require("./config.js");

// Connect to PostgreSQL
var pgClient = new PgClient(config.pgSettings);

// Get the SQL query
var getRawQuery = function (callback) {
    readFile("query.sql", "ascii", function(err, rawQuery) {
        if (err) {
            throw err;
        } else {
            callback(rawQuery);
        }
    });
};

var startServer = function (rawQuery) {
    var getLabels = function (mbid, callback) {
        var query = format(rawQuery, mbid);
        var pgQuery = pgClient.query(query, function (err, result) {
            var labels = [];
            if (!err && result) {
                result.rows.forEach(function(row) {
                    labels.push(row);
                });
            }
            callback(labels);
        });
    };

    http.createServer(function (req, res) {
        var mbid = url.parse(req.url, true).query.mbid;
        res.writeHead(200, {'Content-Type': 'application/json'});
        if (mbid) {
            getLabels(mbid, function (labels) {
                var result = { mbid: null };
                labels.forEach(function (label) {
                    if (label.gid in riaaLabels) {
                        result.mbid = label.gid;
                        result.name = label.name;
                    }
                });
                res.end(JSON.stringify(result), "ascii");
            });
        } else {
            res.end(JSON.stringify({
                error: "mbid not specified"
            }), "ascii");
        }
    }).listen(config.httpPort);

};

pgClient.connect(function (err) {
    if (err) {
        throw err;
    } else {
        getRawQuery(function (rawQuery) {
            startServer(rawQuery);
        });
    }
});
