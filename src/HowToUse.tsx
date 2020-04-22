import React from "react";
import "./App.css";
import "./DataCards.scss";
import queryString from "querystring";
import passages from "./data/passages.json";
import relationships from "./data/relationships.json";
import EntityGraph from "./EntityGraph.jsx";
import ReactGA from "react-ga";
import entities from "./data/entities.json";
import {
  relationshipInfo,
  checkNoRelations,
  getAlternativeNames,
  getGender,
  getName,
  getEntityType
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
  members: { sub: any[]; super: any[] };
  type: string;
  validSearch: boolean;
  alternativeName: { targetID: string; passage: any[] };
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
      id: "8182035", // placeholder
      name: "",
      relationships: {
        MOTHERS: [],
        FATHERS: [],
        SIBLINGS: [],
        TWIN: [],
        SPOUSES: [],
        CHILDREN: []
      },
      members: { sub: [], super: [] },
      type: "",
      validSearch: false,
      alternativeName: { targetID: "", passage: [] }
    };
    /* this.getNameFromID = this.getNameFromID.bind(this);
    this.checkNoRelations = this.checkNoRelations.bind(this);
    this.reversedVerb = this.reversedVerb.bind(this);
    this.getDataPoints = this.getDataPoints.bind(this); */
    this.handleNameClicked = this.handleNameClicked.bind(this);
    // this.handleDisputeClicked = this.handleDisputeClicked.bind(this);
    /* this.getAlternativeNames = this.getAlternativeNames.bind(this); */
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

  /* handleDisputeClicked(edge: any, id: string) {
    console.log("edge", edge, "id", id);
    this.setState({
      openInfoPage: { showDisputePage: true, showUnusualPage: false }
    });
  } */

  getDataPoints(relationship: string, showPassage: boolean) {
    let that = this;
    let focus =
      relationship === "PART OF"
        ? this.state.members.super
        : that.state.relationships[relationship];
    if (focus.length !== 0) {
      return (
        <div style={{ clear: "both" }}>
          <div
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              float: "left",
              paddingRight: "1rem",
              marginTop: "0.5rem"
            }}
          >
            {this.getPluralization(relationship)}
          </div>
          <div style={{ float: "left", marginTop: "0.5rem" }}>
            {focus.map(entity => {
              return (
                <div style={{ margin: "0" }}>
                  {this.checkUnusualRelationship(
                    entity,
                    relationship,
                    showPassage
                  )}
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

  getPluralization(relationship: string) {
    if (relationship === "PART OF") {
      return relationship + ": ";
    } else if (relationship === "MOTHERS" || relationship === "FATHERS") {
      return Pluralize.singular(relationship) + ": ";
    } else {
      if (this.state.relationships[relationship].length === 1) {
        return Pluralize.singular(relationship) + ": ";
      } else {
        return relationship + ": ";
      }
    }
  }

  checkUnusualRelationship(
    entity: any,
    relationship: any,
    showPassage: boolean
  ) {
    let that = this;

    if (
      (relationship === "MOTHERS" && entity.mother_parthenogenesis) ||
      (relationship === "FATHERS" && entity.father_parthenogenesis)
    ) {
      return (
        <span>
          <div
            className="entity-button"
            onClick={() => this.handleNameClicked(entity.targetID)}
          >
            {entity !== that.state.relationships[relationship][0] ? (
              <span>OR </span>
            ) : (
              ""
            )}
            <span style={{ textDecoration: "underline" }}>{entity.target}</span>
          </div>
          <span> by pathenogenesis </span>
          {showPassage
            ? entity.passage.map(passage => {
                return this.getPassageLink(passage);
              })
            : ""}
        </span>
      );
    } else if (relationship === "FATHERS" && entity.autochthony) {
      return (
        <span>
          {entity !== that.state.relationships[relationship][0] ? (
            <span>OR </span>
          ) : (
            ""
          )}
          <span>By autochthony </span>
          {showPassage
            ? entity.passage.map(passage => {
                return this.getPassageLink(passage);
              })
            : ""}
        </span>
      );
    } else if (relationship === "CHILDREN") {
      return (
        <div className="entity-child-wrapper">
          <div className="entity-child-grouping">
            {that.getChildParentGrouped(entity)}
          </div>
          {that.getOtherParentText(entity.otherParentIDs)}
        </div>
      );
    } else {
      return (
        <span>
          <div
            className="entity-button"
            onClick={() => this.handleNameClicked(entity.targetID)}
          >
            {relationship !== "CHILDREN" &&
            relationship !== "SIBLINGS" &&
            relationship !== "SPOUSES" &&
            relationship !== "PART OF" &&
            entity !== that.state.relationships[relationship][0] ? (
              <span>OR </span>
            ) : (
              ""
            )}
            <span style={{ textDecoration: "underline" }}>{entity.target}</span>
          </div>
          {showPassage ? (
            entity.passage.map(passage => {
              return this.getPassageLink(passage);
            })
          ) : (
            <span style={{ paddingRight: "10rem" }}></span>
          )}
        </span>
      );
    }
  }

  getChildParentGrouped(group: any) {
    return group.child.map(c => {
      return (
        <div
          className="entity-child-button"
          onClick={() => this.handleNameClicked(c.targetID)}
        >
          {c.target}
        </div>
      );
    });
  }

  getOtherParentText(otherParentIDs: any[]) {
    if (otherParentIDs.length === 0) {
      return <div className="entity-parent-grouping"></div>;
    } else {
      return (
        <div className="entity-parent-grouping">
          with{" "}
          {otherParentIDs.map(pID => {
            return (
              <span>
                <span
                  className="entity-child-button"
                  style={{ margin: 0 }}
                  onClick={() => this.handleNameClicked(pID)}
                >
                  {getName(entities[pID])}
                </span>
                {otherParentIDs.indexOf(pID) === otherParentIDs.length - 1
                  ? ""
                  : " OR "}
              </span>
            );
          })}
        </div>
      );
    }
  }

  getCollectiveMembers() {
    let that = this;
    if (that.state.members.sub.length !== 0) {
      return (
        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <div
            style={{
              fontWeight: "bold",
              textTransform: "uppercase",
              textDecoration: "underline",
              marginBottom: "0.5rem",
              marginTop: "5rem"
            }}
          >
            MEMBERS:
          </div>
          {that.state.members.sub.map(member => {
            return (
              <div style={{ margin: "0" }}>
                <span
                  className="collective-button"
                  onClick={() => this.handleNameClicked(member.targetID)}
                >
                  {member.target}
                </span>
                {member.passage.map(passage => {
                  return this.getPassageLink(passage);
                })}
              </div>
            );
          })}
        </div>
      );
    }
  }

  getCollectiveSubheading(id: string) {
    let relation = getGender(id) === "Female" ? "daughters" : "sons";
    // How to deal with multiple of the same ID in the entities?
    let parents = getName(
      entities[entities[id]["Collective (geneal.): children of ID"]]
    );
    if (entities[id]["Other collective parent ID"]) {
      parents =
        parents +
        " and " +
        getName(entities[entities[id]["Other collective parent ID"]]);
    }
    let divineParents = entities[id]["Collective (geneal.): divine father ID"]
      ? "OR " +
        getName(
          entities[entities[id]["Collective (geneal.): divine father ID"]]
        )
      : "";
    /* let parents: { mothers: string; fathers: string } = {
      mothers: "",
      fathers: ""
    };
    for (let i = 0; i < this.state.relationships.MOTHERS.length; i++) {
      if (parents.mothers === "") {
        parents.mothers = this.state.relationships.MOTHERS[i].target;
      } else {
        parents.mothers =
          parents.mothers + " OR " + this.state.relationships.MOTHERS[i].target;
      }
    }
    for (let i = 0; i < this.state.relationships.FATHERS.length; i++) {
      if (parents.fathers === "") {
        parents.fathers = this.state.relationships.FATHERS[i].target;
      } else {
        parents.fathers =
          parents.fathers + " OR " + this.state.relationships.FATHERS[i].target;
      }
    }
    let finalString = "";
    if (parents.mothers !== "" && parents.fathers !== "") {
      finalString = parents.mothers + " and " + parents.fathers;
    } else if (parents.mothers !== "" && parents.fathers === "") {
      finalString = parents.mothers;
    } else if (parents.mothers === "" && parents.fathers !== "") {
      finalString = parents.fathers;
    } else {
    } */

    return (
      <div id="datacard-alternativename">
        The {relation} of {parents} {divineParents}
      </div>
    );
  }

  getAlternativePage() {
    if (
      this.state.alternativeName.targetID !== "" &&
      this.state.alternativeName.passage !== []
    ) {
      return (
        <div
          id="datacard-alternativename"
          className={
            this.state.alternativeName.targetID === "" ||
            this.state.alternativeName.passage === []
              ? "no-display"
              : ""
          }
        >
          Alternative name for{" "}
          {this.state.alternativeName.targetID === "" ? (
            ""
          ) : (
            <span>
              <span
                className="entity-alt-button"
                onClick={() =>
                  this.handleNameClicked(this.state.alternativeName.targetID)
                }
              >
                {getName(entities[this.state.alternativeName.targetID])}
              </span>
              {this.state.alternativeName.passage.map(passage => {
                return this.getPassageLink(passage);
              })}
            </span>
          )}
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
      let newState = JSON.parse(relationships[id]);
      this.setState({
        id: newState.id,
        relationships: newState.relationships,
        members: newState.members,
        name: newState.name,
        type: newState.type,
        validSearch: newState.validSearch,
        alternativeName: newState.alternativeName
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
      let newState = JSON.parse(relationships[id]);
      this.setState({
        id: newState.id,
        relationships: newState.relationships,
        members: newState.members,
        name: newState.name,
        type: newState.type,
        validSearch: newState.validSearch,
        alternativeName: newState.alternativeName
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
            <div style={{ textAlign: "center" }}>
              {getEntityType(this.state.id)}
            </div>
            <div id="datacard-heading">{this.state.name}</div>
            <div id="datacard-othernames">
              {getAlternativeNames(this.state.id)}
            </div>
            <div id="datacard-mantoID">MANTO ID: {this.state.id}</div>
            <div
              id="datacard-othernames"
              className={getGender(this.state.id) === "" ? "no-display" : ""}
            >
              Gender: {getGender(this.state.id)}
            </div>
            {/* If no data is available for the subject */}
            <div
              className={
                checkNoRelations(this.state.relationships) ? "" : "no-display"
              }
            ></div>
            {/* If current entity is an alternative name for an existing entity */}
            <div>{this.getAlternativePage()}</div>
            {/* If data is available for the subject */}
            {entities[this.state.id]["Type of entity"] ===
            "Collective (genealogical)"
              ? this.getCollectiveSubheading(this.state.id)
              : Object.keys(this.state.relationships).map(key => {
                  if (
                    key === "MOTHERS" ||
                    key === "FATHERS" ||
                    key === "SPOUSES"
                  ) {
                    return <div key={key}>{this.getDataPoints(key, true)}</div>;
                  } else {
                    return (
                      <div key={key}>{this.getDataPoints(key, false)}</div>
                    );
                  }
                })}
            {this.state.members.super.length !== 0 ? (
              <div>{this.getDataPoints("PART OF", true)}</div>
            ) : (
              ""
            )}
            <div>{this.getCollectiveMembers()}</div>
          </div>
        </div>
        <div
          className={
            entities[this.state.id]["Type of entity"] === "Agent"
              ? ""
              : "no-display"
          }
        >
          {/* <EntityGraph
            id={this.state.id}
            relationshipClicked={this.handleNameClicked}
            // disputeClicked={this.handleDisputeClicked}
          ></EntityGraph> */}
        </div>
      </React.Fragment>
    );
  }
}

export default DataCards;
