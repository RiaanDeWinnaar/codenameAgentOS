# Monaco Integration Quick Start

## For New Developers

### Basic Usage

```typescript
import { MonacoEditor } from '@components/MonacoEditor';

// Simple usage - platform detection automatic
<MonacoEditor 
  language="typescript"
  value={code}
  onChange={setCode}
/>
```

### Advanced Usage

```typescript
import { MonacoEditorService } from '@components/monaco/MonacoService';

// Manual initialization with custom config
const service = MonacoEditorService.getInstance();
await service.initialize({
  platform: 'web', // Force specific platform
  fallbackStrategy: 'cdn',
  enableTelemetry: true
});

const editor = service.createEditor(container, options);
```

## Environment Configuration

### Development (.env)
```bash
# Use bundled strategy (default for Electron)
MONACO_STRATEGY=bundled

# Enable debug logging
MONACO_DEBUG=true
```

### Production Web (.env.production)
```bash
# Use hybrid strategy for web
MONACO_STRATEGY=hybrid
MONACO_BASE_URL=https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs
MONACO_MAX_BUNDLE_SIZE=5
```

### Production Mobile (.env.mobile)
```bash
# Minimal strategy for mobile
MONACO_STRATEGY=bundled
MONACO_MAX_BUNDLE_SIZE=2
```

## Troubleshooting

### Common Issues

1. **Global is not defined**
   - Fixed by `global-polyfill.js` + webpack ProvidePlugin
   - Should not occur with current setup

2. **Worker loading fails**
   - Check CSP policy allows workers
   - Verify worker files in dist/renderer/
   - Service automatically falls back to CDN

3. **Bundle too large**
   - Reduce language set in PlatformAdapter
   - Use 'minimal' fallback strategy
   - Check MONACO_MAX_BUNDLE_SIZE setting

### Debug Commands

```bash
# Check current platform detection
npm run dev
# See console: "Platform: electron | Strategy: bundled"

# Validate worker files
ls dist/renderer/*.worker.js

# Test CDN fallback
MONACO_STRATEGY=cdn npm run dev
```

## Testing

### Unit Tests (Future)
```typescript
describe('MonacoService', () => {
  it('detects Electron platform', () => {
    expect(detectPlatform()).toBe('electron');
  });
  
  it('falls back to CDN on bundled failure', async () => {
    // Mock bundled worker failure
    // Verify CDN strategy used
  });
});
```

### Manual Testing Checklist

- [ ] Editor loads successfully
- [ ] Language switching works
- [ ] Theme switching works
- [ ] TypeScript intellisense active
- [ ] No console errors
- [ ] Worker files loaded locally
- [ ] Performance acceptable (<2s init)

## When to Update This Integration

### Required Updates
- Monaco major version releases
- New deployment targets (web, mobile)
- Security policy changes
- Performance issues

### Optional Updates
- New language support requests
- Theme customization needs
- Feature toggle requirements

### Update Process
1. Test in development environment
2. Update platform configurations if needed
3. Test fallback strategies
4. Update documentation
5. Deploy incrementally (Electron → Web → Mobile)

## Emergency Procedures

### Monaco Fails to Load
1. Check browser console for specific errors
2. Verify network access to CDN (web deployments)
3. Check CSP policy compliance
4. Force fallback: `MONACO_STRATEGY=minimal`

### Performance Issues
1. Check bundle size: `MONACO_MAX_BUNDLE_SIZE=2`
2. Reduce languages: Edit PlatformAdapter.ts
3. Disable features: Set `features: ['core']`
4. Monitor telemetry for regression points

### Rollback Strategy
1. Revert to previous Monaco version
2. Disable problematic features in config
3. Force CDN strategy: `MONACO_STRATEGY=cdn`
4. Use minimal editor: `MONACO_STRATEGY=minimal`
