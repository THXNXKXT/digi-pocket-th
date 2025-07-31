# Contributing to Digi-Pocket Thailand

Thank you for your interest in contributing to Digi-Pocket Thailand! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) >= 1.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 14
- [Redis](https://redis.io/) >= 6.0
- [Git](https://git-scm.com/)

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/digi-pocket-th.git`
3. Install dependencies: `cd backend && bun install`
4. Set up environment: `cp .env.example .env`
5. Start development server: `bun run dev`

## 📝 How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in [Issues](https://github.com/THXNXKXT/digi-pocket-th/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Bun version, etc.)
   - Screenshots if applicable

### Suggesting Features
1. Check [Issues](https://github.com/THXNXKXT/digi-pocket-th/issues) for existing feature requests
2. Create a new issue with:
   - Clear title and description
   - Use case and motivation
   - Proposed implementation (if any)
   - Examples or mockups

### Code Contributions

#### Branch Naming Convention
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

#### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add two-factor authentication
fix(orders): resolve payment processing issue
docs(api): update authentication endpoints
test(security): add rate limiting tests
```

#### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass: `bun test`
5. Update documentation if needed
6. Commit your changes with clear messages
7. Push to your fork
8. Create a Pull Request

#### Pull Request Requirements
- [ ] All tests pass
- [ ] Code follows project style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts
- [ ] Security considerations addressed

## 🧪 Testing Guidelines

### Test Requirements
- All new features must include tests
- Bug fixes should include regression tests
- Aim for >80% code coverage
- Tests should be fast and reliable

### Test Categories
- **Unit Tests**: Test individual functions/components
- **Integration Tests**: Test API endpoints and database interactions
- **Security Tests**: Test authentication, authorization, and input validation
- **Performance Tests**: Test response times and throughput

### Running Tests
```bash
# Run all tests
bun test

# Run specific test categories
bun test:unit
bun test:integration
bun test:security

# Run with coverage
bun test:coverage
```

## 🎨 Code Style Guidelines

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer `const` over `let`, avoid `var`
- Use async/await over Promises

### Database
- Use Drizzle ORM for database operations
- Write migrations for schema changes
- Use proper indexing for performance
- Follow naming conventions (snake_case for columns)

### Security
- Validate all inputs using Zod schemas
- Use parameterized queries
- Implement proper error handling
- Follow principle of least privilege
- Never commit secrets or credentials

### API Design
- Follow RESTful conventions
- Use consistent response formats
- Implement proper HTTP status codes
- Add comprehensive error handling
- Document all endpoints

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for public functions
- Include examples in documentation
- Keep README.md up to date
- Document breaking changes

### API Documentation
- Update OpenAPI/Swagger specs
- Include request/response examples
- Document error codes and messages
- Add authentication requirements

## 🔒 Security Considerations

### Security Review Process
All contributions involving security-sensitive areas require additional review:
- Authentication and authorization
- Input validation and sanitization
- Database queries and operations
- External API integrations
- Cryptographic operations

### Security Best Practices
- Never hardcode secrets or credentials
- Validate and sanitize all inputs
- Use parameterized queries
- Implement proper error handling
- Follow OWASP guidelines
- Keep dependencies updated

## 🚀 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Security audit completed
- [ ] Performance benchmarks run

## 🆘 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Request Comments**: Code-specific discussions

### Resources
- [Project Wiki](https://github.com/THXNXKXT/digi-pocket-th/wiki)
- [API Documentation](http://localhost:3000/swagger)
- [Development Setup Guide](README.md#quick-start)

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Digi-Pocket Thailand! 🙏
