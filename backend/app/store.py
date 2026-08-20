"""
Shared in-memory data store.

Loads vendors, locations, and reports from the /data directory at startup.
Mutations (e.g. adding reports, updating vendor signals) happen in-memory
so that risk scores update live during the demo session.
"""

import json
import os
from typing import List, Dict, Any

# Resolve the /data directory relative to the project root
_DATA_DIR = os.path.join(
    os.path.dirname(__file__),  # backend/app/
    "..", "..",                 # up to project root (Prototype)
    "data"
)
_DATA_DIR = os.path.normpath(_DATA_DIR)


def _load(filename: str) -> List[Dict[str, Any]]:
    path = os.path.join(_DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# In-memory state — mutated at runtime
vendors: List[Dict[str, Any]] = _load("vendors.json")
locations: List[Dict[str, Any]] = _load("locations.json")
reports: List[Dict[str, Any]] = []  # Start fresh each session
