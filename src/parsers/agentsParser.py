#!/usr/bin/python
import csv
import json

#-------------------
# Parse Entities file
entitiesCsvFilePath = "../data/entities.csv"
entitiesJsonFilePath = "../data/entities.json"

# Read from and parse existing datum.csv file
data = {}
with open(entitiesCsvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)
    for csvRow in csvReader:
        if (csvRow["Type of entity"] == "Agent" or csvRow["Type of entity"] == "Collective"):
            data[csvRow["ID"]] = csvRow

# Write contents to a JSON file - entities.json
with open(entitiesJsonFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(data, indent=4))
    print("Parsed entities.csv to entities.json")

