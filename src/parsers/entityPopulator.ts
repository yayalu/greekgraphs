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
