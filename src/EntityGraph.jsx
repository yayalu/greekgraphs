// template from: https://konvajs.org/docs/react/index.html
// Refs (stage and components): https://reactjsexample.com/react-binding-to-canvas-element-via-konva-framework/
import React, { Component } from "react";
import Konva from "konva";
import { Stage, Layer, Star, Text, Rect, Line, Polygon } from "react-konva";

class EntityGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allShapes: [],
      stageRef: undefined,
      connectedShapes: ["edge1", "node3", "node5"]
    };
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
    this.setState({
      allShapes: this.refs.stage.children[1].children,
      stageRef: this.refs.stage
    });
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

  render() {
    return (
      <Stage ref="stage" width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {[...Array(10)].map((_, i) => (
            <Text
              x={i * 100}
              ref="text"
              y={i * 100}
              text="The sons of Lacaoon"
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
          {[...Array(10)].map((_, i) => (
            <Rect
              refs={"rect"}
              // id={"id" + i}
              name={"node" + i}
              x={i * 100}
              y={i * 100}
              width={150}
              height={80}
              stroke="#000"
              strokeWidth={4}
              onMouseOver={this.handleMouseOverNode}
              onMouseOut={this.handleMouseOutNode}
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
