# RIAA Radar

## How it works (or how it's going to work)

1. Java code in the `db` directory populates a Neo4j database from the Musicbrainz database *(done)*
2. The same code will then iterate through all the labels and compute the shortest path to an RIAA affiliated label *(almost done)*
3. A key-value store (probably Redis) will be populated with the MBID of a label as the key and the shortest path computed in the previous path as the value
4. Node will serve as the HTTP server handling requests by querying Redis
5. Frontend makes Ajax calls to the Node server

## How to set up

1. [Set up MusicBrainz database](https://github.com/metabrainz/musicbrainz-server/blob/master/INSTALL.md)
2. More steps to come...