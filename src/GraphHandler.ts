import entities from "./data/entities.json";
import { getName, checkNoMembers, checkNoRelations } from "./DataCardHandler";
import relationships from "./data/relationships.json";
import "./EntityGraph.scss";

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

export const getGraph = (
  depth: number,
  id: string,
  relationships: any,
  members: any[]
) => {
  // ignores initial empty relationship graph generation
  // Generate all connections in GraphLib form
  var dagreD3 = require("dagre-d3");

  // Establish the graph and set the graph's name
  let g = new dagreD3.graphlib.Graph({
    directed: true,
    compound: true,
    multigraph: true
  }).setGraph({
    name: getName(entities[id]) + " relationships"
  });
  g.setDefaultEdgeLabel(function() {
    return {};
  });

  // Set main node
  g.setNode(id, {
    label: getName(entities[id]),
    labelStyle: "font-size: 30px;",
    width: 288,
    height: 200,
    shape: "ellipse"
  });

  if (!checkNoRelations(relationships)) {
    getAllRelationshipLinks(g, depth, id, relationships);
  }
  if (!checkNoMembers(members)) {
    // We do not consider depth here due to type of graph produced
    getAllMemberLinks(g, id, members);
  }
  /* TODO: How to address partners, e.g. fathers linked to mothers if have multiple fathers or multiple mothers */

  /*
    var svg = d3.select("svg"),
      inner = svg.select("g");

    // Create the renderer
    let render = new dagreD3.render();
    // Run the renderer and draw the final graph
    render.run(inner, g);
    */
  return g;
};

const getAllMemberLinks = (g: any, id: string, members: any[]) => {
  for (let i = 0; i < members.length; i++) {
    g.setNode(members[i].targetID, {
      label: members[i].target,
      width: 144,
      height: 100,
      shape: "ellipse"
    });
    g.setEdge(id, members[i].targetID, {
      label: "member",
      style:
        "stroke: grey; stroke-width: 2px; stroke-dasharray: 10,10; d: M5 40 l215 0;"
    });
  }
};

const getAllRelationshipLinks = (
  g: any,
  depth: number,
  id: string,
  relationships: any
) => {
  // Makes the size of the nodes proportional to the depth
  let width = 144 / depth;
  let height = 100 / depth;

  if (relationships.MOTHERS && relationships.MOTHERS.length !== 0) {
    for (let i = 0; i < relationships.MOTHERS.length; i++) {
      let r = relationships.MOTHERS[i];
      g.setNode(r.targetID, {
        label: r.target,
        width: width,
        height: height,
        shape: "ellipse"
      });
      var disputeStyle =
        "stroke: blue; stroke-width: 2px; stroke-dasharray: 2,2; d: M5 40 l215 0;";
      var normalStyle = "stroke: black; stroke-width: 2px;";
      g.setEdge(r.targetID, id, {
        label: "mother",
        style: relationships.MOTHERS.length > 1 ? disputeStyle : normalStyle,
        id: relationships.MOTHERS.length > 1 ? "mother" : "disputed mother"
      });
      // g.setParent(id, r.targetID); //make compound subgraphs, r.targetID is parent of id
    }
  }

  if (relationships.FATHERS && relationships.FATHERS.length !== 0) {
    for (let i = 0; i < relationships.FATHERS.length; i++) {
      let r = relationships.FATHERS[i];
      g.setNode(r.targetID, {
        label: r.target,
        width: width,
        height: height,
        shape: "ellipse"
      });
      var disputeStyle =
        "stroke: blue; stroke-width: 2px; stroke-dasharray: 2,2; d: M5 40 l215 0;";
      var normalStyle = "stroke: black; stroke-width: 2px;";
      g.setEdge(r.targetID, id, {
        label: "father",
        style: relationships.FATHERS.length > 1 ? disputeStyle : normalStyle,
        id: relationships.FATHERS.length > 1 ? "father" : "disputed father"
      });
      // g.setParent(id, r.targetID); //make compound subgraphs, r.targetID is parent of id
    }
  }

  if (
    (relationships.SIBLINGS && relationships.SIBLINGS.length !== 0) ||
    (relationships.TWIN && relationships.TWIN.length !== 0)
  ) {
    for (let i = 0; i < relationships.SIBLINGS.length; i++) {
      let r = relationships.SIBLINGS[i];
      g.setNode(r.targetID, {
        label: r.target,
        width: width,
        height: height,
        shape: "ellipse"
      });
      g.setEdge(id, r.targetID, {
        label: "sibling",
        style: "stroke: black; stroke-width: 2px;",
        arrowhead: "undirected"
      });
      if (relationships.MOTHERS[0]) {
        g.setEdge(relationships.MOTHERS[0].targetID, r.targetID);
      }
      if (relationships.FATHERS[0]) {
        g.setEdge(relationships.FATHERS[0].targetID, r.targetID);
      }
    }
  }

  if (relationships.WIVES && relationships.WIVES.length !== 0) {
    for (let i = 0; i < relationships.WIVES.length; i++) {
      let r = relationships.WIVES[i];
      g.setNode(r.targetID, {
        label: r.target,
        width: width,
        height: height,
        shape: "ellipse"
      });
      g.setEdge(r.targetID, id, {
        label: "wife",
        style: "stroke: black; stroke-width: 2px;",
        arrowhead: "undirected"
      });
    }
  }

  if (relationships.HUSBANDS && relationships.HUSBANDS.length !== 0) {
    for (let i = 0; i < relationships.HUSBANDS.length; i++) {
      let r = relationships.HUSBANDS[i];
      g.setNode(r.targetID, {
        label: r.target,
        width: width,
        height: height,
        shape: "ellipse"
      });
      g.setEdge(r.targetID, id, {
        label: "husband",
        style: "stroke: black; stroke-width: 2px;",
        arrowhead: "undirected"
      });
    }
  }

  // Add nodes for children, and add links for other parents of children (aka. mistresses but not spouses)
  if (relationships.CHILDREN && relationships.CHILDREN.length !== 0) {
    for (let i = 0; i < relationships.CHILDREN.length; i++) {
      let r = relationships.CHILDREN[i].child;
      for (let j = 0; j < r.length; j++) {
        if (
          entities[r[j].targetID] &&
          entities[r[j].targetID]["Type of entity"] === "Agent"
        ) {
          g.setNode(r[j].targetID, {
            label: r[j].target,
            width: width,
            height: height,
            shape: "ellipse"
          });
          g.setEdge(id, r[j].targetID, {
            label: "child",
            style: "stroke: black; stroke-width: 2px;"
          });
        } else if (
          entities[r[j].targetID] &&
          (entities[r[j].targetID]["Type of entity"] === "Collective (misc.)" ||
            entities[r[j].targetID]["Type of entity"] ===
              "Collective (genealogical)")
        ) {
          g.setNode(r[j].targetID, {
            label: r[j].target,
            width: width,
            height: height,
            shape: "ellipse",
            style: "stroke: red"
          });
          g.setEdge(id, r[j].targetID, {
            label: "child",
            style: "stroke: black; stroke-width: 2px;"
          });
        }
        g.setNode(relationships.CHILDREN[i].otherParentID, {
          label: getName(entities[relationships.CHILDREN[i].otherParentID]),
          width: width,
          height: height,
          shape: "ellipse"
        });
        g.setEdge(relationships.CHILDREN[i].otherParentID, r[j].targetID, {
          label: "other parent",
          style: "stroke: black; stroke-width: 2px;"
        });
      }
    }
  }

  let edges = g.edges();
  if (depth > 1) {
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
};
