"""Validate normalized skills against specification."""

import json
import re
from typing import Optional
from pathlib import Path


class SkillValidator:
    """Validate skills against SKILLS.md specification."""

    # Vague language patterns to avoid
    VAGUE_PATTERNS = [
        'should', 'try', 'might', 'possibly', 'perhaps',
        'seems', 'appears', 'may', 'can', 'could'
    ]

    # Section requirements (min_items, max_items)
    SECTION_LIMITS = {
        'principles': (3, 5),
        'rules': (3, 10),
        'patterns': (3, 10),
        'anti_patterns': (2, 5),
        'security': (1, 5),
        'performance': (1, 5),
        'tooling': (1, 5),
    }

    CHAR_LIMITS = {
        'purpose': (50, 150),
        'version': (20, 200),
    }

    def __init__(self, verbose: bool = False):
        """Initialize validator.

        Args:
            verbose: Print debug information
        """
        self.verbose = verbose
        self.errors = []
        self.warnings = []

    def validate_skill(self, skill: dict) -> tuple[bool, list[str], list[str]]:
        """Validate normalized skill.

        Args:
            skill: Normalized skill dict

        Returns:
            Tuple of (is_valid, errors, warnings)
        """
        self.errors = []
        self.warnings = []

        # Validate metadata
        self._validate_metadata(skill)

        # Validate sections
        self._validate_sections(skill)

        # Validate content quality
        self._validate_quality(skill)

        if self.verbose:
            if self.errors:
                print(f'[Validate] Errors: {len(self.errors)}')
            if self.warnings:
                print(f'[Validate] Warnings: {len(self.warnings)}')

        return len(self.errors) == 0, self.errors, self.warnings

    def _validate_metadata(self, skill: dict) -> None:
        """Validate skill metadata."""
        required = ['name', 'version', 'purpose', 'last_updated', 'sources']

        for field in required:
            if field not in skill or not skill[field]:
                self.errors.append(f'Missing or empty field: {field}')

        # Validate name
        name = skill.get('name', '')
        if name and len(name) > 50:
            self.errors.append(f'Name too long: {len(name)} chars (max 50)')

        # Validate version
        version = skill.get('version', '')
        if version and len(version) > 20:
            self.errors.append(f'Version too long: {len(version)} chars (max 20)')

        # Validate purpose
        purpose = skill.get('purpose', '')
        if purpose:
            if len(purpose) < 50:
                self.errors.append(f'Purpose too short: {len(purpose)} chars (min 50)')
            elif len(purpose) > 150:
                self.errors.append(f'Purpose too long: {len(purpose)} chars (max 150)')

        # Validate last_updated ISO format
        last_updated = skill.get('last_updated', '')
        if last_updated and not re.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$', last_updated):
            self.errors.append(f'Invalid ISO date: {last_updated}')

        # Validate sources
        sources = skill.get('sources', [])
        if not isinstance(sources, list):
            self.errors.append('sources must be a list')
        elif len(sources) == 0:
            self.errors.append('At least one source required')
        else:
            for source in sources:
                if not isinstance(source, str) or not source.startswith('http'):
                    self.warnings.append(f'Invalid source URL: {source}')

    def _validate_sections(self, skill: dict) -> None:
        """Validate section presence and item counts."""
        required_sections = ['rules', 'patterns', 'anti_patterns', 'security', 'performance', 'tooling']

        for section in required_sections:
            if section not in skill:
                self.errors.append(f'Missing section: {section}')
                continue

            items = skill[section]
            if not isinstance(items, list):
                self.errors.append(f'{section} must be a list')
                continue

            min_items, max_items = self.SECTION_LIMITS[section]

            if len(items) < min_items:
                self.errors.append(f'{section}: too few items ({len(items)}, min {min_items})')
            elif len(items) > max_items:
                self.errors.append(f'{section}: too many items ({len(items)}, max {max_items})')

    def _validate_quality(self, skill: dict) -> None:
        """Validate content clarity and quality."""
        all_items = []

        # Collect all items from list sections
        for section in ['rules', 'patterns', 'anti_patterns', 'security', 'performance', 'tooling']:
            items = skill.get(section, [])
            if isinstance(items, list):
                all_items.extend([(section, item) for item in items])

        # Check each item
        for section, item in all_items:
            if not isinstance(item, str):
                self.errors.append(f'{section}: non-string item: {item}')
                continue

            # Check length
            if len(item) < 15:
                self.warnings.append(f'{section}: item too short ({len(item)} chars): "{item}"')
            elif len(item) > 150:
                self.warnings.append(f'{section}: item too long ({len(item)} chars): "{item[:40]}..."')

            # Check for vague language
            item_lower = item.lower()
            for vague in self.VAGUE_PATTERNS:
                if f' {vague} ' in f' {item_lower} ':
                    self.warnings.append(f'{section}: vague language "{vague}" in: "{item[:40]}..."')
                    break

        # Check for duplicates within sections
        for section in ['rules', 'patterns', 'anti_patterns', 'security', 'performance', 'tooling']:
            items = skill.get(section, [])
            if isinstance(items, list):
                seen = set()
                for item in items:
                    if item in seen:
                        self.warnings.append(f'{section}: duplicate item: "{item[:40]}..."')
                    seen.add(item)

    def validate_json_schema(self, data: dict) -> tuple[bool, list[str]]:
        """Validate raw JSON from LLM before processing.

        Args:
            data: JSON data from LLM

        Returns:
            Tuple of (is_valid, errors)
        """
        errors = []

        if not isinstance(data, dict):
            errors.append('Expected JSON object')
            return False, errors

        # Check required fields exist and are lists/strings
        required_lists = ['rules', 'patterns', 'anti_patterns', 'security', 'performance', 'tooling']
        required_strings = ['name', 'version', 'purpose']

        for field in required_lists:
            if field not in data:
                errors.append(f'Missing field: {field}')
            elif not isinstance(data[field], list):
                errors.append(f'{field} must be a list')

        for field in required_strings:
            if field not in data:
                errors.append(f'Missing field: {field}')
            elif not isinstance(data[field], str):
                errors.append(f'{field} must be a string')

        return len(errors) == 0, errors
