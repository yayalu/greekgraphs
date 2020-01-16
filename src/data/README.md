
# Datum Parser

## Converting existing CSV to JSON

1. When new data is added, rename the following files:
    - Rename and convert the ties data to  ``` ties.csv ``` 
    - Rename and convert the entities data to  ``` entities.csv ``` 
    - Rename and convert the passages data to  ``` passages.csv ``` 
2. Drag all three files into this folder
3. Run ``` python csvToJsonParser.py ``` or ``` ./csvToJsonParser.py ```
4. The contents of the ties csv file will now be in JSON format in ``` ./ties.json``` and  the contents of the entities file will now be in ```./entities.json```

## Storing found relationship data in a JSON file

1. Navigate to the parsers folder
2. Compile using  ```tsc relationshipPopulator.ts```
3. Run  ```node relationshipPopulator```
4. Remove unnecessary JS files for clarity 
    - ```rm relationshipPopulator.js```
    - ```rm ../DataCardHandler.js```
    
## Run both
1. Navigate to the parsers folder
2. Run ```./datascripts.sh```


## Logic reversals of datums
See ``` ../../Documentation/Research/Logic reversals ```
