WITH RECURSIVE get_labels(label) AS
  (SELECT DISTINCT label.id
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
  SELECT
    CASE 
      WHEN link_type.name = 'label rename'
        THEN l_label_label.entity1
      ELSE
        l_label_label.entity0
    END
    FROM l_label_label, link, get_labels, link_type
    WHERE l_label_label.link = link.id
      AND link.link_type = link_type.id
      AND ((link_type.name = 'label ownership'
          OR link_type.name = 'label reissue'
          OR link_type.name = 'label distribution')
          AND l_label_label.entity1 = get_labels.label
        OR
          link_type.name = 'label rename'
          AND l_label_label.entity0 = get_labels.label))

SELECT DISTINCT label.gid, label_name.name
  FROM get_labels, label, label_name
  WHERE get_labels.label = label.id
    AND label_name.id = label.name;
