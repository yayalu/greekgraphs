import React from "react";
import "./App.css";
import { getGraph } from "./OldGraphHandler";
import { checkNoRelations, checkNoMembers, getName } from "./DataCardHandler";
import entities from "./data/entities.json";
import passages from "./data/passages.json";
import relationships from "./data/relationships.json";
import * as d3 from "d3";
import dagreD3 from "dagre-d3";

class OldEntityGraph extends React.Component {
  // For Refs, see: https://stackoverflow.com/questions/33796267/how-to-use-refs-in-react-with-typescript
  // For general setup, see: https://stackoverflow.com/questions/32292622/react-component-with-dagre-d3-not-drawing-correctly/32293469#32293469
  // For findDOMNode in Typescript, see: https://stackoverflow.com/questions/32480321/using-react-finddomnode-in-typescript
  // How to use DagreJS https://dagrejs.github.io/project/dagre-d3/latest/demo/interactive-demo.html, https://github.com/dagrejs/graphlib/wiki/API-Reference
  // Zooming: https://jsfiddle.net/xa9rofm5/10/

  constructor(props) {
    super(props);
    this.state = {
      openInfoPage: { showDisputePage: false, showUnusualPage: false },
      edgeType: "",
      targetID: ""
    };
    this.handleClickedNode = this.handleClickedNode.bind(this);
    this.handleClickedEdge = this.handleClickedEdge.bind(this);
  }

  componentDidUpdate() {
    // Return the graph with populated nodes
    if (
      !checkNoRelations(this.props.relationships) ||
      !checkNoMembers(this.props.members)
    ) {
      let g = getGraph(
        1,
        this.props.id,
        this.props.relationships,
        this.props.members
      );

      // Set up an SVG group so that we can translate the final graph.
      let svg = d3.select(this.nodeTree);
      let inner = d3.select(this.nodeTreeGroup);

      // Set up zoom support
      var zoom = d3.zoom().on("zoom", function() {
        inner.attr("transform", d3.event.transform);
      });
      svg.call(zoom);

      // Run the renderer. This is what draws the final graph.
      var render = new dagreD3.render();
      render(inner, g);

      // Center the graph
      var initialScale = 0.3;
      svg.call(
        zoom.transform,
        d3.zoomIdentity
          .translate(
            (svg.attr("viewBox").split(" ")[2] -
              g.graph().width * initialScale) /
              2,
            20
          )
          .scale(initialScale)
      );

      // svg.attr("height", g.graph().height * initialScale + 40);
      svg.attr("height", 500);

      /* Make all entity nodes clickable */
      var nodeSelected = svg.selectAll("g.node");
      nodeSelected.on("click", this.handleClickedNode);

      /* Make disputed edges clickable */
      var disputedEdgeSelected = svg.selectAll("g.edgePath");
      /* .attr("id", function(d) {
          d.split(" ")[0] === "dispute";
        }); */
      // console.log(disputedEdgeSelected);
      // disputedEdgeSelected.on("click", this.handleClickedEdge);

      let that = this;
      disputedEdgeSelected.on("click", function(d, i) {
        if (g.edge(d.v, d.w).id.split(" ")[0] === "disputed") {
          that.handleClickedEdge(d, g.edge(d.v, d.w).id);
        }
      });
    }
  }

  componentWillReceiveProps() {
    this.setState({
      openInfoPage: { showDisputePage: false, showUnusualPage: false }
    });
  }

  handleClickedNode(id) {
    this.props.relationshipClicked(id);
    // Cheat way to fix edges coming up as disputed when not
    document.location.reload(true);
  }

  handleClickedEdge(edge, identifier) {
    // this.props.disputeClicked(edge, id);
    let keywords = identifier.split(" ");
    let targetID = "";
    let edgeType = "";

    if (keywords[0] === "disputed") {
      if (keywords[1] === "mother" || keywords[1] === "father") {
        // if is "disputed mother"
        targetID = edge.w;
        edgeType = keywords[1];
      } else if (keywords[1] === "child") {
        // if is "disputed father"
        targetID = edge.w;
        edgeType = keywords[2];
      }
    }
    // console.log(identifier, getName(entities[targetID]));
    this.setState({
      openInfoPage: { showDisputePage: true, showUnusualPage: false },
      edgeType: edgeType,
      targetID: targetID
    });
  }

  getDisputedInfo(targetID, edgeType) {
    if (targetID && edgeType) {
      let disputedEntities;
      if ((edgeType = "mother")) {
        disputedEntities = JSON.parse(relationships[targetID]).relationships
          .MOTHERS;
      } else if ((edgeType = "father")) {
        disputedEntities = JSON.parse(relationships[targetID]).relationships
          .FATHERS;
      }
      return (
        <div>
          There is an inconsistency between texts.
          <br /> <br />
          {disputedEntities.map(e => {
            return (
              <div style={{ borderTop: "100px" }}>
                <div style={{ color: "red", float: "left" }}>--> </div>
                <div
                  className="entity-button"
                  onClick={() => this.handleClickedNode(e.targetID)}
                >
                  <span style={{ textDecoration: "underline" }}>
                    {e.target}{" "}
                  </span>
                </div>
                is {edgeType} of {getName(entities[targetID])} in{" "}
                {e.passage.map(passage => {
                  return this.getPassageLink(passage);
                })}
              </div>
            );
          })}
        </div>
      );
    } else return "";
  }

  getPassageLink(passage) {
    let id = passage.startID;
    let author = passages[id].Author;
    let title = passages[id].Title;
    let start = passages[id].Passage;
    let end = passage.endID;

    // Dealing with multiple URNs
    let URN = "";
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

  render() {
    return (
      <div
        style={{
          maxWidth: "80%",
          maxHeight: "20rem",
          padding: "1rem 7rem 1rem 7rem",
          textAlign: "center"
        }}
      >
        <h1>Relationship Graph for {getName(entities[this.props.id])}</h1>
        <div style={{ marginBottom: "2rem" }}>
          <h2>Legend:</h2>
          <div style={{ marginBottom: "2rem", marginTop: "2rem" }}>
            {/* <span id="legend-mainnode">Main node</span> */}
            <span id="legend-relationnode">Agent node</span>
            <span id="legend-collectivenode">Collective node</span>
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <span id="legend-relationedge">Genealogical connection</span>
            <span id="legend-disputededge">Disputed tradition</span>
            <span id="legend-unusualedge">Unusual connection</span>
            <span id="legend-memberedge">Member of collective</span>
          </div>
        </div>

        <div>
          {/* Show disputed relationships page */}
          <div
            style={{ textAlign: "left" }}
            className={
              this.state.openInfoPage.showDisputePage
                ? "info-page-border"
                : "no-display"
            }
          >
            <h3>Disputed Tradition </h3>
            {this.getDisputedInfo(this.state.targetID, this.state.edgeType)}
          </div>

          {/* Show unusual relationships page */}
          <div
            className={
              this.state.openInfoPage.showUnusualPage
                ? "info-page-border"
                : "no-display"
            }
          >
            Show unusual page
          </div>
        </div>

        <svg
          id="nodeTree"
          ref={ref => {
            this.nodeTree = ref;
          }}
          // width="80%"
          // height"1000"
          viewBox="0 0 800 500"
          style={{ border: "1px solid black", marginBottom: "2rem" }}
        >
          <g
            ref={r => {
              this.nodeTreeGroup = r;
            }}
          />
        </svg>
      </div>
    );
  }
}

export default OldEntityGraph;
