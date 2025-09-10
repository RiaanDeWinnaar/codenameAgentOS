// Global polyfill for Monaco Editor and other modules that expect global
// This ensures compatibility with both browser and Node.js environments

// Set up global object
let globalObject;

if (typeof global !== 'undefined') {
  globalObject = global;
} else if (typeof globalThis !== 'undefined') {
  globalObject = globalThis;
} else if (typeof window !== 'undefined') {
  globalObject = window;
} else if (typeof self !== 'undefined') {
  globalObject = self;
} else {
  throw new Error('Unable to locate global object');
}

module.exports = globalObject;
