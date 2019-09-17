#!/usr/bin/python
from enum import Enum
import csv
import json

datumFilePath = "../data/datum.csv"
entitiesFilePath = "../data/entities.csv"
genderDataFilePath = "../data/genderData.json"

#THEN CONVERT TO JSON USING CSV TO JSON PARSER

genderData = {}

def getGender(entityRow):
    # Really inefficient temporary parsing solution.
    # Go through the datum file and find every match to the subject ID or direct object ID.
    # Use this to infer the gender
    gender = "undefined"
    with open(datumFilePath) as datumFile:
        csvReader = csv.DictReader(datumFile)
        for csvRow in csvReader:
            if csvRow["Subject ID"] == entityRow["ID"]:
                verb = csvRow["Verb"]
                # if fits primary male attributes
                if (verb == "is father of" or verb == "is son of" or verb == "is brother of" or verb == "is uncle of" or verb == "is husband of" or verb == "is grandfather of" or verb == "is grandson of"):
                    gender = 'male'
                    break
                # if fits primary female attributes
                elif (verb == "is mother of" or verb == "is daughter of" or verb == "is sister of" or verb == "is aunt of" or verb == "is wife of" or verb == "is grandmother of" or verb == "is granddaughter of"):
                    gender = 'female'
                    break
    return {'name':entityRow["Name"], 'gender': gender}

with open(entitiesFilePath) as entitiesFile:
    csvReader = csv.DictReader(entitiesFile)
    for csvRow in csvReader:
        genderData[csvRow["ID"]] = getGender(csvRow)


# Write contents to a JSON file - entities.json
with open(genderDataFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(genderData, indent=4))
    print("Parsed genders and wrote to genderData.json")


#TODO: Convert to JSON in csvToJSONParser.py
