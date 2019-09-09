#!/usr/bin/python
from enum import Enum
import csv
import json


class Gender(Enum):
    FEMALE = 1
    MALE = 2
    UNDEFINED = 3


genderData = {}


def getGender(row):
    verb = row["Verb"]
    # if gender has NOT already been assigned for the subject
    if genderData[row["Subject ID"]].gender != Gender.UNDEFINED:
        return genderData[row["Subject ID"]].gender
    # if fits primary male attributes
    elif (verb == "is father of" or verb == "is son of" or verb == "is brother of" or verb == "is uncle of" or verb == "is husband of" or verb == "is grandfather of" or verb == "is grandson of"):
        return Gender.MALE
    # if fits primary female attributes
    elif (verb == "is mother of" or verb == "is daughter of" or verb == "is sister of" or verb == "is aunt of" or verb == "is wife of" or verb == "is grandmother of" or verb == "is granddaughter of"):
        return Gender.FEMALE
    # if no related familial attributes
    else:
        return Gender.UNDEFINED


csvFilePath = "../data/datum.csv"
jsonFilePath = "../data/genderData.json"

# Read from and parse existing datum.csv file
with open(csvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)

    for csvRow in csvReader:
        # id = csvRow["\xef\xbb\xbfnodegoat ID"]
        # genderData[index] = csvRow
        # index = index+1
        obj = {}
        obj[name] = csvRow["Subject"]
        obj[gender]: getGender(csvRow)
        genderData[csvRow["Subject ID"]] = obj


# Write contents to a JSON file - datum.json
with open(jsonFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(genderData, indent=4))
    print("Parsed gender data to genderData.json")
