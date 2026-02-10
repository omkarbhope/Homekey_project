"""Load settings from environment."""
import os
from pathlib import Path

# Load .env from project root if present (no extra deps)
_env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.is_file():
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

RENTCAST_API_KEY = os.environ.get("RENTCAST_API_KEY", "")
