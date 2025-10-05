# Contributing to fncu

Thank you for your interest in contributing to fncu! This guide will help you get started.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) latest version
- Node.js v22 or later
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:

```bash
git clone https://github.com/uchkunrakhimow/fast-ncu.git
cd fast-ncu
```

### Install Dependencies

```bash
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

### Code Formatting

```bash
bun fmt
```

### Import Organization

```typescript
import { readFileSync } from "fs";
import { Command } from "commander";
import { blue, bold } from "colorette";

import { checkUpdates } from "./core/checker";
import type { Options } from "./types";
```

### Error Handling

```typescript
try {
  const result = await checkUpdates(options);
  // Handle success
} catch (error) {
  logger.error("Failed to check updates:", error);
  process.exit(1);
}
```

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun run test:watch
```

### Writing Tests

```typescript
import { describe, it, expect } from "vitest";
import { parseVersion } from "../lib/utils/ver";

describe("parseVersion", () => {
  it("should parse semantic versions correctly", () => {
    expect(parseVersion("1.2.3")).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
    });
  });

  it("should handle invalid versions", () => {
    expect(() => parseVersion("invalid")).toThrow("Invalid version");
  });
});
```

## Pull Request Process

### Before Submitting

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**:

   - Write code following our style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**:

   ```bash
   bun test
   bun run build
   ```

4. **Commit your changes**:

   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

### Pull Request Guidelines

- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Tests**: Ensure all tests pass
- **Documentation**: Update docs if needed

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
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## Review Process

1. **Automated Checks**: CI will run tests and linting
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

## Community Guidelines

### Code of Conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/):

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

### Communication

- **Issues**: Use GitHub issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Pull Requests**: Use PR comments for code-specific discussions

## Getting Help

If you need help:

1. Check existing issues and discussions
2. Read the documentation in the `docs/` folder
3. Open a new issue with a clear description
4. Join discussions to ask questions

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Release Scripts

```bash
# Patch release (bug fixes)
bun run version:patch

# Minor release (new features)
bun run version:minor

# Major release (breaking changes)
bun run version:major
```

## Troubleshooting

### Common Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules bun.lock
bun install

# Run tests with verbose output
bun test --reporter=verbose

# Check TypeScript configuration
bun run tsc --noEmit
```

### Development Tips

1. Use TypeScript strict mode for better type safety
2. Write tests first (TDD approach)
3. Use meaningful commit messages
4. Keep PRs small and focused
5. Ask for help when stuck

## Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and ideas
- **Email**: Contact maintainers directly for sensitive issues

Thank you for contributing to fncu! 🚀
