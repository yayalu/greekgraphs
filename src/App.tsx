import React from "react";
import "./App.css";
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

class App extends React.Component<{}, {}> {
  constructor(props: any) {
    super(props);
    this.state = {
      subjectID: ""
    };
  }

  changeEntity(ID: string) {
    this.setState({ subjectID: ID });
  }

  initializeReactGA() {
    ReactGA.initialize("UA-151993194-1");
    ReactGA.pageview("/homepage");
  }

  render() {
    return (
      <div
        style={{ backgroundColor: "#eeeeee", height: "100%", width: "100%" }}
      >
        <Router>
          <Link to="/">
            <Header></Header>
          </Link>
          <Search></Search>
          <Switch>
            {/* <Route exact path="/" component={Home} /> */}
            <Route path="/search" component={Search} />
            <Route path="/datacards" component={DataCards} />
            <Route component={() => <Redirect to="/" />} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
