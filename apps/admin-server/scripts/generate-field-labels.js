const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ADMIN_ROOT = path.resolve(__dirname, '..');
const WIDGETS_DIR = path.join(
  ADMIN_ROOT,
  'src/pages/projects/[project]/widgets'
);
const OUT_FILE = path.join(
  ADMIN_ROOT,
  'src/components/generated-widget-field-labels.ts'
);

const SKIP_TYPES = new Set(['version-history']);

function cleanLabel(raw) {
  return raw
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#0?39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function widgetTypeOf(file) {
  const rel = file.slice(WIDGETS_DIR.length + 1);
  const first = rel.split(path.sep)[0];
  if (first.endsWith('.tsx')) return null;
  return first;
}

function collectFieldMatches(src) {
  const found = [];
  const literalRe = /(?:name|fieldName)=\{?["'`]([a-zA-Z0-9_]+)["'`]\}?/g;
  let m;
  while ((m = literalRe.exec(src))) {
    found.push({ key: m[1], index: m.index });
  }
  const templateRe = /name=\{`[^`]*?\.?([A-Za-z0-9_]+)`\s*\}/g;
  while ((m = templateRe.exec(src))) {
    found.push({ key: m[1], index: m.index });
  }
  return found.sort((a, b) => a.index - b.index);
}

function labelInWindow(w) {
  const fl = w.match(/<FormLabel[^>]*>([\s\S]*?)<\/FormLabel>/);
  if (fl) {
    const l = cleanLabel(fl[1]);
    if (l) return l;
  }
  const flp = w.match(/fieldLabel=\{?["'`]([^"'`]+)["'`]\}?/);
  if (flp) {
    const l = cleanLabel(flp[1]);
    if (l) return l;
  }
  const lp = w.match(/[^a-zA-Z]label=\{?["'`]([^"'`{}]+)["'`]\}?/);
  if (lp) {
    const l = cleanLabel(lp[1]);
    if (l) return l;
  }
  return null;
}

function generateFieldLabels() {
  const files = cp
    .execSync(`find "${WIDGETS_DIR}" -name '*.tsx'`)
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean);

  const labelsByType = {};
  let totalPairs = 0;

  for (const file of files) {
    const type = widgetTypeOf(file);
    if (!type || SKIP_TYPES.has(type)) continue;
    let src;
    try {
      src = fs.readFileSync(file, 'utf8');
    } catch (e) {
      continue;
    }
    labelsByType[type] = labelsByType[type] || {};
    const matches = collectFieldMatches(src);
    for (let i = 0; i < matches.length; i++) {
      const key = matches[i].key;
      if (labelsByType[type][key]) continue;
      const from = matches[i].index;
      const to = Math.min(
        i + 1 < matches.length ? matches[i + 1].index : src.length,
        from + 1100
      );
      const label = labelInWindow(src.slice(from, to));
      if (!label) continue;
      labelsByType[type][key] = label;
      totalPairs++;
    }
  }

  const sorted = {};
  for (const type of Object.keys(labelsByType).sort()) {
    const inner = labelsByType[type];
    if (Object.keys(inner).length === 0) continue;
    const innerSorted = {};
    for (const k of Object.keys(inner).sort()) innerSorted[k] = inner[k];
    sorted[type] = innerSorted;
  }

  const header =
    'export const WIDGET_FIELD_LABELS: Record<string, Record<string, string>> =';
  fs.writeFileSync(
    OUT_FILE,
    header + ' ' + JSON.stringify(sorted, null, 2) + ';\n'
  );
  return { types: Object.keys(sorted).length, pairs: totalPairs };
}

module.exports = { generateFieldLabels };

if (require.main === module) {
  const r = generateFieldLabels();
  process.stdout.write(
    'Gegenereerd: ' + r.types + ' widgettypes, ' + r.pairs + ' labels\n'
  );
}
