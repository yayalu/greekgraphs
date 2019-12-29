import React from "react";
import "./App.css";
import { getGraph } from "./GraphHandler";
import * as d3 from "d3";
// import { getName } from "./DataCardHandler";
// import entities from "./data/entities.json";

type GraphProps = { id: string; relationships: any };
type GraphState = { ref: any };

class EntityGraph extends React.Component<GraphProps, GraphState> {
  constructor(props: any) {
    super(props);
    this.state = {
      ref: SVGSVGElement
    };
  }

  componentDidMount() {
    // getGraph(1, this.props.id, this.props.relationships);
    /* d3.select(this.state.ref)
      .append("circle")
      .attr("r", 5)
      .attr("cx", "500px")
      .attr("cy", "500px")
      .attr("fill", "red"); */
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
    );
  }
}

export default EntityGraph;
