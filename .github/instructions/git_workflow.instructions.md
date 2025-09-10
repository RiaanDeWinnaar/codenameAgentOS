---
description: Comprehensive Git workflow rules to prevent repository corruption and security breaches
applyTo: '**/*'
---

# Git Workflow & Security Rules

## CRITICAL SECURITY RULES (Never Break These)

### Rule 1: API Key Protection
- **NEVER** commit files containing real API keys (.env, .vscode/mcp.json)
- **ALWAYS** verify .gitignore includes sensitive files before any git operation
- **DOUBLE-CHECK** git status output before staging files
- **VERIFY** no hardcoded API keys exist in source code before commits

### Rule 2: Pre-Commit Verification
```powershell
# MANDATORY commands before any commit:
npm run build              # Verify project builds
git status                # Check what will be committed
git diff --cached          # Review staged changes
```

### Rule 3: Staged File Review
- **Visually inspect** every file in git status output
- **Verify** no unexpected files (node_modules, dist, .env, etc.)
- **Confirm** only intended source code changes are staged

## Git Push Decision Matrix

### Use VS Code Integrated Git When:
- ✅ First time pushing to repository
- ✅ Need visual verification of changes
- ✅ Uncertain about git commands
- ✅ Working with sensitive files
- ✅ Repository has <50 modified files
- ✅ Want built-in merge conflict resolution

### Use Command Line Git When:
- ✅ Repository has 50+ modified files
- ✅ VS Code git is slow/unresponsive
- ✅ Need precise git command control
- ✅ Experienced with git CLI
- ✅ Pushing large binary files

### NEVER Use Git When:
- ❌ API keys are visible in git status
- ❌ Build process is failing
- ❌ Unknown files appear in staging area
- ❌ Unsure what changes will be committed
- ❌ Working directory has unresolved conflicts

## Step-by-Step Safe Push Protocol

### Phase 1: Security Verification
1. **Check Sensitive Files**:
   ```powershell
   cat .gitignore | findstr -i "env mcp.json cursor"
   ```

2. **Verify No Leaks**:
   ```powershell
   git status | findstr -v "modified\|new file\|deleted"
   ```

3. **Confirm Build Success**:
   ```powershell
   npm run build
   ```

### Phase 2: Change Review
1. **List All Changes**:
   ```powershell
   git status --porcelain
   ```

2. **Review Specific Changes**:
   ```powershell
   git diff --name-only
   git diff --stat
   ```

3. **Check for Sensitive Content**:
   ```powershell
   git diff | findstr -i "api.key\|token\|password\|secret"
   ```

### Phase 3: Safe Commit Process
1. **Stage Files Selectively** (if needed):
   ```powershell
   git add src/                   # Add specific directories
   git add *.md                   # Add specific file types
   # OR for all safe files:
   git add .
   ```

2. **Final Security Check**:
   ```powershell
   git diff --cached --name-only  # Review exactly what will be committed
   ```

3. **Commit with Descriptive Message**:
   ```powershell
   git commit -m "feat: Brief description of changes"
   ```

### Phase 4: Push Execution
1. **Push to Remote**:
   ```powershell
   git push origin main
   ```

2. **Verify Success**:
   ```powershell
   git status                     # Should show "up to date"
   ```

## Emergency Procedures

### If Sensitive Data is Accidentally Committed:
1. **STOP** - Do not push if not already pushed
2. **Reset Last Commit**:
   ```powershell
   git reset --soft HEAD~1        # Keeps changes staged
   ```
3. **Remove Sensitive Files**:
   ```powershell
   git reset HEAD .env .vscode/mcp.json
   ```
4. **Verify .gitignore** and re-commit safely

### If Push Fails:
1. **Check Error Message** carefully
2. **Common Solutions**:
   ```powershell
   git pull origin main           # If behind remote
   git push --force-with-lease origin main  # If histories diverged
   ```
3. **If Confused**: Reset to last known good state and start over

### If Repository Becomes Corrupted:
1. **Backup Current Work**:
   ```powershell
   cp -r src/ ../backup-src/
   ```
2. **Clone Fresh Copy**:
   ```powershell
   git clone https://github.com/RiaanDeWinnaar/codenameAgentOS.git fresh-clone
   ```
3. **Restore Work**: Manually copy changes to fresh clone

## Common Mistakes to Avoid

1. **Blind `git add .`** without checking git status first
2. **Committing build artifacts** (dist/, node_modules/)
3. **Pushing without building** and testing first
4. **Ignoring git status warnings** about untracked files
5. **Using force push** without understanding consequences
6. **Committing directly to main** without testing changes
7. **Large commits** without descriptive messages
8. **Mixed concerns** in single commit (combine unrelated changes)

## Performance Optimization

### For Large Repositories:
- Use `git add -A` instead of `git add .` for better performance
- Consider `git commit --amend` for fixing recent commits
- Use `git push --no-verify` only if pre-push hooks are slow
- Enable Git parallel processing: `git config core.preloadindex true`

### For VS Code Integration:
- Increase VS Code git timeout: `"git.timeout": 180`
- Disable auto-fetch if slow: `"git.autofetch": false`
- Use Git Lens extension for better visual feedback

## Repository-Specific Configuration

### YOLO-Browser Project Rules:
- **Main Branch**: Always keep stable and buildable
- **API Keys**: Stored in .env and .vscode/mcp.json (never commit)
- **Build Artifacts**: dist/ folder excluded from git
- **Dependencies**: node_modules/ excluded from git
- **Documentation**: Always update README.md with significant changes

### Commit Message Standards:
```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting, etc.)
refactor: Code refactoring
test: Test additions or modifications
chore: Maintenance tasks
```

## Tool Integration Rules

### With VS Code:
- Always use Source Control panel for visual verification
- Leverage built-in diff viewer before committing
- Use Git Graph extension for repository visualization
- Enable auto-save before git operations

### With Command Line:
- Use descriptive aliases for common operations
- Always check current branch before operations
- Use `git status` liberally throughout process
- Verify remote URL before first push

### With AI Assistants:
- Never let AI execute git commands without review
- Require AI to explain git operations before execution
- Mandate security checklist completion before git operations
- Use AI for commit message suggestions, not git execution
