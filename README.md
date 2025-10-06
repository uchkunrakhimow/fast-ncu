<p align="center"><code>npm i -g fast-ncu</code><br />or <code>bun install -g fast-ncu</code></p>

<p align="center"><strong>fncu</strong> (fast-ncu) is a blazing-fast CLI tool for checking npm package updates, built with Bun for maximum performance.</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/uchkunrakhimow/fast-ncu/refs/heads/master/docs/fast-ncu-splash.png" alt="fncu CLI splash" width="80%" />
</p>

---

## ⚡ Quickstart

```bash
# Check for updates
fncu

# Update package.json
fncu -u

# Upgrade fncu to the latest version
fncu upgrade

# Auto-detect and check workspaces
fncu

# Check specific workspace
fncu -w api
```

## ✨ Features

- Ultra-fast parallel package fetching
- Smart filtering with regex support
- Table or JSON output
- Targeted updates: major, minor, or patch
- Auto-upgrade dependencies
- Built-in caching
- Detects npm, yarn, pnpm, or bun automatically
- Monorepo / workspace support

## 📦 Installation

```bash
# Using npm
npm install -g fast-ncu

# Using Bun
bun install -g fast-ncu
```

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) latest
- Node.js v22 or later

### Setup

```bash
git clone https://github.com/uchkunrakhimow/fast-ncu
cd fast-ncu
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
```

## 📚 Documentation

- [**Usage Guide**](./docs/usage.md) - Detailed usage and examples
- [**Contributing**](./docs/contributing.md) - Contribution guidelines

## 📄 License

This project is licensed under the [MIT License](LICENSE).
