# SKILLS.md Specification

## Purpose

This document defines the exact format, required sections, and validation rules for all SKILLS.md files in the AI Skills registry. These files contain distilled, production-grade best practices for AI agents working with specific frameworks, languages, or domains.

## Format

Each SKILLS.md file is a Markdown document with YAML frontmatter followed by structured sections.

### YAML Frontmatter

```yaml
---
name: <Skill Name>
version: <Semantic Version>
domains: [<domain1>, <domain2>]
lastGenerated: <ISO 8601 timestamp>
---
```

**Fields:**
- `name` (required, string): Human-readable skill name (e.g., "React", "TypeScript")
- `version` (required, string): Version of the framework/technology (e.g., "18.2.0")
- `domains` (required, array): Categories (e.g., ["frontend", "ui", "frameworks"])
- `lastGenerated` (required, ISO 8601): When the skill was generated/updated

## Required Sections

### 1. Skill: [Name]

Main heading introducing the skill.

```markdown
# Skill: React
```

### 2. Purpose

Brief 1-2 sentence description of the skill's scope and value.

**Rules:**
- Max 150 characters
- Must be specific and actionable
- No vague language ("helps", "improves", "better")

**Example:**
```markdown
## Purpose
Essential patterns and best practices for building scalable React applications with hooks, state management, and performance optimization.
```

### 3. Version

Supported versions and compatibility notes.

**Rules:**
- List minimum version, supported versions, and breaking changes
- Max 200 characters
- Include version-specific notes

**Example:**
```markdown
## Version
React 16.8+ (hooks required), tested on 18.0+. Breaking changes from 17→18 affect async batching.
```

### 4. Principles

High-level philosophy (3-5 bullets).

**Rules:**
- Each principle must be statement of philosophy, not action
- Max 100 characters per principle
- Focus on "why" not "how"

**Example:**
```markdown
## Principles
- Unidirectional data flow ensures predictability
- Composition over inheritance promotes reusability
- Immutable state prevents silent bugs
- Declarative UI matches mental models
```

### 5. Mandatory Rules

Rules that MUST be followed for correctness and security (5-10 items).

**Format:**
```markdown
## Mandatory Rules
- Always render keys when mapping over arrays (`key={id}`, not `key={index}`)
- Never mutate state directly; always use setState or state setters
- Hooks must only be called at component top-level, never in loops or conditionals
- Clean up subscriptions in useEffect cleanup function to prevent memory leaks
```

**Validation:**
- Each item must be actionable
- Include specific examples (e.g., "use `key={id}`")
- No "should" or "try" - use imperative language
- Max 10 items
- Min 3 items

### 6. Recommended Patterns

Patterns for cleaner, more maintainable code (5-10 items).

**Format:**
```markdown
## Recommended Patterns
- Extract complex state logic into custom hooks for reusability
- Use context + useReducer for cross-cutting state management at scale
- Memoize expensive computations with useMemo, but measure first
- Use composition for conditional rendering instead of ternary chains
```

**Validation:**
- Recommendation, not requirement
- Start with "Use", "Prefer", "Consider"
- Max 10 items
- No duplicates with Mandatory Rules

### 7. Anti-Patterns

Common mistakes to avoid (3-5 items).

**Format:**
```markdown
## Anti-Patterns
- Creating new objects/arrays in render triggers reconciliation; cache with useMemo
- Using index as key causes reordering bugs; use stable unique identifiers
- Calling hooks conditionally or in loops breaks React's rules; move to component top-level
- Inline arrow functions in JSX create new references; extract or memoize
```

**Validation:**
- Describe the problem and _why_ it's bad
- Include consequence/impact
- Max 5 items
- No more than 2 technical terms per item

### 8. Security

Security-specific considerations (3-5 items).

**Format:**
```markdown
## Security
- Sanitize user input before rendering; use libraries like DOMPurify for HTML content
- Never store sensitive data (tokens, passwords) in localStorage; use secure httpOnly cookies
- Validate all props and external data; don't trust API responses
- Avoid dangerouslySetInnerHTML unless absolutely necessary and content is validated
```

**Validation:**
- If no security considerations, state: "No framework-specific security concerns."
- Include mitigation strategy
- Max 5 items
- Focus on framework-specific issues, not general security

### 9. Performance

Performance optimization guidelines (3-5 items).

**Format:**
```markdown
## Performance
- Avoid creating new objects/functions in render; memoize with useMemo/useCallback
- Use React.memo for components receiving same props frequently
- Lazy-load components with React.lazy and Suspense for code splitting
- Profile with React DevTools Profiler before optimizing; measure impact
```

**Validation:**
- Include measurement strategy
- Avoid premature optimization advice
- Max 5 items
- Link to profiling tools when relevant

### 10. Tooling

Recommended tools and configurations.

**Format:**
```markdown
## Tooling
- ESLint plugin: `eslint-plugin-react-hooks` enforces rules of hooks
- Performance: React DevTools Profiler for flame charts and component renders
- Type safety: TypeScript with official @types/react packages
- Build: Vite or Create React App for optimal DX
```

**Validation:**
- Only tools directly related to framework/skill
- Include tool name and purpose
- Max 5 items
- Links optional but helpful

### 11. Last-Updated

ISO 8601 timestamp when skill was generated.

**Format:**
```markdown
## Last-Updated
2026-02-06T14:30:00Z
```

### 12. Sources

Original sources used to generate this skill.

**Format:**
```markdown
## Sources
- https://react.dev/ (official documentation)
- https://github.com/facebook/react/blob/main/CHANGELOG.md (release notes)
- https://github.com/facebook/react/releases (18.x releases)
```

**Validation:**
- All URLs must be valid and accessible
- Include brief description of each source in parentheses
- At least 1 source required
- Max 10 sources

---

## Validation Rules

### Global Rules

1. **No Vague Language**: Reject items containing: "should", "try", "might", "possibly", "perhaps", "seems", "appears", "may"
2. **No Duplicates**: No identical or near-identical items across sections
3. **Clarity**: Each item must be understandable without context
4. **Specificity**: Include concrete examples ("use `key={id}`" not "use keys")
5. **Actionability**: Readers should know exactly what to do

### Character Limits

| Section | Min | Max | Unit |
|---------|-----|-----|------|
| Purpose | 50 | 150 | chars |
| Version | 20 | 200 | chars |
| Principles | 20 | 100 | chars (each) |
| Rules (each) | 15 | 150 | chars |
| Patterns (each) | 15 | 150 | chars |
| Anti-Patterns (each) | 20 | 150 | chars |
| Security (each) | 20 | 150 | chars |
| Performance (each) | 20 | 150 | chars |
| Tooling (each) | 15 | 120 | chars |

### Content Requirements

| Section | Min Items | Max Items | Optional? |
|---------|-----------|-----------|-----------|
| Principles | 3 | 5 | No |
| Mandatory Rules | 3 | 10 | No |
| Recommended Patterns | 3 | 10 | No |
| Anti-Patterns | 2 | 5 | No |
| Security | 1 | 5 | Yes* |
| Performance | 1 | 5 | Yes* |
| Tooling | 1 | 5 | Yes* |

*If topic not applicable, state explicitly (e.g., "No framework-specific tooling.")*

---

## Example: Complete SKILLS.md

```markdown
---
name: React
version: 18.2.0
domains: [frontend, ui, frameworks]
lastGenerated: 2026-02-06T00:00:00Z
---

# Skill: React

## Purpose
Essential patterns and best practices for building scalable React applications with hooks, state management, and performance optimization.

## Version
React 16.8+ (hooks required), tested on 18.0–18.2. Breaking changes from 17→18: automatic batching now applies outside event handlers.

## Principles
- Unidirectional data flow ensures predictability and debuggability
- Composition over inheritance promotes component reusability
- Immutable state prevents silent bugs and enables time-travel debugging
- Declarative UI syntax matches mental models of component structure

## Mandatory Rules
- Always provide stable keys when rendering lists; never use array index as key
- Never mutate state directly; always use setState or hook setters
- Call hooks only at component top-level, never inside loops or conditionals
- Clean up subscriptions in useEffect return function to prevent memory leaks
- Validate prop types or use TypeScript to catch type mismatches early
- Never call React hooks inside regular JavaScript functions or class methods

## Recommended Patterns
- Extract complex state logic into custom hooks for better code sharing
- Use context with useReducer for cross-cutting concerns at scale
- Memoize expensive computations with useMemo after profiling confirms benefit
- Lazy-load components with React.lazy and Suspense for code splitting
- Use React.memo for components that receive identical props frequently

## Anti-Patterns
- Creating new objects or arrays in render causes reconciliation; cache with useMemo
- Passing brand-new functions as props defeats React.memo optimization
- Using array index as key causes reordering bugs on list mutations
- Inline object literals in JSX create new references on every render
- Circular component imports cause bundler issues; use lazy loading instead

## Security
- Sanitize user input before rendering; use DOMPurify for HTML content
- Never store sensitive data in localStorage; use secure httpOnly cookies
- Validate all external API data; don't trust responses without validation
- Avoid dangerouslySetInnerHTML unless content is guaranteed safe and validated

## Performance
- Use React DevTools Profiler to measure component render times before optimizing
- Memoize callbacks with useCallback if passed as dependency to memoized child
- Code-split with React.lazy to reduce initial bundle size for large apps
- Batch state updates in event handlers to reduce re-renders (automatic in React 18)

## Tooling
- ESLint plugin: `eslint-plugin-react-hooks` enforces rules of hooks
- React DevTools browser extension for component tree inspection and profiling
- TypeScript for type safety; include @types/react and @types/react-dom
- Vite or Create React App for build tooling and dev server

## Last-Updated
2026-02-06T00:00:00Z

## Sources
- https://react.dev/ (official documentation and guides)
- https://github.com/facebook/react/blob/main/CHANGELOG.md (changelog)
- https://react.dev/reference/rules/rules-of-hooks (hooks rules)
```

---

## JSON Schema

Skills are validated against this Pydantic model:

```python
from typing import List
from pydantic import BaseModel, Field, field_validator

class NormalizedSkill(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    version: str = Field(..., min_length=1, max_length=20)
    domains: List[str] = Field(..., min_items=1, max_items=5)
    purpose: str = Field(..., min_length=50, max_length=150)
    principles: List[str] = Field(..., min_items=3, max_items=5)
    rules: List[str] = Field(..., min_items=3, max_items=10)
    patterns: List[str] = Field(..., min_items=3, max_items=10)
    anti_patterns: List[str] = Field(..., min_items=2, max_items=5)
    security: List[str] = Field(default_factory=list, max_items=5)
    performance: List[str] = Field(default_factory=list, max_items=5)
    tooling: List[str] = Field(default_factory=list, max_items=5)
    last_updated: str  # ISO 8601 format
    sources: List[str] = Field(..., min_items=1, max_items=10)

    @field_validator("last_updated")
    def validate_iso_date(cls, v):
        # Must be valid ISO 8601
        from datetime import datetime
        datetime.fromisoformat(v.replace("Z", "+00:00"))
        return v
```

---

## Notes for Skill Authors

1. **Be Specific**: "Use keys when mapping" is vague; "Always use stable unique IDs as keys, never array indices" is specific
2. **No Invented Information**: Extract only from provided sources
3. **Deduplication**: If two items say the same thing, merge them
4. **Clarity First**: Assume reader has zero context; explain acronyms
5. **Version Awareness**: Call out breaking changes, new features, deprecations
6. **Tool Selection**: Recommend only tools directly related to the framework
7. **Security Scanning**: Use frameworks' own security guidelines; avoid generic advice

---

## Updating Skills

When a framework releases a major version:

1. Update `version` field
2. Add version-specific notes to `Version` section
3. Add/remove rules that changed
4. Update sources with new documentation URLs
5. Regenerate with updated `lastGenerated` timestamp
6. Create a new commit with message: `docs(skills): update react from 17 to 18`

---

## Questions?

See [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for extending this spec.
