import React from "react";
import "./App.css";
import Header from "./Header";
import Search from "./Search";
import DataCards from "./DataCards";

const App: React.FC = () => {
  return (
    <React.Fragment>
      <Header></Header>
      <Search></Search>
      <DataCards></DataCards>
    </React.Fragment>
  );
};

export default App;
