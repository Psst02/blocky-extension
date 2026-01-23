#!/bin/bash

echo "Updating filter lists..."

curl -L https://easylist.to/easylist/easylist.txt -o data/easylist.txt
curl -L https://easylist.to/easylist/easyprivacy.txt -o data/easyprivacy.txt
curl -L https://secure.fanboy.co.nz/fanboy-annoyance.txt -o data/annoyance.txt

curl -L https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt -o data/badware.txt
curl -L https://raw.githubusercontent.com/Spam404/lists/master/main-blacklist.txt -o data/spamlist.txt

echo "Converting to Chrome rulesets..."

npx @eyeo/abp2dnr < data/easylist.txt > src/rulesets/ads.json
npx @eyeo/abp2dnr < data/easyprivacy.txt > src/rulesets/trackers.json
npx @eyeo/abp2dnr < data/annoyance.txt > src/rulesets/annoyances.json

npx @eyeo/abp2dnr < data/badware.txt > src/rulesets/redirects.json
npx @eyeo/abp2dnr < data/spamlist.txt > src/rulesets/redirects.json

echo "Done! Rulesets updated."
