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
import org.neo4j.graphdb.Relationship;
import org.neo4j.graphdb.RelationshipType;
import org.neo4j.graphdb.Transaction;
import org.neo4j.graphdb.factory.GraphDatabaseFactory;
import org.neo4j.graphdb.index.Index;
import org.neo4j.graphdb.traversal.Evaluation;
import org.neo4j.graphdb.traversal.Evaluator;
import org.neo4j.graphdb.traversal.TraversalDescription;
import org.neo4j.kernel.Traversal;
import org.neo4j.tooling.GlobalGraphOperations;
import com.riaaradar.MusicBrainz.Label;
import com.riaaradar.MusicBrainz.LabelRelation;

// Methods to read and manipulate a Neo4j database
public final class Neo4j {

    // The different types of relationships labels share with other labels
    private enum LabelRelTypes implements RelationshipType {
        OWN("owned by"),
        CRE("catalog reissued by"),
        RNM("renamed to"),
        CDI("catalog distributed by"),
        BUS("BUSINESS_ASSOCIATION_WITH"),
        UKN("UNKNOWN_RELATION");
        
        // Description of label relation 
        private String desc;
        
        // Constructs a LabelRelType with a description
        private LabelRelTypes(String desc) {
            this.desc = desc;
        }
        
        // Returns the description of the label to label relationship
        public String toString() {
            return this.desc;
        }
    }
    
    // Neo4j database service
    private GraphDatabaseService graphDb;
    
    // Location of temporary database
    private static String DB_LOCATION = "tmp/graph.db";

    // Describes how the graph should be traversed
    private static TraversalDescription TRAV_DESC = Traversal.description()
        .breadthFirst()
        .relationships(LabelRelTypes.BUS)
        .relationships(LabelRelTypes.CDI, Direction.OUTGOING)
        .relationships(LabelRelTypes.CRE, Direction.OUTGOING)
        .relationships(LabelRelTypes.OWN, Direction.OUTGOING)
        .relationships(LabelRelTypes.RNM, Direction.OUTGOING)
        .evaluator(new Evaluator() {
            public Evaluation evaluate(Path path) {
                if (path.endNode().hasProperty("riaa-source"))
                    return Evaluation.INCLUDE_AND_PRUNE;
                return Evaluation.EXCLUDE_AND_CONTINUE;
            }
        });
    
    // Constructs a new Neo4j object
    public Neo4j() {
        this.removeDB();
        this.initDB();
    }
    
    // Initialize a new Neo4j database
    private void initDB() {
        graphDb = new GraphDatabaseFactory().newEmbeddedDatabase(DB_LOCATION);
    }

    // Clear all relationships and nodes from the Neo4j database
    public void removeDB() {
        deleteFileOrDirectory(new File(DB_LOCATION));
    }
    
    // Deletes the file/directory
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

    // Add all the given Labels into the Neo4j database
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

    // Adds relationships to all the label nodes in the graph database given a
    // list of LabelRelations
    public void addRelations(List<LabelRelation> relations) {
        Transaction tx = graphDb.beginTx();
        Index<Node> nodeIndex = graphDb.index().forNodes("labels");
        Node node0, node1;
        try {
            for (LabelRelation r : relations) {
                node0 = nodeIndex.get("id", r.getLabelId0()).getSingle();
                node1 = nodeIndex.get("id", r.getLabelId1()).getSingle();
                createLabelRelation(r.getRelType(), node0, node1);
            }
            tx.success();
        } finally {
            tx.finish();
        }
    }

    // Creates a single relationship of the given type  between two labels nodes 
    private void createLabelRelation(String type, Node node0, Node node1) {
        switch (type) {
        case "label ownership":
            node1.createRelationshipTo(node0, LabelRelTypes.OWN);
            break;
        case "label reissue":
            node1.createRelationshipTo(node0, LabelRelTypes.CRE);
            break;
        case "label rename":
            node0.createRelationshipTo(node1, LabelRelTypes.RNM);
            break;
        case "label distribution":
            node1.createRelationshipTo(node0, LabelRelTypes.CDI);
            break;
        case "business association":
            node1.createRelationshipTo(node0, LabelRelTypes.BUS);
            break;
        default:
            node1.createRelationshipTo(node0, LabelRelTypes.UKN);
        }
    }

    // Returns the Map representation of a tree connecting RIAA labels
    public Map<String, RiaaTreeNode> getRiaaLabelTree() {
        Map<String, RiaaTreeNode> ret = new HashMap<String, RiaaTreeNode>();
        for (Node node : GlobalGraphOperations.at(graphDb).getAllNodes()) {
            Iterator<Path> pathIter = TRAV_DESC.traverse(node).iterator();
            if (pathIter.hasNext()) {
                // Only get the first path (sometimes the query returns multiple paths)
                Path firstPath = pathIter.next();
                putTreeNodes(ret, firstPath);
            }
        }
        return ret;
    }
    
    private void putTreeNodes(Map<String, RiaaTreeNode> ret, Path firstPath) {
        Node childNode = null, parentNode = null;
        Iterator<Node> nodeIter = firstPath.nodes().iterator();
        Relationship rel;
        String childName, childMbid;
        if (nodeIter.hasNext()) {
            childNode = nodeIter.next();
            childName = childNode.getProperty("name").toString();
            childMbid = childNode.getProperty("mbid").toString();
            if (nodeIter.hasNext()) {
                parentNode = nodeIter.next();
                rel = this.getRelationship(parentNode, childNode);
                ret.put(childMbid,
                        new RiaaTreeNode(
                                childName,
                                parentNode.getProperty("mbid").toString(), 
                                rel.getType().toString()));
            } else {
                ret.put(childMbid, new RiaaTreeNode(childName, null, null));
            }
        }
    }
    
    // TODO: This should find the most prominent relationship, but for now just
    //        picks the first one
    private Relationship getRelationship(Node parent, Node child) {
        // TODO: Can business associations be bi-directional?
        Iterable<Relationship> relationships = child.getRelationships(Direction.OUTGOING);
        for (Relationship relationship : relationships) {
            if (relationship.getEndNode().equals(parent)) {
                return relationship;
            }
        }
        return null;
    }
    
    private class RiaaTreeNode {
        private String name, parentMbid, parentRel;
        
        public RiaaTreeNode(String name, String parentMbid, String parentRel) {
            this.name = name;
            this.parentMbid = parentMbid;
            this.parentRel = parentRel;
        }
    }

    /**
     * Disconnect from the Neo4j databasearg0
     */
    public void disconnect() {
        graphDb.shutdown();
    }
}
