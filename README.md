# fncu

[![npm version](https://img.shields.io/npm/v/fast-ncu.svg)](https://www.npmjs.com/package/fast-ncu)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-latest-000000?logo=bun)](https://bun.sh)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Downloads](https://img.shields.io/npm/dm/fast-ncu.svg)](https://www.npmjs.com/package/fast-ncu)

> ⚡ **fncu** (fast-ncu) - A blazing-fast CLI tool for checking npm package updates, built with Bun for maximum performance.

## ✨ Features

- ⚡ **Ultra-fast** - Parallel fetching with intelligent batching (50 packages per batch)
- 🎯 **Smart filtering** - Filter packages by name using regex patterns
- 📊 **Multiple output formats** - Human-readable table or JSON output
- 🎛️ **Flexible targeting** - Choose update level: major, minor, or patch
- 🏢 **Workspace support** - Check multiple workspaces
- 🔄 **Auto-upgrade** - Update package.json with latest versions
- 💾 **Intelligent caching** - Avoid redundant API calls (1000 package cache)
- 🎨 **Beautiful output** - Clean, colored terminal output with progress indicators
- 🔧 **Package manager detection** - Auto-detect npm, yarn, pnpm, or bun
- 📦 **Dual commands** - Use `fncu` (short) or `fast-ncu` (full)

## 🚀 Installation

### Global Installation

```bash
npm install -g fast-ncu
```

After installation, you can use either command:

- `fncu` (short version)
- `fast-ncu` (full version)

### Local Development

```bash
git clone https://github.com/uchkunrakhimow/fast-ncu
cd fast-ncu
bun install
```

## 📖 Usage

### Basic Commands

```bash
# Check for updates (using short command)
fncu

# Check for updates (using full command)
fast-ncu

# Check with JSON output
fncu --json
# or
fast-ncu --json

# Update package.json with latest versions
fncu -u
# or
fast-ncu -u

# Filter specific packages
fncu --filter "react|typescript"
# or
fast-ncu --filter "react|typescript"

# Target specific update level
fncu --target major
# or
fast-ncu --target major
```

### Command Line Options

| Option               | Short | Description                              | Default |
| -------------------- | ----- | ---------------------------------------- | ------- |
| `--upgrade`          | `-u`  | Upgrade package.json dependencies        | `false` |
| `--filter <pattern>` | `-f`  | Filter packages by name (regex)          | -       |
| `--json`             | `-j`  | Output as JSON                           | `false` |
| `--target <level>`   | `-t`  | Update target: auto, major, minor, patch | `auto`  |
| `--workspaces`       | `-w`  | Check workspaces                         | `false` |
| `--version`          | `-V`  | Show version number                      | -       |
| `--help`             | `-h`  | Show help information                    | -       |

## 📋 Examples

### Check for updates

```bash
fncu
# or
fast-ncu
```

```
📦 3 updates available:

┌─────────────┬─────────────┬─────────────┬─────────┐
│ Package     │ Current     │ Latest      │ Type    │
├─────────────┼─────────────┼─────────────┼─────────┤
│ react       │ 18.0.0      │ 18.2.0      │ minor   │
│ typescript  │ 4.9.0       │ 5.0.0       │ major   │
│ lodash      │ 4.17.20     │ 4.17.21     │ patch   │
└─────────────┴─────────────┴─────────────┴─────────┘

💡 Run: fncu -u to update
⚡ 0.45s
```

### Update with filtering

```bash
fncu -u --filter "react|typescript" --target minor
# or
fast-ncu -u --filter "react|typescript" --target minor
```

### JSON output

```bash
fncu --json
# or
fast-ncu --json
```

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

### Workspace support

```bash
fncu --workspaces
# or
fast-ncu --workspaces
```

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) latest
- Node.js v22 or later

### Setup

```bash
bun install
```

### Scripts

```bash
# Development with hot reload
bun run dev:watch

# Run tests
bun test

# Build for production
bun run build

# Start the application
bun start
```

### Project Structure

```
fncu/
├── bin/
│   └── fncu.ts              # Entry point
├── lib/
│   ├── core/
│   │   ├── checker.ts        # Main checker exports
│   │   ├── fetcher.ts        # NPM registry fetching
│   │   └── updater.ts        # Package.json updating
│   ├── types/
│   │   └── index.ts          # All type definitions
│   ├── utils/
│   │   ├── log.ts            # Logging utilities
│   │   ├── pkg.ts            # Package manager detection
│   │   └── ver.ts            # Version utilities
│   └── cli.ts                # CLI interface
├── tests/
│   └── ver.test.ts           # Version utilities tests
├── package.json
├── tsconfig.json
└── README.md
```
