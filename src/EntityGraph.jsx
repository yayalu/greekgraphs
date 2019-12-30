import React from "react";
import "./App.css";
import { getGraph } from "./GraphHandler";
import { checkNoRelations, getName } from "./DataCardHandler";
import entities from "./data/entities.json";
import * as d3 from "d3";
import dagreD3 from "dagre-d3";

class EntityGraph extends React.Component {
  // For Refs, see: https://stackoverflow.com/questions/33796267/how-to-use-refs-in-react-with-typescript
  // For general setup, see: https://stackoverflow.com/questions/32292622/react-component-with-dagre-d3-not-drawing-correctly/32293469#32293469
  // For findDOMNode in Typescript, see: https://stackoverflow.com/questions/32480321/using-react-finddomnode-in-typescript

  componentDidMount() {
    if (!checkNoRelations(this.props.relationships)) {
      let g = getGraph(1, this.props.id, this.props.relationships);
      console.log("Final connections found", g);
      var render = new dagreD3.render();
      let svg = d3.select(this.nodeTree);
      render(d3.select(this.nodeTreeGroup), g);
      svg.attr("height", g.graph().height + 40);
    }
  }

  componentDidUpdate() {
    /* d3.select(this.state.ref)
      .append("circle")
      .attr("r", 5)
      .attr("cx", "500px")
      .attr("cy", "500px")
      .attr("fill", "red"); */

    // Return the graph with populated nodes
    console.log("Accessed");
    if (!checkNoRelations(this.props.relationships)) {
      let g = getGraph(1, this.props.id, this.props.relationships);
      console.log("Final connections found", g.edges());

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
      let svg = d3.select(this.nodeTree);

      /* var svg = d3.select(ReactDOM.findDOMNode(this.nodeTreeRef));
      var svgGroup = d3.select(ReactDOM.findDOMNode(this.nodeTreeGroupRef)); */

      // Run the renderer. This is what draws the final graph.
      render(d3.select(this.nodeTreeGroup), g);

      // Center the graph
      // var xCenterOffset = 10; // svg.attr("width") - g.graph().width) / 2;
      // svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
      svg.attr("height", g.graph().height + 40);
    }
  }

  render() {
    return (
      /* <svg
        className="container"
        ref={this.setRef(new SVGSVGElement())}
        width={"500px"}
        height={"500px"}
      ></svg> */

      /* <div>
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
      </div> */

      <div
        style={{ maxWidth: "100%", maxHeight: "20rem", textAlign: "center" }}
      >
        <svg
          id="nodeTree"
          ref={ref => {
            this.nodeTree = ref;
          }}
          width="150%"
          height="1000"
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
//   constructor() {
//     super();
//   }

//   componentDidUpdate() {
//     if (!checkNoRelations(this.props.relationships)) {
//       // Create the input graph
//       let g = new dagreD3.graphlib.Graph().setGraph({
//         name: getName(entities[this.props.id]) + " relationships"
//       });
//       // Set an object for the graph label
//       // g.setGraph({});

//       // Default to assigning a new object as a label for each new edge.
//       g.setDefaultEdgeLabel(function() {
//         return {};
//       });

//       // Add nodes to the graph. The first argument is the node id. The second is
//       // metadata about the node. In this case we're going to add labels to each of
//       // our nodes.

//       //     let g = getGraph(1, this.props.id, this.props.relationships);

//       g.setNode("kspacey", { label: "Kevin Spacey", width: 144, height: 100 });
//       g.setNode("swilliams", {
//         label: "Saul Williams",
//         width: 160,
//         height: 100
//       });
//       g.setNode("bpitt", { label: "Brad Pitt", width: 108, height: 100 });
//       g.setNode("hford", { label: "Harrison Ford", width: 168, height: 100 });
//       g.setNode("lwilson", { label: "Luke Wilson", width: 144, height: 100 });
//       g.setNode("kbacon", { label: "Kevin Bacon", width: 121, height: 100 });

//       // Add edges to the graph.
//       g.setEdge("kspacey", "swilliams");
//       g.setEdge("swilliams", "kbacon");
//       g.setEdge("bpitt", "kbacon");
//       g.setEdge("hford", "lwilson");
//       g.setEdge("lwilson", "kbacon");

//       // don't know where is dagre coming from
//       //dagre.layout(g);

//       // Create the renderer
//       let render = new dagreD3.render();

//       // Set up an SVG group so that we can translate the final graph.
//       let svg = d3.select(this.nodeTree);

//       // Run the renderer. This is what draws the final graph.
//       render(d3.select(this.nodeTreeGroup), g);

//       svg.attr("height", g.graph().height + 40);
//     }
//   }

//   render() {
//     return (
//       <svg
//         id="nodeTree"
//         ref={ref => {
//           this.nodeTree = ref;
//         }}
//         width="960"
//         height="600"
//       >
//         <g
//           ref={r => {
//             this.nodeTreeGroup = r;
//           }}
//         />
//       </svg>
//     );
//   }
// }

export default EntityGraph;
