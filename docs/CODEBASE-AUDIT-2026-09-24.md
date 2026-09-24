# Codebase Audit — 2026-09-24

## Scope and reproducibility

Baseline: `1fe535be0443848263d21977cd02fcc360226117` on `main`.
Reviewed the complete tracked source inventory (1,001 tool pages, 1,002 total HTML pages and 1,001 application scripts), static references, syntax, implementation patterns, browser dependencies and verification scripts. Deep manual review focused on background removal, native speech, Markdown, API testing, green-screen controls, AR overlays and complexity analysis. This is not a claim that all 1,001 advertised tasks, models, browsers or output quality have passed acceptance testing.

The category/homepage design is protected: `verification/homepage-design.json` contains baseline hashes of its exact `<body>` and `<style>`. Only the nonvisual `/llms.txt` head reference is corrected to a relative project path.

## Findings and applied repairs

| Priority | Evidence / affected surface | Repair |
| --- | --- | --- |
| P1 | 136 unresolved HTML resource/navigation references across 60 pages in the baseline; missing entire `vendor/`, origin-root paths incompatible with GitHub Pages project hosting | Version-pinned, self-hosted dependency build; project-relative paths; incorrect parent-page links point to the existing homepage; asset integrity manifest and link gate |
| P1 | `999-code-complexity-analysis/app.js` invalid quoted template literal prevents boot; wrong AST case type and nested-function accounting | Safe text-node renderer; tested shared complexity implementation; correct switch/default and independent nested-function counts |
| P1 | Markdown preview and clipboard export use unsanitized `marked.parse` output | Local DOMPurify allowlist for both surfaces; scripts, active attributes, remote images and embedded documents excluded; fixed line-format selection corruption, mobile split override and toolbar horizontal overflow |
| P1 | Native speech pages default to a browser-selected local/remote recognition service despite local-only messaging | Shared capability gate; every start forces device-only processing; unsupported capability fails closed; no cloud fallback; language-pack dependency disclosed |
| P1 | Visualizers retain microphone tracks after stopping; late permission can reopen capture | Explicit track ownership, stop/error/pagehide cleanup and late-resolution rejection; continuous recognition reuses a single visualization session |
| P1 | Participant names, keyword inputs and speech transcripts inserted as HTML | Text-node rendering and event listeners instead of string-generated HTML and inline handlers; selector interpolation removed for keywords |
| P1 | Background remover copies RGB bytes into RGBA storage, discards original transparency, clears busy before PNG export completes and accepts stale results after reset | Pure channel conversion and alpha multiplication; awaited export; generation token; bounded dimensions/files; URL cleanup; load concurrency guard and WebGPU-to-WASM fallback |
| P1 | 412 `processText` placeholders return generic word/sentence counts as successful specialized AI analysis | Visible bilingual implementation disclosure, disabled execution, no fake success output and machine-readable status inventory. The 412 advertised functions remain unimplemented |
| P2 | Audio-file transcription contains demo text rather than inference | Explicit demo disclosure and disabled transcription; not represented as a completed feature |
| P2 | API Tester has no timeout/size bound, retains stale output, omits DELETE bodies and uses ambient fetch credentials | HTTP(S) URL check; 15-second abort; 2 MiB streamed-response cap; request lock; no ambient cookies; no automatic redirects; GET/HEAD body rules; explicit egress disclosure |
| P1 | Green-screen JS binds nonexistent element IDs/selectors; edge blur assumes square images; zero softness can divide by zero | Repair actual control wiring and add missing status/apply controls; preserve source alpha; use actual dimensions and separable blur; real rectangular PNG regression |
| P1 | AR try-on initialization reads global `event.target`, which is not a clicked tab during boot; centered emoji are described as face tracking | Deterministic tab/language state, semantic item buttons, camera lifecycle/late-permission cleanup, capture gating and explicit sticker-demo disclosure |
| P2 | Existing screenshot scripts swallow errors and use `file://`; no CI | Assertion-based compatibility entry points, Node unit tests, whole-source static gate, HTTP project-base smoke matrix and targeted browser regression tests |
| P2 | README describes planned React/runtime/cache/encrypted-storage layers as implemented guarantees | Factual README and status inventory; historical architecture retained as an explicitly labeled proposal |

The initial `Math.random`, `innerHTML`, `placeholder` and network keyword scans are triage signals, not proof that every matching file is vulnerable or broken. The recorded 412 placeholder count uses the specific identical generic analysis implementation, not generic HTML input placeholders.

## Test interpretation

`npm test` exercises image pixels/alpha validation, nested-function/switch analysis, unsupported speech gating, repeated local-only starts, microphone stop/late permission, visualization reuse and page-exit abort with deterministic doubles. `npm run audit:site` checks all pages, local references, IDs, script syntax, disclosure wiring, inventory consistency, vendor hashes and protected homepage sections.

`npm run test:browser` starts a real HTTP server under `/awesome-ai-local-tools-1000/`, scans all page boots, and performs targeted Markdown/XSS/export/mobile, parser/complexity, participant/keyword injection, synthetic image/reset and homepage rendering checks. External requests are deliberately blocked and classified separately, not silently counted as functioning integrations. Image processing uses a **mock model**; actual downloaded model inference and quality remain unverified. The suite does not record a microphone or transmit user inputs.

The browser command also runs `browser_extras.py` (real rectangular PNG pixels, green-screen controls and AR UI) and `browser_layout.py` (320/390 px overflow checks). CI publishes `audit-output/static.json`, `browser.json`, `browser-extras.json`, `browser-layout.json` and focused screenshots. A green smoke test means the checked page boots and assertions passed, **not** that its advertised task is implemented or accurate. Use the workflow's exact run/commit and JSON counts as evidence, rather than treating this document as an unchanging test receipt.

## Verified repair run

Run `35960112163` on 2026-09-24 tested the generated source committed as `92d7ffe06b79538eec92731ac051fa5ae305f057`: 1,002 HTML pages / 1,006 JavaScript files checked, zero static failures, 924 page boots passing, 78 external-dependency pages unverified, 10/10 unit tests, 5/5 primary browser regressions and 3/3 additional UI regression groups. The locked npm dependency audit reported zero known vulnerabilities at that run; this does not cover all external runtime/model dependencies.

Subsequent finalization adds a dedicated 320/390 px Markdown layout gate. The normal CI uses read-only repository permissions, checks the committed sources directly, and verifies reproducible vendor assets. The temporary source-application workflow is removed before merge. See `audit-results` on the exact final commit for its final receipt; the numbers above are a dated observation, not a permanent guarantee.

## Remaining work and limitations

1. Implement or deliberately retire the 412 placeholder tasks; build task-specific golden fixtures and pass/fail criteria before promoting any inventory status. Additional unverified implementations may contain simulations or quality defects.
2. Run real-model download/inference acceptance tests on representative CPU/WebGPU devices, including fallback, memory pressure, cancellation, cache eviction, model versions and licenses. Pin model revisions after compatibility validation. Existing remote runtimes are not all vendored by this repair.
3. External-dependency pages need integration tests with those dependencies present. Cross-browser/mobile accessibility, screen-reader behavior, offline mode, performance budgets and complete per-tool output correctness remain a separate acceptance matrix.
4. Confirm the missing root license text with the owner; review each model's separate usage terms. No model license is changed or implied by this audit.
5. Existing sitemap references are structurally valid, but the legacy news sitemap and indexing of incomplete pages need a content/SEO policy. The homepage's existing copy/design was intentionally not redesigned.
6. Deprecated CryptoJS and legacy browser libraries remain for compatibility with the existing tools. They are version-pinned and monitored by `npm audit`; migration to Web Crypto / modern maintained equivalents requires tool-specific compatibility tests.

## Source references

- MDN, SpeechRecognition.processLocally: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally
- Marked security warning: https://marked.js.org/
- DOMPurify upstream: https://github.com/cure53/DOMPurify
- Transformers.js RawImage API: https://huggingface.co/docs/transformers.js/api/utils/image
- RMBG-1.4 model and terms: https://huggingface.co/briaai/RMBG-1.4
