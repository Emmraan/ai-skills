# AI Skills CLI

Install framework-agnostic `SKILLS.md` files for AI agents.

## Usage

- `npx ai-skills react` - Install React skill
- `npx ai-skills install react` - Install React skill (explicit command)
- `npx ai-skills list` - List available and installed skills
- `npx ai-skills update` - Update all installed skills
- `npx ai-skills remove react` - Remove React skill
- `npx ai-skills generate-local` - Run local backend generator

## Publish to npm

This package is the publishable CLI package for the `ai-skills` command.

1. Build from workspace root: `pnpm build`
2. Login to npm: `npm login`
3. Publish CLI package: `npm publish --access public` (run inside `packages/cli`)

After publishing, users can run:

- `npx ai-skills list`
