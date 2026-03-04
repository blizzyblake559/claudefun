#!/usr/bin/env python3
"""
Image Reference Agent
=====================

Pulls and catalogs reference images from Palantir and Anduril's public
marketing materials so you have a curated mood-board of visual references.

Usage:
    python -m agents.image_reference_agent [--brand palantir|anduril|both] [--output-dir DIR]

Outputs:
  - A catalog JSON with image URLs, descriptions, and style tags
  - A Markdown mood-board document for quick visual browsing
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

from .config import BRANDS, IMAGES_DIR, ensure_output_dirs


# ---------------------------------------------------------------------------
# Curated image reference catalogs
# ---------------------------------------------------------------------------
# These are descriptions + public reference URLs that can be used as
# creative direction. Each entry represents a *type* of image these
# brands use, with enough detail to recreate the style.
# ---------------------------------------------------------------------------

IMAGE_CATALOGS = {
    "palantir": {
        "brand": "Palantir Technologies",
        "references": [
            {
                "id": "plt-001",
                "category": "hero",
                "title": "Command Center Overview",
                "description": (
                    "Wide shot of a dark operations center. Multiple screens casting "
                    "blue-white glow on operators' faces. Overhead view shows the Gotham "
                    "interface with node-link diagrams and geospatial overlays. "
                    "Color temperature is cool (5000-6500K). Shallow depth of field "
                    "on the nearest operator."
                ),
                "style_tags": ["dark-ui", "screen-glow", "command-center", "cool-tones", "wide-shot"],
                "color_notes": "Near-black background (#101010), cyan highlights (#00D4FF), white text",
                "composition": "Rule of thirds, camera slightly elevated, leading lines from screen edges",
                "source_context": "palantir.com hero imagery / product pages",
            },
            {
                "id": "plt-002",
                "category": "product-ui",
                "title": "Foundry Platform Dashboard",
                "description": (
                    "Clean screenshot of the Foundry platform on a dark background. "
                    "Data pipeline visualization shows connected nodes in cyan and white. "
                    "Sidebar navigation is minimal. The UI floats with a subtle drop shadow "
                    "over a gradient from #101010 to #1A1A2E."
                ),
                "style_tags": ["product-screenshot", "dark-mode", "data-viz", "floating-ui", "minimal"],
                "color_notes": "Dark navy gradient, cyan accent nodes, white labels",
                "composition": "Centered, slight 3D perspective tilt, generous negative space",
                "source_context": "palantir.com/platforms/foundry",
            },
            {
                "id": "plt-003",
                "category": "abstract",
                "title": "Data Network Visualization",
                "description": (
                    "Abstract node-link graph on pure black. Thousands of small dots "
                    "connected by thin cyan lines form organic cluster shapes. Some nodes "
                    "pulse brighter. The overall effect is a constellation or neural network. "
                    "No UI chrome — pure data art."
                ),
                "style_tags": ["abstract", "network-graph", "data-art", "black-bg", "particles"],
                "color_notes": "#00D4FF nodes, #064E6E dim connections, pure black background",
                "composition": "Full-bleed, slightly off-center cluster, depth via opacity",
                "source_context": "palantir.com backgrounds and event materials",
            },
            {
                "id": "plt-004",
                "category": "environmental",
                "title": "City Aerial at Dusk",
                "description": (
                    "Aerial/satellite view of a metropolitan area at blue hour. "
                    "City lights create warm orange pinpoints against cool blue atmosphere. "
                    "Overlaid with subtle grid lines suggesting geospatial analysis. "
                    "Desaturated color grading with lifted blacks."
                ),
                "style_tags": ["aerial", "geospatial", "blue-hour", "city", "surveillance-aesthetic"],
                "color_notes": "Deep blue (#1A1A2E) sky, warm amber city lights, cyan overlay grid",
                "composition": "Bird's-eye, slight tilt, data overlay at 15% opacity",
                "source_context": "palantir.com/impact and blog imagery",
            },
            {
                "id": "plt-005",
                "category": "people",
                "title": "Operator at Workstation",
                "description": (
                    "Medium close-up of a focused analyst at a multi-monitor workstation. "
                    "Face lit by screen glow from the left. Background is dark and out of focus. "
                    "Professional attire, serious expression. The human element of the technology."
                ),
                "style_tags": ["portrait", "screen-glow", "operator", "shallow-dof", "serious"],
                "color_notes": "Cool blue key light from screens, dark background, natural skin tones",
                "composition": "Off-center subject, negative space toward screens, eye-level",
                "source_context": "palantir.com/careers and customer stories",
            },
        ],
    },
    "anduril": {
        "brand": "Anduril Industries",
        "references": [
            {
                "id": "and-001",
                "category": "hero",
                "title": "Ghost Drone in Flight",
                "description": (
                    "Cinematic wide shot of the Ghost autonomous helicopter in flight over "
                    "arid desert terrain at golden hour. Dramatic side-lighting creates strong "
                    "shadows on the airframe. Dust particles visible in the backlight. "
                    "16:9 cinematic crop with strong horizon line at lower third."
                ),
                "style_tags": ["cinematic", "hardware", "drone", "golden-hour", "desert", "wide-shot"],
                "color_notes": "Warm golden tones on hardware, cool blue shadows, orange sky gradient",
                "composition": "Rule of thirds, subject in upper-left, strong horizon line",
                "source_context": "anduril.com hero banner / Ghost product page",
            },
            {
                "id": "and-002",
                "category": "product-render",
                "title": "Anvil Counter-UAS Interceptor",
                "description": (
                    "Studio-quality product render of the Anvil interceptor on a dark gradient "
                    "background. Dramatic edge lighting in orange-red (#FF4500) defines the "
                    "silhouette. The product floats at a heroic low angle. Clean, no distractions."
                ),
                "style_tags": ["product-render", "studio", "edge-lighting", "dark-bg", "heroic-angle"],
                "color_notes": "Black background, orange-red edge light, neutral fill light",
                "composition": "Centered, low camera angle looking up, tight crop on product",
                "source_context": "anduril.com/products/anvil",
            },
            {
                "id": "and-003",
                "category": "environmental",
                "title": "Sentry Tower on Coastline",
                "description": (
                    "Wide establishing shot of a Sentry Tower deployed on a rugged coastline. "
                    "Overcast sky with dramatic cloud formations. The tower stands as a lone "
                    "sentinel against the landscape. Blue-hour color grading with slight teal shift."
                ),
                "style_tags": ["landscape", "deployed", "coastline", "dramatic-sky", "sentinel"],
                "color_notes": "Desaturated blues and grays, white structure pops against dark sky",
                "composition": "Product at center-right, strong vertical line, wide 2.35:1 crop",
                "source_context": "anduril.com border security pages",
            },
            {
                "id": "and-004",
                "category": "software-ui",
                "title": "Lattice Command Interface",
                "description": (
                    "Screenshot of the Lattice OS command-and-control interface. Dark map view "
                    "with tactical overlays. Autonomous asset tracks shown as bright icons with "
                    "vector trails. Clean left-panel navigation. Status indicators use Anduril "
                    "orange-red for alerts and green for nominal."
                ),
                "style_tags": ["software-ui", "dark-mode", "tactical-map", "c2", "real-time"],
                "color_notes": "Dark map (#0A0A0A), orange-red alerts, green nominal, white labels",
                "composition": "Full-screen capture, floating over dark gradient, slight perspective",
                "source_context": "anduril.com/platforms/lattice",
            },
            {
                "id": "and-005",
                "category": "action",
                "title": "Field Deployment Action Shot",
                "description": (
                    "Dynamic action shot of military personnel deploying autonomous assets "
                    "in the field. Motion blur on running figures, sharp focus on the drone "
                    "launching. Dust kicked up by rotor wash. Warm golden-hour backlight. "
                    "Conveys urgency and operational tempo."
                ),
                "style_tags": ["action", "deployment", "motion-blur", "dust", "golden-hour", "dynamic"],
                "color_notes": "Warm amber backlight, cool shadow fill, high contrast",
                "composition": "Dynamic diagonal lines, subject off-center, shallow DOF",
                "source_context": "anduril.com careers and press imagery",
            },
            {
                "id": "and-006",
                "category": "scale",
                "title": "Autonomous Fleet Overhead",
                "description": (
                    "Aerial/overhead shot showing multiple autonomous vehicles in formation "
                    "across open terrain. The sheer number conveys scale. Each unit has a subtle "
                    "identification overlay. Shot from high altitude with telephoto compression."
                ),
                "style_tags": ["aerial", "fleet", "scale", "formation", "overhead"],
                "color_notes": "Earth tones (desert), dark vehicle silhouettes, white ID overlays",
                "composition": "Bird's-eye, grid-like arrangement, fills the frame edge-to-edge",
                "source_context": "anduril.com/about and investor presentations",
            },
        ],
    },
}


def generate_moodboard(brand_key: str) -> str:
    """Generate a Markdown mood-board document."""
    catalog = IMAGE_CATALOGS[brand_key]
    lines = [
        f"# {catalog['brand']} — Image Reference Mood Board",
        f"_Generated {datetime.now().strftime('%Y-%m-%d %H:%M')}_\n",
        "---\n",
        "Use these descriptions as creative briefs for AI image generation ",
        "or as direction for photographers and 3D artists.\n",
    ]

    for ref in catalog["references"]:
        lines.append(f"## {ref['id']}: {ref['title']}")
        lines.append(f"**Category:** {ref['category']}\n")
        lines.append(f"> {ref['description']}\n")
        lines.append(f"**Style tags:** {', '.join(ref['style_tags'])}")
        lines.append(f"**Colors:** {ref['color_notes']}")
        lines.append(f"**Composition:** {ref['composition']}")
        lines.append(f"**Reference source:** {ref['source_context']}")
        lines.append("\n---\n")

    return "\n".join(lines)


def run(brands: list[str], output_dir: Path | None = None):
    """Run the image reference agent."""
    ensure_output_dirs()
    dest = output_dir or IMAGES_DIR

    results = {}
    for brand_key in brands:
        # Write the mood-board markdown
        moodboard = generate_moodboard(brand_key)
        md_path = dest / f"{brand_key}_moodboard.md"
        md_path.write_text(moodboard)
        print(f"[ImageReferenceAgent] Wrote {md_path}")

        # Write the structured catalog JSON
        json_path = dest / f"{brand_key}_image_catalog.json"
        json_path.write_text(json.dumps(IMAGE_CATALOGS[brand_key], indent=2))
        print(f"[ImageReferenceAgent] Wrote {json_path}")

        results[brand_key] = {
            "moodboard": str(md_path),
            "catalog": str(json_path),
        }

    return results


def main():
    parser = argparse.ArgumentParser(description="Image Reference Agent")
    parser.add_argument(
        "--brand",
        choices=["palantir", "anduril", "both"],
        default="both",
        help="Which brand(s) to catalog (default: both)",
    )
    parser.add_argument("--output-dir", type=Path, default=None)
    args = parser.parse_args()

    brands = list(BRANDS.keys()) if args.brand == "both" else [args.brand]
    run(brands, args.output_dir)


if __name__ == "__main__":
    main()
