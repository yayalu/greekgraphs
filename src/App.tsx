import React from "react";
import "./App.css";
import "./Modal.scss";
import Header from "./Header";
import Search from "./Search";
import DataCards from "./DataCards";
import ReactGA from "react-ga";
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
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
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
        {/* Modal instructions popup */}
        {/*  */}
        <div>
          {/* <img
            src={require("./images/help.png")}
            alt="How to use"
            className="help-icon"
            style={{
              margin: "2rem 0 0 1rem",
              position: "absolute"
            }}
            onClick={this.openModal}
          ></img> */}
          <button onClick={this.openModal}>How to use</button>

          <Modal
            isOpen={this.state.open}
            onRequestClose={this.closeModal}
            style={customStyles}
            ariaHideApp={false}
            contentLabel="How to use MANTO"
          >
            <h2>Hello</h2>
            <button onClick={this.closeModal}>close</button>
            <div>I am a modal</div>
            <form>
              <input />
              <button>tab navigation</button>
              <button>stays</button>
              <button>inside</button>
              <button>the modal</button>
            </form>
          </Modal>
        </div>
        {/* Router links */}
        <Router>
          <div style={{ paddingTop: "4rem", textAlign: "center" }}>
            <Link to="/">
              <Header></Header>
            </Link>
          </div>

          <Search></Search>
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
