var ties = require("../data/ties.json");
var entities = require("../data/entities.json");
import { updateComponent, getName } from "../DataCardHandler";

/* Attempting to run JS file from terminal */
let allRelationshipData = {};
Object.values(entities).forEach(function(entity) {
  if (typeof entity !== "object" || entity === null) {
  } else {
    // console.log(entity);
    allRelationshipData[entity["ID"]] = JSON.stringify(
      updateComponent(entity["ID"])
    );
  }
});
// console.log(allRelationshipData);

var fs = require("fs");
fs.writeFile(
  "../data/relationships.json",
  JSON.stringify(allRelationshipData, null, 4),
  err => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Relationships.json file has been created");
  }
);
