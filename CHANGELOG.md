# Changelog

All notable changes to the AI-Skills project will be documented in this file.

## [1.0.2] - 2026-02-11

### Added

#### Phase 0: Project Scaffolding
- Monorepo structure with pnpm workspace configuration
- Root `package.json` with shared dev dependencies
- Shared TypeScript configuration (`tsconfig.json`)
- Shared ESLint configuration (`.eslintrc.cjs`)
- Shared Prettier configuration (`.prettierrc.json`)
- Environment variable template (`.env.example`)
- Directory structure for packages, backend, and documentation
- Shared types package (`packages/shared-types/`)

#### Phase 1: Skills Registry & Schema
- SKILLS.md specification (`docs/SKILL_SPEC.md`)
- Skills registry package (`packages/skills-registry/`)
- 6 example SKILLS.md files:
  - React (18.2.0)
  - Vue (3.4.0)
  - Python (3.12.0)
  - TypeScript (5.3.0)
  - Node.js (20.10.0)
  - Testing (1.0.0)
- Metadata registry (`skills/.index.json`)
- Validation scripts for skill schema compliance

#### Phase 2: Backend Generator (Python)
- Python backend structure (`backend/python/`)
- Provider-agnostic LLM client (`llm_client.py`)
- Source fetcher with multiple source types (`source_fetcher.py`)
- Skill normalizer with LLM prompting (`skill_normalizer.py`)
- Skill validator with schema and quality checks (`skill_validator.py`)
- GitHub sync for automated commits (`github_sync.py`)
- Configuration management (`config.py`)
- Unit tests for all backend modules
- Requirements file with Python dependencies

#### Phase 3: CLI Tool (TypeScript)
- CLI package (`packages/cli/`)
- NPX-invocable entry point (`bin/skills.js`)
- CLI commands:
  - `install` - Install skills to agent folders
  - `remove` - Remove skills from agent folders
  - `list` - List available and installed skills
  - `update` - Update all installed skills
  - `generate-local` - Run generator locally
- Core modules:
  - Configuration management (`config.ts`)
  - Downloader for GitHub raw content (`downloader.ts`)
  - Installer for agent folder placement (`installer.ts`)
  - Lockfile management (`lockfile.ts`)
- Utility modules:
  - Hash calculation (`hash.ts`)
  - Logger with colored output (`logger.ts`)
  - Retry logic with exponential backoff (`retry.ts`)
  - UI helpers with spinners (`ui.ts`)
- Unit tests for CLI commands and core modules

#### Phase 4: GitHub Actions Automation
- Generate skills workflow (`.github/workflows/generate-skills.yml`)
  - Weekly scheduled execution (Sunday 00:00 UTC)
  - Manual trigger support with optional skill parameter
  - Python 3.11 setup with pip caching
  - Node.js 20.x setup with pnpm caching
  - Backend generator execution
  - Change detection and validation
  - Automated commits and PR creation
  - Automatic release creation on version bump
- Validate skills workflow (`.github/workflows/validate-skills.yml`)
  - PR trigger for SKILLS.md changes
  - Schema validation execution
  - Test suite integration
  - PR comment with validation results
- GitHub Secrets configuration guidance

#### Phase 5: Documentation & Examples
- Architecture documentation (`docs/ARCHITECTURE.md`)
  - System diagram with Mermaid visualization
  - Component interaction flows
  - Data flow documentation
  - File structure reference
  - Design decisions and configuration guide
- Extension guide (`docs/EXTENDING.md`)
  - Adding new skills
  - Customizing LLM prompts
  - Adding new agent platforms
  - Configuring new LLM providers
  - Modifying validation rules
- Example source descriptors:
  - `backend/sources/react-sources.json`
  - `backend/sources/vue-sources.json`
  - `backend/sources/python-sources.json`
  - `backend/sources/typescript-sources.json`
  - `backend/sources/nodejs-sources.json`
  - `backend/sources/testing-sources.json`
- Example generated SKILLS.md (`docs/EXAMPLE_REACT_SKILL.md`)
- Contribution guidelines (`CONTRIBUTING.md`)
  - Code of conduct
  - Getting started guide
  - Development workflow
  - Pull request process
  - Coding standards
  - Testing guidelines

### Features

- **Provider-agnostic LLM integration** - Works with Claude, GPT, Gemini, or any OpenAI-compatible API
- **Automated skill generation** - GitHub Actions cron-based workflow (weekly + manual trigger)
- **Multi-platform distribution** - Install skills to `.claude/`, `.gemini/`, `.vscode/`, `.agents/`, and more
- **High-quality normalization** - LLM extracts only rules, patterns, security notes, and best practices
- **Low token usage** - Diff-based fetching; only sends changed content to LLM
- **Production-ready** - Strict validation, deduplication, clarity enforcement
- **Framework-agnostic** - Skills for React, Vue, Python, TypeScript, Node.js, Testing, and more
- **Zero vendor lock-in** - All code deterministic and extensible

### CLI Commands

```bash
# Install a skill
npx @emmraan/ai-skills react

# Install to local project only
npx @emmraan/ai-skills react --local

# Install globally to selected platforms only
npx @emmraan/ai-skills react --platform claude,gemini

# Install globally to all platforms
npx @emmraan/ai-skills react --global --all

# List all available skills
npx @emmraan/ai-skills list

# Update all installed skills
npx @emmraan/ai-skills update

# Remove a skill
npx @emmraan/ai-skills remove react
```

### Supported Skills

| Skill | Version | Domains |
|-------|---------|---------|
| React | 18.2.0 | frontend, ui, frameworks |
| Vue | 3.4.0 | frontend, ui, frameworks |
| Python | 3.12.0 | backend, scripting, data |
| TypeScript | 5.3.0 | frontend, backend, types |
| Node.js | 20.10.0 | backend, runtime, server |
| Testing | 1.0.0 | testing, quality, ci |

### Supported LLM Providers

- Anthropic (Claude)
- OpenAI (GPT)
- Google (Gemini)
- Ollama (Local)
- vLLM (Local)
- Together AI
- Groq

### Supported Agent Platforms

- `.claude/`
- `.gemini/`
- `.vscode/`
- `.opencode/`
- `.codex/`
- `.agents/`

### Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Extension Guide](docs/EXTENDING.md)
- [SKILLS.md Specification](docs/SKILL_SPEC.md)
- [Example React Skill](docs/EXAMPLE_REACT_SKILL.md)
- [Contributing Guidelines](CONTRIBUTING.md)

### Testing

- Unit tests for Python backend modules
- Unit tests for TypeScript CLI commands
- Integration tests for full workflow
- Skill validation tests
- All tests pass with 70%+ coverage

### Security

- API keys stored as GitHub Secrets
- Content sanitization before processing
- URL validation for all sources
- Git commits use GitHub Actions identity
- Input validation against schemas

### Performance

- Delta-based LLM calls (only changed content)
- Response caching to reduce token usage
- Parallel fetching of multiple sources
- Lazy loading for CLI downloads
- Hash-based change detection

---

## Links

- [GitHub Repository](https://github.com/Emmraan/ai-skills)
- [NPM Package](https://www.npmjs.com/package/@emmraan/ai-skills)
- [Documentation](docs/)
- [Issues](https://github.com/Emmraan/ai-skills/issues)
- [Discussions](https://github.com/Emmraan/ai-skills/discussions)
