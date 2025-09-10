// CommonJS shim to allow ESLint (invoked under CJS) to load flat ESM config.
// Delegates to eslint.config.mjs which exports the flat config array.
module.exports = require('./eslint.config.mjs').default;