import React from "react";
import "./App.css";
import { getGraph } from "./GraphHandler";
import { checkNoRelations, checkNoMembers, getName } from "./DataCardHandler";
import entities from "./data/entities.json";
import passages from "./data/passages.json";
import relationships from "./data/relationships.json";
// import Konva from "konva";
import {
  Stage,
  Layer,
  Label,
  Tag,
  Line,
  Text,
  Group,
  Rect,
  Circle
} from "react-konva";

class EntityGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openInfoPage: { showDisputePage: false, showUnusualPage: false },
      graphContent: {}
    };
  }

  componentDidMount() {
    // Return the graph with populated nodes
    if (
      !checkNoRelations(JSON.parse(relationships[this.props.id]).relationships)
    ) {
      this.setState({ graphContent: getGraph(this.props.id) });
    }
  }

  // To add a scrollbar: https://stackoverflow.com/questions/56645156/how-to-add-a-scrollable-area-in-a-konva-stage
  render() {
    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Text text="Some text on canvas" fontSize={15} />
          <Rect
            x={20}
            y={50}
            width={100}
            height={100}
            fill="red"
            shadowBlur={10}
          />
          <Circle x={200} y={100} radius={50} fill="green" />
          <Line
            x={20}
            y={200}
            points={[0, 0, 100, 0, 100, 100]}
            tension={0.5}
            closed
            stroke="black"
            fillLinearGradientStartPoint={{ x: -50, y: -50 }}
            fillLinearGradientEndPoint={{ x: 50, y: 50 }}
            fillLinearGradientColorStops={[0, "red", 1, "yellow"]}
          />
        </Layer>
      </Stage>
    );
  }
}

export default EntityGraph;
