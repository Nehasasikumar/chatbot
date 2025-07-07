import json
import os
from datetime import datetime

HISTORY_FILE = "./history/chat_history.json"

def save_history(url, title, summary):
    if not os.path.exists("./history"):
        os.makedirs("./history")

    history = []
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            history = json.load(f)

    history.append({
        "id": url,
        "timestamp": datetime.now().isoformat(),
        "url": url,
        "title": title,
        "summary": summary
    })

    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)

def get_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    return []
