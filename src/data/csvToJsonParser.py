#!/usr/bin/python
import csv
import json

csvFilePath = "./datum.csv"
jsonFilePath = "./datum.json"

# Read from and parse existing datum.csv file
data = {}
with open(csvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)
    index = 1;

    for csvRow in csvReader:
        # id = csvRow["\xef\xbb\xbfnodegoat ID"]
        data[index] = csvRow
        index = index+1

# Write contents to a JSON file - datum.json
with open(jsonFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(data, indent=4))
    print("Parsed datum.csv to datum.json")
