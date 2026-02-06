---
name: Python
version: 3.11
domains: [general, backend, languages]
lastGenerated: 2026-02-06T00:00:00Z
---

# Skill: Python

## Purpose
Core idioms and best practices for writing efficient, readable, and maintainable Python code following PEP 20 and modern ecosystem standards.

## Version
Python 3.8+, with focus on 3.11+ for performance improvements and async patterns. End of life: 3.8 (Oct 2024), 3.9 (Oct 2025).

## Principles
- Readability counts; explicit is better than implicit (Zen of Python)
- DRY (Don't Repeat Yourself); abstract common patterns into functions and classes
- EAFP (Easier to Ask for Forgiveness than Permission); use try/except over type checking
- Type hints improve code clarity and tooling support; use them liberally

## Mandatory Rules
- Always use f-strings for formatting; never use % or .format() in new code
- Use type hints in function signatures; leverage mypy or pyright for type checking
- Import modules and classes separately; avoid `from module import *`
- Set up logging from start; use logging module, never print() to stdout in libraries
- Use context managers (with statement) for resource cleanup; never raw file/socket operations

## Recommended Patterns
- Use dataclasses or Pydantic for data validation and structure; avoid plain dicts for complex data
- Use comprehensions (list, dict, set) for concise and readable transformations
- Use generators with yield for memory efficiency on large datasets
- Leverage functools (lru_cache, wraps, reduce) for functional patterns
- Use pathlib.Path instead of os.path for cross-platform file operations

## Anti-Patterns
- Using mutable default arguments in functions; use None and initialize inside
- Catching bare Exception; catch specific exception types to handle only expected errors
- Using assert for input validation in production; assert is for debugging, disable with -O
- Creating deep class hierarchies; composition over inheritance in most cases
- Using global variables; pass state through functions and class instances instead

## Security
- Never use pickle with untrusted data; use json or Pydantic for serialization
- Use secrets module for generating tokens; never random module for security-critical values
- Validate environment variables for injection attacks; don't interpolate directly into commands
- Use parameterized queries with database libraries; never string interpolation for SQL

## Performance
- Use itertools and generators for processing large datasets; avoid storing entire lists in memory
- Profile code with cProfile before optimizing; measure to guide effort
- Use list comprehensions instead of loops with append; comprehensions are 10-30% faster
- Consider Cython or NumPy for CPU-bound work; pure Python is slow for math-heavy code

## Tooling
- Poetry or pip-tools for dependency management; lock versions to ensure reproducibility
- Black for code formatting; removes style debates and improves consistency
- mypy for static type checking; use strict mode for new projects
- pytest for testing; fixtures and parametrize make tests readable and maintainable
- ruff for fast linting; checks PEP 8 and catches common mistakes

## Last-Updated
2026-02-06T00:00:00Z

## Sources
- https://www.python.org/dev/peps/pep-0020/ (Zen of Python)
- https://docs.python.org/3/library/logging.html (logging module)
- https://peps.python.org/pep-0484/ (type hints specification)
