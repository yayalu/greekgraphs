#!/usr/bin/python
from enum import Enum
import csv
import json

datumFilePath = "../data/datum.csv"
genderDataFilePath = "../data/genderData.json"

#THEN CONVERT TO JSON USING CSV TO JSON PARSER

genderData = {}

def getGender(row):
    verb = row["Verb"]
    gender = ""
    # if gender has already been assigned for the subject (removes duplicate relationships)
    if row["Subject ID"] == '':
        return 'invalid'
    if (genderData.get(row["Subject ID"]) != None and genderData[row["Subject ID"]].get('gender') != 'undefined'):
        return 'duplicate'
    # if fits primary male attributes
    elif (verb == "is father of" or verb == "is son of" or verb == "is brother of" or verb == "is uncle of" or verb == "is husband of" or verb == "is grandfather of" or verb == "is grandson of"):
        gender = 'male'
    # if fits primary female attributes
    elif (verb == "is mother of" or verb == "is daughter of" or verb == "is sister of" or verb == "is aunt of" or verb == "is wife of" or verb == "is grandmother of" or verb == "is granddaughter of"):
        gender = 'female'
    # if no family attributes discovered in current datum
    else:
        gender = 'undefined'
    return {'name':row["Subject"], 'gender': gender}

with open(datumFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)
    for csvRow in csvReader:
        if getGender(csvRow) != 'duplicate' and getGender(csvRow) != 'invalid' :
            genderData[csvRow["Subject ID"]] = getGender(csvRow)

# Write contents to a JSON file - entities.json
with open(genderDataFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(genderData, indent=4))
    print("Obtained genders and wrote to genderData.json")


#TODO: Convert to JSON in csvToJSONParser.py
