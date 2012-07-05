// HTTP server

var http = require("http");
var urlParse = require("url").parse;
var format = require("util").format;
var riaaLabels = require("./riaa.js").labels;
var config = require("./config.js");
var db = require("./db.js");

// Respond to an invalid request
var respondToInvalidReq = function (res) {
    res.writeHead(400, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
        error: "mbid not specified"
    }), "ascii");
};

// Respond to a valid request
var respondToValidReq = function (mbid, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    db.query(mbid, function (labels) {
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
};

// Start the HTTP server
var startServer = function () {
    http.createServer(function (req, res) {
        var mbid = urlParse(req.url, true).query.mbid;
        if (mbid) {
            respondToValidReq(mbid, res);
        } else {
            respondToInvalidReq(res);
        }
    }).listen(config.httpPort, function () {
        console.log("HTTP server listening on port " + config.httpPort);
    });
};

// Start server after database is ready
db.init(function () {
    startServer();
});
