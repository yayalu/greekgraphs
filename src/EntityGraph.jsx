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

  rect(props) {
    const { ctx, x, y, text } = props;
    ctx.ctx.strokeRect(75, 140, 150, 110);
    x, y, width, height;
  }

  componentDidMount() {
    // Return the graph with populated nodes
    if (
      !checkNoRelations(JSON.parse(relationships[this.props.id]).relationships)
    ) {
      let graphContent = getGraph(this.props.id);
      console.log(graphContent);

      // Provide context for graph - render graph on canvas
      // Uses HTML CanvasRenderingContext2D functions: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
      const ctx = this.refs.graphCanvas.getContext("2d");

      //Add in main node:
      this.rect({
        x: this.refs.graphCanvas.width / 2,
        y: this.refs.graphCanvas.height / 2,
        text: getName(entities[this.props.id])
      });
      // ctx.clearRect(0, 0, 300, 300);
      // draw children “components”
      /*this.rect({ ctx, x: 10, y: 10, width: 50, height: 50 });
      this.rect({ ctx, x: 110, y: 110, width: 50, height: 50 }); */
    }
  }

  // To add a scrollbar: https://stackoverflow.com/questions/56645156/how-to-add-a-scrollable-area-in-a-konva-stage
  render() {
    let width = "1500";
    let height = "600";
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Relationship Graph for {getName(entities[this.props.id])}</h1>
        <div style={{ marginBottom: "2rem" }}>
          <h2>Legend:</h2>
          <div style={{ marginBottom: "2rem", marginTop: "2rem" }}>
            {/* <span id="legend-mainnode">Main node</span> */}
            <span id="legend-relationnode">Agent node</span>
            <span id="legend-collectivenode">Collective node</span>
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <span id="legend-relationedge">Genealogical connection</span>
            <span id="legend-disputededge">Disputed tradition</span>
            <span id="legend-unusualedge">Unusual connection</span>
            <span id="legend-memberedge">Member of collective</span>
          </div>
        </div>
        {/*<Stage width={window.innerWidth} height={window.innerHeight}>
          <Layer>
            <Label x={window.innerWidth / 2} y={window.innerHeight / 2}>
              <Tag stroke="#333"></Tag>
              <Text
                text={getName(entities[this.props.id])}
                height={50}
                width={200}
                padding={20}
                fontSize={20}
                align={"center"}
              ></Text>
            </Label>
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
    </Stage>*/}
        <canvas
          ref="graphCanvas"
          width={width}
          height={height}
          style={{ border: "1px solid #000000" }}
        ></canvas>
      </div>
    );
  }
}

export default EntityGraph;
