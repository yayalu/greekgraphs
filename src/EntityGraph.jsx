// template from: https://konvajs.org/docs/react/index.html
// Refs (stage and components): https://reactjsexample.com/react-binding-to-canvas-element-via-konva-framework/
import React, { Component } from "react";
import Konva from "konva";
import { Stage, Layer, Text, Rect, Line, Image } from "react-konva";
import relationships from "./data/relationships.json";
import objects from "./data/objects.json";
import { getName } from "./DataCardHandler";
import entities from "./data/entities.json";
import useImage from "use-image";
import passages from "./data/passages.json";

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
        unusual: undefined
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
    let connectionsList = this.getConnectionsList(entityData, this.props.id);
    // Set states
    this.setState({
      allShapes: this.refs.stage.children[1].children,
      stageRef: this.refs.stage,
      id: this.props.id,
      entityData: entityData,
      depthNodes: this.getDepthNodes(entityData),
      lineLinks: this.getAllLinePoints(
        this.getDepthNodes(entityData),
        entityData,
        connectionsList
      ),
      openInfoPage: {
        showContestPage: false,
        contest: undefined,
        showUnusualPage: false,
        unusual: undefined
      }
    });
  }

  componentDidUpdate() {
    if (this.props.id !== this.state.id) {
      // deal with agamemnon (default value) not showing up
      let entityData = JSON.parse(relationships[this.props.id]);
      let depthNodes = this.getDepthNodes(entityData);

      // Create a connection calculator here
      let connectionsList = this.getConnectionsList(entityData, this.props.id);

      this.setState({
        allShapes: this.refs.stage.children[1].children,
        stageRef: this.refs.stage,
        id: this.props.id,
        entityData: entityData,
        depthNodes: depthNodes,
        lineLinks: this.getAllLinePoints(
          depthNodes,
          entityData,
          connectionsList
        ),
        openInfoPage: {
          showContestPage: false,
          contest: undefined,
          showUnusualPage: false,
          unusual: undefined
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
      depthNegOne.push(m.targetID);
    });
    entityData.relationships.FATHERS.forEach(f => {
      depthNegOne.push(f.targetID);
    });
    entityData.relationships.CREATORS.forEach(c => {
      depthNegOne.push(c.targetID);
    });

    // Create unusual nodes, and add them to the end of depth -1
    // TODO deal with depth Zero nodes too
    if (entityData.unusual.autochthony.tf) {
      depthNegOne.push("autochthony_NegOne");
    } else if (entityData.unusual.parthenogenesis.tf) {
      depthNegOne.push("parthenogenesis_NegOne");
    } else if (entityData.unusual.bornFromObject.tf) {
      depthNegOne.push(
        "bornFromObject_" +
          entityData.unusual.bornFromObject.objectID +
          "_NegOne"
      ); //bornFromObject: <type>_<objectID>_<depth>
    } else if (entityData.unusual.createdWithoutParents.tf) {
      depthNegOne.push("createdWithoutParents_NegOne");
    } else if (entityData.unusual.diesWithoutChildren.tf) {
      depthNegOne.push("diesWithoutChildren_NegOne");
    }

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

    // Add the central node in the graph. Removes 3-parent contest resulting in "OR" on the main node, see Aerope
    if (depthZero.length > 3) {
      depthZero.splice(Math.ceil(depthZero.length / 2), 0, this.props.id); // NOte that the above deals with entityInfo type, but this (aka. highlighted node) is just ID
    } else {
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

    //IF UNUSUAL RELATIONSHIP:
    if (entityData.unusual.autochthony.tf) {
      allConnections.push({
        parents: ["autochthony_NegOne"],
        children: [id],
        pNodeDepth: "depthNegOne"
      });
    } else if (entityData.unusual.createdWithoutParents.tf) {
      allConnections.push({
        parents: ["createdWithoutParents_NegOne"],
        children: [id],
        pNodeDepth: "depthNegOne"
      });
    } else if (entityData.unusual.parthenogenesis.tf) {
      allConnections.push({
        parents: ["parthenogenesis_NegOne"],
        children: [id],
        pNodeDepth: "depthNegOne"
      });
    } else if (entityData.unusual.bornFromObject.tf) {
      allConnections.push({
        parents: [
          "bornFromObject_" +
            entityData.relationships.BORNFROM[0].targetID +
            "_NegOne"
        ],
        children: [id],
        pNodeDepth: "depthNegOne"
      });
    } else if (entityData.unusual.createdByAgent.tf) {
      allConnections.push({
        parents: [entityData.relationships.CREATORS[0].targetID],
        children: [id],
        pNodeDepth: "depthNegOne"
      });
    } else if (entityData.unusual.diesWithoutChildren.tf) {
    }

    return allConnections;
  };

  /* GET LINE POINTS BASED ON THE LINE CONNECTIONS FOUND */

  // Create an array holding all relationships between entities, parent+parent->children+siblings [[P,P,C,S], [...]]
  getAllLinePoints = (depthNodes, entityData, connections) => {
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

      console.log("Connections", connections[i]);
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
        passageLinks: undefined,
        contestedParents: undefined,
        uncontestedParents: undefined,
        child: undefined
      };

      // Check Parent -> Main Node
      if (connections[i].pNodeDepth === "depthNegOne") {
        // UNUSUAL: Since the depth in question is depth -1 => one of the children must be the main entity
        // Only check unusual status and contested status of the main entity
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
            type: "Created by an Agent",
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
        } else if (entityData.unusual.diesWithoutChildren.tf) {
          //TODO: deal with this in a more suitable place
          unusual = {
            tf: true,
            type: "Dies without children",
            passage: entityData.unusual.diesWithoutChildren.passage,
            child: entityData.id
          };
        }

        // CONTESTED: Check if the main entity has > two parents. If so, is contested
        // TODO: Make this more complex - note what Greta said about the complexity of contested relationships
        if (connections[i].parents.length > 2) {
          // CURRENTLY ASSUMES ONLY ONE SIDE HAS MORE THAN ONE PARENT
          let contestedParents = [];
          let uncontestedParents;
          let passageLinks = [];
          if (entityData.relationships.MOTHERS.length > 1) {
            contestedParents = entityData.relationships.MOTHERS;
            entityData.relationships.MOTHERS.forEach(m => {
              passageLinks.push(m.passage);
            });
            uncontestedParents = entityData.relationships.FATHERS[0];
          } else {
            // (entityData.relationships.FATHERS.length > 1) {
            contestedParents = entityData.relationships.FATHERS;
            entityData.relationships.MOTHERS.forEach(m => {
              passageLinks.push(m.passage);
            });
            uncontestedParents = entityData.relationships.MOTHERS[0];
          }
          contested = {
            tf: true,
            type: "Contested tradition",
            passageLinks: passageLinks,
            contestedParents: contestedParents,
            uncontestedParents: uncontestedParents,
            child: entityData.id
          }; // contestedParents - the list of all parents that are contested, e.g. contested mothers, contested fathers
        }
      }
      // Check Main Node -> Children
      else if (connections[i].pNodeDepth === "depthZero") {
        // UNUSUAL: Since the main node is one of the parents,
        // loop through every child for unusuality
        connections[i].children.forEach(c => {
          let cRelationships = JSON.parse(relationships[c]);

          // Check for unusualness
          /* TODO: unusual relationships for children 
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
            // CURRENTLY ASSUMES ONLY ONE SIDE HAS MORE THAN ONE PARENT
            let contestedParents = [];
            let uncontestedParents; //uncontested parents (singular)
            let passageLinks = [];
            if (cRelationships.relationships.MOTHERS.length > 1) {
              contestedParents = cRelationships.relationships.MOTHERS;
              cRelationships.relationships.MOTHERS.forEach(m => {
                passageLinks.push(m.passage);
              });
              uncontestedParents = cRelationships.relationships.FATHERS[0];
            } else {
              // (entityData.relationships.FATHERS.length > 1) {
              contestedParents = cRelationships.relationships.FATHERS;
              cRelationships.relationships.MOTHERS.forEach(m => {
                passageLinks.push(m.passage);
              });
              uncontestedParents = cRelationships.relationships.MOTHERS[0];
            }
            contested = {
              tf: true,
              type: "Contested tradition",
              passageLinks: passageLinks,
              contestedParents: contestedParents,
              uncontestedParents: uncontestedParents,
              child: c
            }; // contestedParents - the list of all parents that are contested, e.g. contested mothers, contested fathers
          }
        });
      }

      allLinePoints.push({
        name: name,
        points: linePoints,
        unusual: unusual,
        contested: contested
      });
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

  getUnusualExplanation = type => {
    if (type === "Autochthony") {
      return "Local heroes are sometimes said to have sprung up out of the ground. These stories often strengthen a community’s claim to long and uncontested ownership of a territory.";
    } else if (type === "Created Without Parents") {
      return "At the very beginnings of mythical time, some primeval gods – often personifications of basic elemental forces – are said to have simply come into being.";
    } else if (type === "Created by an Agent") {
      return "Gods – and some notable heroes – are said to have created mortals.  ";
    } else if (type === "Born from an Object") {
      return "Some gods and heroes were said to have been born in strange ways, including from eggs, and from a body part of one of their parents.";
    }
  };

  getUnusualVerb = type => {
    if (type === "Autochthony") {
      return " is born by autochthony";
    } else if (type === "Created Without Parents") {
      return " is created without parents";
    } else if (type === "Created by an Agent") {
      return " is created by an agent";
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
    } else if (type === "Created by an Agent") {
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
    this.props.relationshipClicked(e.target.attrs.id);
  };
  handleInTextPageChange = id => {
    this.props.relationshipClicked(id);
  };

  /* Line handling (contested + unusual) */
  handleMouseOverLine = e => {
    // thicken the main line
    e.target.to({
      strokeWidth: 8,
      opacity: 1
    });
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
        idSplit !== "parthenogenesis"
      ) {
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
        if (e.target.attrs.contested.tf) {
          document.body.style.cursor = "pointer";
          nodeWithID.to({
            stroke: "#0000ff"
          });
        }
      }
    });

    if (e.target.attrs.contested.tf) {
      let sumX = 0;
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
      this.state.stageRef.children[1].add(ORText);
    }
  };

  handleMouseOutLine = e => {
    // thin the main line
    document.body.style.cursor = "default";
    e.target.to({
      strokeWidth: 4,
      opacity:
        e.target.attrs.unusual.tf || e.target.attrs.contested.tf ? 1 : 0.3
    });
    // thicken the nodes attached to the line
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
      this.state.stageRef.children[1].find(".ORText")[0].remove();
    }
  };

  handleClickedLine = e => {
    if (e.target.attrs.unusual.tf) {
      //this.props.handleUnusualClicked = e.target.attrs.unusual;
      this.setState({
        openInfoPage: {
          showContestPage: false,
          contest: undefined,
          showUnusualPage: true,
          unusual: e.target.attrs.unusual
        }
      });
    } else if (e.target.attrs.contested.tf) {
      this.setState({
        openInfoPage: {
          showContestPage: true,
          contest: e.target.attrs.contested,
          showUnusualPage: false,
          unusual: undefined
        }
      });
    } else {
      this.setState({
        openInfoPage: {
          showContestPage: false,
          contest: undefined,
          showUnusualPage: false,
          unusual: undefined
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
        type: "Created by an Agent",
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
    this.setState({
      openInfoPage: {
        showContestPage: false,
        contest: undefined,
        showUnusualPage: true,
        unusual: unusual
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
    return (
      <React.Fragment>
        {/* Legend */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1>Graph Legend</h1>
          <img
            alt="graph legend"
            src={require("./images/legend.png")}
            style={{ maxWidth: "80%" }}
          ></img>
          <p></p>Hover over elements to show the connections. Clicking on the
          nodes will direct you to the graph for that node.
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
        >
          <div
            style={{
              margin: "20px",
              border: "3px solid #0000ff",
              padding: "2rem 4rem 4rem 4rem"
            }}
          >
            <h2 style={{ textAlign: "center" }}>Contested Tradition </h2>
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
            {this.state.openInfoPage.contest
              ? this.state.openInfoPage.contest.contestedParents.map((c, i) => {
                  return (
                    <div
                      style={{ fontSize: "1.3rem", margin: "1rem 0 1rem 0" }}
                    >
                      <span style={{ fontWeight: "bold" }}>
                        {getName(
                          entities[this.state.openInfoPage.contest.child]
                        )}
                      </span>{" "}
                      is child of{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {getName(
                          entities[
                            this.state.openInfoPage.contest.uncontestedParents
                              .targetID
                          ]
                        )}
                      </span>{" "}
                      and{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {getName(entities[c.targetID])}
                      </span>{" "}
                      according to{" "}
                      <span>
                        {this.state.openInfoPage.contest.passageLinks[i].map(
                          (p, i) => {
                            if (
                              i ===
                              this.state.openInfoPage.contest.passageLinks[i]
                                .length -
                                1
                            ) {
                              return this.getPassageLink(p);
                            } else {
                              return (
                                <span>
                                  {this.getPassageLink}
                                  {" and"}
                                </span>
                              );
                            }
                          }
                        )}
                      </span>
                      {i ===
                      this.state.openInfoPage.contest.contestedParents.length -
                        1 ? (
                        ""
                      ) : (
                        <div>
                          <p></p>OR<p></p>
                        </div>
                      )}
                    </div>
                  );
                })
              : ""}
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
          >
            <div
              style={{
                margin: "20px",
                border: "3px solid #ff0000",
                padding: "2rem 4rem 4rem 4rem"
              }}
            >
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
        {/* Graph rendering with KonvajS */}
        <Stage ref="stage" width={6000} height={2000}>
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
                name={e.name}
                points={e.points}
                unusual={e.unusual}
                contested={e.contested}
                stroke={
                  e.unusual.tf
                    ? "#ff0000"
                    : e.contested.tf
                    ? "#0000ff"
                    : "#000000"
                }
                opacity={e.unusual.tf || e.contested.tf ? 1 : 0.3}
                strokeWidth={4}
                onMouseOver={this.handleMouseOverLine}
                onMouseOut={this.handleMouseOutLine}
                onClick={this.handleClickedLine}
              />
            ))}
            {this.state.lineLinks.map((e, i) => (
              <React.Fragment>
                {e.unusual.type === "Created by an Agent" ? (
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
                ) : e.unusual.type === "Born from an Object" ? (
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
