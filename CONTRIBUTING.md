# Contributing to DumpIt

Thank you for your interest in contributing to DumpIt — a minimal resource vault for saving and sharing useful links and multi-media content. We welcome contributions from beginners and experienced developers alike. This guide will help you get started quickly.

## Table of Contents

- [Getting Started](#getting-started)
- [How to File a Good Issue](#how-to-file-a-good-issue)
- [How to Propose a Change (Pull Request)](#how-to-propose-a-change-pull-request)
- [Branching & Commit Message Guidelines](#branching--commit-message-guidelines)
- [Code Style and Testing](#code-style-and-testing)
- [Good First Issues & Labels](#good-first-issues--labels)
- [Code of Conduct](#code-of-conduct)
- [Contact](#contact)


## Getting started
1. Fork the repo and clone it locally:

```bash
git clone https://github.com/<your-username>/dumpit.git
cd dumpit
```

> Note: If you do not have push access to the main repository, fork it first using the GitHub UI ("Fork" button). Clone your fork and push branches to your fork when opening PRs.

2. Create a branch for your work:

```bash
git checkout -b feat/short-description
```

3. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

4. Make small, focused changes. Keep each PR scoped to a single issue or small feature.

When you're ready to open a PR from your fork:

```bash
# create a branch on your fork
git checkout -b feat/short-description
git add .
git commit -m "feat(scope): short description"
# push branch to your fork (origin should point to your fork)
git push origin feat/short-description
# Open a PR from your fork/feat/short-description -> upstream/main
```

## How to file a good issue
When you open an issue, please include:
- A short, descriptive title
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots or console logs if applicable
- Environment (browser, Node version, OS)

Use these templates (the repository includes issue templates) and add labels where appropriate.

## How to propose a change (pull request)
1. Create a small branch from `main`:

```bash
git checkout -b fix/short-description
```

2. Make the change, run tests and linters locally.

3. Commit with a clear message (see guidelines below) and push the branch.

```bash
git add .
git commit -m "fix(auth): handle signup race condition"
git push origin fix/short-description
```

4. Open a Pull Request against `main`. In the PR description, include:
- What the change does
- Which issue it closes (e.g., `Closes #123`)
- How to test the change

### PR review checklist
- [ ] The change is well-scoped and documented
- [ ] New code follows the project's style
- [ ] No console errors or regressions
- [ ] Tests added/updated when applicable

## Branching & commit message guidelines
- Branch names: `feat/`, `fix/`, `chore/`, `docs/` + short-description
- Commit messages: `<type>(scope): short summary`
  - type: feat, fix, docs, chore, refactor, test
  - scope: optional, e.g. `auth`, `dashboard`

Example:
```
feat(auth): add firebase signup profile creation
```

## Code style and testing
- This project uses TypeScript + React + Tailwind
- Run the linter and typechecker before opening PRs:

```bash
npm run lint
npm run typecheck
```

- Add unit tests for new logic when possible.

## Good First Issues & labels
We label issues to help contributors find tasks:
- `good first issue` — Small, well-scoped tasks for newcomers
- `help wanted` — Tasks that need attention
- `enhancement` — Feature ideas
- `bug` — Bugfix requests
- `hacktoberfest` — Eligible for Hacktoberfest contributions

Look for issues with `good first issue` to start.

## Code of Conduct
This project follows a Code of Conduct. Be kind and respectful in issue discussions and PR reviews. Violations may result in removal from the project.

## Contact
If you need help, open an issue and tag `@Rayan9064` or drop a note in the repository discussions.

---

Thanks again for contributing — your help makes DumpIt better for everyone!