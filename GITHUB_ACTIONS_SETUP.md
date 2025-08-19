# GitHub Actions Setup Guide

This guide explains how to configure your GitHub repository to automatically run tests on all pull requests.

## What Was Set Up

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers**:

- All pull requests to `main`
- All pushes to `main`

**Steps**:

- ✅ Checkout code
- ✅ Setup Node.js with yarn caching
- ✅ Install dependencies
- ✅ Run linting (`yarn lint`)
- ✅ Run type checking (`yarn check`)
- ✅ **Run tests** (`yarn test:run`)
- ✅ Build application
- ✅ Generate test coverage (PR only)

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

**Updated to**:

- Only deploy if CI tests pass
- Still allows manual deployment
- Maintains existing GitHub Pages functionality

## How It Works

### For Pull Requests:

1. Developer creates a PR
2. **CI workflow automatically runs**
3. All tests must pass before PR can be merged
4. Coverage report is generated
5. GitHub shows ✅ or ❌ status on the PR

### For Main Branch:

1. Code is merged to `main`
2. CI tests run again
3. If tests pass, deployment workflow runs
4. Site is deployed to GitHub Pages

## Repository Settings Required

### 1. Enable Branch Protection

Go to **Settings → Branches → Add rule** for `main`:

```
☑ Require a pull request before merging
☑ Require status checks to pass before merging
☑ Require branches to be up to date before merging
☑ Status checks: Select "Test" (CI workflow)
☑ Restrict pushes that create files larger than 100 MB
```

### 2. Enable GitHub Pages (if not already)

Go to **Settings → Pages**:

- Source: **GitHub Actions**
- Custom domain: (optional)

### 3. Set Repository Permissions

Go to **Settings → Actions → General**:

```
☑ Allow all actions and reusable workflows
☑ Read and write permissions (for deployment)
☑ Allow GitHub Actions to create and approve pull requests
```

## Testing the Setup

### Create a Test Pull Request:

1. Create a new branch: `git checkout -b test-ci`
2. Make a small change (e.g., update README)
3. Commit and push: `git push origin test-ci`
4. Create PR on GitHub
5. **Watch the CI workflow run automatically**

### Verify It Works:

- ✅ CI status should appear on the PR
- ✅ Tests should run and pass
- ✅ Coverage report should be generated
- ✅ PR should be mergeable only if tests pass

## Workflow Files Overview

### `.github/workflows/ci.yml`

- **Purpose**: Quality assurance for all code changes
- **When**: Every PR and push to main
- **What**: Linting, type checking, testing, building

### `.github/workflows/deploy.yml`

- **Purpose**: Deploy to production (GitHub Pages)
- **When**: After successful CI on main branch
- **What**: Build and deploy static site

## Commands Available

```bash
# Run tests locally (same as CI)
ddev yarn test:run

# Run with coverage
ddev yarn test:coverage

# Run linting
ddev yarn lint

# Run type checking
ddev yarn check

# Build application
ddev yarn build
```

## Benefits

✅ **Catch bugs early** - Tests run on every PR
✅ **Prevent broken deployments** - Only deploy if tests pass  
✅ **Code quality** - Linting and type checking enforced
✅ **Confidence** - Know that main branch always works
✅ **Documentation** - CI status visible on every PR
✅ **Coverage tracking** - See what code is tested

## Next Steps

1. **Commit and push** these workflow files
2. **Configure branch protection** (see above)
3. **Create a test PR** to verify it works
4. **Update your development workflow**:
   - Always create PRs instead of pushing directly to main
   - Wait for CI to pass before merging
   - Use the green checkmark as confidence indicator

## Troubleshooting

### Tests fail in CI but pass locally?

- Check Node.js version matches (CI uses Node 20)
- Ensure `yarn.lock` is committed
- Run `ddev yarn install --frozen-lockfile` locally

### Deployment not triggered?

- Verify CI workflow completed successfully
- Check deployment workflow conditions
- Manually trigger with "Run workflow" button

### Coverage not showing?

- Ensure PR is targeting `main` branch
- Check if codecov action completed
- Coverage only runs on PRs, not pushes

This setup ensures that your duplicate prevention tests (and all other tests) automatically protect your main branch from regressions!
