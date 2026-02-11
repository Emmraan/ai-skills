# Extending AI-Skills

This guide explains how to extend the AI-Skills system to add new skills, customize LLM prompts, and support additional AI agent platforms.

## Table of Contents

- [Adding a New Skill](#adding-a-new-skill)
- [Customizing LLM Prompts](#customizing-llm-prompts)
- [Adding a New Agent Platform](#adding-a-new-agent-platform)
- [Adding a New LLM Provider](#adding-a-new-llm-provider)
- [Modifying Validation Rules](#modifying-validation-rules)

---

## Adding a New Skill

### Step 1: Create Source Descriptor

Create a new JSON file in [`backend/sources/`](../backend/sources/) with the format:

```json
{
  "skill_name": "your-skill-name",
  "sources": [
    {
      "type": "url",
      "url": "https://example.com/docs",
      "sections": ["Best Practices", "Guidelines"]
    },
    {
      "type": "github_releases",
      "repo": "owner/repo",
      "last_n_releases": 3
    },
    {
      "type": "changelog",
      "url": "https://raw.githubusercontent.com/owner/repo/main/CHANGELOG.md"
    }
  ]
}
```

### Source Types

| Type              | Description                | Required Fields | Optional Fields   |
| ----------------- | -------------------------- | --------------- | ----------------- |
| `url`             | Fetch from a URL           | `url`           | `sections`        |
| `github_releases` | Fetch from GitHub releases | `repo`          | `last_n_releases` |
| `changelog`       | Fetch changelog file       | `url`           | -                 |
| `github_api`      | Use GitHub API             | `repo`          | `endpoint`        |

### Step 2: Run the Generator

```bash
cd backend
pnpm run generate --skill your-skill-name
```

Or run directly with Python:

```bash
cd backend/python
python main.py --skill your-skill-name
```

### Step 3: Review and Validate

The generated skill will be created at:

```
packages/skills-registry/skills/your-skill-name/SKILLS.md
```

Validate the skill:

```bash
cd packages/skills-registry
pnpm run validate-all-skills
```

### Step 4: Update Registry Index

Update [`packages/skills-registry/skills/.index.json`](../packages/skills-registry/skills/.index.json):

```json
{
  "skills": {
    "your-skill-name": {
      "version": "1.0.0",
      "domains": ["category1", "category2"],
      "lastGenerated": "2026-02-11T00:00:00Z"
    }
  }
}
```

### Step 5: Test Installation

```bash
npx @emmraan/ai-skills your-skill-name
```

### Example: Adding a Vue 3 Skill

Create [`backend/sources/vue-sources.json`](../backend/sources/vue-sources.json):

```json
{
  "skill_name": "vue",
  "sources": [
    {
      "type": "url",
      "url": "https://vuejs.org/guide/introduction.html",
      "sections": ["Essentials", "Best Practices", "Style Guide"]
    },
    {
      "type": "github_releases",
      "repo": "vuejs/core",
      "last_n_releases": 3
    },
    {
      "type": "changelog",
      "url": "https://raw.githubusercontent.com/vuejs/core/main/CHANGELOG.md"
    }
  ]
}
```

---

## Customizing LLM Prompts

### Understanding the System Prompt

The system prompt is defined in [`backend/python/skill_normalizer.py`](../backend/python/skill_normalizer.py). It enforces:

- JSON schema compliance
- Sentence clarity (rejects vague statements)
- Deduplication across sections
- Strict adherence to section limits

### Modifying the System Prompt

Edit the `SYSTEM_PROMPT` constant in [`skill_normalizer.py`](../backend/python/skill_normalizer.py):

```python
SYSTEM_PROMPT = """You are a technical documentation expert. Extract and normalize best practices from provided documentation into structured JSON.

STRICT RULES:
1) Each item must be actionable and specific.
2) No vague statements (avoid: "should", "try", "might").
3) Deduplicate identical or near-identical items.
4) Do NOT invent information.
5) Preserve version-specific context.
6) Return ONLY valid JSON.

CUSTOM RULES:
7) [Add your custom rules here]
8) [Add more rules as needed]
"""
```

### Adding Custom Validation Rules

Edit [`backend/python/skill_validator.py`](../backend/python/skill_validator.py) to add custom validation:

```python
def validate_custom_rules(skill: NormalizedSkill) -> ValidationResult:
    errors = []

    # Example: Require specific keywords in rules
    for rule in skill.rules:
        if not any(keyword in rule.lower() for keyword in ['must', 'always', 'never']):
            errors.append(f"Rule must contain imperative language: {rule}")

    return ValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=[]
    )
```

### Customizing Section Limits

Edit the section limits in [`packages/shared-types/src/types.ts`](../packages/shared-types/src/types.ts):

```typescript
export const SKILL_SPEC = {
  section_limits: {
    rules: 10, // Change to 15 for more rules
    patterns: 10, // Change to 15 for more patterns
    anti_patterns: 5, // Change to 8 for more anti-patterns
    security: 5,
    performance: 5,
    tooling: 5,
  },
};
```

---

## Adding a New Agent Platform

### Step 1: Identify the Platform Folder

Determine the folder name for the new platform. Common patterns:

- `.platform-name/` (e.g., `.openai/`, `.custom/`)
- Platform-specific subfolder (e.g., `.agents/openai/`)

### Step 2: Update CLI Configuration

Edit [`packages/cli/src/core/config.ts`](../packages/cli/src/core/config.ts):

```typescript
export const AGENT_FOLDERS = [
  '.claude/',
  '.gemini/',
  '.vscode/',
  '.opencode/',
  '.codex/',
  '.agents/',
  '.your-platform/', // Add your platform here
];
```

### Step 3: Update Installer

The [`installer.ts`](../packages/cli/src/core/installer.ts) automatically handles all folders in `AGENT_FOLDERS`. No additional changes needed.

### Step 4: Test Installation

```bash
npx @emmraan/ai-skills react
```

The skill will be installed to all agent folders including your new platform.

### Example: Adding OpenAI Platform

```typescript
// packages/cli/src/core/config.ts
export const AGENT_FOLDERS = [
  '.claude/',
  '.gemini/',
  '.vscode/',
  '.opencode/',
  '.codex/',
  '.agents/',
  '.openai/', // New platform
];
```

After installation, the skill will be available at:

- `.openai/skills/react/SKILLS.md`

---

## Adding a New LLM Provider

### Understanding Provider Configuration

The system uses a provider-agnostic approach via [`config.py`](../backend/python/config.py):

```python
class Config:
    LLM_BASE_URL: str
    LLM_API_KEY: Optional[str]
    LLM_MODEL: str
```

### Step 1: Configure Environment Variables

Add to [`.env`](../.env.example):

```env
# Example: OpenAI
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-your-openai-key
LLM_MODEL=gpt-4-turbo

# Example: Anthropic
LLM_BASE_URL=https://api.anthropic.com/v1
LLM_API_KEY=sk-ant-your-anthropic-key
LLM_MODEL=claude-3-5-sonnet-20241022

# Example: Local LLM (Ollama)
LLM_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=  # Leave empty for local LLMs
LLM_MODEL=llama2
```

### Step 2: Test the Connection

```bash
cd backend/python
python -c "from llm_client import LLMClient; from config import Config; client = LLMClient(Config()); print('Connected!')"
```

### Step 3: Run Generation

```bash
python main.py --skill react
```

### Supported Providers

| Provider       | Base URL                                           | API Key Required |
| -------------- | -------------------------------------------------- | ---------------- |
| Anthropic      | `https://api.anthropic.com/v1`                     | Yes              |
| OpenAI         | `https://api.openai.com/v1`                        | Yes              |
| Gemini         | `https://generativelanguage.googleapis.com/v1beta` | Yes              |
| Ollama (Local) | `http://localhost:11434/v1`                        | No               |
| vLLM (Local)   | `http://localhost:8000/v1`                         | No               |
| Together AI    | `https://api.together.xyz/v1`                      | Yes              |
| Groq           | `https://api.groq.com/openai/v1`                   | Yes              |

### Custom Provider Headers

If your provider requires custom headers, edit [`llm_client.py`](../backend/python/llm_client.py):

```python
def _get_headers(self) -> dict:
    headers = {
        "Content-Type": "application/json",
    }

    if self.config.LLM_API_KEY:
        # Customize based on provider
        if "anthropic" in self.config.LLM_BASE_URL:
            headers["x-api-key"] = self.config.LLM_API_KEY
            headers["anthropic-version"] = "2023-06-01"
        else:
            headers["Authorization"] = f"Bearer {self.config.LLM_API_KEY}"

    return headers
```

---

## Modifying Validation Rules

### Understanding the Validation Pipeline

Validation happens in [`skill_validator.py`](../backend/python/skill_validator.py):

1. **Schema Validation**: Checks all required fields exist
2. **Type Validation**: Ensures correct data types
3. **Content Validation**: Checks for vague language, duplicates
4. **URL Validation**: Validates all source URLs
5. **Timestamp Validation**: Ensures ISO 8601 format

### Adding Custom Validators

Create a new validator function in [`skill_validator.py`](../backend/python/skill_validator.py):

```python
def validate_custom_rules(skill: NormalizedSkill) -> ValidationResult:
    """Custom validation rules for specific requirements."""
    errors = []
    warnings = []

    # Example: Require specific domains
    valid_domains = ['frontend', 'backend', 'testing', 'devops']
    for domain in skill.domains:
        if domain not in valid_domains:
            errors.append(f"Invalid domain: {domain}")

    # Example: Check for version-specific notes
    if not skill.version_notes:
        warnings.append("No version-specific notes provided")

    return ValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings
    )
```

### Modifying Vague Language Detection

Edit the vague language patterns in [`skill_validator.py`](../backend/python/skill_validator.py):

```python
VAGUE_PATTERNS = [
    r'\bshould\b',
    r'\btry\b',
    r'\bmight\b',
    r'\bpossibly\b',
    r'\bperhaps\b',
    r'\bseems\b',
    r'\bappears\b',
    r'\bmay\b',
    r'\bcould\b',  # Add new pattern
    r'\bwould\b',  # Add new pattern
]
```

### Adding Section-Specific Validation

```python
def validate_security_section(skill: NormalizedSkill) -> ValidationResult:
    """Validate security section has specific content."""
    errors = []

    if not skill.security:
        errors.append("Security section is required")
        return ValidationResult(valid=False, errors=errors, warnings=[])

    # Check for security-specific keywords
    security_keywords = ['sanitize', 'validate', 'encrypt', 'authenticate']
    for item in skill.security:
        if not any(keyword in item.lower() for keyword in security_keywords):
            warnings.append(f"Security item may be too generic: {item}")

    return ValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings
    )
```

---

## Advanced Extensions

### Custom Source Fetchers

To add a new source type, extend [`source_fetcher.py`](../backend/python/source_fetcher.py):

```python
class CustomSourceFetcher(SourceFetcher):
    def fetch_custom_source(self, source: SourceConfig) -> str:
        """Fetch from custom source type."""
        if source.type == 'custom_type':
            # Implement custom fetching logic
            response = requests.get(source.url, headers=self.headers)
            return self._extract_content(response.text)
        return ""
```

### Custom Output Formats

To generate skills in formats other than Markdown, modify [`skill_normalizer.py`](../backend/python/skill_normalizer.py):

```python
def generate_json_output(skill: NormalizedSkill) -> str:
    """Generate JSON output instead of Markdown."""
    return json.dumps(skill.model_dump(), indent=2)

def generate_html_output(skill: NormalizedSkill) -> str:
    """Generate HTML output."""
    # Implement HTML generation
    pass
```

### Multi-Language Skills

To support skills in multiple languages:

1. Add `language` field to source descriptor:

```json
{
  "skill_name": "react",
  "language": "es",  # Spanish
  "sources": [...]
}
```

2. Modify system prompt to handle language:

```python
SYSTEM_PROMPT = f"""You are a technical documentation expert.
Extract and normalize best practices into {language} JSON.
"""
```

---

## Testing Your Extensions

### Unit Tests

Create tests in [`backend/python/tests/`](../backend/python/tests/):

```python
# test_custom_validator.py
import pytest
from skill_validator import validate_custom_rules
from shared_types import NormalizedSkill

def test_custom_validator():
    skill = NormalizedSkill(
        name="test",
        purpose="Test skill",
        version="1.0.0",
        domains=["frontend"],
        principles=["Test principle"],
        rules=["Test rule"],
        patterns=["Test pattern"],
        anti_patterns=["Test anti-pattern"],
        security=[],
        performance=[],
        tooling=[],
        version_notes=[],
        last_updated="2026-02-11T00:00:00Z",
        sources=["https://example.com"]
    )

    result = validate_custom_rules(skill)
    assert result.valid
```

### Integration Tests

Test the full generation pipeline:

```bash
cd backend/python
python main.py --skill your-skill-name --dry-run
```

### CLI Tests

Test CLI installation:

```bash
npx @emmraan/ai-skills your-skill-name
npx @emmraan/ai-skills list
npx @emmraan/ai-skills remove your-skill-name
```

---

## Contributing Your Extensions

If you've created a useful extension, consider contributing it back:

1. Fork the repository
2. Create a feature branch
3. Add tests for your extension
4. Update documentation
5. Submit a pull request

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contribution guidelines.

---

## Getting Help

- **Documentation**: See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for system overview
- **Specification**: See [`SKILL_SPEC.md`](./SKILL_SPEC.md) for skill format
- **Issues**: Report bugs or request features on GitHub
- **Discussions**: Ask questions in GitHub Discussions
