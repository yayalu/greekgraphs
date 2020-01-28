import { nodeType, edgeType } from "./GraphTypes";
import { getName } from "./DataCardHandler";
import entities from "./data/entities.json";
import allRelationships from "./data/relationships.json";
import "./EntityGraph.scss";

export const getGraph = (id: string) => {
  let relationships = JSON.parse(allRelationships[id]).relationships;
  console.log(JSON.parse(allRelationships[id]));
  return getAllRelationshipLinks(id, relationships);
};

const getAllRelationshipLinks = (id: string, relationships: any) => {
  let nodes = {};
  let edges = {};

  //The main node is at depth 0 /
  let mainnode: nodeType = {
    id: id,
    depth: 0,
    location: { x: 0, y: 0 },
    style: ""
  };
  nodes[id] = mainnode;

  //All spouses and siblings are at same depth
  for (let i = 0; i < relationships.SIBLINGS.length; i++) {
    let node: nodeType = {
      id: relationships.SIBLINGS[i].targetID,
      depth: 0,
      location: { x: 0, y: 0 },
      style: ""
    };
    nodes[relationships.SIBLINGS[i].targetID] = node;
    let edge: edgeType = {
      from: id,
      to: relationships.SIBLINGS[i].targetID,
      relation: "sibling",
      style: ""
    };
    if (edges[relationships.SIBLINGS[i].targetID]) {
      // Duplicated edge
      console.log(
        "Sibling suspicious - TODO handle",
        relationships.SIBLINGS[i].target
      );
    } else {
      edges[relationships.SIBLINGS[i].targetID] = edge;
    }
  }
  for (let i = 0; i < relationships.SPOUSES.length; i++) {
    let node: nodeType = {
      id: relationships.SPOUSES[i].targetID,
      depth: 0,
      location: { x: 0, y: 0 },
      style: ""
    };
    nodes[relationships.SPOUSES[i].targetID] = node;
    let edge: edgeType = {
      from: id,
      to: relationships.SPOUSES[i].targetID,
      relation: "spouse",
      style: ""
    };
    if (edges[relationships.SPOUSES[i].targetID]) {
      // Duplicated edge
      console.log(
        "Spouse suspicious - TODO handle",
        relationships.SPOUSES[i].target
      );
    } else {
      edges[relationships.SPOUSES[i].targetID] = edge;
    }
  }
  for (let i = 0; i < relationships.TWIN.length; i++) {
    let node: nodeType = {
      id: relationships.TWIN[i].targetID,
      depth: 0,
      location: { x: 0, y: 0 },
      style: ""
    };
    nodes[relationships.TWIN[i].targetID] = node;
    let edge: edgeType = {
      from: id,
      to: relationships.TWIN[i].targetID,
      relation: "twin",
      style: ""
    };
    if (edges[relationships.TWIN[i].targetID]) {
      // Duplicated edge
      console.log(
        "Twin suspicious - TODO handle",
        relationships.TWIN[i].target
      );
    } else {
      edges[relationships.TWIN[i].targetID] = edge;
    }
  }

  //All ancestors are at relative -1
  for (let i = 0; i < relationships.MOTHERS.length; i++) {
    let node: nodeType = {
      id: relationships.MOTHERS[i].targetID,
      depth: -1,
      location: { x: 0, y: 0 },
      style: ""
    };
    nodes[relationships.MOTHERS[i].targetID] = node;
    let edge: edgeType = {
      from: relationships.MOTHERS[i].targetID,
      to: id,
      relation: "mother",
      style: ""
    };
    if (edges[relationships.MOTHERS[i].targetID]) {
      // Duplicated edge
      console.log(
        "Mother suspicious - TODO handle",
        relationships.MOTHERS[i].target
      );
    } else {
      edges[relationships.MOTHERS[i].targetID] = edge;
    }
  }
  for (let i = 0; i < relationships.FATHERS.length; i++) {
    let node: nodeType = {
      id: relationships.FATHERS[i].targetID,
      depth: -1,
      location: { x: 0, y: 0 },
      style: ""
    };
    nodes[relationships.FATHERS[i].targetID] = node;
    let edge: edgeType = {
      from: relationships.FATHERS[i].targetID,
      to: id,
      relation: "fathers",
      style: ""
    };
    if (edges[relationships.FATHERS[i].targetID]) {
      // Duplicated edge
      console.log(
        "Fathers suspicious - TODO handle",
        relationships.FATHERS[i].target
      );
    } else {
      edges[relationships.FATHERS[i].targetID] = edge;
    }
  }

  for (let i = 0; i < relationships.CHILDREN.length; i++) {
    //All descendants are at relative +1
    for (let j = 0; j < relationships.CHILDREN[i].child.length; j++) {
      let node: nodeType = {
        id: relationships.CHILDREN[i].child[j].targetID,
        depth: 1,
        location: { x: 0, y: 0 },
        style: ""
      };
      nodes[relationships.CHILDREN[i].child[j].targetID] = node;
      let edge: edgeType = {
        from: id,
        to: relationships.CHILDREN[i].child[j].targetID,
        relation: "child",
        style: ""
      };
      if (edges[relationships.CHILDREN[i].child[j].targetID]) {
        // Duplicated edge
        console.log(
          "Child suspicious - TODO handle",
          relationships.CHILDREN[i].child[j].target
        );
      } else {
        edges[relationships.CHILDREN[i].child[j].targetID] = edge;
      }
    }
    //All other parents (co-parents) are at depth 0
    for (let j = 0; j < relationships.CHILDREN[i].otherParentIDs.length; j++) {
      let node: nodeType = {
        id: relationships.CHILDREN[i].otherParentIDs[j],
        depth: 0,
        location: { x: 0, y: 0 },
        style: ""
      };
      nodes[relationships.CHILDREN[i].otherParentIDs[j]] = node;
      let edge: edgeType;
      if (relationships.CHILDREN[i].otherParentIDs.length > 1) {
        edge = {
          from: id,
          to: relationships.CHILDREN[i].otherParentIDs[j],
          relation: "co-parent",
          style: "",
          disputed: "co-parent"
        };
      } else {
        edge = {
          from: id,
          to: relationships.CHILDREN[i].otherParentIDs[j],
          relation: "co-parent",
          style: ""
        };
      }
      if (edges[relationships.CHILDREN[i].otherParentIDs[j]]) {
        // Duplicated edge
        console.log(
          "Other parent suspicious - TODO handle",
          getName(entities[relationships.CHILDREN[i].otherParentIDs[j]])
        );
      } else {
        edges[relationships.CHILDREN[i].otherParentIDs[j]] = edge;
      }
    }
  }

  return { nodes, edges };
};

/* let edges = g.edges();
  // if (depth > 1) {
    for (let i = 0; i < edges.length; i++) {
      // Does this actually update g?
      // Recursive call to getAllLinks()
      getAllRelationshipLinks(
        g,
        depth - 1,
        edges[i].v,
        JSON.parse(relationships[edges[i].v]).relationships
      );
    }
  } 
}; */
