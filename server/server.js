var http = require("http");
var url = require("url");
var PgClient = require("pg").Client; 
var readFile = require("fs").readFile;
var format = require("util").format;
var riaaLabels = require("./riaa.js").labels;

// Connect to PostgreSQL
var pgClient = new PgClient({
    user: "musicbrainz",
    password: "musicbrainz",
    database: "musicbrainz_db",
    host: "localhost",
    port: 5432
});

pgClient.connect(function (err) {
    if (err) {
        throw err;
    } else {
        getQuery();
    }
});

// Get the SQL query
function getQuery() {
    readFile("query.sql", "ascii", function(err, raw_query) {
        if (err) {
            throw err;
        } else {
            startServer(raw_query);
        }
    });
}

function startServer(raw_query) {
    http.createServer(function (req, res) {
        var mbid = url.parse(req.url, true).query.mbid;
        res.writeHead(200, {'Content-Type': 'application/json'});
        if (mbid) {
            getLabels(mbid, function (labels) {
                result = { mbid: null };
                console.log(labels);
                labels.forEach(function (label) {
                    console.log('\n' + label.gid + ' -- ' + label.name);
                    if (label.gid in riaaLabels) {
                        console.log('riaa label: ' + riaaLabels[label.gid].name);
                        result.mbid = label.gid;
                        result.name = label.name;
                    }
                });
                console.log('-----------------------');
                res.end(JSON.stringify(result), "ascii");
            });
        } else {
            res.end(JSON.stringify({
                error: "mbid not specified"
            }), "ascii");
        }
    }).listen(4567);

    function getLabels(mbid, callback) {
        var query = format(raw_query, mbid);
        var pgQuery = pgClient.query(query, function (err, result) {
            var labels = [], index;
            if (!err && result) {
                result.rows.forEach(function(row) {
                    labels.push({
                    	gid: row.gid,
                    	name: row.name
                    });
                });
            }
            callback(labels);
        });
    };
};
