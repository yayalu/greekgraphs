import React from "react";
import "./App.css";
import { getGraph } from "./GraphHandler";
import { checkNoRelations } from "./DataCardHandler";
import * as d3 from "d3";
import dagreD3 from "dagre-d3";
import ReactDOM from "react-dom";
// import { getName } from "./DataCardHandler";
// import entities from "./data/entities.json";


class EntityGraph extends React.Component<GraphProps, GraphState> {
  // For Refs, see: https://stackoverflow.com/questions/33796267/how-to-use-refs-in-react-with-typescript
  // For general setup, see: https://stackoverflow.com/questions/32292622/react-component-with-dagre-d3-not-drawing-correctly/32293469#32293469
  // For findDOMNode in Typescript, see: https://stackoverflow.com/questions/32480321/using-react-finddomnode-in-typescript

  private nodeTreeRef: React.RefObject<SVGElement>;
  private nodeTreeGroupRef: React.RefObject<SVGElement>;

  constructor(props: any) {
    super(props);
    this.nodeTreeRef = React.createRef();
    this.nodeTreeGroupRef = React.createRef();
  }

  componentDidMount() {
    /* d3.select(this.state.ref)
      .append("circle")
      .attr("r", 5)
      .attr("cx", "500px")
      .attr("cy", "500px")
      .attr("fill", "red"); */

    // Return the graph with populated nodes
    if (!checkNoRelations(this.props.relationships)) {
      let g = getGraph(1, this.props.id, this.props.relationships);
      console.log("Final connections found", g.edges(), "with final graph", g);

      /* 
      // Create the renderer
      var renderer = new dagreD3.render();

      // Set up an SVG group so that we can translate the final graph.
      var svg = d3.select("svg"),
        svgGroup = svg.append("g");

      //Run the renderer, draw the final graph
      renderer(d3.select("svg g"), g);
      */

      // Create the renderer
      var render = new dagreD3.render();

      // Set up an SVG group so that we can translate the final graph.
      var svg = d3.select(ReactDOM.findDOMNode(this.nodeTreeRef));
      var svgGroup = d3.select(ReactDOM.findDOMNode(this.nodeTreeGroupRef));

      // Run the renderer. This is what draws the final graph.
      render("svg", "g");

      // Center the graph
      var xCenterOffset = 10; // svg.attr("width") - g.graph().width) / 2;
      svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
      svg.attr("height", g.graph().height + 40);
    }
  }

  setRef(ref: SVGSVGElement) {
    this.setState({ ref: ref });
    return this.state.ref;
  }

  render() {
    return (
      /* <svg
        className="container"
        ref={this.setRef(new SVGSVGElement())}
        width={"500px"}
        height={"500px"}
      ></svg> */

      <div>
        <div style={{ border: "1px solid red" }}>
          <svg id="nodeTree" ref="nodeTreeRef" width="960" height="600">
            <g ref="nodeTreeGroupRef" />
          </svg>
        </div>
        <svg
          viewBox="0 0 300 100"
          xmlns="http://www.w3.org/2000/svg"
          stroke="red"
          fill="grey"
        >
          <circle cx="50" cy="50" r="40" />
          <circle cx="150" cy="50" r="4" />

          <svg viewBox="0 0 10 10" x="200" width="100">
            <circle cx="5" cy="5" r="4" />
          </svg>
        </svg>
      </div>
    );
  }
}

export default EntityGraph;
