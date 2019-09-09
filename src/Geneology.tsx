import React from "react";
import "./App.css";
import "./Geneology.scss";
import datum from "./data/datum.json";
import entities from "./data/entities.json";

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

class Geneology extends React.Component<DatumProps, DatumState> {
  constructor(props: any) {
    super(props);
    // Dionysus is 8188175
    // Atreus is 8187873
    // Theseus is 8188822
    // Agamemnon is 8182035
    this.state = {
      id: "8188055",
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
    this.getDataPoints = this.getDataPoints.bind(this);
    this.handleNameClicked = this.handleNameClicked.bind(this);
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
        console.log(
          "Added",
          datumRow["Subject"],
          datumRow.Verb,
          datumRow["Direct Object"]
        );
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
        console.log(
          "Not yet addressed:",
          datumRow["Subject"],
          datumRow.Verb,
          datumRow["Direct Object"]
        );
      }
    });

    // Sort family relationships into their relevant relationship state categories
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
        //TODO: add the logical reversals and complex relationships here
        //TODO: deal with duplicates
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
                      "https://scaife.perseus.org/reader/urn:cts:greekLit:tlg0548.tlg002.perseus-eng2:" +
                      entity.passageStart.split(" ")[2] +
                      (entity.passageEnd === ""
                        ? ""
                        : "-" + entity.passageEnd.split(" ")[2])
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
        <div
          id="datacard-heading"
          style={{ marginBottom: "2rem", textTransform: "uppercase" }}
        >
          {this.state.name}
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

export default Geneology;
