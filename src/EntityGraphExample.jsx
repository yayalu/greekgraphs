// template from: https://konvajs.org/docs/react/index.html
import React, { Component } from "react";
import Konva from "konva";
import { Stage, Layer, Star, Text } from "react-konva";

class EntityGraphExample extends Component {
  handleDragStart = e => {
    e.target.setAttrs({
      shadowOffset: {
        x: 15,
        y: 15
      },
      scaleX: 1.1,
      scaleY: 1.1
    });
    console.log("Starting", e.target.attrs.id, "\n");
  };
  handleDragEnd = e => {
    e.target.to({
      duration: 0.5,
      easing: Konva.Easings.ElasticEaseOut,
      scaleX: 1,
      scaleY: 1,
      shadowOffsetX: 5,
      shadowOffsetY: 5
    });
    console.log("Ending", e, "\n");
  };
  render() {
    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Text text="Try to drag a star" />
          {[...Array(10)].map((_, i) => (
            <Star
              id={"Hello" + i}
              name={"Hello" + i}
              x={Math.random() * window.innerWidth}
              y={Math.random() * window.innerHeight}
              numPoints={5}
              innerRadius={20}
              outerRadius={40}
              fill="#89b717"
              opacity={0.8}
              draggable
              rotation={Math.random() * 180}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.6}
              onDragStart={this.handleDragStart}
              onDragEnd={this.handleDragEnd}
            />
          ))}
        </Layer>
      </Stage>
    );
  }
}

export default EntityGraphExample;

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
