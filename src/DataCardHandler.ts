import datum from "./data/datum.json";
import entities from "./data/entities.json";
import genderData from "./data/genderData.json";

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
};

export type relationshipInfo = {
  MOTHERS: entityInfo[];
  FATHERS: entityInfo[];
  SIBLINGS: entityInfo[];
  TWIN: entityInfo[];
  WIVES: entityInfo[];
  HUSBANDS: entityInfo[];
  CHILDREN: entityInfo[];
};

let familyDatums = [
  /* Parent */
  "is father of",
  "is mother of",
  "is parent of",
  /* Child */
  "is child of",
  "is son of",
  "is daughter of",
  /* Sibling */
  "is sister of",
  "is brother of",
  "is twin of",
  "is older than",
  /* Spouse */
  "is wife of",
  "is husband of",
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
  "is part of"
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
/* This function changes all datums (X <verb> Y, Y <verb> X, Z <verb> Y X) to Y <verb> X. */
/******************************************************************************************/
const getAllConnections = (id: string) => {
  var connections: {
    target: string;
    targetID: string;
    verb: string;
    passage: passageInfo[];
  }[] = [];

  Object.values(datum).forEach(function(datumRow) {
    // TODO: Fix this temporary solution for entities not existing in entities.csv
    if (entities[datumRow["Subject ID"]]) {
      /*********************************************************/
      /* If you are the direct object X, e.g. (Y (verb) X)     */
      /*********************************************************/
      if (
        datumRow["Direct Object ID"] === id &&
        familyDatums.includes(datumRow.Verb)
      ) {
        let passageInfo: passageInfo[] = [
          {
            start: datumRow["Passage: start"],
            startID: datumRow["Passage: start ID"],
            end:
              datumRow["Passage: end"] === "" ? "" : datumRow["Passage: end"],
            endID: datumRow["Passage: end ID"]
          }
        ];

        // Genderized marriage for simplicity (WIFE vs HUSBAND in data card)
        // TODO: Fix this temporary solution for gender data not existing for entity
        if (genderData[datumRow["Subject ID"]] && datumRow.Verb === "marries") {
          if (genderData[datumRow["Subject ID"]].gender === "female") {
            datumRow.Verb = "is wife of";
          } else if (genderData[datumRow["Subject ID"]].gender === "male") {
            datumRow.Verb = "is husband of";
          }
        }

        // Push connections to the list of connections
        connections.push({
          target: entities[datumRow["Subject ID"]]["Name (Smith & Trzaskoma)"],
          targetID: datumRow["Subject ID"],
          verb: datumRow.Verb,
          passage: passageInfo
        });
      }

      /*********************************************************/
      /* If you are the subject X, e.g. (X (verb) Y)           */
      /*********************************************************/
      if (
        datumRow["Subject ID"] === id &&
        familyDatums.includes(datumRow.Verb)
      ) {
        let passageInfo: passageInfo[] = [
          {
            start: datumRow["Passage: start"],
            startID: datumRow["Passage: start ID"],
            end:
              datumRow["Passage: end"] === "" ? "" : datumRow["Passage: end"],
            endID: datumRow["Passage: end ID"]
          }
        ];

        // Push connections to the list of connections
        connections.push({
          target:
            entities[datumRow["Direct Object ID"]]["Name (Smith & Trzaskoma)"],
          targetID: datumRow["Direct Object ID"],
          verb: reversedVerb(datumRow.Verb, datumRow["Direct Object ID"]),
          passage: passageInfo
        });
      }

      /*********************************************************/
      /* If you are the indirect object X, e.g. (Z (verb) Y X)
    /*********************************************************/

      // TODO: Fix this for using Indirect Object ID not name
      if (
        datumRow["Indirect Object (to/for)"] === id &&
        familyDatums.includes(datumRow.Verb)
      ) {
        let passageInfo: passageInfo[] = [
          {
            start: datumRow["Passage: start"],
            startID: datumRow["Passage: start ID"],
            end:
              datumRow["Passage: end"] === "" ? "" : datumRow["Passage: end"],
            endID: datumRow["Passage: end ID"]
          }
        ];
        connections.push({
          target:
            entities[datumRow["Direct Object ID"]]["Name (Smith & Trzaskoma)"],
          targetID: datumRow["Direct Object ID"],
          verb: reversedVerb(datumRow.Verb, datumRow["Direct Object ID"]),
          passage: passageInfo
        });
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
  let name = entities[id]["Name (Smith & Trzaskoma)"];
  let type = entities[id]["Type of entity"];
  let members: any[] = [];
  let relationships: relationshipInfo = {
    MOTHERS: [],
    FATHERS: [],
    SIBLINGS: [],
    TWIN: [],
    WIVES: [],
    HUSBANDS: [],
    CHILDREN: []
  };

  connections.forEach(datum => {
    // For each of the connections already found,
    // build the associated entity object, and
    // populate with existing information
    let d: entityInfo = {
      target: datum.target,
      targetID: datum.targetID,
      passage: datum.passage,
      type: entities[datum.targetID]["Type of entity"]
    };

    /* Categorising the connections, also checking for duplicates */

    // X is your MOTHER
    if (datum.verb === "is mother of") {
      // If passage is a duplicate / already exists
      // for this entity, or  in the list of connections
      relationships.MOTHERS = checkAndRemoveDuplicates(
        relationships.MOTHERS,
        d
      );
    }

    // X is your FATHER
    else if (datum.verb === "is father of") {
      relationships.FATHERS = checkAndRemoveDuplicates(
        relationships.FATHERS,
        d
      );
    }

    // X is your CHILD
    else if (
      datum.verb === "is son of" ||
      datum.verb === "is daughter of" ||
      datum.verb === "is child of"
    ) {
      relationships.CHILDREN = checkAndRemoveDuplicates(
        relationships.CHILDREN,
        d
      );
    }

    // X is your SIBLING
    else if (
      datum.verb === "is sister of" ||
      datum.verb === "is brother of" ||
      datum.verb === "is older than"
    ) {
      relationships.SIBLINGS = checkAndRemoveDuplicates(
        relationships.SIBLINGS,
        d
      );
    }

    // X is your TWIN
    else if (datum.verb === "is twin of") {
      relationships.TWIN = checkAndRemoveDuplicates(relationships.TWIN, d);

      // X is your WIFE / HUSBAND
    } else if (datum.verb === "is wife of") {
      relationships.WIVES = checkAndRemoveDuplicates(relationships.WIVES, d);
    } else if (datum.verb === "is husband of") {
      relationships.HUSBANDS = checkAndRemoveDuplicates(
        relationships.HUSBANDS,
        d
      );
    } else if (datum.verb === "marries") {
      if (genderData) {
        if (genderData[datum.targetID].gender === "female") {
          relationships.WIVES = checkAndRemoveDuplicates(
            relationships.WIVES,
            d
          );
        } else if (genderData[datum.targetID].gender === "male") {
          relationships.HUSBANDS = checkAndRemoveDuplicates(
            relationships.HUSBANDS,
            d
          );
        }
      }

      // X is a MEMBER of a collective
    } else if (datum.verb === "is part of") {
      members = checkAndRemoveDuplicates(members, d);
    }
  });

  /* Alphabetize the relationships */
  relationships.MOTHERS = alphabetize(relationships.MOTHERS);
  relationships.FATHERS = alphabetize(relationships.FATHERS);
  relationships.SIBLINGS = alphabetize(relationships.SIBLINGS);
  relationships.TWIN = alphabetize(relationships.TWIN);
  relationships.WIVES = alphabetize(relationships.WIVES);
  relationships.HUSBANDS = alphabetize(relationships.HUSBANDS);
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
/* This function removes duplicate datums (incl. after reversal) and duplicate passages   */
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
    console.log(e.passage);
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

/******************************************************************************************/
/* Datum reversals                                                   */
/* -------------------------------------------------------------------------------------- */
/* This function flips the verb so that X can become the direct object,                   */
/* without compromising the validity of the datum                                         */
/*                                                                                        */
/* e.g. X <is mother of> Y, where Y is <male>                                             */
/* => returns verb <is son of>, to let X become the direct object (Y is son of X)         */
/******************************************************************************************/
const reversedVerb = (verb: string, dirObject: string) => {
  // TODO: Fix this temporary solution for gender data not existing for entity
  if (genderData[dirObject]) {
    // PARENT -> CHILD
    if (
      verb === "is mother of" ||
      verb === "is father of" ||
      verb === "is parent of"
    ) {
      // Uses generic "is child of" since data cards do not show gender specificity for children
      return "is child of";
    }

    // CHILD -> PARENT
    else if (
      verb === "is son of" ||
      verb === "is daughter of" ||
      verb === "is child of"
    ) {
      if (genderData[dirObject].gender === "female") {
        return "is mother of";
      } else if (genderData[dirObject].gender === "male") {
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
    else if (
      verb === "is sister of" ||
      verb === "is brother of" ||
      verb === "is older than"
    ) {
      if (genderData[dirObject].gender === "female") {
        return "is sister of";
      } else if (genderData[dirObject].gender === "male") {
        return "is brother of";
      } else {
        // Placeholder since gender-unspecified siblings (e.g. "is sibling of")
        // does not exist in datum.csv
        return "";
      }
    }

    // WIFE -> HUSBAND
    // HUSBAND -> WIFE
    // No cases of homosexual relationships in the mythology
    else if (
      verb === "is wife of" ||
      verb === "is husband of" ||
      verb === "marries"
    ) {
      if (genderData[dirObject].gender === "female") {
        return "is wife of";
      } else if (genderData[dirObject].gender === "male") {
        return "is husband of";
      } else {
        // Placeholder since "marries" is not currently used in data cards
        return "marries";
      }
    } else {
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
  } else {
    return "Gender of " + dirObject + " does not exist in database";
  }
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
    relationships.WIVES.length === 0 &&
    relationships.HUSBANDS.length === 0 &&
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
