#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests.push(message);
    console.error(`  ❌ FAILED: ${message}`);
  }
}

console.log('🧪 Running AmanicX Ecosystem Integrity Tests...\n');

// 1. Route Verification
console.log('1. Checking Required Routes:');
const requiredFiles = [
  'index.html',
  'apps/index.html',
  'eva/index.html',
  'eva/catalog/index.html',
  'eva/releases/index.html',
  'astra/index.html',
  'astra/catalog/index.html',
  'astra/releases/index.html',
  'eva-linux/index.html',
  'eva-linux/catalog/index.html',
  'eva-linux/releases/index.html',
  '404.html',
  'sitemap.xml',
  'robots.txt',
  '.nojekyll'
];

for (const file of requiredFiles) {
  const fullPath = join(ROOT, file);
  assert(existsSync(fullPath) && statSync(fullPath).size > 0, `File exists & non-empty: ${file}`);
}

// 2. Shared Assets & Scripts
console.log('\n2. Checking Shared CSS, JS & Assets:');
const sharedFiles = [
  'shared/styles/design-system.css',
  'shared/styles/motion.css',
  'shared/scripts/theme.js',
  'shared/scripts/motion.js',
  'shared/scripts/ecosystem-client.js',
  'shared/assets/favicon.svg'
];

for (const file of sharedFiles) {
  const fullPath = join(ROOT, file);
  assert(existsSync(fullPath) && statSync(fullPath).size > 0, `Shared asset ready: ${file}`);
}

// 3. Data Integrity
console.log('\n3. Validating Centralized Data Sources:');
try {
  const eco = JSON.parse(readFileSync(join(ROOT, 'data/ecosystem.json'), 'utf-8'));
  assert(eco.projects && eco.projects.length === 3, 'ecosystem.json has exactly 3 projects (Eva, Astra, Eva Linux)');
  const eva = eco.projects.find(p => p.id === 'eva');
  const astra = eco.projects.find(p => p.id === 'astra');
  const evaLinux = eco.projects.find(p => p.id === 'eva-linux');

  assert(eva.version === 'v2.2.2', `Eva version is v2.2.2 (${eva.version})`);
  assert(astra.version === 'v0.1.0-pre.1', `Astra version is v0.1.0-pre.1 (${astra.version})`);
  assert(evaLinux.status === 'Stable', `Eva Linux is marked Stable`);
  assert(evaLinux.version === 'v2.0.0', `Eva Linux version is v2.0.0 (${evaLinux.version})`);

  assert(eva.install_methods.arch.command.includes('eva-2.2.2.pacman'), 'Eva Arch pacman command points to verified 2.2.2 pacman');
  assert(eva.install_methods.arch_appimage.command.includes('Eva-2.2.2.AppImage'), 'Eva AppImage command points to verified 2.2.2 AppImage');
} catch (e) {
  assert(false, `ecosystem.json failed to parse: ${e.message}`);
}

try {
  const rel = JSON.parse(readFileSync(join(ROOT, 'data/releases.json'), 'utf-8'));
  assert(rel.projects.eva.releases.length >= 10, `Eva releases count is ${rel.projects.eva.releases.length} (>= 10 verified)`);
  assert(rel.projects.astra.releases.length >= 1, `Astra releases count is ${rel.projects.astra.releases.length} (>= 1 verified)`);
  assert(rel.projects['eva-linux'].releases.length >= 1, `Eva Linux releases count is ${rel.projects['eva-linux'].releases.length} (>= 1 verified)`);
} catch (e) {
  assert(false, `releases.json failed to parse: ${e.message}`);
}

// 4. HTML Links and Assets Consistency
console.log('\n4. Verifying HTML Local Links & Theme Engine:');
for (const file of ['index.html', 'apps/index.html', 'eva/index.html', 'astra/index.html', 'eva-linux/index.html']) {
  const content = readFileSync(join(ROOT, file), 'utf-8');
  assert(content.includes('localStorage.getItem(\'amanicx_theme\')'), `${file} contains anti-FOUC theme script`);
  assert(content.includes('design-system.css'), `${file} links to design-system.css`);
  assert(content.includes('motion.css'), `${file} links to motion.css`);
  assert(content.includes('theme.js'), `${file} includes theme.js`);
}

console.log(`\n========================================`);
console.log(`Total tests: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests.length}`);
console.log(`========================================`);

if (failedTests.length > 0) {
  process.exit(1);
} else {
  console.log('🎉 All integrity checks PASSED successfully!');
}
