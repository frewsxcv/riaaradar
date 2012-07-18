// HTTP server

// Imports
var http = require("http");
var urlParse = require("url").parse;

// HTTP server port
var HTTP_PORT = 4567;

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
        // query database here
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
    }).listen(HTTP_PORT, function () {
        console.log("HTTP server listening on port " + HTTP_PORT);
    });
};

// Start server after database is ready
db.init(function () {
    startServer();
});
