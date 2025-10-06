# Usage Guide

This guide covers essential usage of fncu (fast-ncu) for checking and updating npm packages.

## Commands

| Command   | Description                        |
| --------- | ---------------------------------- |
| `upgrade` | Upgrade fncu to the latest version |

## Options

| Option                | Short | Description                              | Default |
| --------------------- | ----- | ---------------------------------------- | ------- |
| `--upgrade`           | `-u`  | Upgrade package.json dependencies        | `false` |
| `--filter <pattern>`  | `-f`  | Filter packages by name (regex)          | -       |
| `--json`              | `-j`  | Output as JSON                           | `false` |
| `--target <level>`    | `-t`  | Update target: auto, major, minor, patch | `auto`  |
| `--workspaces [name]` | `-w`  | Check workspaces: all, root, or name     | auto    |

## Basic Examples

### Check for updates

```bash
fncu
```

Output:

```
3 updates available:

┌─────────────┬─────────────┬─────────────┬─────────┐
│ Package     │ Current     │ Latest      │ Type    │
├─────────────┼─────────────┼─────────────┼─────────┤
│ react       │ 18.0.0      │ 18.2.0      │ minor   │
│ typescript  │ 4.9.0       │ 5.0.0       │ major   │
│ lodash      │ 4.17.20     │ 4.17.21     │ patch   │
└─────────────┴─────────────┴─────────────┴─────────┘

Run: fncu -u to update
Completed in 0.45s
```

### Update dependencies

```bash
fncu -u
```

### Upgrade fncu

```bash
fncu upgrade
```

Output when upgrade is available:

```
Checking for fncu updates...

New version available: 1.0.10 → 1.0.11

Installation complete
Successfully upgraded to 1.0.11!
Completed in 2.34s
```

Output when already up-to-date:

```
Checking for fncu updates...

Already on latest version (1.0.10)
Completed in 0.42s
```

### JSON output

```bash
fncu --json
```

Output:

```json
{
  "updates": [
    {
      "name": "react",
      "current": "^18.0.0",
      "latest": "^18.2.0",
      "diff": "+0.2.0",
      "type": "minor"
    }
  ],
  "total": 15,
  "upgraded": false
}
```

## Filtering Examples

```bash
# Filter by package name
fncu --filter "react"

# Multiple packages
fncu --filter "react|typescript|lodash"

# Packages starting with @types
fncu --filter "^@types/"
```

## Targeting Examples

```bash
# Only major updates
fncu --target major

# Only minor updates
fncu --target minor

# Only patch updates
fncu --target patch

# Update only minor versions
fncu -u --target minor
```

## Combined Examples

```bash
# Update only React packages to minor versions
fncu -u --filter "react" --target minor

# Check major updates for TypeScript packages with JSON output
fncu --json --filter "typescript" --target major

# Check all workspaces in monorepo
fncu --workspaces

# Update all workspaces with filter
fncu -u --workspaces --filter "@myorg"
```

## Monorepo / Workspaces

fncu automatically detects monorepos and supports workspace-specific operations.

### Automatic Detection

Monorepos are automatically detected from:

- `package.json` with `workspaces` field (npm/yarn/bun)
- `pnpm-workspace.yaml` (pnpm)

### Workspace Options

```bash
# Auto-detect and check all workspaces
fncu

# Explicitly check all workspaces
fncu -w all

# Check only root package
fncu -w root

# Check specific workspace by name
fncu -w api
fncu -w ui
fncu -w @myorg/shared
```

### Examples

```bash
# Check all workspaces (auto-detected)
fncu

# Update all workspaces
fncu -u

# Update only root package
fncu -u -w root

# Update specific workspace
fncu -u -w api

# Filter packages in specific workspace
fncu -w ui --filter "react"

# Target specific update levels in workspace
fncu -w api --target minor
```

### Workspace Structure

Supported workspace patterns:

```json
{
  "workspaces": ["packages/*", "apps/*"]
}
```

Or:

```json
{
  "workspaces": {
    "packages": ["packages/*"]
  }
}
```

For pnpm:

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

## Configuration

### Environment Variables

| Variable          | Description             | Default                      |
| ----------------- | ----------------------- | ---------------------------- |
| `NPM_REGISTRY`    | Custom npm registry URL | `https://registry.npmjs.org` |
| `FNCU_CACHE_SIZE` | Maximum cache size      | `1000`                       |
| `FNCU_BATCH_SIZE` | Packages per batch      | `50`                         |

### Package Manager Detection

fncu automatically detects your package manager:

- `package-lock.json` → npm
- `yarn.lock` → yarn
- `pnpm-lock.yaml` → pnpm
- `bun.lock` → bun

## Troubleshooting

### Cache issues

Restart fncu if experiencing stale data (cache is session-based).

### Performance issues

Reduce batch size:

```bash
FNCU_BATCH_SIZE=25 fncu
```

### Custom registry

```bash
NPM_REGISTRY=https://your-registry.com fncu
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Check updates
on: [schedule]
jobs:
  check-updates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "22"
      - run: npm install -g fast-ncu
      - run: fncu --json > updates.json
```

### Update Script

```bash
#!/bin/bash
fncu --json > updates.json

if [ $(jq '.updates | length' updates.json) -gt 0 ]; then
    fncu -u
    npm install
fi
```
