# YOLO-Browser (Codename: AgentOS)

An open-source autonomous web automation platform that combines a code editor, browser automation, and terminal in a unified agent-native environment. The core innovation is **"YOLO Mode"** - a trust-based permission system that eliminates approval prompts for AI agent operations.

## What is YOLO-Browser?

YOLO-Browser is the first truly **agent-native development environment** where AI can code, browse, and automate without friction from approval prompts. It combines the power of Monaco Editor, Chromium browser automation, and intelligent terminal operations in a single Electron application.

### **Current Status: Monaco Editor Integration Complete ✅**

- **✅ Platform-Adaptive Monaco Integration**: 28+ programming languages with CSP-compliant local loading
- **✅ Direct Worker Management**: No CDN dependencies, all resources bundled locally
- **✅ Future-Proof Architecture**: Ready for web, mobile, and other deployment targets
- **🔄 In Progress**: Browser automation engine, terminal integration, AI provider architecture

### **Core Mission:**

> "Enable AI agents to operate with full autonomy while maintaining user trust through transparent, granular permission systems."

## Market Position

### **vs. Perplexity Comet (Our Primary Competition)**

- ✅ **Same capabilities** - agentic web control, shopping automation, email management
- ✅ **Open source** vs. closed ($200/month)
- ✅ **Privacy-first** vs. data sent to Perplexity servers
- ✅ **Extensible** vs. limited customization

### **vs. Block Goose (Complementary, Not Competitive)**

- **Goose:** Local development automation (coding, testing, CLI)
- **AgentOS:** Internet automation (web browsing, online tasks)
- **Together:** Complete AI automation ecosystem

## Value Proposition to Block/Goose Ecosystem

### What We Bring:

1. **Web Automation Gap** - Goose handles local development; we handle internet tasks
2. **Broader Audience** - Extend beyond developers to general web users
3. **Privacy Alternative** - Open-source competitor to closed agentic browsers
4. **Shared Technology** - Compatible with MCP servers, similar AI patterns
5. **Natural Evolution** - From local automation → Internet automation

### Integration Opportunities:

- **Shared MCP Ecosystem** - Common servers for both platforms
- **Cross-Platform Workflows** - Web tasks trigger local development workflows
- **Unified Experience** - Goose for dev, AgentOS for web

## Technical Architecture

```
┌─────────────────────────────────────────┐
│         YOLO-Browser Platform           │
│      (Electron Multi-Process)          │
├─────────────────────────────────────────┤
│  Main Process │ Renderer Process        │
│  System APIs  │ ┌─────────────────────┐ │
│  Native Auto  │ │   Monaco Editor     │ │
│  IPC Gateway  │ │   (28+ Languages)   │ │
│               │ ├─────────────────────┤ │
│               │ │   Browser Engine    │ │
│               │ │   (Native Chrome)   │ │
│               │ ├─────────────────────┤ │
│               │ │   Terminal (xterm)  │ │
│               │ │   (System Commands) │ │
│               │ └─────────────────────┘ │
├─────────────────────────────────────────┤
│         AI Provider Architecture        │
│   (OpenAI, Anthropic, Ollama, Local)   │
├─────────────────────────────────────────┤
│           YOLO Mode System             │
│    (Trust-based, granular permissions) │
└─────────────────────────────────────────┘
```

### Implementation Status:

#### ✅ **Completed Components:**
- **Monaco Editor**: Platform-adaptive integration with 28+ languages
- **Build System**: Webpack multi-target (main/renderer/preload)
- **Project Structure**: Organized Electron app with TypeScript
- **Documentation**: Architecture guides and quick-start documentation

#### 🔄 **In Progress:**
- **Browser Automation**: Native Chromium webContents API integration
- **Terminal Integration**: xterm.js + node-pty for system commands
- **AI Provider Setup**: Multi-LLM backend architecture

#### 📋 **Planned:**
- **YOLO Mode**: Trust-based permission system
- **Context Sharing**: Real-time state sync between components
- **System Integration**: Native OS automation capabilities

## Tech Stack

### **Core Platform:**
- **Runtime:** Electron (multi-process architecture)
- **Editor:** Monaco Editor (direct integration, 28+ languages)
- **Browser:** Native Chromium webContents API
- **Terminal:** xterm.js + node-pty
- **Frontend:** React + TypeScript
- **Build System:** Webpack (multi-target: main/renderer/preload)

### **Monaco Editor Integration:**
- **Platform Detection:** Automatic environment detection (Electron/Web/Mobile)
- **Loading Strategy:** Bundled workers with CDN fallback (web deployments)
- **Security:** CSP-compliant, no external dependencies
- **Performance:** <2s initialization, local worker files
- **Languages:** TypeScript, JavaScript, Python, Go, Rust, and 23+ more
- **Documentation:** `docs/Monaco-Integration-Architecture.md`

### **Future AI Integration:**
- **AI Providers:** OpenAI, Anthropic, Ollama, local models
- **Context Injection:** Real-time editor/browser/terminal state
- **Permission System:** Granular, cryptographically-verified trust boundaries

## Development Roadmap

### **Phase 1: Foundation Platform (Current - Q4 2025)**
- ✅ **Monaco Editor Integration** - Complete with platform abstraction
- 🔄 **Browser Automation Engine** - Native webContents API integration
- 🔄 **Terminal Integration** - xterm.js + system command execution
- 📋 **AI Provider Architecture** - Multi-LLM backend setup

### **Phase 2: YOLO Mode & Intelligence (Q1 2026)**
- 📋 **Trust-Based Permissions** - Granular automation approval system
- 📋 **Context Sharing** - Real-time state sync between components
- 📋 **AI Agent Integration** - Natural language to automation commands
- 📋 **Cross-Platform Testing** - Web and mobile deployment validation

### **Phase 3: Advanced Automation (Q2+ 2026)**
- 📋 **System Integration** - Native OS automation capabilities
- 📋 **Workflow Engine** - Complex multi-step automation sequences
- 📋 **MCP Server Ecosystem** - Integration with Block Goose tools
- 📋 **Performance Optimization** - Sub-100ms context synchronization

### **Current Development Focus:**

**✅ Monaco Editor (Complete)**
- Platform-adaptive loading strategies
- 28+ programming language support
- CSP-compliant security implementation
- Future-proof architecture for all deployment targets

**🎯 Next Priority: Browser Automation**
- Native Chromium webContents API integration
- Direct DOM manipulation without external tools
- Cross-tab context persistence

## Block Goose Grant Opportunity

We're applying for Block's Goose Grant Program ($100k, 12 months) to build AgentOS as a complementary project that:

- **Extends Goose ecosystem** into web automation
- **Creates open-source alternative** to closed agentic browsers
- **Demonstrates novel interaction paradigms** for AI agents
- **Builds privacy-first architecture** for agentic web control

**Grant Focus Areas:**

1. Novel interaction paradigm (natural language → web actions)
2. Ecosystem expansion (web automation for Goose community)
3. Privacy innovation (open alternative to closed systems)
4. Cross-platform integration (Goose ↔ AgentOS workflows)

## Getting Started

### **Prerequisites:**
- Node.js 18+
- npm or yarn
- Git

### **Installation:**

```bash
# Clone repository
git clone https://github.com/RiaanDeWinnaar/codenameAgentOS.git
cd codenameAgentOS

# Install dependencies
npm install

# Build all targets
npm run build

# Start development environment
npm run dev
```

### **Development Commands:**

```bash
# Build individual targets
npm run build:main      # Main process
npm run build:renderer  # Renderer UI  
npm run build:preload   # Preload script

# Start application
npm start               # Production mode
npm run dev            # Development with hot reload

# Testing
npm test               # Run test suite (when available)
npm run test:monaco    # Monaco editor integration tests
```

### **Current Features:**

1. **Monaco Editor**: Professional code editor with 28+ languages
2. **Platform Detection**: Automatic environment configuration
3. **Security**: CSP-compliant with local resource loading
4. **Performance**: Sub-2-second initialization time

### **Architecture Documentation:**

- `docs/Monaco-Integration-Architecture.md` - Complete Monaco architecture
- `docs/Monaco-Quick-Start.md` - Developer quick reference
- `.github/copilot-instructions.md` - Development guidelines
- `docs/PRD.md` - Product requirements (when available)

## Contributing

We welcome contributions from developers, security researchers, and AI enthusiasts:

### **Current Contribution Areas:**

1. **Browser Automation Engine** - Native webContents API integration
2. **Terminal Integration** - xterm.js + node-pty implementation  
3. **AI Provider Architecture** - Multi-LLM backend development
4. **Testing Infrastructure** - Automated testing for Monaco and core features
5. **Documentation** - Architecture guides and user documentation

### **Monaco Editor Contributions:**

The Monaco integration is complete but can be enhanced:
- **Language Support**: Additional programming language configurations
- **Theme Development**: Custom themes for different use cases
- **Performance Optimization**: Bundle size reduction for mobile targets
- **Testing**: Automated test coverage for platform detection

### **Development Setup:**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Follow TypeScript and React best practices
4. Test across multiple platforms when possible
5. Update documentation for architectural changes
6. Submit pull request with clear description

### **Code Style:**

- **TypeScript**: Strict type checking enabled
- **React**: Functional components with hooks
- **Testing**: Playwright for E2E, Jest for unit tests
- **Documentation**: Inline comments for complex logic

## Project Status & Traceability

### **Completed Work:**

**Monaco Editor Integration (September 2025)**
- ✅ Platform-adaptive architecture (`PlatformAdapter.ts`)
- ✅ Service layer with fallback strategies (`MonacoService.ts`)
- ✅ Direct Monaco integration (no React wrapper dependency)
- ✅ CSP-compliant security implementation
- ✅ 28+ programming language support
- ✅ Local worker file management
- ✅ Future-proof design for web/mobile deployment

**Build System & Project Structure**
- ✅ Webpack multi-target configuration
- ✅ TypeScript setup for main/renderer/preload processes
- ✅ Electron application foundation
- ✅ Development and production build processes

### **Technical Debt & Risk Management:**

**Monaco Integration Assessment:**
- **Risk**: Platform-specific optimization could hinder future deployments
- **Mitigation**: Abstraction layer implemented for web/mobile compatibility
- **Monitoring**: Quarterly review scheduled for multi-platform readiness
- **Documentation**: Architecture guides created for team knowledge transfer

### **Next Development Targets:**

1. **Browser Automation Engine** (Q4 2025)
2. **Terminal Integration** (Q4 2025)  
3. **AI Provider Architecture** (Q1 2026)
4. **YOLO Mode Permission System** (Q1 2026)

### **Repository Structure:**

```
├── src/renderer/components/monaco/    # Monaco platform abstraction
├── docs/                             # Architecture documentation  
├── tests/                            # E2E and integration tests
├── webpack.*.config.js               # Build configuration
├── CHANGELOG.md                      # Development progress tracking
└── .github/copilot-instructions.md   # Development guidelines
```

**For detailed development history, see [CHANGELOG.md](CHANGELOG.md)**

## Partnership & Grant Opportunities

AgentOS is exploring partnerships with organizations invested in open-source AI tooling. If you represent:

- Open-source foundations interested in AI infrastructure
- Companies building developer tooling ecosystems
- Research institutions working on AI-native computing

Please reach out to discuss collaboration opportunities.

## License

MIT
