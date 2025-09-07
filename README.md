# AgentOS

An open-source, cross-platform AI operating environment that extends beyond code automation to full system control.

## What is AgentOS?

AgentOS builds upon the foundation laid by projects like [Block's Goose](https://github.com/block/goose) to create a comprehensive AI-native computing platform. While Goose excels at development workflows, AgentOS expands the scope to include:

- **Full system automation** (web + desktop + local files)
- **Cross-platform GUI application** (not just CLI)
- **Multi-LLM backend** (Qwen, Claude, Ollama, local models)
- **Privacy-first architecture** (local-first with optional cloud)

## Vision: From Agent App to AI-Native OS

**Phase 1:** Cross-platform desktop app (like Goose, but with GUI + system access)
**Phase 2:** System-level runtime (background service, plugin architecture)  
**Phase 3:** AI-native kernel (research phase - semantic filesystem, natural language system calls)

## Relationship to Block's Ecosystem

AgentOS is designed to complement and extend Block's open-source AI tooling:

- **Goose Integration:** AgentOS can run Goose agents within its environment
- **MCP Compatibility:** Full support for Model Context Protocol servers
- **Shared Philosophy:** Open-source, extensible, developer-focused
- **Enhanced Scope:** Adds GUI, system control, and cross-platform desktop deployment

## Core Features

## Core Features

### Phase 1 (Desktop App - 2025)
- **Web Automation:** Browser control via extension + local server (like Goose, but GUI-based)
- **System Integration:** Filesystem access, shell execution, hardware monitoring
- **Multi-LLM Support:** Qwen, Claude, GPT, Ollama, local models
- **Cross-Platform GUI:** React + Tauri/Electron for Windows, macOS, Linux
- **Privacy Controls:** Local-first with granular permissions and audit logging

### Goose Integration
- Run existing Goose workflows within AgentOS environment
- GUI wrapper for Goose CLI operations
- Enhanced Goose recipes with system-level permissions
- MCP server compatibility

## Tech Stack
- **Frontend:** React + Vite + TypeScript
- **Backend:** Tauri (Rust) for performance and security
- **Automation:** Browser MCP extension + system APIs
- **AI Integration:** OpenAI-compatible APIs, Ollama, local inference
- **Security:** Sandboxed execution, permission prompts, audit trails

## Why AgentOS + Block Ecosystem?

This project aims to extend Block's open-source AI vision:

1. **Complementary Scope:** Goose handles development workflows → AgentOS handles full system automation
2. **Shared Values:** Open-source, extensible, privacy-focused
3. **Technical Synergy:** MCP compatibility, shared AI tooling patterns
4. **Market Expansion:** Goose targets developers → AgentOS targets power users and enterprises

## Development Roadmap

**Q1 2025:** MVP desktop app with basic web + file automation
**Q2 2025:** Goose integration, plugin architecture, security hardening
**Q3 2025:** Cross-platform deployment, community feedback integration
**Q4 2025:** System-level runtime capabilities (Phase 2 preparation)

## Getting Started

```bash
# Clone repository
git clone https://github.com/yourusername/AgentOS.git
cd AgentOS

# Install dependencies (when available)
npm install

# Run development version
npm run dev
```

## Contributing

We welcome contributions from the Block/Goose community and beyond:

- **Developers:** Core application features, MCP integrations
- **Security Researchers:** Permission system, sandboxing improvements  
- **UX Designers:** Cross-platform GUI consistency
- **AI Researchers:** Multi-model orchestration, local inference optimization

## Grant/Partnership Opportunities

AgentOS is exploring partnerships with organizations invested in open-source AI tooling. If you represent:

- Open-source foundations interested in AI infrastructure
- Companies building developer tooling ecosystems
- Research institutions working on AI-native computing

Please reach out to discuss collaboration opportunities.

## License
MIT
