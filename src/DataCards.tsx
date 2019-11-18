import React from "react";
import "./App.css";
import "./DataCards.scss";
import queryString from "querystring";
import passages from "./data/passages.json";
import EntityGraph from "./EntityGraph";
import ReactGA from "react-ga";
import {
  relationshipInfo,
  updateComponent,
  checkNoRelations,
  getAlternativeNames
} from "./DataCardHandler";
import Pluralize from "pluralize";

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
    /* this.getNameFromID = this.getNameFromID.bind(this);
    this.checkNoRelations = this.checkNoRelations.bind(this);
    this.reversedVerb = this.reversedVerb.bind(this);
    this.getDataPoints = this.getDataPoints.bind(this);
    this.handleNameClicked = this.handleNameClicked.bind(this);
    this.getAlternativeNames = this.getAlternativeNames.bind(this); */
  }

  /*******************/
  /* HELPER FUNCTIONS */
  /*******************/

  getPassageLink(passage: any) {
    let id = passage.startID;
    let author: string = passages[id].Author;
    let title: string = passages[id].Title;
    let start: string = passages[id].Passage;
    let end: string = passage.endID;

    // Dealing with multiple URNs
    let URN: string = "";
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
        {"  ("}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={URN}
          style={{
            color: "grey",
            fontSize: "0.8rem"
          }}
        >
          {author + ", "}
          <span style={{ fontStyle: "italic" }}>{title}</span> {start}
          {start !== end && end !== "" ? "-" + end : ""}
        </a>
        {")"}
      </span>
    );
  }

  handleNameClicked(targetID: string) {
    ReactGA.event({
      category: "NameClicked",
      action: "User clicked on a name within the data card"
    });
    this.props.history.push("/datacards?id=" + targetID);
  }

  getDataPoints(relationship: string) {
    let that = this;
    if (that.state.relationships[relationship].length !== 0) {
      return (
        <div style={{ clear: "both" }}>
          <div
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              float: "left",
              paddingRight: "1rem"
            }}
          >
            {console.log(this.state.relationships[relationship])}
            {this.state.relationships[relationship].length === 1 &&
            this.state.relationships[relationship][0].type !== "Collective"
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
                    return this.getPassageLink(passage);
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
      let newState = updateComponent(id);
      this.setState({
        id: newState.id,
        relationships: newState.relationships,
        name: newState.name,
        validSearch: newState.validSearch
      });
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
      let newState = updateComponent(id);
      this.setState({
        id: newState.id,
        relationships: newState.relationships,
        name: newState.name,
        validSearch: newState.validSearch
      });
    }
  }

  /*************/
  /* RENDERING */
  /*************/

  render() {
    return (
      <React.Fragment>
        <div
          className={this.state.validSearch ? "no-display" : ""}
          style={{ textAlign: "center", padding: "3rem" }}
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
              {getAlternativeNames(this.state.id)}
            </div>
            <div id="datacard-mantoID">MANTO ID: {this.state.id}</div>
            {/* If no data is available for the subject */}
            <div
              className={
                checkNoRelations(this.state.relationships) ? "" : "no-display"
              }
            >
              No relationship data is available for {this.state.name}.
            </div>
            {/* If data is available for the subject */}
            {Object.keys(this.state.relationships).map(key => {
              return <div key={key}>{this.getDataPoints(key)}</div>;
            })}
          </div>
        </div>
        {/* 
        <EntityGraph
          id={this.state.id}
          relationships={this.state.relationships}
        ></EntityGraph>
        */}
      </React.Fragment>
    );
  }
}

export default DataCards;
