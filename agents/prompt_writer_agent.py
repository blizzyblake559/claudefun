#!/usr/bin/env python3
"""
Prompt Writer Agent
===================

Consumes output from the Style Research Agent and Image Reference Agent
to generate:
  1. Ready-to-use LLM prompts for creating marketing copy and images
     in the Palantir / Anduril style
  2. A comprehensive JSON profile you can feed into any LLM or image
     generator to reproduce the aesthetic

Usage:
    python -m agents.prompt_writer_agent [--brand palantir|anduril|both] [--output-dir DIR]

Outputs:
  - prompts/<brand>_copy_prompts.md     — LLM text-generation prompts
  - prompts/<brand>_image_prompts.md    — Image-generation prompts (DALL-E, Midjourney, etc.)
  - prompts/<brand>_profile.json        — Machine-readable creative profile
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

from .config import BRANDS, PROMPTS_DIR, RESEARCH_DIR, IMAGES_DIR, ensure_output_dirs
from .style_research_agent import STYLE_PROFILES
from .image_reference_agent import IMAGE_CATALOGS


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

def build_copy_prompts(brand_key: str) -> str:
    """Generate LLM copy-writing prompts styled after the brand."""
    profile = STYLE_PROFILES[brand_key]
    brand = BRANDS[brand_key]
    vt = profile["voice_and_tone"]
    hp = profile["headline_patterns"]

    lines = [
        f"# {brand['name']} — LLM Copywriting Prompts",
        f"_Generated {datetime.now().strftime('%Y-%m-%d %H:%M')}_\n",
        "Use these prompts with any LLM (Claude, GPT, etc.) to generate ",
        "marketing copy that matches this brand's style.\n",
        "---\n",
        "## Prompt 1: Hero Headline Generator\n",
        "```",
        f"You are a senior copywriter at a defense-technology company.",
        f"Your voice is {vt['register']}.",
        f"",
        f"Write 10 hero headlines for a product landing page.",
        f"The product is [YOUR PRODUCT NAME]: [ONE-LINE DESCRIPTION].",
        f"",
        f"Style rules:",
        f"- {vt['sentence_style'][0]}",
        f"- {vt['sentence_style'][1]}",
        f"- Follow these headline structures:",
    ]
    for pattern in hp["structure"]:
        lines.append(f"  - {pattern}")
    lines.append(f"- Weave in phrases like: {', '.join(hp['recurring_phrases'][:4])}")
    lines.append(f"")
    lines.append(f"Return only the headlines, numbered 1-10.")
    lines.append("```\n")

    lines.extend([
        "---\n",
        "## Prompt 2: Product Description Writer\n",
        "```",
        f"You are writing product marketing copy for a defense/enterprise tech company.",
        f"Voice: {vt['register']}.",
        f"",
        f"Product: [YOUR PRODUCT NAME]",
        f"What it does: [BRIEF DESCRIPTION]",
        f"Key capabilities: [LIST 3-5 CAPABILITIES]",
        f"",
        f"Write a 150-word product description that:",
        f"- Opens with a problem statement, then pivots to capability",
        f"- Uses precise, technical language (not marketing fluff)",
        f"- Ends with a mission-oriented call to action",
        f"- Tone: {vt['personality'][0]}",
        f"",
        f"Messaging pillars to incorporate:",
    ])
    for pillar in profile["messaging_pillars"]:
        lines.append(f"  - {pillar}")
    lines.append("```\n")

    lines.extend([
        "---\n",
        "## Prompt 3: Full Landing Page Copy\n",
        "```",
        f"Write complete landing page copy for [YOUR PRODUCT].",
        f"",
        f"Brand voice: {vt['register']}",
        f"Target audience: senior decision-makers in defense, intelligence, and enterprise",
        f"",
        f"Include these sections:",
        f"1. Hero section (headline + 2-line subhead)",
        f"2. Problem statement (3-4 sentences on the pain point)",
        f"3. Solution overview (what the product does, 4-5 sentences)",
        f"4. Three capability cards (icon title + 2-line description each)",
        f"5. Social proof section (quote format placeholder)",
        f"6. CTA section (headline + button text)",
        f"",
        f"Style constraints:",
        f"- {vt['sentence_style'][0]}",
        f"- {vt['sentence_style'][2]}",
        f"- {vt['sentence_style'][3]}",
        f"- Themes: {', '.join(profile['themes'][:3])}",
        "```\n",
    ])

    lines.extend([
        "---\n",
        "## Prompt 4: Tagline Brainstorm\n",
        "```",
        f"Generate 20 taglines for [YOUR COMPANY/PRODUCT].",
        f"",
        f"Style reference: {brand['name']}'s marketing voice.",
        f"Tone: {vt['register']}",
        f"",
        f"Rules:",
        f"- Maximum 8 words per tagline",
        f"- Use strong verbs and concrete nouns",
        f"- Avoid clichés and generic tech buzzwords",
        f"- At least 5 should follow the pattern: '{hp['structure'][0]}'",
        f"- At least 5 should be punchy imperatives",
        f"",
        f"Themes to draw from: {', '.join(profile['themes'])}",
        "```\n",
    ])

    return "\n".join(lines)


def build_image_prompts(brand_key: str) -> str:
    """Generate image-generation prompts styled after the brand."""
    profile = STYLE_PROFILES[brand_key]
    brand = BRANDS[brand_key]
    vs = profile["visual_style"]
    catalog = IMAGE_CATALOGS[brand_key]

    lines = [
        f"# {brand['name']} — Image Generation Prompts",
        f"_Generated {datetime.now().strftime('%Y-%m-%d %H:%M')}_\n",
        "Use these prompts with DALL-E, Midjourney, Stable Diffusion, or similar.\n",
        "---\n",
        "## Global Style Modifiers (append to any prompt)\n",
        "```",
        f"Style: {vs['color_palette']['mood']}",
        f"Color palette: {vs['color_palette']['primary']}, {vs['color_palette']['secondary']}, ",
        f"  accent {vs['color_palette']['accent']}, supporting {', '.join(vs['color_palette']['supporting'])}",
        f"Typography feel: {vs['typography']['headlines']}",
        f"Photography: {', '.join(vs['photography_direction'][:2])}",
        "```\n",
    ]

    # Generate a prompt for each reference image
    for i, ref in enumerate(catalog["references"], 1):
        lines.extend([
            f"---\n",
            f"## Prompt {i}: {ref['title']} (based on {ref['id']})\n",
            "```",
            f"{ref['description']}",
            f"",
            f"Style: {', '.join(ref['style_tags'])}",
            f"Colors: {ref['color_notes']}",
            f"Composition: {ref['composition']}",
            f"Mood: cinematic, professional, defense-tech aesthetic",
            f"Aspect ratio: 16:9",
            f"Quality: ultra-high detail, photorealistic",
            "```\n",
        ])

    # Custom template prompt
    lines.extend([
        "---\n",
        "## Custom Template: Your Own Product Shot\n",
        "```",
        f"[YOUR PRODUCT] photographed in the style of {brand['name']} marketing.",
        f"",
        f"Environment: [CHOOSE: command center / desert / coastline / studio / aerial]",
        f"Lighting: {vs['photography_direction'][0]}",
        f"Background: {vs['color_palette']['primary']} to {vs['color_palette']['secondary']} gradient",
        f"Accent lighting: {vs['color_palette']['accent']}",
        f"Composition: {vs['imagery'][0]}",
        f"Mood: authoritative, cinematic, high-stakes",
        f"Aspect ratio: 16:9, ultra-high detail",
        "```\n",
    ])

    return "\n".join(lines)


def build_json_profile(brand_key: str) -> dict:
    """Build a comprehensive JSON creative profile for the brand."""
    profile = STYLE_PROFILES[brand_key]
    brand = BRANDS[brand_key]
    catalog = IMAGE_CATALOGS[brand_key]

    return {
        "meta": {
            "profile_name": f"{brand_key}_creative_profile",
            "brand_reference": brand["name"],
            "generated": datetime.now().isoformat(),
            "version": "1.0",
            "purpose": (
                "Machine-readable creative profile for generating marketing copy "
                "and imagery in the style of this brand. Feed this JSON to any LLM "
                "as system context or use individual fields for targeted generation."
            ),
        },
        "brand_context": {
            "name": brand["name"],
            "domain": brand["domain"],
            "industry_focus": brand["focus"],
            "products": brand["known_products"],
        },
        "voice": {
            "register": profile["voice_and_tone"]["register"],
            "personality_traits": profile["voice_and_tone"]["personality"],
            "sentence_rules": profile["voice_and_tone"]["sentence_style"],
        },
        "copywriting": {
            "headline_patterns": profile["headline_patterns"]["structure"],
            "recurring_phrases": profile["headline_patterns"]["recurring_phrases"],
            "messaging_pillars": profile["messaging_pillars"],
            "themes": profile["themes"],
        },
        "visual_identity": {
            "color_palette": profile["visual_style"]["color_palette"],
            "typography": profile["visual_style"]["typography"],
            "imagery_direction": profile["visual_style"]["imagery"],
            "photography_rules": profile["visual_style"]["photography_direction"],
        },
        "image_references": [
            {
                "id": ref["id"],
                "title": ref["title"],
                "category": ref["category"],
                "description": ref["description"],
                "style_tags": ref["style_tags"],
                "color_notes": ref["color_notes"],
                "composition": ref["composition"],
            }
            for ref in catalog["references"]
        ],
        "llm_system_prompt": (
            f"You are a creative director producing marketing materials in the style of "
            f"{brand['name']}. Your voice is {profile['voice_and_tone']['register']}. "
            f"You write copy that is precise, mission-driven, and avoids hype. "
            f"Your visual direction favors {profile['visual_style']['color_palette']['mood']} "
            f"Key themes: {', '.join(profile['themes'][:3])}. "
            f"Always match the tone and visual language described in this profile."
        ),
    }


def run(brands: list[str], output_dir: Path | None = None):
    """Run the prompt writer agent."""
    ensure_output_dirs()
    dest = output_dir or PROMPTS_DIR

    results = {}
    for brand_key in brands:
        # Copy prompts
        copy_prompts = build_copy_prompts(brand_key)
        copy_path = dest / f"{brand_key}_copy_prompts.md"
        copy_path.write_text(copy_prompts)
        print(f"[PromptWriterAgent] Wrote {copy_path}")

        # Image prompts
        image_prompts = build_image_prompts(brand_key)
        img_path = dest / f"{brand_key}_image_prompts.md"
        img_path.write_text(image_prompts)
        print(f"[PromptWriterAgent] Wrote {img_path}")

        # JSON profile
        json_profile = build_json_profile(brand_key)
        json_path = dest / f"{brand_key}_profile.json"
        json_path.write_text(json.dumps(json_profile, indent=2))
        print(f"[PromptWriterAgent] Wrote {json_path}")

        results[brand_key] = {
            "copy_prompts": str(copy_path),
            "image_prompts": str(img_path),
            "profile_json": str(json_path),
        }

    return results


def main():
    parser = argparse.ArgumentParser(description="Prompt Writer Agent")
    parser.add_argument(
        "--brand",
        choices=["palantir", "anduril", "both"],
        default="both",
        help="Which brand(s) to generate prompts for (default: both)",
    )
    parser.add_argument("--output-dir", type=Path, default=None)
    args = parser.parse_args()

    brands = list(BRANDS.keys()) if args.brand == "both" else [args.brand]
    run(brands, args.output_dir)


if __name__ == "__main__":
    main()
