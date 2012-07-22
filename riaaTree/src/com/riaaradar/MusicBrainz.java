package com.riaaradar;

import java.sql.*;
import java.util.ArrayList;
import java.util.Properties;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;

// MusicBrainz related functions
public final class MusicBrainz {

    // Constructs a new MusicBrainz object and loads the Jdbc driver for the
    // PostgreSQL database
    public MusicBrainz() {
        loadJdbc();
    }

    // Returns all the music labels in the database
    public ArrayList<Label> getLabels() {
    	ArrayList<Label> labels = new ArrayList<Label>();
        Statement st;
        ResultSet rs;
        Connection conn = connect();
        String query = "SELECT label.id, label.gid, label_name.name "
                     + "  FROM label, label_name"
                     + "  WHERE label.name = label_name.id";
        try {
            st = conn.createStatement();
            rs = st.executeQuery(query);
            while (rs.next()) {
                labels.add(new Label(rs));
            }
            rs.close();
            st.close();
            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return labels;
    }

    // Returns the relations between labels in the Musicbrainz database
    public ArrayList<LabelRelation> getLabelRelations() {
        ArrayList<LabelRelation> ret = new ArrayList<LabelRelation>();
        Connection conn = connect();
        String query = "SELECT link_type.name, l_l_l.entity0, l_l_l.entity1"
                     + "  FROM l_label_label AS l_l_l, link, link_type "
                     + "  WHERE l_l_l.link = link.id "
                     + "    AND link.link_type = link_type.id";
        try {
            Statement st = conn.createStatement();
            ResultSet rs = st.executeQuery(query);
            while (rs.next()) {
                ret.add(new LabelRelation(rs));
            }
            rs.close();
            st.close();
            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return ret;
    }

    // Load the PostgreSQL JDBC driver
    private void loadJdbc() {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    // Initiate connection with the MusicBrainz PostgreSQL database
    private Connection connect() {
        String url = "jdbc:postgresql://localhost/musicbrainz_db";
        Connection conn = null;
        Properties props = new Properties();
        props.setProperty("user", "musicbrainz");
        props.setProperty("password", "musicbrainz");
        props.setProperty("ssl", "true");
        try {
            conn = DriverManager.getConnection(url, props);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return conn;
    }

    // Represents a music label from the MusicBrainz database
    public class Label {
        private String id, mbid, name;

        // Constructs a new Label with all properties. Input should be a
        // ResultSet with the following order: id, mbid, name
        public Label(ResultSet rs) throws SQLException {
            this.id = rs.getString(1);
            this.mbid = rs.getString(2);
            this.name = rs.getString(3);
        }

        // Converts this Label to a new Neo4j Node
        public Node toNode(GraphDatabaseService graphDb) {
            Node node = graphDb.createNode();
            node.setProperty("mbid", this.mbid);
            node.setProperty("name", this.name);
            return node;
        }

        // Returns the database ID of this music label
        public String getId() {
            return this.id;
        }

        // Returns the MusicBrainz ID of this music label
        public String getMbid() {
            return this.mbid;
        }

        // Returns the name of this music label
        public String getName() {
            return this.name;
        }
    }

    // Represents a relationship between music labels
    public class LabelRelation {
        private String relType, labelId0, labelId1;

        // Constructs a new LabelRelation with all properties. Input should be a
        // ResultSet with the following order: relation type, ID of label 0,
        // ID of label1
        public LabelRelation(ResultSet rs) throws SQLException {
            this.relType = rs.getString(1);
            this.labelId0 = rs.getString(2);
            this.labelId1 = rs.getString(3);
        }
        
        // Returns the type of the relationship
        public String getRelType() {
            return this.relType;
        }
        
        // Returns the database ID of the first label
        public String getLabelId0() {
            return this.labelId0;
        }
        
        // Returns the database ID of the second label
        public String getLabelId1() {
            return this.labelId1;
        }
    }
}
