// template from: https://konvajs.org/docs/react/index.html
// Refs (stage and components): https://reactjsexample.com/react-binding-to-canvas-element-via-konva-framework/
import React, { Component } from "react";
import { Stage, Layer, Text, Rect, Line, Image } from "react-konva";
import relationships from "./data/relationships.json";
import objects from "./data/objects.json";
import { getName } from "./DataCardHandler";
import entities from "./data/entities.json";
import useImage from "use-image";
import Konva from "konva";
import passages from "./data/passages.json";

class EntityGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allShapes: [],
      stageRef: undefined,
      graphAttr: {
        // these are all set in componentDidUpdate
        initX: 0,
        spaceX: 0,
        nodeWidth: 0,
        nodeHeight: 0,
        NegOneY: 0,
        ZeroY: 0,
        PosOneY: 0
      },
      depthNodes: {
        depthNegOne: [],
        depthZero: [],
        depthPosOne: []
      },
      lineLinks: [],
      entityData: {},
      id: "",
      openInfoPage: {
        showContestPage: false,
        contest: undefined,
        showUnusualPage: false,
        unusual: undefined,
        showIncestPage: false,
        incest: undefined
      }
    };
    this.getDepthNodes = this.getDepthNodes.bind(this);
    this.getPassageLink = this.getPassageLink.bind(this);
    this.handleInTextPageChange = this.handleInTextPageChange.bind(this);
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

    // THE FOLLOWING POPULATES THE GRAPH WITH DEFUALT RELATIONSHIP INFORMATION (AGAMEMNON) AS THIS DEALS WIIH UNDEFINED ERRORS
    // SPACE-WASTING BUT WORKS AS A TEMPORARY SOLUTION
    let entityData = JSON.parse(relationships[this.props.id]);
    let depthNodes = this.getDepthNodes(entityData);
    let connectionsList = this.getConnectionsList(
      entityData,
      depthNodes,
      this.props.id
    );

    let NegOneY = 0,
      ZeroY = 0,
      PosOneY = 0;
    if (depthNodes.depthNegOne.length === 0) {
      ZeroY = 100;
      if (depthNodes.depthPosOne.length > 0) {
        PosOneY = 400;
      }
    } else if (depthNodes.depthPosOne.length === 0) {
      NegOneY = 100;
      ZeroY = 400;
    } else {
      NegOneY = 100;
      ZeroY = 400;
      PosOneY = 700;
    }
    let graphAttr = {
      initX: 150,
      spaceX: 200,
      nodeWidth: 150,
      nodeHeight: 80,
      NegOneY: NegOneY, // set later on
      ZeroY: ZeroY, // set later on
      PosOneY: PosOneY // set later on
    };
    // Set states
    this.setState({
      allShapes: this.refs.stage.children[1].children,
      stageRef: this.refs.stage,
      graphAttr: graphAttr,
      id: this.props.id,
      entityData: entityData,
      depthNodes: depthNodes,
      lineLinks: this.getAllLinePoints(
        depthNodes,
        entityData,
        connectionsList,
        graphAttr
      ),
      openInfoPage: {
        showContestPage: false,
        contest: undefined,
        showUnusualPage: false,
        unusual: undefined,
        showIncestPage: false,
        incest: undefined
      }
    });
  }

  componentDidUpdate() {
    if (this.props.id !== this.state.id) {
      // deal with agamemnon (default value) not showing up
      let entityData = JSON.parse(relationships[this.props.id]);
      let depthNodes = this.getDepthNodes(entityData);

      // Create a connection calculator here
      let connectionsList = this.getConnectionsList(
        entityData,
        depthNodes,
        this.props.id
      );

      let NegOneY = 0,
        ZeroY = 0,
        PosOneY = 0;
      if (depthNodes.depthNegOne.length === 0) {
        ZeroY = 100;
        if (depthNodes.depthPosOne.length > 0) {
          PosOneY = 400;
        }
      } else if (depthNodes.depthPosOne.length === 0) {
        NegOneY = 100;
        ZeroY = 400;
      } else {
        NegOneY = 100;
        ZeroY = 400;
        PosOneY = 700;
      }

      let graphAttr = {
        initX: 150,
        spaceX: 200,
        nodeWidth: 150,
        nodeHeight: 80,
        NegOneY: NegOneY, // set later on
        ZeroY: ZeroY, // set later on
        PosOneY: PosOneY // set later on
      };

      this.setState({
        allShapes: this.refs.stage.children[1].children,
        stageRef: this.refs.stage,
        graphAttr: graphAttr,
        id: this.props.id,
        entityData: entityData,
        depthNodes: depthNodes,
        lineLinks: this.getAllLinePoints(
          depthNodes,
          entityData,
          connectionsList,
          graphAttr
        ),
        openInfoPage: {
          showContestPage: false,
          contest: undefined,
          showUnusualPage: false,
          unusual: undefined,
          showIncestPage: false,
          incest: undefined
        }
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
   *   GETTERS AND SETTERS (GRAPHING)
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
      depthNegOne = this.checkForDuplicates(depthNegOne, m.targetID);
    });
    entityData.relationships.FATHERS.forEach(f => {
      depthNegOne = this.checkForDuplicates(depthNegOne, f.targetID);
    });
    entityData.relationships.CREATORS.forEach(c => {
      depthNegOne = this.checkForDuplicates(depthNegOne, c.targetID);
    });

    // Create unusual nodes, and add them to the end of depth -1
    // TODO deal with depth Zero nodes too
    if (entityData.unusual.autochthony.tf) {
      depthNegOne.push("autochthony_NegOne");
    } else if (entityData.unusual.bornFromObject.tf) {
      depthNegOne.push(
        "bornFromObject_" +
          entityData.unusual.bornFromObject.objectID +
          "_NegOne"
      ); //bornFromObject: <type>_<objectID>_<depth>
    } else if (entityData.unusual.createdWithoutParents.tf) {
      depthNegOne.push("createdWithoutParents_NegOne");
    }
    // parthenogenesis is dealt with in a direct connection between mother and child, see later
    // diesWithoutChildren doesn't require a separate node spot

    //siblings, twins and spouses depth 0
    entityData.relationships.SIBLINGS.forEach(s => {
      depthZero = this.checkForDuplicates(depthZero, s.targetID);
    });
    entityData.relationships.TWIN.forEach(t => {
      depthZero = this.checkForDuplicates(depthZero, t.targetID);
    });
    entityData.relationships.SPOUSES.forEach(s => {
      depthZero = this.checkForDuplicates(depthZero, s.targetID);
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

    // Add the central node in the graph. Removes 3-parent contest resulting in "OR" on the main node, see Aerope
    if (depthZero.length > 3) {
      depthZero.splice(Math.ceil(depthZero.length / 2), 0, this.props.id); // NOte that the above deals with entityInfo type, but this (aka. highlighted node) is just ID
    } else if (!depthZero.includes(this.props.id)) {
      depthZero.splice(0, 0, this.props.id);
    }
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
  getConnectionsList = (entityData, depthNodes, id) => {
    let allConnections = [];

    //ADDING CONNECTIONS FOR MOTHER+FATHER -> YOU+SIBLING+TWIN
    if (
      entityData.relationships.MOTHERS.length > 0 ||
      entityData.relationships.FATHERS.length > 0
    ) {
      let connection = {
        parents: [],
        children: [],
        pNodeDepth: "",
        contestedUnusual: false,
        isUnusual: false, //"isUnusual" is used to denote the part of the contestedUnusual grouping that is not unusual, e.g. the normal disputed relationship paired with the unusual one
        isIncest: false
      };
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

      // If there are parents but there are also
      if (
        entityData.unusual.autochthony.tf ||
        entityData.unusual.createdWithoutParents.tf ||
        entityData.unusual.bornFromObject.tf ||
        entityData.unusual.createdByAgent.tf ||
        (entityData.unusual.parthenogenesis.tf &&
          (entityData.relationships.MOTHERS.length > 1 ||
            entityData.relationships.FATHERS.length > 0))
      ) {
        connection.contestedUnusual = true;
      }
      allConnections.push(connection);
    }

    //ADDING CONNECTIONS FOR YOU+OTHERPARENTID -> CHILDREN
    if (entityData.relationships.CHILDREN.length > 0) {
      entityData.relationships.CHILDREN.forEach(cp => {
        let connection = {
          parents: [],
          children: [],
          pNodeDepth: "",
          contestedUnusual: false,
          isUnusual: false,
          isIncest: false
        };
        cp.child.forEach(c => {
          connection.children.push(c.targetID);
        });
        cp.otherParentIDs.forEach(p => {
          connection.parents.push(p);
        });
        connection.parents.push(id);
        connection.pNodeDepth = "depthZero";
        allConnections.push(connection);
        //TODO: Add contestedUnusual here
      });
    }

    //ADDING CONNECTIONS FOR SPOUSES (PROVIDED THE SPOUSE ID DOESN'T ALREADY EXIST IN OTHERPARENTSID ABOVE
    if (entityData.relationships.SPOUSES.length > 0) {
      entityData.relationships.SPOUSES.forEach(s => {
        if (!this.isSpouseRepeated(s.targetID, allConnections)) {
          allConnections.push({
            parents: [id, s.targetID],
            children: [],
            pNodeDepth: "depthZero",
            contestedUnusual: false,
            isUnusual: false,
            isIncest: false
          });
          // TODO: Deal with children is empty when spouse without children
          // TODO: Add contestedUnusual here
        }
      });
    }

    let moreParents =
      entityData.relationships.MOTHERS.length > 0 ||
      entityData.relationships.FATHERS.length > 0;

    //CHECKING ADDING CONNECTIONS FOR ALL UNUSUAL RELATIONSHIPS (separate to mother, father etc. checkings):
    if (entityData.unusual.autochthony.tf) {
      // if there are also mothers and fathers, this means the idea of autochthony is contested
      let connection = {
        parents: ["autochthony_NegOne"],
        children: [id],
        pNodeDepth: "depthNegOne",
        contestedUnusual: false,
        isUnusual: true,
        isIncest: false
      };
      if (moreParents) {
        connection.contestedUnusual = true;
      }
      allConnections.push(connection);
    } else if (entityData.unusual.createdWithoutParents.tf) {
      let connection = {
        parents: ["createdWithoutParents_NegOne"],
        children: [id],
        pNodeDepth: "depthNegOne",
        contestedUnusual: false,
        isUnusual: true,
        isIncest: false
      };
      if (moreParents) {
        connection.contestedUnusual = true;
      }
      allConnections.push(connection);
    } else if (entityData.unusual.bornFromObject.tf) {
      let connection = {
        parents: [
          "bornFromObject_" +
            entityData.relationships.BORNFROM[0].targetID +
            "_NegOne"
        ],
        children: [id],
        pNodeDepth: "depthNegOne",
        contestedUnusual: false,
        isUnusual: true,
        isIncest: false
      };
      if (moreParents) {
        connection.contestedUnusual = true;
      }
      allConnections.push(connection);
    } else if (entityData.unusual.createdByAgent.tf) {
      let connection = {
        parents: [entityData.relationships.CREATORS[0].targetID],
        children: [id],
        pNodeDepth: "depthNegOne",
        contestedUnusual: false,
        isUnusual: true,
        isIncest: false
      };
      if (moreParents) {
        connection.contestedUnusual = true;
      }
      allConnections.push(connection);
    } else if (entityData.unusual.diesWithoutChildren.tf) {
      //TODO: Deal with contested diesWithoutChildren
      let connection = {
        parents: [id],
        children: ["diesWithoutChildren"],
        pNodeDepth: "depthZero",
        contestedUnusual: false,
        isUnusual: false,
        isIncest: false
      };
      allConnections.push(connection);
    } else if (entityData.unusual.parthenogenesis.tf) {
      let connection = {
        parents: [entityData.relationships.MOTHERS[0].targetID],
        children: [id],
        pNodeDepth: "depthNegOne",
        contestedUnusual: false,
        isUnusual: true,
        isIncest: false
      };
      if (moreParents) {
        connection.contestedUnusual = true;
      }
      allConnections.push(connection);
    }

    // CHECK INCESTUOUS RELATIONSHIPS

    // Check incest over multiple depths
    // TODO: Currently only does gen depth 1 incest e.g. depthNegOne -> depthZero, depthZero -> depthPosOne
    for (let i = 0; i < depthNodes.depthNegOne.length; i++) {
      if (depthNodes.depthZero.includes(depthNodes.depthNegOne[i])) {
        let connection = {
          parents: [depthNodes.depthNegOne[i]],
          children: [],
          pNodeDepth: "depthNegOne",
          contestedUnusual: false,
          isUnusual: false,
          isIncest: true
        };
        allConnections.push(connection);
      }
    }
    for (let i = 0; i < depthNodes.depthZero.length; i++) {
      if (depthNodes.depthPosOne.includes(depthNodes.depthZero[i])) {
        let connection = {
          parents: [depthNodes.depthZero[i]],
          children: [],
          pNodeDepth: "depthZero",
          contestedUnusual: false,
          isUnusual: false,
          isIncest: true
        };
        allConnections.push(connection);
      }
    }
    // Check incest over the same depth (only sibling & spouse atm)
    // ignores all unusual cases, e.g. autochthony_NegOne
    entityData.relationships.SPOUSES.forEach(spo => {
      entityData.relationships.SIBLINGS.forEach(sib => {
        if (
          spo.targetID === sib.targetID &&
          depthNodes.depthZero.includes(spo.targetID)
        ) {
          let connection = {
            parents: [entityData.id, spo.targetID],
            children: [],
            pNodeDepth: "depthZero",
            contestedUnusual: false,
            isUnusual: false,
            isIncest: true
          };
          allConnections.push(connection);
        }
      });
    });

    return allConnections;
  };

  /* GET LINE POINTS BASED ON THE LINE CONNECTIONS FOUND */

  // Create an array holding all relationships between entities, parent+parent->children+siblings [[P,P,C,S], [...]]
  getAllLinePoints = (depthNodes, entityData, connections, graphAttr) => {
    /************************/
    /*  GET LINE POINTS 
    /************************/

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
    let width = graphAttr.nodeWidth;
    let height = graphAttr.nodeHeight;
    let diff = 50;
    let initX = graphAttr.initX;
    let spaceX = graphAttr.spaceX;

    /* TODO: FIX THIS FOR GENERATION-ANONYMOUS */
    for (let i = 0; i < connections.length; i++) {
      // connections[INDEX] = {parents: [id1, id2, ...], children: [id1, id2, ...]}

      /*****************************************************/
      /*  GET LINE POINTS FOR EVERY CONNECTION
      /*****************************************************/
      let linePoints = [];

      // Deal with parthenogenesis, because unlike the other types, parthenogenesis is just a diagonal.
      // TODO: Put this in a better place
      if (
        entityData.unusual.parthenogenesis.tf &&
        connections[i].parents.length === 1 &&
        connections[i].parents[0] ===
          entityData.relationships.MOTHERS[0].targetID
      ) {
        // Draw a line directly from parent to child if is a case of parthenogenesis
        let pX =
          initX +
          depthNodes.depthNegOne.indexOf(connections[i].parents[0]) * spaceX +
          width / 2;
        let pY = graphAttr.NegOneY + height;
        let cX =
          initX +
          depthNodes.depthZero.indexOf(entityData.id) * spaceX +
          width / 2;
        let cY = graphAttr.ZeroY;
        linePoints.push(pX, pY, cX, cY);
      }
      // Check if entity dies without children, aka. put a line straight down to an X
      else if (connections[i].children[0] === "diesWithoutChildren") {
        // Draw a line directly downards to an X
        let pX =
          initX +
          depthNodes.depthZero.indexOf(connections[i].parents[0]) * spaceX +
          width / 2;
        let pY = graphAttr.ZeroY + height;
        let lowerpY = pY + diff + 35;
        linePoints.push(pX, pY);
        linePoints.push(pX, lowerpY); // center of x
        linePoints.push(pX - 12, lowerpY - 12); // top left corner of X
        linePoints.push(pX, lowerpY); // back to center of x
        linePoints.push(pX + 12, lowerpY - 12); // top right corner of X
        linePoints.push(pX, lowerpY); // back to center of x
        linePoints.push(pX - 12, lowerpY + 12); //bottom left corner of X
        linePoints.push(pX, lowerpY); // back to center of x
        linePoints.push(pX + 12, lowerpY + 12); //bottom right corner of X
      }
      // Deal with incest
      else if (connections[i].isIncest) {
        // intergenerational (over multiple depths)
        if (connections[i].parents.length === 1) {
          let x1 = 0,
            x2 = 0,
            y1 = 0,
            y2 = 0;
          if (connections[i].pNodeDepth === "depthNegOne") {
            x1 =
              initX +
              depthNodes.depthNegOne.indexOf(connections[i].parents[0]) *
                spaceX +
              width / 2;
            x2 =
              initX +
              depthNodes.depthZero.indexOf(connections[i].parents[0]) * spaceX +
              width / 2;
            y1 = graphAttr.NegOneY + height;
            y2 = graphAttr.ZeroY;
          } else if (connections[i].pNodeDepth === "depthZero") {
            x1 =
              initX +
              depthNodes.depthZero.indexOf(connections[i].parents[0]) * spaceX +
              width / 2;
            x2 =
              initX +
              depthNodes.depthPosOne.indexOf(connections[i].parents[0]) *
                spaceX +
              width / 2;
            y1 = graphAttr.ZeroY + height;
            y2 = graphAttr.PosOneY;
          }
          linePoints.push(x1, y1, x2, y2);
        }
        // spousal-sibling (over same depth)
        if (connections[i].parents.length > 1) {
          let x1 =
            initX +
            depthNodes.depthZero.indexOf(connections[i].parents[0]) * spaceX +
            width / 2;
          let aY = graphAttr.ZeroY;
          let x2 =
            initX +
            depthNodes.depthZero.indexOf(connections[i].parents[1]) * spaceX +
            width / 2;
          linePoints.push(x1, aY, x1, aY - diff, x2, aY - diff, x2, aY);

          let bY = graphAttr.ZeroY + graphAttr.nodeHeight;
          linePoints.push(x1, bY, x1, bY + diff, x2, bY + diff, x2, bY);
        }
      } else {
        // TODO: All other connections

        let PM_Y = 0,
          PM_X = 0;

        // Get the depth of the nodes
        let depth;
        if (connections[i].pNodeDepth === "depthNegOne") {
          depth = depthNodes.depthNegOne;
          PM_Y = graphAttr.NegOneY + height + diff; // Assign PM_Y value here
        } else {
          depth = depthNodes.depthZero;
          PM_Y = graphAttr.ZeroY + height + diff; // Assign PM_Y value here
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
            pY = graphAttr.NegOneY + height;
          } else {
            pY = graphAttr.ZeroY + height;
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
            CM_Y = graphAttr.ZeroY - diff; // Assign PM_Y value here
          } else {
            depth = depthNodes.depthPosOne;
            CM_Y = graphAttr.PosOneY - diff; // Assign PM_Y value here
          }

          // Add a line from the existing (PM_X, PM_Y) spot to (PM_X, CM_Y)
          linePoints.push(PM_X, CM_Y);

          // CM -> CL -> C -> CL -> CM. This joins the lines at the middle point for each connection.
          connections[i].children.forEach(c => {
            let cIndex = depth.indexOf(c);
            let cY = 0;
            if (connections[i].pNodeDepth === "depthNegOne") {
              cY = graphAttr.ZeroY;
            } else {
              cY = graphAttr.PosOneY;
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
      }

      /*****************************************************/
      /*  GET LINE NAME
      /*****************************************************/
      let name = connections[i].parents
        .concat(connections[i].children)
        .toString();

      /*****************************************************/
      /*  CHECK IF THE CONNECTION IS UNUSUAL OR CONTESTED
      /*****************************************************/
      let unusual = {
        tf: false,
        type: "",
        passage: undefined,
        child: undefined
      };
      let contested = {
        tf: false,
        type: "",
        contestedMothers: undefined,
        contestedFathers: undefined,
        uncontestedParents: undefined,
        child: undefined
      };
      let incest = {
        tf: false,
        type: "", //sameGen (e.g. sibling and spouse, same depth), interGen (child & parent, child & aunt, different depths)
        involved: undefined
      };
      // CHECK CONTESTED (PART 1): Check if the connection has already been acknowledged as contested and unusual at the same timee
      let contestedUnusual = connections[i].contestedUnusual;
      let isUnusual = connections[i].isUnusual;

      // CHECK INCEST
      if (connections[i].isIncest) {
        incest = {
          tf: true,
          type: connections[i].parents.length <= 1 ? "interGen" : "sameGen",
          involved: connections[i].parents
        };
      }
      // FOR PARENT -> MAIN NODE CONNECTIONS
      else if (connections[i].pNodeDepth === "depthNegOne") {
        // UNUSUAL: Since the depth in question is depth -1 => one of the children must be the main entity
        // Only check unusual status and contested status of the main entity

        // CHECK IF CONNECTION IS UNUSUAL
        if (entityData.unusual.autochthony.tf) {
          unusual = {
            tf: true,
            type: "Autochthony",
            passage: entityData.unusual.autochthony.passage,
            child: entityData.id
          };
        } else if (entityData.unusual.createdWithoutParents.tf) {
          unusual = {
            tf: true,
            type: "Created Without Parents",
            passage: entityData.unusual.createdWithoutParents.passage,
            child: entityData.id
          };
        } else if (entityData.unusual.createdByAgent.tf) {
          unusual = {
            tf: true,
            type: "Created by Someone Else",
            passage: entityData.unusual.createdByAgent.passage,
            child: entityData.id
          };
        } else if (entityData.unusual.parthenogenesis.tf) {
          unusual = {
            tf: true,
            type: "Parthenogenesis",
            passage: entityData.unusual.parthenogenesis.passage,
            child: entityData.id
          };
        } else if (entityData.unusual.bornFromObject.tf) {
          unusual = {
            tf: true,
            type: "Born from an Object",
            passage: entityData.unusual.bornFromObject.passage,
            child: entityData.id
          };
        }

        // CHECK CONTESTED (PART 2): Check if the main entity has > two parents. If so, is contested
        if (connections[i].parents.length > 2) {
          let contestedMothers = [];
          let contestedFathers = [];
          let uncontestedParents = [];

          if (entityData.relationships.MOTHERS.length > 1) {
            contestedMothers = entityData.relationships.MOTHERS;
          } else if (entityData.relationships.MOTHERS.length === 1) {
            uncontestedParents.push(entityData.relationships.MOTHERS[0]);
          }

          if (entityData.relationships.FATHERS.length > 1) {
            contestedFathers = entityData.relationships.FATHERS;
          } else if (entityData.relationships.FATHERS.length === 1) {
            uncontestedParents.push(entityData.relationships.FATHERS[0]);
          }

          contested = {
            tf: true,
            type: "Contested Parentage",
            contestedMothers: contestedMothers,
            contestedFathers: contestedFathers,
            uncontestedParents: uncontestedParents,
            child: entityData.id
          }; // contestedParents - the list of all parents that are contested, e.g. contested mothers, contested fathers
        }
      }

      // Check Main Node -> Children
      else if (connections[i].pNodeDepth === "depthZero") {
        if (
          connections[i].children[0] === "diesWithoutChildren" &&
          entityData.relationships.CHILDREN.length > 0
        ) {
          contested = {
            tf: true,
            type: "Contested Legacy",
            contestedMothers: undefined,
            contestedFathers: undefined,
            uncontestedParents: undefined,
            child: undefined
          };
        } else if (connections[i].children[0] !== "diesWithoutChildren") {
          if (
            connections[i].children.length > 0 &&
            entityData.unusual.diesWithoutChildren.tf
          ) {
            // CHECK CONTESTED (PART 3.1): Check if contested legacy, aka. has children but is explicitly diesWithoutChildren
            contested = {
              tf: true,
              type: "Contested Legacy",
              contestedMothers: undefined,
              contestedFathers: undefined,
              uncontestedParents: undefined,
              child: undefined
            };
          } else {
            // UNUSUAL: Since the main node is one of the parents,
            // loop through every child for unusuality
            connections[i].children.forEach(c => {
              let cRelationships = JSON.parse(relationships[c]);

              // Check for unusualness
              /* TODO: FIX UNUSUALANESS CHECKER FOR CHILDREN
          if (cRelationships.unusual.autochthony.tf) {
            unusual = {
              tf: true,
              type: "autochthony",
              passage: c.unusual.autochthony.passage,
              child: c
            };
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
          */

              // CONTESTED: Check if the child has > two parents (one of which is the main character). If so, is contested
              // TODO: Make this more complex - note what Greta said about the complexity of contested relationships
              if (
                cRelationships.relationships.MOTHERS.length +
                  cRelationships.relationships.FATHERS.length >
                2
              ) {
                let contestedMothers = [];
                let contestedFathers = [];
                let uncontestedParents = [];
                if (cRelationships.relationships.MOTHERS.length > 1) {
                  contestedMothers = cRelationships.relationships.MOTHERS;
                } else if (cRelationships.relationships.MOTHERS.length === 1) {
                  uncontestedParents = [
                    cRelationships.relationships.MOTHERS[0]
                  ];
                }

                if (cRelationships.relationships.FATHERS.length > 1) {
                  // (entityData.relationships.FATHERS.length > 1) {
                  contestedFathers = cRelationships.relationships.FATHERS;
                } else if (cRelationships.relationships.FATHERS.length === 1) {
                  uncontestedParents = [
                    cRelationships.relationships.FATHERS[0]
                  ];
                }

                contested = {
                  tf: true,
                  type: "Contested Parentage",
                  contestedMothers: contestedMothers,
                  contestedFathers: contestedFathers,
                  uncontestedParents: uncontestedParents,
                  child: c
                }; // contestedParents - the list of all parents that are contested, e.g. contested mothers, contested fathers
              }
            });
          }
        }
      }

      if (connections[i].isIncest && connections[i].parents.length > 1) {
        allLinePoints.push({
          name: name,
          points: linePoints.slice(0, 8),
          unusual: unusual,
          incest: incest,
          contested: contested,
          contestedUnusual: contestedUnusual,
          isUnusual: isUnusual,
          pNodeDepth: connections[i].pNodeDepth
        });
        allLinePoints.push({
          name: name,
          points: linePoints.slice(8, linePoints.length),
          unusual: unusual,
          incest: incest,
          contested: contested,
          contestedUnusual: contestedUnusual,
          isUnusual: isUnusual,
          pNodeDepth: connections[i].pNodeDepth
        });
      } else {
        allLinePoints.push({
          name: name,
          points: linePoints,
          unusual: unusual,
          incest: incest,
          contested: contested,
          contestedUnusual: contestedUnusual,
          isUnusual: isUnusual,
          pNodeDepth: connections[i].pNodeDepth
        });
      }
    }
    return allLinePoints;
  };

  isSpouseRepeated = (sID, allConnections) => {
    let repeated = false;
    for (let i = 0; i < allConnections.length; i++) {
      allConnections[i].parents.forEach(pID => {
        if (sID === pID) {
          repeated = true;
        }
      });
    }
    return repeated;
  };

  /*****************************************************
   *
   *
   *   GETTERS AND SETTERS (INFO CONTENT)
   *
   *
   *****************************************************/

  getPassageLink(passage) {
    let id = passage.startID;
    let author = passages[id].Author;
    let title = passages[id].Title;
    let start = passages[id].Passage;
    let end = passage.endID;

    // Dealing with multiple URNs
    let URN = "";
    let URNsplit = passages[id]["CTS URN"].split(", ");
    if (URNsplit.length >= 2) {
      URN = URNsplit[1];
    } else {
      URN = passages[id]["CTS URN"];
    }
    URN = URN.replace(/grc2/, "eng2"); // View the existing passages CTS URN to english translation
    URN = "https://scaife.perseus.org/reader/" + URN;
    if (passage.endID !== "") {
      end = passages[end].Passage;
      URN = URN + "-" + end;
    }
    URN = URN + "/?right=perseus-eng2";

    return (
      <span>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={URN}
          style={{
            color: "grey",
            fontSize: "16px"
          }}
        >
          {author + ", "}
          <span style={{ fontStyle: "italic" }}>{title}</span> {start}
          {start !== end && end !== "" ? "-" + end : ""}
        </a>
      </span>
    );
  }

  getContestedPermutations(contest) {
    let outer = [];
    let inner = [];
    if (
      contest.contestedFathers.length > 1 &&
      contest.contestedMothers.length > 1
    ) {
      if (contest.contestedFathers.length >= contest.contestedMothers.length) {
        outer = contest.contestedFathers;
        inner = contest.contestedMothers;
      } else {
        outer = contest.contestedMothers;
        inner = contest.contestedFathers;
      }
    } // dispute when other parent is unknown, and known parents are contested
    else if (
      (contest.contestedFathers.length === 0) &
      (contest.uncontestedParents.length === 0) &
      (contest.contestedMothers.length > 0)
    ) {
      outer = contest.contestedMothers;
    } else if (
      (contest.contestedMothers.length === 0) &
      (contest.uncontestedParents.length === 0) &
      (contest.contestedFathers.length > 0)
    ) {
      outer = contest.contestedFathers;
    } else {
      outer = contest.uncontestedParents;
      inner =
        contest.contestedFathers.length > 0
          ? contest.contestedFathers
          : contest.contestedMothers;
    }
    return (
      <div>
        {outer.map((out, i) => {
          if (inner.length > 0) {
            return inner.map((inn, j) => {
              return (
                <div style={{ fontSize: "1.3rem", margin: "1rem 0 1rem 0" }}>
                  <span style={{ fontWeight: "bold" }}>
                    {getName(entities[contest.child])}
                  </span>{" "}
                  is child of{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {getName(entities[out.targetID])}
                  </span>{" "}
                  <span>
                    {out.passage.map((p, k) => {
                      return <span>{this.getPassageLink(p)} </span>;
                    })}
                  </span>
                  and{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {getName(entities[inn.targetID])}
                  </span>{" "}
                  {inn.passage.map((p, k) => {
                    return <span>{this.getPassageLink(p)} </span>;
                  })}
                  {/* if (k === child.passage.length - 1) {
                  return this.getPassageLink(p);
                } else {
                  return (
                    <span>
                      {this.getPassageLink(p)}
                      {" "}
                    </span>
                  );
                } */}
                  {i === outer.length - 1 && j === inner.length - 1 ? (
                    ""
                  ) : (
                    <div>
                      <p></p>OR<p></p>
                    </div>
                  )}
                </div>
              );
            });
          } else {
            return (
              <div style={{ fontSize: "1.3rem", margin: "1rem 0 1rem 0" }}>
                <span style={{ fontWeight: "bold" }}>
                  {getName(entities[contest.child])}
                </span>{" "}
                is child of{" "}
                <span style={{ fontWeight: "bold" }}>
                  {getName(entities[out.targetID])}
                </span>{" "}
                <span>
                  {out.passage.map((p, k) => {
                    return <span>{this.getPassageLink(p)} </span>;
                  })}
                </span>
                {i === outer.length - 1 ? (
                  ""
                ) : (
                  <div>
                    <p></p>OR<p></p>
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>
    );
  }

  getUnusualExplanation = type => {
    if (type === "Autochthony") {
      return "Local heroes are sometimes said to have sprung up out of the ground. These stories often strengthen a community’s claim to long and uncontested ownership of a territory.";
    } else if (type === "Created Without Parents") {
      return "At the very beginnings of mythical time, some primeval gods – often personifications of basic elemental forces – are said to have simply come into being.";
    } else if (type === "Created by Someone Else") {
      return "Gods – and some notable heroes – are said to have created mortals.  ";
    } else if (type === "Born from an Object") {
      return "Some gods and heroes were said to have been born in strange ways, including from eggs, and from a body part of one of their parents.";
    } else if (type === "Parthenogenesis") {
      return "Some goddesses are said to have given birth to children without having had sex. As a result, the offspring do not have fathers.";
    }
  };

  getUnusualVerb = type => {
    if (type === "Autochthony") {
      return " is born by autochthony";
    } else if (type === "Created Without Parents") {
      return " is created without parents";
    } else if (type.type === "Created by Someone Else") {
      return (
        <span>
          {" "}
          is created by{" "}
          <span style={{ fontWeight: "bold" }}>
            {getName(entities[type.objectID])}
          </span>
        </span>
      );
    } else if (type === "Parthenogenesis") {
      return (
        <span>
          {" "}
          is born from{" "}
          <span style={{ fontWeight: "bold" }}>
            {getName(
              entities[this.state.entityData.relationships.MOTHERS[0].targetID]
            )}
          </span>{" "}
          by parthenogenesis.
        </span>
      );
    } else if (
      type.type &&
      type.objectID &&
      type.type === "Born from an Object"
    ) {
      return (
        <span>
          {" "}
          is born from{" "}
          <span style={{ fontWeight: "bold" }}>
            {getName(objects[type.objectID])}
          </span>
        </span>
      );
    }
  };

  //currentExample = id of current entity. This is to remove duplicate suggestions for the same unusual relationship.
  //returns list of IDs that are of this unusual type, excluding the main entity
  //if list is empty, return in main section "no other examples exist"
  getOtherUnusualExamples = (currentExampleID, type) => {
    if (type === "Autochthony") {
      //List of IDs of other entities with autochthony
      let allExamples = [
        "8359949",
        "8189143",
        "8189080",
        "8189673",
        "8187960",
        "8188080",
        "8182143"
      ];
      //Return list of IDs excluding the main entity ID
      allExamples.splice(allExamples.indexOf(currentExampleID), 1);
      return allExamples;
    } else if (type === "Created Without Parents") {
      //List of IDs of other entities with autochthony
      let allExamples = ["8188388"];
      //Return list of IDs excluding the main entity ID
      allExamples.splice(allExamples.indexOf(currentExampleID), 1);
      return allExamples;
    } else if (type === "Created by Someone Else") {
      let allExamples = ["8189114"];
      allExamples.splice(allExamples.indexOf(currentExampleID), 1);
      return allExamples;
    } else if (type === "Born from an Object") {
      let allExamples = [
        "8189128",
        "8188011",
        "8190006",
        "8188175",
        "8188272",
        "8187870",
        "9414339"
      ];
      allExamples.splice(allExamples.indexOf(currentExampleID), 1);
      return allExamples;
    } else if (type === "Parthenogenesis") {
      let allExamples = ["8188476"];
      allExamples.splice(allExamples.indexOf(currentExampleID), 1);
      return allExamples;
    } else if (type === "sameGen" || type === "interGen") {
      let allExamples = ["8188399", "8188355", "8187838", "8188390", "8188388"];
      allExamples.splice(allExamples.indexOf(currentExampleID), 1);
      allExamples.splice(allExamples.indexOf(this.state.entityData.id), 1);
      return allExamples;
    } else return [];
  };

  getUnusualImage = type => {
    if (type === "Autochthony") {
      return (
        <img alt="autochthony" src={require("./images/autochthony.png")}></img>
      );
    } else if (type === "Created Without Parents") {
      return (
        <img
          alt="creation without parents"
          src={require("./images/createdWithoutParents.png")}
        ></img>
      );
    } else if (type === "Created by Someone Else") {
      return (
        <img
          alt="created by someone else"
          src={require("./images/createdByAgent.png")}
        ></img>
      );
    } else if (type === "Born from an Object") {
      return (
        <img
          alt="born from object"
          src={require("./images/bornFromObject.png")}
        ></img>
      );
    } else if (type === "Parthenogenesis") {
      return (
        <img
          alt="parthenogenesis"
          style={{ width: "37px", height: "auto" }}
          src={require("./images/parthenogenesis.png")}
        ></img>
      );
    }
  };

  getStageWidth = () => {
    if (this.state.depthNodes) {
      let maxNodesPerDepth = 0;
      if (this.state.depthNodes.depthNegOne.length > maxNodesPerDepth) {
        maxNodesPerDepth = this.state.depthNodes.depthNegOne.length;
      }
      if (this.state.depthNodes.depthZero.length > maxNodesPerDepth) {
        maxNodesPerDepth = this.state.depthNodes.depthZero.length;
      }
      if (this.state.depthNodes.depthPosOne.length > maxNodesPerDepth) {
        maxNodesPerDepth = this.state.depthNodes.depthPosOne.length;
      }
      return (
        this.state.graphAttr.initX +
        maxNodesPerDepth * this.state.graphAttr.spaceX +
        100
      );
    }
    return 1000;
  };

  getStageHeight = () => {
    if (this.state.depthNodes) {
      if (this.state.depthNodes.depthPosOne.length > 0) {
        return (
          this.state.graphAttr.PosOneY + this.state.graphAttr.nodeHeight + 150
        );
      } else {
        return (
          this.state.graphAttr.ZeroY + this.state.graphAttr.nodeHeight + 150
        );
      }
    } else {
      return 200;
    }
  };

  /****************************************************
   *
   *
   *   EVENT HANDLERS
   *
   *
   ****************************************************/

  /* Node handling */
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

  handlePageChange = e => {
    // TODO: Fix this horrible solution for destroy undefined error for incestuous relationships
    if (this.state.openInfoPage.incest && this.state.openInfoPage.incest.tf) {
      this.props.relationshipClicked(e.target.attrs.id);
      window.location.reload();
    } else {
      this.props.relationshipClicked(e.target.attrs.id);
    }
  };

  handleInTextPageChange = id => {
    // TODO: Fix this horrible solution for destroy undefined error for incestuous relationships
    if (this.state.openInfoPage.incest && this.state.openInfoPage.incest.tf) {
      this.props.relationshipClicked(id);
      window.location.reload();
    } else {
      this.props.relationshipClicked(id);
    }
  };

  /* Line handling (contested + unusual) */
  handleMouseOverLine = e => {
    // thicken the main line
    e.target.to({
      strokeWidth: 8,
      opacity: 1
    });
    // if is incestuous and sameGen, thicken other line as well
    /* Doesn't work for some reason 
    if (e.target.attrs.incest.type === "sameGen") {
      let matchingLines = this.state.stageRef.find(e.target.attrs.name);
      console.log(matchingLines, e.target.attrs.name, this.state.stageRef);
    } */

    // Deal with change of stroke colour when hovering over contestedUnusual connections
    if (e.target.attrs.contestedUnusual.isContested) {
      if (e.target.attrs.contestedUnusual.isUnusual) {
        e.target.to({
          stroke: "#ff0000"
        });
      } else {
        e.target.to({
          stroke: "#000000"
        });
      }
    }
    // thicken the nodes attached to the line
    let nodeIDs = e.target.attrs.name.split(",");
    nodeIDs.forEach(id => {
      //Remove highlighting of icon border
      let idSplit = id.split("_")[0];
      if (
        idSplit !== "autochthony" &&
        idSplit !== "createdWithoutParents" &&
        idSplit !== "createdByAgent" &&
        idSplit !== "bornFromObject" &&
        idSplit !== "parthenogenesis" &&
        id !== "incest"
      ) {
        let nodeWithID = this.state.stageRef.find("." + id);
        nodeWithID.to({
          strokeWidth: 8
        });
        if (
          e.target.attrs.contestedUnusual.isUnusual &&
          e.target.attrs.unusual.tf
        ) {
          document.body.style.cursor = "pointer";
          nodeWithID.to({
            stroke: "#ff0000"
          });
        }
        if (e.target.attrs.contested.tf) {
          document.body.style.cursor = "pointer";
          nodeWithID.to({
            stroke: "#0000ff"
          });
        }
        if (e.target.attrs.incest.tf) {
          document.body.style.cursor = "pointer";
          nodeWithID.to({
            stroke: "#3bb143"
          });
        }
      }
    });

    if (
      e.target.attrs.contested.tf &&
      e.target.attrs.contested.type === "Contested Parentage"
    ) {
      // Add "OR" icon to top right of every node that's contested here

      e.target.attrs.contested.contestedMothers.forEach(p => {
        if (this.state.stageRef.find("." + p.targetID)[0]) {
          let pAttrs = this.state.stageRef.find("." + p.targetID)[0].attrs;
          let ORText = new Konva.Text({
            name: "ORText",
            x: pAttrs.x + this.state.graphAttr.nodeWidth - 65,
            y: pAttrs.y + 5,
            text: "OR",
            fontSize: 26,
            fontStyle: "bold",
            fill: "#0000ff",
            width: 80,
            height: 80,
            align: "center"
          });
          this.state.stageRef.children[1].add(ORText);
        }
      });

      e.target.attrs.contested.contestedFathers.forEach(p => {
        if (this.state.stageRef.find("." + p.targetID)[0]) {
          let pAttrs = this.state.stageRef.find("." + p.targetID)[0].attrs;
          let ORText = new Konva.Text({
            name: "ORText",
            x: pAttrs.x + this.state.graphAttr.nodeWidth - 65,
            y: pAttrs.y + 5,
            text: "OR",
            fontSize: 26,
            fontStyle: "bold",
            fill: "#0000ff",
            width: 80,
            height: 80,
            align: "center"
          });
          this.state.stageRef.children[1].add(ORText);
        }
      });

      /* let sumX = 0;
      let numExistingContestNodes = 0;
      let y = 0;
      let padding = 40;
      e.target.attrs.contested.contestedParents.forEach(p => {
        if (this.state.stageRef.find("." + p.targetID)[0]) {
          let pAttrs = this.state.stageRef.find("." + p.targetID)[0].attrs;
          sumX = sumX + pAttrs.x;
          numExistingContestNodes++;
          y = pAttrs.y;
        } else {
          // Only occurs if the relationship is contested but the dsputed parent is not shown, e.g. Atreus
          padding = 15;
        }
      });
      let x =
        (sumX + this.state.graphAttr.nodeWidth) / numExistingContestNodes -
        padding;
       let ORText = new Konva.Text({
        name: "ORText",
        x: x,
        y: y + 30,
        text: "OR",
        fontSize: 15,
        fontStyle: "bold",
        fill: "#0000ff",
        width: 80,
        height: 80,
        align: "center"
      });
      this.state.stageRef.children[1].add(ORText); */
    } else if (
      e.target.attrs.contested.tf &&
      e.target.attrs.contested.type === "Contested Legacy"
    ) {
      this.state.entityData.relationships.CHILDREN.forEach(childGroup => {
        childGroup.child.forEach(c => {
          if (this.state.stageRef.find("." + c.targetID)[0]) {
            let pAttrs = this.state.stageRef.find("." + c.targetID)[0].attrs;
            let ORText = new Konva.Text({
              name: "ORText",
              x: pAttrs.x + this.state.graphAttr.nodeWidth - 65,
              y: pAttrs.y + 5,
              text: "OR",
              fontSize: 26,
              fontStyle: "bold",
              fill: "#0000ff",
              width: 80,
              height: 80,
              align: "center"
            });
            this.state.stageRef.children[1].add(ORText);
          }
        });
      });
      let mainEntity = this.state.stageRef.find(
        "." + this.state.entityData.id
      )[0].attrs;
      let ORText = new Konva.Text({
        name: "ORText",
        x: mainEntity.x + this.state.graphAttr.nodeWidth / 2 - 10,
        y: mainEntity.y + this.state.graphAttr.nodeHeight + 60,
        text: "OR",
        fontSize: 26,
        fontStyle: "bold",
        fill: "#0000ff",
        width: 80,
        height: 80,
        align: "center"
      });
      this.state.stageRef.children[1].add(ORText);
    }
    // console.log("End");
  };

  handleMouseOutLine = e => {
    // console.log(e, "Mouseout");
    // thin the main line
    document.body.style.cursor = "default";
    e.target.to({
      strokeWidth: 4,
      opacity:
        e.target.attrs.unusual.tf ||
        e.target.attrs.contested.tf ||
        e.target.attrs.incest.tf
          ? 1
          : 0.3
    });
    // Deal with change of stroke colour when hovering over contestedUnusual connections
    if (e.target.attrs.contestedUnusual.isContested) {
      e.target.to({
        stroke: "#0000ff"
      });
    }

    // thin out the nodes attached to the line upon mouseout
    let nodeDs = e.target.attrs.name.split(",");
    nodeDs.forEach(id => {
      let idSplit = id.split("_")[0];
      if (
        idSplit !== "autochthony" &&
        idSplit !== "createdWithoutParents" &&
        idSplit !== "createdByAgent" &&
        idSplit !== "bornFromObject" &&
        idSplit !== "parthenogenesis"
      ) {
        this.state.stageRef.find("." + id).to({
          strokeWidth: 4,
          stroke: "#000000"
        });
      }
    });
    if (e.target.attrs.contested.tf) {
      this.state.stageRef.children[1].find(".ORText").remove();
    }
  };

  handleClickedLine = e => {
    if (
      e.target.attrs.unusual.tf &&
      e.target.attrs.contestedUnusual.isUnusual
    ) {
      //Rudimentary solution for scrolling up to the contested info page
      if (
        !this.state.openInfoPage.showContestPage &&
        !this.state.openInfoPage.showUnusualPage &&
        !this.state.openInfoPage.showIncestPage
      ) {
        window.scrollBy(-3000, -200);
      } else {
        window.scrollBy(-3000, -400);
      }
      this.setState({
        openInfoPage: {
          showContestPage: false,
          contest: undefined,
          showUnusualPage: true,
          unusual: e.target.attrs.unusual,
          showIncestPage: false,
          incest: undefined
        }
      });
    } else if (e.target.attrs.contested.tf) {
      // let legend = document.getElementById("legend");
      // let pos = legend.getBoundingClientRect();
      // let x = 0; //
      // let y = pos.bottom;
      // console.log("Current input", pos);

      //Rudimentary solution for scrolling up to the contested info page
      if (
        !this.state.openInfoPage.showContestPage &&
        !this.state.openInfoPage.showUnusualPage &&
        !this.state.openInfoPage.showIncestPage
      ) {
        window.scrollBy(-3000, -200);
      } else {
        window.scrollBy(-3000, -400);
      }
      this.setState({
        openInfoPage: {
          showContestPage: true,
          contest: e.target.attrs.contested,
          showUnusualPage: false,
          unusual: undefined,
          showIncestPage: false,
          incest: undefined
        }
      });
    } else if (e.target.attrs.incest.tf) {
      if (
        !this.state.openInfoPage.showContestPage &&
        !this.state.openInfoPage.showUnusualPage &&
        !this.state.openInfoPage.showIncestPage
      ) {
        window.scrollBy(-3000, -200);
      } else {
        window.scrollBy(-3000, -400);
      }
      this.setState({
        openInfoPage: {
          showContestPage: false,
          contest: undefined,
          showUnusualPage: false,
          unusual: undefined,
          showIncestPage: true,
          incest: e.target.attrs.incest
        }
      });
    } else {
      this.setState({
        openInfoPage: {
          showContestPage: false,
          contest: undefined,
          showUnusualPage: false,
          unusual: undefined,
          showIncestPage: false,
          incest: undefined
        }
      }); //  Is a normal relationship line, do nothing
    }
  };

  // Clicked icons
  handleClickedIcons = e => {
    let unusual;
    if (e.target.attrs.name.split("_")[0] === "autochthony") {
      //UPDATE TO ALLOW CASES OF DEPTHPOSONE CASES OF AUTOCHTHONY TOO
      unusual = {
        tf: true,
        type: "Autochthony",
        passage: e.target.attrs.info.passage,
        child: this.state.id
      };
    } else if (e.target.attrs.name.split("_")[0] === "createdWithoutParents") {
      unusual = {
        tf: true,
        type: "Created Without Parents",
        passage: e.target.attrs.info.passage,
        child: this.state.id
      };
    } else if (e.target.attrs.name.split("_")[0] === "createdByAgent") {
      unusual = {
        tf: true,
        type: "Created by Someone Else",
        passage: e.target.attrs.info.passage,
        child: this.state.id
      };
    } else if (e.target.attrs.name.split("_")[0] === "bornFromObject") {
      unusual = {
        tf: true,
        type: "Born from an Object",
        passage: e.target.attrs.info.passage,
        child: this.state.id
      };
    } else if (e.target.attrs.name.split("_")[0] === "parthenogenesis") {
      unusual = {
        tf: true,
        type: "Parthenogenesis",
        passage: e.target.attrs.info.passage,
        child: this.state.id
      };
    }
    //Rudimentary solution for scrolling up to the contested info page
    if (
      !this.state.openInfoPage.showContestPage &&
      !this.state.openInfoPage.showUnusualPage &&
      !this.state.openInfoPage.showIncestPage
    ) {
      window.scrollBy(-3000, -200);
    } else {
      window.scrollBy(-3000, -400);
    }
    this.setState({
      openInfoPage: {
        showContestPage: false,
        contest: undefined,
        showUnusualPage: true,
        unusual: unusual,
        showIncestPage: false,
        incest: undefined
      }

      // For this.state.liveinks, split by "," and check if any of the arrays .includes(autochthony ID depth neg one)
      // If so, put unususal: this.state.livelinkp(x) and chec if info page responds to
      // Contested relationships
    });
  };

  /****************************************************
   *
   *
   *   RENDERING
   *
   *
   ****************************************************/

  render() {
    //Icons for unusual relationships
    const AutochthonyIcon = e => {
      const [image] = useImage(require("./images/autochthony.png"));
      return (
        <Image
          image={image}
          name={e.name}
          info={this.state.entityData.unusual.autochthony}
          x={e.x + 20}
          y={e.y}
          width={100}
          height={80}
          onClick={this.handleClickedIcons}
          onMouseOver={this.handleMouseOverNode}
          onMouseOut={this.handleMouseOutNode}
        />
      );
    };
    const CreatedWithoutParentsIcon = e => {
      const [image] = useImage(require("./images/createdWithoutParents.png"));
      return (
        <Image
          image={image}
          name={e.name}
          info={this.state.entityData.unusual.createdWithoutParents}
          x={e.x + 24}
          y={e.y}
          width={100}
          height={80}
          onClick={this.handleClickedIcons}
          onMouseOver={this.handleMouseOverNode}
          onMouseOut={this.handleMouseOutNode}
        />
      );
    };
    const CreatedByAgentIcon = e => {
      const [image] = useImage(require("./images/createdByAgent.png"));
      return (
        <Image
          image={image}
          name={e.name}
          info={this.state.entityData.unusual.createdByAgent}
          x={e.x - 40}
          y={e.y}
          width={100}
          height={80}
          onClick={this.handleClickedIcons}
          onMouseOver={this.handleMouseOverNode}
          onMouseOut={this.handleMouseOutNode}
        />
      );
    };
    const BornFromObjectIcon = e => {
      const [image] = useImage(require("./images/bornFromObject.png"));
      return (
        <Image
          image={image}
          name={e.name}
          info={this.state.entityData.unusual.bornFromObject}
          x={e.x - 40}
          y={e.y}
          width={80}
          height={80}
          onClick={this.handleClickedIcons}
          onMouseOver={this.handleMouseOverNode}
          onMouseOut={this.handleMouseOutNode}
        />
      );
    };
    const ParthenogenesisIcon = e => {
      const [image] = useImage(require("./images/parthenogenesis.png"));
      return (
        <Image
          image={image}
          name={e.name}
          info={this.state.entityData.unusual.parthenogenesis}
          x={e.x}
          y={e.y - 30}
          width={45}
          height={70}
          onClick={this.handleClickedIcons}
          onMouseOver={this.handleMouseOverNode}
          onMouseOut={this.handleMouseOutNode}
        />
      );
    };
    return (
      <React.Fragment>
        {/* Legend */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }} id="legend">
          <h1>Graph Legend</h1>
          <img
            alt="graph legend"
            src={require("./images/legend.png")}
            style={{ maxWidth: "80%" }}
          ></img>
          <p></p>Hover over the lines and icons to show the connections.
          Clicking on the nodes will direct you to the graph for that node.
          Clicking on coloured lines and icons shows you information for that
          connection.
        </div>

        {/* Info pages for contested relationships */}
        <div
          style={{
            margin: "20px 96px 20px 96px",
            border: "1px solid #000000",
            boxShadow: "2px 2px 4px 2px #bbbbbb",
            background: "#ffffff"
          }}
          className={
            this.state.openInfoPage.showContestPage ? "" : "no-display"
          }
          id="contestedInfoPage"
        >
          <div
            style={{
              margin: "20px",
              border: "3px solid #0000ff",
              padding: "2rem 4rem 4rem 4rem"
            }}
          >
            <p style={{ textAlign: "center", color: "#808080" }}>
              Contested Tradition
            </p>
            <h2 style={{ textAlign: "center" }}>
              {this.state.openInfoPage.contest
                ? this.state.openInfoPage.contest.type
                : ""}
            </h2>
            <p></p>
            <p style={{ fontStyle: "italic", textAlign: "center" }}>
              (inconsistencies between retellings of the tradition)
            </p>
            <p>
              Contestation is an inherent part of Greek myth. Because the
              ancient mythic tradition was tolerant of plurality, there were
              frequently several variant traditions about who the parents of a
              god or hero were.
            </p>
            <p>In this case, the contestation is:</p>
            {this.state.openInfoPage.contest &&
            this.state.openInfoPage.contest.type === "Contested Parentage" ? (
              this.getContestedPermutations(this.state.openInfoPage.contest)
            ) : (
              // Dies without children contested
              <div style={{ fontSize: "1.3rem", margin: "1rem 0 1rem 0" }}>
                <span style={{ fontWeight: "bold" }}>
                  {this.state.entityData.name}{" "}
                </span>
                has no children according to{" "}
                {this.state.entityData.unusual &&
                this.state.entityData.unusual.diesWithoutChildren.tf
                  ? this.state.entityData.unusual.diesWithoutChildren.passage.map(
                      m => {
                        return this.getPassageLink(m);
                      }
                    )
                  : ""}
                <p></p>
                However,
                <p></p>
                {this.state.entityData.relationships
                  ? this.state.entityData.relationships.CHILDREN.map(cp => {
                      return (
                        <span>
                          <span style={{ fontWeight: "bold" }}>
                            {this.state.entityData.name}
                          </span>{" "}
                          has{" "}
                          {cp.child.map(c => {
                            return (
                              <span>
                                <span style={{ fontWeight: "bold" }}>
                                  {c.target}{" "}
                                </span>{" "}
                                {c.passage.map(p => {
                                  return this.getPassageLink(p);
                                })}
                                {cp.otherParentIDs.length > 0 ? (
                                  <span>{", "}</span>
                                ) : (
                                  ""
                                )}
                              </span>
                            );
                          })}{" "}
                          {cp.otherParentIDs.length > 0 ? (
                            <span>with </span>
                          ) : (
                            ""
                          )}
                          {cp.otherParentIDs.map(p => {
                            return p ===
                              cp.otherParentIDs[cp.otherParentIDs.length - 1]
                              ? getName(entities[p]) + ", "
                              : getName(entities[p]);
                          })}
                        </span>
                      );
                    })
                  : ""}
              </div>
            )}
          </div>
        </div>
        {/* Info pages for unusual relationships */}
        {this.state.openInfoPage.unusual ? (
          <div
            style={{
              margin: "20px 96px 20px 96px",
              border: "1px solid #000000",
              boxShadow: "2px 2px 4px 2px #bbbbbb",
              background: "#ffffff"
            }}
            className={
              this.state.openInfoPage.showUnusualPage ? "" : "no-display"
            }
            id="unusualInfoPage"
          >
            <div
              style={{
                margin: "20px",
                border: "3px solid #ff0000",
                padding: "2rem 4rem 4rem 4rem",
                position: "relative"
              }}
            >
              <div style={{ position: "absolute", top: "50px", left: "64px" }}>
                {this.getUnusualImage(this.state.openInfoPage.unusual.type)}
              </div>
              <p style={{ textAlign: "center", color: "#808080" }}>
                Unusual relationship
              </p>

              <h2 style={{ textAlign: "center" }}>
                {this.state.openInfoPage.unusual.type}
              </h2>
              <p></p>
              <p>
                {this.getUnusualExplanation(
                  this.state.openInfoPage.unusual.type
                )}
              </p>
              <p>In this case:</p>
              <div
                style={{
                  fontSize: "1.3rem",
                  margin: "1rem 0 1rem 0"
                }}
              >
                <span style={{ fontWeight: "bold" }}>
                  {this.state.entityData.name}
                </span>
                {this.state.openInfoPage.unusual.type === "Born from an Object"
                  ? this.getUnusualVerb({
                      type: this.state.openInfoPage.unusual.type,
                      objectID: this.state.entityData.relationships.BORNFROM[0]
                        .targetID
                    })
                  : this.state.openInfoPage.unusual.type ===
                    "Created by Someone Else"
                  ? this.getUnusualVerb({
                      type: this.state.openInfoPage.unusual.type,
                      objectID: this.state.entityData.relationships.CREATORS[0]
                        .targetID
                    })
                  : this.getUnusualVerb(this.state.openInfoPage.unusual.type)}
                {/*TODO: Fix for not just autochthony for current entity */}
                {this.state.openInfoPage.unusual.passage.map((p, i) => {
                  return <span> ({this.getPassageLink(p)}) </span>;
                })}
              </div>
              {this.getOtherUnusualExamples(
                this.state.entityData.id,
                this.state.openInfoPage.unusual.type
              ).length > 0 ? (
                <React.Fragment>
                  <div style={{ marginTop: "4rem", color: "#808080" }}>
                    Some other examples of{" "}
                    {this.state.openInfoPage.unusual.type}:
                  </div>
                  <ul>
                    {this.getOtherUnusualExamples(
                      this.state.entityData.id,
                      this.state.openInfoPage.unusual.type
                    ).map(id => {
                      return (
                        <li
                          onClick={() => {
                            this.handleInTextPageChange(id);
                          }}
                          style={{
                            textDecoration: "underline",
                            cursor: "pointer"
                          }}
                        >
                          {getName(entities[id])}
                        </li>
                      );
                    })}
                  </ul>
                </React.Fragment>
              ) : (
                <div style={{ marginTop: "4rem", color: "#808080" }}>
                  There are no other examples of{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {this.state.openInfoPage.unusual.type}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          ""
        )}
        {/* Info pages for incest relationships */}
        {this.state.openInfoPage.incest ? (
          <div
            style={{
              margin: "20px 96px 20px 96px",
              border: "1px solid #000000",
              boxShadow: "2px 2px 4px 2px #bbbbbb",
              background: "#ffffff"
            }}
            className={this.state.openInfoPage.incest ? "" : "no-display"}
            id="incestInfoPage"
          >
            <div
              style={{
                margin: "20px",
                border: "3px solid #3bb143",
                padding: "2rem 4rem 4rem 4rem",
                position: "relative"
              }}
            >
              <h2 style={{ textAlign: "center" }}>
                {this.state.openInfoPage.incest
                  ? this.state.openInfoPage.incest.type === "sameGen"
                    ? "Sibling-Spousal Incest"
                    : "Intergenerational Incest"
                  : ""}
              </h2>
              <p style={{ fontStyle: "italic", textAlign: "center" }}>
                (relationships between close relatives in{" "}
                {this.state.openInfoPage.incest
                  ? this.state.openInfoPage.incest.type === "sameGen"
                    ? "the same "
                    : "different "
                  : ""}{" "}
                generations)
              </p>
              <p>
                Greek myth is full of incestuous relationships. In Apollodoros,
                they are particularly prominent in the early generations of the
                gods.
              </p>
              <div style={{ fontSize: "1.3rem", margin: "1rem 0 1rem 0" }}>
                <span style={{ fontWeight: "bold" }}>
                  {this.state.openInfoPage.incest
                    ? " " +
                      getName(
                        entities[this.state.openInfoPage.incest.involved[0]]
                      ) +
                      " "
                    : ""}
                </span>
                {this.state.openInfoPage.incest ? (
                  this.state.openInfoPage.incest.type === "sameGen" ? (
                    <span>
                      has a relationship with{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {getName(
                          entities[this.state.openInfoPage.incest.involved[1]]
                        )}{" "}
                      </span>
                      which is an incestuous relationship.
                    </span>
                  ) : (
                    "is mentioned twice in this graph in different generations, meaning they are either involved in, or are a product of an incestuous inter-generational relationship."
                  )
                ) : (
                  ""
                )}
              </div>
              {this.getOtherUnusualExamples(
                this.state.openInfoPage.incest.involved[0],
                this.state.openInfoPage.incest.type
              ).length > 0 ? (
                <React.Fragment>
                  <div style={{ marginTop: "4rem", color: "#808080" }}>
                    Some other examples of incest:
                  </div>
                  <ul>
                    {this.getOtherUnusualExamples(
                      this.state.openInfoPage.incest.involved[0],
                      this.state.openInfoPage.incest.type
                    ).map(id => {
                      return (
                        <li
                          onClick={() => {
                            this.handleInTextPageChange(id);
                          }}
                          style={{
                            textDecoration: "underline",
                            cursor: "pointer"
                          }}
                        >
                          {getName(entities[id])}
                        </li>
                      );
                    })}
                  </ul>
                </React.Fragment>
              ) : (
                "There are no other examples of incest"
              )}
            </div>
          </div>
        ) : (
          ""
        )}
        {/* Graph rendering with KonvajS */}
        <Stage
          ref="stage"
          width={this.getStageWidth()}
          height={this.getStageHeight()}
        >
          <Layer>
            {this.state.depthNodes.depthNegOne.map((e, i) =>
              e.split("_")[0] === "bornFromObject" &&
              e.split("_")[2] === "NegOne" ? (
                <Text
                  x={
                    this.state.graphAttr.initX + this.state.graphAttr.spaceX * i
                  }
                  ref="text"
                  y={this.state.graphAttr.NegOneY}
                  text={getName(objects[e.split("_")[1]])}
                  fontSize={18}
                  fontFamily="Calibri"
                  fontStyle="bold"
                  fill="#808080"
                  width={this.state.graphAttr.nodeWidth}
                  height={this.state.graphAttr.nodeHeight}
                  padding={20}
                  align="center"
                />
              ) : (
                <Text
                  x={
                    this.state.graphAttr.initX + this.state.graphAttr.spaceX * i
                  }
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
              )
            )}
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
            {this.state.depthNodes.depthNegOne.map((e, i) =>
              e === "autochthony_NegOne" ? (
                <AutochthonyIcon
                  name={e}
                  x={
                    this.state.graphAttr.initX + this.state.graphAttr.spaceX * i
                  }
                  y={this.state.graphAttr.NegOneY}
                />
              ) : e === "createdWithoutParents_NegOne" ? (
                <CreatedWithoutParentsIcon
                  name={e}
                  x={
                    this.state.graphAttr.initX + this.state.graphAttr.spaceX * i
                  }
                  y={this.state.graphAttr.NegOneY}
                />
              ) : e.split("_")[0] === "bornFromObject" &&
                e.split("_")[2] === "NegOne" ? (
                <Rect
                  refs={"rect"}
                  id={e}
                  name={e}
                  x={
                    this.state.graphAttr.initX + this.state.graphAttr.spaceX * i
                  }
                  y={this.state.graphAttr.NegOneY}
                  width={this.state.graphAttr.nodeWidth}
                  height={this.state.graphAttr.nodeHeight}
                  stroke="#808080"
                  strokeWidth={4}
                  dash={[10, 5]}
                />
              ) : (
                <Rect
                  refs={"rect"}
                  id={e}
                  name={e}
                  x={
                    this.state.graphAttr.initX + this.state.graphAttr.spaceX * i
                  }
                  y={this.state.graphAttr.NegOneY}
                  width={this.state.graphAttr.nodeWidth}
                  height={this.state.graphAttr.nodeHeight}
                  stroke="#000"
                  strokeWidth={4}
                  onMouseOver={this.handleMouseOverNode}
                  onMouseOut={this.handleMouseOutNode}
                  onClick={this.handlePageChange}
                />
              )
            )}
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
                name={e.incest.tf ? "incest," + e.name : e.name} // rudimentary deal with hovering error
                points={e.points}
                unusual={e.unusual}
                incest={e.incest}
                contested={e.contested}
                contestedUnusual={{
                  isContested: e.contestedUnusual,
                  isUnusual: e.isUnusual
                }}
                stroke={
                  e.contested.tf || e.contestedUnusual
                    ? "#0000ff"
                    : e.unusual.tf
                    ? "#ff0000"
                    : e.incest.tf
                    ? "#3bb143"
                    : "#000000"
                }
                opacity={
                  e.unusual.tf || e.contested.tf || e.incest.tf ? 1 : 0.3
                }
                strokeWidth={4}
                onMouseOver={this.handleMouseOverLine}
                onMouseOut={this.handleMouseOutLine}
                onClick={this.handleClickedLine}
              />
            ))}
            {this.state.lineLinks.map((e, i) => (
              <React.Fragment>
                {e.unusual.type === "Created by Someone Else" && e.isUnusual ? (
                  <CreatedByAgentIcon
                    name={"createdByAgent_NegOne"}
                    x={e.points[e.points.length / 2 - 1]}
                    y={
                      (this.state.graphAttr.NegOneY +
                        this.state.graphAttr.ZeroY) /
                        2 -
                      20
                    }
                  />
                ) : e.unusual.type === "Born from an Object" && e.isUnusual ? (
                  <BornFromObjectIcon
                    name={
                      "bornFromObject_" +
                      this.state.entityData.relationships.BORNFROM[0].targetID +
                      "_NegOne"
                    }
                    x={e.points[e.points.length / 2 - 1]}
                    y={
                      (this.state.graphAttr.NegOneY +
                        this.state.graphAttr.ZeroY) /
                      2
                    }
                  />
                ) : e.unusual.type === "Parthenogenesis" && e.isUnusual ? (
                  <ParthenogenesisIcon
                    name={"parthenogenesis_NegOne"}
                    x={(e.points[0] + e.points[2]) / 2}
                    y={(e.points[1] + e.points[3]) / 2}
                  />
                ) : (
                  <React.Fragment></React.Fragment>
                )}
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </React.Fragment>
    );
  }
}

export default EntityGraph;
