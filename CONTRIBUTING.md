# Contributing to AI-Skills

Thank you for your interest in contributing to AI-Skills! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

**Key Principles:**

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **pnpm**: 10.x or higher
- **Python**: 3.11 or higher (for backend development)
- **Git**: Latest stable version

### Setting Up Development Environment

1. **Fork and Clone the Repository**

```bash
git clone https://github.com/your-username/ai-skillls.git
cd ai-skillls
```

2. **Install Dependencies**

```bash
pnpm install
```

3. **Set Up Environment Variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Verify Installation**

```bash
pnpm test
pnpm run lint
```

---

## How to Contribute

### Types of Contributions

We welcome the following types of contributions:

1. **New Skills**: Add support for new frameworks, languages, or domains
2. **Bug Fixes**: Fix issues in existing code
3. **Documentation**: Improve or add documentation
4. **Performance**: Optimize existing code
5. **Features**: Add new functionality

### Adding a New Skill

See [`docs/EXTENDING.md`](docs/EXTENDING.md#adding-a-new-skill) for detailed instructions.

**Quick Summary:**

1. Create source descriptor in [`backend/sources/`](backend/sources/)
2. Run the generator: `cd backend && pnpm run generate --skill your-skill`
3. Validate the generated skill
4. Update the registry index
5. Submit a pull request

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**Bug Report Template:**

```markdown
**Description**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**

- OS: [e.g. Windows 10, macOS 13, Ubuntu 22.04]
- Node.js version: [e.g. 18.17.0]
- pnpm version: [e.g. 8.6.0]
- Python version: [e.g. 3.11.4]

**Additional Context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions help us improve the project. When suggesting an enhancement:

1. Use a clear and descriptive title
2. Provide a detailed description of the suggested enhancement
3. Explain why this enhancement would be useful
4. Provide examples of how the enhancement would be used

---

## Development Workflow

### Branch Naming

Use the following branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

**Examples:**

```bash
git checkout -b feature/add-vue-skill
git checkout -b fix/llm-client-retry-logic
git checkout -b docs/update-readme
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(cli): add update command for skill updates

Add a new update command that checks for newer versions
of installed skills and updates them automatically.

Closes #123
```

```
fix(backend): handle LLM API rate limits

Implement exponential backoff when LLM API returns
429 Too Many Requests status.

Fixes #456
```

### Development Commands

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run linting
pnpm run lint

# Format code
pnpm run format

# Build CLI
pnpm --filter=@ai-skills/cli run build

# Run backend generator
cd backend && pnpm run generate --skill react

# Validate all skills
cd packages/skills-registry && pnpm run validate-all-skills
```

---

## Pull Request Process

### Before Submitting

1. **Update Documentation**: Ensure any relevant documentation is updated
2. **Add Tests**: Add tests for new functionality or bug fixes
3. **Run Tests**: Ensure all tests pass
4. **Run Linting**: Ensure code passes linting
5. **Update Changelog**: Add an entry to [`CHANGELOG.md`](CHANGELOG.md)

### Pull Request Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

Describe the tests you ran to verify your changes.

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Related Issues

Closes #123
Related to #456
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: Maintainers review your code
3. **Feedback**: Address any feedback or requested changes
4. **Approval**: Once approved, your PR will be merged

### Merge Policies

- **Squash Merge**: Commits are squashed into a single commit
- **Rebase**: Keep commit history clean
- **No Merge Commits**: Avoid merge commits in the main branch

---

## Coding Standards

### TypeScript (CLI)

- Use **TypeScript** for all new code
- Follow **ESLint** rules defined in [`.eslintrc.cjs`](.eslintrc.cjs)
- Use **Prettier** for code formatting (see [`.prettierrc.json`](.prettierrc.json))
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and interfaces
- Add **JSDoc** comments for public APIs

**Example:**

```typescript
/**
 * Downloads a skill from the registry
 * @param skillName - The name of the skill to download
 * @returns The skill content as a string
 * @throws {Error} If the skill cannot be found or downloaded
 */
export async function downloadSkill(skillName: string): Promise<string> {
  // Implementation
}
```

### Python (Backend)

- Follow **PEP 8** style guide
- Use **type hints** for function parameters and return values
- Add **docstrings** for all functions and classes
- Use **snake_case** for variables and functions
- Use **PascalCase** for classes

**Example:**

```python
def fetch_source(url: str, timeout: int = 30) -> str:
    """
    Fetch content from a URL with timeout handling.

    Args:
        url: The URL to fetch from
        timeout: Request timeout in seconds

    Returns:
        The fetched content as a string

    Raises:
        RequestException: If the request fails
    """
    response = requests.get(url, timeout=timeout)
    response.raise_for_status()
    return response.text
```

### Markdown (Documentation)

- Use **sentence case** for headings
- Use **backticks** for inline code
- Use **fenced code blocks** with language specification
- Add **links** to related documentation
- Keep lines under **100 characters** when possible

---

## Testing

### Unit Tests

Write unit tests for all new functionality:

```typescript
// packages/cli/src/utils/__tests__/hash.test.ts
import { describe, it, expect } from 'vitest';
import { calculateHash } from '../hash';

describe('calculateHash', () => {
  it('should return consistent hash for same input', () => {
    const content = 'test content';
    const hash1 = calculateHash(content);
    const hash2 = calculateHash(content);
    expect(hash1).toBe(hash2);
  });
});
```

### Integration Tests

Test the full workflow:

```python
# backend/python/tests/test_integration.py
def test_full_generation_flow():
    """Test the complete skill generation pipeline."""
    skill = generate_skill('react')
    assert skill.name == 'react'
    assert len(skill.rules) > 0
    assert len(skill.patterns) > 0
```

### Test Coverage

- Aim for **70%+** code coverage
- Focus on critical paths and edge cases
- Run tests before committing: `pnpm test`

---

## Documentation

### Documentation Standards

- Keep documentation **clear and concise**
- Use **examples** to illustrate concepts
- Update documentation when code changes
- Include **screenshots** for UI-related features
- Use **consistent terminology** throughout

### Documentation Files

- [`README.md`](README.md) - Project overview and quick start
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - System architecture
- [`docs/EXTENDING.md`](docs/EXTENDING.md) - Extension guide
- [`docs/SKILL_SPEC.md`](docs/SKILL_SPEC.md) - Skill specification
- [`CONTRIBUTING.md`](CONTRIBUTING.md) - This file

### Adding Documentation

When adding new features:

1. Update relevant documentation files
2. Add examples in [`docs/EXAMPLE_REACT_SKILL.md`](docs/EXAMPLE_REACT_SKILL.md)
3. Update [`CHANGELOG.md`](CHANGELOG.md) with user-facing changes

---

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions and share ideas
- **Documentation**: Check existing docs first
- **Code Examples**: Look at existing skills for reference

---

## License

By contributing to AI-Skills, you agree that your contributions will be licensed under the same license as the project.

---

## Recognition

Contributors are recognized in the project's contributors list. Thank you for your contributions!

---

## Additional Resources

- [Project Architecture](docs/ARCHITECTURE.md)
- [Extension Guide](docs/EXTENDING.md)
- [Skill Specification](docs/SKILL_SPEC.md)
- [Example Skills](packages/skills-registry/skills/)
