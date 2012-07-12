package com.riaaradar;

import java.sql.*;
import java.util.ArrayList;
import java.util.Properties;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;

public class MusicBrainz {

    /**
     * 
     */
    public MusicBrainz() {
        loadJdbc();
    }

    /**
     * Gets all the music labels in the database
     * @return Music labels
     */
    public ArrayList<Label> getLabels() {
        Statement st;
        ResultSet rs;
        ArrayList<Label> labels = new ArrayList<Label>();
        Connection conn = connect();
        try {
            st = conn.createStatement();
            rs = st.executeQuery(
                      "SELECT label.id, label.gid, label_name.name "
                    + "  FROM label, label_name"
                    + "  WHERE label.name = label_name.id;");
            while (rs.next()) {
                labels.add(new Label(rs.getString(1), rs.getString(2), rs
                        .getString(3)));
            }
            rs.close();
            st.close();
            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return labels;
    }

    /**
     * Returns the relations between labels in the Musicbrainz database
     * @return ArrayList of LabelRelations in the Musicbrainz database
     */
    public ArrayList<LabelRelation> getLabelRelations() {
        ArrayList<LabelRelation> ret = new ArrayList<LabelRelation>();
        Connection conn = connect();
        try {
            Statement st = conn.createStatement();
            ResultSet rs = st.executeQuery(
                      "SELECT link_type.name, l_l_l.entity0, l_l_l.entity1"
                    + "  FROM l_label_label AS l_l_l, link, link_type "
                    + "  WHERE l_l_l.link = link.id "
                    + "    AND link.link_type = link_type.id");
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

    /**
     * Load the JDBC driver
     */
    private void loadJdbc() {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    /**
     * Connect to the database
     */
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

    /**
     * Represents a music label from the MusicBrainz database
     */
    public class Label {
        private String id, mbid, name;

        /**
         * Constructs a new Label with all properties
         * @param id The database ID of the music label
         * @param mbid The Musicbrainz ID of the music label
         * @param name The name of the music label  
         */
        public Label(String id, String mbid, String name) {
            this.id = id;
            this.mbid = mbid;
            this.name = name;
        }

        /**
         * Converts this Label to a new Neo4j Node
         * @param graphDb The graph database used to create the Node
         * @return The Node representation of this Label
         */
        public Node toNode(GraphDatabaseService graphDb) {
            Node node = graphDb.createNode();
            node.setProperty("mbid", this.mbid);
            node.setProperty("name", this.name);
            return node;
        }

        /**
         * Returns the database ID of this music label
         * @return Database ID of this Label
         */
        public String getId() {
            return this.id;
        }

        /**
         * Returns the Musicbrainz ID of this music label
         * @return Musicbrainz ID of this Label
         */
        public String getMbid() {
            return this.mbid;
        }

        /**
         * Returns the name of this music label
         * @return Name of this Label
         */
        public String getName() {
            return this.name;
        }
    }

    public class LabelRelation {
        private String relType, labelId0, labelId1;

        /**
         * 
         * @param rs
         * @throws SQLException
         */
        public LabelRelation(ResultSet rs) throws SQLException {
            this.relType = rs.getString(1);
            this.labelId0 = rs.getString(2);
            this.labelId1 = rs.getString(3);
        }
        
        /**
         * 
         * @return
         */
        public String getRelType() {
            return this.relType;
        }
        
        /**
         * 
         * @return
         */
        public String getLabelId0() {
            return this.labelId0;
        }
        
        /**
         * 
         * @return
         */
        public String getLabelId1() {
            return this.labelId1;
        }
    }
}
