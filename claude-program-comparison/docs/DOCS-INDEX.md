# Documentation Index

Complete guide to all project documentation for the CryptoMarket application.

---

## Quick Navigation

### For New Developers
1. Start with [README.md](../README.md) - Setup and quick start
2. Read [PROJECT-IDEA.md](#1-project-ideamd) - Understand the concept
3. Review [ARCHITECTURE.md](#2-architecturemd) - System design
4. Browse [API-ENDPOINTS.md](#3-api-endpointsmd) - API reference

### For Frontend Developers
1. [FRONTEND-COMPLETE.md](#5-frontend-completemd) - React implementation
2. [UI-DESIGN.md](#4-ui-designmd) - Design system
3. [TESTING-FRONTEND.md](#10-testing-frontendmd) - E2E tests

### For Backend Developers
1. [BACKEND-COMPLETE.md](#6-backend-completemd) - ASP.NET Core features
2. [AUTH-IMPLEMENTATION.md](#7-auth-implementationmd) - Security & JWT
3. [TESTING-BACKEND.md](#9-testing-backendmd) - Unit & integration tests

---

## All Documentation Files

### 1. PROJECT-IDEA.md
**Purpose**: Original project concept and requirements

**Contents**:
- Project overview and goals
- Core feature descriptions (Dashboard, Comparison, Store, Portfolio)
- Additional feature rationale (Portfolio Tracker)
- Target users and use cases
- Non-functional requirements (Security, Performance, UX, Maintainability)
- Success metrics

**When to read**: Before starting development or when clarifying project scope

**File**: [docs/PROJECT-IDEA.md](PROJECT-IDEA.md)

---

### 2. ARCHITECTURE.md
**Purpose**: Complete system architecture and design documentation

**Contents**:
- System overview and architecture diagrams
- Clean Architecture layers (Domain, Application, Infrastructure, Web)
- Technology stack
- Design patterns (Repository, Service Layer, DTO, Dependency Injection)
- Database schema and relationships
- Data flow diagrams
- Security architecture
- Deployment considerations
- Scalability strategies

**When to read**: Understanding system structure, planning major changes, onboarding

**File**: [docs/ARCHITECTURE.md](ARCHITECTURE.md)

**Size**: ~52KB (comprehensive)

---

### 3. API-ENDPOINTS.md
**Purpose**: Complete REST API reference documentation

**Contents**:
- All 25 API endpoints organized by category
- Request/response examples with JSON
- Authentication requirements
- Error responses and status codes
- Rate limiting information
- SignalR hub documentation

**Endpoint Categories**:
1. Authentication (5 endpoints)
2. Cryptocurrency Data (5 endpoints)
3. Portfolio Management (4 endpoints)
4. Shopping Cart (6 endpoints)
5. Price Alerts (4 endpoints)
6. Real-Time Updates (1 SignalR hub)

**When to read**: Building frontend integration, testing APIs, understanding contracts

**File**: [docs/API-ENDPOINTS.md](API-ENDPOINTS.md)

**Size**: ~20KB

---

### 4. UI-DESIGN.md
**Purpose**: Frontend design system and component documentation

**Contents**:
- Design tokens (colors, typography, spacing, shadows)
- Component library (Button, Input, Card, Modal, Loading, Toast)
- Layout components (Header, Footer, Layout Wrapper)
- Theme system (Light/Dark modes)
- Accessibility guidelines (WCAG 2.1 AA)
- Responsive design breakpoints
- Best practices and utilities
- Animation guidelines

**When to read**: Building UI components, ensuring design consistency, accessibility compliance

**File**: [docs/UI-DESIGN.md](UI-DESIGN.md)

**Size**: ~6KB

---

### 5. FRONTEND-COMPLETE.md
**Purpose**: Comprehensive frontend implementation documentation

**Contents**:
- All pages inventory (9 pages)
- Component inventory by category
- Services and API integration
- Custom hooks (useSignalR)
- Context providers (Auth, Theme, Toast)
- Features implemented (Real-time updates, Dark mode, Responsive design)
- Performance optimizations (Code splitting, lazy loading)
- Build output and bundle sizes
- Accessibility compliance
- Known issues and future enhancements

**When to read**: Understanding React implementation, optimizing performance, troubleshooting

**File**: [docs/FRONTEND-COMPLETE.md](FRONTEND-COMPLETE.md)

**Size**: ~12KB

---

### 6. BACKEND-COMPLETE.md
**Purpose**: Comprehensive backend feature and implementation documentation

**Contents**:
- All features with detailed descriptions (8 major features)
- Security measures (OWASP Top 10 compliance)
- Performance optimizations (Caching, database indexes, async/await)
- Architecture patterns and code quality
- Database schema and relationships
- Background services (Price updates, Alert monitoring)
- Known limitations
- Recommended future improvements
- Configuration guide
- Deployment checklist

**When to read**: Understanding backend capabilities, security review, deployment planning

**File**: [docs/BACKEND-COMPLETE.md](BACKEND-COMPLETE.md)

**Size**: ~17KB

---

### 7. AUTH-IMPLEMENTATION.md
**Purpose**: Authentication and authorization system documentation

**Contents**:
- JWT token architecture
- Registration flow with validation
- Login flow with password verification
- Token refresh mechanism
- Logout and token revocation
- Protected routes and authorization
- Security measures (BCrypt, token expiration, validation)
- Implementation details (Middleware, Services, Controllers)
- Testing authentication
- Troubleshooting guide

**When to read**: Implementing authentication features, security audits, troubleshooting auth issues

**File**: [docs/AUTH-IMPLEMENTATION.md](AUTH-IMPLEMENTATION.md)

**Size**: ~16KB

---

### 8. BACKEND-SETUP.md
**Purpose**: Backend development environment setup guide

**Contents**:
- Prerequisites and installation
- Project structure
- Database setup with Entity Framework
- Running migrations
- Starting the development server
- Configuration files (appsettings.json)
- Environment variables
- Troubleshooting common issues

**When to read**: First-time backend setup, configuring new development environment

**File**: [docs/BACKEND-SETUP.md](BACKEND-SETUP.md)

**Size**: ~15KB

---

### 9. TESTING-BACKEND.md
**Purpose**: Backend testing strategy and documentation

**Contents**:
- Test project structure (56+ tests)
- Test technologies (xUnit, Moq, EF InMemory)
- Running tests (commands, filters, coverage)
- Unit tests (AuthService, CartService, PortfolioService)
- Integration tests (AuthController)
- Security tests (SQL injection, XSS, authentication)
- Test coverage goals (70%+ target)
- Known gaps and future tests
- Best practices and patterns

**When to read**: Writing tests, understanding test coverage, CI/CD setup

**File**: [docs/TESTING-BACKEND.md](TESTING-BACKEND.md)

**Size**: ~13KB

---

### 10. TESTING-FRONTEND.md
**Purpose**: Frontend E2E testing with Playwright documentation

**Contents**:
- Test project structure (46 tests across 5 suites)
- Test technologies (Playwright, TypeScript)
- Prerequisites and installation
- Running tests (all browsers, specific tests, UI mode)
- Test coverage breakdown:
  - Authentication Flow (6 tests)
  - Dashboard Flow (7 tests)
  - Store and Cart Flow (10 tests)
  - Comparison Flow (11 tests)
  - Portfolio Flow (12 tests)
- Test configuration (playwright.config.ts)
- Mobile responsiveness testing
- Debugging and troubleshooting
- CI/CD integration examples

**When to read**: Running E2E tests, adding new tests, debugging failures

**File**: [docs/TESTING-FRONTEND.md](TESTING-FRONTEND.md)

**Size**: ~21KB

---

### 11. FRONTEND-PROGRESS.md
**Purpose**: Historical document tracking frontend development progress

**Contents**:
- Incremental development steps
- Component creation timeline
- Feature implementation history
- Issues encountered and resolved

**Status**: Historical reference (superseded by FRONTEND-COMPLETE.md)

**When to read**: Understanding development history, learning from past decisions

**File**: [docs/FRONTEND-PROGRESS.md](FRONTEND-PROGRESS.md)

**Size**: ~13KB

---

### 12. TESTING-STATUS.md
**Purpose**: Historical testing status document

**Contents**:
- Initial testing strategy
- Test implementation plan
- Coverage goals

**Status**: Historical reference (superseded by TESTING-BACKEND.md and TESTING-FRONTEND.md)

**When to read**: Understanding original testing plans

**File**: [docs/TESTING-STATUS.md](TESTING-STATUS.md)

**Size**: ~11KB

---

### 13. HANDOVER.md
**Purpose**: Project handover guide for new developers

**Contents**:
- Project status summary
- What's complete and production-ready
- Known limitations and workarounds
- Future improvement priorities
- How to continue development
- Important considerations

**When to read**: Taking over the project, planning next steps

**File**: [docs/HANDOVER.md](HANDOVER.md)

---

## Documentation by Development Phase

### Phase 1: Planning & Design
1. [PROJECT-IDEA.md](#1-project-ideamd) - Understand requirements
2. [ARCHITECTURE.md](#2-architecturemd) - Review architecture
3. [UI-DESIGN.md](#4-ui-designmd) - Study design system

### Phase 2: Backend Development
1. [BACKEND-SETUP.md](#8-backend-setupmd) - Environment setup
2. [ARCHITECTURE.md](#2-architecturemd) - Reference layers and patterns
3. [API-ENDPOINTS.md](#3-api-endpointsmd) - Implement endpoints
4. [AUTH-IMPLEMENTATION.md](#7-auth-implementationmd) - Add authentication
5. [TESTING-BACKEND.md](#9-testing-backendmd) - Write tests
6. [BACKEND-COMPLETE.md](#6-backend-completemd) - Verify completeness

### Phase 3: Frontend Development
1. [UI-DESIGN.md](#4-ui-designmd) - Implement components
2. [API-ENDPOINTS.md](#3-api-endpointsmd) - Integrate with backend
3. [FRONTEND-COMPLETE.md](#5-frontend-completemd) - Reference implementation
4. [TESTING-FRONTEND.md](#10-testing-frontendmd) - Write E2E tests

### Phase 4: Testing & Deployment
1. [TESTING-BACKEND.md](#9-testing-backendmd) - Run backend tests
2. [TESTING-FRONTEND.md](#10-testing-frontendmd) - Run frontend tests
3. [BACKEND-COMPLETE.md](#6-backend-completemd) - Deployment checklist
4. [HANDOVER.md](#13-handovermd) - Final review

---

## Documentation by Role

### Product Manager / Business Analyst
- [PROJECT-IDEA.md](#1-project-ideamd) - Requirements and features
- [HANDOVER.md](#13-handovermd) - Project status

### System Architect
- [ARCHITECTURE.md](#2-architecturemd) - Complete system design
- [BACKEND-COMPLETE.md](#6-backend-completemd) - Implementation details

### Backend Developer
- [BACKEND-SETUP.md](#8-backend-setupmd) - Environment setup
- [API-ENDPOINTS.md](#3-api-endpointsmd) - API contracts
- [AUTH-IMPLEMENTATION.md](#7-auth-implementationmd) - Security implementation
- [TESTING-BACKEND.md](#9-testing-backendmd) - Testing guide

### Frontend Developer
- [UI-DESIGN.md](#4-ui-designmd) - Design system
- [API-ENDPOINTS.md](#3-api-endpointsmd) - API integration
- [FRONTEND-COMPLETE.md](#5-frontend-completemd) - Implementation guide
- [TESTING-FRONTEND.md](#10-testing-frontendmd) - E2E testing

### QA Engineer / Tester
- [TESTING-BACKEND.md](#9-testing-backendmd) - Backend test suites
- [TESTING-FRONTEND.md](#10-testing-frontendmd) - Frontend test suites
- [API-ENDPOINTS.md](#3-api-endpointsmd) - API testing reference

### DevOps Engineer
- [BACKEND-COMPLETE.md](#6-backend-completemd) - Deployment checklist
- [ARCHITECTURE.md](#2-architecturemd) - Infrastructure requirements
- [README.md](../README.md) - Environment variables and configuration

---

## Recommended Reading Order for New Developers

### Day 1: Overview & Setup
1. **[README.md](../README.md)** (30 min) - Project overview and quick start
2. **[PROJECT-IDEA.md](#1-project-ideamd)** (20 min) - Understand the vision
3. **[ARCHITECTURE.md](#2-architecturemd)** (45 min) - System architecture
4. **[BACKEND-SETUP.md](#8-backend-setupmd)** (30 min) - Get backend running
5. **[README.md](../README.md)** Frontend section (15 min) - Get frontend running

### Day 2: Deep Dive - Backend
1. **[BACKEND-COMPLETE.md](#6-backend-completemd)** (60 min) - All backend features
2. **[API-ENDPOINTS.md](#3-api-endpointsmd)** (45 min) - API reference
3. **[AUTH-IMPLEMENTATION.md](#7-auth-implementationmd)** (30 min) - Security details
4. **[TESTING-BACKEND.md](#9-testing-backendmd)** (30 min) - Testing strategy

### Day 3: Deep Dive - Frontend
1. **[UI-DESIGN.md](#4-ui-designmd)** (30 min) - Design system
2. **[FRONTEND-COMPLETE.md](#5-frontend-completemd)** (45 min) - Frontend features
3. **[TESTING-FRONTEND.md](#10-testing-frontendmd)** (45 min) - E2E tests
4. **[HANDOVER.md](#13-handovermd)** (20 min) - Current status

**Total Estimated Time**: ~7 hours

---

## Documentation Maintenance

### Keeping Documentation Updated

When making changes to the codebase:

1. **New Feature**: Update relevant *-COMPLETE.md and API-ENDPOINTS.md
2. **New API Endpoint**: Update API-ENDPOINTS.md with examples
3. **UI Component**: Update UI-DESIGN.md if it's a reusable component
4. **Security Change**: Update AUTH-IMPLEMENTATION.md and BACKEND-COMPLETE.md
5. **Test Addition**: Update TESTING-*.md files
6. **Architecture Change**: Update ARCHITECTURE.md
7. **Breaking Change**: Update README.md and HANDOVER.md

### Documentation Standards

- Use Markdown formatting consistently
- Include code examples with syntax highlighting
- Keep file sizes reasonable (< 100KB)
- Use relative links between documents
- Add table of contents for long documents
- Include "Last Updated" dates
- Use clear section headings

---

## External Resources

### Official Documentation
- [ASP.NET Core Docs](https://docs.microsoft.com/en-us/aspnet/core/)
- [React Documentation](https://react.dev/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [Playwright Docs](https://playwright.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)

### API Documentation
- [CoinGecko API v3](https://www.coingecko.com/en/api/documentation)

### Testing Resources
- [xUnit Documentation](https://xunit.net/)
- [Moq Quickstart](https://github.com/moq/moq4/wiki/Quickstart)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

---

## Quick Reference

### File Sizes
- **Largest**: ARCHITECTURE.md (~52KB)
- **Most Detailed**: BACKEND-COMPLETE.md (~17KB)
- **Most Practical**: API-ENDPOINTS.md (~20KB)
- **Quickest Read**: UI-DESIGN.md (~6KB)

### Total Documentation
- **Files**: 13 documents
- **Total Size**: ~200KB
- **Estimated Read Time**: ~7 hours (complete)
- **Quick Start Time**: ~1 hour (README + PROJECT-IDEA)

---

**Index Version**: 1.0.0
**Last Updated**: December 4, 2025
**Maintained By**: Development Team

**Need to add a new document?** Update this index with:
- Document purpose
- Key contents
- When to read
- File link
- Size estimate
