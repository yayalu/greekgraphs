import React from "react";
import "./App.css";

type GraphProps = { id: string };
type GraphState = {};

class EntityGraph extends React.Component<GraphProps, GraphState> {
  constructor(props: any) {
    super(props);
    // this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  render() {
    return (
      <div style={{ paddingTop: "4rem", textAlign: "center" }}>
        <img
          src={require("./images/logo.svg")}
          alt="Manto logo"
          style={{ width: "20%" }}
        ></img>
      </div>
    );
  }
}

export default EntityGraph;
