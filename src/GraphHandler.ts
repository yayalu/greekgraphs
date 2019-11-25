import entities from "./data/entities.json";
import { updateComponent } from "./DataCardHandler";

/*

export type relationshipInfo = {
  MOTHERS: entityInfo[];
  FATHERS: entityInfo[];
  SIBLINGS: entityInfo[];
  WIVES: entityInfo[];
  HUSBANDS: entityInfo[];
  CHILDREN: entityInfo[];
};

*/

export const getGraph = (depth: number, id: string, relationships: any) => {
  let Graph = require("@dagrejs/graphlib").Graph;
  let g = new Graph();

  getAllLinks(g, depth, id, relationships);
  /* TODO: How to address partners, e.g. fathers linked to mothers if have multiple fathers or multiple mothers */
  console.log("Final edges", g.edges());
};

const getAllLinks = (g: any, depth: number, id: string, relationships: any) => {
  g.setNode(id, entities[id]["Name (Smith & Trzaskoma)"]);

  if (relationships.MOTHERS.length !== 0) {
    console.log(relationships.MOTHERS);
    for (let i = 0; i < relationships.MOTHERS.length; i++) {
      let r = relationships.MOTHERS[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "mother");
    }
  }

  if (relationships.FATHERS.length !== 0) {
    console.log(relationships.FATHERS);
    for (let i = 0; i < relationships.FATHERS.length; i++) {
      let r = relationships.FATHERS[i];
      g.setNode(r.targetID, r);
      g.setEdge(r.targetID, id, "father");
    }
  }

  if (relationships.SIBLINGS.length !== 0) {
    console.log(relationships.SIBLINGS);
    for (let i = 0; i < relationships.SIBLINGS.length; i++) {
      let r = relationships.SIBLINGS[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "sibling");
    }
  }

  if (relationships.WIVES.length !== 0) {
    console.log(relationships.WIVES);
    for (let i = 0; i < relationships.WIVES.length; i++) {
      let r = relationships.WIVES[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "wife");
    }
  }

  if (relationships.HUSBANDS.length !== 0) {
    console.log(relationships.HUSBANDS);
    for (let i = 0; i < relationships.HUSBANDS.length; i++) {
      let r = relationships.HUSBANDS[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "husband");
    }
  }

  if (relationships.CHILDREN.length !== 0) {
    console.log(relationships.CHILDREN);
    for (let i = 0; i < relationships.CHILDREN.length; i++) {
      let r = relationships.CHILDREN[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "child");
    }
  }

  let edges = g.edges();
  console.log(depth);
  if (depth > 1) {
    for (let i = 0; i < edges.length; i++) {
      // Does this actually update g?
      // Recursive call to getAllLinks()
      getAllLinks(
        g,
        depth - 1,
        edges[i].v,
        updateComponent(edges[i].v).relationships
      );
    }
  }
};
