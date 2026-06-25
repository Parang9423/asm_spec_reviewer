from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = BASE_DIR / "data"
SPEC_STORE_PATH = DATA_DIR / "spec_store.json"
HISTORY_PATH = DATA_DIR / "history.json"
GENERAL_SPEC_PATH = DATA_DIR / "general_spec.json"
