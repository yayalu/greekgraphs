import React from "react";
import "./App.css";
import { getGraph } from "./GraphHandler";
import { checkNoRelations, getName } from "./DataCardHandler";
import entities from "./data/entities.json";
import * as d3 from "d3";
import dagreD3 from "dagre-d3";
import { zoom } from "d3-zoom";

class EntityGraph extends React.Component {
  // For Refs, see: https://stackoverflow.com/questions/33796267/how-to-use-refs-in-react-with-typescript
  // For general setup, see: https://stackoverflow.com/questions/32292622/react-component-with-dagre-d3-not-drawing-correctly/32293469#32293469
  // For findDOMNode in Typescript, see: https://stackoverflow.com/questions/32480321/using-react-finddomnode-in-typescript
  // How to use DagreJS https://dagrejs.github.io/project/dagre-d3/latest/demo/interactive-demo.html
  // Zooming: https://jsfiddle.net/xa9rofm5/10/

  constructor(props) {
    super(props);
    this.handleClickedNode = this.handleClickedNode.bind(this);
  }

  componentDidUpdate() {
    // Return the graph with populated nodes
    if (!checkNoRelations(this.props.relationships)) {
      let g = getGraph(1, this.props.id, this.props.relationships);

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
      console.log("width", svg.attr("viewBox"));
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

      var nodeSelected = svg.selectAll("g.node");
      nodeSelected.on("click", this.handleClickedNode);
    }
  }

  handleClickedNode(id) {
    this.props.relationshipClicked(id);
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
        style={{
          maxWidth: "80%",
          maxHeight: "20rem",
          padding: "1rem 7rem 1rem 7rem"
        }}
      >
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
