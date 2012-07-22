# RIAA Radar

## How it works (or how it's going to work)

1. Java code in the `riaaTree` directory populates a Neo4j database from the Musicbrainz database *(done)*
2. The same code will then iterate through all the labels and compute the shortest path to an RIAA affiliated label. This will be in the form of a JSON hash map *(done)*
4. Node will serve as the HTTP server handling requests by querying the JSON from the previous step *(in progress)*
5. Frontend makes Ajax calls to the Node server

## How to set up

1. [Set up MusicBrainz database](https://github.com/metabrainz/musicbrainz-server/blob/master/INSTALL.md)
2. More steps to come...
