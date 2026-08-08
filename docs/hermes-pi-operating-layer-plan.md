# Hermes + Pi: An AI Operating Layer for Your Business

**Prepared:** August 8, 2026
**Scope:** Research findings on Shopify's agent infrastructure, Pi (Earendil), Hermes (Nous Research), Prime Intellect, and Armin Ronacher's agent patterns — plus a concrete, step-by-step plan to stand up both agents as the operating layer for purchasing/AP, AR, knowledge management, sales, and marketing.

---

## 1. TLDR — The Recommendation

Run **two agents with different jobs**, sharing **one company brain** (a git repo of knowledge + skills + tools):

| Role | Agent | Why |
|---|---|---|
| **The Operator** — always-on, talks to you on Telegram, runs departments, remembers everything, learns | **Hermes** (Nous Research `hermes-agent`) | It's the only major agent with a built-in learning loop: it writes its own skills from experience, searches its own past sessions, and runs persistently on a cheap VPS. Telegram-native. MCP support. |
| **The Builder** — writes the tools, integrations, extensions, and site code the Operator uses | **Pi** (Earendil `@earendil-works/pi-coding-agent`) | Minimal, cheap, self-extending coding harness. Independently validated (Databricks: highest pass rate at ~half the cost of Claude Code on the same model). It builds CLI tools your other agents then call. |
| **Familiar fallback** | Claude Code (you already use it) | Skills are the same open format (agentskills.io) across all three — write once, share everywhere. |

The glue is not either agent — it's **your data made agent-readable** (Shopify's core lesson) and a **skills library that compounds** (thread → runbook → skill → default). Everything below is how to build that.

One naming correction up front, because it matters for what you install: in Aug 2026, **"Hermes agent" = Nous Research's `hermes-agent`** (the self-hosted persistent agent, ~114k+ GitHub stars, MIT). It is *not* Prime Intellect's agent — theirs is called **Prime Agent** (open-sourced ~Aug 5, 2026, watch-list item, see §4.4). And **omp.sh is "Oh My Pi"** — a community fork of Pi with IDE features, not a separate platform.

---

## 2. Research Findings

### 2.1 Shopify — what they actually built, and what to copy

Shopify's public writing describes three layers. All three translate directly to a small business.

**River + Aquifer (the "Under the River" post, May 2026).** River is Shopify's Slack-native agent; Aquifer is the platform under it. The architecture in one breath:

- **Durable sessions, disposable everything else.** The session is an append-only event log in Postgres — "Cells die, sandboxes die, machines die. The conversation doesn't." The harness (agent loop) and sandbox (where code runs) are cheap and throwaway.
- **Brain/hands separation.** Model decisions live on the harness side, execution in a sandbox — so you can swap models without touching execution, and the whole decision stream is observable in one place.
- **Profiles are pure data:** system prompt + skills + extensions + sandbox policy, shipped as versioned bundles. An "agent" is just a profile.
- **Skills are written down**, versioned, and shared — not tribal knowledge.
- Scale at publication: ~60,000 sessions/30 days across 5,170 Slack channels; River co-authored **1 in 8 merged PRs** company-wide.

**The Tobi tweet (the culture layer).** River works **only in public channels** — it politely declines DMs. Tobi's framing is the *Lehrwerkstatt* (teaching workshop): "If every interaction with an agent happens in a private window, the only person who learns anything is the person at the keyboard." The learning ladder is the operational core: **useful thread → written runbook → reusable skill → default behavior.** River's PR merge rate went **36% → 77% in two months** with zero model retraining — purely by feeding corrections back into skills and instructions.

**Autoresearch (the optimization layer).** Karpathy's ~630-line loop, generalized by Shopify into `pi-autoresearch` — **built as a Pi extension** (Tobi + David Cortés). Pattern: give the agent a **scoreboard** (a benchmark script that prints a number) + rules, and let it loop overnight: propose experiment → implement → measure → keep or revert. Results: Liquid template engine 53% faster from ~120 automated experiments (with Tobi's own caveat: "probably somewhat overfit" — the PR was human-reviewed and initially unmerged); internal teams got 300x faster unit tests, 65% faster CI. The lesson for you: **"make it better" only works when there's a number that goes up.**

**AI data strategy (the enterprise blog).** Aimed at merchants but the checklist generalizes: start from a *decision/workflow*, not a tool purchase; make every data source **API-accessible and machine-readable** (data trapped in PDFs and display formatting is invisible to agents); unify core entities (for you: vendors, parts, machines, jobs, quotes, POs, invoices, customers); governance = named owners and clear boundaries, which is what makes outputs trustworthy enough to act on. Gartner stat they cite: through 2026, orgs will abandon ~60% of AI projects that lack AI-ready data. Your knowledge-base import project is the single highest-leverage thing on your list.

**MindStudio article — validation verdict.** It's *content marketing from a no-code vendor*, published one day before Shopify's own engineering post, sourced from Tobi's tweet. The Shopify-specific claims it makes check out (public-only channels, 36%→77% merge rate, transcript mining) — no fabricated numbers found. But it contains **none of the actual architecture** (Aquifer, sessions/harness/sandbox, Nix, monorepo) and its generalized "lessons" are the vendor's extrapolations. **Verdict: fine for the culture/visibility concepts; cite shopify.engineering for architecture and numbers.**

### 2.2 Pi — the minimal, self-extending builder

Pi is a terminal coding agent from **Earendil** (Armin Ronacher's company; created by Mario Zechner, who joined Earendil in April 2026). MIT-licensed, npm `@earendil-works/pi-coding-agent`, v0.84.x.

What makes it different:

- **Radically minimal:** exactly 4 tools (`read`, `write`, `edit`, `bash`); system prompt + tools ≈ **1,000 tokens** vs ~14,000 for Claude Code. No built-in MCP, sub-agents, permission popups, plan mode, or todos — deliberately. "Adapt Pi to your workflows, not the other way around."
- **Self-extending:** extensions are TypeScript files loaded from source (no build step) with 25+ event hooks — you literally ask Pi to write the feature you're missing, and it reads its own extension docs and builds it. That's how Shopify's autoresearch extension was bootstrapped.
- **Skills = the open Agent Skills standard** (`SKILL.md` with name/description frontmatter) — you can point Pi at `~/.claude/skills` and reuse your Claude Code skills directly.
- **Any model:** ~30 providers (Anthropic, OpenAI, Google, OpenRouter, local llama.cpp, …), mid-session switching. Auth file supports `!op read '…'` — **native 1Password integration for secrets.**
- **Sessions are trees** (branch, rewind, fork), stored as JSONL; scriptable via `pi -p`, JSON/RPC modes, and a Node SDK.
- **Independently validated:** Databricks benchmarked harnesses on their multi-million-line codebase — same model, same thinking effort — and found **>2x cost differences between harnesses**. Pi had the **highest pass rate at significantly lower cost than Claude Code and Codex** (≈3x less context per turn). The Earendil post you linked is exactly this argument: the *harness* is a first-class performance and cost variable.
- **Caveat:** no built-in permission system — Pi runs with your full user permissions. The docs' answer is containerization (Docker, or their Gondolin micro-VM extension). Treat it accordingly (see §7).

### 2.3 Hermes — the persistent operator that learns

**Nous Research's `hermes-agent`** (released Feb 2026; Nous was in talks at a $1.5B valuation in July 2026 largely on its strength). MIT, self-hosted, "the agent that grows with you."

Why it fits your "agents who are learning" requirement better than anything else surveyed:

- **Built-in learning loop** — its signature feature: it autonomously creates skills from its own experience, improves them during use, nudges itself to persist memories, and runs full-text search (SQLite FTS5) over all its past sessions with LLM summarization. This is Shopify's thread→runbook→skill→default ladder, shipped as a product.
- **Channels you already use:** CLI, **Telegram**, Discord, Slack, WhatsApp, Signal, desktop app, and voice (the Aug 3, 2026 "Herald" release added conversational voice + signed webhooks).
- **Persistent + cheap:** designed to run 24/7 on anything from "a $5 VPS" up; seven execution backends (local, Docker, SSH, Modal, Daytona, …).
- **MCP support, done right:** connect any MCP server; it shipped Anthropic-style deferred tool loading ("Tool Search for MCP," May 2026) so many servers don't bloat context.
- **80+ bundled skills**, agentskills.io-compatible — same open format as Pi and Claude Code.
- **Model-agnostic:** Nous Portal (300+ models), OpenRouter, OpenAI, Anthropic, custom endpoints; switch with `hermes model`. (Fun fact: Nous's own Hermes 4 *model* is not recommended as its driver — it's tuned for chat, not rapid tool-calling. Use Claude Sonnet/Opus-class or GPT-class models as the brain.)
- **Maturity/risk:** enormous velocity (650+ contributors, major releases monthly). That cuts both ways — pin versions, update deliberately.

### 2.4 Prime Intellect / Prime Agent / omp.sh — clarified

- **Prime Intellect** is an open-source AI platform: decentralized RL training, the **Environments Hub** ("GitHub for RL environments"), compute marketplace, INTELLECT models.
- **Prime Agent** (open-sourced ~Aug 5–6, 2026, MIT, TypeScript) is their self-improving agent. Its two ideas are genuinely novel: a **Recursive Language Model** harness — the agent lives in a persistent IPython kernel where files, shell, sub-agents (`rlm(...)`) and even *context itself* are Python variables — and a **Continual Harness** (durable memories/skills refined via `/refine`, with rollback). Benchmark headline: 95.5% on ARC-AGI-3 with Opus 5, above the human-expert baseline. **It is 3 days old.** Verdict: exciting, watch it, don't build your business on it this quarter.
- **omp.sh = "Oh My Pi"** — Can Bölük's fork of Pi with heavy IDE tooling (LSP, debuggers, hash-anchored edits, built-in subagents, plan mode, persistent memory). A legitimate alternative to vanilla Pi if you want batteries included; there's even a community MCP bridge (`hermes-oh-my-pi-mcp`) built specifically so **Hermes can drive an omp/Pi coding agent** — evidence that the Hermes-as-operator + Pi-family-as-builder pairing is the emerging standard stack. Recommendation: start with vanilla Pi (it's the upstream, and Earendil-backed); try omp later if you miss IDE features.

### 2.5 Armin Ronacher's patterns (mitsuhiko/agent-stuff) — the playbook for *how* to build

His repo (`mitsupi` on npm) is a working example of a personal agent loadout for Pi, and his blog posts supply the doctrine. The patterns worth adopting wholesale:

1. **Code beats tool protocols.** Don't reach for an MCP server when a CLI script works: CLIs are composable, cheap in context, and the model already knows bash. His benchmark intuition: `gh` CLI beats the GitHub MCP on both context and speed. Where state is needed, use one "ubertool" — a single tool that accepts code (e.g., one JS-eval tool with an authorized `googleapis` client in scope replaced an entire Google Workspace MCP).
2. **Skills = a description of *when* to trigger + a manual + helper scripts in the skill folder.** His `web-browser` skill replaced the Playwright MCP with six tiny Node scripts. Skills load no tool definitions — they're just files the agent reads on demand.
3. **Ask the agent to write its own tools.** "Because the agent maintains it, it works out better." Then throw skills away when unused: "I only automate things that I do regularly. If I stop using the automation, I delete it."
4. **The filesystem is the memory bus.** Markdown plans, todo files, handoff docs, cached reference repos — durable, human-inspectable, editable by both of you. No dead ends: every tool reads/writes the same filesystem.
5. **Reinforcement in the loop:** echo-style goal/todo reminders keep long tasks on track (his `goal.ts` extension re-injects the objective + remaining budget each turn).
6. **Steer by environment, not hooks:** e.g., PATH shims that fail with a teaching message ("pip is disabled, use uv…").
7. **Review the formula, not the result.** Have the agent write a *script* that does the migration/report/conversion, review the script, re-run it forever — instead of paying inference per item.

---

## 3. The Matrix

| | **Hermes** (Nous) | **Pi** (Earendil) | Claude Code (baseline) | Prime Agent (watch) |
|---|---|---|---|---|
| What it is | Persistent personal/business agent | Minimal terminal coding harness | Full-featured coding agent | Self-improving RLM agent |
| License | MIT, self-hosted | MIT, open source | Proprietary | MIT |
| Install | `curl` installer → `hermes` | `npm i -g --ignore-scripts @earendil-works/pi-coding-agent` | You have it | `curl` installer |
| Interfaces | CLI, **Telegram**, Slack, Discord, WhatsApp, Signal, voice, desktop | Terminal TUI, `-p` headless, RPC, SDK | Terminal, web, desktop, SDK | Terminal |
| Models | Any (Nous Portal 300+, OpenRouter, Anthropic, OpenAI, local) | ~30 providers + local; mid-session switch | Anthropic only | Provider-agnostic via `/login` |
| Learning / self-improvement | **Built-in loop: writes own skills, searches own history, user modeling** | Self-extends (writes its own TS extensions) — you direct it | Skills/CLAUDE.md, manual curation | `/refine` continual harness + rollback |
| Skills format | agentskills.io (80+ bundled) | agentskills.io (+ reads `~/.claude/skills`) | agentskills.io | Own skill store |
| MCP | Yes + deferred tool search | Not built-in (by design); `mcp-to-pi-tools` bridge; prefer CLIs | Yes | Not documented (code-as-tools instead) |
| Memory / sessions | Persistent, FTS-searchable, lineage compression | JSONL session *trees* (branch/rewind) | Sessions + compaction | Context-as-a-variable (IPython) |
| Guardrails | Sandboxed backends (Docker/VPS); channel-level control | **None built-in** — containerize; project trust gate | Built-in permission system | Budgeted autonomy (`/autonomous`) |
| Cost profile | Depends on model; harness is lightweight | **Best measured:** ~3x less context/turn; Databricks: top pass rate, ~½ Claude Code's cost | ~14k-token harness overhead | Unmeasured by third parties |
| Maturity | High velocity, huge community, 6 months old | Stable core, small sharp ecosystem | Most mature | **3 days old** |
| Your use | **The Operator:** departments, Telegram, KB, AR/AP/sales workflows, learning | **The Builder:** tools, integrations, Astro site, autoresearch loops | Fallback + what you know | Re-evaluate in Q4 |
| Risk to manage | Fast-moving; pin versions; secure the VPS | Full user permissions — run in Docker for risky work | Vendor lock, cost | Too new |

---

## 4. The Architecture: One Brain, Two Agents

```
                        ┌─────────────────────────────┐
                        │   YOU  (Telegram + terminal) │
                        └──────────┬──────────────────┘
              approvals, steering  │  visible work (channel per dept)
                        ┌──────────▼──────────────────┐
                        │  HERMES — the Operator       │
                        │  24/7 on a small VPS/mini-PC │
                        │  dept skills · memory · MCP  │
                        └───┬──────────┬───────────────┘
             delegates code │          │ reads/writes
             & tool-building│          │
              ┌─────────────▼──┐   ┌───▼──────────────────────────┐
              │ PI — the       │   │  company-os  (git repo)       │
              │ Builder        │──▶│  /knowledge  vendors machines │
              │ builds CLIs,   │   │  /skills     shared library   │
              │ extensions,    │   │  /tools      CLI scripts      │
              │ Astro site     │   │  /departments runbooks/SOPs   │
              └────────────────┘   └───┬──────────────────────────┘
                                       │ CLIs + MCP
                    ┌──────────────────┼───────────────────┬───────────────┐
              ┌─────▼─────┐   ┌────────▼──────┐   ┌────────▼───┐   ┌──────▼─────┐
              │ Airtable  │   │ Your AR       │   │ Outlook /  │   │ Drive,     │
              │ (sales/   │   │ progress-pay  │   │ email      │   │ Astro site,│
              │  charts)  │   │ software API  │   │            │   │ YouTube    │
              └───────────┘   └───────────────┘   └────────────┘   └────────────┘
```

### 4.1 The company brain: a `company-os` git repo

This is the single most important artifact — it's Shopify's "profiles are pure data" + Armin's "filesystem as memory bus," and it's what makes the whole thing portable across Hermes, Pi, and Claude Code (same skills format everywhere).

```
company-os/
├── AGENTS.md                  # who we are, tone, hard rules (money, email, approvals)
├── knowledge/
│   ├── vendors/               # one .md per vendor: contacts, terms, history, notes
│   ├── machines/              # one .md per machine/product: specs, options, pricing
│   ├── parts/                 # parts data (CSV/markdown — structured!)
│   ├── contracts/             # source PDFs + extracted .md next to each
│   ├── templates/             # PO template, quote template, contract clauses
│   └── customers/             # accounts, history, AR terms
├── skills/                    # shared skill library (agentskills.io format)
│   ├── write-po/SKILL.md
│   ├── vendor-quote-request/SKILL.md
│   ├── ar-status/SKILL.md
│   ├── sales-email/SKILL.md
│   └── linkedin-post/SKILL.md
├── tools/                     # CLI scripts Pi builds, all agents call
│   ├── airtable.py            # get/update deals, pipeline stages
│   ├── ar.py                  # wraps your progress-payment software's API
│   ├── quotes.py              # quote/PO tracking (SQLite or Airtable)
│   └── ingest.py              # Drive/PDF → knowledge/ importer
├── departments/
│   ├── purchasing/RUNBOOK.md  # the SOP the skills grew out of
│   ├── ar/RUNBOOK.md
│   ├── sales/RUNBOOK.md
│   └── marketing/RUNBOOK.md
└── logs/                      # decision log, weekly reviews
```

Rules that make it work:

- **Markdown-first.** Every PDF that matters gets an extracted `.md` sibling (agents read markdown 10x more reliably and cheaply than PDFs). The importer tool does this automatically.
- **Structured beats prose.** Vendor files get consistent frontmatter (name, contact, terms, categories) so agents can grep them. Parts lists are CSV, not paragraphs.
- **Git is the audit trail.** Every knowledge edit an agent makes is a commit you can review — this is your version of Shopify's append-only event log, for free.
- **Skills are the interface.** A department "agent" is just Hermes + that department's skills + runbook. No new infrastructure per department.

### 4.2 Division of labor (who does what)

- **Hermes** handles conversation-shaped, recurring, stateful work: "chase the quote from Valley Iron," "what's the AR status on job 100155," "draft Friday's LinkedIn post," "log this deal in Airtable." It runs scheduled jobs (daily AR digest, weekly pipeline review) and messages you on Telegram.
- **Pi** handles build-shaped work: write `tools/ar.py` against your AR software's API, build the Airtable CLI, restructure the Astro site, write the Drive ingest pipeline, and — once you have scoreboards — run autoresearch-style optimization loops (site Lighthouse score, test speed, whatever you can measure).
- **The handoff:** when Hermes hits something that needs code, it either uses its own coding skill or you bounce to Pi in the `company-os`/project repo. (Later, wire Hermes to invoke Pi headlessly — `pi -p "…"` — as a sub-agent; the community bridge for exactly this pattern already exists.)

### 4.3 Work in public — the Telegram version of River

Copy Shopify's visibility rule at your scale: **one Telegram group ("Company HQ") with topics** — #purchasing, #ar, #sales, #marketing, #kb, #agent-improvements. Hermes posts its work into the relevant topic instead of DMing you. Today the "audience" is just you (and later your first hires), but the payoffs start immediately:

- Every agent action is a searchable transcript (your event log).
- When you correct the agent, do it in-channel, then say: **"save that as a skill update"** — Hermes's learning loop turns the correction into a durable improvement. That's the 36%→77% mechanism.
- When someone joins the company, the channels *are* the training program (Lehrwerkstatt).

---

## 5. Setup Plan A — Hermes (the Operator)

**Time: ~2–3 hours to running; an evening to genuinely useful.**

**Step 1 — Pick where it lives.** A $5–10/month VPS (Hetzner/DigitalOcean, Ubuntu 24.04) or a spare mini-PC. Don't run it on your daily laptop — the point is persistence. Use the **Docker terminal backend** so its shell work is contained.

**Step 2 — Install.**
```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes            # first-run wizard
```
(Read the script before piping to bash — it's the official installer, but that's the habit. On the VPS, create a dedicated `hermes` user; don't run as root.)

**Step 3 — Model + keys via 1Password.** Use the 1Password CLI on the server (`op` with a service account) so no raw keys sit in dotfiles:
```bash
export ANTHROPIC_API_KEY="$(op read 'op://Business/Anthropic API/credential')"
hermes model      # pick a strong tool-caller: Sonnet-class for daily, Opus-class for hard tasks
```
Start with a strong-but-cheap model as the default driver and escalate per-task; the operator's work is mostly retrieval + drafting, not deep reasoning.

**Step 4 — Connect Telegram.** Create the bot with @BotFather, give Hermes the token, make your "Company HQ" group with topics per department, add the bot. Confirm it answers in-channel.

**Step 5 — Mount the brain.** Clone `company-os` onto the server. In Hermes's config, point its skills path at `company-os/skills/` and set its working directory to the repo. Its global instructions (`AGENTS.md`) get your hard rules:

> - Never send an email, submit a PO, or change a payment record without explicit approval in-channel.
> - Money and legal documents are always draft-for-review.
> - When corrected, update the relevant skill or runbook and say what you changed.
> - Post work to the matching department topic.

**Step 6 — First three skills** (write them by hand or ask Hermes to draft, then edit):
1. `write-po` — your PO workflow: pull next PO number, fill template from `knowledge/templates/`, produce PDF, draft the email, **stop for approval**. (You already have this working as a Claude skill — port it; the format is identical.)
2. `vendor-lookup` — find vendor terms/contacts/history in `knowledge/vendors/`, summarize before any outreach.
3. `daily-brief` — scheduled morning post: open quotes awaiting response, POs awaiting confirmation, AR items due this week, pipeline changes.

**Step 7 — MCP, sparingly.** Add only what a CLI can't do well: your Google Drive (for pulling docs into the ingest pipeline) and Airtable if you prefer its MCP over a CLI. Armin's rule applies — every MCP server you *don't* add keeps the agent sharper. Prefer the `tools/*.py` CLIs Pi will build.

**Step 8 — Schedules.** Daily brief (7am), Friday pipeline review, and a weekly **self-review**: "Read this week's sessions; list the three corrections I made most often; propose skill updates." That last one is the learning loop, made deliberate.

---

## 6. Setup Plan B — Pi (the Builder)

**Time: ~30 minutes to running; first useful tool same day.**

**Step 1 — Install** (your laptop, and optionally the VPS later):
```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
cd ~/company-os && pi
```

**Step 2 — Auth.** `/login` for your Claude subscription or set `ANTHROPIC_API_KEY`. For 1Password, `~/.pi/agent/auth.json` supports command execution:
```json
{ "anthropic": { "key": "!op read 'op://Business/Anthropic API/credential'" } }
```

**Step 3 — Wire it into your existing world.** In `~/.pi/agent/settings.json`:
```json
{ "skills": ["~/.claude/skills", "~/company-os/skills"] }
```
Your Claude Code skills now work in Pi unchanged. Add `AGENTS.md` at the repo root (Pi reads it like CLAUDE.md — and reads CLAUDE.md too).

**Step 4 — Build the first four tools** (this is Pi's actual job — one session each):
1. `tools/airtable.py` — thin CLI over your Airtable base: `airtable deals --stage proposal`, `airtable update-deal 123 --stage won`. CLI, not MCP: composable, greppable, zero context cost.
2. `tools/ar.py` — wrap your custom AR progress-payment software's API: `ar status --job 100155`, `ar due --this-week`. **Read-only first.** Write operations come later, gated behind approval.
3. `tools/ingest.py` — the knowledge importer: point at a Drive folder or a stack of PDFs → extracted markdown in `knowledge/`, with frontmatter, one commit per batch. This unlocks your "import lots of info quick" requirement.
4. `tools/quotes.py` — quote/PO tracker (SQLite table or an Airtable table): `quotes open`, `quotes add`, `quotes mark-received`.

Each tool gets a matching skill file telling agents when and how to use it. Now *Hermes* can call all four from bash — the two agents compose through the repo.

**Step 5 — Try self-extension once** so you learn the loop: "Pi, write an extension that asks for confirmation before any bash command containing `rm`, `curl … | sh`, or `git push --force`." It will read its own docs and build it; `/reload` and it's live. This is the same mechanic Shopify used to bootstrap autoresearch.

**Step 6 — Marketing/site work.** Run Pi in your Astro repo for site changes, catalog generation (markdown → PDF via the templates), YouTube metadata scripts, image processing scripts. Same pattern: build a small CLI, wrap it in a skill, hand it to Hermes for the recurring runs.

**Step 7 (later) — Autoresearch.** Once something has a scoreboard — Lighthouse score on the Astro site, build time, test suite speed — install the open-sourced `pi-autoresearch` extension, write `autoresearch.md` (goal + rules) and `autoresearch.sh` (prints the number), and let it run overnight. Review the PR like Tobi did: expect some overfitting; keep what's real.

---

## 7. Department Playbooks (order of rollout)

**1. Knowledge base — do this first (week 1–2).** Everything else compounds on it. Batch-import with `ingest.py`: vendors → machines → templates → contracts → parts. Quality bar: can an agent answer "what are our payment terms with X?" and "what's the lead time on Y?" from files alone? Shopify's data lesson: this step *is* the AI strategy.

**2. Purchasing / AP (week 2–3).** Port your PO skill to `company-os`. Add: quote-request drafting (pulls vendor file + part specs), quote tracking (`quotes.py` + a chase schedule — "nudge me when a quote is 3 days unanswered"), order confirmation logging, AP calendar in the daily brief. **Human sends everything for the first month;** graduate routine reorders to auto-send-with-notification only after the error rate is proven.

**3. AR (week 3–4).** Read-only integration first: `ar.py status/due/overdue` feeding the daily brief and on-demand answers. Then drafting: progress-payment reminder emails from templates + customer file + AR data, approved in-channel. Write access to the AR system is the *last* thing you enable, if ever — drafting and reporting captures most of the value at a fraction of the risk.

**4. Sales (week 4–6).** Load `knowledge/sales/` with your best emails, win/loss notes, objection handling, features/benefits per machine. Skills: `sales-email` (draft in your voice, cite the knowledge used), `pipeline-update` (Airtable via CLI), `proposal-builder` (templates + machine specs → customer-ready doc), `contract-draft` (clause library; always human-reviewed). Monthly learning job: "Read this month's sent sales emails and outcomes; update the features/benefits knowledge with what resonated." That's your self-improving sales KB.

**5. Marketing (week 6+).** Pi builds the pipelines; Hermes runs the calendar: LinkedIn drafts from shop activity (2–3/week to approve), YouTube titles/descriptions/chapters from transcripts, catalog regeneration from `knowledge/machines/`, Astro site edits as PRs you merge.

---

## 8. Guardrails (non-negotiables)

- **Draft-don't-send** is the default for anything leaving the building (email, PO, post, payment). Approval happens in-channel, where it's logged. Widen autonomy per-workflow only after a clean track record — narrow scopes like "reorders under $500 from approved vendors" first.
- **Money and contracts always have a human in the loop.** Full stop.
- **Secrets live in 1Password**, injected via `op read` (both harnesses support this). Agents never see raw keys in files; the AR software gets a scoped, read-only credential to start.
- **Contain the blast radius:** Hermes on its own VPS/user with a Docker backend; Pi in Docker (or Gondolin) for anything untrusted; separate git identity for agents so commits are attributable.
- **Pin versions** of both agents; update on your schedule, read changelogs — both projects move fast.
- **Prompt-injection awareness:** agents that read inbound email/webpages can be steered by their content. Keep read-inbox workflows draft-only, and treat "the email told the agent to do X" as a real failure class.

---

## 9. Roadmap

| Phase | Focus | Done when |
|---|---|---|
| **Week 1** | Install both; create `company-os`; first knowledge import; Hermes on Telegram; port PO skill | You've approved a Hermes-drafted PO from your phone |
| **Weeks 2–4** | Pi builds the 4 tools; purchasing + AR read-only live; daily brief running | Morning brief accurately reflects quotes/POs/AR without you checking systems |
| **Month 2** | Sales KB + skills; marketing calendar; weekly self-review job; first autonomy graduations | An agent-drafted sales email you sent essentially unedited; ≥3 skills improved via the learning loop |
| **Month 3** | Autoresearch on a scoreboard; Hermes→Pi delegation wired; evaluate Prime Agent & omp; consider second seat in channels | The system improved something measurable overnight while you slept |

**Weekly operating rhythm** (30 min, Fridays): read the #agent-improvements topic, approve/reject proposed skill updates, delete automations you stopped using (Armin's rule), pick next week's one new workflow. The compounding lives in this half hour.

---

## 10. Sources

**Shopify:** [Autoresearch isn't just for training models](https://shopify.engineering/autoresearch) · [Under the River](https://shopify.engineering/under-the-river) · [AI Data Strategy](https://www.shopify.com/enterprise/blog/ai-data-strategy) · [Tobi's River/Lehrwerkstatt post](https://x.com/tobi/status/2053121182044451016) · [Simon Willison: Learning on the Shop floor](https://simonwillison.net/2026/May/11/learning-on-the-shop-floor/) · [MindStudio article](https://www.mindstudio.ai/blog/how-to-make-ai-work-visible-shopify-river) *(validated: accurate on culture, lacks architecture — prefer Shopify's own posts)*

**Pi / Earendil:** [earendil-works/pi](https://github.com/earendil-works/pi) · [pi.dev](https://pi.dev) · [Pi, Minimal and Performant (Databricks + Autoresearch)](https://earendil.com/posts/pi-autoresearch-and-databricks/) · [Databricks harness benchmark](https://www.databricks.com/blog/benchmarking-coding-agents-databricks-multi-million-line-codebase) · [Mario Zechner: What if you don't need MCP at all?](https://mariozechner.at/posts/2025-11-02-what-if-you-dont-need-mcp/)

**Hermes / Nous:** [NousResearch/hermes-agent](https://github.com/nousresearch/hermes-agent) · [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/) · [TechCrunch on Nous funding](https://techcrunch.com/2026/07/13/hermes-agent-maker-nous-research-in-talks-for-new-funding-at-1-5b-valuation/)

**Prime Intellect / omp:** [Prime Agent blog](https://www.primeintellect.ai/blog/prime-agent) · [PrimeIntellect-ai/prime-agent](https://github.com/PrimeIntellect-ai/prime-agent) · [can1357/oh-my-pi (omp.sh)](https://github.com/can1357/oh-my-pi) · [hermes-oh-my-pi-mcp bridge](https://github.com/cassiopeiaym/hermes-oh-my-pi-mcp)

**Armin Ronacher:** [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff) · [Tools: Code Is All You Need](https://lucumr.pocoo.org/2025/7/3/tools/) · [Your MCP Doesn't Need 30 Tools](https://lucumr.pocoo.org/2025/8/18/code-mcps/) · [Skills vs Dynamic MCP Loadouts](https://lucumr.pocoo.org/2025/12/13/skills-vs-mcp/) · [Agent Design Is Still Hard](https://lucumr.pocoo.org/2025/11/21/agents-are-hard/)

*Note: some pages were reconstructed via search + corroborating secondary coverage where direct fetches were blocked from this environment; figures cross-checked across at least two sources where possible.*
