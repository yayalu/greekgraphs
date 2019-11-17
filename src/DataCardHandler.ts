import datum from "./data/datum.json";
import entities from "./data/entities.json";
import genderData from "./data/genderData.json";

/* Addresses typescript indexing objects error */
/* const hasKey<O>(obj: O, key: keyof any): key is keyof O => {{
  return key in obj;
}}*/

export type relationshipInfo = {
  MOTHERS: entityInfo[];
  FATHERS: entityInfo[];
  SIBLINGS: entityInfo[];
  WIVES: entityInfo[];
  HUSBANDS: entityInfo[];
  CHILDREN: entityInfo[];
};

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
};

/* TODO:
Get gender from subject ID
*/

let familyDatums = [
  "is father of",
  "is mother of",
  "is parent of",
  "is child of",
  "is son of",
  "is daughter of",
  "is sister of",
  "is brother of",
  "is twin of",
  "is wife of",
  "is husband of",
  "marries",
  "is grandfather of",
  "is grandmother of",
  "is grandparent of",
  "is grandson of",
  "is granddaughter of",
  "is grandchild of"
];

/***************************
 * HELPER FUNCTIONS
 ***************************/

export const updateComponent = (id: string) => {
  /* Preliminary information (i.e. name) about the entity */
  let name = getNameFromID(id);

  /*******************/
  /* Find all relationships */
  /*******************/

  var connections: {
    target: string;
    targetID: string;
    verb: string;
    passage: passageInfo[];
  }[] = [];

  // Populate "connections" array with all family connections
  Object.values(datum).forEach(function(datumRow) {
    if (
      datumRow["Direct Object ID"] === id &&
      familyDatums.includes(datumRow.Verb)
    ) {
      // i.e. X <verb> Y where Y is your name
      let passageInfo: passageInfo[] = [
        {
          start: datumRow["Passage: start"],
          startID: datumRow["Passage: start ID"],
          end: datumRow["Passage: end"] === "" ? "" : datumRow["Passage: end"],
          endID: datumRow["Passage: end ID"]
        }
      ];
      connections.push({
        target: datumRow["Subject"],
        targetID: datumRow["Subject ID"],
        verb: datumRow.Verb,
        passage: passageInfo
      });
    }
    if (datumRow["Subject ID"] === id && familyDatums.includes(datumRow.Verb)) {
      // Add the logic reversals here
      // i.e. Y <verb> X where Y is your name
      let passageInfo: passageInfo[] = [
        {
          start: datumRow["Passage: start"],
          startID: datumRow["Passage: start ID"],
          end: datumRow["Passage: end"] === "" ? "" : datumRow["Passage: end"],
          endID: datumRow["Passage: end ID"]
        }
      ];
      connections.push({
        target: datumRow["Direct Object"],
        targetID: datumRow["Direct Object ID"],
        verb: reversedVerb(datumRow.Verb, datumRow["Direct Object ID"]),
        passage: passageInfo
      });
    }
  });

  // Sort family relationships into their relevant relationship state categories
  //TODO: deal with duplicates
  let relationships: relationshipInfo = {
    MOTHERS: [],
    FATHERS: [],
    SIBLINGS: [],
    WIVES: [],
    HUSBANDS: [],
    CHILDREN: []
  };
  connections.forEach(datum => {
    let d: entityInfo = {
      target: datum.target,
      targetID: datum.targetID,
      passage: datum.passage
    };

    //Assign thenm to their relevant categories
    if (datum.verb === "is mother of") {
      // Address duplicates: same person, different passages
      let wasDuplicate = false;
      relationships.MOTHERS.forEach(mother => {
        if (mother.targetID === d.targetID) {
          mother.passage.push(d.passage[0]);
          wasDuplicate = true;
        }
      });
      if (!wasDuplicate) {
        relationships.MOTHERS.push(d);
      }
    } else if (datum.verb === "is father of") {
      // Address duplicates: same person, different passages
      let wasDuplicate = false;
      relationships.FATHERS.forEach(father => {
        if (father.targetID === d.targetID) {
          father.passage.push(d.passage[0]);
          wasDuplicate = true;
        }
      });
      if (!wasDuplicate) {
        relationships.FATHERS.push(d);
      }
    } else if (
      datum.verb === "is son of" ||
      datum.verb === "is daughter of" ||
      datum.verb === "is child of"
    ) {
      let wasDuplicate = false;
      relationships.CHILDREN.forEach(children => {
        if (children.targetID === d.targetID) {
          children.passage.push(d.passage[0]);
          wasDuplicate = true;
        }
      });
      if (!wasDuplicate) {
        relationships.CHILDREN.push(d);
      }
    } else if (
      datum.verb === "is sister of" ||
      datum.verb === "is brother of" ||
      datum.verb === "is twin of"
    ) {
      let wasDuplicate = false;
      relationships.SIBLINGS.forEach(siblings => {
        if (siblings.targetID === d.targetID) {
          siblings.passage.push(d.passage[0]);
          wasDuplicate = true;
        }
      });
      if (!wasDuplicate) {
        relationships.SIBLINGS.push(d);
      }
    } else if (datum.verb === "is wife of") {
      let wasDuplicate = false;
      relationships.WIVES.forEach(wives => {
        if (wives.targetID === d.targetID) {
          wives.passage.push(d.passage[0]);
          wasDuplicate = true;
        }
      });
      if (!wasDuplicate) {
        relationships.WIVES.push(d);
      }
    } else if (datum.verb === "is husband of") {
      let wasDuplicate = false;
      relationships.HUSBANDS.forEach(husbands => {
        if (husbands.targetID === d.targetID) {
          husbands.passage.push(d.passage[0]);
          wasDuplicate = true;
        }
      });
      if (!wasDuplicate) {
        relationships.HUSBANDS.push(d);
      }
    } else if (datum.verb === "marries") {
      if (genderData[datum.targetID].gender === "female") {
        let wasDuplicate = false;
        relationships.WIVES.forEach(wives => {
          if (wives.targetID === d.targetID) {
            wives.passage.push(d.passage[0]);
            wasDuplicate = true;
          }
        });
        if (!wasDuplicate) {
          relationships.WIVES.push(d);
        }
      } else if (genderData[datum.targetID].gender === "male") {
        let wasDuplicate = false;
        relationships.FATHERS.forEach(fathers => {
          if (fathers.targetID === d.targetID) {
            fathers.passage.push(d.passage[0]);
            wasDuplicate = true;
          }
        });
        if (!wasDuplicate) {
          relationships.FATHERS.push(d);
        }
      }
    }
  });
  return {
    id: id,
    relationships: relationships,
    name: name,
    validSearch: true
  };

  // Modify the relationship and name
};

/* Use the entity CSV instead when receive it */
const getNameFromID = (id: string) => {
  return entities[id]["Name (Smith & Trzaskoma)"];
};

export const checkNoRelations = (relationships: any) => {
  return (
    relationships.MOTHERS.length === 0 &&
    relationships.FATHERS.length === 0 &&
    relationships.SIBLINGS.length === 0 &&
    relationships.WIVES.length === 0 &&
    relationships.HUSBANDS.length === 0 &&
    relationships.CHILDREN.length === 0
  );
};

const reversedVerb = (verb: string, dirObject: string) => {
  if (
    verb === "is mother of" ||
    verb === "is father of" ||
    verb === "is parent of"
  ) {
    return "is child of"; // Uses generic "is child of" at the moment since data cards do not need gender specificity for children
  } else if (
    verb === "is son of" ||
    verb === "is daughter of" ||
    verb === "is child of"
  ) {
    if (genderData[dirObject].gender === "female") {
      return "is mother of";
    } else if (genderData[dirObject].gender === "male") {
      return "is father of";
    } else {
      return "is parent of";
    }
  } else if (
    verb === "is sister of" ||
    verb === "is brother of" ||
    verb === "is twin of"
  ) {
    return "is sister of";
  } else if (
    verb === "is wife of" ||
    verb === "is husband of" ||
    verb === "marries"
  ) {
    if (genderData[dirObject].gender === "female") {
      return "is wife of";
    } else if (genderData[dirObject].gender === "male") {
      return "is husband of";
    } else {
      return "marries";
    }
  } else {
    console.log(
      "Unsure of this connection, or connection is not relevant for the datacards-",
      verb,
      dirObject
    );
    return "";
  }
};

export const getAlternativeNames = (id: string) => {
  let alternatives: string = "";
  if (entities[id]["Name (transliteration)"] !== "") {
    if (alternatives === "") {
      alternatives = entities[id]["Name (transliteration)"];
    } else {
      alternatives =
        alternatives + ", " + entities[id]["Name (transliteration)"];
    }
  }
  if (entities[id]["Name (Latinized)"] !== "") {
    if (alternatives === "") {
      alternatives = entities[id]["Name (Latinized)"];
    } else {
      alternatives = alternatives + ", " + entities[id]["Name (Latinized)"];
    }
  }
  if (entities[id]["Name in Latin texts"] !== "") {
    if (alternatives === "") {
      alternatives = entities[id]["Name in Latin texts"];
    } else {
      alternatives = alternatives + ", " + entities[id]["Name in Latin texts"];
    }
  }
  if (entities[id]["Alternative names"] !== "") {
    if (alternatives === "") {
      alternatives = entities[id]["Alternative names"];
    } else {
      alternatives = alternatives + ", " + entities[id]["Alternative names"];
    }
  }
  if (alternatives === "") {
    return alternatives;
  } else {
    return "(Also known as: " + alternatives + ")";
  }
};
