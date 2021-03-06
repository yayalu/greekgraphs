#!/usr/bin/python
import csv
import json


# ------------------
# Parse Datums file
datumsCsvFilePath = "../data/ties.csv"
datumsJsonFilePath = "../data/ties.json"

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
    print("Parsed ties.csv to ties.json")

# ------------------
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
    print("Parsed passages.csv to passages.json")
    
# ------------------
# Parse Passages file
objectsCsvFilePath = "../data/objects.csv"
objectsJsonFilePath = "../data/objects.json"

# Read from and parse existing passages.csv file
data = {}
with open(objectsCsvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)

    for csvRow in csvReader:
        id = csvRow["\xef\xbb\xbfID"]
        data[id] = csvRow

# Write contents to a JSON file - datum.json
with open(objectsJsonFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(data, indent=4))
    print("Parsed objects.csv to objects.json")

# -------------------
# Parse Entities file
entitiesCsvFilePath = "../data/entities.csv"
entitiesJsonFilePath = "../data/entities.json"

# Read from and parse existing datum.csv file
data = {}
with open(entitiesCsvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)
    for csvRow in csvReader:
        if (csvRow["Type of entity"] == "Agent" or csvRow["Type of entity"] == "Collective (misc.)" or csvRow["Type of entity"] == "Collective (genealogical)" or csvRow["Type of entity"] == "Collective (Episodic)"):
            csvRow["ID"] = csvRow["\xef\xbb\xbfID"]
            csvRow["\xef\xbb\xbfID"] = ""
            if csvRow["ID"] in data:
                data[csvRow["ID"]]["Other collective parent"] = csvRow["Collective (geneal.): children of"]
                data[csvRow["ID"]]["Other collective parent ID"] = csvRow["Collective (geneal.): children of ID"]
            else:
                data[csvRow["ID"]] = csvRow

# Write contents to a JSON file - entities.json
with open(entitiesJsonFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(data, indent=4))
    print("Parsed entities.csv to entities.json")
