---
description: Guidelines for Qwen AI assistant to maintain code quality and project consistency in the AgentOS (YOLO-Browser) project
globs: '**/*'
alwaysApply: true
---

# Qwen AI Assistant Rules for AgentOS (YOLO-Browser)

As Qwen, your role is to assist in developing the AgentOS (YOLO-Browser) project while maintaining high code quality standards and following the established project conventions.

## Project Context Awareness

- **Project Type**: Electron-based agentic browser platform with React frontend and TypeScript
- **Core Technologies**: Electron, React 18, TypeScript, Monaco Editor, Webpack
- **Security Focus**: Context isolation, sandboxing, secure IPC communication
- **Architecture**: Main process, preload script, renderer process with React components

## Code Quality Standards

### TypeScript/JavaScript Development

- **Strict Typing**: Always use TypeScript with strict mode enabled
- **Modern Syntax**: Use ES2020+ features where appropriate
- **React Patterns**: Follow React 18 best practices with hooks
- **Error Handling**: Implement proper error boundaries and validation

### Security Practices

- **Electron Security**:
  - Maintain context isolation
  - Keep nodeIntegration disabled in renderer
  - Use sandbox for renderer process
  - Validate all IPC communications
- **Input Validation**: Sanitize all data passed between processes
- **Dependency Management**: Regularly audit dependencies for vulnerabilities

### Monaco Editor Integration

- **Language Support**: Ensure proper language auto-detection based on file extensions
- **Configuration**: Follow existing patterns in `MonacoEditor.tsx` for language configurations
- **Performance**: Implement proper disposal and cleanup of editor instances

## Development Workflow

### File Structure

- **Main Process**: `src/main/main.ts`
- **Preload Script**: `src/preload/preload.ts`
- **Renderer**: `src/renderer/` with React components
- **Components**: Place new React components in `src/renderer/components/`

### Build Process

- **Development**: Use `npm run dev` for development server
- **Building**: Use `npm run build` for production builds
- **Quality Checks**: Run `npm run quality` to check types, linting, and formatting

### Code Organization

- **Component Structure**: Create modular, reusable React components
- **State Management**: Use React hooks for local state management
- **Communication**: Use secure IPC via preload script for main/renderer communication

## Implementation Guidelines

### When Creating New Features

1. **Analyze Requirements**: Understand the feature in context of the agentic browser platform
2. **Follow Security Patterns**: Implement features with Electron security best practices
3. **Maintain Consistency**: Follow existing code patterns and architecture
4. **Test Integration**: Ensure new features work with existing Monaco Editor integration

### When Modifying Existing Code

1. **Preserve Security**: Never compromise Electron security settings
2. **Maintain Compatibility**: Ensure changes don't break existing functionality
3. **Update Documentation**: Keep comments and documentation current
4. **Follow Conventions**: Adhere to existing coding patterns and styles

### Code Review Standards

- **Security First**: Flag any security anti-patterns
- **Performance**: Identify potential performance bottlenecks
- **Maintainability**: Ensure code is readable and well-structured
- **Best Practices**: Follow React, TypeScript, and Electron best practices

## Communication Guidelines

### With User

- **Be Concise**: Provide clear, focused responses
- **Explain Context**: Help user understand how changes fit into the larger project
- **Suggest Improvements**: Proactively identify better approaches
- **Ask Questions**: Clarify requirements when ambiguous

### Technical Explanations

- **Use Project Terminology**: Reference "AgentOS", "YOLO-Browser", "Monaco Editor" correctly
- **Link to Code**: Reference specific files when discussing implementation details
- **Provide Examples**: Show code snippets that follow project patterns
- **Explain "Why"**: Justify recommendations with technical reasoning

## Common Patterns to Follow

### Electron IPC Pattern

```typescript
// ✅ DO: Follow secure IPC pattern from preload.ts
const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  logSecurityEvent: (action: string, details: unknown) => {
    // Validate inputs
    if (typeof action !== 'string') {
      console.error('Security audit: Invalid action type');
      return;
    }
    // Sanitize details
    try {
      const sanitizedDetails = JSON.parse(JSON.stringify(details));
      ipcRenderer.send('security:audit', action, sanitizedDetails);
    } catch (error) {
      console.error('Security audit: Failed to sanitize details', error);
    }
  },
};
```

### Monaco Editor Configuration

```typescript
// ✅ DO: Follow language configuration pattern from MonacoEditor.tsx
const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    tabSize: 2,
    formatOnType: true,
    formatOnPaste: true,
  },
  // ... other languages
};
```

### React Component Structure

```tsx
// ✅ DO: Follow React component pattern from App.tsx
const MyComponent: React.FC<Props> = ({ title, onAction }) => {
  const [count, setCount] = useState(0);

  return (
    <div className='component'>
      <h2>{title}</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
};
```

## Anti-Patterns to Avoid

### Security Anti-Patterns

```typescript
// ❌ DON'T: Disable Electron security features
webPreferences: {
  contextIsolation: false, // Never disable
  nodeIntegration: true,    // Never enable in renderer
  sandbox: false            // Never disable
}

// ❌ DON'T: Allow unrestricted navigation
contents.setWindowOpenHandler(() => {
  return { action: 'allow' }; // Always validate URLs
});
```

### Monaco Editor Anti-Patterns

```typescript
// ❌ DON'T: Hardcode language configurations
// Instead, use the SUPPORTED_LANGUAGES configuration pattern

// ❌ DON'T: Skip proper disposal of editor instances
// Always implement cleanup in useEffect hooks
```

### React Anti-Patterns

```tsx
// ❌ DON'T: Use legacy React APIs
ReactDOM.render(<App />, container); // Use createRoot instead

// ❌ DON'T: Skip proper TypeScript typing
const MyComponent = ({ title }) => { // Always define prop types
```
