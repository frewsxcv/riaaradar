package com.riaaradar;

import java.io.File;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.neo4j.graphdb.Direction;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Path;
import org.neo4j.graphdb.RelationshipType;
import org.neo4j.graphdb.Transaction;
import org.neo4j.graphdb.factory.GraphDatabaseFactory;
import org.neo4j.graphdb.index.Index;
import org.neo4j.graphdb.traversal.Evaluation;
import org.neo4j.graphdb.traversal.Evaluator;
import org.neo4j.graphdb.traversal.TraversalDescription;
import org.neo4j.graphdb.traversal.Traverser;
import org.neo4j.kernel.Traversal;
import org.neo4j.tooling.GlobalGraphOperations;

import com.riaaradar.MusicBrainz.Label;
import com.riaaradar.MusicBrainz.LabelRelation;

/**
 * Methods to read and manipulate a Neo4j database
 */
public class Neo4j {
    private GraphDatabaseService graphDb;
    
    private static String DB_LOCATION = "tmp/graph.db";
    private static TraversalDescription TRAVEL_DESC = 
            Traversal.description().breadthFirst()
            .relationships(LabelRelTypes.BUSINESS_ASSOCIATION_WITH)
            .relationships(LabelRelTypes.CATALOG_DISTRIBUTED_BY, Direction.OUTGOING)
            .relationships(LabelRelTypes.CATALOG_REISSUED_BY, Direction.OUTGOING)
            .relationships(LabelRelTypes.OWNED_BY, Direction.OUTGOING)
            .relationships(LabelRelTypes.RENAMED_TO, Direction.OUTGOING)
            .evaluator(new Evaluator() {
                public Evaluation evaluate(Path path) {
                    if (path.endNode().hasProperty("riaa-source")) {
                        return Evaluation.INCLUDE_AND_PRUNE;
                    }
                    return Evaluation.EXCLUDE_AND_CONTINUE;
                }
            });

    private enum LabelRelTypes implements RelationshipType {
        OWNED_BY, CATALOG_REISSUED_BY, RENAMED_TO, CATALOG_DISTRIBUTED_BY,
        BUSINESS_ASSOCIATION_WITH, UNKNOWN_RELATION
    }
    
    public Neo4j() {
        this.clear();
        graphDb = new GraphDatabaseFactory().newEmbeddedDatabase(DB_LOCATION);
    }

    /**
     * Clear all relationships and nodes from the Neo4j database
     */
    public void clear() {
        deleteFileOrDirectory(new File(DB_LOCATION));
    }
    
    private void deleteFileOrDirectory(final File file) {
        if (file.exists()) {
            if (file.isDirectory()) {
                for (File child : file.listFiles()) {
                    deleteFileOrDirectory(child);
                }
            }
            file.delete();
        }
    }

    /**
     * Add all the given Labels into the Neo4j database
     * @param labels Music labels to be inserted into the Neo4j database
     */
    public void addLabels(List<Label> labels) {
        Transaction tx = graphDb.beginTx();
        Index<Node> nodeIndex = graphDb.index().forNodes("labels");
        Map<String, String> riaaLabels = new RiaaRadar().getRiaaLabels();
        Node node;
        String mbid;
        try {
            for (Label label : labels) {
                mbid = label.getMbid();
                node = label.toNode(graphDb);
                if (riaaLabels.containsKey(mbid)) {
                    node.setProperty("riaa-source", riaaLabels.get(mbid));
                }
                nodeIndex.add(node, "id", label.getId());
            }
            tx.success();
        } finally {
            tx.finish();
        }
    }

    public void addRelations(List<LabelRelation> relations) {
        Transaction tx = graphDb.beginTx();
        Index<Node> nodeIndex = graphDb.index().forNodes("labels");
        Node labelNode0, labelNode1;
        try {
            for (LabelRelation r : relations) {
                labelNode0 = nodeIndex.get("id", r.getLabelId0()).getSingle();
                labelNode1 = nodeIndex.get("id", r.getLabelId1()).getSingle();
                if (labelNode0 != null && labelNode1 != null) {
                    createLabelRelation(r.getRelType(), labelNode0, labelNode1);
                }
            }
            tx.success();
        } finally {
            tx.finish();
        }
    }

    private void createLabelRelation(String type, Node labelNode0, Node labelNode1) {
        if (type.equals("label ownership")) {
            labelNode1.createRelationshipTo(labelNode0, LabelRelTypes.OWNED_BY);
        } else if (type.equals("label reissue")) {
            labelNode1.createRelationshipTo(labelNode0,
                    LabelRelTypes.CATALOG_REISSUED_BY);
        } else if (type.equals("label rename")) {
            labelNode0.createRelationshipTo(labelNode1,
                    LabelRelTypes.RENAMED_TO);
        } else if (type.equals("label distribution")) {
            labelNode1.createRelationshipTo(labelNode0,
                    LabelRelTypes.CATALOG_DISTRIBUTED_BY);
        } else if (type.equals("business association")) {
            labelNode1.createRelationshipTo(labelNode0,
                    LabelRelTypes.BUSINESS_ASSOCIATION_WITH);
        } else {
            labelNode1.createRelationshipTo(labelNode0,
                    LabelRelTypes.UNKNOWN_RELATION);
        }
    }

    public Map<String, String> traversal() {
        Map<String, String> ret = new HashMap<String, String>();
        String riaaPath = "";
        for (Node node : GlobalGraphOperations.at(graphDb).getAllNodes()) {
            Iterator<Path> pathIter = TRAVEL_DESC.traverse(node).iterator();
            if (pathIter.hasNext()) {
                Path firstPath = pathIter.next();
                riaaPath = "";
                for (Node tmpnode : firstPath.nodes()) {
                    riaaPath += tmpnode.getProperty("mbid");
                }
                ret.put(node.getProperty("mbid").toString(), riaaPath);
            }
        }
        return ret;
        
    }

    /**
     * Disconnect from the Neo4j database
     */
    public void disconnect() {
        graphDb.shutdown();
    }
}
