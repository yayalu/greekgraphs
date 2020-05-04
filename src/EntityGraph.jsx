// template from: https://konvajs.org/docs/react/index.html
// Refs (stage and components): https://reactjsexample.com/react-binding-to-canvas-element-via-konva-framework/
import React, { Component } from "react";
import Konva from "konva";
import { Stage, Layer, Star, Text, Rect } from "react-konva";

class EntityGraph extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // log stage react wrapper (reference)
    console.log(this.refs.stage);
    // log Konva.Stage instance (reference)
    console.log(this.refs.stage.getStage());
    // Get all children from the stage (equiiv. to stage.layers.<allchildren>)
    console.log(this.refs.stage.children[0].children);
  }

  handleMouseOver = e => {
    e.target.to({
      strokeWidth: 6
    });
  };
  handleMouseOut = e => {
    e.target.to({
      strokeWidth: 2
    });
  };

  render() {
    return (
      <Stage ref="stage" width={window.innerWidth} height={window.innerHeight}>
        <Layer ref="layer">
          {[...Array(10)].map((_, i) => (
            <Rect
              refs={"rect"}
              id={"id" + i}
              name={"name" + i}
              x={Math.random() * window.innerWidth}
              y={Math.random() * window.innerHeight}
              height={100}
              width={100}
              fill="#ffffff"
              stroke="#555"
              strokeWidth={3}
              onMouseOver={this.handleMouseOver}
              onMouseOut={this.handleMouseOut}
            />
          ))}
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
