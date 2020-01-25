import React from "react";
import "./App.css";
import { getGraph } from "./GraphHandler";
import { checkNoRelations, getName } from "./DataCardHandler";
import entities from "./data/entities.json";
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
      nodeHorizontalSpacing: 60,
      nodeVerticalSpacing: 100
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

  parentEdge(props) {
    const { ctx, leftX, rightX, y } = props;
    ctx.beginPath();
    ctx.moveTo(leftX - 20, y + this.state.nodeHeight / 2);
    ctx.lineTo(leftX - 20, y + this.state.nodeHeight + 20);
    ctx.lineTo(rightX + 20, y + this.state.nodeHeight + 20);
    ctx.lineTo(rightX + 20, y + this.state.nodeHeight / 2);
    ctx.stroke();
  }

  componentDidUpdate() {
    let nodePositions = {};
    let nodeWidth = this.state.nodeWidth;
    let nodeHeight = this.state.nodeHeight;
    let nodeHorizontalSpacing = this.state.nodeHorizontalSpacing;
    let nodeVerticalSpacing = this.state.nodeVerticalSpacing;

    // Return the graph with populated nodes
    if (
      !checkNoRelations(JSON.parse(relationships[this.props.id]).relationships)
    ) {
      let graphContent = getGraph(this.props.id);
      console.log(graphContent);

      //Set the scrollbar for the canvas to start in the centre
      let canvasDiv = this.refs.canvasOuterDiv;
      canvasDiv.scrollLeft = 1900;

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

      /**************************************************/
      /*  DEPTH -1 - MOTHERS, FATHERS & DIVINE PARENTS  */
      /**************************************************/
      let extension = 1;
      let level =
        nodePositions[this.props.id].y1 - nodeVerticalSpacing - nodeHeight;
      let allParents = JSON.parse(relationships[this.props.id]).relationships
        .FATHERS;
      let mothers = JSON.parse(relationships[this.props.id]).relationships
        .MOTHERS;
      mothers.forEach(m => {
        allParents.push(m);
      });

      if (allParents.length > 0) {
        Object.values(graphContent.nodes).forEach(node => {
          if (node.depth === -1 && node.id !== this.props.id) {
            if (extension % 2 === 0) {
              let rightX =
                nodePositions[this.props.id].x1 +
                (nodeHorizontalSpacing + nodeWidth) * extension * 0.5;
              let rightY = level;
              this.node({
                ctx,
                x: rightX,
                y: rightY,
                text: getName(entities[node.id])
              });
              nodePositions[node.id] = {
                x1: rightX,
                y1: rightY,
                x2: rightX + nodeWidth,
                y2: rightY + nodeHeight
              };
            } else {
              let leftX =
                nodePositions[this.props.id].x1 -
                (nodeHorizontalSpacing + nodeWidth) * (extension - 1) * 0.5;
              let leftY = level;
              this.node({
                ctx,
                x: leftX,
                y: leftY,
                text: getName(entities[node.id])
              });
              nodePositions[node.id] = {
                x1: leftX,
                y1: leftY,
                x2: leftX + nodeWidth,
                y2: leftY + nodeHeight
              };
            }
            extension++;
          }
        });

        let leftmost = nodePositions[this.props.id].x1;
        let rightmost = nodePositions[this.props.id].x2;
        for (let i = 0; i < allParents.length; i++) {
          if (nodePositions[allParents[i].targetID].x1 < leftmost) {
            leftmost = nodePositions[allParents[i].targetID].x1;
          }
          if (nodePositions[allParents[i].targetID].x2 > rightmost) {
            rightmost = nodePositions[allParents[i].targetID].x2;
          }
        }
        this.parentEdge({
          ctx,
          leftX: leftmost,
          rightX: rightmost,
          y: level
        });
      }

      // Connect parents:

      /***********************************/
      /*  DEPTH 0 - SIBLINGS AND SPOUSES */
      /***********************************/

      extension = 0;
      //Loop through all depth 0 nodes and add them into the graph
      Object.values(graphContent.nodes).forEach(node => {
        if (node.depth === 0 && node.id !== this.props.id) {
          // The following means the main node is centred, and the other nodes fan out alongside the main node.
          if (extension % 2 === 0) {
            let rightNodeX =
              nodePositions[this.props.id].x2 +
              nodeHorizontalSpacing +
              (nodeWidth + nodeHorizontalSpacing) * extension * 0.5;
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
              x2: rightNodeX + nodeWidth,
              y2: rightNodeY + nodeHeight
            };
          } else {
            let leftNodeX =
              nodePositions[this.props.id].x1 -
              nodeHorizontalSpacing -
              nodeWidth -
              (nodeWidth + nodeHorizontalSpacing) * (extension - 1) * 0.5;
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
              x2: leftNodeX + nodeWidth,
              y2: leftNodeY + nodeHeight
            };
          }
          extension++;
        }
      });

      Object.values(graphContent.edges).forEach(edge => {
        if (edge.relation === "spouse") {
          let edgeStart = {};
          let edgeEnd = {};
          if (nodePositions[this.props.id].x1 < nodePositions[edge.to].x1) {
            edgeStart = {
              x: nodePositions[this.props.id].x2,
              y: nodePositions[this.props.id].y1
            };
            edgeEnd = {
              x: nodePositions[edge.to].x1,
              y: nodePositions[edge.to].y1 - nodeHeight / 2
            };
          } else {
            edgeStart = {
              x: nodePositions[this.props.id].x1,
              y: nodePositions[this.props.id].y1
            };
            edgeEnd = {
              x: nodePositions[edge.to].x1,
              y: nodePositions[edge.to].y1 - nodeHeight / 2
            };
          }
          this.edge({
            ctx,
            fromX: edgeStart.x,
            fromY: edgeStart.y,
            toX: edgeEnd.x,
            toY: edgeEnd.y
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
          ref="canvasOuterDiv"
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
