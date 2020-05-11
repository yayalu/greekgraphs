import React from "react";
import "./App.css";
import { getGraph } from "./OldGraphHandler";
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

class OldEntityGraph extends React.Component {
  // Combining canvas tag with konva-react: https://lavrton.com/using-react-with-html5-canvas-871d07d8d753/
  constructor(props) {
    super(props);
    this.state = {
      openInfoPage: { showContestPage: false, showUnusualPage: false },
      nodeWidth: 80,
      nodeHeight: 30,
      nodeHorizontalSpacing: 60,
      nodeVerticalSpacing: 100,
      verticalOffset: 250
    };
  }

  node(props) {
    const { ctx, x, y, text } = props;
    if (text === "Unknown") {
      ctx.strokeStyle = "#848484";
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(x, y, this.state.nodeWidth, this.state.nodeHeight);
      ctx.fillText(text, x + 10, y + 20);
      ctx.setLineDash([]);
      ctx.strokeStyle = "#000";
    } else {
      ctx.strokeRect(x, y, this.state.nodeWidth, this.state.nodeHeight);
      ctx.fillText(text, x + 10, y + 20);
    }
  }

  edge(props) {
    const { ctx, fromX, fromY, toX, toY } = props;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY + this.state.nodeHeight / 2);
    ctx.lineTo(toX, toY + this.state.nodeHorizontalSpacing / 2);
    ctx.stroke();
  }

  parentEdge(props) {
    const {
      ctx,
      nodePositions,
      parent1,
      parent2,
      siblings,
      y,
      contested
    } = props;
    let parent1X = nodePositions[parent1].x1 + this.state.nodeWidth / 2;
    let parent2X = nodePositions[parent2].x1 + this.state.nodeWidth / 2;
    ctx.beginPath();
    if (contested) {
      ctx.strokeStyle = "#f00";
    }
    ctx.moveTo(parent1X, y + this.state.nodeHeight);
    ctx.lineTo(parent1X, y + this.state.nodeHeight + 20);
    ctx.lineTo(parent2X, y + this.state.nodeHeight + 20);
    ctx.lineTo(parent2X, y + this.state.nodeHeight);
    ctx.moveTo((parent1X + parent2X) / 2, y + this.state.nodeHeight + 20);
    ctx.lineTo((parent1X + parent2X) / 2, y + this.state.nodeHeight + 70);

    let centrePoint = {
      x: (parent1X + parent2X) / 2,
      y: y + this.state.nodeHeight + 70
    };
    Object.values(siblings).forEach(s => {
      ctx.moveTo(centrePoint.x, centrePoint.y);
      ctx.lineTo(s.x1 + this.state.nodeWidth / 2, centrePoint.y);
      ctx.lineTo(s.x1 + this.state.nodeWidth / 2, s.y1);
    });

    ctx.stroke();
    ctx.strokeStyle = "#000";
  }

  childEdge(props) {
    const { ctx, nodePositions, parents, children, nodeYOffset } = props;
    if (parents.length > 1) {
      // contested parentage
      ctx.strokeStyle = "#f00";
    }
    let newNodeYOffset = nodeYOffset;

    let mainLocation = {
      x: nodePositions[this.props.id].x1 + this.state.nodeWidth / 2,
      y: nodePositions[this.props.id].y1 + this.state.nodeHeight
    };

    if (parents.length === 0) {
      // Other parent is unknown
      parents.push("Unknown");
    }
    for (let i = 0; i < parents.length; i++) {
      //Start line at halfway point between coparents, and draw line between coparents
      ctx.beginPath();
      //Draw parent to parent half-rectangle
      ctx.moveTo(mainLocation.x, mainLocation.y);
      ctx.lineTo(mainLocation.x, mainLocation.y + newNodeYOffset);
      let otherParentLocation = {
        x: nodePositions[parents[i]].x1 + this.state.nodeWidth / 2,
        y: nodePositions[parents[i]].y1 + this.state.nodeHeight
      };
      ctx.lineTo(otherParentLocation.x, otherParentLocation.y + newNodeYOffset);
      ctx.lineTo(otherParentLocation.x, otherParentLocation.y);
      //Draw from middle of parent half-rectangle to child middle point
      ctx.moveTo(
        (otherParentLocation.x + mainLocation.x) / 2,
        otherParentLocation.y + newNodeYOffset
      );
      let middle = {
        x: (otherParentLocation.x + mainLocation.x) / 2,
        y:
          otherParentLocation.y +
          this.state.verticalOffset +
          newNodeYOffset +
          20
      };
      ctx.lineTo(middle.x, middle.y);
      //Start drawing child half-rectangles
      for (let j = 0; j < children.length; j++) {
        ctx.moveTo(middle.x, middle.y);
        console.log(
          "Move to",
          children[j].target,
          "from",
          getName(entities[parents[i]])
        );
        ctx.lineTo(
          nodePositions[children[j].targetID].x1 + this.state.nodeWidth / 2, //This is probably the area of change
          middle.y
        );
        ctx.lineTo(
          nodePositions[children[j].targetID].x1 + this.state.nodeWidth / 2,
          nodePositions[children[j].targetID].y1
        );
      }
      ctx.stroke();
      newNodeYOffset += 10;
    }
    ctx.strokeStyle = "#000";
    return newNodeYOffset;
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
      canvasDiv.scrollLeft = 4500;
      // Provide context for graph - render graph on canvas
      // Uses HTML CanvasRenderingContext2D functions: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
      const ctx = this.refs.graphCanvas.getContext("2d");

      /************************************************************************/
      /*    ~~~~~~    NODES   ~~~~~~~                                         */
      /************************************************************************/

      //Add in main node:
      let mainNodeWidth = this.refs.graphCanvas.width / 2;
      let mainNodeHeight = 200;
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

      /*  DEPTH -1 - MOTHERS, FATHERS & DIVINE PARENTS  */
      let extension = 1;
      let level =
        nodePositions[this.props.id].y1 - nodeVerticalSpacing - nodeHeight;
      let fathers = JSON.parse(relationships[this.props.id]).relationships
        .FATHERS;
      let mothers = JSON.parse(relationships[this.props.id]).relationships
        .MOTHERS;

      if (fathers.length > 0 || mothers.length > 0) {
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
      }

      /*  DEPTH 0 - SIBLINGS AND SPOUSES */
      //Loop through all depth 0 nodes and add them into the graph

      extension = 0;

      let depth0Nodes = [];
      Object.values(graphContent.nodes).forEach(node => {
        if (node.depth === 0 && node.id !== this.props.id) {
          depth0Nodes.push(node);
        }
      });
      let middleIndex = Math.floor(depth0Nodes.length / 2) - 1;
      let xPosition =
        nodePositions[this.props.id].x1 -
        (nodeWidth + nodeHorizontalSpacing) * (middleIndex + 1);
      for (let i = 0; i < depth0Nodes.length; i++) {
        this.node({
          ctx,
          x: xPosition,
          y: nodePositions[this.props.id].y1,
          text: getName(entities[depth0Nodes[i].id])
        });
        nodePositions[depth0Nodes[i].id] = {
          x1: xPosition,
          y1: nodePositions[this.props.id].y1,
          x2: xPosition + nodeWidth,
          y2: nodePositions[this.props.id] + nodeHeight
        };
        if (i === middleIndex) {
          xPosition = xPosition + (nodeWidth + nodeHorizontalSpacing) * 2;
        } else {
          xPosition = xPosition + nodeWidth + nodeHorizontalSpacing;
        }
      }

      /*  DEPTH 1 - CHILDREN */
      extension = 0;
      let siblings = JSON.parse(relationships[this.props.id]).relationships
        .SIBLINGS;
      let children = JSON.parse(relationships[this.props.id]).relationships
        .CHILDREN;
      // Get the depth of parents to place children nodes
      let numChildren = 0;
      let numParents = 0;
      let createUnknownNode = false;
      children.forEach(c => {
        numChildren += c.child.length;
        numParents += c.otherParentIDs.length; // Not the same number of actual parents, but more rather than less.
        if (c.otherParentIDs.length === 0) {
          createUnknownNode = true;
        }
      });
      if (createUnknownNode) {
        this.node({
          ctx,
          x:
            nodePositions[depth0Nodes[depth0Nodes.length - 1].id].x2 +
            nodeHorizontalSpacing,
          y: nodePositions[this.props.id].y1,
          text: "Unknown"
        });
        nodePositions["Unknown"] = {
          x1:
            nodePositions[depth0Nodes[depth0Nodes.length - 1].id].x2 +
            nodeHorizontalSpacing,
          y1: nodePositions[this.props.id].y1,
          x2:
            nodePositions[depth0Nodes[depth0Nodes.length - 1].id].x2 +
            nodeHorizontalSpacing +
            nodeWidth,
          y2: nodePositions[this.props.id].y1 + nodeHeight
        };
      }
      let startingX =
        nodePositions[this.props.id].x1 -
        (numChildren / 2) * (nodeWidth + nodeHorizontalSpacing);
      let startingY =
        nodePositions[this.props.id].y2 +
        this.state.verticalOffset +
        numParents * 10 +
        80;

      children.forEach(i => {
        for (let j = 0; j < i.child.length; j++) {
          this.node({
            ctx,
            x: startingX + extension * (nodeWidth + nodeHorizontalSpacing),
            y: startingY,
            text: getName(entities[i.child[j].targetID])
          });
          nodePositions[i.child[j].targetID] = {
            x1: startingX + extension * (nodeWidth + nodeHorizontalSpacing),
            y1: startingY,
            x2:
              startingX +
              extension * (nodeWidth + nodeHorizontalSpacing) +
              nodeWidth,
            y2: startingY + nodeHeight
          };
          extension++;
        }
      });

      /***************************************/
      /*      ~~~ EDGES ~~~~~                */
      /***************************************/

      /* PARENT EDGES LINKING TO SIBLING NODES (DEPTH 1 -> DEPTH 0)*/

      // Get location of all siblings
      // Add all siblings and pre-add the main node
      let connectedSiblings = {};
      connectedSiblings[this.props.id] = nodePositions[this.props.id];

      siblings.forEach(s => {
        connectedSiblings[s.targetID] = nodePositions[s.targetID];
      });
      // Get parents
      let contested = mothers.length > 1 || fathers.length > 1;
      let parentGroupings = [];
      if (mothers.length > 1) {
        mothers.forEach(m => {
          fathers.forEach(f => {
            parentGroupings.push({
              parent1: m.targetID,
              parent2: f.targetID
            });
          });
        });
      } else if (fathers.length > 1) {
        fathers.forEach(f => {
          mothers.forEach(m => {
            parentGroupings.push({
              parent1: m.targetID,
              parent2: f.targetID
            });
          });
        });
      } else {
        // No contested connections
        // TODO: Add when only one parent is known
        if (mothers.length !== 0 && fathers.length !== 0) {
          parentGroupings.push({
            parent1: mothers[0].targetID,
            parent2: fathers[0].targetID
          });
        }
      }

      parentGroupings.forEach(p => {
        this.parentEdge({
          ctx,
          nodePositions,
          parent1: p.parent1,
          parent2: p.parent2,
          y: level,
          siblings: connectedSiblings,
          contested: contested
        });
      });

      /* SPOUSES/COPARENTS LINKING TO CHILDREN EDGES */

      let nodeYOffset = 20;
      children.forEach(i => {
        let newNodeYOffset = this.childEdge({
          ctx,
          nodePositions,
          parents: i.otherParentIDs,
          children: i.child,
          nodeYOffset: nodeYOffset
        });
        nodeYOffset = newNodeYOffset;
      });
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
            <span id="legend-contestededge">Contested tradition</span>
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
            width={10000}
            height={1000}
          ></canvas>
        </div>
      </div>
    );
  }
}

export default OldEntityGraph;
