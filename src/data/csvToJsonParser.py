# https://stackoverflow.com/questions/19697846/how-to-convert-csv-file-to-multiline-json

import csv
import json

csvfile = open('./datum.csv', 'r')
jsonfile = open('./datum.json', 'w')

fieldnames = ("nodegoat ID", "Name", "Passage: start", "Passage: start ID", "Passage: end", "Passage: end ID", "Subject", "Subject ID", "Verb", "Verb ID", "Direct Object", "Direct Object ID",
              "Indirect Object (to/for)", "Indirect Object (to/for) ID", "in/on/at", "in/on/at ID", "near ID", "from", "from ID", "to (motion)", "to (motion) ID)", "Uncertainty expressed", "Dispute expressed")
reader = csv.DictReader(csvfile, fieldnames)
for row in reader:
    json.dump(row, jsonfile)
    jsonfile.write('\n')
