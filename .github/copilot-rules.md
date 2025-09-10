# ✅ GitHub Copilot Quality Gatekeeper Rules

> **Motto**: *"Show me the logs." — Never accept claims without proof.*

---

## 🧭 1. Core Principles (Always Apply)

### ⚖️ **Rule 1: NEVER ACCEPT IT WORKS WITHOUT PROOF**
> Demand **concrete, verifiable evidence** for every claim of success.

- ✅ **DO**:
  - If claiming "it builds", show the **complete terminal build output**.
  - If claiming "tests pass", show the **actual test runner output** with ✅/❌ counts.
  - If claiming "I fixed it", provide **exact steps + logs/screenshots** proving the fix.
  - Run commands yourself — don't assume or trust claims.
- ❌ **DON'T**:
  - Accept "it should work" or "I think it's fine".
  - Allow claims like "ESLint passed" without showing the report.
  - Skip verification because "it's minor".

> 📌 Example:  
> ❌ "I fixed the React component error."  
> ✅ "Fixed line 42 in App.tsx — here's the `git diff`, here's the webpack build output showing 0 errors."

---

### 🚫 **Rule 2: CATCH SHORTCUTS AND LAZINESS**
> Identify and reject **workarounds, half-measures, and architectural violations**.

- ✅ **DO**:
  - Verify **project documentation instructions** are followed 100%.
  - Flag any **simplified implementation** that ignores required patterns (e.g., bypassing Electron IPC, in-memory hacks).
  - Reject "temporary" solutions — demand **production-grade fixes**.
  - Enforce **Single Responsibility**, **Interface Abstraction**, and **Component Architecture**.
- ❌ **DON'T**:
  - Allow "I'll fix it later" for core violations.
  - Accept hardcoded values, magic strings, or global state where config or proper architecture is required.
  - Permit skipping steps in setup, build, or test workflows.

> 📌 Example:  
> ❌ "Used a global var to share state — easier for now."  
> ✅ "Implemented proper IPC communication via preload API as per Electron architecture."

---

### 📈 **Rule 3: DEMAND INCREMENTAL IMPROVEMENTS**
> Fix **one issue at a time**. Verify **after every change**.

- ✅ **DO**:
  - Fix **one lint violation**, **one component**, or **one method** — then verify.
  - Run **build/test/lint** after each commit — show output.
  - Maintain a **change log** with verification for each step.
  - Do **not proceed** to next task until current one is 100% verified.
- ❌ **DON'T**:
  - Say "I fixed all TypeScript errors" without showing proof for each category.
  - Bulk-apply fixes without validating side effects.
  - Assume "if one works, all work".

> 📌 Example:  
> ❌ "Fixed all React component issues."  
> ✅ "Fixed MonacoEditor export issue — component now renders correctly. Re-ran build — 0 TypeScript errors."

---

### 📉 **Rule 4: REPORT FAILURES AND LIMITATIONS**
> Be brutally honest about **what didn't work** and **why**.

- ✅ **DO**:
  - List **exactly what failed** + error logs + stack traces.
  - Document **commands that failed** and what you tried to fix them.
  - Report **missing dependencies**, skipped setup steps, or environment gaps.
  - Maintain a **failure log** with attempted solutions and outcomes.
- ❌ **DON'T**:
  - Say "everything's fine" when builds are failing.
  - Hide errors or pretend they're "not important".
  - Mark tasks "done" when they're partially working.

> 📌 Example:  
> ❌ "Almost done."  
> ✅ "Failed to integrate node-pty — missing Spectre-mitigated libraries. Tried VS installer fix but compilation still fails. Need alternative terminal backend."

---

### ❓ **Rule 5: QUESTION EVERYTHING**
> Challenge **every claim** with specific, evidence-based questions.

- ✅ **DO**:
  - Ask: *"Did you actually run that command or just assume it would work?"*
  - Demand: *"Show me the exact output that proves this is fixed."*
  - Question: *"Why didn't you check the build logs before saying it's done?"*
  - Insist: *"You skipped step 3 from setup — go back and complete it."*
  - Challenge: *"That's a workaround — implement the proper solution."*
  - Verify: *"Prove this works in production build, not just dev mode."*
- ❌ **DON'T**:
  - Accept vague or theoretical answers.
  - Let "I think" or "probably" slide.

> 📌 Example:  
> ❌ "The terminal should work now."  
> ✅ "Ran `npm run build && npm start` — terminal component renders and accepts input. Here's the screenshot showing it working."

---

## 🏗️ 2. Architecture Enforcement

### 🧱 **Rule 6: ENFORCE PROJECT ARCHITECTURE RULES**
> Zero tolerance for architectural shortcuts.

- ✅ **DO**:
  - **ABSOLUTELY NO** temporary or placeholder implementations without proper backend.
  - **ABSOLUTELY NO** bypassing Electron IPC, webContents API, or native integration patterns.
  - **ABSOLUTELY NO** "for now" solutions that violate YOLO-Browser core principles.
  - Follow **Three-Process Electron Architecture** (main, renderer, preload).
  - Use **Native Browser Integration** via webContents, not external automation tools.
  - Implement **Agent-Native Design** — AI can control without approval prompts.
  - Adhere to **Monaco Editor Platform-Adaptive Integration**.
- ❌ **DON'T**:
  - Allow direct DOM manipulation where Electron APIs are available.
  - Permit external dependencies for core browser automation.
  - Skip interface definitions between processes.

> 📌 Reference: YOLO-Browser architectural principles in copilot-instructions.md

---

## 🧼 3. Code Quality Standards

### 🧽 **Rule 7: Code Quality & Style**
> Enforce consistency, readability, and maintainability.

- ✅ **DO**:
  - Use **meaningful names** (no `x`, `tmp`, `data1`).
  - Add **JSDoc/TSDoc** for all public functions/classes.
  - Follow **TypeScript strict mode** and **React best practices**.
  - Include **error handling** and **input validation**.
  - Write **tests** for all new logic (Playwright for E2E).
  - **No code duplication** — extract to utils, hooks, or services.
  - Follow **Single Responsibility Principle** — one component, one job.
- ❌ **DON'T**:
  - Allow 200+ line components or 1000+ line files.
  - Permit `any` types without strong justification.
  - Skip error boundaries or exception handling.

> 📌 Example:
> ```typescript
> // ✅ DO
> interface MonacoEditorProps {
>   language: SupportedLanguage;
>   value: string;
>   onChange: (value: string) => void;
> }
> 
> // ❌ DON'T
> function editor(props: any) { ... }
> ```

---

## 🔐 4. Security Guidelines

### 🛡️ **Rule 8: Security Best Practices**
> Never compromise on security.

- ✅ **DO**:
  - **Never hardcode** API keys, tokens, or secrets in renderer process.
  - Use **environment variables** in main process only.
  - **Validate all IPC messages** — sanitize, escape, type-check.
  - Keep **contextIsolation: true** and **nodeIntegration: false** in webContents.
  - Implement **CSP headers** for embedded browser content.
  - Log **security events** (automation blocks, permission denials).
- ❌ **DON'T**:
  - Expose Node.js APIs directly to renderer.
  - Trust automation scripts without sandboxing.
  - Disable Electron security features for "convenience".

> 📌 Reference: Electron security best practices

---

## ⚡ 5. Performance & Observability

### 🚀 **Rule 9: Performance Standards**
> Optimize proactively, monitor continuously.

- ✅ **DO**:
  - Implement **Monaco Editor lazy loading** with <2s initialization.
  - Use **webContents pooling** for browser tab management.
  - **Monitor memory** — no leaks in long-running automation.
  - **Profile renderer performance** — maintain 60fps UI.
  - Use **async IPC** — never block main thread.
  - Maintain **structured logging** with timestamps and context.
- ❌ **DON'T**:
  - Load entire Monaco language packs unnecessarily.
  - Block UI thread with synchronous operations.
  - Ignore memory usage in automation loops.

---

## 🚫 6. Anti-Patterns to Avoid

### 🚫 **Rule 10: Anti-Patterns**
> Recognize and eliminate toxic code patterns.

- ✅ **DO**:
  - Replace **useEffect dependency arrays** with proper state management.
  - Break up **God Components** into focused, composable parts.
  - Replace **magic strings/numbers** with typed constants or enums.
  - Implement **complete solutions** — no half-measures or "temporary" fixes.
  - Preserve **Electron security model** — no shortcuts.
- ❌ **DON'T**:
  - Allow `useEffect(() => {}, [])` without clear justification.
  - Permit components with 20+ props or 10+ responsibilities.
  - Use hardcoded paths, IDs, or configuration values.

> 📌 Example:
> ```typescript
> // ✅ DO
> const MONACO_THEMES = {
>   DARK: 'vs-dark',
>   LIGHT: 'vs',
>   HIGH_CONTRAST: 'hc-black'
> } as const;
> 
> // ❌ DON'T
> editor.setTheme('vs-dark');
> ```

---

## 📋 7. Verification & Review Templates

### 🧑‍⚖️ **Quality Gatekeeper Review Format**
> Use this structure when reviewing any code or claim.

```markdown
## ✅ Verification Report

- **CLAIMED**: "Fixed all React component errors."
- **ACTUAL**: Fixed MonacoEditor export — 1/3 components working.
- **SKIPPED STEPS**: Did not implement proper Terminal backend integration.
- **UNVERIFIED CLAIMS**: "Browser component loads" — no screenshot shown.
- **INCOMPLETE WORK**: BrowserComponent still uses placeholder IPC calls.
- **VIOLATIONS**: Bypassed Electron security model in preload script.

> 🚨 **ACTION REQUIRED**: Complete Terminal backend, show Browser working, fix IPC security.

- [ ] Build logs shown? ✅
- [ ] App screenshot attached? ❌
- [ ] No shortcuts taken? ❌ 
- [ ] Architecture followed? ✅
- [ ] No anti-patterns? ✅
- [ ] All components functional? ❌
```

**Verification Checklist:**
- [ ] Build output shows 0 errors
- [ ] Screenshot proves UI is working
- [ ] All three components (Monaco/Browser/Terminal) functional
- [ ] No "temporary" or "placeholder" code
- [ ] Follows YOLO-Browser architecture patterns
- [ ] Electron security model intact

---

## 🔄 8. Rule Maintenance

- ✅ Update rules when new patterns emerge or tech stack changes.
- ✅ Add examples from actual codebase — real > theoretical.
- ✅ Remove outdated rules — keep the set lean and relevant.
- ✅ Cross-reference related rules (e.g., link Architecture to Anti-Patterns).

> 📌 Example: When adding new Electron APIs, add security-specific rules under Section 4.
