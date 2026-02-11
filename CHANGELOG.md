# Changelog

All notable changes to the AI-Skills project are documented here.

## [1.1.1] - 2026-02-11

### Summary

This release consolidates two fix branches into a single, low-risk maintenance update that:

1. Resolves CI `pnpm install --frozen-lockfile` failures by syncing `pnpm-lock.yaml` with `package.json`.
2. Fixes backend skill generation pipeline issues that were causing normalization failures and blocking automated CI commits.
3. Improves the Validate Skills workflow to support manual triggering and avoid unrelated package test failures.

Merged branches:

- `fix/pnpm-lock-cli-eslint`
- `generate/skills-20260211_194907`
  → consolidated into `merge/fix-generate`

---

### Key Changes

1. Lockfile Sync (CI Fix)

- **`pnpm-lock.yaml`**
  - Synced with `package.json` to add the missing `eslint` entry for the CLI package.
  - Fixes CI failures caused by `--frozen-lockfile` specifier mismatches.

---

2. Backend Generator Fixes

`skill_normalizer.py`

- Accept injected `LLMClient` to avoid config misuse during tests and CI.
- Ensure `sources`, `purpose`, and `last_updated` are present and satisfy validator requirements.
- Safely handle non-string content when extracting URLs.
- Prevent runtime type errors during normalization by validating input types early.

`main.py`

- Pass resolved source URL strings into `normalize()` (avoid passing dicts where strings are expected).
- Correctly unpack validator return values to follow the expected tuple/structure.

`github_sync.py`

- Configure local `git user.name` and `git user.email` in CI before committing to prevent `empty ident` errors.

These changes make skill normalization robust to metadata and type issues and allow CI generation to commit updates reliably.

---

3. CI Workflow Improvements

`validate-skills.yml`

- Added manual `workflow_dispatch` trigger so maintainers can run validations from the Actions UI.
- Scoped tests to `@ai-skills/skills-registry` to avoid failures from unrelated packages in the monorepo and to make validation runs more focused.

---

### Why This Change

- CI was failing during install due to an `eslint` specifier mismatch in the CLI package.
- The skill generation pipeline had multiple runtime issues (LLM client/config misuse, missing/invalid metadata, dictionaries passed where strings expected, missing git identity in CI) that prevented automated commits.
- The Validate workflow required a manual trigger and isolation from unrelated package tests to be reliable during PR validation.

---

### Behavioral Impact / Risk

Low risk — changes are limited to monorepo tooling, the backend generation pipeline, and CI configuration. No production runtime surfaces are affected.

---

### Testing & Verification

In CI

1. Open the PR and allow workflows to run.
2. Manually trigger: Actions → Validate Skills → Run workflow.
3. Confirm:
   - The Validate job completes successfully with job summary: **"All skills validated!"**.
   - `pnpm install --frozen-lockfile` succeeds in CI (no specifier mismatch error).
   - Generate workflow (when run) commits successfully without `empty ident` errors.

---

### Reviewer Checklist

- `pnpm install` succeeds (no `--frozen-lockfile` error).
- Validate Skills workflow completes successfully.
- Backend generator normalizes at least one skill without runtime errors.
- Workflow-created commits have valid author identity.
- Changes are minimal and targeted to CI and generator fixes.

---

## Files Changed (high level)

- `pnpm-lock.yaml` — synced to match `package.json` for the CLI package.
- `backend/python/skill_normalizer.py` — input validation, LLMClient injection support, safer URL/content handling.
- `backend/python/main.py` — corrected normalize invocation and validator unpacking.
- `backend/python/github_sync.py` — configure git identity before committing in CI.
- `.github/workflows/validate-skills.yml` — added `workflow_dispatch` and scoped the job to the skills registry package.

---

Links

- See [backend/python](backend/python) for generator fixes and [packages/cli](packages/cli) for the CLI package.
