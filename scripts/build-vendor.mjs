// Build self-hosted assets; visitors never download libraries from a package CDN.
import { readFile, writeFile, mkdir, cp, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const root = process.cwd();
const out = path.join(root, 'vendor');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const copies = {
  'acorn/dist/acorn.js': 'misc/acorn.min.js',
  'esprima/dist/esprima.js': 'misc/esprima.min.js',
  'crypto-js/crypto-js.js': 'misc/crypto-js.min.js',
  'js-beautify/js/lib/beautify.js': 'misc/beautify.min.js',
  'js-beautify/js/lib/beautify-html.js': 'misc/beautify-html.min.js',
  'js-beautify/js/lib/beautify-css.js': 'misc/beautify-css.min.js',
  'marked/lib/marked.umd.js': 'marked/marked.min.js',
  'dompurify/dist/purify.min.js': 'dompurify/purify.min.js',
  'github-markdown-css/github-markdown-light.css': 'misc/github-markdown-light.min.css',
  'prismjs/prism.js': 'prism/prism.min.js',
  'prismjs/themes/prism.css': 'prism/themes/prism.min.css',
  'prismjs/themes/prism-tomorrow.css': 'prism/themes/prism-tomorrow.min.css',
  'katex/dist/katex.min.js': 'katex/katex.min.js',
  'katex/dist/katex.min.css': 'katex/katex.min.css',
  'gif.js/dist/gif.js': 'gif/gif.min.js',
  'gif.js/dist/gif.worker.js': 'gif/gif.worker.js',
  'three/build/three.min.js': 'misc/three.min.js'
};
for (const language of ['javascript', 'typescript', 'css', 'markup', 'json', 'sql', 'python', 'bash']) copies[`prismjs/components/prism-${language}.min.js`] = `prism/components/prism-${language}.min.js`;
for (const [source, destination] of Object.entries(copies)) {
  await mkdir(path.dirname(path.join(out, destination)), { recursive: true });
  await cp(path.join(root, 'node_modules', source), path.join(out, destination));
}
await cp('node_modules/katex/dist/fonts', path.join(out, 'katex/fonts'), { recursive: true });
await mkdir(path.join(out, 'tailwind'), { recursive: true });
execFileSync(process.execPath, ['node_modules/tailwindcss/lib/cli.js', '-i', 'scripts/tailwind.css', '-c', 'scripts/tailwind.config.cjs', '-o', 'vendor/tailwind/tailwind.min.css', '--minify'], { stdio: 'inherit' });
async function walk(directory) {
  const result = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(file)); else result.push(file);
  }
  return result;
}
// Ship an SVG icon subset instead of a webfont.
const metadata = new Map();
for (const style of ['solid', 'brands', 'regular']) {
  for (const definition of Object.values(require(`@fortawesome/free-${style}-svg-icons`))) {
    if (!definition?.icon || !definition.iconName) continue;
    for (const name of [definition.iconName, ...definition.icon[2].filter(x => typeof x === 'string')]) {
      if (!metadata.has(name)) metadata.set(name, definition);
    }
  }
}
const iconNames = new Set();
for (const file of await walk('tools')) {
  if (!/\.(html|js)$/.test(file)) continue;
  for (const match of (await readFile(file, 'utf8')).matchAll(/\bfa-([a-z][a-z0-9-]+)/g)) iconNames.add(match[1]);
}
const utilities = /^(spin|pulse|fw|xs|sm|lg|[1-9]x|[12]xl|rotate-.+|flip-.+|stack.*|inverse|border|pull-.+)$/;
const rules = ['/* Font Awesome Free SVG subset. See vendor/licenses. */', '.fa,.fas,.far,.fab,.fa-solid,.fa-regular,.fa-brands{display:inline-block;width:1em;height:1em;vertical-align:-.125em;background-color:currentColor;mask:var(--fa-icon) center/contain no-repeat;-webkit-mask:var(--fa-icon) center/contain no-repeat}.fa-spin,.fa-pulse{animation:fa-spin 2s linear infinite}@keyframes fa-spin{to{transform:rotate(360deg)}}'];
for (const name of [...iconNames].sort()) {
  const data = metadata.get(name);
  if (!data) {
    if (!utilities.test(name) && !['solid', 'regular', 'brands'].includes(name)) console.warn(`Unresolved icon class: fa-${name}`);
    continue;
  }
  const [width, height, , , paths] = data.icon;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${[paths].flat().map(d => `<path d="${d}"/>`).join('')}</svg>`;
  rules.push(`.fa-${name}{--fa-icon:url("data:image/svg+xml,${encodeURIComponent(svg)}")}`);
}
await mkdir(path.join(out, 'fontawesome/css'), { recursive: true });
await writeFile(path.join(out, 'fontawesome/css/all.min.css'), rules.join('\n') + '\n');
const packages = JSON.parse(await readFile('package.json', 'utf8')).devDependencies;
await mkdir(path.join(out, 'licenses'), { recursive: true });
for (const name of Object.keys(packages)) {
  const files = await readdir(path.join('node_modules', name));
  for (const file of files.filter(file => /^(license|licence|copying|ofl)(\.|$)/i.test(file))) {
    await cp(path.join('node_modules', name, file), path.join(out, 'licenses', name.replaceAll('/', '-') + '-' + file));
  }
}
const hashes = {};
for (const file of await walk(out)) hashes[path.relative(out, file).split(path.sep).join('/')] = createHash('sha256').update(await readFile(file)).digest('hex');
await writeFile(path.join(out, 'manifest.json'), JSON.stringify({ packages, sha256: hashes }, null, 2) + '\n');
console.log(`Built ${Object.keys(hashes).length} self-hosted assets and notices.`);
