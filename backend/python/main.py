"""Main orchestrator for skill regeneration pipeline."""

import argparse
import json
import sys
from pathlib import Path
from typing import Optional
from datetime import datetime

from config import Config, get_config
from llm_client import LLMClient
from source_fetcher import SourceFetcher
from skill_validator import SkillValidator
from skill_normalizer import SkillNormalizer
from github_sync import GitHubSync


class SkillRegenerator:
    """Orchestrate the skill regeneration pipeline."""

    def __init__(self, config: Optional[Config] = None, dry_run: bool = False, verbose: bool = False):
        """Initialize skill regenerator.

        Args:
            config: Configuration object
            dry_run: Don't write files or push changes
            verbose: Print debug information
        """
        self.config = config or get_config()
        self.dry_run = dry_run
        self.verbose = verbose

        self.llm = LLMClient(self.config, verbose=verbose)
        self.fetcher = SourceFetcher(self.config, verbose=verbose)
        self.validator = SkillValidator()
        self.normalizer = SkillNormalizer(self.llm, verbose=verbose)
        self.git = GitHubSync(self.config, verbose=verbose)

        self.stats = {
            'processed': 0,
            'updated': 0,
            'skipped': 0,
            'failed': 0,
            'errors': [],
        }

    def log(self, message: str, prefix: str = '[Regen]'):
        """Print log message.

        Args:
            message: Message to print
            prefix: Log prefix
        """
        print(f'{prefix} {message}')

    def load_skills_registry(self) -> dict:
        """Load skills registry.

        Returns:
            Skills registry dict
        """
        registry_path = self.config.skills_dir / '.index.json'

        if not registry_path.exists():
            self.log('No skills registry found', '[Error]')
            return {}

        try:
            with open(registry_path) as f:
                data = json.load(f)
            return data.get('skills', {})
        except Exception as e:
            self.log(f'Failed to load registry: {e}', '[Error]')
            return {}

    def save_skill_to_registry(self, skill_dict: dict, skill_name: str) -> bool:
        """Save skill to registry.

        Args:
            skill_dict: Skill data
            skill_name: Skill name

        Returns:
            Success
        """
        skill_dir = self.config.skills_dir / skill_name
        skill_path = skill_dir / 'SKILLS.md'

        if not self.dry_run:
            skill_dir.mkdir(parents=True, exist_ok=True)

            # Convert skill dict to markdown
            sources = skill_dict.get('sources', [])
            markdown = self.normalizer.skill_to_markdown(skill_dict, sources)

            try:
                with open(skill_path, 'w', encoding='utf-8') as f:
                    f.write(markdown)

                if self.verbose:
                    self.log(f'Wrote {skill_path}')

                return True
            except Exception as e:
                self.log(f'Failed to write {skill_name}: {e}', '[Error]')
                return False

        return True

    def regenerate_skill(self, skill_name: str, skill_version: Optional[str] = None) -> bool:
        """Regenerate a single skill.

        Args:
            skill_name: Skill name
            skill_version: Optional version to use

        Returns:
            Success (skill was updated or skipped)
        """
        self.stats['processed'] += 1
        self.log(f'Processing {skill_name}...', '[Skill]')

        # Load source descriptor
        try:
            source_descriptor = self.fetcher.load_source_descriptor(skill_name)
        except Exception as e:
            self.log(f'Failed to load sources for {skill_name}: {e}', '[Error]')
            self.stats['failed'] += 1
            self.stats['errors'].append(f'{skill_name}: {str(e)}')
            return False

        if not source_descriptor:
            self.log(f'No source descriptor found for {skill_name}', '[Skip]')
            self.stats['skipped'] += 1
            return True

        # Fetch source content
        try:
            content = self.fetcher.fetch_sources(skill_name)
        except Exception as e:
            self.log(f'Failed to fetch sources for {skill_name}: {e}', '[Error]')
            self.stats['failed'] += 1
            self.stats['errors'].append(f'{skill_name} sources: {str(e)}')
            return False

        if not content:
            self.log(f'No content fetched for {skill_name}', '[Skip]')
            self.stats['skipped'] += 1
            return True

        # Compute diff
        diff = self.fetcher.compute_diff(skill_name, content)

        if diff is None:
            self.log(f'No changes detected for {skill_name}', '[Skip]')
            self.stats['skipped'] += 1
            return True

        if not isinstance(diff, str):
            # diff is True (changed), use full content
            diff = content

        self.log(f'Changes detected ({len(diff)} chars)', '[Skill]')

        # Normalize via LLM
        skill_version = skill_version or source_descriptor.get('version', 'unknown')

        try:
            normalized = self.normalizer.normalize(
                diff,
                skill_name,
                skill_version,
            )
        except Exception as e:
            self.log(f'Failed to normalize {skill_name}: {e}', '[Error]')
            self.stats['failed'] += 1
            self.stats['errors'].append(f'{skill_name} normalize: {str(e)}')
            return False

        if not normalized:
            self.log(f'LLM returned invalid skill for {skill_name}', '[Error]')
            self.stats['failed'] += 1
            self.stats['errors'].append(f'{skill_name}: Invalid LLM output')
            return False

        # Validate
        is_valid, errors = self.validator.validate_skill(normalized)

        if not is_valid:
            self.log(f'Validation failed for {skill_name}: {errors[0]}', '[Error]')
            self.stats['failed'] += 1
            self.stats['errors'].append(f'{skill_name} validation: {errors[0]}')
            return False

        # Save to registry
        if not self.save_skill_to_registry(normalized, skill_name):
            self.stats['failed'] += 1
            return False

        # Commit to git
        sources = source_descriptor.get('sources', [])

        if not self.dry_run and not self.git.commit_skill(skill_name, sources):
            self.log(f'Failed to commit {skill_name}', '[Git]')
            self.stats['failed'] += 1
            return False

        self.stats['updated'] += 1
        self.log(f'✓ Updated {skill_name}', '[Skill]')

        return True

    def regenerate_skills(self, skill_names: list[str]) -> int:
        """Regenerate multiple skills.

        Args:
            skill_names: List of skill names to regenerate

        Returns:
            Exit code (0=success, 1=errors)
        """
        if self.dry_run:
            self.log('DRY RUN MODE - no files will be written', '[Warn]')

        if not self.config.validate()[0]:
            self.log('Configuration validation failed', '[Error]')
            return 1

        if not skill_names:
            registry = self.load_skills_registry()
            skill_names = list(registry.keys())

        if not skill_names:
            self.log('No skills to regenerate', '[Warn]')
            return 0

        self.log(f'Regenerating {len(skill_names)} skills...', '[Start]')

        # Create git branch if not dry run
        branch = 'main'

        if not self.dry_run:
            branch = self.git.create_pr_branch()

        for skill_name in skill_names:
            try:
                self.regenerate_skill(skill_name)
            except KeyboardInterrupt:
                self.log('Interrupted by user', '[Warn]')
                break
            except Exception as e:
                self.log(f'Unexpected error for {skill_name}: {e}', '[Error]')
                self.stats['failed'] += 1
                self.stats['errors'].append(f'{skill_name}: {str(e)}')

        # Push changes
        if not self.dry_run and self.stats['updated'] > 0:
            self.log(f'Pushing changes to {branch}...', '[Git]')

            if self.git.push_changes(branch):
                self.log(f'Pushed to {branch}', '[Git]')
            else:
                self.log('Failed to push changes', '[Error]')
                return 1

        # Print summary
        self.print_summary()

        return 1 if self.stats['failed'] > 0 else 0

    def print_summary(self):
        """Print execution summary."""
        self.log('', '[---]')
        self.log(f'Processed: {self.stats["processed"]}', '[Stats]')
        self.log(f'Updated: {self.stats["updated"]}', '[Stats]')
        self.log(f'Skipped: {self.stats["skipped"]}', '[Stats]')
        self.log(f'Failed: {self.stats["failed"]}', '[Stats]')

        if self.stats['errors']:
            self.log('', '[---]')
            self.log('Errors:', '[Error]')

            for error in self.stats['errors']:
                self.log(f'  - {error}', '[Error]')


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Regenerate AI skills from source documentation',
    )

    parser.add_argument(
        '--skills',
        type=str,
        default='',
        help='Comma-separated skill names to regenerate (default: all)',
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Don\'t write files or push changes',
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Print debug information',
    )
    parser.add_argument(
        '--env',
        type=Path,
        help='Path to .env file',
    )

    args = parser.parse_args()

    # Load config
    config = get_config()

    if args.env:
        config.load_env(args.env)

    # Parse skill names
    skill_names = []

    if args.skills:
        skill_names = [s.strip() for s in args.skills.split(',')]

    # Run regenerator
    regenerator = SkillRegenerator(
        config=config,
        dry_run=args.dry_run,
        verbose=args.verbose,
    )

    exit_code = regenerator.regenerate_skills(skill_names)
    sys.exit(exit_code)


if __name__ == '__main__':
    main()
