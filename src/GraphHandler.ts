import entities from "./data/entities.json";
import { updateComponent, getName } from "./DataCardHandler";

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
  g.setNode(id, getName(entities[id]));

  if (relationships.MOTHERS && relationships.MOTHERS.length !== 0) {
    for (let i = 0; i < relationships.MOTHERS.length; i++) {
      let r = relationships.MOTHERS[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "mother");
      if (r.targetID === undefined) {
        console.log("MOTHERS", r);
      }
    }
  }

  if (relationships.FATHERS && relationships.FATHERS.length !== 0) {
    for (let i = 0; i < relationships.FATHERS.length; i++) {
      let r = relationships.FATHERS[i];
      g.setNode(r.targetID, r);
      g.setEdge(r.targetID, id, "father");
      if (r.targetID === undefined) {
        console.log("FATHERS", r);
      }
    }
  }

  if (relationships.SIBLINGS && relationships.SIBLINGS.length !== 0) {
    for (let i = 0; i < relationships.SIBLINGS.length; i++) {
      let r = relationships.SIBLINGS[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "sibling");
      if (r.targetID === undefined) {
        console.log("SIBLINGS", r);
      }
    }
  }

  if (relationships.WIVES && relationships.WIVES.length !== 0) {
    for (let i = 0; i < relationships.WIVES.length; i++) {
      let r = relationships.WIVES[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "wife");
      if (r.targetID === undefined) {
        console.log("WIFE", r);
      }
    }
  }

  if (relationships.HUSBANDS && relationships.HUSBANDS.length !== 0) {
    for (let i = 0; i < relationships.HUSBANDS.length; i++) {
      let r = relationships.HUSBANDS[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "husband");
      if (r.targetID === undefined) {
        console.log("HUSBAND", r);
      }
    }
  }

  if (relationships.CHILDREN && relationships.CHILDREN.length !== 0) {
    for (let i = 0; i < relationships.CHILDREN.length; i++) {
      let r = relationships.CHILDREN[i].child;
      for (let j = 0; j < r.length; j++) {
        g.setNode(r[j].targetID, r[j].target);
        g.setEdge(r[j].targetID, id, "child");
        if (r[j].targetID === undefined) {
          console.log("CHILD", r[j]);
        }
      }
    }
  }

  let edges = g.edges();
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
