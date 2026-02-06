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
npm install -g ai-skills
# or
npx ai-skills list
```

### Usage

```bash
# Install a skill
npx ai-skills react

# List all available skills
npx ai-skills list

# Update all installed skills
npx ai-skills update

# Remove a skill
npx ai-skills remove react
```

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

### Setup

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
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
LLM_BASE_URL=https://api.anthropic.com/v1
LLM_API_KEY=your-api-key
LLM_MODEL=claude-3-5-sonnet-20241022
GITHUB_TOKEN=ghp_xxxx
```

## Project Phases

The implementation is organized into 6 phases (see [plans/PLAN.md](plans/PLAN.md)):

- **Phase 0**: Project scaffolding ✅ (current)
- **Phase 1**: Skills registry & schema
- **Phase 2**: Backend generator (Python)
- **Phase 3**: CLI tool (Node.js)
- **Phase 4**: GitHub Actions automation
- **Phase 5**: Documentation & examples
- **Phase 6**: Testing & CI pipeline

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines on:

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
