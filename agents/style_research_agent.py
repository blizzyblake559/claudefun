#!/usr/bin/env python3
"""
Style Research Agent
====================

Researches Palantir and Anduril's copywriting voice, marketing imagery
style, and visual identity so you can apply the same patterns to your
own work.

Usage:
    python -m agents.style_research_agent [--brand palantir|anduril|both] [--output-dir DIR]

Outputs a structured Markdown report per brand covering:
  - Copywriting voice & tone
  - Headline / tagline patterns
  - Visual and imagery style
  - Color palette & typography cues
  - Key themes and messaging pillars
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

from .config import BRANDS, RESEARCH_DIR, ensure_output_dirs


# ---------------------------------------------------------------------------
# Brand style knowledge bases (curated research)
# ---------------------------------------------------------------------------

STYLE_PROFILES = {
    "palantir": {
        "voice_and_tone": {
            "register": "authoritative, understated, technically confident",
            "personality": [
                "Speaks like a senior intelligence analyst briefing a room of decision-makers",
                "Avoids hype — lets capability speak for itself",
                "Uses precise, clinical language over emotional appeals",
                "Conveys quiet urgency: the stakes are real, the solution exists",
            ],
            "sentence_style": [
                "Short declarative sentences — 'We build software that works.'",
                "Sparse use of adjectives; relies on strong nouns and verbs",
                "Often opens with a problem statement, then pivots to capability",
                "Minimal exclamation marks; confidence needs no volume",
            ],
        },
        "headline_patterns": {
            "structure": [
                "Problem → Capability: 'The world's hardest problems deserve the best software.'",
                "Declarative authority: 'Software that saves lives.'",
                "Mission framing: 'Built for the most important institutions in the world.'",
                "Understated scale: 'From data to decisions.'",
            ],
            "recurring_phrases": [
                "the world's most important",
                "from [X] to [Y]",
                "built for",
                "at scale",
                "real-world impact",
            ],
        },
        "visual_style": {
            "imagery": [
                "Dark, moody environments — command centers, night ops, cityscapes at dusk",
                "Screen-glow aesthetic: faces lit by monitors in dim rooms",
                "Satellite / aerial views showing scale and surveillance perspective",
                "Clean product UI screenshots on dark backgrounds with subtle depth",
                "Abstract data-flow visualizations — graphs, networks, node diagrams",
            ],
            "color_palette": {
                "primary": "#101010 (near-black)",
                "secondary": "#1A1A2E (dark navy)",
                "accent": "#00D4FF (electric cyan/teal)",
                "supporting": ["#FFFFFF", "#8B8B8B", "#2D2D2D"],
                "mood": "Dark mode dominant. High contrast text on dark backgrounds.",
            },
            "typography": {
                "headlines": "Clean sans-serif, medium weight, generous letter-spacing",
                "body": "Light-weight sans-serif, high readability on dark backgrounds",
                "style_notes": "Minimal use of bold. Hierarchy through size and spacing, not weight.",
            },
            "photography_direction": [
                "Low-key lighting, desaturated color grading",
                "Shallow depth of field on human subjects",
                "Wide establishing shots for scale, tight shots for human element",
                "Technology shown in-context — real operators, real environments",
            ],
        },
        "messaging_pillars": [
            "Mission-driven technology for institutions that protect the West",
            "Software that integrates messy, real-world data into actionable intelligence",
            "Human-on-the-loop: AI augments operators, never replaces judgment",
            "Proven at scale in the most demanding operational environments",
        ],
        "themes": [
            "Defending the West / liberal democracies",
            "Data integration and ontology",
            "Operational readiness",
            "Decisive advantage through software",
        ],
    },
    "anduril": {
        "voice_and_tone": {
            "register": "bold, insurgent, Silicon Valley meets defense",
            "personality": [
                "Speaks like a founder disrupting a broken industry",
                "More aggressive and forward-leaning than legacy defense companies",
                "Balances startup energy with military gravitas",
                "Not afraid to be provocative — 'Defense should work like tech.'",
            ],
            "sentence_style": [
                "Punchy, energetic headlines — fewer words, more impact",
                "Uses future-tense framing: 'The future of defense is autonomous.'",
                "Contrasts old vs. new: broken procurement vs. rapid innovation",
                "Occasional use of imperatives: 'See the battlefield. Own the edge.'",
            ],
        },
        "headline_patterns": {
            "structure": [
                "Bold declarations: 'Transforming defense capability.'",
                "Future-state framing: 'The arsenal of the future.'",
                "Product-as-hero: 'Lattice: Command and control for the modern battlefield.'",
                "Challenge framing: 'Defense acquisition is broken. We're fixing it.'",
            ],
            "recurring_phrases": [
                "the future of",
                "autonomous",
                "at the edge",
                "real-time",
                "mission-ready",
                "next-generation",
            ],
        },
        "visual_style": {
            "imagery": [
                "Hardware beauty shots — drones, towers, autonomous vehicles in dramatic landscapes",
                "Desert, ocean, and sky environments — vast, cinematic scale",
                "Product renders with dramatic lighting on dark or gradient backgrounds",
                "Action shots: products deployed in realistic field conditions",
                "Cinematic 16:9 compositions, often with strong horizon lines",
            ],
            "color_palette": {
                "primary": "#0A0A0A (black)",
                "secondary": "#1B1B1B (charcoal)",
                "accent": "#FF4500 (Anduril orange-red)",
                "supporting": ["#FFFFFF", "#C0C0C0", "#2A2A2A"],
                "mood": "Dark, cinematic. Orange-red accents create energy and urgency.",
            },
            "typography": {
                "headlines": "Bold geometric sans-serif, uppercase or title case, tight tracking",
                "body": "Clean sans-serif, moderate weight for readability",
                "style_notes": "More typographic contrast than Palantir. Headlines are bolder and punchier.",
            },
            "photography_direction": [
                "Dramatic wide-angle landscape compositions",
                "Golden hour and blue hour lighting for cinematic feel",
                "Hardware shot from heroic low angles",
                "Motion blur and action photography for dynamism",
                "Clean studio product shots with edge lighting",
            ],
        },
        "messaging_pillars": [
            "Silicon Valley innovation applied to national security",
            "Autonomous systems that give warfighters decisive advantage",
            "Rapid iteration: ship fast, deploy faster, iterate in the field",
            "Venture-funded defense — aligned incentives, faster delivery",
        ],
        "themes": [
            "Disrupting legacy defense / breaking the DTIC",
            "Autonomy and AI at the tactical edge",
            "Speed of acquisition and deployment",
            "Hardware + software integration",
            "American technological superiority",
        ],
    },
}


def generate_style_report(brand_key: str) -> str:
    """Generate a Markdown style research report for a brand."""
    profile = STYLE_PROFILES[brand_key]
    brand = BRANDS[brand_key]

    lines = [
        f"# {brand['name']} — Copy & Marketing Style Guide",
        f"_Generated {datetime.now().strftime('%Y-%m-%d %H:%M')}_\n",
        "---\n",
        "## 1. Voice & Tone\n",
        f"**Register:** {profile['voice_and_tone']['register']}\n",
        "**Personality traits:**",
    ]
    for item in profile["voice_and_tone"]["personality"]:
        lines.append(f"- {item}")

    lines.append("\n**Sentence style:**")
    for item in profile["voice_and_tone"]["sentence_style"]:
        lines.append(f"- {item}")

    lines.append("\n---\n")
    lines.append("## 2. Headline & Tagline Patterns\n")
    for item in profile["headline_patterns"]["structure"]:
        lines.append(f"- {item}")
    lines.append("\n**Recurring phrases:**")
    for phrase in profile["headline_patterns"]["recurring_phrases"]:
        lines.append(f"- *\"{phrase}\"*")

    lines.append("\n---\n")
    lines.append("## 3. Visual & Imagery Style\n")
    lines.append("### Imagery Direction")
    for item in profile["visual_style"]["imagery"]:
        lines.append(f"- {item}")

    palette = profile["visual_style"]["color_palette"]
    lines.append("\n### Color Palette")
    lines.append(f"| Role | Value |")
    lines.append(f"|------|-------|")
    lines.append(f"| Primary | `{palette['primary']}` |")
    lines.append(f"| Secondary | `{palette['secondary']}` |")
    lines.append(f"| Accent | `{palette['accent']}` |")
    lines.append(f"| Supporting | {', '.join(f'`{c}`' for c in palette['supporting'])} |")
    lines.append(f"\n**Mood:** {palette['mood']}\n")

    typo = profile["visual_style"]["typography"]
    lines.append("### Typography")
    lines.append(f"- **Headlines:** {typo['headlines']}")
    lines.append(f"- **Body:** {typo['body']}")
    lines.append(f"- **Notes:** {typo['style_notes']}")

    lines.append("\n### Photography Direction")
    for item in profile["visual_style"]["photography_direction"]:
        lines.append(f"- {item}")

    lines.append("\n---\n")
    lines.append("## 4. Messaging Pillars\n")
    for i, pillar in enumerate(profile["messaging_pillars"], 1):
        lines.append(f"{i}. {pillar}")

    lines.append("\n---\n")
    lines.append("## 5. Core Themes\n")
    for theme in profile["themes"]:
        lines.append(f"- {theme}")

    lines.append("\n---\n")
    lines.append("## 6. How to Apply This to Your Work\n")
    lines.append("Use these patterns as a starting point:\n")
    lines.append("1. **Adopt the tone** — match the register to your audience")
    lines.append("2. **Mirror headline structures** — swap in your product/mission")
    lines.append("3. **Follow the visual playbook** — lighting, color, and composition cues")
    lines.append("4. **Borrow the palette** — or shift hues while keeping the same contrast ratios")
    lines.append("5. **Feed these findings into the Prompt Writer Agent** to generate LLM image/copy prompts\n")

    return "\n".join(lines)


def run(brands: list[str], output_dir: Path | None = None):
    """Run the style research agent."""
    ensure_output_dirs()
    dest = output_dir or RESEARCH_DIR

    reports = {}
    for brand_key in brands:
        report = generate_style_report(brand_key)
        filepath = dest / f"{brand_key}_style_report.md"
        filepath.write_text(report)
        reports[brand_key] = str(filepath)
        print(f"[StyleResearchAgent] Wrote {filepath}")

    # Also dump raw profile JSON for downstream agents
    raw_path = dest / "style_profiles.json"
    raw_data = {k: STYLE_PROFILES[k] for k in brands}
    raw_path.write_text(json.dumps(raw_data, indent=2))
    print(f"[StyleResearchAgent] Wrote raw profiles to {raw_path}")

    return reports


def main():
    parser = argparse.ArgumentParser(description="Style Research Agent")
    parser.add_argument(
        "--brand",
        choices=["palantir", "anduril", "both"],
        default="both",
        help="Which brand(s) to research (default: both)",
    )
    parser.add_argument("--output-dir", type=Path, default=None)
    args = parser.parse_args()

    brands = list(BRANDS.keys()) if args.brand == "both" else [args.brand]
    run(brands, args.output_dir)


if __name__ == "__main__":
    main()
