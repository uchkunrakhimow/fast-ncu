# Usage Guide

This guide covers the essential usage of fncu (fast-ncu) for checking and updating npm packages.

## Basic Usage

### Checking for Updates

```bash
fncu
```

This will scan your `package.json` and display available updates in a formatted table.

### Updating Dependencies

```bash
fncu -u
```

This will automatically update your `package.json` with the latest versions.

### Upgrading fncu

```bash
fncu upgrade
# or
fncu self-upgrade
```

This will upgrade fncu to the latest version with an animated progress bar. If you're already on the latest version, it will display a message confirming this.

## Commands

| Command   | Aliases        | Description                        |
| --------- | -------------- | ---------------------------------- |
| `upgrade` | `self-upgrade` | Upgrade fncu to the latest version |

## Command Line Options

| Option               | Short | Description                              | Default |
| -------------------- | ----- | ---------------------------------------- | ------- |
| `--upgrade`          | `-u`  | Upgrade package.json dependencies        | `false` |
| `--filter <pattern>` | `-f`  | Filter packages by name (regex)          | -       |
| `--json`             | `-j`  | Output as JSON                           | `false` |
| `--target <level>`   | `-t`  | Update target: auto, major, minor, patch | `auto`  |
| `--workspaces`       | `-w`  | Check workspaces                         | `false` |

## Examples

### Basic Examples

```bash
# Check for updates
fncu

# Update all packages
fncu -u

# Upgrade fncu itself
fncu upgrade

# Get JSON output
fncu --json
```

### Filtering Examples

```bash
# Check only React packages
fncu --filter "react"

# Check multiple packages
fncu --filter "react|typescript|lodash"

# Check packages starting with "@types"
fncu --filter "^@types/"
```

### Targeting Examples

```bash
# Only major updates
fncu --target major

# Only minor updates
fncu --target minor

# Update only minor versions
fncu -u --target minor
```

### Combined Examples

```bash
# Update only React packages to minor versions
fncu -u --filter "react" --target minor

# Check major updates for TypeScript packages with JSON output
fncu --json --filter "typescript" --target major
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
- `bun.lockb` → bun

### Cache Management

fncu uses intelligent caching:

- **Cache Location**: `~/.fncu/cache`
- **Cache Duration**: 24 hours

To clear the cache:

```bash
rm -rf ~/.fncu/cache
```

## Self-Upgrade Examples

### Check and upgrade fncu

```bash
# Upgrade to the latest version
fncu upgrade
```

**Output when upgrade is needed:**

```
🔍 Checking for fncu updates...

📦 New version available: 1.0.10 → 1.0.11

⠋ Installing ████████████████████ 100%
✔ Installation complete
🎉 Successfully upgraded to 1.0.11!
⚡ Completed in 2.34s
```

**Output when already up-to-date:**

```
🔍 Checking for fncu updates...

✨ Already on latest version (1.0.10)
⚡ Completed in 0.42s
```

### Using alias

```bash
fncu self-upgrade
```

Both `fncu upgrade` and `fncu self-upgrade` work identically.

## Troubleshooting

### Common Issues

#### "No updates available" but packages are outdated

```bash
# Clear cache and try again
rm -rf ~/.fncu/cache
fncu
```

#### Slow performance

```bash
# Clear cache
rm -rf ~/.fncu/cache

# Reduce batch size
FNCU_BATCH_SIZE=25 fncu
```

#### Permission errors

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

#### Registry errors

```bash
# Set custom registry
NPM_REGISTRY=https://your-registry.com fncu
```

### Debug Mode

```bash
DEBUG=fncu:* fncu
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Check for updates
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
echo "Checking for package updates..."
fncu --json > updates.json

if [ $(jq '.updates | length' updates.json) -gt 0 ]; then
    echo "Updates found! Updating..."
    fncu -u
    npm install
else
    echo "All packages are up to date!"
fi
```
