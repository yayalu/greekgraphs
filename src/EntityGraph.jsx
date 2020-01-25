import React from "react";
import "./App.css";
import { getGraph } from "./GraphHandler";
import { checkNoRelations, checkNoMembers, getName } from "./DataCardHandler";
import entities from "./data/entities.json";
import passages from "./data/passages.json";
import relationships from "./data/relationships.json";
// import Konva from "konva";
/* import {
  Stage,
  Layer,
  Label,
  Tag,
  Line,
  Text,
  Group,
  Rect,
  Circle
} from "react-konva"; */

class EntityGraph extends React.Component {
  // Combining canvas tag with konva-react: https://lavrton.com/using-react-with-html5-canvas-871d07d8d753/
  constructor(props) {
    super(props);
    this.state = {
      openInfoPage: { showDisputePage: false, showUnusualPage: false },
      nodeWidth: 80,
      nodeHeight: 30,
      nodeHorizontalSpacing: 60
    };
  }

  node(props) {
    const { ctx, x, y, text } = props;
    ctx.strokeRect(x, y, this.state.nodeWidth, this.state.nodeHeight);
    // ctx.font = "20px Arial";
    ctx.fillText(text, x + 10, y + 20);
  }

  edge(props) {
    const { ctx, fromX, fromY, toX, toY } = props;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY + this.state.nodeHeight / 2);
    ctx.lineTo(toX, toY + this.state.nodeHorizontalSpacing / 2);
    ctx.stroke();
  }

  componentDidUpdate() {
    let nodePositions = {};
    let nodeWidth = this.state.nodeWidth;
    let nodeHeight = this.state.nodeHeight;
    let nodeHorizontalSpacing = this.state.nodeHorizontalSpacing;

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
      let mainNodeWidth = this.refs.graphCanvas.width / 2;
      let mainNodeHeight = this.refs.graphCanvas.height / 2;
      this.node({
        ctx,
        x: mainNodeWidth,
        y: mainNodeHeight,
        text: getName(entities[this.props.id])
      });
      nodePositions[this.props.id] = {
        x1: mainNodeWidth,
        y1: mainNodeHeight,
        x2: mainNodeWidth + this.state.nodeWidth,
        y2: mainNodeHeight + this.state.nodeHeight
      };

      /***********************************/
      /*  DEPTH 0 - SIBLINGS AND SPOUSES */
      /***********************************/

      //Loop through all depth 0 nodes and add them into the graph
      let extension = 0;
      Object.values(graphContent.nodes).forEach(node => {
        if (node.depth === 0 && node.id !== this.props.id) {
          // The following means the main node is centred, and the other nodes fan out alongside the main node.
          if (extension % 2 === 0) {
            let rightNodeX =
              nodePositions[this.props.id].x2 +
              nodeHorizontalSpacing +
              nodeHorizontalSpacing * extension;
            let rightNodeY = nodePositions[this.props.id].y1;
            this.node({
              ctx,
              x: rightNodeX,
              y: rightNodeY,
              text: getName(entities[node.id])
            });
            nodePositions[node.id] = {
              x1: rightNodeX,
              y1: rightNodeY,
              x2: rightNodeX + nodeHorizontalSpacing,
              y2: rightNodeY + nodeHorizontalSpacing
            };
          } else {
            let leftNodeX =
              nodePositions[this.props.id].x1 -
              nodeWidth -
              nodeHorizontalSpacing -
              nodeHorizontalSpacing * (extension - 1);
            let leftNodeY = nodePositions[this.props.id].y1;
            this.node({
              ctx,
              x: leftNodeX,
              y: leftNodeY,
              text: getName(entities[node.id])
            });
            nodePositions[node.id] = {
              x1: leftNodeX,
              y1: leftNodeY,
              x2: leftNodeX - nodeHorizontalSpacing,
              y2: leftNodeY - nodeHorizontalSpacing
            };
          }
          extension++;
        }
      });

      Object.values(graphContent.edges).forEach(edge => {
        if (edge.relation === "spouse") {
          this.edge({
            ctx,
            fromX: nodePositions[edge.from].x1,
            fromY: nodePositions[edge.from].y1,
            toX: nodePositions[edge.to].x1,
            toY: nodePositions[edge.to].y1
          });
        }
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
        <div
          style={{
            overflow: "scroll",
            border: "1px solid #000000",
            maxWidth: "100%",
            maxHeight: "100%",
            textAlign: "center"
          }}
        >
          <canvas
            ref="graphCanvas"
            id="responsive-canvas"
            width={5000}
            height={500}
          ></canvas>
        </div>
      </div>
    );
  }
}

export default EntityGraph;
