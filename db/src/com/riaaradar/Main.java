package com.riaaradar;

import java.util.ArrayList;

import org.neo4j.graphdb.Path;

import com.riaaradar.MusicBrainz.Label;
import com.riaaradar.MusicBrainz.LabelRelation;

public class Main {
    ArrayList<Label> labels;
    ArrayList<LabelRelation> relations;
    
    public static void main(String[] args) {
        MusicBrainz mbz = new MusicBrainz();

        System.out.print("Getting labels from Musicbrainz...");
        ArrayList<Label> labels = mbz.getLabels();
        System.out.print("Done\n");

        System.out.print("Getting label relations from Musicbrainz...");
        ArrayList<LabelRelation> relations = mbz.getLabelRelations();
        System.out.print("Done\n");

        
        Neo4j neo4j = new Neo4j();
        System.out.println("Connected to Neo4j");

        System.out.print("Adding labels to Neo4j...");
        neo4j.addLabels(labels);
        System.out.print("Done\n");

        System.out.print("Adding relations to Neo4j...");
        neo4j.addRelations(relations);
        System.out.print("Done\n");
        
        System.out.println(neo4j.traversal());

        System.out.print("Disconnecting from Neo4j...");
        neo4j.disconnect();
        System.out.print("Done\n");
        
        System.out.print("Clearing existing data...");
        neo4j.clear();
        System.out.print("Done\n");
    }
}