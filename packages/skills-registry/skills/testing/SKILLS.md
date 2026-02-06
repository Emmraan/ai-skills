---
name: Testing
version: 1.0.0
domains: [testing, quality, practices]
lastGenerated: 2026-02-06T00:00:00Z
---

# Skill: Testing

## Purpose
Comprehensive testing strategies for all code types: unit tests, integration tests, and end-to-end tests that catch regressions and build confidence in changes.

## Version
Framework-agnostic; applicable to Jest, Vitest, Pytest, Go testing, and more. Principles apply across languages.

## Principles
- Tests are documentation; they show how code is meant to be used
- Test behavior, not implementation; tests should survive refactoring
- Test pyramid guides strategy; many unit tests, fewer integration tests, minimal E2E
- Fast feedback loop accelerates development; tests must run in seconds, not minutes

## Mandatory Rules
- Write tests alongside implementation; test-driven development (TDD) guides better design
- Test public APIs and behavior; don't test private implementation details
- Each test should test one thing; multiple assertions are okay if they test the same behavior
- Use descriptive test names; reader should understand what's being tested without reading code
- Mock external dependencies (APIs, databases); tests must be isolated and deterministic

## Recommended Patterns
- Use AAA pattern (Arrange, Act, Assert) to structure tests for clarity
- Create test fixtures and factories to reduce setup boilerplate and improve readability
- Use parametrized tests for testing multiple inputs against same logic
- Test error paths explicitly; happy path is important but errors are where bugs hide
- Keep test data close to test; avoid unnecessary abstraction or setup helpers

## Anti-Patterns
- Over-mocking and testing implementation details instead of behavior
- Test interdependency where one test's output feeds another; tests must be independent
- Skipped tests that never get fixed; either fix or delete to keep test suite trustworthy
- Testing at wrong level (E2E for simple logic); align test type with what's being validated
- Single massive test file; organize into separate files by feature or component

## Security
- Test input validation and edge cases; injection attacks often exploit untested paths
- Test authentication and authorization explicitly; verify unauthorized users cannotaccess resources
- Test error handling doesn't expose sensitive information; error messages should be safe
- Use property-based testing to find edge cases and unusual inputs that cause vulnerabilities

## Performance
- Keep unit tests fast; should run in milliseconds, not seconds
- Run unit tests in parallel; most test frameworks support this out of the box
- Cache test data and fixtures to avoid repeated setup; factories help here
- Profile slow tests with --reporter=verbose; identify and optimize bottlenecks

## Tooling
- Jest for JavaScript/TypeScript; excellent defaults, built-in mocking and coverage
- Vitest for Vite-based projects; faster alternative to Jest with similar API
- Pytest for Python; flexible, extensible, excellent fixture support
- Playwright or Cypress for end-to-end testing; real browser interaction and visual regression
- Coverage tools (c8, coverage.py); aim for 70+ percent coverage on critical paths

## Last-Updated
2026-02-06T00:00:00Z

## Sources
- https://martinfowler.com/articles/testPyramid.html (test pyramid)
- https://jestjs.io/docs/getting-started (Jest documentation)
- https://docs.pytest.org/ (Pytest documentation)
