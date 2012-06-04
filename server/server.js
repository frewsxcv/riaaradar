var http = require("http");
var urlParse = require("url").parse;
var PgClient = require("pg").Client; 
var format = require("util").format;
var riaaLabels = require("./riaa.js").labels;
var config = require("./config.js");
var genQuery = require("./query.js").genQuery;

// Connect to PostgreSQL
var pgClient = new PgClient(config.pgSettings);

var getLabels = function (mbid, callback) {
    var query = genQuery(mbid);
    pgClient.query(query, function (err, result) {
        var labels = [];
        if (!err && result) {
            result.rows.forEach(function(row) {
                labels.push(row);
            });
        }
        callback(labels);
    });
};

var startServer = function () {
    http.createServer(function (req, res) {
        var mbid = urlParse(req.url, true).query.mbid;
        res.writeHead(200, {'Content-Type': 'application/json'});
        if (mbid) {
            getLabels(mbid, function (labels) {
                var results = [];
                labels.forEach(function (label) {
                    var result = {
                        "mbid": label.gid,
                        "name": label.name,
                        "prevRel": label.prev_rel,
                        "riaa": label.gid in riaaLabels 
                    };
                    if (result.prevRel !== "source label") {
                        result.prevMbid = label.prev_gid;
                    }
                    results.push(result);
                });
                console.log(JSON.stringify(results));
                res.end(JSON.stringify(results), "ascii");
            });
        } else {
            res.end(JSON.stringify({
                error: "mbid not specified"
            }), "ascii");
        }
    }).listen(config.httpPort, function () {
        console.log("HTTP server listening on port " + config.httpPort + "\n");
    });
};

pgClient.connect(function (err) {
    if (err) {
        throw err;
    } else {
        startServer();
    }
});
