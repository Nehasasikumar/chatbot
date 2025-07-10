# backend/history_store.py
import json
import os
from datetime import datetime

HISTORY_DIR = "./history"

def get_user_history_file(user_email):
    safe_email = user_email.replace("@", "_at_").replace(".", "_dot_")
    return os.path.join(HISTORY_DIR, f"{safe_email}_history.json")

def save_history(user_email, url, title, summary):
    if not os.path.exists(HISTORY_DIR):
        os.makedirs(HISTORY_DIR)

    user_history_file = get_user_history_file(user_email)

    history = []
    if os.path.exists(user_history_file):
        with open(user_history_file, "r") as f:
            history = json.load(f)

    history.append({
        "id": url,
        "timestamp": datetime.now().isoformat(),
        "url": url,
        "title": title,
        "summary": summary
    })

    with open(user_history_file, "w") as f:
        json.dump(history, f, indent=4)

def get_history(user_email):
    user_history_file = get_user_history_file(user_email)
    if os.path.exists(user_history_file):
        with open(user_history_file, "r") as f:
            return json.load(f)
    return []
