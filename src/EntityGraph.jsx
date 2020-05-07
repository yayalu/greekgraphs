// template from: https://konvajs.org/docs/react/index.html
// Refs (stage and components): https://reactjsexample.com/react-binding-to-canvas-element-via-konva-framework/
import React, { Component } from "react";
import Konva from "konva";
import { Stage, Layer, Star, Text, Rect, Line, Polygon } from "react-konva";
import relationships from "./data/relationships.json";

class EntityGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allShapes: [],
      stageRef: undefined,
      connectedShapes: ["edge1", "node3", "node5"], // Nodes and links that are connected with each other
      depthNodes: {
        depthNegOne: [],
        depthZero: [],
        depthPosOne: []
      },
      entityData: {},
      id: ""
    };
    this.getDepthNodes = this.getDepthNodes.bind(this);
  }

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
      //Substitute with ID
      this.setState({
        id: this.props.id,
        entityData: entityData,
        depthNodes: this.getDepthNodes(entityData)
      });
    }
  }

  handleMouseOverNode = e => {
    e.target.to({
      strokeWidth: 8
    });
  };
  handleMouseOutNode = e => {
    e.target.to({
      strokeWidth: 4
    });
  };

  handleMouseOverLine = e => {
    if (e.target.attrs.name === "edge1") {
      this.state.connectedShapes.forEach(s => {
        let item = this.state.stageRef.find("." + s);
        if (item.length > 0) {
          item.to({
            strokeWidth: 8
          });
        }
      });
    }
  };
  handleMouseOutLine = e => {
    if (e.target.attrs.name === "edge1") {
      this.state.connectedShapes.forEach(s => {
        let item = this.state.stageRef.find("." + s);
        if (item.length > 0) {
          item.to({
            strokeWidth: 4
          });
        }
      });
    }
  };

  getRandomPoints = () => {
    let edge = [];
    this.state.allShapes.forEach(function(shape) {
      edge.push(shape.attrs.x + 75);
      edge.push(shape.attrs.y + 40);
    });
    return edge;
  };

  getDepthNodes = entityData => {
    let depthNegOne = [],
      depthZero = [],
      depthPosOne = [];

    console.log("Entity", entityData);
    //Parents and step-parents depth -1
    depthNegOne = depthNegOne.concat(entityData.relationships.MOTHERS);
    depthNegOne = depthNegOne.concat(entityData.relationships.FATHERS);
    depthNegOne = depthNegOne.concat(entityData.relationships.CREATORS);
    depthNegOne = depthNegOne.concat(entityData.relationships.BORNFROM);
    //siblings, twins and spouses depth 0
    depthZero = depthZero.concat(entityData.relationships.SIBLINGS);
    depthZero = depthZero.concat(entityData.relationships.TWIN);
    depthZero = depthZero.concat(entityData.relationships.SPOUSES);
    // + all other parents
    //children depth +1
    for (let d = 0; d < entityData.relationships.CHILDREN.length; d++) {
      entityData.relationships.CHILDREN[d].child.forEach(c => {
        depthPosOne = this.checkForDuplicates(depthPosOne, c);
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

  handlePageChange = e => {
    console.log("Page change", e.target.attrs.id);
    this.props.relationshipClicked(e.target.attrs.id);
  };

  getText = () => {
    if (this.props.id === "8182233") {
      return "Apollo";
    } else {
      return "The sons of Lacaoon";
    }
  };

  render() {
    {
      console.log(this.state.depthNodes);
    }
    return (
      <Stage ref="stage" width={4000} height={2000}>
        <Layer>
          {this.state.depthNodes.depthNegOne.map((e, i) => (
            <Text
              x={50 + 200 * i}
              ref="text"
              y={50}
              text={typeof e === "string" ? e : e.targetID}
              fontSize={18}
              fontFamily="Calibri"
              fontStyle="bold"
              fill="#000"
              width={150}
              height={80}
              padding={20}
              align="center"
            />
          ))}
          {this.state.depthNodes.depthZero.map((e, i) => (
            <Text
              x={50 + 200 * i}
              ref="text"
              y={250}
              text={typeof e === "string" ? e : e.targetID}
              fontSize={18}
              fontFamily="Calibri"
              fontStyle="bold"
              fill="#000"
              width={150}
              height={80}
              padding={20}
              align="center"
            />
          ))}
          {this.state.depthNodes.depthPosOne.map((e, i) => (
            <Text
              x={50 + 200 * i}
              ref="text"
              y={450}
              text={typeof e === "string" ? e : e.targetID}
              fontSize={18}
              fontFamily="Calibri"
              fontStyle="bold"
              fill="#000"
              width={150}
              height={80}
              padding={20}
              align="center"
            />
          ))}
        </Layer>
        <Layer>
          {this.state.depthNodes.depthNegOne.map((e, i) => (
            <Rect
              refs={"rect"}
              id={typeof e === "string" ? e : e.targetID}
              name={"node" + i}
              x={50 + 200 * i}
              y={50}
              width={150}
              height={80}
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
              id={typeof e === "string" ? e : e.targetID}
              name={"node" + i}
              x={50 + 200 * i}
              y={250}
              width={150}
              height={80}
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
              id={typeof e === "string" ? e : e.targetID}
              name={"node" + i}
              x={50 + 200 * i}
              y={450}
              width={150}
              height={80}
              stroke="#000"
              strokeWidth={4}
              onMouseOver={this.handleMouseOverNode}
              onMouseOut={this.handleMouseOutNode}
              onClick={this.handlePageChange}
            />
          ))}
          <Line
            name={"edge" + "1"}
            points={this.getRandomPoints()}
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

/* render() {
    let stageRef = React.useRef();
    return (
      <Stage width={1000} height={1000} className="canvas">
        <Layer>
          <Rect
            x={20}
            y={60}
            stroke="#555"
            strokeWidth={5}
            fill="#ddd"
            width={300}
            height={100}
            shadowColor={"black"}
            shadowBlur={10}
            shadowOffsetX={10}
            shadowOffsetY={10}
            shadowOpacity={0.2}
            cornerRadius={10}
          ></Rect>
          <Text
            x={20}
            ref="Hello"
            y={60}
            text="COMPLEX TEXT\n\nAll the world's a stage, and all the men and women merely players. They have their exits and their entrances."
            fontSize={18}
            fontFamily="Calibri"
            fill="#555"
            width={300}
            padding={20}
            align="center"
          ></Text>
        </Layer>
      </Stage>
    );
  } */
