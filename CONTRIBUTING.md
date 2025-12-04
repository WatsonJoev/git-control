# Contributing to CollabManager

Thank you for your interest in contributing to CollabManager! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/collabmanager/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check existing [Issues](https://github.com/yourusername/collabmanager/issues) and [Discussions](https://github.com/yourusername/collabmanager/discussions)
2. Open a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach (if you have ideas)

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style guidelines
   - Write or update tests if applicable
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m "Add: description of your feature"
   ```
   Use conventional commit messages:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Provide a clear description
   - Reference related issues
   - Add screenshots for UI changes

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install` or `pnpm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`
5. Make your changes
6. Test your changes thoroughly

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper types or `unknown`
- Use interfaces for object shapes
- Prefer `const` over `let`, avoid `var`

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use meaningful component and variable names

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design system
- Ensure responsive design
- Maintain accessibility standards

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `useCamelCase.tsx`
- Types: `camelCase.ts`

## Testing

- Test your changes locally before submitting
- Ensure the app builds without errors: `npm run build`
- Check for linting errors: `npm run lint`
- Test on different browsers if possible

## Documentation

- Update README.md if adding new features
- Add JSDoc comments for complex functions
- Update type definitions if changing interfaces
- Keep examples up to date

## Review Process

1. All PRs require at least one approval
2. Maintainers will review code quality, tests, and documentation
3. Address feedback promptly
4. Once approved, maintainers will merge your PR

## Questions?

- Open a [Discussion](https://github.com/yourusername/collabmanager/discussions)
- Check existing [Issues](https://github.com/yourusername/collabmanager/issues)
- Reach out to maintainers

Thank you for contributing to CollabManager! 🎉

