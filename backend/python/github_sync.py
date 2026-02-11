"""GitHub synchronization for committing and pushing skill updates."""

import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional
from config import Config, get_config


class GitHubSync:
    """Handle git commits and GitHub pushes for skill updates."""

    def __init__(self, config: Optional[Config] = None, verbose: bool = False):
        """Initialize GitHub sync.

        Args:
            config: Configuration object
            verbose: Print debug information
        """
        self.config = config or get_config()
        self.verbose = verbose

    def run_git_command(self, *args) -> tuple[int, str, str]:
        """Run git command.

        Args:
            *args: Git command arguments

        Returns:
            Tuple of (return_code, stdout, stderr)
        """
        cmd = ["git", "-C", str(self.config.project_root)] + list(args)
        cwd = self.config.project_root

        if self.verbose:
            print(f'[Git] Running: {" ".join(cmd)}')

        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
        )

        if self.verbose and result.stdout:
            print(f"[Git] stdout: {result.stdout.strip()}")
        if result.stderr and result.returncode != 0:
            print(f"[Git] stderr: {result.stderr.strip()}")

        return result.returncode, result.stdout, result.stderr

    def is_git_repo(self) -> bool:
        """Check if directory is a git repository.

        Returns:
            True if git repo
        """
        code, _, _ = self.run_git_command("rev-parse", "--git-dir")
        return code == 0

    def has_changes(self, path: Optional[Path] = None) -> bool:
        """Check if there are uncommitted changes.

        Args:
            path: Optional path to check (default: all)

        Returns:
            True if changes exist
        """
        if path:
            code, _, _ = self.run_git_command("status", "--porcelain", str(path))
        else:
            code, out, _ = self.run_git_command("status", "--porcelain")

        if code == 0:
            return len(out.strip()) > 0

        return False

    def add_file(self, path: Path) -> bool:
        """Add file to git staging.

        Args:
            path: File path

        Returns:
            Success
        """
        code, _, _ = self.run_git_command("add", str(path))
        return code == 0

    def add_all_changes(self) -> bool:
        """Add all changes to git staging.

        Returns:
            Success
        """
        code, _, _ = self.run_git_command("add", "-A")
        return code == 0

    def commit(self, message: str) -> bool:
        """Commit changes.

        Args:
            message: Commit message

        Returns:
            Success
        """
        code, _, _ = self.run_git_command("commit", "-m", message)
        return code == 0

    def create_branch(self, branch_name: str) -> bool:
        """Create and checkout new branch.

        Args:
            branch_name: Branch name

        Returns:
            Success
        """
        code1, _, _ = self.run_git_command("checkout", "-b", branch_name)

        if code1 != 0:
            # Branch might already exist, try to checkout
            code2, _, _ = self.run_git_command("checkout", branch_name)
            return code2 == 0

        return code1 == 0

    def push_branch(self, branch_name: str) -> bool:
        """Push branch to remote.

        Args:
            branch_name: Branch name

        Returns:
            Success
        """
        code, _, _ = self.run_git_command("push", "origin", branch_name, "-f")
        return code == 0

    def commit_skill(self, skill_name: str, sources: list[str]) -> bool:
        """Commit a single skill with appropriate message.

        Args:
            skill_name: Skill name
            sources: List of source URLs

        Returns:
            Success
        """
        skill_path = self.config.skills_dir / skill_name / "SKILLS.md"

        if not self.add_file(skill_path):
            print(f"[Git] Failed to add {skill_name} skill")
            return False

        # Ensure git user identity is set (CI runners may not have it)
        self.run_git_command("config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com")
        self.run_git_command("config", "user.name", "github-actions[bot]")

        # Create meaningful commit message
        sources_str = ", ".join([s.split("/")[-1] for s in sources[:2]])
        message = f"docs(skills): regenerate {skill_name} from {sources_str}"

        if not self.commit(message):
            print(f"[Git] Failed to commit {skill_name}")
            return False

        if self.verbose:
            print(f"[Git] Committed {skill_name}")

        return True

    def create_pr_branch(self) -> str:
        """Create a feature branch for skill regeneration.

        Returns:
            Branch name
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        branch_name = f"generate/skills-{timestamp}"

        if self.create_branch(branch_name):
            if self.verbose:
                print(f"[Git] Created branch: {branch_name}")
            return branch_name

        # If branch creation failed, use main
        return "main"

    def push_changes(self, branch: str) -> bool:
        """Push changes to remote.

        Args:
            branch: Branch name to push

        Returns:
            Success
        """
        if not self.has_changes():
            if self.verbose:
                print("[Git] No changes to push")
            return True

        return self.push_branch(branch)

    def get_current_branch(self) -> Optional[str]:
        """Get current git branch name.

        Returns:
            Branch name or None
        """
        code, out, _ = self.run_git_command("rev-parse", "--abbrev-ref", "HEAD")

        if code == 0:
            return out.strip()

        return None
