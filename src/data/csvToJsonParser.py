#!/usr/bin/python
import csv
import json

csvFilePath = "./datum.csv"
jsonFilePath = "./datum.json"

# Read from and parse existing datum.csv file
data = {}
with open(csvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)

    for csvRow in csvReader:
        id = csvRow["\xef\xbb\xbfnodegoat ID"]
        data[id] = csvRow

# Write contents to a JSON file - datum.json
with open(jsonFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(data, indent=4))
    print("Parsed datum.csv to datum.json")
