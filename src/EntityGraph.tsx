import React from "react";
import "./App.css";

type GraphProps = { id: string };
type GraphState = {};

class EntityGraph extends React.Component<GraphProps, GraphState> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return <div style={{ paddingTop: "4rem", textAlign: "center" }}></div>;
  }
}

export default EntityGraph;
