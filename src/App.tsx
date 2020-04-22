import React from "react";
import "./App.css";
import "./Modal.scss";
import Header from "./Header";
import Search from "./Search";
import DataCards from "./DataCards";
import ReactGA from "react-ga";

import {
  HashRouter as Router,
  Route,
  Link,
  Switch,
  Redirect
} from "react-router-dom";

class App extends React.Component<{}, { subjectID: string; show: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = {
      subjectID: "",
      show: false
    };
  }

  changeEntity(ID: string) {
    this.setState({ subjectID: ID });
  }

  toggleModalState() {
    if (this.state.show) {
      this.setState({ show: false });
    } else {
      this.setState({
        show: true
      });
    }
  }

  initializeReactGA() {
    ReactGA.initialize("UA-151993194-1");
    ReactGA.pageview("/homepage");
  }

  render() {
    return (
      <div className="homepageBackground">
        {/* Modal instructions popup */}
        <div
          style={{ margin: "2rem 0 0 1rem" }}
          onClick={() => this.toggleModalState()}
        >
          <img
            src={require("./images/help.png")}
            alt="How to use"
            className="help-icon"
          ></img>
        </div>
        <div className={this.state.show ? "modal-body" : "no-display"}>
          <div>Testing me</div>
          <div>
            <button onClick={() => this.toggleModalState()}>Close</button>
          </div>
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
