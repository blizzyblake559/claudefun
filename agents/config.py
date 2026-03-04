"""Shared configuration for research agents."""

import os
from pathlib import Path

# Output directories
OUTPUT_DIR = Path(os.environ.get("AGENTS_OUTPUT_DIR", "output"))
RESEARCH_DIR = OUTPUT_DIR / "research"
IMAGES_DIR = OUTPUT_DIR / "images"
PROMPTS_DIR = OUTPUT_DIR / "prompts"

# Target brands to research
BRANDS = {
    "palantir": {
        "name": "Palantir Technologies",
        "domain": "palantir.com",
        "focus": [
            "defense technology",
            "data analytics",
            "government intelligence",
            "enterprise AI platforms",
        ],
        "known_products": ["Gotham", "Foundry", "Apollo", "AIP"],
    },
    "anduril": {
        "name": "Anduril Industries",
        "domain": "anduril.com",
        "focus": [
            "defense technology",
            "autonomous systems",
            "border security",
            "counter-drone",
        ],
        "known_products": ["Lattice", "Ghost", "Anvil", "Sentry Tower", "Menace"],
    },
}


def ensure_output_dirs():
    """Create all output directories if they don't exist."""
    for d in [OUTPUT_DIR, RESEARCH_DIR, IMAGES_DIR, PROMPTS_DIR]:
        d.mkdir(parents=True, exist_ok=True)
