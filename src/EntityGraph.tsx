import React from "react";
import "./App.css";
// import Konva from "konva";
import { Stage, Layer, Label, Tag, Line, Text, Group } from "react-konva";
import entities from "./data/entities.json";

type GraphProps = { id: string; relationships: any };
type GraphState = {};

class EntityGraph extends React.Component<GraphProps, GraphState> {
  constructor(props: any) {
    super(props);
  }

  /* handleDragStart(e: any) {
    e.target.setAttrs({
      shadowOffset: {
        x: 15,
        y: 15
      },
      scaleX: 1.1,
      scaleY: 1.1
    });
  }

  handleDragEnd(e: any) {
    e.target.to({
      duration: 0.5,
      easing: Konva.Easings.ElasticEaseOut,
      scaleX: 1,
      scaleY: 1,
      shadowOffsetX: 5,
      shadowOffsetY: 5
    });
  } */

  getName(id: string) {
    if (this.hasKey(entities, id)) {
      return entities[id]["Name (Smith & Trzaskoma)"];
    }
  }

  getParentNodes(nodeX: number, nodeY: number) {
    /* Change this to something more adapable */
    /* Also change mothers and fathers to parents in DataCards etc. */
    /*console.log(this.props.relationships);
    if (this.props.relationships.MOTHERS.length !== 0) {
      return (
        <Group>
          <Line
            points={[nodeX - 60, nodeY - 80, nodeX + 120, nodeY - 80]}
            stroke="#000000"
            strokeWidth={2}
          ></Line>
          <Line
            points={[nodeX, nodeY - 100, nodeX, nodeY]}
            stroke="#000000"
            strokeWidth={2}
          ></Line>
          <Label x={nodeX - 120} y={nodeY - 100} fill="#ffffff">
            <Tag stroke="#333"></Tag>
            <Text
              text={this.getName(this.props.id)}
              padding={10}
              fontSize={20}
            ></Text>
          </Label>
          <Label x={nodeX + 120} y={nodeY - 100} fill="#ffffff">
            <Tag stroke="#333"></Tag>
            <Text
              text={this.getName(this.props.id)}
              padding={10}
              fontSize={20}
            ></Text>
          </Label>
        </Group>
      );
    }*/
  }

  getPartnerNodes(nodeX: number, nodeY: number) {
    /* Change this to something more adapable */
    /* Also change wives and husbands to partners in DataCards etc. */
    console.log(this.props.relationships);
    if (this.props.relationships.WIVES.length !== 0) {
      return (
        <Group>
          <Line
            points={[nodeX + 135, nodeY + 20, nodeX + 200, nodeY + 20]}
            stroke="#000000"
            strokeWidth={2}
          ></Line>
          <Label x={nodeX + 200} y={nodeY} fill="#ffffff">
            <Tag stroke="#333"></Tag>
            <Text
              text={this.props.relationships.WIVES[0].target}
              padding={10}
              fontSize={20}
            ></Text>
          </Label>
        </Group>
      );
    }
    if (this.props.relationships.HUSBANDS.length !== 0) {
      return (
        <Group>
          <Line
            points={[nodeX - 105, nodeY + 20, nodeX, nodeY + 20]}
            stroke="#000000"
            strokeWidth={2}
          ></Line>
          <Label x={nodeX - 200} y={nodeY} fill="#ffffff">
            <Tag stroke="#333"></Tag>
            <Text
              text={this.props.relationships.HUSBANDS[0].target}
              padding={10}
              fontSize={20}
            ></Text>
          </Label>
        </Group>
      );
    }
  }

  /* Addresses typescript indexing objects error */
  hasKey<O>(obj: O, key: keyof any): key is keyof O {
    return key in obj;
  }

  render() {
    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {/* [...Array(10)].map((_, i) => (
            <Rect
              key={i}
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
            />
          )) */}
          <Label
            x={0.455 * window.innerWidth}
            y={0.455 * window.innerHeight}
            draggable={true}
          >
            <Tag
              stroke="#333"

              /* lineJoin="round"
              pointerDirection="up"
              pointerWidth={20}
              pointerHeight={20}
              cornerRadius={5} */
            ></Tag>
            <Text
              text={this.getName(this.props.id)}
              padding={10}
              fontSize={20}
            ></Text>
          </Label>
          {this.getPartnerNodes(
            0.455 * window.innerWidth,
            0.455 * window.innerHeight
          )}
          {this.getParentNodes(
            0.455 * window.innerWidth,
            0.455 * window.innerHeight
          )}
        </Layer>
      </Stage>
    );
  }
}

export default EntityGraph;
