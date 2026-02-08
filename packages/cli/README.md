# AI Skills CLI

Install framework-agnostic `SKILLS.md` files for AI agents.

## Usage

- `npx @emmraan/ai-skills react` - Install React skill
- `npx @emmraan/ai-skills install react` - Install React skill (explicit command)
- `npx @emmraan/ai-skills react --local` - Install to local project (`process.cwd()`)
- `npx @emmraan/ai-skills react --platform claude,gemini` - Install globally to selected platforms
- `npx @emmraan/ai-skills react --local --platform claude,gemini` - Install locally to selected platforms
- `npx @emmraan/ai-skills react --global --all` - Install globally to all platforms
- `npx @emmraan/ai-skills list` - List available and installed skills
- `npx @emmraan/ai-skills update` - Update all installed skills
- `npx @emmraan/ai-skills remove react` - Remove React skill
- `npx @emmraan/ai-skills generate-local` - Run local backend generator

## Interactive install flow

When you run `npx @emmraan/ai-skills <skill>` without install flags, the CLI prompts for:

1. Install location: Local (current project) or Global (agent platforms)
2. If Global: All platforms or specific platforms

Supported non-interactive install flags:

- `--local`
- `--global`
- `--platform <name[,name]>`
- `--all`

Default behavior remains global + all platforms.

## Publish to npm

This package is the publishable CLI package for the `ai-skills` command.

1. Build from workspace root: `pnpm build`
2. Login to npm: `npm login`
3. Publish CLI package: `npm publish --access public` (run inside `packages/cli`)

After publishing, users can run:

- `npx @emmraan/ai-skills list`
