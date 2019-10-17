#!/usr/bin/python
import csv
import json


#------------------
# Parse Datums file
datumsCsvFilePath = "../data/datum.csv"
datumsJsonFilePath = "../data/datum.json"

# Read from and parse existing datum.csv file
data = {}
with open(datumsCsvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)
    index = 1

    for csvRow in csvReader:
        # id = csvRow["\xef\xbb\xbfnodegoat ID"]
        data[index] = csvRow
        index = index+1

# Write contents to a JSON file - datum.json
with open(datumsJsonFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(data, indent=4))
    print("Parsed datum.csv to datum.json")

#-------------------
# Parse Gender file
genderDataCsvFilePath = "../data/genderData-new.csv"
genderDataJsonFilePath = "../data/genderData.json"

# Read from and parse existing genderData.csv file
data = {}
with open(genderDataCsvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)
    for csvRow in csvReader:
        data[csvRow["\xef\xbb\xbfID"]] = {"gender": csvRow["gender"], "name": csvRow["name"]}

# Write contents to a JSON file - genderData.json
with open(genderDataJsonFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(data, indent=4))
    print("Parsed genderData.csv to genderData.json")



#------------------
# Parse Passages file
passagesCsvFilePath = "../data/passages.csv"
passagesJsonFilePath = "../data/passages.json"

# Read from and parse existing datum.csv file
data = {}
with open(passagesCsvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)
    
    for csvRow in csvReader:
        id = csvRow["\xef\xbb\xbfID"]
        data[id] = csvRow

# Write contents to a JSON file - datum.json
with open(passagesJsonFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(data, indent=4))
    print("Parsed passages.csv to passages.csv")


