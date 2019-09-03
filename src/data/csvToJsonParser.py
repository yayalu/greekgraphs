# https://stackoverflow.com/questions/19697846/how-to-convert-csv-file-to-multiline-json

# import csv
# import json

# csvfile = open('./datum.csv', 'r')
# jsonfile = open('./datum.json', 'w')

# fieldnames = ("nodegoat ID", "Name", "Passage: start", "Passage: start ID", "Passage: end", "Passage: end ID", "Subject", "Subject ID", "Verb", "Verb ID", "Direct Object", "Direct Object ID",
#              "Indirect Object (to/for)", "Indirect Object (to/for) ID", "in/on/at", "in/on/at ID", "near ID", "from", "from ID", "to (motion)", "to (motion) ID)", "Uncertainty expressed", "Dispute expressed")
# reader = csv.DictReader(csvfile, fieldnames)
# for row in reader:
#    json.dump(row, jsonfile)
#    jsonfile.write('\n')


#!/usr/bin/python
import csv
import json

csvFilePath = "./datum.csv"
jsonFilePath = "./datum.json"

# read the csv and add the data to a dictionary

data = {}
with open(csvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)

    flag = 0
    for csvRow in csvReader:
        id = csvRow["\xef\xbb\xbfnodegoat ID"]
        data[id] = csvRow

# write the data toa json file
with open(jsonFilePath, "w") as jsonFile:
    jsonFile.write(json.dumps(data, indent=4))
