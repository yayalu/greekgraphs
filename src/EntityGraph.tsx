import React from "react";
import "./App.css";
import { getGraph } from "./GraphHandler";
import entities from "./data/entities.json";

type GraphProps = { id: string; relationships: any };
type GraphState = {};

class EntityGraph extends React.Component<GraphProps, GraphState> {
  constructor(props: any) {
    super(props);
  }

  getName(id: string) {
    return entities[id]["Name (Smith & Trzaskoma)"];
  }

  render() {
    getGraph(2, this.props.id, this.props.relationships);
    return <div></div>;
  }
}

export default EntityGraph;
