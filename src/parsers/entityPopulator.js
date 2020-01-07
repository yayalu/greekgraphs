"use strict";
exports.__esModule = true;
var ties = require("../data/ties.json");
var entities = require("../data/entities.json");
var DataCardHandler_1 = require("../DataCardHandler");
/* Attempting to run JS file from terminal */
var allRelationshipData = {};
Object.values(entities).forEach(function (entity) {
    if (typeof entity !== "object" || entity === null) {
    }
    else {
        // console.log(entity);
        allRelationshipData[entity["ID"]] = JSON.stringify(DataCardHandler_1.updateComponent(entity["ID"]));
    }
});
// console.log(allRelationshipData);
var fs = require("fs");
fs.writeFile("../data/relationships.json", JSON.stringify(allRelationshipData, null, 4), function (err) {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Relationships.json file has been created");
});
