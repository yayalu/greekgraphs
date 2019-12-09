import ties from "./data/ties.json";
import entities from "./data/entities.json";

type passageInfo = {
  start: string;
  startID: string;
  end: string;
  endID: string;
};

type entityInfo = {
  target: string;
  targetID: string;
  passage: passageInfo[];
  type: string;
  autochthony?: boolean;
  mother_parthenogenesis?: boolean;
  father_parthenogenesis?: boolean;
};

export type relationshipInfo = {
  MOTHERS: entityInfo[];
  FATHERS: entityInfo[];
  SIBLINGS: entityInfo[];
  TWIN: entityInfo[];
  SPOUSES: entityInfo[];
  CHILDREN: entityInfo[];
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
  "gives in marriage [dir. obj.] [ind. obj.]",
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
  return sortConnectionsIntoRelationships(id, connections);
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
    if (entities[tieRow["Subject ID"]]) {
      /*********************************************************/
      /* If you are the direct object X, e.g. (Y (verb) X)     */
      /*********************************************************/
      if (
        tieRow["Direct Object ID"] === id &&
        familyTies.includes(tieRow.Verb)
      ) {
        let passageInfo: passageInfo[] = [
          {
            start: tieRow["Passage: start"],
            startID: tieRow["Passage: start ID"],
            end: tieRow["Passage: end"] === "" ? "" : tieRow["Passage: end"],
            endID: tieRow["Passage: end ID"]
          }
        ];

        // TODO: Fix this temporary solution for gender data not existing for entity
        if (getGender(tieRow["Subject ID"]) && tieRow.Verb === "marries") {
          tieRow.Verb = "is spouse of";
        }

        // Push connections to the list of connections
        connections.push({
          target: entities[tieRow["Subject ID"]]["Name (Smith & Trzaskoma)"],
          targetID: tieRow["Subject ID"],
          verb: tieRow.Verb,
          passage: passageInfo
        });
      }

      /*********************************************************/
      /* If you are the subject X, e.g. (X (verb) Y)           */
      /*********************************************************/
      if (tieRow["Subject ID"] === id && familyTies.includes(tieRow.Verb)) {
        let passageInfo: passageInfo[] = [
          {
            start: tieRow["Passage: start"],
            startID: tieRow["Passage: start ID"],
            end: tieRow["Passage: end"] === "" ? "" : tieRow["Passage: end"],
            endID: tieRow["Passage: end ID"]
          }
        ];

        // Push connections to the list of connections
        if (tieRow.Verb === "is born by autochthony [in/on/at]") {
          connections.push({
            target: "",
            targetID: "",
            verb: "is born by autochthony [in/on/at]",
            passage: passageInfo
          });
        } else {
          connections.push({
            target:
              entities[tieRow["Direct Object ID"]]["Name (Smith & Trzaskoma)"],
            targetID: tieRow["Direct Object ID"],
            verb: reversedVerb(tieRow.Verb, tieRow["Direct Object ID"]),
            passage: passageInfo
          });
        }
      }

      /*********************************************************/
      /* If you are the indirect object X, e.g. (Z (verb) Y X)
    /*********************************************************/

      // TODO: Fix this for using Indirect Object ID not name
      /* if (
        tieRow["Indirect Object (to/for)"] === id &&
        familyTies.includes(tieRow.Verb)
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
          target:
            entities[tieRow["Direct Object ID"]]["Name (Smith & Trzaskoma)"],
          targetID: tieRow["Direct Object ID"],
          verb: reversedVerb(tieRow.Verb, tieRow["Direct Object ID"]),
          passage: passageInfo
        });
      }*/
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
  let name = entities[id]["Name (Smith & Trzaskoma)"];
  let type = entities[id]["Type of entity"];
  let members: any[] = [];
  let relationships: relationshipInfo = {
    MOTHERS: [],
    FATHERS: [],
    SIBLINGS: [],
    TWIN: [],
    SPOUSES: [],
    CHILDREN: []
  };

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
          : entities[tie.targetID]["Type of entity"]
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
        type: entities[tie.targetID]["Type of entity"],
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
        type: entities[tie.targetID]["Type of entity"],
        father_parthenogenesis: true
      };
      relationships.FATHERS = checkAndRemoveDuplicates(
        relationships.FATHERS,
        f
      );
    }

    // X is your CHILD
    else if (tie.verb === "is child of") {
      relationships.CHILDREN = checkAndRemoveDuplicates(
        relationships.CHILDREN,
        d
      );
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
    // X is a MEMBER of a collective
    else if (tie.verb === "is part of") {
      members = checkAndRemoveDuplicates(members, d);
    }
    // X is born by autochthony
    else if (tie.verb === "is born by autochthony [in/on/at]") {
      let a: entityInfo = {
        target: "",
        targetID: "",
        passage: tie.passage,
        type: entities[id]["Type of entity"],
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
  relationships.CHILDREN = alphabetize(relationships.CHILDREN);
  members = alphabetize(members);

  /* Return alphabetized, complete list of relationships */
  return {
    id: id,
    relationships: relationships,
    name: name,
    members: members,
    type: type,
    validSearch: true
  };
};

/******************************************************************************************/
/* Check passage and entity duplicates                                                    */
/* -------------------------------------------------------------------------------------- */
/* This function removes duplicate ties (incl. after reversal) and duplicate passages   */
/* for the same connected entity                                                          */
/******************************************************************************************/
const checkAndRemoveDuplicates = (entities: any[], d: entityInfo) => {
  let entityDuplicate = false;
  entities.forEach(e => {
    if (e.targetID === d.targetID) {
      entityDuplicate = true;
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
  if (!entityDuplicate) {
    entities.push(d);
  }
  return entities;
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

/******* */
export const getGender = (id: string) => {
  return entities[id]["Agent/Coll.: gender"];
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
  }

  // TODO: Deal with IS MEMBER OF verb here.
  else {
    console.log(
      "Unsure of the " +
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
  mothers: any[],
  fathers: any[],
  siblings: any[]
) => {
  /* let potentialsiblings: {id: string, mother: string, father: string};
  Object.values(tie).forEach(function(tieRow) {
    let s: potentialsiblings = [];
    // Firstly, determine where Y is <child> of A,B
    if ((tieRow.Verb === "is daughter of" || tieRow.Verb === "is son of" || tieRow.Verb === "is child of")) {
      mothers.forEach(e => {
        if (e.targetId === tieRow["Direct Object ID"]) {
          s.mother.push(targetId);
        }
      });
    }
    

  }; */

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
