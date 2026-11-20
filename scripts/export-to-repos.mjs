#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPO_ROOT = join(ROOT, '..');

console.log('🔄 Exporting unified site assets to individual project repositories...');

// 1. Export to Eva (docs/)
const evaTarget = join(REPO_ROOT, 'eva/docs');
if (existsSync(join(REPO_ROOT, 'eva'))) {
  mkdirSync(join(evaTarget, 'catalog'), { recursive: true });
  mkdirSync(join(evaTarget, 'releases'), { recursive: true });
  mkdirSync(join(evaTarget, 'shared'), { recursive: true });

  cpSync(join(ROOT, 'eva/index.html'), join(evaTarget, 'index.html'));
  cpSync(join(ROOT, 'eva/catalog/index.html'), join(evaTarget, 'catalog/index.html'));
  cpSync(join(ROOT, 'eva/releases/index.html'), join(evaTarget, 'releases/index.html'));
  cpSync(join(ROOT, 'shared'), join(evaTarget, 'shared'), { recursive: true });
  cpSync(join(ROOT, '.nojekyll'), join(evaTarget, '.nojekyll'));
  console.log('  ✓ Exported to ../eva/docs/');
} else {
  console.warn('  ⚠️ ../eva repository not found, skipping');
}

// 2. Export to Astra (website/)
const astraTarget = join(REPO_ROOT, 'astra/website');
if (existsSync(join(REPO_ROOT, 'astra'))) {
  mkdirSync(join(astraTarget, 'catalog'), { recursive: true });
  mkdirSync(join(astraTarget, 'releases'), { recursive: true });
  mkdirSync(join(astraTarget, 'shared'), { recursive: true });

  mkdirSync(join(astraTarget, 'assets'), { recursive: true });
  cpSync(join(ROOT, 'shared/assets/icons/astra.png'), join(astraTarget, 'assets/icon.png'));
  cpSync(join(ROOT, 'astra/index.html'), join(astraTarget, 'index.html'));
  cpSync(join(ROOT, 'astra/catalog/index.html'), join(astraTarget, 'catalog/index.html'));
  cpSync(join(ROOT, 'astra/releases/index.html'), join(astraTarget, 'releases/index.html'));
  cpSync(join(ROOT, 'shared'), join(astraTarget, 'shared'), { recursive: true });
  cpSync(join(ROOT, '.nojekyll'), join(astraTarget, '.nojekyll'));
  console.log('  ✓ Exported to ../astra/website/');
} else {
  console.warn('  ⚠️ ../astra repository not found, skipping');
}

// 3. Export to Eva Linux
const evaLinuxPaths = [
  '/run/media/apex/New Volume/Chat-GPT/Eva-linux',
  join(REPO_ROOT, 'eva-linux'),
  '/home/apex/eva-linux'
];

for (const target of evaLinuxPaths) {
  if (existsSync(target)) {
    mkdirSync(join(target, 'catalog'), { recursive: true });
    mkdirSync(join(target, 'releases'), { recursive: true });
    mkdirSync(join(target, 'shared'), { recursive: true });
    mkdirSync(join(target, 'assets'), { recursive: true });

    cpSync(join(ROOT, 'eva-linux/index.html'), join(target, 'index.html'));
    cpSync(join(ROOT, 'eva-linux/catalog/index.html'), join(target, 'catalog/index.html'));
    cpSync(join(ROOT, 'eva-linux/releases/index.html'), join(target, 'releases/index.html'));
    cpSync(join(ROOT, 'eva-linux/assets'), join(target, 'assets'), { recursive: true });
    cpSync(join(ROOT, 'shared'), join(target, 'shared'), { recursive: true });
    cpSync(join(ROOT, '.nojekyll'), join(target, '.nojekyll'));
    console.log(`  ✓ Exported to ${target}/`);
  }
}

console.log('✨ Multi-repo export completed successfully!');
