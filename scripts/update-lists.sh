#!/bin/bash

echo "Updating filter lists..."

curl -L https://easylist.to/easylist/easylist.txt -o data/easylist.txt
curl -L https://easylist.to/easylist/easyprivacy.txt -o data/easyprivacy.txt
curl -L https://secure.fanboy.co.nz/fanboy-annoyance.txt -o data/annoyance.txt

echo "Converting to Chrome rulesets..."

npx @eyeo/abp2dnr < data/easylist.txt > src/rulesets/ads.json
npx @eyeo/abp2dnr < data/easyprivacy.txt > src/rulesets/trackers.json
npx @eyeo/abp2dnr < data/annoyance.txt > src/rulesets/annoyances.json

echo "Done! Rulesets updated."
