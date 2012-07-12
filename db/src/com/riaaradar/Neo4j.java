package com.riaaradar;

import java.util.List;
import java.util.Map;
import org.neo4j.cypher.ExecutionEngine;
import org.neo4j.graphdb.Direction;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Path;
import org.neo4j.graphdb.Relationship;
import org.neo4j.graphdb.RelationshipType;
import org.neo4j.graphdb.Transaction;
import org.neo4j.graphdb.factory.GraphDatabaseFactory;
import org.neo4j.graphdb.index.Index;
import org.neo4j.graphdb.traversal.Evaluation;
import org.neo4j.graphdb.traversal.Evaluator;
import org.neo4j.graphdb.traversal.TraversalDescription;
import org.neo4j.kernel.Traversal;

import com.riaaradar.MusicBrainz.Label;
import com.riaaradar.MusicBrainz.LabelRelation;

/**
 * Methods to read and manipulate a Neo4j database
 */
public class Neo4j {
    private GraphDatabaseService graphDb;

    private enum LabelRelTypes implements RelationshipType {
        OWNED_BY, CATALOG_REISSUED_BY, RENAMED_TO, CATALOG_DISTRIBUTED_BY,
        BUSINESS_ASSOCIATION_WITH, UNKNOWN_RELATION
    }

    /**
     * Clear all relationships and nodes from the Neo4j database
     * TODO: This solution doesn't really work all the time
     */
    public void clear() {
        ExecutionEngine engine = new ExecutionEngine(graphDb);
        engine.execute("START r = relationship(*) DELETE r");
        engine = new ExecutionEngine(graphDb);
        engine.execute("START n = node(*) DELETE n");
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

    private void createLabelRelation(String type, Node labelNode0,
            Node labelNode1) {
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

    public void traversal(String id) {
        Index<Node> nodeIndex = graphDb.index().forNodes("labels");
        Node label = nodeIndex.get("id", id).getSingle();
        TraversalDescription td = Traversal
                .description()
                .breadthFirst()
                .relationships(LabelRelTypes.BUSINESS_ASSOCIATION_WITH)
                .relationships(LabelRelTypes.CATALOG_DISTRIBUTED_BY,
                        Direction.OUTGOING)
                .relationships(LabelRelTypes.CATALOG_REISSUED_BY,
                        Direction.OUTGOING)
                .relationships(LabelRelTypes.OWNED_BY, Direction.OUTGOING)
                .relationships(LabelRelTypes.RENAMED_TO, Direction.OUTGOING)
                .evaluator(new Evaluator() {
                    @Override
                    public Evaluation evaluate(Path path) {
                        if (path.endNode().hasProperty("riaa-source")) {
                            return Evaluation.INCLUDE_AND_PRUNE;
                        }
                        return Evaluation.INCLUDE_AND_CONTINUE;
                    }
                });
        for (Path path : td.traverse(label)) {
            Relationship meow = path.lastRelationship();
            if (meow == null) {
                System.out.println("At depth " + path.length() + " => "
                        + path.endNode().getProperty("name"));
            } else {
                System.out.println("At depth " + path.length() + " => "
                        + path.endNode().getProperty("name") + " (" + meow.getType().name() + ")");
            }
        }
    }

    /**
     * Connect to the Neo4j database
     */
    public void connect() {
        graphDb = new GraphDatabaseFactory()
                .newEmbeddedDatabase("/opt/neo4j-comm-1.8.m05/data/graph.db");
    }

    /**
     * Disconnect from the Neo4j database
     */
    public void disconnect() {
        graphDb.shutdown();
    }
}
