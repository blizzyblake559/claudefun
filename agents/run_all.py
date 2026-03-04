#!/usr/bin/env python3
"""
Run All Research Agents
=======================

Orchestrates all three agents in sequence:
  1. Style Research Agent   → brand voice, tone, visual identity reports
  2. Image Reference Agent  → curated image catalogs and mood boards
  3. Prompt Writer Agent    → LLM prompts and JSON creative profiles

Usage:
    python -m agents.run_all [--brand palantir|anduril|both]
"""

import argparse
import sys
from pathlib import Path

from .config import BRANDS, ensure_output_dirs
from . import style_research_agent
from . import image_reference_agent
from . import prompt_writer_agent


def run(brands: list[str]):
    """Run all agents in sequence."""
    ensure_output_dirs()

    print("=" * 60)
    print("  RESEARCH AGENT PIPELINE")
    print("=" * 60)

    print("\n[1/3] Running Style Research Agent...")
    style_results = style_research_agent.run(brands)

    print("\n[2/3] Running Image Reference Agent...")
    image_results = image_reference_agent.run(brands)

    print("\n[3/3] Running Prompt Writer Agent...")
    prompt_results = prompt_writer_agent.run(brands)

    print("\n" + "=" * 60)
    print("  COMPLETE — All outputs written to output/")
    print("=" * 60)
    print("\nOutput structure:")
    print("  output/")
    print("  ├── research/       # Style reports + raw profiles")
    print("  ├── images/         # Mood boards + image catalogs")
    print("  └── prompts/        # LLM prompts + JSON profiles")
    print()

    return {
        "style": style_results,
        "images": image_results,
        "prompts": prompt_results,
    }


def main():
    parser = argparse.ArgumentParser(description="Run all research agents")
    parser.add_argument(
        "--brand",
        choices=["palantir", "anduril", "both"],
        default="both",
        help="Which brand(s) to research (default: both)",
    )
    args = parser.parse_args()

    brands = list(BRANDS.keys()) if args.brand == "both" else [args.brand]
    run(brands)


if __name__ == "__main__":
    main()
