import React from "react";
import "./App.css";
import { getGraph } from "./GraphHandler";
// import { getName } from "./DataCardHandler";
// import entities from "./data/entities.json";

type GraphProps = { id: string; relationships: any };
type GraphState = {};

class EntityGraph extends React.Component<GraphProps, GraphState> {
  constructor(props: any) {
    super(props);
  }

  render() {
    {
      getGraph(1, this.props.id, this.props.relationships);
    }
    return <div></div>;
  }
}

export default EntityGraph;
