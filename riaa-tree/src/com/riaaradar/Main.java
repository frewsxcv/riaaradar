package com.riaaradar;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.ArrayList;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
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
        
        Gson gson = new GsonBuilder().serializeNulls().create();
        PrintWriter out = null;
        (new File("dist")).mkdir();
        try {
            out = new PrintWriter("dist/riaaTree.js");
            out.print("exports.riaaTree = ");
            out.print(gson.toJson(neo4j.getRiaaLabelTree()));
            out.print(";");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } finally {
            out.close();
        }
        
        System.out.print("Disconnecting from Neo4j...");
        neo4j.disconnect();
        System.out.print("Done\n");
        
        System.out.print("Clearing existing data...");
        neo4j.removeDB();
        System.out.print("Done\n");
    }
}