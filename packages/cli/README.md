# AI Skills CLI

Install framework-agnostic `SKILLS.md` files for AI agents.

## Usage

- `npx @emmraan/ai-skills --help` to view all commands.

## Interactive flow

When you run `npx @emmraan/ai-skills <skill>` without install flags, the CLI prompts for:

1. Install location: Local (current project) or Global (agent platforms)
2. Install target: All platforms or specific platforms (for both Local and Global)

When you run `npx @emmraan/ai-skills remove <skill>` without remove flags, the CLI prompts for:

1. Remove location: Local (current project) or Global (agent platforms)
2. Remove target: All platforms or specific platforms (for both Local and Global)

Supported non-interactive install flags:

- `--local`
- `--global`
- `--platform <name[,name]>`
- `--all`

Supported non-interactive remove flags:

- `--local`
- `--global`
- `--platform <name[,name]>`
- `--all`

Default behavior remains global + all platforms.

## UX improvements

- Subtle welcome banner in TTY sessions
- Colored logs for info/success/warn/error states
- Spinners during install/remove operations
- Interactive prompts via `inquirer`

## Publish to npm

This package is the publishable CLI package for the `ai-skills` command.

1. Build from workspace root: `pnpm build`
2. Login to npm: `npm login`
3. Publish CLI package: `npm publish --access public` (run inside `packages/cli`)

After publishing, users can run:

- `npx @emmraan/ai-skills list`
