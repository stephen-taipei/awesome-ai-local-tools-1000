#!/usr/bin/env python3
"""Whole-repository static gate using Python stdlib and Node.js."""
from concurrent.futures import ThreadPoolExecutor
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PREFIX = '/awesome-ai-local-tools-1000/'
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []; self.ids = []; self.title = False
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'title': self.title = True
        if 'id' in attrs: self.ids.append(attrs['id'])
        for attr in ('src', 'href'):
            if attrs.get(attr): self.refs.append((tag, attrs[attr]))

def check_reference(page, reference):
    url = urlsplit(reference)
    if url.scheme or url.netloc or not url.path: return None
    raw = unquote(url.path)
    if raw.startswith('/'):
        if not raw.startswith(PREFIX): return 'origin-root path escapes project base'
        target = ROOT / raw[len(PREFIX):]
    else: target = page.parent / raw
    target = target.resolve()
    if not target.is_relative_to(ROOT): return 'path escapes repository'
    if target.is_dir(): target /= 'index.html'
    if not target.is_file(): return f'missing target {target.relative_to(ROOT)}'
    return None

def run():
    failures = []
    pages = [ROOT / 'index.html', *sorted((ROOT / 'tools').glob('*/index.html'))]
    for page in pages:
        parsed = Page(); text = page.read_text(); parsed.feed(text)
        relative = str(page.relative_to(ROOT))
        if not parsed.title: failures.append([relative, 'missing title'])
        duplicate = [value for value, count in Counter(parsed.ids).items() if count > 1]
        if duplicate: failures.append([relative, 'duplicate ids', duplicate])
        for tag, ref in parsed.refs:
            problem = check_reference(page, ref)
            if problem: failures.append([relative, tag, ref, problem])
        for data in re.findall(r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>', text, re.S):
            try: json.loads(data)
            except ValueError as error: failures.append([relative, 'invalid structured data', str(error)])
    scripts = sorted((ROOT / 'tools').rglob('*.js')) + sorted((ROOT / 'scripts').glob('*.mjs'))
    def syntax(path):
        result = subprocess.run(['node', '--input-type=module', '--check'], input=path.read_text(), text=True, capture_output=True)
        return [str(path.relative_to(ROOT)), result.stderr] if result.returncode else None
    with ThreadPoolExecutor(max_workers=8) as pool:
        failures.extend(result for result in pool.map(syntax, scripts) if result)
    inventory = json.loads((ROOT / 'docs/tool-inventory.json').read_text())
    if {row['path'] for row in inventory} != {str(p.relative_to(ROOT)) for p in pages[1:]}:
        failures.append(['inventory', 'does not match actual tool pages'])
    pending = 0
    for row in inventory:
        path = ROOT / row['path']; script = path.with_name('app.js').read_text(); markup = path.read_text()
        if 'Analysis complete:' in script: failures.append([row['path'], 'generic analysis presented as completed tool'])
        if row['status'] == 'not-implemented':
            pending += 1
            if 'data-implementation="placeholder"' not in markup or '../shared/tool-status.js' not in markup:
                failures.append([row['path'], 'missing implementation disclosure'])
        if 'LocalSpeech.getConstructor()' in script and '../shared/local-speech.js' not in markup:
            failures.append([row['path'], 'missing local speech guard'])
    manifest = ROOT / 'vendor/manifest.json'
    if not manifest.is_file(): failures.append(['vendor', 'missing build manifest'])
    else:
        for name, expected in json.loads(manifest.read_text())['sha256'].items():
            asset = ROOT / 'vendor' / name
            if not asset.is_file() or hashlib.sha256(asset.read_bytes()).hexdigest() != expected:
                failures.append(['vendor', name, 'integrity mismatch'])
    protected = json.loads((ROOT / 'verification/homepage-design.json').read_text())
    home = (ROOT / 'index.html').read_text()
    for tag, expected in protected.items():
        match = re.search(rf'<{tag}\b[^>]*>.*?</{tag}>', home, re.S)
        if not match or hashlib.sha256(match[0].encode()).hexdigest() != expected:
            failures.append(['index.html', tag, 'protected homepage design changed'])
    report = {'html_pages': len(pages), 'javascript_files': len(scripts), 'not_implemented_pages': pending, 'failures': failures}
    (ROOT / 'audit-output').mkdir(exist_ok=True)
    (ROOT / 'audit-output/static.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    return 1 if failures else 0
if __name__ == '__main__': sys.exit(run())
