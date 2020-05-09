// template from: https://konvajs.org/docs/react/index.html
// Refs (stage and components): https://reactjsexample.com/react-binding-to-canvas-element-via-konva-framework/
import React, { Component } from "react";
import Konva from "konva";
import { Stage, Layer, Text, Rect, Line } from "react-konva";
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
        initX: 150,
        spaceX: 200,
        nodeWidth: 150,
        nodeHeight: 80,
        NegOneY: 100,
        ZeroY: 400,
        PosOneY: 700
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

    // THE FOOLLOWING POPULATES THE GRAPH WITH DEFUALT RELATIONSHIP INFORMATION (AGAMEMNON) AS THIS DEALS WIIH UNDEFINED ERRORS
    // SPACE-WASTING BUT WORKS AS A TEMPORARY SOLUTION
    let entityData = JSON.parse(relationships[this.props.id]);
    let connectionsList = this.getConnectionsList(entityData, this.props.id);
    // Set states
    this.setState({
      allShapes: this.refs.stage.children[1].children,
      stageRef: this.refs.stage,
      id: this.props.id,
      entityData: entityData,
      depthNodes: this.getDepthNodes(entityData),
      lineLinks: this.geAllLinePoints(
        this.getDepthNodes(entityData),
        entityData,
        connectionsList
      )
    });
  }

  componentDidUpdate() {
    const params = window.location.href.split("?id=")[1];
    //  const id = params.id as string;
    //  if (!params.id) {
    if (this.props.id !== this.state.id) {
      // deal with agamemnon (default value) not showing up
      let entityData = JSON.parse(relationships[this.props.id]);
      let depthNodes = this.getDepthNodes(entityData);

      // Create a connection calculator here
      let connectionsList = this.getConnectionsList(entityData, this.props.id);

      this.setState({
        id: this.props.id,
        entityData: entityData,
        depthNodes: depthNodes,
        lineLinks: this.geAllLinePoints(depthNodes, entityData, connectionsList)
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

  /* GET THE CONNECTIONS BETWEEN ENTITIES BASED ON THE RELATIONSHIPS GIVEN */
  /* returns: [{parents: [list of ids], children: [list of ids], pNodeDepth: <depthNegOne, depthZero, depthPosOne>} , {...}] */
  getConnectionsList = (entityData, id) => {
    let allConnections = [];

    //MOTHER+FATHER -> YOU+SIBLING+TWIN
    if (
      entityData.relationships.MOTHERS.length > 0 ||
      entityData.relationships.FATHERS.length > 0
    ) {
      let connection = { parents: [], children: [], pNodeDepth: "" };
      let parentsDepth = entityData.relationships.MOTHERS.concat(
        entityData.relationships.FATHERS
      );
      parentsDepth.forEach(p => {
        connection.parents.push(p.targetID);
      });
      let childrenDepth = entityData.relationships.SIBLINGS.concat(
        entityData.relationships.TWIN
      );
      childrenDepth.forEach(c => {
        connection.children.push(c.targetID);
      });
      connection.children.push(id);
      connection.pNodeDepth = "depthNegOne";
      allConnections.push(connection);
    }

    //YOU+OTHERPARENTID -> CHILDREN
    if (entityData.relationships.CHILDREN.length > 0) {
      entityData.relationships.CHILDREN.forEach(cp => {
        let connection = { parents: [], children: [], pNodeDepth: "" };
        cp.child.forEach(c => {
          connection.children.push(c.targetID);
        });
        cp.otherParentIDs.forEach(p => {
          connection.parents.push(p);
        });
        connection.parents.push(id);
        connection.pNodeDepth = "depthZero";
        allConnections.push(connection);
      });
    }

    //Check if spouse is already listed in otherParentIDs in children. If not, means is connection without children.    //TODO: BORN FROM (OBJECT)
    if (entityData.relationships.SPOUSES.length > 0) {
      entityData.relationships.SPOUSES.forEach(s => {
        if (!this.isSpouseRepeated(s.targetID, allConnections)) {
          allConnections.push({ parents: [id, s.targetID], children: [] });
          // TODO: Deal with children is empty when spouse without children
        }
      });
    }

    //TODO: CREATED (BY AGENT)

    //TODO: AUTOCHTHONY

    //TODO: CREATED WITHOUT PARENTS

    //TODO: PARTHENOGENESIS

    //TODO: DIES WITHOUT CHILDREN

    return allConnections;
  };

  /* GET LINE POINTS BASED ON THE LINE CONNECTIONS FOUND */

  // Create an array holding all relationships between entities, parent+parent->children+siblings [[P,P,C,S], [...]]
  geAllLinePoints = (depthNodes, entityData, connections) => {
    let allLinePoints = [];

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

    // [P1, P1L, P2L, P2, P2L, PM] [PM, CU, C1U, C1, C1U, C2U, C2]
    //Connect parent nodes
    let width = this.state.graphAttr.nodeWidth;
    let height = this.state.graphAttr.nodeHeight;
    let diff = 50;
    let initX = this.state.graphAttr.initX;
    let spaceX = this.state.graphAttr.spaceX;

    /* TODO: FIX THIS FOR GENERATION-ANONYMOUS */
    for (let i = 0; i < connections.length; i++) {
      // connections[INDEX] = {parents: [id1, id2, ...], children: [id1, id2, ...]}

      // TODO: Make the following more efficient

      let linePoints = [];

      let PM_Y = 0,
        PM_X = 0;

      // Get the depth of the nodes
      let depth;
      if (connections[i].pNodeDepth === "depthNegOne") {
        depth = depthNodes.depthNegOne;
        PM_Y = this.state.graphAttr.NegOneY + height + diff; // Assign PM_Y value here
      } else {
        depth = depthNodes.depthZero;
        PM_Y = this.state.graphAttr.ZeroY + height + diff; // Assign PM_Y value here
      }

      // Get middle X location first (average of all X values)
      connections[i].parents.forEach(p => {
        let pX = initX + depth.indexOf(p) * spaceX;
        PM_X = PM_X + pX;
      });
      PM_X =
        connections[i].parents.length > 1 // Removes division by 0 error
          ? (PM_X + width) / connections[i].parents.length
          : PM_X + width / 2;

      // Check parent nodes. PM -> PL -> P -> PL -> PM. This joins the lines at the middle point for each connection.
      connections[i].parents.forEach(p => {
        let pIndex = depth.indexOf(p);
        let pY = 0;
        if (connections[i].pNodeDepth === "depthNegOne") {
          pY = this.state.graphAttr.NegOneY + height;
        } else {
          pY = this.state.graphAttr.ZeroY + height;
        }
        linePoints.push(PM_X, PM_Y); //PM
        linePoints.push(initX + pIndex * spaceX + width / 2, PM_Y); //PL
        linePoints.push(
          initX + pIndex * spaceX + width / 2,
          pY //P
        );
        linePoints.push(initX + pIndex * spaceX + width / 2, PM_Y); //PL
        linePoints.push(PM_X, PM_Y); //PM
      });

      // Check children nodes
      if (connections[i].children.length > 0) {
        let CM_Y = 0;
        // Update the Y location to the depth for children
        if (connections[i].pNodeDepth === "depthNegOne") {
          depth = depthNodes.depthZero;
          CM_Y = this.state.graphAttr.ZeroY - diff; // Assign PM_Y value here
        } else {
          depth = depthNodes.depthPosOne;
          CM_Y = this.state.graphAttr.PosOneY - diff; // Assign PM_Y value here
        }

        // Add a line from the existing (PM_X, PM_Y) spot to (PM_X, CM_Y)
        linePoints.push(PM_X, CM_Y);

        // CM -> CL -> C -> CL -> CM. This joins the lines at the middle point for each connection.
        connections[i].children.forEach(c => {
          let cIndex = depth.indexOf(c);
          let cY = 0;
          if (connections[i].pNodeDepth === "depthNegOne") {
            cY = this.state.graphAttr.ZeroY;
          } else {
            cY = this.state.graphAttr.PosOneY;
          }
          linePoints.push(PM_X, CM_Y); //CM
          linePoints.push(initX + cIndex * spaceX + width / 2, CM_Y); //CL
          linePoints.push(
            initX + cIndex * spaceX + width / 2,
            cY //C
          );
          linePoints.push(initX + cIndex * spaceX + width / 2, CM_Y); //CL
          linePoints.push(PM_X, CM_Y); //CM
        });
      }

      //Create line name (aka. all the nodes involved)
      let name = connections[i].parents
        .concat(connections[i].children)
        .toString();

      // TODO: Check if the connection is unusual or disputed;
      let unusual = { tf: false, type: "" };
      let disputed = { tf: false, type: "", passage: undefined };

      // Check Parent -> Main Node
      if (connections[i].pNodeDepth === "depthNegOne") {
        // UNUSUAL: Since the depth in question is depth -1 => one of the children must be the main entity
        // Only check unusual status and disputed status of the main entity
        if (entityData.unusual.autochthony.tf) {
          unusual = { tf: true, type: "autochthony" };
        } else if (entityData.unusual.createdWithoutParents.tf) {
          unusual = { tf: true, type: "createdWithoutParents" };
        } else if (entityData.unusual.createdByAgent.tf) {
          unusual = { tf: true, type: "createdByAgent" };
        } else if (entityData.unusual.parthenogenesis.tf) {
          unusual = { tf: true, type: "parthenogenesis" };
        } else if (entityData.unusual.bornFromObject.tf) {
          unusual = { tf: true, type: "bornFromObject" };
        } else if (entityData.unusual.diesWithoutChildren.tf) {
          //TODO: deal with this in a more suitable place
          unusual = { tf: true, type: "diesWithoutChildren" };
        } else {
          // Leave unusual as false
        }

        // DISPUTED: Check if the main entity has > two parents. If so, is disputed
        // TODO: Make this more complex - note what Greta said about the complexity of disputed relationships
        if (connections[i].parents.length > 2) {
          disputed = {
            tf: true,
            type: "Disputed tradition",
            passageLink: ""
          }; //TODO: INPUT REAL INFO
        }
      }
      // Check Main Node -> Children
      else if (connections[i].pNodeDepth === "depthZero") {
        // UNUSUAL: Since the main node is one of the parents,
        // loop through every child for unusuality
        connections[i].children.forEach(c => {
          let cRelationships = JSON.parse(relationships[c]);

          // Check for unusualness
          if (cRelationships.unusual.autochthony.tf) {
            unusual = { tf: true, type: "autochthony" };
          } else if (cRelationships.unusual.createdWithoutParents.tf) {
            unusual = { tf: true, type: "createdWithoutParents" };
          } else if (cRelationships.unusual.createdByAgent.tf) {
            unusual = { tf: true, type: "createdByAgent" };
          } else if (cRelationships.unusual.parthenogenesis.tf) {
            unusual = { tf: true, type: "parthenogenesis" };
          } else if (cRelationships.unusual.bornFromObject.tf) {
            unusual = { tf: true, type: "bornFromObject" };
          } else if (cRelationships.unusual.diesWithoutChildren.tf) {
            //TODO: deal with this in a more suitable place
            unusual = { tf: true, type: "diesWithoutChildren" };
          } else {
            // Leave overall connection unusualness as false
          }

          // DISPUTED: Check if the child has > two parents (one of which is the main character). If so, is disputed
          // TODO: Make this more complex - note what Greta said about the complexity of disputed relationships
          if (
            cRelationships.relationships.MOTHERS.length +
              cRelationships.relationships.FATHERS.length >
            2
          ) {
            disputed = {
              tf: true,
              type: "Disputed tradition",
              passageLink: ""
            }; //TODO: INPUT REAL INFO
          }
        });
      }
      // TODO: Check if the connection is disputed
      allLinePoints.push({
        name: name,
        points: linePoints,
        unusual: unusual,
        disputed: disputed
      });
      // allLinePoints.push({ name: name, points: linePoints });
    }
    return allLinePoints;
  };

  isSpouseRepeated = (sID, allConnections) => {
    for (let i = 0; i < allConnections.length; i++) {
      for (let j = 0; j < allConnections[i].length; j++) {
        if (sID === allConnections[i][j]) {
          return true;
        }
      }
    }
    return false;
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
    // thicken the main line
    e.target.to({
      strokeWidth: 8,
      opacity: 1
    });
    // thicken the nodes attached to the line
    let nodeIDs = e.target.attrs.name.split(",");
    nodeIDs.forEach(id => {
      let nodeWithID = this.state.stageRef.find("." + id);
      nodeWithID.to({
        strokeWidth: 8
      });
      if (e.target.attrs.unusual.tf) {
        document.body.style.cursor = "pointer";
        nodeWithID.to({
          stroke: "#ff0000"
        });
      }
      if (e.target.attrs.disputed.tf) {
        document.body.style.cursor = "pointer";
        nodeWithID.to({
          stroke: "#0000ff"
        });
      }
    });
  };

  handleMouseOutLine = e => {
    // thin the main line
    document.body.style.cursor = "default";
    e.target.to({
      strokeWidth: 4,
      opacity: e.target.attrs.unusual.tf || e.target.attrs.disputed.tf ? 1 : 0.3
    });
    // thicken the nodes attached to the line
    let nodeDs = e.target.attrs.name.split(",");
    nodeDs.forEach(id => {
      this.state.stageRef.find("." + id).to({
        strokeWidth: 4,
        stroke: "#000000"
      });
    });
  };

  handlePageChange = e => {
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
    return (
      <Stage ref="stage" width={6000} height={2000}>
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
              name={e}
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
              name={e}
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
              name={e}
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
          {this.state.lineLinks.map((e, i) => (
            <Line
              name={e.name}
              points={e.points}
              unusual={e.unusual}
              disputed={e.disputed}
              stroke={
                e.unusual.tf ? "#ff0000" : e.disputed.tf ? "#0000ff" : "#000000"
              }
              opacity={e.unusual.tf || e.disputed.tf ? 1 : 0.3}
              strokeWidth={4}
              onMouseOver={this.handleMouseOverLine}
              onMouseOut={this.handleMouseOutLine}
            />
          ))}
        </Layer>
      </Stage>
    );
  }
}

export default EntityGraph;
