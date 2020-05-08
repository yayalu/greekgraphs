// template from: https://konvajs.org/docs/react/index.html
// Refs (stage and components): https://reactjsexample.com/react-binding-to-canvas-element-via-konva-framework/
import React, { Component } from "react";
import Konva from "konva";
import { Stage, Layer, Star, Text, Rect, Line, Polygon } from "react-konva";
import relationships from "./data/relationships.json";
import { getName } from "./DataCardHandler";
import entities from "./data/entities.json";

class EntityGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allShapes: [],
      stageRef: undefined,
      graphAttr: {
        initX: 50,
        spaceX: 200,
        nodeWidth: 150,
        nodeHeight: 80,
        NegOneY: 50,
        ZeroY: 250,
        PosOneY: 450
      },
      connectedShapes: ["edge1", "node3", "node5"], // Nodes and links that are connected with each other
      depthNodes: {
        depthNegOne: [],
        depthZero: [],
        depthPosOne: []
      },
      lineLinks: [],
      entityData: {},
      id: ""
    };
    this.getDepthNodes = this.getDepthNodes.bind(this);
  }

  /*****************************************************
   *
   *
   *   SETUP METHODS
   *
   *
   *****************************************************/
  componentDidMount() {
    // log stage react wrapper (reference)
    console.log(this.refs.stage);
    // log Konva.Stage instance (reference)
    console.log(this.refs.stage.getStage());
    // Get all children from the stage (equiiv. to stage.layers.<allchildren>)
    // Get the object with the specified name (use "."+name)
    console.log(this.refs.stage.find(".name1"));
    // Use "each()" operator to sift through all items in the collection
    // Use "each" here and "forEach" everywhere else and when referencinig this.state.allShapes
    this.refs.stage.children[1].children.each(function(shape) {
      console.log("Test", shape.attrs.id);
    });
    console.log(this.refs.stage.children[1].children);
    console.log("IDs:", JSON.parse(relationships[this.props.id]));
    let entityData = JSON.parse(relationships[this.props.id]);

    // Set states
    this.setState({
      allShapes: this.refs.stage.children[1].children,
      stageRef: this.refs.stage,
      id: this.props.id,
      entityData: entityData,
      depthNodes: this.getDepthNodes(entityData)
    });
  }

  componentDidUpdate() {
    if (this.props.id !== this.state.id) {
      let entityData = JSON.parse(relationships[this.props.id]);
      let depthNodes = this.getDepthNodes(entityData);

      // Create a connection calculator here

      //Test set for getRelationshipLinks
      let connections = ["8189678", "8188419", "8187829", "8182233"];

      this.setState({
        id: this.props.id,
        entityData: entityData,
        depthNodes: depthNodes,
        lineLinks: this.getRelationshipLine(depthNodes, connections)
      });
    }
  }

  getRandomPoints = () => {
    let edge = [];
    this.state.allShapes.forEach(function(shape) {
      edge.push(shape.attrs.x + 75);
      edge.push(shape.attrs.y + 40);
    });
    return edge;
  };

  /*****************************************************
   *
   *
   *   GETTERS AND SETTERS
   *
   *
   *****************************************************/

  /* GET ALL NODES AND THEIR DEPTHS / GENERATION */
  getDepthNodes = entityData => {
    let depthNegOne = [],
      depthZero = [],
      depthPosOne = [];

    //Parents and step-parents depth -1
    entityData.relationships.MOTHERS.forEach(m => {
      depthNegOne.push(m.targetID);
    });
    entityData.relationships.FATHERS.forEach(f => {
      depthNegOne.push(f.targetID);
    });
    entityData.relationships.CREATORS.forEach(c => {
      depthNegOne.push(c.targetID);
    });
    entityData.relationships.BORNFROM.forEach(b => {
      depthNegOne.push(b.targetID);
    });

    //siblings, twins and spouses depth 0
    entityData.relationships.SIBLINGS.forEach(s => {
      depthZero.push(s.targetID);
    });
    entityData.relationships.TWIN.forEach(t => {
      depthZero.push(t.targetID);
    });
    entityData.relationships.SPOUSES.forEach(s => {
      depthZero.push(s.targetID);
    });

    // + all other parents
    //children depth +1
    for (let d = 0; d < entityData.relationships.CHILDREN.length; d++) {
      entityData.relationships.CHILDREN[d].child.forEach(c => {
        depthPosOne = this.checkForDuplicates(depthPosOne, c.targetID);
      });
      entityData.relationships.CHILDREN[d].otherParentIDs.forEach(p => {
        depthZero = this.checkForDuplicates(depthZero, p); // NOte that the above deals with entityInfo type, but this (aka. highlighted node) is just ID
      });
    }

    depthZero.splice(Math.ceil(depthZero.length / 2), 0, this.props.id); // NOte that the above deals with entityInfo type, but this (aka. highlighted node) is just ID
    return {
      depthNegOne: depthNegOne,
      depthZero: depthZero,
      depthPosOne: depthPosOne
    };
  };

  checkForDuplicates = (arr, e) => {
    if (arr.includes(e)) {
      return arr;
    } else {
      arr.push(e);
      return arr;
    }
  };

  /* GET LINES AND THEIR CONNECTIONS BETWEEN NODES */

  // Create an array holding all relationships between entities, parent+parent->children+siblings [[P,P,C,S], [...]]
  getRelationshipLine = (depthNodes, connections) => {
    // connections ] [P,P,C,S...]

    // Separate connections by depth
    // Notice have used all three depths here due to incest possibility
    let d = { depthNegOne: [], depthZero: [], depthPosOne: [] };
    for (let i = 0; i < connections.length; i++) {
      if (depthNodes.depthNegOne.includes(connections[i])) {
        d.depthNegOne.push(connections[i]);
      } else if (depthNodes.depthZero.includes(connections[i])) {
        d.depthZero.push(connections[i]);
      } else if (depthNodes.depthPosOne.includes(connections[i])) {
        d.depthPosOne.push(connections[i]);
      } else {
      }
    }

    let linePoints = [];

    /*
     *    (p1)                  (p2)
     *     |                     ^ |
     *     |                     | |
     *     v                     | v
     *    (p1L)---------------->(p2L)
     *               (pM)<---------
     *                |
     *                |
     *                v
     *  (c1U)<------(cM)     /->(c2U)
     *    | ^ --------------/     |
     *    | |                     |
     *    v |                     v
     *   (c1)                   (c2)
     */

    // [P1, P1L, P2L, P2, P2L, PM, CU, C1U, C1, C1U, C2U, C2]
    //Connect parent nodes
    // if (d.depthNegOne.length > 0 && d.depthZero.length > 0) {
    let width = this.state.graphAttr.nodeWidth;
    let height = this.state.graphAttr.nodeHeight;
    let diff = 50;
    let initX = this.state.graphAttr.initX;
    let spaceX = this.state.graphAttr.spaceX;

    // if (d.depthNegOne.length === 2) {
    //Test with Leto+Zeus->Apollo&Artemis for now
    let parentOneIndex = depthNodes.depthNegOne.indexOf(d.depthNegOne[0]);
    let parentTwoIndex = depthNodes.depthNegOne.indexOf(d.depthNegOne[1]);
    let childOneIndex = depthNodes.depthZero.indexOf(d.depthZero[0]);
    let childTwoIndex = depthNodes.depthZero.indexOf(d.depthZero[1]);
    // X values
    let P1_X = initX + parentOneIndex * spaceX + width / 2; // P1_X & P1L_X
    let P2_X = initX + parentTwoIndex * spaceX + width / 2; // P1_Y & P1L_Y
    let PM_X = (P1_X + P2_X) / 2; //PM_X & CM_X
    let C1_X = initX + childOneIndex * spaceX + width / 2; //C1_X & C2U_X
    let C2_X = initX + childTwoIndex * spaceX + width / 2; //C2_X & C2U_X
    // Y values
    let P_Y = this.state.graphAttr.NegOneY + height; //P1_Y & P2_Y
    let PL_Y = P_Y + diff; //P1L_Y & P2L_Y & PM_Y
    let C_Y = this.state.graphAttr.ZeroY; //C1_Y & C2_Y
    let CU_Y = C_Y - diff; //C1U_Y & C2U_Y & CM_Y

    // Push line
    linePoints = [
      P1_X,
      P_Y,
      P1_X,
      PL_Y,
      P2_X,
      PL_Y,
      P2_X,
      P_Y,
      P2_X,
      PL_Y,
      PM_X,
      PL_Y,
      PM_X,
      CU_Y,
      C1_X,
      CU_Y,
      C1_X,
      C_Y,
      C1_X,
      CU_Y,
      C2_X,
      CU_Y,
      C2_X,
      C_Y
    ];
    /*  }
    } else if (d.depthZero.length > 0 && d.depthPosOne.length > 0) {
    } else {
      //deal with the intergenerational/incestual relationships here
    } */
    console.log("linePoints", linePoints);
    return linePoints;
  };

  /****************************************************
   *
   *
   *   EVENT HANDLERS
   *
   *
   ****************************************************/

  handleMouseOverNode = e => {
    document.body.style.cursor = "pointer";
    e.target.to({
      strokeWidth: 8
    });
  };
  handleMouseOutNode = e => {
    document.body.style.cursor = "default";
    e.target.to({
      strokeWidth: 4
    });
  };

  handleMouseOverLine = e => {
    /* if (e.target.attrs.name === "edge1") {
      this.state.connectedShapes.forEach(s => {
        let item = this.state.stageRef.find("." + s);
        if (item.length > 0) { 
          item.to({
            strokeWidth: 8
          });
        }
      });
    }*/
    document.body.style.cursor = "pointer";
    e.target.to({
      strokeWidth: 8
    });
  };
  handleMouseOutLine = e => {
    /*
    if (e.target.attrs.name === "edge1") {
      this.state.connectedShapes.forEach(s => {
        let item = this.state.stageRef.find("." + s);
        if (item.length > 0) {
          item.to({
            strokeWidth: 4
          });
        }
      });
    } */
    document.body.style.cursor = "default";
    e.target.to({
      strokeWidth: 4
    });
  };

  handlePageChange = e => {
    console.log("Page change", e.target.attrs.id);
    this.props.relationshipClicked(e.target.attrs.id);
  };

  /****************************************************
   *
   *
   *   RENDERING
   *
   *
   ****************************************************/

  render() {
    {
      console.log(this.state.depthNodes);
    }
    return (
      <Stage ref="stage" width={4000} height={2000}>
        <Layer>
          {this.state.depthNodes.depthNegOne.map((e, i) => (
            <Text
              x={this.state.graphAttr.initX + this.state.graphAttr.spaceX * i}
              ref="text"
              y={this.state.graphAttr.NegOneY}
              text={getName(entities[e])}
              fontSize={18}
              fontFamily="Calibri"
              fontStyle="bold"
              fill="#000"
              width={this.state.graphAttr.nodeWidth}
              height={this.state.graphAttr.nodeHeight}
              padding={20}
              align="center"
            />
          ))}
          {this.state.depthNodes.depthZero.map((e, i) => (
            <Text
              x={this.state.graphAttr.initX + this.state.graphAttr.spaceX * i}
              ref="text"
              y={this.state.graphAttr.ZeroY}
              text={getName(entities[e])}
              fontSize={18}
              fontFamily="Calibri"
              fontStyle="bold"
              fill="#000"
              width={this.state.graphAttr.nodeWidth}
              height={this.state.graphAttr.nodeHeight}
              padding={20}
              align="center"
            />
          ))}
          {this.state.depthNodes.depthPosOne.map((e, i) => (
            <Text
              x={this.state.graphAttr.initX + this.state.graphAttr.spaceX * i}
              ref="text"
              y={this.state.graphAttr.PosOneY}
              text={getName(entities[e])}
              fontSize={18}
              fontFamily="Calibri"
              fontStyle="bold"
              fill="#000"
              width={this.state.graphAttr.nodeWidth}
              height={this.state.graphAttr.nodeHeight}
              padding={20}
              align="center"
            />
          ))}
        </Layer>
        <Layer>
          {this.state.depthNodes.depthNegOne.map((e, i) => (
            <Rect
              refs={"rect"}
              id={e}
              name={"node" + i}
              x={this.state.graphAttr.initX + this.state.graphAttr.spaceX * i}
              y={this.state.graphAttr.NegOneY}
              width={this.state.graphAttr.nodeWidth}
              height={this.state.graphAttr.nodeHeight}
              stroke="#000"
              strokeWidth={4}
              onMouseOver={this.handleMouseOverNode}
              onMouseOut={this.handleMouseOutNode}
              onClick={this.handlePageChange}
            />
          ))}
          {this.state.depthNodes.depthZero.map((e, i) => (
            <Rect
              refs={"rect"}
              id={e}
              name={"node" + i}
              x={this.state.graphAttr.initX + this.state.graphAttr.spaceX * i}
              y={this.state.graphAttr.ZeroY}
              width={this.state.graphAttr.nodeWidth}
              height={this.state.graphAttr.nodeHeight}
              stroke="#000"
              strokeWidth={4}
              onMouseOver={this.handleMouseOverNode}
              onMouseOut={this.handleMouseOutNode}
              onClick={this.handlePageChange}
            />
          ))}
          {this.state.depthNodes.depthPosOne.map((e, i) => (
            <Rect
              refs={"rect"}
              id={e}
              name={"node" + i}
              x={this.state.graphAttr.initX + this.state.graphAttr.spaceX * i}
              y={this.state.graphAttr.PosOneY}
              width={this.state.graphAttr.nodeWidth}
              height={this.state.graphAttr.nodeHeight}
              stroke="#000"
              strokeWidth={4}
              onMouseOver={this.handleMouseOverNode}
              onMouseOut={this.handleMouseOutNode}
              onClick={this.handlePageChange}
            />
          ))}
          <Line
            name={"edge" + "1"}
            points={this.state.lineLinks}
            stroke="#000000"
            strokeWidth={4}
            onMouseOver={this.handleMouseOverLine}
            onMouseOut={this.handleMouseOutLine}
          />
        </Layer>
      </Stage>
    );
  }
}

export default EntityGraph;
