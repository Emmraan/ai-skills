# AI Skills - Auto-Updating SKILLS.md System

## Overview

**AI Skills** is a production-grade, open-source system that auto-generates and distributes framework-agnostic SKILLS.md files for AI agents. The system fetches official documentation, normalizes it through an LLM, and distributes curated skills across multiple AI agent platforms via an NPX CLI.

## Features

- ✨ **Provider-agnostic LLM integration** - Works with Claude, GPT, Gemini, or any OpenAI-compatible API
- 🔄 **Automated skill generation** - GitHub Actions cron-based workflow (weekly + manual trigger)
- 📦 **Multi-platform distribution** - Install skills to `.claude/`, `.gemini/`, `.vscode/`, `.agents/`, and more
- 🎯 **High-quality normalization** - LLM extracts only rules, patterns, security notes, and best practices
- 💰 **Low token usage** - Diff-based fetching; only sends changed content to LLM
- 🛡️ **Production-ready** - Strict validation, deduplication, clarity enforcement
- 🧩 **Framework-agnostic** - Skills for React, Vue, Python, TypeScript, Node.js, Testing, and more
- 🚀 **Zero vendor lock-in** - All code deterministic and extensible

## Quick Start

### Installation

```bash
npm install -g @emmraan/ai-skills
# or
npx @emmraan/ai-skills list
```

### Usage

```bash
# Install a skill
npx @emmraan/ai-skills react

# To view all commands
npx @emmraan/ai-skills --help
```

### Interactive CLI flow

Running [`ai-skills <skill>`](packages/cli/src/index.ts:63) with no install flags now prompts for:

1. Install location: Local (current project) or Global (agent platforms)
2. Install target: All platforms or specific platforms (for both Local and Global)

Running [`ai-skills remove <skill>`](packages/cli/src/index.ts:63) with no remove flags now prompts for:

1. Remove location: Local (current project) or Global (agent platforms)
2. Remove target: All platforms or specific platforms (for both Local and Global)

Non-interactive install flags:

- `--local`
- `--global`
- `--platform <name[,name]>`
- `--all`

Non-interactive remove flags:

- `--local`
- `--global`
- `--platform <name[,name]>`
- `--all`

Default behavior remains **global + all platforms** when prompts are not used.

### CLI UX enhancements

- Subtle startup banner in TTY sessions
- Colored status logs
- Spinners for install/remove progress
- Interactive prompts powered by `inquirer`

## Architecture

### Monorepo Structure

```
ai-skills/
├── packages/
│   ├── cli/                    # NPX-invocable CLI tool (Node.js)
│   ├── skills-registry/        # SKILLS.md files repository
│   └── shared-types/           # Shared TypeScript types/interfaces
├── backend/
│   └── python/                 # LLM generator + validation (Python)
├── .github/workflows/          # GitHub Actions automation
├── docs/                       # Architecture & extension docs
└── plans/                      # Implementation phase tracking
```

### Component Responsibilities

| Component             | Language   | Purpose                                                   |
| --------------------- | ---------- | --------------------------------------------------------- |
| **CLI**               | TypeScript | Download skills, install to agent folders, manage updates |
| **Backend Generator** | Python     | Fetch docs, call LLM, validate, commit to registry        |
| **Skills Registry**   | JSON       | Central SKILLS.md storage with metadata index             |
| **Shared Types**      | TypeScript | Validation schemas, interfaces for both CLI and backend   |

## Development

### Prerequisites

- Node.js 18+
- pnpm 9.0+
- Python 3.11+
- Python Virtual Environment (Recommended)

### Setup Node and Python(Backend)

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run validation
pnpm validate

# Run tests
pnpm test

# Format code
pnpm format

#====================

# Python Setup
cd backend/python

Linux/MacOS: virtualenv -p /usr/bin/python3 venv
#OR
Windows: python -m venv venv

# For activate:
Windows: .\venv\Scripts\activate
Linux/MacOS: source venv/bin/activate

# Install Packages
pip install -r requirements.txt --no-build-isolation

# Run Workspace Tests (Node)
cd ../..
pnpm test

# Run Python Backend Tests (venv required)
# 1) Create + activate venv (see above)
# 2) Install Python deps:
#    pip install -r requirements.txt --no-build-isolation
# 3) Run tests:
python -m pytest tests/
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
LLM_BASE_URL=https://api.anthropic.com/v1
LLM_API_KEY=your-api-key
LLM_MODEL=claude-3-5-sonnet-20241022
GITHUB_TOKEN=ghp_xxxx
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Adding new skills
- Creating source descriptors
- Extending LLM prompts
- Supporting new agent platforms

## License

MIT

## Support

- 📖 [Architecture Overview](docs/ARCHITECTURE.md)
- 🔧 [Extension Guide](docs/EXTENDING.md)
- 📋 [SKILLS.md Specification](docs/SKILL_SPEC.md)
- 📝 [Example React Skill](docs/EXAMPLE_REACT_SKILL.md)
- 🤝 [Contributing Guidelines](CONTRIBUTING.md)
