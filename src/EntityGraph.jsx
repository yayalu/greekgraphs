import React from "react";
import "./App.css";
import { getGraph } from "./GraphHandler";
import { checkNoRelations, checkNoMembers, getName } from "./DataCardHandler";
import entities from "./data/entities.json";
import passages from "./data/passages.json";
import relationships from "./data/relationships.json";

class EntityGraph extends React.Component {
  // For Refs, see: https://stackoverflow.com/questions/33796267/how-to-use-refs-in-react-with-typescript
  // For general setup, see: https://stackoverflow.com/questions/32292622/react-component-with-dagre-d3-not-drawing-correctly/32293469#32293469
  // For findDOMNode in Typescript, see: https://stackoverflow.com/questions/32480321/using-react-finddomnode-in-typescript
  // How to use DagreJS https://dagrejs.github.io/project/dagre-d3/latest/demo/interactive-demo.html, https://github.com/dagrejs/graphlib/wiki/API-Reference
  // Zooming: https://jsfiddle.net/xa9rofm5/10/

  constructor(props) {
    super(props);
    this.state = {
      openInfoPage: { showDisputePage: false, showUnusualPage: false }
    };
  }

  componentDidUpdate() {
    // Return the graph with populated nodes
    if (!checkNoRelations(this.props.relationships)) {
      let g = getGraph(this.props.id);
    }
  }

  render() {
    return <div>Graph here</div>;
  }
}

export default EntityGraph;
