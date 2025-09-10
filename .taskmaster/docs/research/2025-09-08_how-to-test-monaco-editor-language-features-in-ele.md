---
title: Research Session
query: "How to test Monaco Editor language features in Electron app using automated tools like Playwright or other methods for AI agents to verify syntax highlighting and auto-completion work"
date: 08/09/2025
time: 10:29:11 am
timestamp: 2025-09-08T08:29:11.492Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** How to test Monaco Editor language features in Electron app using automated tools like Playwright or other methods for AI agents to verify syntax highlighting and auto-completion work

**Response:**

To **automate testing of Monaco Editor language features** (such as syntax highlighting and auto-completion) in an Electron app using tools like Playwright, you need to combine UI automation with programmatic inspection of Monaco’s DOM and internal APIs. This is especially relevant for your project’s Task 2 (Monaco Editor integration) and Task 16 (advanced features), where robust automated verification is essential for both core and AI-powered editor capabilities.

---

## 1. **Automated UI Testing with Playwright**

**Playwright** is well-suited for Electron apps and can interact with Monaco Editor as it would with any web-based component. Here’s how you can approach testing:

### **A. Syntax Highlighting Verification**

- **Challenge:** Syntax highlighting is rendered via styled DOM elements, not as plain text.
- **Approach:**
  - Use Playwright to type or paste code into the Monaco Editor.
  - Query the Monaco DOM for elements with specific CSS classes that represent syntax tokens (e.g., `.mtk1`, `.mtk2`, etc.).
  - Assert that expected tokens (keywords, strings, comments) have the correct classes/styles applied.

**Example Playwright snippet:**
```typescript
// TypeScript example
await page.fill('.monaco-editor textarea', 'const x = 42;');
// Wait for Monaco to tokenize
await page.waitForTimeout(200);
// Query for keyword styling
const keyword = await page.$('.mtk5'); // .mtk5 might be the class for 'const'
expect(await keyword.textContent()).toBe('const');
```
- *Note:* The actual class names (e.g., `.mtk5`) are theme/language dependent and may need to be mapped by inspecting Monaco’s DOM in your app.

### **B. Auto-completion Verification**

- **Challenge:** Auto-completion suggestions are rendered in a floating widget.
- **Approach:**
  - Use Playwright to focus the editor and type a trigger (e.g., `con` for `console`).
  - Simulate `Ctrl+Space` or wait for suggestions to appear.
  - Query the suggestion widget (usually `.monaco-list` or similar) and assert expected completions are present.

**Example:**
```typescript
await page.click('.monaco-editor textarea');
await page.keyboard.type('con');
await page.keyboard.press('Control+Space');
const suggestions = await page.$$eval('.monaco-list-row', rows => rows.map(r => r.textContent));
expect(suggestions).toContain('console');
```

---

## 2. **Programmatic Testing via Monaco APIs**

For deeper verification (e.g., ensuring the correct language service is active, or inspecting diagnostics), you can expose Monaco’s internal APIs to your test environment:

- **Expose Monaco instance:** Attach the Monaco editor instance to `window` in your app for test access.
- **Use Playwright’s `evaluate` API:** Run code in the renderer context to inspect Monaco’s state, such as:
  - Current language mode
  - Active markers (diagnostics)
  - Completion provider results

**Example:**
```typescript
const language = await page.evaluate(() => window.monaco.editor.getModels()[0].getLanguageId());
expect(language).toBe('typescript');
```

---

## 3. **Best Practices and Additional Methods**

- **Snapshot Testing:** Capture screenshots of the editor after typing code and compare against baseline images to catch regressions in highlighting (useful for visual verification).
- **Integration with Linting/Diagnostics:** If you use custom workers (e.g., ESLint), test that markers appear as expected by inspecting Monaco’s markers API[2].
- **Test Multiple Themes:** Switch between dark/light themes in tests and verify that syntax highlighting remains correct.

---

## 4. **Relevant Project Application**

- **Task 2:** Use these automated tests as part of your CI pipeline to ensure Monaco Editor’s core features (highlighting, completion, theme switching) work after each change.
- **Task 16:** Extend tests to cover AI-powered completions by simulating context changes and verifying that AI suggestions appear and are relevant.
- **Task 22:** For real-time collaboration, use Playwright to simulate multiple users editing and verify that syntax highlighting and completions sync correctly.

---

## 5. **References and Further Reading**

- Monaco Editor’s DOM structure and CSS classes can be inspected in your running Electron app for precise selector targeting[1][4].
- For offline/Electron-specific Monaco integration, ensure all Monaco assets are bundled locally to avoid worker loading issues[5].
- See Playwright’s [Electron testing documentation](https://playwright.dev/docs/api/class-electron) for details on launching and controlling Electron apps.

---

**Summary:**  
Automated testing of Monaco Editor language features in Electron with Playwright involves simulating user input, inspecting Monaco’s DOM for syntax highlighting, querying completion widgets, and optionally using Monaco’s APIs for deeper state verification. This approach ensures robust, repeatable validation of editor features critical to your project’s success.


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-09-08T08:29:11.492Z*
