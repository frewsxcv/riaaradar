var http = require("http");
var urlParse = require("url").parse;
var format = require("util").format;
var riaaLabels = require("./riaa.js").labels;
var config = require("./config.js");
var db = require("./db.js");

var getLabels = function (mbid, callback) {
    var query = db.genQuery(mbid);
    // put query.query() here
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
                        "riaa": riaaLabels.hasOwnProperty(label.gid)
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
        console.log("HTTP server listening on port " + config.httpPort);
    });
};

startServer();
