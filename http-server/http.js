// HTTP server

// Imports
var http = require("http");
var urlParse = require("url").parse;
var riaaTree = require("../riaa-tree/dist/riaaTree.js").riaaTree;

// HTTP server port
var httpPort = 4567;

// Respond to a valid request
var generateBody = function (mbid, res) {
    var nodes = [],
        curr = riaaTree[mbid];
    while (curr !== undefined) {
        nodes.push({
            "name": curr.name,
            "parentRel": curr.parentRel || undefined,
            "sourceUrl": curr.sourceUrl || undefined,
            "mbid": mbid
        });
        mbid = curr.parentMbid;
        curr = riaaTree[curr.parentMbid];
    }
    return {"path": nodes};
};

// Create HTTP server
var server = http.createServer(function (req, res) {
    var mbid = urlParse(req.url, true).query.mbid,
        httpCode = 400,
        body = {"error": "MusicBrainz ID parameter (mbid) not specified"};
    if (mbid !== undefined) {
        httpCode = 200;
        body = generateBody(mbid);
    }
    res.writeHead(httpCode, {"Content-Type": "application/json"});
    res.end(JSON.stringify(body), "ascii");
});

// Start the HTTP server
server.listen(httpPort, function () {
    console.log("HTTP server listening on port " + httpPort);
});
