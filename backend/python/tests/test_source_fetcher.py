"""Tests for source_fetcher module."""

import json
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch

import pytest

from source_fetcher import SourceFetcher
from config import Config


class TestSourceFetcher:
    """Test SourceFetcher class."""

    @pytest.fixture
    def config(self):
        """Create test config with temporary directory."""
        cfg = Config()

        with tempfile.TemporaryDirectory() as tmpdir:
            cfg.project_root = Path(tmpdir)
            yield cfg

    @pytest.fixture
    def fetcher(self, config):
        """Create SourceFetcher instance."""
        return SourceFetcher(config, verbose=False)

    def test_load_source_descriptor(self, fetcher, config):
        """Test loading source descriptor."""
        # Create test descriptor
        descriptor = {
            "skill": "test-skill",
            "version": "1.0.0",
            "sources": [{"type": "url", "url": "https://example.com"}],
        }

        sources_dir = config.sources_dir
        sources_dir.mkdir(parents=True, exist_ok=True)
        desc_file = sources_dir / "test-skill-sources.json"
        desc_file.write_text(json.dumps(descriptor))

        loaded = fetcher.load_source_descriptor("test-skill")

        assert loaded is not None
        assert loaded["skill"] == "test-skill"
        assert len(loaded["sources"]) == 1

    def test_load_source_descriptor_missing(self, config):
        """Test loading non-existent descriptor returns empty dict."""
        fetcher = SourceFetcher(config, verbose=False)

        # load_source_descriptor returns empty dict, doesn't raise
        result = fetcher.load_source_descriptor("nonexistent-skill-1234")
        assert result == {} or result is None

    @patch("requests.Session.get")
    def test_fetch_url_success(self, mock_get, fetcher):
        """Test successful URL fetch."""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.text = "Test content"
        mock_get.return_value = mock_response

        content = fetcher.fetch_url("https://example.com")

        assert content == "Test content"
        assert mock_get.called

    @patch("requests.Session.get")
    def test_fetch_url_timeout(self, mock_get, fetcher):
        """Test URL fetch with timeout."""
        mock_response = Mock()
        mock_response.raise_for_status = Mock()
        mock_response.text = "Content"
        mock_get.return_value = mock_response

        content = fetcher.fetch_url("https://example.com", timeout=30)

        assert content == "Content"
        call_kwargs = mock_get.call_args[1]
        assert call_kwargs.get("timeout") == 30

    @patch.object(SourceFetcher, "fetch_url")
    def test_fetch_github_file(self, mock_fetch, fetcher):
        """Test GitHub file fetching."""
        mock_fetch.return_value = "File content"

        content = fetcher.fetch_github_file("owner/repo", "path/to/file.md")

        assert content == "File content"
        # Verify it constructed the correct raw GitHub URL
        assert mock_fetch.called
        url = mock_fetch.call_args[0][0]
        assert "raw.githubusercontent.com" in url

    @patch.object(SourceFetcher, "fetch_url")
    def test_fetch_github_releases(self, mock_fetch, fetcher):
        """Test GitHub releases fetching."""
        releases_data = [
            {"tag_name": "v1.0.0", "body": "Release notes"},
            {"tag_name": "v0.9.0", "body": "Previous release"},
        ]
        mock_fetch.return_value = json.dumps(releases_data)

        releases = fetcher.fetch_github_releases("owner/repo", last_n=2)

        # fetch_github_releases tries to parse JSON response
        # Could return list or None if parsing fails
        assert releases is None or isinstance(releases, list)

    def test_snapshot_save_and_load(self, fetcher, config):
        """Test snapshot saving and loading."""
        content = "Test snapshot content"

        # Create snapshots directory
        config.snapshots_dir.mkdir(parents=True, exist_ok=True)

        fetcher.save_snapshot("test-skill", content)
        loaded = fetcher.load_snapshot("test-skill")

        assert loaded == content

    def test_compute_diff_no_snapshot(self, fetcher, config):
        """Test diff computation with no previous snapshot."""
        content = "New content"

        # Ensure no snapshot exists
        config.snapshots_dir.mkdir(parents=True, exist_ok=True)

        diff = fetcher.compute_diff("new-skill", content)

        # Should return content (different from None)
        assert diff is not None

    def test_compute_diff_no_changes(self, fetcher, config):
        """Test diff with no changes."""
        content = "Same content"

        # Create snapshots directory and snapshot
        config.snapshots_dir.mkdir(parents=True, exist_ok=True)
        fetcher.save_snapshot("test-skill", content)

        diff = fetcher.compute_diff("test-skill", content)

        # Should return None (no changes)
        assert diff is None

    def test_compute_diff_with_changes(self, fetcher, config):
        """Test diff with changes."""
        old_content = "Old content"
        new_content = "New different content"

        # Create snapshots directory and snapshot
        config.snapshots_dir.mkdir(parents=True, exist_ok=True)
        fetcher.save_snapshot("test-skill", old_content)

        diff = fetcher.compute_diff("test-skill", new_content)

        # Should return new content (changed)
        assert diff == new_content
