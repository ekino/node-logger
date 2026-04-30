# BREAKING CHANGES

## Version 3.0

- Dual ESM and CommonJS: Added support for both module formats. No syntax changes needed from 2.x.
- Functional style: Refactored to use a fully functional API, removing internal objects. Update code that accessed internals directly.
- Node.js update: Dropped support for Node 14, 16 and 18. Now compatible with Node 20, 22, 24 and above.
- Removed `colors` dependency: Now uses a lightweight, custom color handler. No changes to color functionality.
- Enhanced JSON handling: Uses native JSON.stringify with circular reference handling for better compatibility.
- Updated `prettyoutput`: Now uses native `node:util.inspect` for enhanced performance, security, and compatibility.
- Native UUID generation: Replaced `uuidv4` with `crypto.randomUUID()` for generating contextIds, leveraging native Node.js capabilities.
- Enhanced logMethod dual signature: Improved support for the dual-signature interface, handling variations in parameter usage. (log with contextId or without contextId)
