# fncu

[![npm version](https://img.shields.io/npm/v/fast-ncu.svg)](https://www.npmjs.com/package/fast-ncu)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.2.23+-000000?logo=bun)](https://bun.sh)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6?logo=typescript)](https://www.typescriptlang.org)

A blazing-fast CLI tool for checking npm package updates, built with Bun for maximum performance.

## ✨ Features

- ⚡ **Ultra-fast** - Parallel fetching with intelligent batching
- 🎯 **Smart filtering** - Filter packages by name using regex patterns
- 📊 **Multiple output formats** - Human-readable or JSON output
- 🎛️ **Flexible targeting** - Choose update level: major, minor, or patch
- 🏢 **Workspace support** - Check multiple workspaces
- 🔄 **Auto-upgrade** - Update package.json with latest versions
- 💾 **Intelligent caching** - Avoid redundant API calls
- 🎨 **Beautiful output** - Clean, colored terminal output

## 🚀 Installation

### Global Installation

```bash
bun install -g fast-ncu
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

| Option               | Short | Description                        | Default |
| -------------------- | ----- | ---------------------------------- | ------- |
| `--upgrade`          | `-u`  | Upgrade package.json dependencies  | `false` |
| `--filter <pattern>` | `-f`  | Filter packages by name (regex)    | -       |
| `--json`             | `-j`  | Output as JSON                     | `false` |
| `--target <level>`   | `-t`  | Update target: major, minor, patch | `auto`  |
| `--workspaces`       | `-w`  | Check workspaces                   | `false` |
| `--version`          | `-V`  | Show version number                | -       |
| `--help`             | `-h`  | Show help information              | -       |

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

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) v1.2.23 or later
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

# Run tests with watch mode
bun test:watch

# Build for production
bun run build

# Start the application
bun start

# Publishing scripts
bun run publish:patch    # Build + version patch + publish
bun run publish:minor    # Build + version minor + publish
bun run publish:major    # Build + version major + publish

# Version only (without publishing)
bun run version:patch    # Version patch + publish
bun run version:minor    # Version minor + publish
bun run version:major    # Version major + publish
```

### Project Structure

```
fast-ncu/
├── src/
│   ├── cli.ts           # CLI interface and command handling
│   ├── constants.ts     # Application constants
│   ├── core/
│   │   ├── compare.ts   # Package comparison logic
│   │   └── fetch.ts     # NPM registry fetching
│   └── utils/
│       ├── logger.ts    # Logging utilities
│       ├── packageManager.ts # Package manager detection
│       └── semver.ts    # Semantic version utilities
├── tests/               # Test suite
├── index.ts            # Entry point
└── package.json
```

## ⚡ Performance

fncu is optimized for speed:

- **Parallel fetching** - Fetches package info concurrently
- **Intelligent batching** - Processes 50 packages per batch
- **Response caching** - Avoids duplicate API calls
- **Minimal overhead** - Built with Bun for maximum performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Bun](https://bun.sh) - the fast JavaScript runtime
- Inspired by [npm-check-updates](https://github.com/raineorshine/npm-check-updates)
- Uses [commander.js](https://github.com/tj/commander.js) for CLI parsing
- Styled with [colorette](https://github.com/jorgebucaran/colorette) for beautiful output
