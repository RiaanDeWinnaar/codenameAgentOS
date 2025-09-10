---
title: Research Session
query: "How to fix Electron app that always loads localhost:3000 even when NODE_ENV is not development, need to force production mode to load built files"
date: 08/09/2025
time: 12:01:18 pm
timestamp: 2025-09-08T10:01:18.379Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** How to fix Electron app that always loads localhost:3000 even when NODE_ENV is not development, need to force production mode to load built files

**Response:**

Your Electron app always loading **localhost:3000**—even when `NODE_ENV` is not `"development"`—is a common issue in Electron + React setups. This usually happens due to how environment variables are set and consumed at runtime, and how the main process determines whether to load the dev server or the built files.

## Core Issue

In your `src/main/main.ts`, the following logic is used to determine which URL to load:

```typescript
const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
  this.mainWindow.loadURL('http://localhost:3000');
  // ...
} else {
  this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  // ...
}
```

If your app **always loads localhost:3000**, it means `process.env.NODE_ENV` is always set to `"development"` at runtime—even after building for production.

---

## Why This Happens

- **Electron's main process** does not always inherit the correct `NODE_ENV` value, especially when packaged or started via different scripts.
- **Build tools** (like electron-forge, electron-builder, or custom scripts) may not set `NODE_ENV` to `"production"` for the main process, even if your React/Webpack build does.
- **Hardcoded or default values** in your scripts or environment may override your intended setting[2].

---

## Best Practices for Reliable Production Detection

### 1. Use `app.isPackaged` Instead of `NODE_ENV`

Electron provides a robust way to detect production mode: `app.isPackaged`. This property is `true` when your app is running from an asar package or a packaged directory, and `false` in development[5].

**Recommended change:**

```typescript
import { app } from 'electron';

const isDev = !app.isPackaged;
if (isDev) {
  this.mainWindow.loadURL('http://localhost:3000');
} else {
  this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}
```

- This approach is more reliable than checking `NODE_ENV` in Electron apps[5].

### 2. Use `electron-is-dev` for Flexibility

The [`electron-is-dev`](https://www.npmjs.com/package/electron-is-dev) package is a popular solution that wraps this logic and allows you to override with the `ELECTRON_IS_DEV` environment variable if needed[5].

**Usage:**

```typescript
import isDev from 'electron-is-dev';

if (isDev) {
  this.mainWindow.loadURL('http://localhost:3000');
} else {
  this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}
```

- You can force dev mode by setting `ELECTRON_IS_DEV=1` or force production with `ELECTRON_IS_DEV=0`[5].

### 3. Ensure Build Scripts Set the Correct Environment

- When running your packaged app (e.g., via `npm run make` or `npm run build`), ensure your scripts do **not** set `NODE_ENV=development`.
- For production, your build/start scripts should set `NODE_ENV=production` if you rely on it elsewhere, but for Electron's main process, prefer `app.isPackaged` or `electron-is-dev`[2].

---

## Actionable Steps for Your Project

1. **Replace** all `process.env.NODE_ENV === 'development'` checks in your Electron main process with `!app.isPackaged` or `electron-is-dev`.
2. **Verify** your build and packaging scripts (e.g., electron-forge, electron-builder) do not override `NODE_ENV` to `"development"` in production.
3. **Test** by running both `npm start` (dev) and your packaged app (`npm run make` or equivalent). The dev server should load in development, and the built files should load in production.

---

## Example: Updated `createMainWindow` Logic

```typescript
import { app } from 'electron';
import isDev from 'electron-is-dev'; // Optional, for override flexibility

private createMainWindow(): void {
  // ...window config...
  if (isDev) {
    this.mainWindow.loadURL('http://localhost:3000');
    this.mainWindow.webContents.openDevTools();
  } else {
    this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    // Optionally open DevTools for debugging production
    // this.mainWindow.webContents.openDevTools();
  }
  // ...rest of logic...
}
```

---

## Additional Notes

- If you need to expose the dev/prod status to the renderer, use Electron's `contextBridge` in your preload script to safely expose this value[5].
- For production builds, ensure your React app is built (`npm run build` in the renderer directory) and the output is correctly copied to the expected location.

---

**Summary:**  
Switch your environment check from `process.env.NODE_ENV` to `app.isPackaged` or use `electron-is-dev` for robust, production-safe detection. This will ensure your Electron app loads the correct files in both development and production modes[5].


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-09-08T10:01:18.379Z*
