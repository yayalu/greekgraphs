import React from "react";
import "./App.css";
import entities from "./data/entities.json";

type SearchProps = {};
type SearchState = {
  searchInput: string;
};

class Search extends React.Component<SearchProps, SearchState> {
  constructor(props: any) {
    super(props);
    this.state = {
      searchInput: ""
    };
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  getMatches(input: string) {
    // Rudimentary name-exact search algorithm, to update with search-by-subject-ID, as well as mistyping of certain names
    let matches: string[] = [];
    Object.values(entities).forEach(entity => {
      if (
        entity["Name (Smith & Trzaskoma)"] === input ||
        entity["Name (transliteration)"] === input ||
        entity["Name (Latinized)"] === input ||
        entity["Name in Latin texts"] === input ||
        entity["Alternative names"] === input
      ) {
        matches.push(entity["ID"]);
      }
    });
    return matches;
  }

  onSearchSubmit(event: any) {
    if (event.keyCode == 13) {
      this.setState({ searchInput: event.target.value });
    }
  }

  /* Addresses typescript indexing objects error */
  hasKey<O>(obj: O, key: keyof any): key is keyof O {
    return key in obj;
  }

  render() {
    return (
      <div style={{ margin: "1rem 0 0 6rem" }}>
        <input
          type="search"
          placeholder="Search by name"
          onKeyDown={this.onSearchSubmit}
        ></input>
        <div>
          {" "}
          {this.state.searchInput === ""
            ? ""
            : this.getMatches(this.state.searchInput).map((key, value) => {
                return (
                  <div>
                    {this.hasKey(entities, key) ? entities[key]["Name"] : ""}
                  </div>
                );
              })}
        </div>
      </div>

      /* class="dropdown">
        <button onclick="myFunction()" class="dropbtn">
          Dropdown
        </button>
        <div id="myDropdown" class="dropdown-content">
          <input
            type="text"
            placeholder="Search.."
            id="myInput"
            onkeyup="filterFunction()"
          />
          <a href="#about">About</a>
          <a href="#base">Base</a>
          <a href="#blog">Blog</a>
          <a href="#contact">Contact</a>
          <a href="#custom">Custom</a>
          <a href="#support">Support</a>
          <a href="#tools">Tools</a>
        </div>
      </div>*/
    );
  }
}

export default Search;
