import React from "react";
import "./App.css";
import "./DataCards.scss";
import datum from "./data/datum.json";
import entities from "./data/entities.json";
import genderData from "./data/genderData.json";
import { exportDefaultSpecifier } from "@babel/types";

type DatumProps = {};
type DatumState = {
  id: string;
  name: string;
  relationships: relationshipInfo;
};
type relationshipInfo = {
  MOTHER: entityInfo[];
  FATHER: entityInfo[];
  SIBLINGS: entityInfo[];
  WIVESHUSBANDS: entityInfo[];
  CHILDREN: entityInfo[];
};
type entityInfo = {
  target: string;
  targetID: string;
  passageStart: string;
  passageEnd: string;
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

class DataCards extends React.Component<DatumProps, DatumState> {
  constructor(props: any) {
    super(props);
    // Dionysus is 8188175, use to test multiple names
    // Atreus is 8187873
    // Theseus is 8188822
    // Agamemnon is 8182035
    // Use Clytaimnestra example, 8188055
    this.state = {
      id: "8188175",
      name: "",
      relationships: {
        MOTHER: [],
        FATHER: [],
        SIBLINGS: [],
        WIVESHUSBANDS: [],
        CHILDREN: []
      }
    };
    this.getNameFromID = this.getNameFromID.bind(this);
    this.checkNoRelations = this.checkNoRelations.bind(this);
    this.reversedVerb = this.reversedVerb.bind(this);
    this.getDataPoints = this.getDataPoints.bind(this);
    this.handleNameClicked = this.handleNameClicked.bind(this);
    this.getAlternativeNames = this.getAlternativeNames.bind(this);
  }

  /*******************/
  /* SETUP FUNCTIONS */
  /*******************/

  componentDidMount() {
    this.updateComponent(this.state.id);
  }

  updateComponent(id: string) {
    const that = this;
    /* Preliminary information (i.e. name) about the entity */
    let name = this.getNameFromID(id);

    /*******************/
    /* Find all relationships */
    /*******************/

    var connections: {
      target: string;
      targetID: string;
      verb: string;
      passageStart: string;
      passageEnd: string;
    }[] = [];

    // Populate all family connections
    Object.values(datum).forEach(function(datumRow) {
      if (
        datumRow["Direct Object ID"] === id &&
        familyDatums.includes(datumRow.Verb)
      ) {
        // i.e. X <verb> Y where Y is your name
        connections.push({
          target: datumRow["Subject"],
          targetID: datumRow["Subject ID"],
          verb: datumRow.Verb,
          passageStart: datumRow["Passage: start"],
          passageEnd:
            datumRow["Passage: end"] === "" ? "" : datumRow["Passage: end"]
        });
      }
      if (
        datumRow["Subject ID"] === id &&
        familyDatums.includes(datumRow.Verb)
      ) {
        // Add the logic reversals here
        // i.e. Y <verb> X where Y is your name
        connections.push({
          target: datumRow["Direct Object"],
          targetID: datumRow["Direct Object ID"],
          verb: that.reversedVerb(datumRow.Verb, datumRow["Direct Object ID"]),
          passageStart: datumRow["Passage: start"],
          passageEnd:
            datumRow["Passage: end"] === "" ? "" : datumRow["Passage: end"]
        });
      }
    });

    // Sort family relationships into their relevant relationship state categories
    //TODO: deal with duplicates
    let relationships: relationshipInfo = {
      MOTHER: [],
      FATHER: [],
      SIBLINGS: [],
      WIVESHUSBANDS: [],
      CHILDREN: []
    };
    connections.forEach(datum => {
      let d: entityInfo = {
        target: datum.target,
        targetID: datum.targetID,
        passageStart: datum.passageStart,
        passageEnd: datum.passageEnd
      };
      if (datum.verb === "is mother of") {
        relationships.MOTHER.push(d);
      } else if (datum.verb === "is father of") {
        relationships.FATHER.push(d);
      } else if (
        datum.verb === "is son of" ||
        datum.verb === "is daughter of" ||
        datum.verb === "is child of"
      ) {
        relationships.CHILDREN.push(d);
      } else if (
        datum.verb === "is sister of" ||
        datum.verb === "is brother of" ||
        datum.verb === "is twin of"
      ) {
        relationships.SIBLINGS.push(d);
      } else if (
        datum.verb === "is wife of" ||
        datum.verb === "is husband of" ||
        datum.verb === "marries"
      ) {
        relationships.WIVESHUSBANDS.push(d);
      }
    });

    // Modify the relationship and name
    this.setState({ id, relationships, name });
  }

  /********************/
  /* HELPER FUNCTIONS */
  /********************/

  /* Use the entity CSV instead when receive it */
  getNameFromID(id: string) {
    let that = this;
    if (that.hasKey(entities, id)) {
      return entities[id]["Name (Smith & Trzaskoma)"];
    } else {
      return "unknown";
    }
  }

  checkNoRelations() {
    let that = this;
    return (
      that.state.relationships.MOTHER.length === 0 &&
      that.state.relationships.FATHER.length === 0 &&
      that.state.relationships.SIBLINGS.length === 0 &&
      that.state.relationships.WIVESHUSBANDS.length === 0 &&
      that.state.relationships.CHILDREN.length === 0
    );
  }

  reversedVerb(verb: string, dirObject: string) {
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
      if (
        this.hasKey(genderData, dirObject) &&
        genderData[dirObject].gender === "female"
      ) {
        return "is mother of";
      } else if (
        this.hasKey(genderData, dirObject) &&
        genderData[dirObject].gender === "male"
      ) {
        return "is father of";
      } else {
        return "is parent of"; // TODO: No way to deal with undefined parent genders yet.
      }
    } else if (
      verb === "is sister of" ||
      verb === "is brother of" ||
      verb === "is twin of"
    ) {
      return "is sister of"; // TODO: Fix using sister as siblings placeholder since data cards is not specific on siblings gender
    } else if (
      verb === "is wife of" ||
      verb === "is husband of" ||
      verb === "marries"
    ) {
      return "marries"; //Do not need specificity here (?)
    } else {
      console.log(
        "Unsure of this connection, or connection is not relevant for the datacards-",
        verb,
        dirObject
      );
      return "";
    }
  }

  handleNameClicked(targetID: string) {
    /* TODO: Fix this rudimentary solution - data cards to links not volatile state */
    this.updateComponent(targetID);
  }

  getDataPoints(relationship: string) {
    let that = this;
    if (
      that.hasKey(that.state.relationships, relationship) &&
      that.state.relationships[relationship].length !== 0
    ) {
      return (
        <div style={{ margin: "0 0 2rem 0", clear: "both" }}>
          <div
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              float: "left",
              paddingRight: "1rem"
            }}
          >
            {relationship === "WIVESHUSBANDS"
              ? "Wives / Husbands: "
              : relationship + ": "}
          </div>
          <div style={{ float: "left" }}>
            {that.state.relationships[relationship].map(entity => {
              return (
                <div style={{ margin: "0" }}>
                  <div
                    className="entity-button"
                    onClick={() => this.handleNameClicked(entity.targetID)}
                  >
                    {entity.target}
                  </div>
                  ,{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={
                      "https://scaife.perseus.org/reader/urn:cts:greekLit:tlg0548.tlg002.perseus-grc2:" +
                      entity.passageStart.split(" ")[2] +
                      (entity.passageEnd === ""
                        ? ""
                        : "-" + entity.passageEnd.split(" ")[2]) +
                      "/?right=perseus-eng2"
                    }
                    style={{
                      color: "grey",
                      fontStyle: "italic",
                      fontSize: "0.8rem"
                    }}
                  >
                    {/* Note change "eng" to "grc" to toggle between English and Greek */}

                    {entity.passageStart +
                      (entity.passageEnd === ""
                        ? ""
                        : "-" + entity.passageEnd.split(" ")[2])}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  getAlternativeNames(id: string) {
    if (this.hasKey(entities, id)) {
      let hasAlternatives: boolean = false;
      let alternatives: string = "";
      if (entities[id]["Name (transliteration)"] !== "") {
        if (alternatives === "") {
          alternatives = entities[id]["Name (transliteration)"];
        } else {
          alternatives =
            alternatives + ", " + entities[id]["Name (transliteration)"];
        }
        console.log("1");
      }
      if (entities[id]["Name (Latinized)"] !== "") {
        if (alternatives === "") {
          alternatives = entities[id]["Name (Latinized)"];
        } else {
          alternatives = alternatives + ", " + entities[id]["Name (Latinized)"];
        }
        console.log("2");
      }
      if (entities[id]["Name in Latin texts"] !== "") {
        if (alternatives === "") {
          alternatives = entities[id]["Name in Latin texts"];
        } else {
          alternatives =
            alternatives + ", " + entities[id]["Name in Latin texts"];
        }
        console.log("3");
      }
      if (entities[id]["Alternative names"] !== "") {
        if (alternatives === "") {
          alternatives = entities[id]["Alternative names"];
        } else {
          alternatives =
            alternatives + ", " + entities[id]["Alternative names"];
        }
        console.log("4");
      }
      if (alternatives === "") {
        return alternatives;
      } else {
        return "(Also known as: " + alternatives + ")";
      }
    }
  }

  /* Addresses typescript indexing objects error */
  hasKey<O>(obj: O, key: keyof any): key is keyof O {
    return key in obj;
  }

  /*************/
  /* RENDERING */
  /*************/

  render() {
    return (
      <div
        style={{
          margin: "3rem 6rem 3rem 6rem",
          padding: "3rem",
          display: "flow-root",
          border: "solid 1px black"
        }}
      >
        <div id="datacard-heading">{this.state.name}</div>
        <div id="datacard-alternativenames">
          {this.getAlternativeNames(this.state.id)}
        </div>
        {/* If no data is available for the subject */}
        <div className={this.checkNoRelations() ? "" : "no-display"}>
          No relationship data is available for {this.state.name}.
        </div>
        {/* If data is available for the subject */}
        {Object.keys(this.state.relationships).map(key => {
          return <div>{this.getDataPoints(key)}</div>;
        })}
      </div>
    );
  }
}

export default DataCards;
