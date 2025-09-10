# YOLO-Browser Development Guide

## Project Overview

YOLO-Browser is an **autonomous web automation platform** built on Electron that combines a code editor, browser automation, and terminal in a unified agent-native environment. The core innovation is **"YOLO Mode"** - a trust-based permission system that eliminates approval prompts for AI agent operations.

### Architecture: Three-Process Electron App

```
Main Process (Node.js) → IPC Gateway + System APIs + Native Automation
├── Renderer Process → React UI (Monaco Editor + Browser + Terminal)
└── Preload Process → Secure IPC Bridge
```

## Key Technical Patterns

### Electron Multi-Process Architecture

- **Main Process**: `src/main/main.ts` - handles system APIs, native automation, IPC coordination
- **Renderer Process**: `src/renderer/` - React UI with Monaco Editor, embedded browser, xterm.js terminal
- **Preload Script**: `src/preload/preload.ts` - secure IPC bridge between main and renderer

### Monaco Editor Integration (Platform-Adaptive)

- **Architecture**: Platform-adaptive integration with automatic environment detection
- **Core Files**:
  - `src/renderer/components/monaco/PlatformAdapter.ts` - Platform detection and configuration
  - `src/renderer/components/monaco/MonacoService.ts` - Service layer with fallback strategies
  - `src/renderer/components/MonacoEditor.tsx` - React component (current implementation)
  - `src/renderer/components/MonacoEditorRefactored.tsx` - Future service-based implementation
- **Strategy**: Direct Monaco integration (no React wrapper) for maximum control
- **Platform Support**:
  - **Electron** (current): Bundled strategy with local workers
  - **Web** (future): Hybrid strategy (bundled + CDN fallback)
  - **Mobile** (future): Minimal strategy (<2MB bundle)
- **Security**: CSP-compliant local worker loading, no external CDN dependencies
- **Performance**: Sub-2s initialization, 28+ programming languages supported
- **Documentation**: See `docs/Monaco-Integration-Architecture.md` for complete details

### Build System: Webpack Multi-Target

```bash
npm run build:main      # Main process (target: electron-main)
npm run build:renderer  # Renderer UI (target: electron-renderer)
npm run build:preload   # Preload script (target: electron-preload)
npm run build          # All targets
npm run dev            # Development with hot reload
```

### Native Browser Integration

- **Core Principle**: Use Electron's native `webContents` API, NOT puppeteer/playwright
- **Direct DOM Access**: `webContents.executeJavaScript()` for immediate control
- **Native Overlays**: Automation UI rendered as browser chrome, not injected scripts
- **Cross-Tab Context**: Persistent automation state across navigation and tabs

### AI Provider Architecture

- **Primary Endpoint**: `localhost:4000/openai/v1` (compatible with Goose ecosystem)
- **Multi-Provider Support**: OpenAI, Anthropic, Ollama, local models
- **Context Injection**: Real-time editor/browser/terminal state in AI prompts
- **Intent-Based Automation**: High-level commands (`"submit form"`) vs low-level (`"click element"`)

## Development Workflows

### Core Development Loop

1. **Code in Monaco**: TypeScript/React development with AI assistance
2. **Test in Browser**: Native Chromium with automation overlay
3. **Execute in Terminal**: xterm.js + node-pty for system commands
4. **Context Sharing**: Real-time state sync between all components (sub-100ms target)

### Testing Strategy

- **Playwright**: End-to-end Electron app testing (`tests/monaco-editor.electron.spec.ts`)
- **Monaco Integration**: Editor functionality and language features
  - **Current Status**: Working Monaco integration with 28+ languages
  - **Test Coverage**: Manual verification completed, automated tests needed
  - **Platform Testing**: Electron validated, web/mobile testing required
- **Native Automation**: WebContents API reliability and performance
- **Cross-Platform**: Windows (primary), macOS, Linux compatibility

### YOLO Mode Implementation

- **Trust Boundaries**: Granular permissions per operation/domain/data-type
- **Permission Storage**: Local encrypted storage with cryptographic integrity
- **Visual Indicators**: Real-time UI showing current trust level and automation status
- **Emergency Controls**: Instant stop/pause with rollback capabilities

## Project-Specific Conventions

### File Organization

```
src/
├── main/           # Electron main process - system integration
├── renderer/       # React UI - editor, browser, terminal
│   └── components/ # Monaco, Browser, Terminal components
│       └── monaco/ # Monaco Editor platform abstraction layer
│           ├── PlatformAdapter.ts    # Platform detection & config
│           └── MonacoService.ts      # Service layer with fallbacks
└── preload/        # Secure IPC bridge
docs/               # Technical documentation
├── Monaco-Integration-Architecture.md  # Complete Monaco architecture docs
└── Monaco-Quick-Start.md              # Developer quick reference
```

### TypeScript Configuration

- **Main Process**: `tsconfig.json` - Node.js target with Electron APIs
- **Renderer Process**: `tsconfig.renderer.json` - DOM target with React
- **Shared Types**: Define IPC interfaces and automation models

### State Management Pattern

- **Centralized State**: Single source of truth for editor/browser/terminal context
- **IPC Events**: Real-time synchronization between processes
- **Permission Context**: Trust boundaries and automation permissions
- **Session Persistence**: Cross-tab and cross-navigation state management

## Integration Points

### MCP Server Ecosystem

- **Goal**: Seamless compatibility with Block Goose CLI tools
- **Pattern**: YOLO-Browser handles GUI, Goose handles CLI
- **Tool Sharing**: Common MCP servers for both platforms
- **Handoff Workflows**: Web tasks trigger local development workflows

### System API Integration

- **Windows**: MSAA (Microsoft Active Accessibility) for application control
- **macOS**: Accessibility APIs for native app automation
- **Linux**: AT-SPI for system integration
- **Abstraction**: Unified SystemAPIManager for cross-platform operations

### AI Context Patterns

- **Multi-Modal Context**: Combine editor content, browser DOM, terminal history
- **Privacy Options**: Local processing vs cloud API calls
- **Real-Time Streaming**: WebSocket connections for immediate AI responses
- **Failover Strategy**: Automatic provider switching on failures

## Critical Implementation Notes

### Security & Trust

- **Sandbox Isolation**: All automation runs in controlled environments
- **Audit Logging**: Immutable log of all autonomous actions
- **Permission Verification**: Cryptographic signatures for trust validation
- **Local-First**: Sensitive data stays on device by default

### Performance Requirements

- **Context Sync**: Sub-100ms between editor/browser/terminal
- **Automation Response**: Sub-2-second command execution
- **AI Integration**: Sub-1-second responses with context
- **Memory Management**: Efficient handling of multiple browser tabs and automation contexts

### Native vs Web Technologies

- **Avoid**: Browser extensions, remote debugging protocols, external automation tools
- **Prefer**: Native Electron APIs, direct webContents manipulation, platform-specific system APIs
- **Pattern**: If it requires external processes or protocols, redesign for native integration

## Getting Started with the Codebase

1. **Understand the Vision**: Read `SSOT.md` for the complete project vision and YOLO Mode philosophy
2. **Review Architecture**: Study `docs/PRD.md` for detailed technical requirements
3. **Start Development**: `npm run dev` for hot-reload development environment
4. **Test Integration**: Focus on webContents API patterns over traditional automation tools
5. **Build Incrementally**: Each component (editor/browser/terminal) should work standalone before integration

The goal is creating the first truly **agent-native development environment** where AI can code, browse, and automate without friction from approval prompts.

## Git Workflow & GitHub Push Guidelines

### CRITICAL: Pre-Push Security Checklist

**NEVER commit without completing this checklist:**

1. **API Key Security Verification**:
   - Verify `.env` is in `.gitignore` (contains real API keys)
   - Verify `.vscode/mcp.json` is in `.gitignore` (contains real API keys)  
   - Run `git status` to ensure sensitive files are not staged
   - Check for any hardcoded API keys in source files

2. **Build & Test Verification**:
   - Run `npm run build` to ensure project builds successfully
   - Verify no build errors or TypeScript issues
   - Check that dist/ folder contains expected artifacts

### GitHub Push Protocol (Choose ONE Method)

#### Method 1: VS Code Integrated Git (RECOMMENDED for Safety)
**Use when**: Need visual verification and safety checks

1. **Stage Files Safely**:
   ```
   - Open VS Code Source Control panel (Ctrl+Shift+G)
   - Review EACH file in "Changes" list
   - Verify NO sensitive files (.env, .vscode/mcp.json) are listed
   - Stage files individually OR use "Stage All Changes" if verified safe
   ```

2. **Commit with Clear Message**:
   ```
   - Write descriptive commit message explaining changes
   - Use format: "feat/fix/docs: Brief description"
   - Click "Commit" button
   ```

3. **Push to GitHub**:
   ```
   - Click "Sync Changes" or "Push" button
   - Monitor progress in VS Code terminal
   - Verify success notification
   ```

#### Method 2: Command Line Git (Use for Large Files/Performance)
**Use when**: Pushing large repositories or VS Code performance issues

1. **Security Check First**:
   ```powershell
   git status                    # Verify no sensitive files
   git diff --cached --name-only # Review staged files
   ```

2. **Stage and Commit**:
   ```powershell
   git add .                     # Stage all changes (if safe)
   git commit -m "feat: Your commit message here"
   ```

3. **Push to GitHub**:
   ```powershell
   git push origin main          # Push to main branch
   ```

#### Method 3: Hybrid Approach (BEST for Large Projects)
**Use when**: Need both safety and performance

1. **Use VS Code for Review**: Visually inspect all changes in Source Control panel
2. **Use Command Line for Push**: Execute git commands in terminal for performance
3. **Verify in VS Code**: Confirm push success in Source Control panel

### Common Git Issues & Solutions

#### Issue: "Repository Not Found" or Authentication Errors
**Solution**: Check GitHub token and repository access
```powershell
git remote -v                   # Verify remote URL
git config user.name           # Verify Git identity
git config user.email          # Verify Git email
```

#### Issue: Large File Push Failures
**Solution**: Use Git LFS or break into smaller commits
```powershell
git lfs track "*.large-file-extension"
git add .gitattributes
```

#### Issue: Merge Conflicts
**Solution**: Use VS Code merge conflict resolution
- Open conflicted files in VS Code
- Use built-in merge conflict resolver
- Test resolution before committing

### Emergency Git Recovery

#### If Push Fails Catastrophically:
1. **DO NOT PANIC** - Git maintains history
2. **Check Git Log**: `git log --oneline -10`
3. **Reset to Last Known Good**: `git reset --hard HEAD~1`
4. **Contact Senior Developer**: Before attempting complex recovery

#### If Sensitive Data Accidentally Committed:
1. **IMMEDIATE ACTION REQUIRED**
2. **Remove from Git History**: `git filter-branch` or BFG Repo-Cleaner
3. **Regenerate ALL API Keys**: Assume compromise
4. **Force Push**: `git push --force-with-lease origin main`

### Performance Guidelines

- **Small Changes** (<10 files): Use VS Code integrated git
- **Large Changes** (10+ files): Use command line git
- **Mixed Content**: Use hybrid approach
- **Binary Files**: Verify .gitignore excludes unnecessary binaries
- **Build Artifacts**: Never commit dist/ folder unless explicitly required

### Repository-Specific Rules

- **Branch Strategy**: Main branch for stable releases, feature branches for development
- **Commit Message Format**: Use conventional commits (feat:, fix:, docs:, refactor:)
- **API Key Management**: NEVER commit real API keys - use environment variables
- **Build Process**: Always build before committing to verify functionality
