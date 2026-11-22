// Assembles the deployable site in dist/:
//   site/ (playground, AI-assisted) + programs/ and evidence/ (Kylar's, copied byte-for-byte).
// Run from the repo root: node site/build.mjs
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'site');
const dist = join(root, 'dist');

// Empty dist/ rather than deleting it (Windows refuses to delete a folder a shell is sitting in).
mkdirSync(dist, { recursive: true });
for (const f of readdirSync(dist)) rmSync(join(dist, f), { recursive: true, force: true });

for (const f of ['index.html', 'runner.html', '_headers']) copyFileSync(join(site, f), join(dist, f));
cpSync(join(site, 'assets'), join(dist, 'assets'), { recursive: true });
cpSync(join(site, 'runtime'), join(dist, 'runtime'), { recursive: true });
cpSync(join(root, 'evidence'), join(dist, 'evidence'), { recursive: true });

// Originals: copy as raw bytes and check each one against the SHA-256 recorded from CodeHS.
const data = readFileSync(join(site, 'assets', 'data.js'), 'utf8');
const template = readFileSync(join(site, 'template.html'), 'utf8');
const slugs = readdirSync(join(root, 'programs'));
for (const slug of slugs) {
  const src = join(root, 'programs', slug, 'default.js');
  const bytes = readFileSync(src);
  const sha = createHash('sha256').update(bytes).digest('hex');
  const block = data.slice(data.indexOf(`'${slug}': {`));
  const expected = (block.match(/sha256: '([0-9a-f]{64})'/) || [])[1];
  if (sha !== expected) throw new Error(`${slug}: sha256 ${sha} does not match recorded ${expected}`);
  mkdirSync(join(dist, 'programs', slug), { recursive: true });
  copyFileSync(src, join(dist, 'programs', slug, 'default.js'));
  console.log(`ok  ${slug.padEnd(28)} ${sha}`);

  // Program page = template + this program's fragment.
  const frag = readFileSync(join(site, 'pages', `${slug}.html`), 'utf8');
  const m = frag.match(/<!-- meta: title=(.*?) \| desc=(.*?) -->/);
  const tagline = (block.match(/tagline: '((?:[^'\\]|\\.)*)'/) || [])[1].replace(/\\'/g, "'");
  let html = template
    .replaceAll('{{SLUG}}', slug)
    .replaceAll('{{TITLE}}', m[1])
    .replaceAll('{{DESC}}', m[2])
    .replaceAll('{{TAGLINE}}', tagline)
    .replace('{{CONTENT}}', frag.replace(m[0], '').trim());
  for (const s of slugs) html = html.replaceAll(`{{CUR_${s}}}`, s === slug ? ' aria-current="page"' : '');
  writeFileSync(join(dist, `${slug}.html`), html);
}
console.log('built dist/');
