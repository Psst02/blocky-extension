import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

data_file = BASE_DIR.parent / "data" / "custom_ads.txt"
output_file = BASE_DIR.parent / "rulesets" / "ads.json"

with open(data_file, 'r') as file:
    lines = [line.strip() for line in file if line.strip()]

rules = []
for i, domain in enumerate(lines, start=1):
    rules.append({
        "id": i,
        "priority": 1,
        "action": {"type": "block"},
        "condition": {"urlFilter": domain}
    })

with open(output_file, "w") as out:
    json.dump(rules, out, indent=2)