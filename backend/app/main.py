from fastapi import FastAPI
import json
import os

app = FastAPI()

# Загружаем данные из JSON
DATA_PATH = os.path.join(os.path.dirname(__file__), "data.json")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    db = json.load(f)

@app.get("/api/regions")
def get_regions():
    return db.get("regions", {})

@app.get("/api/scenarios/{group}/{scenario}")
def get_scenario(group: str, scenario: str):
    # group: fuel | coverage | rating
    return db.get("scenarios", {}).get(group, {}).get(scenario, {})