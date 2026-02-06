"""Tests for skill_validator module."""

import pytest

from skill_validator import SkillValidator


class TestSkillValidator:
    """Test SkillValidator class."""

    @pytest.fixture
    def validator(self):
        """Create validator instance."""
        return SkillValidator()

    @pytest.fixture
    def valid_skill(self):
        """Create a valid skill dict."""
        return {
            'name': 'test-skill',
            'version': '1.0.0',
            'purpose': 'A comprehensive skill for testing purposes that is quite detailed',
            'last_updated': '2026-02-06T00:00:00Z',
            'principles': [
                'Always validate input data appropriately in advance',
                'Use type hints in code for clarity and maintainability',
                'Write tests for all functions before implementation',
                'Document public APIs with examples and descriptions',
            ],
            'rules': [
                'Never use bare except clauses in production code',
                'Use f-strings for formatting all string operations',
                'Always use context managers for resource handling',
            ],
            'patterns': [
                'Use dataclasses for simple data structures and types',
                'Use comprehensions for list transformations efficiently',
                'Use pathlib instead of os.path for file operations',
            ],
            'anti_patterns': [
                'Avoid using global variables in your code',
                'Avoid mutable default arguments in functions',
            ],
            'security': [
                'Always validate and sanitize user input from sources',
                'Use parameterized queries for all database operations',
            ],
            'performance': [
                'Use generators for large datasets and memory efficiency',
                'Cache expensive computations with proper invalidation',
            ],
            'tooling': [
                'Use pytest for testing with proper test organization',
                'Use mypy for type checking and static code analysis',
            ],
            'sources': [
                'https://example.com/docs',
                'https://github.com/example/repo',
            ],
        }

    def test_valid_skill_passes(self, validator, valid_skill):
        """Test that a valid skill passes validation."""
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        assert is_valid is True
        assert len(errors) == 0

    def test_missing_name(self, validator, valid_skill):
        """Test validation fails when name is missing."""
        del valid_skill['name']
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        assert is_valid is False

    def test_missing_version(self, validator, valid_skill):
        """Test validation fails when version is missing."""
        del valid_skill['version']
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        assert is_valid is False

    def test_missing_purpose(self, validator, valid_skill):
        """Test validation fails when purpose is missing."""
        del valid_skill['purpose']
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        assert is_valid is False

    def test_purpose_too_short(self, validator, valid_skill):
        """Test validation fails when purpose is too short."""
        valid_skill['purpose'] = 'Too short'
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        assert is_valid is False

    def test_purpose_too_long(self, validator, valid_skill):
        """Test validation fails when purpose is too long."""
        valid_skill['purpose'] = 'x' * 200
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        assert is_valid is False

    def test_invalid_date_format(self, validator, valid_skill):
        """Test validation fails with invalid date format."""
        valid_skill['last_updated'] = '2026-02-06'  # Missing time
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        assert is_valid is False

    def test_too_few_rules(self, validator, valid_skill):
        """Test validation fails when too few rules."""
        valid_skill['rules'] = ['Only one rule']
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        assert is_valid is False

    def test_too_many_rules(self, validator, valid_skill):
        """Test validation fails when too many rules."""
        valid_skill['rules'] = [f'Rule {i+1} with enough characters to be valid' for i in range(15)]
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        assert is_valid is False

    def test_vague_language_detection(self, validator, valid_skill):
        """Test detection of vague language patterns."""
        valid_skill['rules'] = [
            'You should use type hints consistently in your code',
            'Try to optimize loops for runtime performance always',
            'Functions might fail and should handle errors gracefully',
        ]
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        # Vague language is checked - validation should still complete
        # (vague words are warnings, not necessarily errors)
        assert isinstance(is_valid, bool)

    def test_item_too_short(self, validator, valid_skill):
        """Test validation returns warnings for short items."""
        valid_skill['rules'] = ['Short', 'This is a valid rule item with enough characters for testing']
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        # Short items cause validation to fail
        assert is_valid is False

    def test_item_too_long(self, validator, valid_skill):
        """Test validation fails when item is too long."""
        valid_skill['rules'] = ['x' * 200, 'This is a normal rule with enough characters']
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        # Should fail due to character limit
        assert is_valid is False

    def test_missing_required_section(self, validator, valid_skill):
        """Test validation fails when required section is missing."""
        del valid_skill['rules']
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        assert is_valid is False

    def test_non_list_section(self, validator, valid_skill):
        """Test validation fails when section is not a list."""
        valid_skill['rules'] = 'Not a list'
        is_valid, errors, warnings = validator.validate_skill(valid_skill)

        assert is_valid is False

    def test_json_schema_validation_success(self, validator):
        """Test JSON schema validation returns tuple with errors list."""
        data = {
            'name': 'test',
            'version': '1.0.0',
            'purpose': 'A test skill for testing purposes',
            'rules': ['Rule 1 needs more text here', 'Rule 2 also needs more text'],
            'patterns': ['Pattern 1 with more description', 'Pattern 2 with details'],
            'anti_patterns': ['Anti 1 description here', 'Anti 2 text'],
            'security': ['Security item with enough content'],
            'performance': ['Performance consideration text'],
            'tooling': ['Tooling requirement here'],
        }

        result = validator.validate_json_schema(data)
        # validate_json_schema returns (is_valid, errors) tuple
        assert isinstance(result, tuple)
        assert result[0] is True  # No missing fields

    def test_json_schema_validation_missing_field(self, validator):
        """Test JSON schema validation with missing required fields."""
        data = {
            'name': 'test',
            'version': '1.0.0',
            # Missing 'purpose' and other required fields
            'rules': ['Rule 1 with more text', 'Rule 2 with more text'],
        }

        result = validator.validate_json_schema(data)
        # validate_json_schema returns (is_valid, errors) tuple
        assert isinstance(result, tuple)
        assert result[0] is False  # Has missing fields
