import React from "react";
import "./App.css";
import entities from "./data/entities.json";
import { Redirect } from "react-router-dom";
import arrow from "./images/arrow.svg";
import SelectSearch from "react-select-search";

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

  /* getMatches(oginput: string) {
    // Rudimentary name-exact search algorithm, to update with search-by-subject-ID, as well as mistyping of certain names
    let matches: string[] = [];
    let inputLC = oginput.toLowerCase();
    let input = inputLC.charAt(0).toUpperCase() + inputLC.slice(1);
    Object.values(entities).forEach(entity => {
      if (
        entity["Type of entity"] === "Agent" ||
        entity["Type of entity"] === "Collective"
      ) {
        if (
          entity["Name (Smith & Trzaskoma)"] === input ||
          entity["Name (transliteration)"] === input ||
          entity["Name (Latinized)"] === input ||
          entity["Name in Latin texts"] === input ||
          entity["Alternative names"] === input
        ) {
          matches.push(entity["ID"]);
        }
      }
    });
    return matches;
  } 

  matchCurrentInput = (currentInput: string, item: any) => {
    return item.label.toUpperCase().includes(currentInput.toUpperCase());
  };
  */

  getDescriptors() {
    let descriptorsList: any[] = [];
    for (let id in entities) {
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
          alternatives =
            alternatives + ", " + entities[id]["Alternative names"];
        }
        let inputDesc =
          entities[id]["Name (Smith & Trzaskoma)"] +
          alternatives +
          ": " +
          entities[id]["Identifying information"];
        descriptorsList.push({ value: id, name: inputDesc });
      }
    }
    console.log(descriptorsList);
    return descriptorsList;
  }

  pageRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to={"/datacards?id=" + this.state.targetID} />;
    }
  };

  handleSearch() {
    /* let entities = document.getElementById("input") as HTMLInputElement;
    if (entities.value !== "") {
      this.setState({ redirect: true, targetID: entities.value.split(":")[0] });
    } */
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
          {/* <input
            // type="search"
            placeholder="Search by name"
            id="input"
            list="entities"
            onKeyDown={this.handleSearchKeyDown}
            style={{ width: "50%", textAlign: "center", fontSize: "1rem" }}
          ></input> */}
          <SelectSearch
            options={this.getDescriptors()}
            value="sv"
            name="language"
            placeholder="Search by name"
          />

          {/* Object.values(entities).map(entity => {
              return <option value={this.getDescriptors(entity.ID)}></option>;
            }) */}
          {/* <div>
            <img
              alt="Submit search"
              src={arrow}
              onClick={this.handleSearch}
              className="search-arrow"
          ></img>
          </div> */}
        </div>
      </React.Fragment>
    );
  }
}

export default Search;
