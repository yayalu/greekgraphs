var ties = require("./data/ties.json");
var entities = require("./data/entities.json");
var relationships = require("./data/relationships.json");

type passageInfo = {
  start: string;
  startID: string;
  end: string;
  endID: string;
};

export type entityInfo = {
  target: string;
  targetID: string;
  passage: passageInfo[];
  type: string;
  autochthony?: boolean;
  mother_parthenogenesis?: boolean;
  father_parthenogenesis?: boolean;
};

type childrenInfo = {
  child: entityInfo[];
  otherParentIDs: string[];
  divineParentID?: string;
};

export type relationshipInfo = {
  MOTHERS: entityInfo[];
  FATHERS: entityInfo[];
  SIBLINGS: entityInfo[];
  TWIN: entityInfo[];
  SPOUSES: entityInfo[];
  CHILDREN: childrenInfo[];
};

type returningInfo = {
  id: string;
  relationships: relationshipInfo;
  name: string;
  members: { sub: any[]; super: any[] };
  type: string;
  validSearch: boolean;
  alternativeName: { targetID: string; passage: passageInfo[] };
};

let familyTies = [
  /* Parent */
  "is father of",
  "is mother of",
  "is parent of",
  /* Child */
  "is child of",
  /* Sibling */
  "is sibling of",
  "is twin of",
  "is older than",
  /* Spouse */
  "is spouse of",
  "marries",
  /* Ancestors - currently unused
  "is grandfather of",
  "is grandmother of",
  "is grandparent of",
  "is grandson of",
  "is granddaughter of",
  "is grandchild of",
  */

  /* Member of collective */
  "is part of",
  "is member of",

  /* Unusual relationships */
  "is mother by parthenogenesis of",
  "is father by parthenogenesis of",
  "is born by autochthony [in/on/at]"
];

/******************************************************************************************/
/* Returns the data card geneology information, interfaces with DataCards.tsx                
/******************************************************************************************/
export const updateComponent = (id: string) => {
  let connections = getAllConnections(id);
  if (
    connections.length > 0 &&
    connections[0].verb === "is alternative name for"
  ) {
    let empty: relationshipInfo = {
      MOTHERS: [],
      FATHERS: [],
      SIBLINGS: [],
      TWIN: [],
      SPOUSES: [],
      CHILDREN: []
    };
    let altNameConnection: returningInfo = {
      id: id,
      relationships: empty,
      name: getName(entities[id]),
      members: { sub: [], super: [] },
      type: entities[id] ? entities[id]["Type of entity"] : "",
      validSearch: true,
      alternativeName: {
        targetID: connections[0].targetID,
        passage: connections[0].passage
      }
    };
    return altNameConnection;
  } else {
    return sortConnectionsIntoRelationships(id, connections);
  }
};

/******************************************************************************************/
/* Find all relationships                                                                 */
/* -------------------------------------------------------------------------------------- */
/* This function changes all ties (X <verb> Y, Y <verb> X, Z <verb> Y X) to Y <verb> X. */
/******************************************************************************************/
const getAllConnections = (id: string) => {
  var connections: {
    target: string;
    targetID: string;
    verb: string;
    passage: passageInfo[];
  }[] = [];

  Object.values(ties).forEach(function(tieRow) {
    // TODO: Fix this temporary solution for entities not existing in entities.csv
    if (typeof tieRow !== "object" || tieRow === null) {
    } else {
      // The first if statement is to remove "object is of type unknown" error

      if (entities[tieRow["Subject ID"]]) {
        //check if the entity is just an "alternative name for"
        //if so, ignore all geneological data gathered so far and just return connections = [{target: "", targetID: "", verb: "is alternative name for", passage:[]}]

        if (
          tieRow["Subject ID"] === id &&
          tieRow["Verb"] === "is alternative name for"
        ) {
          let passageInfo: passageInfo[] = [
            {
              start: tieRow["Passage: start"],
              startID: tieRow["Passage: start ID"],
              end: tieRow["Passage: end"] === "" ? "" : tieRow["Passage: end"],
              endID:
                tieRow["Passage: end ID"] === ""
                  ? ""
                  : tieRow["Passage: end ID"]
            }
          ];
          connections = [
            {
              target: "",
              targetID: tieRow["Direct Object ID"],
              verb: "is alternative name for",
              passage: passageInfo
            }
          ];
          return connections;
        }

        /*********************************************************/
        /* If you are the direct object X, e.g. (Y (verb) X)     */
        /*********************************************************/
        if (
          tieRow["Direct Object ID"] === id &&
          familyTies.includes(tieRow["Verb"])
        ) {
          let passageInfo: passageInfo[] = [
            {
              start: tieRow["Passage: start"],
              startID: tieRow["Passage: start ID"],
              end: tieRow["Passage: end"] === "" ? "" : tieRow["Passage: end"],
              endID:
                tieRow["Passage: end ID"] === ""
                  ? ""
                  : tieRow["Passage: end ID"]
            }
          ];

          // TODO: Fix this temporary solution for gender data not existing for entity
          if (getGender(tieRow["Subject ID"]) && tieRow["Verb"] === "marries") {
            tieRow["Verb"] = "is spouse of";
          }

          // Push connections to the list of connections
          connections.push({
            target: getName(entities[tieRow["Subject ID"]]),
            targetID: tieRow["Subject ID"],
            verb:
              tieRow["Verb"] === "is part of" ||
              tieRow["Verb"] === "is member of"
                ? "has members"
                : tieRow["Verb"],
            passage: passageInfo
          });
        }

        /*********************************************************/
        /* If you are the subject X, e.g. (X (verb) Y)           */
        /*********************************************************/
        if (
          tieRow["Subject ID"] === id &&
          familyTies.includes(tieRow["Verb"])
        ) {
          let passageInfo: passageInfo[] = [
            {
              start: tieRow["Passage: start"],
              startID: tieRow["Passage: start ID"],
              end: tieRow["Passage: end"] === "" ? "" : tieRow["Passage: end"],
              endID: tieRow["Passage: end ID"]
            }
          ];

          // Push connections to the list of connections
          if (tieRow["Verb"] === "is born by autochthony [in/on/at]") {
            connections.push({
              target: "",
              targetID: "",
              verb: "is born by autochthony [in/on/at]",
              passage: passageInfo
            });
          } else {
            connections.push({
              target: getName(entities[tieRow["Direct Object ID"]]),
              targetID: tieRow["Direct Object ID"],
              verb:
                tieRow["Verb"] === "is part of" ||
                tieRow["Verb"] === "is member of"
                  ? "is member of"
                  : reversedVerb(tieRow["Verb"], tieRow["Direct Object ID"]),
              passage: passageInfo
            });
          }
        }

        /***********************************************************************/
        /* For "Gives in marriage:" - parent gives child in marriage to person */
        /*************************************************************************/

        // If you are the indirect object X, e.g. (Z (verb) Y X)
        if (
          tieRow["Indirect Object (to/for) ID"] &&
          tieRow["Indirect Object (to/for) ID"] === id &&
          tieRow["Verb"] === "gives in marriage [dir. obj.] [ind. obj.]"
        ) {
          let passageInfo: passageInfo[] = [
            {
              start: tieRow["Passage: start"],
              startID: tieRow["Passage: start ID"],
              end: tieRow["Passage: end"] === "" ? "" : tieRow["Passage: end"],
              endID: tieRow["Passage: end ID"]
            }
          ];
          connections.push({
            target: getName(entities[tieRow["Direct Object ID"]]),
            targetID: tieRow["Direct Object ID"],
            verb: "is spouse of",
            passage: passageInfo
          });
        }

        // If you are the direct object X, e.g. (Z (verb) X Y)
        else if (
          tieRow["Direct Object ID"] &&
          tieRow["Direct Object ID"] === id &&
          tieRow["Verb"] === "gives in marriage [dir. obj.] [ind. obj.]"
        ) {
          let passageInfo: passageInfo[] = [
            {
              start: tieRow["Passage: start"],
              startID: tieRow["Passage: start ID"],
              end: tieRow["Passage: end"] === "" ? "" : tieRow["Passage: end"],
              endID: tieRow["Passage: end ID"]
            }
          ];
          connections.push({
            target: getName(entities[tieRow["Indirect Object (to/for) ID"]]),
            targetID: tieRow["Indirect Object (to/for) ID"],
            verb: "is spouse of",
            passage: passageInfo
          });
        }
      }
    }
  });

  return connections;
};

/******************************************************************************************/
/* Sort relationships                                                                     */
/* -------------------------------------------------------------------------------------- */
/* This function sorts all of the found connections into existing geneological categories */
/******************************************************************************************/
const sortConnectionsIntoRelationships = (id: string, connections: any) => {
  /* Preliminary info about the entity */
  let name = getName(entities[id]);
  let type = entities[id] ? entities[id]["Type of entity"] : "";
  let members: { sub: any[]; super: any[] } = { sub: [], super: [] };
  let relationships: relationshipInfo = {
    MOTHERS: [],
    FATHERS: [],
    SIBLINGS: [],
    TWIN: [],
    SPOUSES: [],
    CHILDREN: []
  };

  let childrenTemp: entityInfo[] = [];
  connections.forEach(tie => {
    // For each of the connections already found,
    // build the associated entity object, and
    // populate with existing information
    let d: entityInfo = {
      target: tie.target,
      targetID: tie.targetID,
      passage: tie.passage,
      type:
        tie.verb === "is born by autochthony [in/on/at]"
          ? ""
          : entities[tie.targetID]
          ? entities[tie.targetID]["Type of entity"]
          : ""
    };

    /* Categorising the connections, also checking for duplicates */

    // X is your MOTHER
    if (tie.verb === "is mother of") {
      // If passage is a duplicate / already exists
      // for this entity, or  in the list of connections
      relationships.MOTHERS = checkAndRemoveDuplicates(
        relationships.MOTHERS,
        d
      );
    }

    // X is your MOTHER by parthenogenesis
    else if (tie.verb === "is mother by parthenogenesis of") {
      let m: entityInfo = {
        target: tie.target,
        targetID: tie.targetID,
        passage: tie.passage,
        type: entities[tie.targetID]
          ? entities[tie.targetID]["Type of entity"]
          : "",
        mother_parthenogenesis: true
      };

      relationships.MOTHERS = checkAndRemoveDuplicates(
        relationships.MOTHERS,
        m
      );
    }

    // X is your FATHER
    else if (tie.verb === "is father of") {
      relationships.FATHERS = checkAndRemoveDuplicates(
        relationships.FATHERS,
        d
      );
    }

    // X is your FATHER by parthenogenesis
    else if (tie.verb === "is father by parthenogenesis of") {
      let f: entityInfo = {
        target: tie.target,
        targetID: tie.targetID,
        passage: tie.passage,
        type: entities[tie.targetID]
          ? entities[tie.targetID]["Type of entity"]
          : "",
        father_parthenogenesis: true
      };
      relationships.FATHERS = checkAndRemoveDuplicates(
        relationships.FATHERS,
        f
      );
    }

    // X is your CHILD
    else if (tie.verb === "is child of") {
      childrenTemp = checkAndRemoveDuplicates(childrenTemp, d);
    }

    // X is your SIBLING
    else if (tie.verb === "is sibling of" || tie.verb === "is older than") {
      relationships.SIBLINGS = checkAndRemoveDuplicates(
        relationships.SIBLINGS,
        d
      );
    }

    // X is your TWIN
    else if (tie.verb === "is twin of") {
      relationships.TWIN = checkAndRemoveDuplicates(relationships.TWIN, d);
    }
    // X is your WIFE / HUSBAND
    else if (tie.verb === "is spouse of" || tie.verb === "marries") {
      relationships.SPOUSES = checkAndRemoveDuplicates(
        relationships.SPOUSES,
        d
      );
    }
    // X is a MEMBER of a collective but the main ID
    else if (tie.verb === "is member of") {
      members.super = checkAndRemoveDuplicates(members.super, d);
    } else if (tie.verb === "has members") {
      members.sub = checkAndRemoveDuplicates(members.sub, d);
    }
    // X is born by autochthony
    else if (tie.verb === "is born by autochthony [in/on/at]") {
      let a: entityInfo = {
        target: "",
        targetID: "",
        passage: tie.passage,
        type: entities[id] ? entities[id]["Type of entity"] : "",
        autochthony: true
      };
      relationships.FATHERS = checkAndRemoveDuplicates(
        relationships.FATHERS,
        a
      );
    }
  });

  /* TODO: Check for any indirect siblings in the ties */
  relationships.SIBLINGS = getIndirectSiblings(
    id,
    relationships.MOTHERS,
    relationships.FATHERS,
    relationships.SIBLINGS
  );

  /* Alphabetize the relationships */
  relationships.MOTHERS = alphabetize(relationships.MOTHERS);
  relationships.FATHERS = alphabetize(relationships.FATHERS);
  relationships.SIBLINGS = alphabetize(relationships.SIBLINGS);
  relationships.TWIN = alphabetize(relationships.TWIN);
  relationships.SPOUSES = alphabetize(relationships.SPOUSES);
  members.super = alphabetize(members.super);
  members.sub = alphabetize(members.sub);

  // Currently very inefficient, but finds the other parent of the child
  relationships.CHILDREN = getOtherParents(id, childrenTemp);
  // relationships.CHILDREN = alphabetizeChildren(relationships.CHILDREN);

  /* Return alphabetized, complete list of relationships */
  let connection: returningInfo = {
    id: id,
    relationships: relationships,
    name: name,
    members: members,
    type: type,
    validSearch: true,
    alternativeName: { targetID: "", passage: [] }
  };
  return connection;
};

/******************************************************************************************/
/* Check passage and entity duplicates                                                    */
/* -------------------------------------------------------------------------------------- */
/* This function removes duplicate ties (incl. after reversal) and duplicate passages   */
/* for the same connected entity                                                          */
/******************************************************************************************/
const checkAndRemoveDuplicates = (entities: any[], d: entityInfo) => {
  let duplicate = false;
  entities.forEach(e => {
    if (e.targetID === d.targetID) {
      duplicate = true;
      let passageDuplicate = false;
      e.passage.forEach(p => {
        if (
          p.startID === d.passage[0].startID &&
          p.endID === d.passage[0].endID
        ) {
          passageDuplicate = true;
        }
      });
      if (!passageDuplicate) {
        e.passage.push(d.passage[0]);
      }
    }
  });
  if (!duplicate) {
    entities.push(d);
  }
  return entities;
};

const checkAndRemoveParentDuplicates = (
  child: entityInfo, //child to add
  parentsList: string[], //list of child's parents
  parentsGrouped: childrenInfo[] //existing parents list to update
) => {
  // This function removes duplicates but also groups children by the "other" parent
  // returns childrenInfo object: {child: <list of associated children>, otherParentIDs}

  // If the same child appears under two different "otherParent"s, then dispute is expressed
  // The child will be under {child: <list of children>, otherParents: <list of all parents + disputed>}
  let parentDuplicate = false;
  let childDuplicate = false;

  for (let i = 0; i < parentsGrouped.length; i++) {
    if (isEqual(parentsList, parentsGrouped[i])) {
      // Is parent duplicate. Now check if child is already in list.
      parentDuplicate = true;
      for (let j = 0; j < parentsGrouped[i].child.length; j++) {
        if (parentsGrouped[i].child[j].targetID === child.targetID) {
          childDuplicate = true;
        }
      }
      if (!childDuplicate) {
        parentsGrouped[i].child.push(child);
      }
    }
  }

  if (!childDuplicate && !parentDuplicate) {
    let newChild: childrenInfo = {
      child: [child],
      otherParentIDs: parentsList
    };
    parentsGrouped.push(newChild);
  }

  return parentsGrouped;
};

/******************************************************************************************/
/* Alphabetize the list of names in each category                                         */
/******************************************************************************************/
const alphabetize = (relation: any[]) => {
  if (relation.length === 0) {
    return [];
  } else {
    relation.sort(function(a, b) {
      var relationA = a.target.toUpperCase();
      var relationB = b.target.toUpperCase();
      return relationA < relationB ? -1 : relationA > relationB ? 1 : 0;
    });
  }
  return relation;
};

const alphabetizeIDs = (relation: any[]) => {
  if (relation.length === 0) {
    return [];
  } else {
    relation.sort(function(a, b) {
      var relationA = a.targetID;
      var relationB = b.targetID;
      return relationA < relationB ? -1 : relationA > relationB ? 1 : 0;
    });
  }
  return relation;
};

/******************************************************************************************/
/* Check if two arrays are equal                                                          */
/******************************************************************************************/
const isEqual = (parentsList: any[], child: childrenInfo) => {
  if (parentsList.length !== child.otherParentIDs.length) {
    return false;
  } else {
    for (let i = 0; i < parentsList.length; i++) {
      if (parentsList[i] !== child.otherParentIDs[i]) {
        return false;
      }
    }
    return true;
  }
};

/******************************************************************************************/
/* TODO: Fix this very VERY inefficient method of finding the other parent.               */
/* Swap for shared NodegoatID                                                             */
/******************************************************************************************/
const getOtherParents = (id: string, children: entityInfo[]) => {
  let mainGender = getGender(id);
  let parentsGrouped: childrenInfo[] = [];
  children.forEach(c => {
    if (relationships[c.targetID] !== undefined) {
      var parentsList;
      if (mainGender === "Female") {
        parentsList = JSON.parse(relationships[c.targetID]).relationships
          .FATHERS;
      } else {
        //temporary solution to undefined gender
        parentsList = JSON.parse(relationships[c.targetID]).relationships
          .MOTHERS;
      }
      // Convert list of entityInfo to a list of IDs
      for (let i = 0; i < parentsList.length; i++) {
        parentsList[i] = parentsList[i].targetID;
      }
      parentsList = alphabetizeIDs(parentsList);
      parentsGrouped = checkAndRemoveParentDuplicates(
        c,
        parentsList,
        parentsGrouped
      );
    }
  });
  return parentsGrouped;
};

/******************************************************************************************/
/* Get the gender of the entity                                                           */
/******************************************************************************************/
export const getGender = (id: string) => {
  return entities[id] ? entities[id]["Agent/Coll.: gender"] : "";
};

/******************************************************************************************/
/* Tie reversals                                                   */
/* -------------------------------------------------------------------------------------- */
/* This function flips the verb so that X can become the direct object,                   */
/* without compromising the validity of the tie                                         */
/*                                                                                        */
/* e.g. X <is mother of> Y, where Y is <male>                                             */
/* => returns verb <is son of>, to let X become the direct object (Y is son of X)         */
/******************************************************************************************/
const reversedVerb = (verb: string, dirObject: string) => {
  // TODO: Fix this temporary solution for gender data not existing for entity
  // PARENT -> CHILD
  if (verb === "is parent of") {
    // Uses generic "is child of" since data cards do not show gender specificity for children
    return "is child of";
  }

  // CHILD -> PARENT
  else if (verb === "is child of") {
    if (getGender(dirObject) === "Female") {
      return "is mother of";
    } else if (getGender(dirObject) === "Male") {
      return "is father of";
    } else {
      // Placeholder since "is parent of" is not currently used in data cards
      return "";
    }
  }

  // TWIN -> TWIN
  else if (verb === "is twin of") {
    return "is twin of";
  }

  // SIBLING -> SIBLING
  else if (verb === "is sibling of" || verb === "is older than") {
    return "is sibling of";
  }

  // WIFE -> HUSBAND
  // HUSBAND -> WIFE
  // No cases of homosexual relationships in the mythology
  else if (verb === "is spouse of" || verb === "marries") {
    return "is spouse of";
  } else if (verb === "is member of" || verb === "is part of") {
    return "";
  } else {
    console.log(
      "Unsure of " +
        verb +
        " " +
        dirObject +
        " connection, or connection is not relevant for the datacards.",
      verb,
      dirObject
    );
    return "";
  }
};

/******************************************************************************************/
/* Populate an array of siblings based on matching parents                                */
/* -------------------------------------------------------------------------------------- */
/* This function checks through the list of ties and pushes to the list of siblings:    */
/*                                                                                        */
/* e.g. X is <child> of A, X is <child> of B, Y is <child> of A, Y is <child> of B        */
/******************************************************************************************/
const getIndirectSiblings = (
  id: string,
  mothers: any[],
  fathers: any[],
  siblings: any[]
) => {
  // CURRENTLY A VERY SLOW SOLUTION - OPTIMIZE IT LATER
  // CHANGE TO POPULATING A DATABASE OF RELATIONS AND READING OFF THAT DATABASE
  // RATHER THAN DYNAMICALLY GENERATING IT HERE (CHANGE TO O(N) NOT LEAVE AS O(N^3))
  // ALTERNATIVELY: Use Nodegoat ID to determine those in the same datum ID, and then match those

  let newsiblings: {} = {};
  Object.values(ties).forEach(function(tieRow) {
    if (typeof tieRow !== "object" || tieRow === null) {
    } else {
      let testsibling = {
        motherMatch: false,
        fatherMatch: false,
        info: {}
      };
      let passageInfo: passageInfo[] = [
        {
          start: tieRow["Passage: start"],
          startID: tieRow["Passage: start ID"],
          end: tieRow["Passage: end"] === "" ? "" : tieRow["Passage: end"],
          endID: tieRow["Passage: end ID"]
        }
      ];
      let testinfo: entityInfo = {
        target: "",
        targetID: "",
        passage: passageInfo,
        type: entities[id] ? entities[id]["Type of entity"] : ""
      };
      // Firstly, determine where Y is <child> of A,B
      if (
        tieRow["Verb"] === "is daughter of" ||
        tieRow["Verb"] === "is son of" ||
        tieRow["Verb"] === "is child of"
      ) {
        mothers.forEach(m => {
          if (m.targetID === tieRow["Direct Object ID"]) {
            testsibling.motherMatch = true;
            testinfo.target = getName(entities[tieRow["Subject ID"]]);
            testinfo.targetID = tieRow["Subject ID"];
            testsibling.info = testinfo;
            if (!(tieRow["Subject ID"] in newsiblings)) {
              newsiblings[tieRow["Subject ID"]] = testsibling;
            } else {
              newsiblings[tieRow["Subject ID"]].motherMatch = true;
            }
          }
        });
        fathers.forEach(f => {
          if (f.targetID === tieRow["Direct Object ID"]) {
            testsibling.fatherMatch = true;
            testinfo.target = getName(entities[tieRow["Subject ID"]]);
            testinfo.targetID = tieRow["Subject ID"];
            testsibling.info = testinfo;
            if (!(tieRow["Subject ID"] in newsiblings)) {
              newsiblings[tieRow["Subject ID"]] = testsibling;
            } else {
              newsiblings[tieRow["Subject ID"]].fatherMatch = true;
            }
          }
        });
      }
      // Then, determine where A is mother of Y, or if parent of Y where A is female
      if (
        tieRow["Verb"] === "is mother of" ||
        tieRow["Verb"] === "is divine mother of" ||
        (tieRow["Verb"] === "is parent of" &&
          entities[tieRow["Subject ID"]] &&
          entities[tieRow["Subject ID"]]["Agent/Coll.: gender"] === "Female")
      ) {
        mothers.forEach(m => {
          if (m.targetID === tieRow["Subject ID"]) {
            testsibling.motherMatch = true;
            testinfo.target = getName(entities[tieRow["Direct Object ID"]]);
            testinfo.targetID = tieRow["Direct Object ID"];
            testsibling.info = testinfo;
            if (!(tieRow["Direct Object ID"] in newsiblings)) {
              newsiblings[tieRow["Direct Object ID"]] = testsibling;
            } else {
              newsiblings[tieRow["Direct Object ID"]].motherMatch = true;
            }
          }
        });
      }
      // Then, determine where A is father of Y, or if parent of Y where A is male
      if (
        tieRow["Verb"] === "is father of" ||
        tieRow["Verb"] === "is divine father of" ||
        (tieRow["Verb"] === "is parent of" &&
          entities[tieRow["Subject ID"]] &&
          entities[tieRow["Subject ID"]]["Agent/Coll.: gender"] === "Male")
      ) {
        fathers.forEach(f => {
          if (f.targetID === tieRow["Subject ID"]) {
            testsibling.fatherMatch = true;
            testinfo.target = getName(entities[tieRow["Direct Object ID"]]);
            testinfo.targetID = tieRow["Direct Object ID"];
            testsibling.info = testinfo;
            if (!(tieRow["Direct Object ID"] in newsiblings)) {
              newsiblings[tieRow["Direct Object ID"]] = testsibling;
            } else {
              newsiblings[tieRow["Direct Object ID"]].fatherMatch = true;
            }
          }
        });
      }
    }
  });
  let keys: any[] = Object.keys(newsiblings);
  keys.forEach(k => {
    if (
      !newsiblings[k].motherMatch ||
      !newsiblings[k].fatherMatch ||
      k === id
    ) {
      delete newsiblings[k];
    } else {
      siblings = checkAndRemoveDuplicates(siblings, newsiblings[k].info);
    }
  });
  return siblings;
};

/******************************************************************************************/
/* Check if no relations exist for this entity (used in DataCards.tsx)                    */
/******************************************************************************************/
export const checkNoRelations = (relationships: any) => {
  return (
    relationships.MOTHERS.length === 0 &&
    relationships.FATHERS.length === 0 &&
    relationships.SIBLINGS.length === 0 &&
    relationships.TWIN.length === 0 &&
    relationships.SPOUSES.length === 0 &&
    relationships.CHILDREN.length === 0
  );
};

export const checkNoMembers = (members: any) => {
  return !members || members.length === 0;
};

/******************************************************************************************/
/* Return all alternative names for entity (used in DataCards.tsx)                        */
/******************************************************************************************/
export const getAlternativeNames = (id: string) => {
  let alternatives: string = "";
  alternatives += getNameString("Name (transliteration)", alternatives, id);
  alternatives += getNameString("Name (Latinized)", alternatives, id);
  alternatives += getNameString("Name in Latin texts", alternatives, id);
  alternatives += getNameString("Alternative names", alternatives, id);

  if (alternatives === "") {
    return alternatives;
  } else {
    return "(Also known as: " + alternatives + ")";
  }
};

const getNameString = (parameter: string, stringSoFar: string, id: string) => {
  let s = "";
  if (entities[id][parameter] !== "") {
    if (stringSoFar === "") {
      s = entities[id][parameter];
    } else {
      s = stringSoFar + ", " + entities[id][parameter];
    }
  }
  return s;
};

/******************************************************************************************/
/* Get the entity's name                                                                  */
/******************************************************************************************/
export const getName = (entityRow: any) => {
  let possibleNames = [
    "Name (Smith & Trzaskoma)",
    "Name (transliteration)",
    "Name (Latinized)",
    "Name in Latin texts",
    "Alternative names"
  ];
  if (entityRow) {
    for (let i = 0; i < possibleNames.length; i++) {
      if (
        entityRow[possibleNames[i]] &&
        entityRow[possibleNames[i]] !== "" &&
        entityRow[possibleNames[i]] !== undefined
      ) {
        return entityRow[possibleNames[i]];
      }
      return "";
    }
  } else {
    return "";
  }
};

/******************************************************************************************/
/* Get the entity type                                                                    */
/******************************************************************************************/
export const getEntityType = (id: string) => {
  if (entities[id]) {
    if (entities[id]["Type of entity"] === "Collective (Episodic)") {
      return "Collective (Episodic)";
    } else if (entities[id]["Type of entity"] === "Collective (misc.)") {
      return "Collective (Miscellaneous)";
    } else if (entities[id]["Type of entity"] === "Collective (genealogical)") {
      return "Collective (Genealogical)";
    } else {
      return "";
    }
  } else {
    return "";
  }
};
