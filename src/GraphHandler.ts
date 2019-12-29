import entities from "./data/entities.json";
import { updateComponent, getName, checkNoRelations } from "./DataCardHandler";
import * as dagreD3 from "dagre-d3";
import * as d3 from "d3";

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
  if (!checkNoRelations(relationships)) {
    // ignores initial empty relationship graph generation
    // Generate all connections in GraphLib form
    var dagreD3 = require("dagre-d3");
    let d3 = require("d3");
    // let Graph = require("@dagrejs/graphlib").Graph;
    // var g = new Graph({ directed: true, multigraph: true, compound: true });
    var g = new dagreD3.graphlib.Graph().setGraph({});

    g.setGraph(getName(entities[id]) + " relationships"); // Set the graph's name
    getAllLinks(g, depth, id, relationships);
    console.log("Final connections found", g.edges(), "with final graph", g);

    /* TODO: How to address partners, e.g. fathers linked to mothers if have multiple fathers or multiple mothers */

    var svg = d3.select("svg"),
      inner = svg.select("g");

    // Create the renderer
    let render = new dagreD3.render();
    // Run the renderer and draw the final graph
    render.run(inner, g);
  } else {
    return "";
  }
};

const getAllLinks = (g: any, depth: number, id: string, relationships: any) => {
  g.setNode(id, getName(entities[id]));

  if (relationships.MOTHERS && relationships.MOTHERS.length !== 0) {
    for (let i = 0; i < relationships.MOTHERS.length; i++) {
      let r = relationships.MOTHERS[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "mother");
      // g.setParent(id, r.targetID); //make compound subgraphs, r.targetID is parent of id
    }
  }

  if (relationships.FATHERS && relationships.FATHERS.length !== 0) {
    for (let i = 0; i < relationships.FATHERS.length; i++) {
      let r = relationships.FATHERS[i];
      g.setNode(r.targetID, r);
      g.setEdge(r.targetID, id, "father");
      // g.setParent(id, r.targetID); //make compound subgraphs, r.targetID is parent of id
    }
  }

  if (
    (relationships.SIBLINGS && relationships.SIBLINGS.length !== 0) ||
    (relationships.TWIN && relationships.TWIN.length !== 0)
  ) {
    for (let i = 0; i < relationships.SIBLINGS.length; i++) {
      let r = relationships.SIBLINGS[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "sibling");
    }
  }

  if (relationships.WIVES && relationships.WIVES.length !== 0) {
    for (let i = 0; i < relationships.WIVES.length; i++) {
      let r = relationships.WIVES[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "wife");
    }
  }

  if (relationships.HUSBANDS && relationships.HUSBANDS.length !== 0) {
    for (let i = 0; i < relationships.HUSBANDS.length; i++) {
      let r = relationships.HUSBANDS[i];
      g.setNode(r.targetID, r.target);
      g.setEdge(r.targetID, id, "husband");
    }
  }

  if (relationships.CHILDREN && relationships.CHILDREN.length !== 0) {
    for (let i = 0; i < relationships.CHILDREN.length; i++) {
      let r = relationships.CHILDREN[i].child;
      for (let j = 0; j < r.length; j++) {
        g.setNode(r[j].targetID, r[j].target);
        g.setEdge(r[j].targetID, id, "child");
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
