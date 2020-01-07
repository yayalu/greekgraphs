#!/bin/bash

#Parsing csv to json
./csvToJsonParser.py

#Populate relationships json
tsc relationshipPopulator.ts
node relationshipPopulator
rm relationshipPopulator.js
rm ../DataCardHandler.js
