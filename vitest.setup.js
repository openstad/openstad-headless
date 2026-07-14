// Shared Vitest setup, run before each test file in the projects that
// reference it via `setupFiles`. It only quietens cosmetic third-party noise in
// the test output — no application behaviour is changed.

// 1. Silence third-party Node deprecation warnings (notably DEP0169 `url.parse()`
//    emitted at load time by bcrypt → @mapbox/node-pre-gyp).
process.noDeprecation = true;

// 2. node-config (v3) unconditionally console.error()s a warning at load time
//    when NODE_ENV (which Vitest sets to 'test') has no matching deployment
//    config file. There is no env flag to suppress it and the `config/test.*`
//    files are intentionally gitignored, so we filter out just those two exact
//    lines. Every other console.error passes through unchanged.
const originalConsoleError = console.error.bind(console);
console.error = (...args) => {
  const first = args[0];
  if (
    typeof first === 'string' &&
    (first.includes('did not match any deployment config file names') ||
      first.includes('node-config/node-config/wiki/Strict-Mode'))
  ) {
    return;
  }
  return originalConsoleError(...args);
};
