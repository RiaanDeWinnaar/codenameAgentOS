# YOLO-Browser Project Structure

This document explains the organization and structure of the YOLO-Browser project.

## Directory Structure

```
CNAIOS/
├── .github/                    # GitHub workflows and templates
├── .husky/                     # Git hooks (pre-commit automation)
├── .taskmaster/                # Taskmaster AI development workflow
├── .vscode/                    # VS Code workspace settings
├── assets/                     # Static assets (icons, images, etc.)
├── automation/                 # Browser automation logic
├── core/                       # Core utilities and shared logic
├── dist/                       # Build outputs (generated)
│   ├── main/                   # Compiled main process
│   ├── preload/                # Compiled preload scripts
│   └── renderer/               # Compiled renderer (React UI)
├── docs/                       # Documentation
├── out/                        # Packaged application (generated)
├── scripts/                    # Build and utility scripts
├── src/                        # Source code
│   ├── main/                   # Electron main process
│   ├── preload/                # Preload scripts (secure IPC bridge)
│   ├── renderer/               # React UI application
│   │   └── components/         # React components
│   └── shared/                 # Shared types and constants
├── tests/                      # Test files
└── ui/                         # UI components and assets
```

## Source Code Organization

### `src/main/` - Electron Main Process
- **`main.ts`** - Entry point for the Electron main process
- Handles window management, IPC, system APIs, and native automation
- Target: Node.js runtime in Electron main process

### `src/preload/` - Preload Scripts
- **`preload.ts`** - Secure bridge between main and renderer processes
- Exposes safe APIs to the renderer while maintaining security
- Target: Isolated context with access to both Node.js and DOM APIs

### `src/renderer/` - React UI Application
- **`index.tsx`** - Entry point for React application
- **`App.tsx`** - Main React application component
- **`components/`** - Reusable React components
- Target: Browser environment (Chromium in Electron)

### `src/shared/` - Shared Code
- **`types.ts`** - TypeScript type definitions used across processes
- **`constants.ts`** - Application constants and configuration
- Shared between main, preload, and renderer processes

## Build System

### Webpack Configuration
- **`webpack.main.config.js`** - Main process build configuration
- **`webpack.preload.config.js`** - Preload script build configuration  
- **`webpack.renderer.config.js`** - Renderer (React) build configuration

### TypeScript Configuration
- **`tsconfig.json`** - Base TypeScript configuration
- **`tsconfig.main.json`** - Main process specific settings
- **`tsconfig.preload.json`** - Preload script specific settings
- **`tsconfig.renderer.json`** - Renderer specific settings with React JSX

### Path Aliases
The build system includes path aliases for cleaner imports:
- `@shared/*` → `src/shared/*`
- `@main/*` → `src/main/*`
- `@preload/*` → `src/preload/*`
- `@renderer/*` → `src/renderer/*`
- `@components/*` → `src/renderer/components/*`

## Scripts and Commands

### Development Scripts
```bash
npm run dev              # Start development server with hot reload
npm start               # Start production build with Electron Forge
npm run start:prod      # Build and start production version
```

### Build Scripts
```bash
npm run build           # Build all targets (main, preload, renderer)
npm run build:prod      # Production build with optimizations
npm run build:full      # Full build with automated script
npm run clean           # Clean build outputs
npm run rebuild         # Clean and rebuild everything
```

### Code Quality Scripts
```bash
npm run lint            # Run ESLint on all TypeScript files
npm run lint:fix        # Run ESLint with automatic fixes
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # Type check all processes
```

### Packaging Scripts
```bash
npm run package         # Package application for current platform
npm run make            # Create distributables (installers)
npm run publish         # Publish to configured channels
```

## Development Workflow

### Multi-Process Architecture
YOLO-Browser uses Electron's multi-process architecture:

1. **Main Process** - Controls application lifecycle, creates renderer processes
2. **Renderer Process** - Runs the React UI in Chromium
3. **Preload Process** - Secure bridge for IPC communication

### Security Model
- Renderer process runs with `nodeIntegration: false` and `contextIsolation: true`
- Preload script provides secure API surface to renderer
- All Node.js APIs accessed through IPC from main process

### Code Quality
- **ESLint** - Code linting with TypeScript and React rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit quality checks
- **TypeScript** - Static type checking across all processes

### Hot Reload
- Webpack dev server provides hot reload for renderer process
- Electron-reload provides automatic restart for main process changes
- Concurrently manages both processes during development

## Production Build

### Build Outputs
- `dist/main/main.js` - Compiled main process
- `dist/preload/preload.js` - Compiled preload script
- `dist/renderer/` - Compiled React application with assets

### Packaging
- **Electron Forge** - Application packaging and distribution
- **ASAR** - Application source archive for packaging
- **Squirrel** - Windows installer support
- **Cross-platform** - Supports Windows, macOS, and Linux

### Security Features
- **Fuses** - Electron security features enabled at build time
- **ASAR Integrity** - Validates application source integrity
- **Cookie Encryption** - Encrypts session cookies
- **Node CLI Protection** - Disables Node.js CLI arguments

## Configuration Files

### Package Management
- **`package.json`** - NPM dependencies and scripts
- **`package-lock.json`** - Locked dependency versions

### Build Tools
- **`forge.config.js`** - Electron Forge configuration
- **`.eslintrc.js`** - ESLint configuration (deprecated)
- **`eslint.config.mjs`** - Modern ESLint flat configuration
- **`.prettierrc.json`** - Prettier formatting rules

### Development Tools
- **`.gitignore`** - Git ignore patterns
- **`.env.example`** - Environment variable template
- **`.vscode/settings.json`** - VS Code workspace settings

## Getting Started

1. **Install dependencies**: `npm install`
2. **Start development**: `npm run dev`
3. **Build for production**: `npm run build:prod`
4. **Package application**: `npm run package`

## Next Steps

This foundation provides:
- ✅ Electron + React + TypeScript setup
- ✅ Multi-process build system
- ✅ Code quality tooling
- ✅ Production packaging

Next major components to implement:
- Monaco Editor integration
- Browser automation APIs
- YOLO Mode trust system
- AI gateway integration
