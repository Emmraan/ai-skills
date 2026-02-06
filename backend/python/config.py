"""Configuration module for AI Skills backend generator."""

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv


class Config:
    """Load and manage configuration from environment variables."""

    def __init__(self):
        """Initialize config from .env file and environment."""
        # Load .env file from project root
        env_path = Path(__file__).parent.parent.parent / ".env"
        if env_path.exists():
            load_dotenv(env_path)

        # LLM Configuration
        self.llm_base_url = os.getenv("LLM_BASE_URL", "https://api.anthropic.com/v1")
        self.llm_api_key = os.getenv("LLM_API_KEY", "")
        self.llm_model = os.getenv("LLM_MODEL", "claude-3-5-sonnet-20241022")
        self.llm_send_api_key = os.getenv("LLM_SEND_API_KEY", "true").lower() == "true"

        # GitHub Configuration
        self.github_token = os.getenv("GITHUB_TOKEN", "")
        self.github_org = os.getenv("GITHUB_ORG", "ai-open-source")
        self.github_repo = os.getenv("GITHUB_REPO", "ai-skillls")

        # Execution Configuration
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        self.dry_run = os.getenv("DRY_RUN", "false").lower() == "true"

        # Paths
        self.project_root = Path(__file__).parent.parent.parent
        self.skills_dir = self.project_root / "packages" / "skills-registry" / "skills"
        self.snapshots_dir = self.project_root / "backend" / "snapshots"
        self.sources_dir = self.project_root / "backend" / "sources"

        # Ensure snapshot directory exists
        self.snapshots_dir.mkdir(parents=True, exist_ok=True)

    def validate(self) -> tuple[bool, list[str]]:
        """Validate required configuration.

        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []

        if not self.llm_base_url:
            errors.append("LLM_BASE_URL not set")
        if self.llm_send_api_key and not self.llm_api_key:
            errors.append("LLM_API_KEY not set (required when LLM_SEND_API_KEY=true)")
        if not self.llm_model:
            errors.append("LLM_MODEL not set")
        if not self.skills_dir.exists():
            errors.append(f"Skills directory not found: {self.skills_dir}")

        return len(errors) == 0, errors

    def __repr__(self):
        """Return string representation (sanitized)."""
        return (
            f"Config(llm_model={self.llm_model}, github_repo={self.github_repo}, "
            f"debug={self.debug}, dry_run={self.dry_run})"
        )


def get_config() -> Config:
    """Get global config instance."""
    if not hasattr(get_config, "_instance"):
        get_config._instance = Config()
    return get_config._instance
