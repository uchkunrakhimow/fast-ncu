# Contributing to fncu

Thank you for your interest in contributing to fncu. This guide will help you get started.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) latest version
- Node.js v22 or later
- Git

### Setup

```bash
git clone https://github.com/uchkunrakhimow/fast-ncu.git
cd fast-ncu
bun install
```

### Development Scripts

```bash
# Development with hot reload
bun run dev:watch

# Run tests
bun test

# Build for production
bun run build
```

## Code Style

### TypeScript Guidelines

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Import Organization

```typescript
// External dependencies
import { readFileSync } from "fs";
import { Command } from "commander";
import { blue, bold } from "colorette";

// Internal imports
import { checkUpdates } from "./core/checker";
import type { Options } from "./types";
```

### Error Handling

```typescript
try {
  const result = await checkUpdates(options);
  // Handle success
} catch (error) {
  console.error("Failed to check updates:", error);
  process.exit(1);
}
```

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch
```

### Writing Tests

```typescript
import { test, expect } from "bun:test";
import { parseVersion } from "../lib/utils/ver";

test("parseVersion should parse semantic versions correctly", () => {
  expect(parseVersion("1.2.3")).toEqual({
    major: 1,
    minor: 2,
    patch: 3,
  });
});
```

## Pull Request Process

### Before Submitting

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes following the style guidelines

3. Add tests for new functionality

4. Run tests and build:

   ```bash
   bun test
   bun run build
   ```

5. Commit your changes:

   ```bash
   git add .
   git commit -m "Add your feature"
   ```

6. Push to your fork:
   ```bash
   git push origin feature/your-feature
   ```

### Pull Request Guidelines

- Use a clear, descriptive title
- Explain what changes you made and why
- Ensure all tests pass
- Update documentation if needed

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## Review Process

1. Automated checks run (tests and linting)
2. Maintainers review your code
3. Address any requested changes
4. Once approved, your PR will be merged

## Versioning

We use [Semantic Versioning](https://semver.org/):

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints

### Communication

- **Issues**: Bug reports and feature requests
- **Discussions**: Questions and ideas
- **Pull Requests**: Code-specific discussions

## Getting Help

1. Check existing issues and discussions
2. Read the documentation in `docs/`
3. Open a new issue with a clear description

Thank you for contributing to fncu!
