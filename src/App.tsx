import React from "react";
import "./App.css";
import Header from "./Header";
import Search from "./Search";
import DataCards from "./DataCards";

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

  render() {
    return (
      <React.Fragment>
        <Header></Header>
        {/*<Search targetID={this.changeEntity}></Search> */}
        <DataCards subjectID=""></DataCards>
      </React.Fragment>
    );
  }
}

export default App;
