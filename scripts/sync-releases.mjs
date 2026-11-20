#!/usr/bin/env node
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '../data/releases.json');

async function fetchReleases(repo) {
  const url = `https://api.github.com/repos/AmanicX/${repo}/releases`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AmanicX-Release-Sync/1.0',
        'Accept': 'application/vnd.github+json'
      }
    });
    if (!res.ok) {
      console.warn(`GitHub API notice for ${repo}: HTTP ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`Failed to reach GitHub API for ${repo}: ${err.message}`);
    return null;
  }
}

function classifyAsset(name, size, url) {
  let platform = 'unknown';
  let pkgType = 'binary';
  if (name.endsWith('.exe') || name.endsWith('.msi')) {
    platform = 'windows';
    pkgType = name.endsWith('.msi') ? 'msi' : 'installer';
  } else if (name.endsWith('.apk')) {
    platform = 'android';
    pkgType = 'apk';
  } else if (name.endsWith('.dmg') || name.includes('-mac.zip')) {
    platform = 'macos';
    pkgType = name.endsWith('.dmg') ? 'dmg' : 'zip';
  } else if (name.endsWith('.AppImage')) {
    platform = 'linux';
    pkgType = 'appimage';
  } else if (name.endsWith('.pacman')) {
    platform = 'linux';
    pkgType = 'pacman';
  } else if (name.endsWith('.deb')) {
    platform = 'linux';
    pkgType = 'deb';
  } else if (name.endsWith('.rpm')) {
    platform = 'linux';
    pkgType = 'rpm';
  } else if (name.endsWith('.blockmap') || name.endsWith('.yml')) {
    platform = 'meta';
    pkgType = 'metadata';
  }

  const sizeFormatted = size > 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)} MB`
    : `${(size / 1024).toFixed(1)} KB`;

  return { name, size, size_formatted: sizeFormatted, download_url: url, platform, pkg_type: pkgType };
}

function transform(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(r => ({
    tag: r.tag_name,
    name: r.name || r.tag_name,
    published_at: r.published_at,
    prerelease: Boolean(r.prerelease),
    html_url: r.html_url,
    body: r.body || '',
    assets: (r.assets || []).map(a => classifyAsset(a.name, a.size, a.browser_download_url))
  }));
}

async function main() {
  console.log('🔄 Checking GitHub Releases for AmanicX Ecosystem...');
  let existing = {};
  if (existsSync(DATA_FILE)) {
    try {
      existing = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    } catch (_) {}
  }

  const evaRaw = await fetchReleases('eva');
  const astraRaw = await fetchReleases('astra');
  const evaLinuxRaw = await fetchReleases('eva-linux');

  const projects = existing.projects || {};

  if (evaRaw && Array.isArray(evaRaw)) {
    const list = transform(evaRaw);
    const stable = list.find(r => !r.prerelease);
    projects.eva = {
      latest_stable: stable ? stable.tag : 'v2.2.2',
      latest_release_date: stable ? stable.published_at : '2026-11-19T16:00:35Z',
      releases: list
    };
    console.log(`✅ Eva: Synced ${list.length} releases (latest: ${projects.eva.latest_stable})`);
  } else {
    console.log('ℹ️ Eva: Preserving cached releases data.');
  }

  if (astraRaw && Array.isArray(astraRaw)) {
    const list = transform(astraRaw);
    const latest = list[0];
    projects.astra = {
      latest_stable: null,
      latest_prerelease: latest ? latest.tag : 'v0.1.0-pre.1',
      latest_release_date: latest ? latest.published_at : '2026-10-17T18:13:06Z',
      releases: list
    };
    console.log(`✅ Astra: Synced ${list.length} releases (latest: ${projects.astra.latest_prerelease})`);
  } else {
    console.log('ℹ️ Astra: Preserving cached releases data.');
  }

  if (evaLinuxRaw && Array.isArray(evaLinuxRaw)) {
    const list = transform(evaLinuxRaw);
    const stable = list.find(r => !r.prerelease);
    projects['eva-linux'] = {
      latest_stable: stable ? stable.tag : 'v2.0.0',
      latest_release_date: stable ? stable.published_at : '2026-11-20T14:39:00Z',
      status: 'Stable',
      releases: list
    };
    console.log(`✅ Eva Linux: Synced ${list.length} releases (latest: ${projects['eva-linux'].latest_stable})`);
  } else {
    console.log('ℹ️ Eva Linux: Preserving cached releases data.');
  }

  const output = {
    generated_at: new Date().toISOString(),
    projects
  };

  writeFileSync(DATA_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log('💾 Successfully updated data/releases.json');
}

main().catch(err => {
  console.error('Release sync notice:', err.message);
  process.exit(0); // non-fatal to ensure builds succeed offline
});
