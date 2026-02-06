"""Fetch documentation and source content from various sources."""

import json
from pathlib import Path
from datetime import datetime
from typing import Optional
import requests
from config import Config, get_config


class SourceFetcher:
    """Fetch content from URLs, GitHub repos, and changelogs."""

    def __init__(self, config: Optional[Config] = None, verbose: bool = False):
        """Initialize source fetcher.

        Args:
            config: Configuration object
            verbose: Print debug information
        """
        self.config = config or get_config()
        self.verbose = verbose
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "AI-Skills-Generator/1.0",
            }
        )

    def fetch_url(self, url: str, timeout: int = 30) -> Optional[str]:
        """Fetch content from URL.

        Args:
            url: URL to fetch
            timeout: Request timeout in seconds

        Returns:
            Content or None on failure
        """
        try:
            if self.verbose:
                print(f"[Fetch] GET {url}")

            response = self.session.get(url, timeout=timeout)
            response.raise_for_status()

            content = response.text
            if self.verbose:
                print(f"[Fetch] Success: {len(content)} chars")

            return content
        except requests.RequestException as e:
            print(f"[Fetch] Error fetching {url}: {e}")
            return None

    def fetch_github_file(
        self,
        repo: str,
        path: str,
        branch: str = "main",
    ) -> Optional[str]:
        """Fetch file from GitHub raw content.

        Args:
            repo: Repository (owner/name)
            path: File path in repo
            branch: Branch name (default: main)

        Returns:
            File content or None
        """
        url = f"https://raw.githubusercontent.com/{repo}/{branch}/{path}"
        return self.fetch_url(url)

    def fetch_github_releases(
        self,
        repo: str,
        last_n: int = 5,
    ) -> Optional[list[dict]]:
        """Fetch recent releases from GitHub.

        Args:
            repo: Repository (owner/name)
            last_n: Number of recent releases to fetch

        Returns:
            List of release dicts or None
        """
        try:
            url = f"https://api.github.com/repos/{repo}/releases"
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            releases = response.json()[:last_n]
            if self.verbose:
                print(f"[Fetch] Got {len(releases)} releases from {repo}")

            return releases
        except requests.RequestException as e:
            print(f"[Fetch] Error fetching releases for {repo}: {e}")
            return None

    def load_source_descriptor(self, skill_name: str) -> Optional[dict]:
        """Load source descriptor JSON for a skill.

        Args:
            skill_name: Skill name (e.g., 'react')

        Returns:
            Source descriptor dict or None
        """
        descriptor_path = self.config.sources_dir / f"{skill_name}-sources.json"

        if not descriptor_path.exists():
            print(f"[Fetch] Source descriptor not found: {descriptor_path}")
            return None

        try:
            with open(descriptor_path, "r") as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            print(f"[Fetch] Error parsing descriptor: {e}")
            return None

    def fetch_sources(self, skill_name: str) -> Optional[str]:
        """Fetch and combine all sources for a skill.

        Args:
            skill_name: Skill name

        Returns:
            Combined content from all sources
        """
        descriptor = self.load_source_descriptor(skill_name)
        if not descriptor:
            return None

        combined = f"# Sources for {skill_name}\n\n"
        combined += f"Generated: {datetime.now().isoformat()}\n\n"

        sources = descriptor.get("sources", [])
        if not sources:
            print(f"[Fetch] No sources in descriptor for {skill_name}")
            return None

        for source in sources:
            source_type = source.get("type", "")

            if source_type == "url":
                url = source.get("url")
                if url:
                    content = self.fetch_url(url)
                    if content:
                        combined += f"## Source: {url}\n\n{content}\n\n"

            elif source_type == "github_file":
                repo = source.get("repo")
                path = source.get("path")
                if repo and path:
                    content = self.fetch_github_file(repo, path)
                    if content:
                        combined += f"## GitHub: {repo}/{path}\n\n{content}\n\n"

            elif source_type == "github_releases":
                repo = source.get("repo")
                last_n = source.get("last_n_releases", 3)
                if repo:
                    releases = self.fetch_github_releases(repo, last_n)
                    if releases:
                        for rel in releases:
                            tag = rel.get("tag_name", "unknown")
                            body = rel.get("body", "")
                            combined += f"## Release: {tag}\n\n{body}\n\n"

        return combined if len(combined) > 100 else None

    def get_snapshot_path(self, skill_name: str) -> Path:
        """Get path for source snapshot file.

        Args:
            skill_name: Skill name

        Returns:
            Path object
        """
        return self.config.snapshots_dir / f"{skill_name}.txt"

    def save_snapshot(self, skill_name: str, content: str) -> bool:
        """Save source content snapshot for diffing.

        Args:
            skill_name: Skill name
            content: Content to save

        Returns:
            Success
        """
        snapshot_path = self.get_snapshot_path(skill_name)
        try:
            snapshot_path.write_text(content, encoding="utf-8")
            if self.verbose:
                print(f"[Fetch] Saved snapshot: {snapshot_path}")
            return True
        except IOError as e:
            print(f"[Fetch] Error saving snapshot: {e}")
            return False

    def load_snapshot(self, skill_name: str) -> Optional[str]:
        """Load previous source snapshot.

        Args:
            skill_name: Skill name

        Returns:
            Previous content or None
        """
        snapshot_path = self.get_snapshot_path(skill_name)
        if not snapshot_path.exists():
            return None

        try:
            return snapshot_path.read_text(encoding="utf-8")
        except IOError as e:
            print(f"[Fetch] Error loading snapshot: {e}")
            return None

    def compute_diff(self, skill_name: str, content: str) -> Optional[str]:
        """Get content that changed since last snapshot.

        Args:
            skill_name: Skill name
            content: New content

        Returns:
            Changed content or full content if no previous snapshot
        """
        previous = self.load_snapshot(skill_name)

        if not previous:
            if self.verbose:
                print(f"[Fetch] No previous snapshot, using full content")
            return content

        # Simple diff: if content is very different, return it
        # In production, use difflib for detailed diffs
        if content == previous:
            if self.verbose:
                print(f"[Fetch] Content unchanged, skipping LLM call")
            return None

        if self.verbose:
            prev_len = len(previous)
            curr_len = len(content)
            print(f"[Fetch] Content changed: {prev_len} -> {curr_len} chars")

        return content
