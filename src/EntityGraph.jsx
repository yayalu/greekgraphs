import React from "react";
import "./App.css";
import { getGraph } from "./GraphHandler";
import { checkNoRelations, checkNoMembers, getName } from "./DataCardHandler";
import entities from "./data/entities.json";
import * as d3 from "d3";
import dagreD3 from "dagre-d3";

class EntityGraph extends React.Component {
  // For Refs, see: https://stackoverflow.com/questions/33796267/how-to-use-refs-in-react-with-typescript
  // For general setup, see: https://stackoverflow.com/questions/32292622/react-component-with-dagre-d3-not-drawing-correctly/32293469#32293469
  // For findDOMNode in Typescript, see: https://stackoverflow.com/questions/32480321/using-react-finddomnode-in-typescript
  // How to use DagreJS https://dagrejs.github.io/project/dagre-d3/latest/demo/interactive-demo.html, https://github.com/dagrejs/graphlib/wiki/API-Reference
  // Zooming: https://jsfiddle.net/xa9rofm5/10/

  constructor(props) {
    super(props);
    this.handleClickedNode = this.handleClickedNode.bind(this);
  }

  componentDidUpdate() {
    // Return the graph with populated nodes
    if (
      !checkNoRelations(this.props.relationships) ||
      !checkNoMembers(this.props.members)
    ) {
      let g = getGraph(
        1,
        this.props.id,
        this.props.relationships,
        this.props.members
      );

      // Set up an SVG group so that we can translate the final graph.
      let svg = d3.select(this.nodeTree);
      let inner = d3.select(this.nodeTreeGroup);

      // Set up zoom support
      var zoom = d3.zoom().on("zoom", function() {
        inner.attr("transform", d3.event.transform);
      });
      svg.call(zoom);

      // Run the renderer. This is what draws the final graph.
      var render = new dagreD3.render();
      render(inner, g);

      // Center the graph
      var initialScale = 0.3;
      svg.call(
        zoom.transform,
        d3.zoomIdentity
          .translate(
            (svg.attr("viewBox").split(" ")[2] -
              g.graph().width * initialScale) /
              2,
            20
          )
          .scale(initialScale)
      );

      svg.attr("height", g.graph().height * initialScale + 40);
      console.log("viewBox", svg.attr("viewBox"));

      var nodeSelected = svg.selectAll("g.node");
      nodeSelected.on("click", this.handleClickedNode);
    }
  }

  handleClickedNode(id) {
    this.props.relationshipClicked(id);
  }

  render() {
    return (
      <div
        style={{
          maxWidth: "80%",
          maxHeight: "20rem",
          padding: "1rem 7rem 1rem 7rem",
          textAlign: "center"
        }}
      >
        <h1>Relationship Graph for {getName(entities[this.props.id])}</h1>
        <div style={{ marginBottom: "2rem" }}>
          <h2>Legend:</h2>
          <div style={{ marginBottom: "2rem", marginTop: "2rem" }}>
            <span id="legend-mainnode">Main node</span>
            <span id="legend-relationnode">Agent relationship node</span>
            <span id="legend-collectivenode">Collective relationship node</span>
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <span id="legend-relationedge">Genealogical connection</span>
            <span id="legend-disputededge">Disputed connection</span>
            <span id="legend-unusualedge">Unusual connection</span>
          </div>
        </div>
        <svg
          id="nodeTree"
          ref={ref => {
            this.nodeTree = ref;
          }}
          // width="80%"
          // height"1000"
          viewBox="0 0 800 500"
          style={{ border: "1px solid black", marginBottom: "2rem" }}
        >
          <g
            ref={r => {
              this.nodeTreeGroup = r;
            }}
          />
        </svg>
      </div>
    );
  }
}

export default EntityGraph;
