WITH RECURSIVE get_labels(prev_rel, prev_label, label) AS
  (SELECT DISTINCT 'source label', 0, label.id
    FROM label,
         label_name,
         release, 
         release_group,
         release_label
    WHERE label_name.id = label.name
      AND release_label.label = label.id
      AND release_label.release = release.id
      AND release.release_group = release_group.id
      AND release_group.gid = '%s'
  UNION
   SELECT link_type.name,
      CASE WHEN link_type.name = 'label rename'
         THEN l_label_label.entity0
         ELSE l_label_label.entity1
      END,
      CASE WHEN link_type.name = 'label rename'
         THEN l_label_label.entity1
         ELSE l_label_label.entity0
      END
   FROM l_label_label, link, get_labels, link_type
   WHERE l_label_label.link = link.id
      AND link.link_type = link_type.id
      AND ((link_type.name = 'label ownership'
            OR link_type.name = 'label reissue'
            OR link_type.name = 'label distribution')
         AND l_label_label.entity1 = get_labels.label
         OR link_type.name = 'label rename'
            AND l_label_label.entity0 = get_labels.label))

SELECT DISTINCT label.gid AS gid, label_name.name AS name, get_labels.prev_rel AS prev_rel,
  CASE
    WHEN get_labels.prev_label != 0
      THEN prev_label.gid
    END AS prev_gid
  FROM get_labels, label, label AS prev_label, label_name
  WHERE get_labels.label = label.id
    AND label_name.id = label.name
    AND (get_labels.prev_label = prev_label.id
        OR get_labels.prev_label = 0)
