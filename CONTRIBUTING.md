# Contributing

This repository contains working utilities, experiments and unimplemented pages. A page count is not an implementation guarantee. Check `docs/tool-inventory.json` and the audit report before choosing a task.

A contribution should implement the named task with deterministic acceptance fixtures, document its actual model/runtime and network behavior, and handle unsupported capabilities, invalid input, size limits, cancellation and resource cleanup. Do not replace missing functionality with random results, generic word counts or simulated success messages. Demo pages must say that they are demos.

Do not insert user input through `innerHTML`. Use text nodes, or the shared vetted sanitization approach where rich Markdown is required. Native speech must never fall back to a cloud recognizer. Review all model and dependency terms separately; the repository's missing root license text remains an owner decision.

Run `npm ci --ignore-scripts`, `npm run build:vendor`, `npm test`, `npm run audit:site` and `npm run test:browser` before requesting review. Install the Python requirements and Playwright Chromium for browser tests. Commit regenerated vendor assets and the lockfile when dependencies change. Include actual output fixtures for a newly implemented tool; page boot alone does not qualify it for a verified status.

The category/homepage body and stylesheet are protected by baseline hashes. Do not update those hashes to bypass the design constraint. Child tools may improve their UI, accessibility and behavior without redesigning the category page.
