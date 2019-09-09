import React from "react";
import "./App.css";
import "./Geneology.scss";
import datum from "./data/datum.json";

type DatumProps = {};
type DatumState = {
  name: string;
  relationships: {
    MOTHER: agentInfo[];
    FATHER: agentInfo[];
    SIBLINGS: agentInfo[];
    WIVESHUSBANDS: agentInfo[];
    CHILDREN: agentInfo[];
  };
};
type agentInfo = { target: string; targetID: string; passage: string };

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
    this.state = {
      name: "Branchos",
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
  }

  /*******************/
  /* SETUP FUNCTIONS */
  /*******************/

  componentDidMount() {
    const that = this;
    var connections: {
      target: string;
      targetID: string;
      verb: string;
      passage: string;
    }[] = [];
    Object.values(datum).forEach(function(datumRow) {
      if (
        datumRow["Direct Object"] === that.state.name &&
        familyDatums.includes(datumRow.Verb)
      ) {
        // i.e. X <verb> Y where Y is your name
        connections.push({
          target: datumRow["Subject"],
          targetID: datumRow["Subject ID"],
          verb: datumRow.Verb,
          passage: datumRow["Passage: start"]
        });
      }
      if (
        datumRow.Subject === that.state.name &&
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
    let relationships = that.state.relationships;
    connections.forEach(datum => {
      let d: agentInfo = {
        target: datum.target,
        targetID: datum.targetID,
        passage: datum.passage
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
    this.setState({ relationships });
  }

  /********************/
  /* HELPER FUNCTIONS */
  /********************/

  /* Use the agent CSV instead when receive it */
  getNameFromID(id: string) {
    Object.values(datum).forEach(function(datumRow) {
      if (datumRow["Subject ID"] === id) {
        return datumRow["Subject"];
      }
    });
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

  getDataPoints(relationship: string) {
    let that = this;
    if (
      that.hasKey(that.state.relationships, relationship) &&
      that.state.relationships[relationship].length !== 0
    ) {
      return (
        <div>
          <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>
            {relationship === "WIVESHUSBANDS"
              ? "Wives / Husbands: "
              : relationship + ": "}
          </span>
          {that.state.relationships[relationship].map(agent => {
            return (
              <span>
                {agent.target},{" "}
                <a
                  target="_blank"
                  href={
                    "https://scaife.perseus.org/reader/urn:cts:greekLit:tlg0548.tlg002.perseus-eng2:" +
                    agent.passage.split(" ")[2]
                  }
                  style={{ color: "grey", fontStyle: "italic" }}
                >
                  {/* Note change "eng" to "grc" to toggle between English and Greek */}
                  ({agent.passage})
                </a>
              </span>
            );
          })}
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
        style={{ margin: "2rem", border: "solid 1px black", padding: "3rem" }}
      >
        <div id="datacard-heading" style={{ marginBottom: "2rem" }}>
          {this.state.name}
        </div>
        {/* If no data is available for the subject */}
        <div className={this.checkNoRelations() ? "" : "no-display"}>
          No relationship data is available for {this.state.name}
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
