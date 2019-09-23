import React from "react";
import "./App.css";
import "./DataCards.scss";
import datum from "./data/datum.json";
import entities from "./data/entities.json";
import genderData from "./data/genderData.json";
import Pluralize from "pluralize";
import queryString from "querystring";

type DatumProps = {
  location: {
    search: string;
  };
  history: {
    push: ({}) => null;
  };
};
type DatumState = {
  id: string;
  name: string;
  relationships: relationshipInfo;
  validSearch: boolean;
};
type relationshipInfo = {
  MOTHERS: entityInfo[];
  FATHERS: entityInfo[];
  SIBLINGS: entityInfo[];
  WIVES: entityInfo[];
  HUSBANDS: entityInfo[];
  CHILDREN: entityInfo[];
};
type passageInfo = { start: string; end: string };
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

class DataCards extends React.Component<DatumProps, DatumState> {
  constructor(props: any) {
    super(props);
    // Dionysus is 8188175, use to test multiple names
    // Atreus is 8187873
    // Theseus is 8188822
    // Agamemnon is 8182035
    // Use Clytaimnestra example, 8188055
    this.state = {
      id: "8182035",
      name: "",
      relationships: {
        MOTHERS: [],
        FATHERS: [],
        SIBLINGS: [],
        WIVES: [],
        HUSBANDS: [],
        CHILDREN: []
      },
      validSearch: false
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
    const params = queryString.parse(this.props.location.search.slice(1));
    const id = params.id as string;
    if (!params.id) {
      // Handle bad url
      //@ts-ignore
      this.setState({ validSearch: false });
    } else {
      //Substitute with ID
      // this.updateComponent(this.state.id);
      this.updateComponent(id);
    }
  }

  componentDidUpdate() {
    const params = queryString.parse(this.props.location.search.slice(1));
    const id = params.id as string;
    if (!params.id) {
      // Handle bad url
      //@ts-ignore
      this.setState({ validSearch: false });
    } else if (this.state.id !== id) {
      //Substitute with ID
      // this.updateComponent(this.state.id);
      this.updateComponent(id);
    }
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
            end: datumRow["Passage: end"] === "" ? "" : datumRow["Passage: end"]
          }
        ];
        connections.push({
          target: datumRow["Subject"],
          targetID: datumRow["Subject ID"],
          verb: datumRow.Verb,
          passage: passageInfo
        });
      }
      if (
        datumRow["Subject ID"] === id &&
        familyDatums.includes(datumRow.Verb)
      ) {
        // Add the logic reversals here
        // i.e. Y <verb> X where Y is your name
        let passageInfo: passageInfo[] = [
          {
            start: datumRow["Passage: start"],
            end: datumRow["Passage: end"] === "" ? "" : datumRow["Passage: end"]
          }
        ];
        connections.push({
          target: datumRow["Direct Object"],
          targetID: datumRow["Direct Object ID"],
          verb: that.reversedVerb(datumRow.Verb, datumRow["Direct Object ID"]),
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
        if (
          this.hasKey(genderData, datum.targetID) &&
          genderData[datum.targetID].gender === "female"
        ) {
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
        } else if (
          this.hasKey(genderData, datum.targetID) &&
          genderData[datum.targetID].gender === "male"
        ) {
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

    // Modify the relationship and name
    this.setState({ id, relationships, name, validSearch: true });
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
      that.state.relationships.MOTHERS.length === 0 &&
      that.state.relationships.FATHERS.length === 0 &&
      that.state.relationships.SIBLINGS.length === 0 &&
      that.state.relationships.WIVES.length === 0 &&
      that.state.relationships.HUSBANDS.length === 0 &&
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
      if (
        this.hasKey(genderData, dirObject) &&
        genderData[dirObject].gender === "female"
      ) {
        return "is wife of";
      } else if (
        this.hasKey(genderData, dirObject) &&
        genderData[dirObject].gender === "male"
      ) {
        return "is husband of";
      } else {
        return "marries"; // TODO: No way to deal with undefined partner genders yet.
      }
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
    this.props.history.push("/datacards?id=" + targetID);
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
            {this.state.relationships[relationship].length === 1
              ? Pluralize.singular(relationship) + ": "
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
                  {entity.passage.map(passage => {
                    return (
                      <span>
                        ,{" "}
                        {console.log(
                          "This is the passage",
                          passage.start,
                          passage.end
                        )}
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={
                            "https://scaife.perseus.org/reader/urn:cts:greekLit:tlg0548.tlg002.perseus-grc2:" +
                            passage.start.split(" ")[2] +
                            (passage.end === ""
                              ? ""
                              : "-" + passage.end.split(" ")[2]) +
                            "/?right=perseus-eng2"
                          }
                          style={{
                            color: "grey",
                            fontStyle: "italic",
                            fontSize: "0.8rem"
                          }}
                        >
                          {passage.start +
                            (passage.end === ""
                              ? ""
                              : "-" + passage.end.split(" ")[2])}
                        </a>
                      </span>
                    );
                  })}
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
          alternatives =
            alternatives + ", " + entities[id]["Name in Latin texts"];
        }
      }
      if (entities[id]["Alternative names"] !== "") {
        if (alternatives === "") {
          alternatives = entities[id]["Alternative names"];
        } else {
          alternatives =
            alternatives + ", " + entities[id]["Alternative names"];
        }
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
      <React.Fragment>
        <div
          className={this.state.validSearch ? "no-display" : ""}
          style={{ margin: "1rem 6rem 3rem 6rem", padding: "3rem" }}
        >
          No profiles have been selected. Try using the Search function.
        </div>
        <div className={this.state.validSearch ? "" : "no-display"}>
          <div
            style={{
              margin: "1rem 6rem 3rem 6rem",
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
              return <div key={key}>{this.getDataPoints(key)}</div>;
            })}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default DataCards;
