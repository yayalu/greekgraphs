import React from "react";
import "./App.css";
import entities from "./data/entities.json";
import { Redirect } from "react-router-dom";
import arrow from "./images/arrow.svg";
import ReactGA from "react-ga";

type SearchProps = {};
type SearchState = {
  redirect: boolean;
  targetID: string;
};

class Search extends React.Component<SearchProps, SearchState> {
  constructor(props: any) {
    super(props);
    this.state = {
      redirect: false,
      targetID: ""
    };
    // this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSearchKeyDown = this.handleSearchKeyDown.bind(this);
    this.getDescriptors = this.getDescriptors.bind(this);
  }

  getDescriptors(id: string) {
    if (this.hasKey(entities, id)) {
      let alternatives: string = "";
      if (entities[id]["Name (transliteration)"] !== "") {
        alternatives =
          alternatives + ", " + entities[id]["Name (transliteration)"];
      }
      if (entities[id]["Name (Latinized)"] !== "") {
        alternatives = alternatives + ", " + entities[id]["Name (Latinized)"];
      }
      if (entities[id]["Name in Latin texts"] !== "") {
        alternatives =
          alternatives + ", " + entities[id]["Name in Latin texts"];
      }
      if (entities[id]["Alternative names"] !== "") {
        alternatives = alternatives + ", " + entities[id]["Alternative names"];
      }
      let inputText =
        entities[id]["Name (Smith & Trzaskoma)"] +
        alternatives +
        ": " +
        entities[id]["Identifying information"];
      return inputText;
    }
  }

  pageRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to={"/datacards?id=" + this.state.targetID} />;
    }
  };

  handleSearch() {
    ReactGA.event({
      category: "Search",
      action: "User searched for an entity using the search bar"
    });
    let currentInput = document.getElementById("input") as HTMLInputElement;
    if (currentInput.value !== "") {
      //Search based on name and identifying information - super inefficient. TODO: fix this
      for (let id in entities) {
        if (this.hasKey(entities, id)) {
          if (
            entities[id]["Identifying information"] ===
            currentInput.value.split(": ")[1]
          ) {
            let currentInputName = currentInput.value
              .split(": ")[0]
              .split(",")[0]
              .trim();

            if (
              currentInputName === entities[id]["Name (Smith & Trzaskoma)"] ||
              currentInputName === entities[id]["Name (transliteration)"] ||
              currentInputName === entities[id]["Name (Latinized)"] ||
              currentInputName === entities[id]["Name in Latin texts"] ||
              currentInputName === entities[id]["Alternative names"]
            ) {
              this.setState({
                redirect: true,
                targetID: id
              });
            }
          }
        }
      }
    }
  }

  handleSearchKeyDown(event: any) {
    if (event.which === 13 || event.keyCode === 13) {
      this.handleSearch();
    }
  }

  /* Addresses typescript indexing objects error */
  hasKey<O>(obj: O, key: keyof any): key is keyof O {
    return key in obj;
  }

  render() {
    /* const entitiesArray = Object.values(entities).map(entity => {
      return {
        // what to show to the user
        label: entity.ID + ": " + this.getDescriptors(entity.ID),
        // key to identify the item within the array
        key: entity.ID
      };
    }); */
    return (
      <React.Fragment>
        {/* <h3 style={{ textAlign: "center" }}>SEARCH</h3> */}
        {this.pageRedirect()}
        <div
          style={{
            margin: "1rem 0 1rem 0",
            textAlign: "center"
          }}
        >
          {/* <DataListInput
          placeholder={"Search by entity name..."}
          items={entitiesArray}
          onSelect={this.pageRedirect}
          match={this.matchCurrentInput}
        /> */}
          <input
            // type="search"
            placeholder="Search by name"
            id="input"
            list="entities"
            onKeyDown={this.handleSearchKeyDown}
            style={{ width: "50%", textAlign: "center", fontSize: "1rem" }}
          ></input>
          <datalist id="entities" style={{ maxHeight: "100px" }}>
            {Object.values(entities).map(entity => {
              return (
                <option value={this.getDescriptors(entity["ID"])}></option>
              );
            })}
          </datalist>
          <div>
            <img
              alt="Submit search"
              src={arrow}
              onClick={this.handleSearch}
              className="search-arrow"
            ></img>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Search;
