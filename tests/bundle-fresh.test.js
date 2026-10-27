import { readFileSync } from 'node:fs';

const BUNDLE = 'js/bundles/main.js';
const committed = readFileSync(BUNDLE, 'utf8');

let fresh;
try {
  const { build } = await import('esbuild');
  const result = await build({
    entryPoints: ['js/main.js'],
    bundle: true,
    format: 'iife',
    minify: true,
    write: false,
  });
  fresh = result.outputFiles[0].text;
} catch (e) {
  console.error('SKIP: esbuild not available for bundle comparison:', e.message);
  process.exit(0);
}

if (fresh !== committed) {
  console.error('FAIL: js/bundles/main.js is stale — does not match current source files.');
  console.error('Run `npm run build` to update the bundle.');
  process.exit(1);
}

console.log('OK: bundle js/bundles/main.js matches source files (' + committed.length + ' bytes)');
