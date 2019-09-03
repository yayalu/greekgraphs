import React from "react";
import "./App.css";
import datum from "./data/datum.json";

type DatumProps = {};
type DatumState = {};

let familyDatums = [
  "is father of",
  "is mother of",
  "is parent of",
  "is child of",
  "is son of",
  "is daughter of",
  "is sister of",
  "is brother of",
  "is twin of",
  "is aunt of",
  "is uncle of",
  "is wife of",
  "is husband of",
  "is grandfather of",
  "is grandmother of",
  "is grandparent of",
  "is grandson of",
  "is granddaughter of",
  "is grandchild of"
];

class Relationships extends React.Component<DatumProps, DatumState> {
  constructor(props: DatumProps) {
    super(props);
    this.getRelationships = this.getRelationships.bind(this);
  }

  getRelationships(name: string) {
    var connections: { verb: string; directObj: string }[] = [];
    Object.values(datum).forEach(function(datumRow) {
      if (
        datumRow.Subject.trim() === name &&
        familyDatums.includes(datumRow.Verb)
      ) {
        connections.push({
          verb: datumRow.Verb,
          directObj: datumRow["Direct Object"]
        });
      }
    });
    return connections;
  }

  render() {
    return <div>Test{console.log(this.getRelationships("Phaia"))}</div>;
  }
}

export default Relationships;
