import React from "react";
import "./App.css";
import "./Modal.scss";
import Header from "./Header";
import Search from "./Search";
import DataCards from "./DataCards";
import Modal from "react-modal";

import {
  HashRouter as Router,
  Route,
  Link,
  Switch,
  Redirect
} from "react-router-dom";

const customStyles = {
  content: {
    top: "30%",
    left: "35%",
    right: "30%",
    bottom: "0",
    marginRight: "-40%",
    transform: "translate(-30%, -30%)"
  }
};

class App extends React.Component<{}, { subjectID: string; open: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = {
      subjectID: "",
      open: false
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  changeEntity(ID: string) {
    this.setState({ subjectID: ID });
  }

  openModal() {
    this.setState({ open: true });
  }

  closeModal() {
    this.setState({ open: false });
  }

  render() {
    return (
      <div className="homepageBackground" style={{ position: "relative" }}>
        {/* Router links */}
        <Router>
          {/* Modal instructions popup */}
          <div onClick={this.openModal}>
            <div>
              <img
                src={require("./images/help.png")}
                alt="How to use"
                className="help-icon"
                style={{
                  margin: "2rem 0 0 1rem",
                  position: "absolute",
                  height: "30px",
                  width: "auto"
                }}
              ></img>
            </div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                color: "#808080",
                display: "inline",
                margin: "2.3rem 0 0 3.2rem",
                float: "left",
                cursor: "pointer"
              }}
            >
              How to use
            </div>
          </div>
          <Modal
            isOpen={this.state.open}
            onRequestClose={this.closeModal}
            style={customStyles}
            ariaHideApp={false}
            contentLabel="How to use MANTO"
          >
            <div
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={this.closeModal}
            >
              X
            </div>
            <div
              style={{
                paddingBottom: "20px",
                borderBottom: "2px solid #DEDEDE"
              }}
            >
              <h2>How to use the MANTO website:</h2>
            </div>
            <div
              style={{
                paddingBottom: "20px",
                borderBottom: "2px solid #DEDEDE"
              }}
            >
              <h3>Overview of the project:</h3>
              Overview of Project: MANTO (link: manto-myth.org) is an ambitious
              initiative to collect, organize, and visualize the data of Greek
              myth. It is a collaboration between researchers and students at
              the Australian National University, and the University of New
              Hampshire. Our aim is to digitally reproduce all of the myriad
              complex relationships that made up the mythic storyworld in
              ancient texts. This is a work-in-progress. The genealogical tool
              uses just a subset of the available data: entities and ties
              collected from Apollodoros’ Library (link:
              <a
                href="https://en.wikipedia.org/wiki/Bibliotheca_(Pseudo-Apollodorus)"
                target="_blank"
              >
                https://en.wikipedia.org/wiki/Bibliotheca_(Pseudo-Apollodorus)
              </a>
              )(c. 2nd century AD) that express family relationships.
            </div>
            <div
              style={{
                paddingBottom: "20px",
                borderBottom: "2px solid #DEDEDE"
              }}
            >
              <h3>How to use this tool:</h3>
              This genealogical tool is based on the three surviving books of
              Apollodoros’ Library and the fragmentary Epitome of the later
              books. The dataset consists of all mythic characters who appear in
              the work and captures all explicit connections of blood or
              marriage mentioned. The database adopts the spelling conventions
              of Smith and Trzaskoma’s 2007 translation (link:
              <a
                href="https://books.google.com.au/books?id=s8pgDwAAQBAJ&source=gbs_book_other_versions"
                target="_blank"
              >
                https://books.google.com.au/books?id=s8pgDwAAQBAJ&source=gbs_book_other_versions)
              </a>
              . To search it, use ‘c’ rather than ‘k’, ‘ch’ rather than ‘kh’,
              ‘-os’ rather than ‘-us’, ‘ai’ rather than ‘ae’ etc. For ease of
              use, some more familiar names appear also in Latinized or
              Anglicized form (e.g. ‘Helen’, ‘Priam’, ‘Achilles’, ‘Medusa’).
            </div>
            <div
              style={{
                paddingBottom: "20px",
                borderBottom: "2px solid #DEDEDE"
              }}
            >
              <h3>
                <img
                  src={require("./images/autochthony.png")}
                  alt="autochthony"
                  style={{ maxWidth: "2%", height: "auto" }}
                ></img>{" "}
                Autochthony
              </h3>
              Local heroes are sometimes said to have sprung up out of the
              ground. These stories often strengthen a community’s claim to long
              and uncontested ownership of a territory.{" "}
              <span style={{ fontStyle: "italic", color: "#808080" }}>
                Example: Cecrops, Pelasgos, Orion are born by autochthony
              </span>
            </div>
            <div
              style={{
                paddingBottom: "20px",
                borderBottom: "2px solid #DEDEDE"
              }}
            >
              <h3>
                <img
                  src={require("./images/createdWithoutParents.png")}
                  alt="created without parents"
                  style={{ maxWidth: "2%", height: "auto" }}
                ></img>{" "}
                Created Without Parents
              </h3>
              At the very beginnings of mythical time, some primeval gods –
              often personifications of basic elemental forces – are said to
              have simply come into being.{" "}
              <span style={{ fontStyle: "italic", color: "#808080" }}>
                Example: Ge is created without parents
              </span>
            </div>
            <div
              style={{
                paddingBottom: "20px",
                borderBottom: "2px solid #DEDEDE"
              }}
            >
              <h3>
                <img
                  src={require("./images/createdByAgent.png")}
                  alt="created by agent"
                  style={{ maxWidth: "2%", height: "auto" }}
                ></img>{" "}
                Created By Someone Else
              </h3>
              Gods – and some notable heroes – are said to have created mortals.{" "}
              <span style={{ fontStyle: "italic", color: "#808080" }}>
                Example: Pandora is created by Hephaistos
              </span>
            </div>
            <div
              style={{
                paddingBottom: "20px",
                borderBottom: "2px solid #DEDEDE"
              }}
            >
              <h3>
                <img
                  src={require("./images/bornFromObject.png")}
                  alt="born from an object"
                  style={{ maxWidth: "2%", height: "auto" }}
                ></img>{" "}
                Born from an Object
              </h3>
              Some gods and heroes were said to have been born in strange ways,
              including from eggs, and from a body part of one of their parents.{" "}
              <span style={{ fontStyle: "italic", color: "#808080" }}>
                Example: Athena is born from the Head of Zeus, Pegasos is born
                from the Head of Medousa
              </span>
            </div>
            <div
              style={{
                paddingBottom: "20px",
                borderBottom: "2px solid #DEDEDE"
              }}
            >
              <h3>
                <img
                  src={require("./images/parthenogenesis.png")}
                  alt="parthenogenesis"
                  style={{ maxWidth: "1%", height: "auto" }}
                ></img>{" "}
                Parthenogenesis
              </h3>
              Some goddesses are said to have given birth to children without
              having had sex. As a result, the offspring do not have fathers.{" "}
              <span style={{ fontStyle: "italic", color: "#808080" }}>
                Example: Hephaistos is the son of Hera by parthenogenesis
              </span>
            </div>
            <div>
              <h3>Contested parentage</h3>
              Contestation is an inherent part of Greek myth. Because the
              ancient mythic tradition was tolerant of plurality, there were
              frequently several variant traditions about who the parents of a
              god or hero were.
            </div>
          </Modal>
          {/* <div style={{ marginLeft: "3rem" }}>
            How to use the search tool:
            <ol>
              <li>Type the name of the entity requested in the field. </li>
              <li>Click the entity that matches the request</li>
              <li>
                Press enter or click the arrow on the right of the search bar
              </li>
            </ol>
            For information on how to use the data cards themselves, see this
            page
          </div> */}
          <div style={{ paddingTop: "4rem", textAlign: "center" }}>
            <Link to="/">
              <Header></Header>
            </Link>
          </div>

          <Search></Search>

          <Switch>
            {/* <Route exact path="/" component={Home} /> */}
            <Route path="/search" component={Search} />
            <Route path="/datacards" component={DataCards} />
            <Route component={() => <Redirect to="/" />} />
          </Switch>
          <div style={{ textAlign: "center" }}></div>
        </Router>
      </div>
    );
  }
}

export default App;
