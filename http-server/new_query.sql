/* Return all the labels the given release group was released under
 * Input: UUID of release group
 * Output: List of label IDs
 */
CREATE OR REPLACE FUNCTION get_rel_group_labels(src_rel_group UUID)
RETURNS TABLE(id INT) AS $$
BEGIN
   RETURN QUERY SELECT DISTINCT label.id
   FROM label, label_name, release, release_group, release_label
   WHERE label_name.id = label.name
     AND release_label.label = label.id
     AND release_label.release = release.id
     AND release.release_group = release_group.id
     AND release_group.gid = src_rel_group;
END;
$$ LANGUAGE plpgsql;


/* Gets the parent labels of a given label
 * Input: Label of which to find parents
 * Output: Parents of the inputted label
 */
CREATE OR REPLACE FUNCTION get_parents(child_id INT)
RETURNS TABLE(link_type VARCHAR, parent_id INT) AS $$
BEGIN
   RETURN QUERY SELECT link_type.name,
      CASE WHEN link_type.name = 'label rename'
         THEN l_label_label.entity1
         ELSE l_label_label.entity0
      END
   FROM l_label_label, link, link_type
   WHERE l_label_label.link = link.id
      AND link.link_type = link_type.id
      AND ((link_type.name = 'label ownership'
            OR link_type.name = 'label reissue'
            OR link_type.name = 'label distribution')
         AND l_label_label.entity1 = child_id
         OR link_type.name = 'label rename'  -- Also follows label renames
            AND l_label_label.entity0 = child_id);
END;
$$ LANGUAGE plpgsql;

/*
 *
 */
CREATE OR REPLACE FUNCTION affiliated(src_rel_group UUID)
RETURNS SETOF INT AS $$
DECLARE
   label_id INT;
   a VARCHAR;
   b INT;
BEGIN
   FOR label_id IN SELECT * FROM get_rel_group_labels(src_rel_group) LOOP
      FOR a, b IN SELECT * FROM get_parents(label_id) LOOP
         RETURN NEXT b;
      END LOOP;
   END LOOP;
END;
$$ LANGUAGE plpgsql;



/* Tests down here */
SELECT * FROM affiliated('6f151223-f3a3-3e57-810f-598f7897006c');
