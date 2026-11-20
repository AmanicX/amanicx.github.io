#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const ecosystem = JSON.parse(readFileSync(join(ROOT, 'data/ecosystem.json'), 'utf-8'));
const releasesData = JSON.parse(readFileSync(join(ROOT, 'data/releases.json'), 'utf-8'));

function renderHead(title, description, canonicalPath, prefix = '', ogImage = 'shared/assets/favicon.svg') {
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title} | AmanicX</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="https://amanicx.github.io${canonicalPath}">
  <meta name="theme-color" content="#0B0D12">

  <!-- OpenGraph -->
  <meta property="og:title" content="${title} | AmanicX">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://amanicx.github.io${canonicalPath}">
  <meta property="og:image" content="https://amanicx.github.io/${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title} | AmanicX">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="https://amanicx.github.io/${ogImage}">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="${prefix}shared/assets/favicon.svg">

  <!-- Unified Stylesheets -->
  <link rel="stylesheet" href="${prefix}shared/styles/design-system.css">
  <link rel="stylesheet" href="${prefix}shared/styles/motion.css">

  <!-- Instant Theme Script (Zero-FOUC) -->
  <script>
    (function () {
      try {
        var theme = localStorage.getItem('amanicx_theme') || 'system';
        var effective = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
        document.documentElement.setAttribute('data-theme', effective);
        document.documentElement.setAttribute('data-theme-setting', theme);
      } catch (e) {}
    })();
  </script>
</head>
<body>
  <div id="scroll-progress"></div>
`;
}

function renderNav(activeRoute, prefix = '') {
  return `  <!-- Floating Pill Navigation (Nexora Inspired) -->
  <div class="nav-wrapper">
    <header class="nav-bar">
      <a href="${prefix}" class="nav-brand" aria-label="AmanicX Ecosystem Home">
        <img class="nav-brand-mark" src="${prefix}shared/assets/favicon.svg" alt="AmanicX" width="26" height="26">
        <span>AmanicX</span>
      </a>

      <nav class="nav-links" aria-label="Main Navigation">
        <a href="${prefix}" class="nav-link ${activeRoute === 'home' ? 'active' : ''}">Overview</a>
        <a href="${prefix}apps/" class="nav-link ${activeRoute === 'apps' ? 'active' : ''}">Apps</a>
        <a href="${prefix}eva/" class="nav-link ${activeRoute === 'eva' ? 'active' : ''}">Eva</a>
        <a href="${prefix}astra/" class="nav-link ${activeRoute === 'astra' ? 'active' : ''}">Astra</a>
        <a href="${prefix}eva-linux/" class="nav-link ${activeRoute === 'eva-linux' ? 'active' : ''}">Eva Linux</a>
      </nav>

      <div class="nav-controls">
        <div class="theme-switcher" role="group" aria-label="Theme mode switcher">
          <button class="theme-btn" data-mode="dark" title="Dark Theme" aria-label="Dark Theme">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          </button>
          <button class="theme-btn" data-mode="light" title="Light Theme" aria-label="Light Theme">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          </button>
          <button class="theme-btn" data-mode="system" title="System Theme" aria-label="System Theme">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
          </button>
        </div>

        <a href="https://github.com/AmanicX" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary" aria-label="GitHub Profile">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          <span>GitHub</span>
        </a>
      </div>
    </header>
  </div>
`;
}

function renderFooter(prefix = '') {
  return `  <!-- Unified Ecosystem Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div style="display:flex; align-items:center; gap:0.625rem; font-weight:700; font-size:1.125rem; margin-bottom:0.75rem;">
            <img src="${prefix}shared/assets/favicon.svg" alt="AmanicX" width="24" height="24">
            <span>AmanicX Ecosystem</span>
          </div>
          <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1.25rem;">
            Software systems engineered for autonomy, control, and privacy. Built with open standards and verified local performance.
          </p>
          <div class="badge badge-dev">CRIMSON SYSTEM</div>
        </div>

        <div>
          <div class="footer-title">Software Projects</div>
          <ul class="footer-links">
            <li><a href="${prefix}eva/">Eva Studio</a></li>
            <li><a href="${prefix}astra/">Astra Assistant</a></li>
            <li><a href="${prefix}eva-linux/">Eva Linux</a></li>
            <li><a href="${prefix}apps/">Application Catalog</a></li>
          </ul>
        </div>

        <div>
          <div class="footer-title">Releases & Docs</div>
          <ul class="footer-links">
            <li><a href="${prefix}eva/releases/">Eva Downloads (v2.2.2)</a></li>
            <li><a href="${prefix}astra/releases/">Astra Downloads (v0.1.0-pre)</a></li>
            <li><a href="${prefix}eva-linux/releases/">Eva Linux (v2.0.0)</a></li>
            <li><a href="${prefix}eva-linux/catalog/">Eva Linux Architecture</a></li>
            <li><a href="${prefix}eva/catalog/">Eva Evolution Catalog</a></li>
          </ul>
        </div>

        <div>
          <div class="footer-title">Community & Source</div>
          <ul class="footer-links">
            <li><a href="https://github.com/AmanicX" target="_blank" rel="noopener noreferrer">GitHub Organization</a></li>
            <li><a href="https://github.com/AmanicX/eva" target="_blank" rel="noopener noreferrer">Eva Repository</a></li>
            <li><a href="https://github.com/AmanicX/astra" target="_blank" rel="noopener noreferrer">Astra Repository</a></li>
            <li><a href="https://github.com/AmanicX/eva-linux" target="_blank" rel="noopener noreferrer">Eva Linux Repository</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div>&copy; ${new Date().getFullYear()} AmanicX. Released under open-source licenses (MIT & Apache-2.0).</div>
        <div>Hosted natively on GitHub Pages with automated release sync.</div>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="${prefix}shared/scripts/theme.js"></script>
  <script src="${prefix}shared/scripts/motion.js"></script>
  <script src="${prefix}shared/scripts/ecosystem-client.js"></script>
</body>
</html>
`;
}

console.log('Build engine loaded.');

function renderAppIcon(p, prefix = './') {
  if (p.id === 'eva') {
    return `
      <div style="width:44px; height:44px; position:relative; flex-shrink:0;">
        <img class="icon-theme-dark" src="${prefix}shared/assets/icons/eva-dark.png" alt="Eva" width="44" height="44" style="border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        <img class="icon-theme-light" src="${prefix}shared/assets/icons/eva-light.png" alt="Eva" width="44" height="44" style="border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      </div>
    `;
  }
  if (p.id === 'astra') {
    return `<img src="${prefix}shared/assets/icons/astra.png" alt="Astra" width="44" height="44" style="border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.3); flex-shrink:0;">`;
  }
  if (p.id === 'eva-linux') {
    return `<img src="${prefix}shared/assets/icons/eva-linux.svg" alt="Eva Linux" width="44" height="44" style="border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.3); flex-shrink:0;">`;
  }
  return `<img src="${prefix}shared/assets/favicon.svg" alt="${p.name}" width="44" height="44" style="border-radius:12px;">`;
}

function renderCatalogAppIcon(p, prefix = '../') {
  if (p.id === 'eva') {
    return `
      <div style="width:56px; height:56px; position:relative; flex-shrink:0;">
        <img class="icon-theme-dark" src="${prefix}shared/assets/icons/eva-dark.png" alt="Eva logo" width="56" height="56" style="border-radius:14px; box-shadow:0 6px 16px rgba(0,0,0,0.3);">
        <img class="icon-theme-light" src="${prefix}shared/assets/icons/eva-light.png" alt="Eva logo" width="56" height="56" style="border-radius:14px; box-shadow:0 6px 16px rgba(0,0,0,0.1);">
      </div>
    `;
  }
  if (p.id === 'astra') {
    return `<img src="${prefix}shared/assets/icons/astra.png" alt="Astra logo" width="56" height="56" style="border-radius:14px; box-shadow:0 6px 16px rgba(0,0,0,0.3); flex-shrink:0;">`;
  }
  if (p.id === 'eva-linux') {
    return `<img src="${prefix}shared/assets/icons/eva-linux.svg" alt="Eva Linux logo" width="56" height="56" style="border-radius:14px; box-shadow:0 6px 16px rgba(0,0,0,0.3); flex-shrink:0;">`;
  }
  return `<img src="${prefix}shared/assets/favicon.svg" alt="${p.name}" width="56" height="56">`;
}

function renderPlatformCtaButtons(p) {
  if (p.id === 'eva') {
    return `
      <a href="https://github.com/AmanicX/eva/releases/download/v2.2.2/Eva-Setup-2.2.2.exe" class="platform-cta-btn" download title="Download Eva for Windows (.exe)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        <span>Windows</span>
        <span class="dl-ext">EXE</span>
      </a>
      <a href="https://github.com/AmanicX/eva/releases/download/v2.2.2/Eva-2.2.2.AppImage" class="platform-cta-btn" download title="Download Eva Linux AppImage">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        <span>Linux</span>
        <span class="dl-ext">AppImage</span>
      </a>
      <a href="https://github.com/AmanicX/eva/releases/download/v2.2.2/eva-2.2.2.pacman" class="platform-cta-btn" download title="Download Eva Arch Linux Pacman">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        <span>Arch Linux</span>
        <span class="dl-ext">pacman</span>
      </a>
      <a href="https://github.com/AmanicX/eva/releases/download/v2.2.2/Eva-2.2.2.dmg" class="platform-cta-btn" download title="Download Eva for macOS (.dmg)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        <span>macOS</span>
        <span class="dl-ext">DMG</span>
      </a>
      <a href="https://github.com/AmanicX/eva/releases/download/v2.2.2/Eva-android.apk" class="platform-cta-btn" download title="Download Eva Android APK">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        <span>Android</span>
        <span class="dl-ext">APK</span>
      </a>
    `;
  }
  if (p.id === 'astra') {
    return `
      <a href="https://github.com/AmanicX/astra/releases/download/v0.1.0-pre.1/Astra_0.1.0_x64-setup.exe" class="platform-cta-btn" download title="Download Astra for Windows (.exe)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        <span>Windows</span>
        <span class="dl-ext">EXE</span>
      </a>
      <a href="https://github.com/AmanicX/astra/releases/download/v0.1.0-pre.1/Astra_0.1.0_amd64.AppImage" class="platform-cta-btn" download title="Download Astra Linux AppImage">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        <span>Linux</span>
        <span class="dl-ext">AppImage</span>
      </a>
      <a href="https://github.com/AmanicX/astra/releases/download/v0.1.0-pre.1/Astra-0.1.0-1.x86_64.rpm" class="platform-cta-btn" download title="Download Astra Fedora / RHEL RPM">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        <span>Fedora</span>
        <span class="dl-ext">RPM</span>
      </a>
      <a href="../astra/releases/#arch" class="platform-cta-btn" title="View Astra Arch Linux Installation Script">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
        <span>Arch Linux</span>
        <span class="dl-ext">Script</span>
      </a>
    `;
  }
  if (p.id === 'eva-linux') {
    return `
      <a href="https://raw.githubusercontent.com/AmanicX/eva-linux/main/install.sh" target="_blank" rel="noopener" class="platform-cta-btn" title="Quick Bootstrap Script (Arch Linux)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
        <span>Arch Linux</span>
        <span class="dl-ext">install.sh</span>
      </a>
      <a href="https://github.com/AmanicX/eva-linux" target="_blank" rel="noopener" class="platform-cta-btn" title="View Source & Setup on GitHub">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        <span>GitHub</span>
        <span class="dl-ext">Source</span>
      </a>
    `;
  }
  return '';
}

// -----------------------------------------------------------------------------
// 1. HOME PAGE GENERATOR (/)
// -----------------------------------------------------------------------------
function generateHomePage() {
  const eva = ecosystem.projects.find(p => p.id === 'eva');
  const astra = ecosystem.projects.find(p => p.id === 'astra');
  const evaLinux = ecosystem.projects.find(p => p.id === 'eva-linux');

  const content = `
  ${renderNav('home', './')}

  <!-- Hero Section -->
  <section class="section-lg" style="position:relative; overflow:hidden;">
    <div class="ambient-flare flare-crimson" style="top:-100px; left:50%; width:650px; height:650px; transform:translateX(-50%);"></div>
    <div class="container" style="text-align:center; position:relative; z-index:2;">
      <div class="eyebrow reveal">AMANICX SOFTWARE ECOSYSTEM</div>
      <h1 class="title-display reveal delay-100" style="margin-bottom:1.5rem; max-width:960px; margin-left:auto; margin-right:auto;">
        Software Engineered for <span style="color:var(--accent-primary);">Autonomy</span>.<br>Crafted for Control.
      </h1>
      <p class="lead reveal delay-200" style="margin:0 auto 2.5rem; font-size:1.1875rem;">
        A unified ecosystem of privacy-first AI studios, permission-gated desktop automation, and custom Linux operating systems. Designed with intention and built for local performance.
      </p>

      <div class="reveal delay-300" style="display:flex; align-items:center; justify-content:center; gap:1rem; flex-wrap:wrap; margin-bottom:3.5rem;">
        <a href="./apps/" class="btn btn-lg btn-primary">
          <span>Explore Application Catalog</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a href="./eva/releases/" class="btn btn-lg btn-secondary">
          <span>Latest Release (Eva v2.2.2)</span>
        </a>
      </div>

      <!-- Live Ecosystem Activity Ticker -->
      <div class="card card-glass reveal delay-400" style="display:inline-flex; align-items:center; gap:1.5rem; padding:0.875rem 1.75rem; border-radius:var(--radius-full); max-width:100%;">
        <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.8125rem; font-weight:600; color:var(--accent-primary); flex-shrink:0;">
          <span class="live-dot"></span>
          LIVE UPDATES
        </div>
        <div style="height:14px; width:1px; background:var(--border-subtle); flex-shrink:0;"></div>
        <div style="font-size:0.875rem; color:var(--text-secondary); display:flex; gap:1.5rem; white-space:nowrap; overflow-x:auto;">
          <span><strong>Eva v2.2.2</strong> released (Universal & Arch pacman)</span>
          <span>&bull;</span>
          <span><strong>Astra v0.1.0-pre.1</strong> permission engine testing</span>
          <span>&bull;</span>
          <span><strong>Eva Linux v2.0.0</strong> Stable released</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Projects Showcase Grid -->
  <section class="section" id="projects" style="background:var(--bg-surface-0); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
    <div class="container">
      <div style="text-align:center; margin-bottom:4rem;">
        <div class="eyebrow reveal">FLAGSHIP SOFTWARE</div>
        <h2 class="title-section reveal delay-100">Three Distinct Disciplines</h2>
        <p class="lead reveal delay-200" style="margin:1rem auto 0;">
          Each project is engineered independently around its core domain, sharing a cohesive crimson aesthetic and zero-compromise design language.
        </p>
      </div>

      <div class="grid-3col">
        
        <!-- Eva Card -->
        <div class="card card-feature reveal delay-100">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem;">
              <div style="display:flex; align-items:center; gap:0.875rem;">
                ${renderAppIcon(eva, './')}
                <div>
                  <h3 class="title-card">Eva</h3>
                  <span style="font-size:0.8125rem; color:var(--text-muted);">AI Character Studio</span>
                </div>
              </div>
              <span class="badge badge-stable">v2.2.2 Stable</span>
            </div>
            <p style="color:var(--text-secondary); font-size:0.9375rem; line-height:1.6; margin-bottom:1.5rem;">
              ${eva.short_description}
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:2rem;">
              <span class="badge badge-dev">14-Field Persona Gen</span>
              <span class="badge badge-dev">3 Visual Studios</span>
              <span class="badge badge-dev">Universal BYOK</span>
              <span class="badge badge-dev">Android 16 APK</span>
            </div>
          </div>
          <div style="display:flex; gap:0.75rem;">
            <a href="./eva/" class="btn btn-sm btn-primary" style="flex:1;">Explore Eva</a>
            <a href="./eva/releases/" class="btn btn-sm btn-secondary">Downloads</a>
          </div>
        </div>

        <!-- Astra Card -->
        <div class="card card-feature reveal delay-200">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem;">
              <div style="display:flex; align-items:center; gap:0.875rem;">
                ${renderAppIcon(astra, './')}
                <div>
                  <h3 class="title-card">Astra</h3>
                  <span style="font-size:0.8125rem; color:var(--text-muted);">AI Desktop Assistant</span>
                </div>
              </div>
              <span class="badge badge-preview">v0.1.0-pre.1</span>
            </div>
            <p style="color:var(--text-secondary); font-size:0.9375rem; line-height:1.6; margin-bottom:1.5rem;">
              ${astra.short_description}
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:2rem;">
              <span class="badge badge-dev">3-Tier Permission Engine</span>
              <span class="badge badge-dev">OS Control</span>
              <span class="badge badge-dev">Push-to-Talk Voice</span>
              <span class="badge badge-dev">Dual Window</span>
            </div>
          </div>
          <div style="display:flex; gap:0.75rem;">
            <a href="./astra/" class="btn btn-sm btn-primary" style="flex:1;">Explore Astra</a>
            <a href="./astra/releases/" class="btn btn-sm btn-secondary">Releases</a>
          </div>
        </div>

        <!-- Eva Linux Card -->
        <div class="card card-feature reveal delay-300">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem;">
              <div style="display:flex; align-items:center; gap:0.875rem;">
                ${renderAppIcon(evaLinux, './')}
                <div>
                  <h3 class="title-card">Eva Linux</h3>
                  <span style="font-size:0.8125rem; color:var(--text-muted);">Wayland Workstation</span>
                </div>
              </div>
              <span class="badge badge-stable">v2.0.0 Stable</span>
            </div>
            <p style="color:var(--text-secondary); font-size:0.9375rem; line-height:1.6; margin-bottom:1.5rem;">
              ${evaLinux.short_description}
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:2rem;">
              <span class="badge badge-dev">Niri + Noctalia 5</span>
              <span class="badge badge-dev">Kitty + LazyVim</span>
              <span class="badge badge-dev">Quickshell Overlay</span>
              <span class="badge badge-dev">Zero-Risk Boot Sync</span>
            </div>
          </div>
          <div style="display:flex; gap:0.75rem;">
            <a href="./eva-linux/" class="btn btn-sm btn-primary" style="flex:1;">Explore Eva Linux</a>
            <a href="./eva-linux/releases/" class="btn btn-sm btn-secondary">Release v2.0.0</a>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- Interactive Nexora-Inspired Storytelling Section -->
  <section class="section-lg" style="position:relative;">
    <div class="container">
      <div class="story-sticky">
        <div class="story-content">
          <div class="eyebrow reveal">ECOSYSTEM FOUNDATIONS</div>
          <h2 class="title-section reveal delay-100">Designed to respect your hardware and your sovereignty.</h2>
          <p class="reveal delay-200" style="color:var(--text-secondary); font-size:1.0625rem; line-height:1.7;">
            The modern software landscape is crowded with walled gardens, forced cloud lock-ins, and opaque subscription models. AmanicX builds open, high-performance software with direct local control.
          </p>

          <div class="reveal delay-300" style="display:flex; flex-direction:column; gap:1.25rem;">
            <div style="display:flex; gap:1rem; align-items:flex-start;">
              <div style="width:28px; height:28px; border-radius:50%; background:var(--accent-surface); color:var(--accent-primary); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.875rem; flex-shrink:0;">1</div>
              <div>
                <strong style="color:var(--text-primary); display:block; margin-bottom:0.25rem;">100% Client-Side Privacy</strong>
                <p style="font-size:0.9375rem; color:var(--text-secondary);">No tracking cookies, no telemetry SDKs, no intermediary chat servers. Your keys and memory remain strictly on your device.</p>
              </div>
            </div>

            <div style="display:flex; gap:1rem; align-items:flex-start;">
              <div style="width:28px; height:28px; border-radius:50%; background:var(--accent-surface); color:var(--accent-primary); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.875rem; flex-shrink:0;">2</div>
              <div>
                <strong style="color:var(--text-primary); display:block; margin-bottom:0.25rem;">Native Risk-Gated Tool Safety</strong>
                <p style="font-size:0.9375rem; color:var(--text-secondary);">AI models only propose actions; the native OS shell approves them. High-risk operations require explicit human confirmation.</p>
              </div>
            </div>

            <div style="display:flex; gap:1rem; align-items:flex-start;">
              <div style="width:28px; height:28px; border-radius:50%; background:var(--accent-surface); color:var(--accent-primary); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.875rem; flex-shrink:0;">3</div>
              <div>
                <strong style="color:var(--text-primary); display:block; margin-bottom:0.25rem;">Native Linux & Arch Focus</strong>
                <p style="font-size:0.9375rem; color:var(--text-secondary);">Official pacman packages and single-binary AppImages built directly for Arch and Linux users without AUR bottlenecks.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="story-stage">
          <div class="story-card-3d card-glass">
            <div class="mockup-header" style="margin:-1.5rem -1.5rem 1.5rem;">
              <div class="mockup-dots">
                <span class="mockup-dot"></span>
                <span class="mockup-dot"></span>
                <span class="mockup-dot"></span>
              </div>
              <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">amanicx-core.sh</span>
              <span class="badge badge-dev" style="padding:0.15rem 0.5rem; font-size:0.7rem;">VERIFIED</span>
            </div>
            
            <p style="font-family:var(--font-mono); font-size:0.8125rem; color:var(--text-secondary); margin-bottom:1rem;">
              <span style="color:var(--accent-primary); font-weight:600;">$</span> astra status --ecosystem
            </p>

            <div style="background:var(--bg-surface-1); border-radius:var(--radius-md); padding:1rem; font-family:var(--font-mono); font-size:0.78125rem; line-height:1.7; color:var(--text-secondary); margin-bottom:1.5rem;">
              <div>[AMANICX] Local Runtime Active: Linux 6.12-arch</div>
              <div>[SECURITY] Permission Engine: STRICT (Shell Approval Enforced)</div>
              <div>[STUDIO] Eva Studio v2.2.2: Connected (Groq / Ollama Offline)</div>
              <div>[DESKTOP] Astra Assistant v0.1.0-pre.1: Ready</div>
              <div>[WORKSPACE] Eva Linux Niri Wayland Compositor: Online</div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.8125rem; color:var(--text-muted);">Universal Crimson Architecture</span>
              <a href="./apps/" class="btn btn-sm btn-primary">Open App Catalog</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Final Ecosystem CTA -->
  <section class="section" style="background:linear-gradient(180deg, var(--bg-surface-0) 0%, var(--bg-root) 100%); text-align:center; position:relative; overflow:hidden;">
    <div class="ambient-flare flare-crimson" style="bottom:-150px; left:50%; width:500px; height:500px; transform:translateX(-50%);"></div>
    <div class="container" style="position:relative; z-index:2;">
      <div class="eyebrow reveal">GET STARTED</div>
      <h2 class="title-section reveal delay-100" style="margin-bottom:1rem;">Experience the Unified Ecosystem</h2>
      <p class="lead reveal delay-200" style="margin:0 auto 2.5rem;">
        Discover applications, inspect verified changelogs, and install native packages on your preferred operating system.
      </p>
      <div class="reveal delay-300" style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        <a href="./apps/" class="btn btn-lg btn-primary">Browse All Applications</a>
        <a href="https://github.com/AmanicX" target="_blank" rel="noopener noreferrer" class="btn btn-lg btn-secondary">Visit GitHub Organization</a>
      </div>
    </div>
  </section>

  ${renderFooter('./')}
`;

  return renderHead('Unified Software Ecosystem', ecosystem.brand.description, '/', './') + content;
}

// -----------------------------------------------------------------------------
// 2. APPS CATALOG GENERATOR (/apps/)
// -----------------------------------------------------------------------------
function generateAppsPage() {
  const content = `
  ${renderNav('apps', '../')}

  <section class="section-lg" style="position:relative;">
    <div class="ambient-flare flare-crimson" style="top:-50px; right:15%; width:500px; height:500px;"></div>
    <div class="container">
      <div style="margin-bottom:3.5rem;">
        <div class="eyebrow reveal">SOFTWARE REGISTRY</div>
        <h1 class="title-section reveal delay-100" style="margin-bottom:1rem;">Application Catalog</h1>
        <p class="lead reveal delay-200">
          A centralized, searchable registry of all active projects in the AmanicX software ecosystem with verified release status and direct native download assets.
        </p>
      </div>

      <!-- Search & Filter Controls -->
      <div class="card card-glass card-filter reveal delay-300" style="margin-bottom:3rem; padding:1.25rem 1.75rem; overflow:visible; position:relative; z-index:50;">
        <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:1rem; align-items:center;">
          <div style="position:relative;">
            <input type="text" id="catalog-search" placeholder="Search by name, tags, description, or features..." 
              style="width:100%; padding:0.75rem 1rem 0.75rem 2.5rem; background:var(--bg-surface-1); border:1px solid var(--border-medium); border-radius:var(--radius-full); font-size:0.9375rem; color:var(--text-primary);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:var(--text-muted);">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          <div class="pill-dropdown" id="dropdown-category">
            <button type="button" class="pill-dropdown-trigger" aria-haspopup="listbox" aria-expanded="false" id="btn-dropdown-category">
              <span class="selected-label">All Categories</span>
              <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="pill-dropdown-menu" role="listbox">
              <div class="pill-dropdown-item active" data-value="all" role="option">All Categories</div>
              <div class="pill-dropdown-item" data-value="AI Character" role="option">AI Character &amp; Studio</div>
              <div class="pill-dropdown-item" data-value="Assistant" role="option">Desktop Assistant</div>
              <div class="pill-dropdown-item" data-value="Operating System" role="option">Operating System</div>
            </div>
            <input type="hidden" id="filter-category" value="all">
          </div>

          <div class="pill-dropdown" id="dropdown-platform">
            <button type="button" class="pill-dropdown-trigger" aria-haspopup="listbox" aria-expanded="false" id="btn-dropdown-platform">
              <span class="selected-label">All Platforms</span>
              <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="pill-dropdown-menu" role="listbox">
              <div class="pill-dropdown-item active" data-value="all" role="option">All Platforms</div>
              <div class="pill-dropdown-item" data-value="Linux" role="option">Linux (Pacman / AppImage)</div>
              <div class="pill-dropdown-item" data-value="Windows" role="option">Windows (EXE / MSI)</div>
              <div class="pill-dropdown-item" data-value="macOS" role="option">macOS (Apple Silicon)</div>
              <div class="pill-dropdown-item" data-value="Android" role="option">Android (APK)</div>
            </div>
            <input type="hidden" id="filter-platform" value="all">
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border-subtle); font-size:0.8125rem; color:var(--text-muted);">
          <span id="catalog-count">${ecosystem.projects.length} Projects Available</span>
          <span>Filtered live against verified repository metadata</span>
        </div>
      </div>

      <!-- Catalog Project List -->
      <div id="catalog-list" style="display:flex; flex-direction:column; gap:2rem;">
        ${ecosystem.projects.map(p => `
          <article class="card catalog-item reveal" 
            data-name="${p.name}" 
            data-desc="${p.short_description}" 
            data-tags="${p.tags.join(' ')}" 
            data-category="${p.category}" 
            data-platforms="${p.platforms.join(' ')}"
            style="display:grid; grid-template-columns:1fr 2fr; gap:2.5rem; align-items:center;">
            
            <div>
              <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                ${renderCatalogAppIcon(p, '../')}
                <div>
                  <h2 class="title-card" style="font-size:1.5rem;">${p.name}</h2>
                  <span style="font-size:0.8125rem; color:var(--text-muted);">${p.category}</span>
                </div>
              </div>
              <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:1.5rem;">
                <span class="badge ${p.status_code === 'stable' ? 'badge-stable' : (p.status_code === 'preview' ? 'badge-preview' : 'badge-dev')}">
                  ${p.version} &bull; ${p.status}
                </span>
                <span style="font-size:0.75rem; color:var(--text-muted);">License: ${p.license}</span>
              </div>
              <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1.5rem;">
                ${p.full_description}
              </p>
              <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                <a href="../${p.id}/" class="btn btn-sm btn-primary">Visit Project Website</a>
                <a href="../${p.id}/releases/" class="btn btn-sm btn-secondary">Downloads & Releases</a>
                <a href="../${p.id}/catalog/" class="btn btn-sm btn-ghost">Changelog</a>
              </div>
            </div>

            <div style="background:var(--bg-surface-1); border:1px solid var(--border-medium); border-radius:var(--radius-lg); padding:1.5rem;">
              <div style="font-size:0.8125rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:1rem;">Key Highlights</div>
              <ul style="list-style:none; display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1.5rem;">
                ${p.highlights.map(h => `
                  <li style="display:flex; align-items:center; gap:0.625rem; font-size:0.875rem; color:var(--text-primary);">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>${h}</span>
                  </li>
                `).join('')}
              </ul>

              <div style="font-size:0.8125rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.75rem;">Supported Platforms &amp; Direct Downloads</div>
              <div style="display:flex; flex-wrap:wrap; gap:0.45rem; margin-bottom:1.5rem;">
                ${renderPlatformCtaButtons(p)}
              </div>

              ${p.install_methods.arch ? `
                <div style="margin-top:1rem;">
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.35rem;">Quick Install (Arch Linux Native)</div>
                  <div class="cmd-box">
                    <code style="font-size:0.75rem;">${p.install_methods.arch.command}</code>
                    <button class="copy-btn" data-copy-text="${p.install_methods.arch.command}" title="Copy command" aria-label="Copy command">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                  </div>
                </div>
              ` : ''}
            </div>

          </article>
        `).join('')}
      </div>

      <!-- Empty State -->
      <div id="catalog-empty-state" class="card" style="display:none; text-align:center; padding:4rem 2rem; margin-top:2rem;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="1.5" style="margin:0 auto 1.5rem;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h3 class="title-card" style="margin-bottom:0.5rem;">No matching software found</h3>
        <p style="color:var(--text-secondary); max-width:480px; margin:0 auto 1.5rem;">We could not find any projects matching your current search or filter combination.</p>
        <button class="btn btn-secondary" onclick="document.getElementById('catalog-search').value=''; document.getElementById('filter-category').value='all'; document.getElementById('filter-platform').value='all'; document.getElementById('catalog-search').dispatchEvent(new Event('input'));">Reset All Filters</button>
      </div>

    </div>
  </section>

  ${renderFooter('../')}
`;

  return renderHead('Application Catalog', 'Search and explore all projects in the AmanicX software ecosystem.', '/apps/', '../') + content;
}

console.log('Home and Apps page generators defined.');

// -----------------------------------------------------------------------------
// 3. EVA PROJECT PAGES GENERATOR (/eva/)
// -----------------------------------------------------------------------------
function generateEvaPage() {
  const eva = ecosystem.projects.find(p => p.id === 'eva');
  const rel = releasesData.projects.eva;

  const content = `
  ${renderNav('eva', '../')}

  <!-- Eva Hero -->
  <section class="section-lg" style="position:relative; overflow:hidden;">
    <div class="ambient-flare flare-crimson" style="top:-80px; left:50%; width:600px; height:600px; transform:translateX(-50%);"></div>
    <div class="container" style="text-align:center; position:relative; z-index:2;">
      <div style="display:inline-flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;" class="reveal">
        <div style="width:48px; height:48px; position:relative; flex-shrink:0;">
          <img class="icon-theme-dark" src="../shared/assets/icons/eva-dark.png" alt="Eva Icon" width="48" height="48" style="border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.4);">
          <img class="icon-theme-light" src="../shared/assets/icons/eva-light.png" alt="Eva Icon" width="48" height="48" style="border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.1);">
        </div>
        <span class="badge badge-stable" style="font-size:0.8125rem;">${eva.version} Stable</span>
      </div>

      <h1 class="title-display reveal delay-100" style="margin-bottom:1.5rem; max-width:860px; margin-left:auto; margin-right:auto;">
        ${eva.tagline}
      </h1>
      <p class="lead reveal delay-200" style="margin:0 auto 2.5rem;">
        ${eva.short_description}
      </p>

      <div class="reveal delay-300" style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; margin-bottom:4rem;">
        <a href="#download" class="btn btn-lg btn-primary">
          <span>Download Eva ${eva.version}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>
        <a href="./catalog/" class="btn btn-lg btn-secondary">
          <span>Evolution Catalog & Changelog</span>
        </a>
      </div>

      <!-- App Showcase Preview Mockup -->
      <div class="reveal delay-400 mockup-window" style="max-width:1040px; margin:0 auto;">
        <div class="mockup-header">
          <div class="mockup-dots">
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
          </div>
          <span style="font-size:0.8125rem; color:var(--text-muted); font-family:var(--font-mono);">Eva AI Character Studio - v2.2.2</span>
          <span class="badge badge-dev" style="padding:0.15rem 0.5rem; font-size:0.7rem;">OBSIDIAN & FROSTED GLASS</span>
        </div>
        <div style="background:var(--bg-surface-0); padding:0.5rem; display:flex; justify-content:center;">
          <img src="../eva/assets/app-showcase.png" alt="Eva Studio Showcase" style="border-radius:var(--radius-md); width:100%; height:auto;">
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive 3 Studios Tab Section -->
  <section class="section" id="studios" style="background:var(--bg-surface-0); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
    <div class="container">
      <div style="text-align:center; margin-bottom:3rem;">
        <div class="eyebrow reveal">THREE DEDICATED STUDIOS</div>
        <h2 class="title-section reveal delay-100">One App. Three Creative Worlds.</h2>
        <p class="lead reveal delay-200" style="margin:1rem auto 2.5rem;">
          Eva ships with three distinct visual modes, each hand-crafted with tailored typography, background atmospherics, and customized interaction dynamics.
        </p>

        <!-- Studio Tab Buttons -->
        <div class="tabs-nav reveal delay-300" data-tabs-group="studios">
          <button class="tab-btn active" data-tab="chatbot">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Companion Chatbot</span>
          </button>
          <button class="tab-btn" data-tab="anime">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6Z"/></svg>
            <span>Anime Roleplay</span>
          </button>
          <button class="tab-btn" data-tab="world">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>World Simulator</span>
          </button>
        </div>
      </div>

      <!-- Studio Tab 1: Chatbot -->
      <div data-tab-content="studios" data-tab-pane="chatbot" class="card card-glass" style="display:block;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:center;">
          <div>
            <div class="badge badge-dev" style="margin-bottom:1rem;">STUDIO I &bull; COMPANION</div>
            <h3 class="title-section" style="font-size:2rem; margin-bottom:1rem;">Minimalist, laser-focused conversation.</h3>
            <p style="color:var(--text-secondary); line-height:1.7; margin-bottom:1.5rem;">
              Built for everyday productivity, deep discussions, and thoughtful companion interaction. Features deep obsidian surfaces, crisp typography, and an uncluttered canvas that lets ideas flow.
            </p>
            <ul style="list-style:none; display:flex; flex-direction:column; gap:0.75rem; color:var(--text-primary); font-size:0.9375rem;">
              <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Obsidian dark surfaces with low cognitive load</li>
              <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Instant switching between cloud and local Ollama models</li>
              <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Persistent conversational memory in local SQLite</li>
            </ul>
          </div>
          <div>
            <div class="mockup-window" style="background:var(--bg-surface-1); border:1px solid var(--border-medium); border-radius:var(--radius-lg); overflow:hidden; box-shadow:0 16px 40px rgba(0,0,0,0.5);">
              <div style="padding:0.75rem 1rem; background:var(--bg-surface-2); border-bottom:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between; font-size:0.75rem;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span style="width:10px; height:10px; border-radius:50%; background:#EF4444; display:inline-block;"></span>
                  <span style="width:10px; height:10px; border-radius:50%; background:#F59E0B; display:inline-block;"></span>
                  <span style="width:10px; height:10px; border-radius:50%; background:#10B981; display:inline-block;"></span>
                  <span style="font-weight:600; color:var(--text-secondary); margin-left:0.5rem;">Eva Companion &bull; Session #14</span>
                </div>
                <span class="badge badge-stable" style="font-size:0.6875rem; padding:0.15rem 0.5rem;">Groq Llama 3.3 70B &bull; 240ms</span>
              </div>
              <div style="padding:1.25rem; display:flex; flex-direction:column; gap:1rem; font-size:0.875rem;">
                <div style="align-self:flex-end; max-width:85%; background:var(--accent-surface); border:1px solid var(--border-accent); border-radius:14px 14px 2px 14px; padding:0.75rem 1rem; color:var(--text-primary);">
                  Eva, sync current conversation milestones to persistent SQLite and summarize memory state.
                </div>
                <div style="align-self:flex-start; max-width:90%; background:var(--bg-surface-0); border:1px solid var(--border-medium); border-radius:14px 14px 14px 2px; padding:0.85rem 1rem;">
                  <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem;">
                    <span style="width:6px; height:6px; border-radius:50%; background:var(--accent-primary);"></span>
                    <strong style="color:var(--accent-primary); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Eva Memory Engine</strong>
                  </div>
                  <p style="color:var(--text-secondary); font-size:0.875rem; line-height:1.5; margin:0;">
                    Memory commit complete. 14 psychological vectors synced to encrypted local database. Context affinity: 96.4%. Zero external telemetry recorded.
                  </p>
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:0.25rem;">
                  <span class="badge badge-dev" style="font-size:0.6875rem;">Ollama Offline Ready</span>
                  <span class="badge badge-dev" style="font-size:0.6875rem;">Local DB: eva_store.db</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Studio Tab 2: Anime -->
      <div data-tab-content="studios" data-tab-pane="anime" class="card card-glass" style="display:none;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:center;">
          <div>
            <div class="badge badge-dev" style="margin-bottom:1rem;">STUDIO II &bull; ANIME ROLEPLAY</div>
            <h3 class="title-section" style="font-size:2rem; margin-bottom:1rem;">Dynamic character storytelling with backdrops.</h3>
            <p style="color:var(--text-secondary); line-height:1.7; margin-bottom:1.5rem;">
              Craft and immerse yourself in canon or original anime characters with expressive dialog, visual backdrops, customizable portraits, and rich multi-turn storytelling.
            </p>
            <ul style="list-style:none; display:flex; flex-direction:column; gap:0.75rem; color:var(--text-primary); font-size:0.9375rem;">
              <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Rich character persona cards with voice & speech traits</li>
              <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Dynamic scenic backdrops and ambient mood lighting</li>
              <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Complete uncensored creative canvas on your local machine</li>
            </ul>
          </div>
          <div>
            <div class="mockup-window" style="background:var(--bg-surface-1); border:1px solid var(--border-medium); border-radius:var(--radius-lg); overflow:hidden; box-shadow:0 16px 40px rgba(0,0,0,0.5);">
              <div style="padding:0.75rem 1rem; background:var(--bg-surface-2); border-bottom:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between; font-size:0.75rem;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span style="color:var(--accent-primary); font-weight:700;">ARC III</span>
                  <span style="color:var(--text-muted);">&bull;</span>
                  <span style="color:var(--text-secondary); font-weight:500;">Scenario: Neo-Tokyo Command Outpost</span>
                </div>
                <span class="badge badge-preview" style="font-size:0.6875rem; padding:0.15rem 0.5rem;">Affection: 88% (+6)</span>
              </div>
              <div style="padding:1.25rem; display:flex; flex-direction:column; gap:1rem;">
                <div style="display:flex; gap:1rem; align-items:center; background:var(--bg-surface-0); border:1px solid var(--border-subtle); padding:0.75rem 1rem; border-radius:var(--radius-md);">
                  <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, #E11D48, #881337); display:flex; align-items:center; justify-content:center; color:#FFF; font-weight:700; font-size:0.9375rem; flex-shrink:0;">
                    AL
                  </div>
                  <div>
                    <div style="font-size:0.875rem; font-weight:700; color:var(--text-primary);">Asuka &bull; Neural Sync Pilot</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Mood: Defiant &bull; Expression: Flustered &bull; Voice: Neural JA</div>
                  </div>
                </div>
                <div style="background:var(--bg-surface-0); border-left:3px solid var(--accent-primary); padding:0.85rem 1rem; border-radius:0 var(--radius-md) var(--radius-md) 0; font-size:0.875rem; color:var(--text-secondary); line-height:1.6;">
                  <span style="color:var(--accent-hover); font-weight:600;">"Don't get the wrong idea!</span> I only routed auxiliary power to your workstation because your system crash would slow down the entire defensive grid. Don't make me repeat myself, idiot!"
                </div>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                  <span class="badge badge-dev" style="font-size:0.6875rem;">14-Field Persona</span>
                  <span class="badge badge-dev" style="font-size:0.6875rem;">Speech Habit: Tsundere</span>
                  <span class="badge badge-dev" style="font-size:0.6875rem;">Lore Lock: Persistent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Studio Tab 3: World -->
      <div data-tab-content="studios" data-tab-pane="world" class="card card-glass" style="display:none;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:center;">
          <div>
            <div class="badge badge-dev" style="margin-bottom:1rem;">STUDIO III &bull; WORLD SIMULATOR</div>
            <h3 class="title-section" style="font-size:2rem; margin-bottom:1rem;">Deep interactive narrative sandbox.</h3>
            <p style="color:var(--text-secondary); line-height:1.7; margin-bottom:1.5rem;">
              Like an interactive fanfiction and RPG engine. Tracks character reputation, world events, political factions, and persistent lore variables across sessions.
            </p>
            <ul style="list-style:none; display:flex; flex-direction:column; gap:0.75rem; color:var(--text-primary); font-size:0.9375rem;">
              <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Dynamic world state variables and event flags</li>
              <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Character relationship milestones and affinity tracking</li>
              <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Long-term memory injection across multi-turn story arcs</li>
            </ul>
          </div>
          <div>
            <div class="mockup-window" style="background:var(--bg-surface-1); border:1px solid var(--border-medium); border-radius:var(--radius-lg); overflow:hidden; box-shadow:0 16px 40px rgba(0,0,0,0.5);">
              <div style="padding:0.75rem 1rem; background:var(--bg-surface-2); border-bottom:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between; font-size:0.75rem;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span style="color:var(--accent-primary); font-weight:700;">WORLD SANDBOX</span>
                  <span style="color:var(--text-muted);">&bull;</span>
                  <span style="color:var(--text-secondary); font-weight:500;">Sector 9: Nightfall</span>
                </div>
                <span class="badge badge-dev" style="font-size:0.6875rem; padding:0.15rem 0.5rem;">Tick Rate: 1.0x &bull; Cycle 42</span>
              </div>
              <div style="padding:1.25rem; display:flex; flex-direction:column; gap:0.875rem; font-size:0.8125rem;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                  <div style="background:var(--bg-surface-0); border:1px solid var(--border-subtle); padding:0.625rem 0.85rem; border-radius:var(--radius-sm);">
                    <div style="color:var(--text-muted); font-size:0.6875rem; margin-bottom:0.25rem;">FACTION TENSION</div>
                    <div style="font-weight:700; color:#F43F5E;">High &bull; 78% Escalation</div>
                  </div>
                  <div style="background:var(--bg-surface-0); border:1px solid var(--border-subtle); padding:0.625rem 0.85rem; border-radius:var(--radius-sm);">
                    <div style="color:var(--text-muted); font-size:0.6875rem; margin-bottom:0.25rem;">PLAYER REPUTATION</div>
                    <div style="font-weight:700; color:#10B981;">Revered &bull; 92 Affinity</div>
                  </div>
                </div>
                <div style="background:var(--bg-surface-0); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:0.75rem 0.875rem; font-family:var(--font-mono); font-size:0.75rem; line-height:1.6; color:var(--text-secondary);">
                  <div style="color:var(--accent-hover);">&gt; [18:42:01] EVENT: Blackout triggered across Sector 9 power grid.</div>
                  <div style="color:var(--text-muted);">&gt; [18:42:05] LORE: The Cyber Syndicate confirms diplomatic pact.</div>
                  <div style="color:var(--text-primary);">&gt; [18:42:10] PERSIST: Story state variables written to local session.</div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted);">
                  <span>Multi-turn memory retention</span>
                  <span style="color:var(--accent-primary); font-weight:600;">3 Active Characters</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- Deep Features Grid -->
  <section class="section">
    <div class="container">
      <div style="text-align:center; margin-bottom:4rem;">
        <div class="eyebrow reveal">ENGINEERED FOR IMMERSION</div>
        <h2 class="title-section reveal delay-100">Every Detail Built for Control</h2>
      </div>

      <div class="grid-2x2">
        <div class="card reveal delay-100">
          <div class="badge badge-dev" style="margin-bottom:1rem;">14-FIELD GENERATOR</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Independent Persona Section Regeneration</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Describe any character in freeform natural language. Eva crafts a structured 14-field persona (appearance, psychology, speech habits, greeting). Regenerate any single field independently with custom instructions while preserving the rest of the character.
          </p>
        </div>

        <div class="card reveal delay-200">
          <div class="badge badge-dev" style="margin-bottom:1rem;">FROSTED ACRYLIC UI</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Frameless Translucent Design</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Modern translucent acrylic design with adaptive blur, subtle border highlights, customized accent palettes, and a blended frameless titlebar on desktop.
          </p>
        </div>

        <div class="card reveal delay-300">
          <div class="badge badge-dev" style="margin-bottom:1rem;">BYOK ARCHITECTURE</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Universal Model Freedom</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Connect directly to Groq, OpenRouter, or OpenAI via your personal API keys, or run completely offline with local models via Ollama or LM Studio. Zero intermediary proxy servers.
          </p>
        </div>

        <div class="card reveal delay-400">
          <div class="badge badge-dev" style="margin-bottom:1rem;">ANDROID 16 RUNTIME</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Edge-to-Edge Mobile APK</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Verified Android 16 (API 36) runtime compatibility with safe-area insets, immersive navigation gestures, and streamlined mobile layout that maximizes vertical conversation space.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Download & Installation Section -->
  <section class="section-lg" id="download" style="background:var(--bg-surface-0); border-top:1px solid var(--border-subtle);">
    <div class="container">
      <div style="text-align:center; margin-bottom:3.5rem;">
        <div class="eyebrow reveal">NATIVE INSTALLATION</div>
        <h2 class="title-section reveal delay-100">Get Eva ${eva.version} for Your Device</h2>
        <p class="lead reveal delay-200" style="margin:1rem auto 0;">
          All packages are verified, compiled directly from repository source, and hosted on official GitHub releases.
        </p>
        <div id="detected-os-notice" class="badge badge-dev" style="margin-top:1rem; display:none;"></div>
      </div>

      <!-- Platform Selection Tabs -->
      <div style="max-width:880px; margin:0 auto;" class="reveal delay-300">
        <div class="tabs-nav" data-tabs-group="eva-dl" style="margin-bottom:2rem; width:100%; justify-content:center; flex-wrap:wrap;">
          <button class="tab-btn active" data-tab="arch" data-platform="arch">Arch Linux (Pacman)</button>
          <button class="tab-btn" data-tab="appimage" data-platform="linux">Universal AppImage</button>
          <button class="tab-btn" data-tab="windows" data-platform="windows">Windows</button>
          <button class="tab-btn" data-tab="macos" data-platform="macos">macOS (Apple Silicon)</button>
          <button class="tab-btn" data-tab="android" data-platform="android">Android APK</button>
          <button class="tab-btn" data-tab="debian" data-platform="debian">Debian / Ubuntu</button>
        </div>

        <!-- Arch Linux Pane -->
        <div data-tab-content="eva-dl" data-tab-pane="arch" class="card card-glass" style="display:block;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 class="title-card">Arch Linux Native Pacman Install</h3>
            <span class="badge badge-stable">94.7 MB &bull; Official Package</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); margin-bottom:1rem;">
            Install Eva directly into your local pacman database without needing an AUR account or compilation:
          </p>
          <div class="cmd-box" style="margin-bottom:1.5rem;">
            <code>${eva.install_methods.arch.command}</code>
            <button class="copy-btn" data-copy-text="${eva.install_methods.arch.command}" title="Copy Command">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8125rem; color:var(--text-muted);">
            <span>Uninstall anytime: <code>sudo pacman -R eva</code></span>
            <a href="https://github.com/AmanicX/eva/releases/download/v2.2.2/eva-2.2.2.pacman" class="btn btn-sm btn-primary">Direct .pacman Download</a>
          </div>
        </div>

        <!-- Universal AppImage Pane -->
        <div data-tab-content="eva-dl" data-tab-pane="appimage" class="card card-glass" style="display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 class="title-card">Portable AppImage (Any Linux Distribution)</h3>
            <span class="badge badge-stable">132.4 MB &bull; Standalone</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); margin-bottom:1rem;">
            Download and run directly into your user-space path. No root privileges or package manager needed:
          </p>
          <div class="cmd-box" style="margin-bottom:1.5rem;">
            <code>${eva.install_methods.arch_appimage.command}</code>
            <button class="copy-btn" data-copy-text="${eva.install_methods.arch_appimage.command}" title="Copy Command">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8125rem; color:var(--text-muted);">
            <span>Launch by typing <code>eva</code> in your terminal</span>
            <a href="https://github.com/AmanicX/eva/releases/download/v2.2.2/Eva-2.2.2.AppImage" class="btn btn-sm btn-primary">Download AppImage</a>
          </div>
        </div>

        <!-- Windows Pane -->
        <div data-tab-content="eva-dl" data-tab-pane="windows" class="card card-glass" style="display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 class="title-card">Windows 10 / 11 Native Installer</h3>
            <span class="badge badge-stable">115.5 MB &bull; NSIS Setup</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); margin-bottom:1.5rem;">
            Includes automatic shortcut creation, frameless acrylic titlebar support, and integrated auto-updates.
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.8125rem; color:var(--text-muted);">Compatible with Windows 10 (1903+) and Windows 11</span>
            <a href="${eva.install_methods.windows.download_url}" class="btn btn-primary">Download Eva-Setup-2.2.2.exe</a>
          </div>
        </div>

        <!-- macOS Apple Silicon Pane -->
        <div data-tab-content="eva-dl" data-tab-pane="macos" class="card card-glass" style="display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 class="title-card">macOS Apple Silicon (M1/M2/M3/M4)</h3>
            <span class="badge badge-stable">134.9 MB &bull; ARM64 DMG</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); margin-bottom:1.5rem;">
            Optimized natively for Apple Silicon hardware. Drag Eva into your Applications folder.
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.8125rem; color:var(--text-muted);">Requires macOS 11.0 Big Sur or later</span>
            <a href="${eva.install_methods.macos.download_url}" class="btn btn-primary">Download Eva-2.2.2.dmg</a>
          </div>
        </div>

        <!-- Android Pane -->
        <div data-tab-content="eva-dl" data-tab-pane="android" class="card card-glass" style="display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 class="title-card">Android APK (Universal Native)</h3>
            <span class="badge badge-stable">3.76 MB &bull; Android 16 Ready</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); margin-bottom:1rem;">
            Direct APK download for Android phones and tablets. Features edge-to-edge layout and offline model connectivity:
          </p>
          <ol style="margin-left:1.5rem; color:var(--text-secondary); font-size:0.875rem; line-height:1.7; margin-bottom:1.5rem;">
            <li>Download <code>Eva-android.apk</code> using the button below.</li>
            <li>Tap the downloaded file in your browser or file manager.</li>
            <li>If prompted, allow "Install unknown apps" for that browser or manager.</li>
            <li>Complete installation and launch Eva.</li>
          </ol>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.8125rem; color:var(--text-muted);">Compatible with Android 8.0 up to Android 16 (API 36)</span>
            <a href="${eva.install_methods.android.download_url}" class="btn btn-primary">Download Eva-android.apk</a>
          </div>
        </div>

        <!-- Debian Pane -->
        <div data-tab-content="eva-dl" data-tab-pane="debian" class="card card-glass" style="display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 class="title-card">Ubuntu / Debian Native Package</h3>
            <span class="badge badge-stable">103.5 MB &bull; .deb</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); margin-bottom:1rem;">
            Install via dpkg with standard desktop shortcuts and mime associations:
          </p>
          <div class="cmd-box" style="margin-bottom:1.5rem;">
            <code>${eva.install_methods.debian.command}</code>
            <button class="copy-btn" data-copy-text="${eva.install_methods.debian.command}" title="Copy Command">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
          <div style="display:flex; justify-content:flex-end;">
            <a href="https://github.com/AmanicX/eva/releases/download/v2.2.2/eva_2.2.2_amd64.deb" class="btn btn-sm btn-primary">Direct .deb Download</a>
          </div>
        </div>

      </div>

      <!-- Release & Catalog Link Bar -->
      <div style="text-align:center; margin-top:3rem;">
        <a href="./releases/" class="btn btn-secondary">View Full Release History & Checksums</a>
      </div>
    </div>
  </section>

  ${renderFooter('../')}
`;

  return renderHead('Eva Studio - Characters with a world of their own', eva.full_description, '/eva/', '../', 'eva/assets/icon.png') + content;
}

// -----------------------------------------------------------------------------
// 4. EVA CATALOG & CHANGELOG GENERATOR (/eva/catalog/)
// -----------------------------------------------------------------------------
function generateEvaCatalogPage() {
  const eva = ecosystem.projects.find(p => p.id === 'eva');
  const rel = releasesData.projects.eva;

  const content = `
  ${renderNav('eva', '../../')}

  <section class="section-lg">
    <div class="container container-narrow">
      <div style="margin-bottom:3.5rem;">
        <a href="../" style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.875rem; color:var(--accent-primary); margin-bottom:1rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Eva Overview
        </a>
        <div class="eyebrow">CHRONOLOGICAL EVOLUTION</div>
        <h1 class="title-section" style="margin-bottom:1rem;">Eva Evolution & Changelog</h1>
        <p class="lead">
          A verified timeline tracing Eva's development from the initial Nexus foundations through the complete v2.2 multi-theme studio and universal packaging releases.
        </p>
      </div>

      <!-- Release Timeline List -->
      <div style="display:flex; flex-direction:column; gap:2.5rem; position:relative;">
        <div style="position:absolute; left:20px; top:10px; bottom:10px; width:2px; background:var(--border-subtle); z-index:0;"></div>

        ${rel.releases.map((r, idx) => `
          <div class="reveal" style="display:flex; gap:1.75rem; position:relative; z-index:1;">
            <div style="width:42px; height:42px; border-radius:50%; background:var(--bg-surface-0); border:2px solid var(--accent-primary); color:var(--accent-primary); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:700; font-size:0.875rem; box-shadow:0 0 12px var(--accent-glow);">
              ${idx === 0 ? '★' : (rel.releases.length - idx)}
            </div>

            <div class="card card-glass" style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <h3 class="title-card" style="font-size:1.25rem;">Release ${r.tag}</h3>
                  <span class="badge ${r.prerelease ? 'badge-preview' : 'badge-stable'}">
                    ${r.prerelease ? 'Pre-release' : 'Stable'}
                  </span>
                </div>
                <time style="font-size:0.8125rem; color:var(--text-muted);" datetime="${r.published_at}">
                  ${new Date(r.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </div>

              <div style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1.25rem;">
                ${r.body ? r.body.replace(/\n/g, '<br>') : 'Universal package verification and distribution update.'}
              </div>

              <div style="display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center;">
                <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Assets (${r.assets.length}):</span>
                ${r.assets.filter(a => a.platform !== 'meta').slice(0, 6).map(a => `
                  <a href="${a.download_url}" class="badge badge-dev" style="font-size:0.75rem;">
                    ${a.name} (${a.size_formatted})
                  </a>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="text-align:center; margin-top:4rem;">
        <a href="../releases/" class="btn btn-primary">Open Dedicated Downloads Hub</a>
      </div>
    </div>
  </section>

  ${renderFooter('../../')}
`;

  return renderHead('Eva Evolution & Changelog', 'Chronological release notes and evolution timeline for Eva Studio.', '/eva/catalog/', '../../') + content;
}

// -----------------------------------------------------------------------------
// 5. EVA RELEASES & DOWNLOADS HUB (/eva/releases/)
// -----------------------------------------------------------------------------
function generateEvaReleasesPage() {
  const eva = ecosystem.projects.find(p => p.id === 'eva');
  const rel = releasesData.projects.eva;
  const latest = rel.releases[0];

  const content = `
  ${renderNav('eva', '../../')}

  <section class="section-lg">
    <div class="container">
      <div style="text-align:center; margin-bottom:3.5rem;">
        <a href="../" style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.875rem; color:var(--accent-primary); margin-bottom:1rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Eva Overview
        </a>
        <div class="eyebrow reveal">OFFICIAL BINARY ASSETS</div>
        <h1 class="title-section reveal delay-100" style="margin-bottom:1rem;">Eva Releases & Downloads</h1>
        <p class="lead reveal delay-200" style="margin:0 auto 1.5rem;">
          Download the latest stable release (${latest.tag}) or explore verified installation commands across Arch Linux, universal AppImage, Windows, macOS, and Android.
        </p>
        <div id="detected-os-notice" class="badge badge-dev" style="display:none;"></div>
      </div>

      <!-- Latest Stable Asset Breakdown Table -->
      <div class="card card-glass reveal delay-300" style="margin-bottom:4rem; padding:2rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:2rem; border-bottom:1px solid var(--border-subtle); padding-bottom:1.5rem;">
          <div>
            <span class="badge badge-stable" style="margin-bottom:0.5rem;">LATEST STABLE &bull; ${latest.tag}</span>
            <h2 class="title-card" style="font-size:1.5rem;">Verified Release Packages</h2>
            <div style="font-size:0.8125rem; color:var(--text-muted);">Published ${new Date(latest.published_at).toLocaleString()}</div>
          </div>
          <a href="https://github.com/AmanicX/eva/releases/tag/${latest.tag}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">
            View on GitHub Releases
          </a>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.9375rem;">
            <thead>
              <tr style="border-bottom:1px solid var(--border-medium); color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.06em;">
                <th style="padding:0.75rem 1rem;">Platform</th>
                <th style="padding:0.75rem 1rem;">Package File</th>
                <th style="padding:0.75rem 1rem;">Size</th>
                <th style="padding:0.75rem 1rem;">Type</th>
                <th style="padding:0.75rem 1rem; text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${latest.assets.filter(a => a.platform !== 'meta').map(a => `
                <tr style="border-bottom:1px solid var(--border-subtle); transition:background 0.15s ease;">
                  <td style="padding:1rem; font-weight:600; text-transform:capitalize;">${a.platform}</td>
                  <td style="padding:1rem; font-family:var(--font-mono); font-size:0.875rem; color:var(--accent-hover);">${a.name}</td>
                  <td style="padding:1rem; color:var(--text-muted); font-variant-numeric:tabular-nums;">${a.size_formatted}</td>
                  <td style="padding:1rem;"><span class="badge badge-dev" style="font-size:0.7rem;">${a.pkg_type.toUpperCase()}</span></td>
                  <td style="padding:1rem; text-align:right;">
                    <a href="${a.download_url}" class="btn btn-sm btn-primary">Download</a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Command Line Install Guide -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem;" class="reveal delay-400">
        <div class="card">
          <h3 class="title-card" style="margin-bottom:0.75rem;">Arch Linux Native Install</h3>
          <p style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:1rem;">
            Single command native installation directly into pacman database:
          </p>
          <div class="cmd-box" style="margin-bottom:1rem;">
            <code style="font-size:0.8125rem;">sudo pacman -U https://github.com/AmanicX/eva/releases/download/${latest.tag}/eva-${latest.tag.replace('v','')}.pacman</code>
            <button class="copy-btn" data-copy-text="sudo pacman -U https://github.com/AmanicX/eva/releases/download/${latest.tag}/eva-${latest.tag.replace('v','')}.pacman">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted);">No AUR account required. Validates package directly against official release assets.</span>
        </div>

        <div class="card">
          <h3 class="title-card" style="margin-bottom:0.75rem;">Linux User-Space AppImage</h3>
          <p style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:1rem;">
            Single-line curl installation into user directory (~/.local/bin):
          </p>
          <div class="cmd-box" style="margin-bottom:1rem;">
            <code style="font-size:0.8125rem;">mkdir -p ~/.local/bin && curl -fsSL https://github.com/AmanicX/eva/releases/download/${latest.tag}/Eva-${latest.tag.replace('v','')}.AppImage -o ~/.local/bin/eva && chmod +x ~/.local/bin/eva</code>
            <button class="copy-btn" data-copy-text="mkdir -p ~/.local/bin && curl -fsSL https://github.com/AmanicX/eva/releases/download/${latest.tag}/Eva-${latest.tag.replace('v','')}.AppImage -o ~/.local/bin/eva && chmod +x ~/.local/bin/eva">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted);">Safe, isolated, non-root user installation. Remove by deleting <code>~/.local/bin/eva</code>.</span>
        </div>
      </div>

    </div>
  </section>

  ${renderFooter('../../')}
`;

  return renderHead(`Eva ${latest.tag} Releases & Downloads`, 'Download verified native installation packages for Eva Studio.', '/eva/releases/', '../../') + content;
}

console.log('Eva generators defined.');

// -----------------------------------------------------------------------------
// 6. ASTRA PROJECT PAGES GENERATOR (/astra/)
// -----------------------------------------------------------------------------
function generateAstraPage() {
  const astra = ecosystem.projects.find(p => p.id === 'astra');
  const rel = releasesData.projects.astra;
  const latest = rel.releases[0] || { tag: 'v0.1.0-pre.1', published_at: '2026-10-17T18:13:06Z' };

  const content = `
  ${renderNav('astra', '../')}

  <!-- Astra Hero -->
  <section class="section-lg" style="position:relative; overflow:hidden;">
    <div class="ambient-flare flare-crimson" style="top:-80px; left:50%; width:600px; height:600px; transform:translateX(-50%);"></div>
    <div class="container" style="text-align:center; position:relative; z-index:2;">
      <div style="display:inline-flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;" class="reveal">
        <img src="../shared/assets/icons/astra.png" alt="Astra Icon" width="48" height="48" style="border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.4);">
        <span class="badge badge-preview" style="font-size:0.8125rem;">${astra.version} Pre-release</span>
      </div>

      <h1 class="title-display reveal delay-100" style="margin-bottom:1.5rem; max-width:880px; margin-left:auto; margin-right:auto;">
        Permission-Safe AI Desktop Assistant
      </h1>
      <p class="lead reveal delay-200" style="margin:0 auto 2.5rem;">
        ${astra.short_description}
      </p>

      <div class="reveal delay-300" style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; margin-bottom:4rem;">
        <a href="#download" class="btn btn-lg btn-primary">
          <span>Download Astra (${latest.tag})</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>
        <a href="./catalog/" class="btn btn-lg btn-secondary">
          <span>Architecture & Changelog</span>
        </a>
      </div>

      <!-- Hero Visual Card -->
      <div class="reveal delay-400 mockup-window" style="max-width:960px; margin:0 auto;">
        <div class="mockup-header">
          <div class="mockup-dots">
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
          </div>
          <span style="font-size:0.8125rem; color:var(--text-muted); font-family:var(--font-mono);">Astra Core - Tauri v2 + Rust Bridge</span>
          <span class="badge badge-dev" style="padding:0.15rem 0.5rem; font-size:0.7rem;">RISK-GATED TOOL SYSTEM</span>
        </div>
        <div style="background:var(--bg-surface-0); padding:1rem; display:flex; justify-content:center;">
          <img src="../astra/assets/og.png" alt="Astra Assistant Visual" style="border-radius:var(--radius-md); width:100%; height:auto;">
        </div>
      </div>
    </div>
  </section>

  <!-- Risk Engine Visualizer Section -->
  <section class="section" style="background:var(--bg-surface-0); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
    <div class="container">
      <div style="text-align:center; margin-bottom:4rem;">
        <div class="eyebrow reveal">SAFETY-FIRST ARCHITECTURE</div>
        <h2 class="title-section reveal delay-100">Three-Tier Native Permission Engine</h2>
        <p class="lead reveal delay-200" style="margin:1rem auto 0;">
          Astra never gives an AI model direct keys to your operating system. Consequential actions must clear a native permission gate enforced by the desktop shell.
        </p>
      </div>

      <div class="grid-3col">
        
        <div class="card reveal delay-100">
          <div class="badge badge-stable" style="margin-bottom:1rem;">TIER 1 &bull; LOW RISK</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Read-Only System Queries</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">
            Inspecting battery status, display resolution, volume level, or active network interface. Non-destructive operations execute transparently with quiet status indicators.
          </p>
          <div style="font-family:var(--font-mono); font-size:0.78125rem; color:var(--text-muted); background:var(--bg-surface-1); padding:0.75rem; border-radius:var(--radius-sm);">
            sys_info &bull; volume_get &bull; display_status
          </div>
        </div>

        <div class="card reveal delay-200">
          <div class="badge badge-preview" style="margin-bottom:1rem;">TIER 2 &bull; MODERATE RISK</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Transient State Changes</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">
            Adjusting brightness, changing volume, launching configured applications, taking desktop screenshots, or querying external search engines. Requires ambient inline confirmation.
          </p>
          <div style="font-family:var(--font-mono); font-size:0.78125rem; color:var(--text-muted); background:var(--bg-surface-1); padding:0.75rem; border-radius:var(--radius-sm);">
            app_launch &bull; screen_capture &bull; web_research
          </div>
        </div>

        <div class="card reveal delay-300">
          <div class="badge badge-dev" style="margin-bottom:1rem;">TIER 3 &bull; HIGH RISK</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Consequential OS Operations</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">
            Executing terminal commands, modifying files, or altering system configurations. High-risk operations require explicit human confirmation with exact diff previews.
          </p>
          <div style="font-family:var(--font-mono); font-size:0.78125rem; color:var(--text-muted); background:var(--bg-surface-1); padding:0.75rem; border-radius:var(--radius-sm);">
            shell_exec &bull; file_write &bull; system_reboot
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- Astra Core Capabilities -->
  <section class="section">
    <div class="container">
      <div style="text-align:center; margin-bottom:4rem;">
        <div class="eyebrow reveal">POWERFUL TOOLS</div>
        <h2 class="title-section reveal delay-100">Work, Not Just Chat</h2>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:2.5rem;">
        <div class="card card-glass reveal delay-100">
          <h3 class="title-card" style="margin-bottom:0.75rem;">Voice Automation & Push-to-Talk</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">
            Trigger push-to-talk via global desktop hotkey. Speech is transcribed using fast Groq Whisper models, and spoken answers use neural Edge TTS with offline system-voice fallback.
          </p>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.875rem; color:var(--text-primary);">
            <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Global hotkey activation from any application</li>
            <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Natural language voice queries translated into typed tool actions</li>
          </ul>
        </div>

        <div class="card card-glass reveal delay-200">
          <h3 class="title-card" style="margin-bottom:0.75rem;">Dual Window Workspace Architecture</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">
            Switch effortlessly between a full conversation workspace (for complex research, coding tasks, and multi-turn planning) and a compact floating overlay for instantaneous quick actions.
          </p>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.875rem; color:var(--text-primary);">
            <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Compact always-on-top overlay summoned instantly</li>
            <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Full workspace window with syntax-highlighted code & history</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Download & Releases Section -->
  <section class="section-lg" id="download" style="background:var(--bg-surface-0); border-top:1px solid var(--border-subtle);">
    <div class="container">
      <div style="text-align:center; margin-bottom:3.5rem;">
        <div class="eyebrow reveal">NATIVE INSTALLATION</div>
        <h2 class="title-section reveal delay-100">Download Astra (${latest.tag})</h2>
        <p class="lead reveal delay-200" style="margin:1rem auto 0;">
          Early pre-release testing build for Windows 11 and Linux.
        </p>
        <div id="detected-os-notice" class="badge badge-dev" style="margin-top:1rem; display:none;"></div>
      </div>

      <div style="max-width:860px; margin:0 auto;" class="reveal delay-300">
        <div class="tabs-nav" data-tabs-group="astra-dl" style="margin-bottom:2rem; width:100%; justify-content:center; flex-wrap:wrap;">
          <button class="tab-btn active" data-tab="windows" data-platform="windows">Windows 11 (NSIS / MSI)</button>
          <button class="tab-btn" data-tab="appimage" data-platform="linux">Linux AppImage</button>
          <button class="tab-btn" data-tab="arch" data-platform="arch">Arch Linux Script</button>
          <button class="tab-btn" data-tab="fedora" data-platform="fedora">Fedora / RHEL RPM</button>
        </div>

        <!-- Windows Pane -->
        <div data-tab-content="astra-dl" data-tab-pane="windows" class="card card-glass" style="display:block;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 class="title-card">Windows 11 Setup Bundle</h3>
            <span class="badge badge-preview">5.99 MB &bull; Pre-release</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); margin-bottom:1.5rem;">
            Includes the NSIS setup executable. Backend compiled and verified on Windows 11 with WebView2 runtime integration.
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <span style="font-size:0.8125rem; color:var(--text-muted);">Requires Windows 11 & WebView2 runtime</span>
            <div style="display:flex; gap:0.5rem;">
              <a href="https://github.com/AmanicX/astra/releases/download/v0.1.0-pre.1/Astra_0.1.0_x64-setup.exe" class="btn btn-primary">Download .exe Setup</a>
              <a href="https://github.com/AmanicX/astra/releases/download/v0.1.0-pre.1/Astra_0.1.0_x64_en-US.msi" class="btn btn-secondary">Download .msi</a>
            </div>
          </div>
        </div>

        <!-- Linux AppImage Pane -->
        <div data-tab-content="astra-dl" data-tab-pane="appimage" class="card card-glass" style="display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 class="title-card">Universal Linux AppImage</h3>
            <span class="badge badge-preview">118.5 MB &bull; Portable</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); margin-bottom:1rem;">
            Download and run directly on Arch Linux, Fedora, Ubuntu, or Debian:
          </p>
          <div class="cmd-box" style="margin-bottom:1.5rem;">
            <code>mkdir -p ~/.local/bin && curl -fsSL https://github.com/AmanicX/astra/releases/download/v0.1.0-pre.1/Astra_0.1.0_amd64.AppImage -o ~/.local/bin/astra && chmod +x ~/.local/bin/astra</code>
            <button class="copy-btn" data-copy-text="mkdir -p ~/.local/bin && curl -fsSL https://github.com/AmanicX/astra/releases/download/v0.1.0-pre.1/Astra_0.1.0_amd64.AppImage -o ~/.local/bin/astra && chmod +x ~/.local/bin/astra">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
          <div style="display:flex; justify-content:flex-end;">
            <a href="https://github.com/AmanicX/astra/releases/download/v0.1.0-pre.1/Astra_0.1.0_amd64.AppImage" class="btn btn-primary">Direct AppImage Download</a>
          </div>
        </div>

        <!-- Arch Linux Script Pane -->
        <div data-tab-content="astra-dl" data-tab-pane="arch" class="card card-glass" style="display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 class="title-card">Arch Linux Dedicated Installer Script</h3>
            <span class="badge badge-dev">Official Script</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); margin-bottom:1rem;">
            Runs the official Arch installation script from the Astra repository to configure Astra under <code>/opt/astra</code>:
          </p>
          <div class="cmd-box" style="margin-bottom:1.5rem;">
            <code>git clone https://github.com/AmanicX/astra.git && cd astra && ./scripts/install-arch.sh</code>
            <button class="copy-btn" data-copy-text="git clone https://github.com/AmanicX/astra.git && cd astra && ./scripts/install-arch.sh">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
        </div>

        <!-- Fedora RPM Pane -->
        <div data-tab-content="astra-dl" data-tab-pane="fedora" class="card card-glass" style="display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 class="title-card">Fedora / RHEL (.rpm) Package</h3>
            <span class="badge badge-preview">8.96 MB &bull; RPM</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); margin-bottom:1rem;">
            Install directly via dnf package manager:
          </p>
          <div class="cmd-box" style="margin-bottom:1.5rem;">
            <code>sudo dnf install https://github.com/AmanicX/astra/releases/download/v0.1.0-pre.1/Astra-0.1.0-1.x86_64.rpm</code>
            <button class="copy-btn" data-copy-text="sudo dnf install https://github.com/AmanicX/astra/releases/download/v0.1.0-pre.1/Astra-0.1.0-1.x86_64.rpm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
          <div style="display:flex; justify-content:flex-end;">
            <a href="https://github.com/AmanicX/astra/releases/download/v0.1.0-pre.1/Astra-0.1.0-1.x86_64.rpm" class="btn btn-primary">Download .rpm</a>
          </div>
        </div>

      </div>

      <div style="text-align:center; margin-top:3rem;">
        <a href="./releases/" class="btn btn-secondary">View Astra Release Table</a>
      </div>
    </div>
  </section>

  ${renderFooter('../')}
`;

  return renderHead('Astra - AI Desktop Assistant', astra.full_description, '/astra/', '../', 'astra/assets/icon.png') + content;
}

// -----------------------------------------------------------------------------
// 7. ASTRA CATALOG & CHANGELOG (/astra/catalog/)
// -----------------------------------------------------------------------------
function generateAstraCatalogPage() {
  const content = `
  ${renderNav('astra', '../../')}

  <section class="section-lg">
    <div class="container container-narrow">
      <div style="margin-bottom:3.5rem;">
        <a href="../" style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.875rem; color:var(--accent-primary); margin-bottom:1rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Astra Overview
        </a>
        <div class="eyebrow">TECHNICAL ARCHITECTURE & EVOLUTION</div>
        <h1 class="title-section" style="margin-bottom:1rem;">Astra Architecture & Changelog</h1>
        <p class="lead">
          Technical specifications, system module breakdowns, and pre-release tracking for the Astra local-first AI assistant.
        </p>
      </div>

      <div class="card card-glass" style="margin-bottom:3rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 class="title-card">Release v0.1.0-pre.1 (Initial Public Pre-release)</h3>
          <span class="badge badge-preview">October 17, 2026</span>
        </div>
        <p style="color:var(--text-secondary); line-height:1.7; margin-bottom:1.5rem;">
          First public testing build introducing the Rust command bridge, Tauri v2 shell, native permission engine, and dual-window React frontend.
        </p>
        <div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.875rem; color:var(--text-primary);">
          <div>&bull; <strong>Permission Engine:</strong> Implemented typed risk classification (low/moderate/high) with modal confirmation gates.</div>
          <div>&bull; <strong>Voice Pipeline:</strong> Integrated Groq Whisper transcription and neural Edge TTS with offline system voice fallback.</div>
          <div>&bull; <strong>OS Automation:</strong> Native tools for audio, display brightness, networking, file management with backups, and authorized shell execution.</div>
          <div>&bull; <strong>Local Memory:</strong> SQLite conversation and entity memory engine storing session history and preferences locally.</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:3rem;">
        <h3 class="title-card" style="margin-bottom:1rem;">Roadmap to v0.2.0</h3>
        <p style="color:var(--text-secondary); line-height:1.7; margin-bottom:1rem;">
          Development is actively focused on expanding Linux hardware validation, deep file indexing, and autonomous coding workflows.
        </p>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.875rem; color:var(--text-secondary);">
          <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg> Wayland native screen capture bridge for Niri & Hyprland</li>
          <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg> Direct Eva Linux integration package (<code>astra-assistant</code>)</li>
          <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg> Enhanced MCP (Model Context Protocol) tool provider server</li>
        </ul>
      </div>

      <div style="text-align:center;">
        <a href="../releases/" class="btn btn-primary">Go to Astra Downloads Hub</a>
      </div>
    </div>
  </section>

  ${renderFooter('../../')}
`;

  return renderHead('Astra Architecture & Changelog', 'Changelog, module breakdown, and roadmap for Astra AI assistant.', '/astra/catalog/', '../../') + content;
}

// -----------------------------------------------------------------------------
// 8. ASTRA RELEASES & DOWNLOADS (/astra/releases/)
// -----------------------------------------------------------------------------
function generateAstraReleasesPage() {
  const rel = releasesData.projects.astra;
  const latest = rel.releases[0] || { tag: 'v0.1.0-pre.1', published_at: '2026-10-17T18:13:06Z', assets: [] };

  const content = `
  ${renderNav('astra', '../../')}

  <section class="section-lg">
    <div class="container">
      <div style="text-align:center; margin-bottom:3.5rem;">
        <a href="../" style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.875rem; color:var(--accent-primary); margin-bottom:1rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Astra Overview
        </a>
        <div class="eyebrow reveal">TESTING BUILDS</div>
        <h1 class="title-section reveal delay-100" style="margin-bottom:1rem;">Astra Releases & Assets</h1>
        <p class="lead reveal delay-200" style="margin:0 auto 1.5rem;">
          Verified pre-release assets for Astra desktop assistant (${latest.tag}).
        </p>
        <div id="detected-os-notice" class="badge badge-dev" style="display:none;"></div>
      </div>

      <div class="card card-glass reveal delay-300" style="margin-bottom:3rem; padding:2rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; border-bottom:1px solid var(--border-subtle); padding-bottom:1.25rem;">
          <div>
            <span class="badge badge-preview">PRE-RELEASE &bull; ${latest.tag}</span>
            <h2 class="title-card" style="font-size:1.5rem; margin-top:0.35rem;">Available Assets</h2>
          </div>
          <a href="https://github.com/AmanicX/astra/releases/tag/${latest.tag}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">
            View on GitHub Releases
          </a>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.9375rem;">
            <thead>
              <tr style="border-bottom:1px solid var(--border-medium); color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">
                <th style="padding:0.75rem 1rem;">Platform</th>
                <th style="padding:0.75rem 1rem;">Package Name</th>
                <th style="padding:0.75rem 1rem;">Size</th>
                <th style="padding:0.75rem 1rem;">Format</th>
                <th style="padding:0.75rem 1rem; text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${latest.assets.map(a => `
                <tr style="border-bottom:1px solid var(--border-subtle);">
                  <td style="padding:1rem; font-weight:600; text-transform:capitalize;">${a.platform}</td>
                  <td style="padding:1rem; font-family:var(--font-mono); font-size:0.875rem; color:var(--accent-hover);">${a.name}</td>
                  <td style="padding:1rem; color:var(--text-muted); font-variant-numeric:tabular-nums;">${a.size_formatted}</td>
                  <td style="padding:1rem;"><span class="badge badge-dev" style="font-size:0.7rem;">${a.pkg_type.toUpperCase()}</span></td>
                  <td style="padding:1rem; text-align:right;">
                    <a href="${a.download_url}" class="btn btn-sm btn-primary">Download</a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  ${renderFooter('../../')}
`;

  return renderHead(`Astra ${latest.tag} Releases`, 'Download official pre-release builds of Astra AI assistant.', '/astra/releases/', '../../') + content;
}

// -----------------------------------------------------------------------------
// 9. EVA LINUX PROJECT PAGES GENERATOR (/eva-linux/)
// -----------------------------------------------------------------------------
function generateEvaLinuxPage() {
  const evaLinux = ecosystem.projects.find(p => p.id === 'eva-linux');

  const content = `
  ${renderNav('eva-linux', '../')}

  <!-- Eva Linux Hero -->
  <section class="section-lg" style="position:relative; overflow:hidden;">
    <div class="ambient-flare flare-crimson" style="top:-80px; left:50%; width:650px; height:650px; transform:translateX(-50%);"></div>
    <div class="container" style="text-align:center; position:relative; z-index:2;">
      <div style="display:inline-flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;" class="reveal">
        <img src="../shared/assets/icons/eva-linux.svg" alt="Eva Linux Logo" width="48" height="48" style="border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.4);">
        <span class="badge badge-stable" style="font-size:0.8125rem;">${evaLinux.version} Stable</span>
      </div>

      <h1 class="title-display reveal delay-100" style="margin-bottom:1.5rem; max-width:920px; margin-left:auto; margin-right:auto;">
        ${evaLinux.tagline}
      </h1>
      <p class="lead reveal delay-200" style="margin:0 auto 2.5rem; max-width:820px;">
        ${evaLinux.short_description}
      </p>

      <div class="reveal delay-300" style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; margin-bottom:4rem;">
        <a href="#install" class="btn btn-lg btn-primary">
          <span>Quick Installation</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a href="./releases/" class="btn btn-lg btn-secondary">
          <span>Release v2.0.0 Notes</span>
        </a>
      </div>

      <!-- Desktop Screenshot Preview -->
      <div class="reveal delay-400 mockup-window" style="max-width:1080px; margin:0 auto;">
        <div class="mockup-header">
          <div class="mockup-dots">
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
          </div>
          <span style="font-size:0.8125rem; color:var(--text-muted); font-family:var(--font-mono);">Eva Linux - Niri Wayland Compositor + Noctalia 5</span>
          <span class="badge badge-stable" style="padding:0.15rem 0.5rem; font-size:0.7rem;">v2.0.0 STABLE</span>
        </div>
        <div style="background:var(--bg-surface-0); padding:0.5rem; display:flex; justify-content:center;">
          <picture>
            <source srcset="../eva-linux/assets/screenshot-desktop.webp" type="image/webp">
            <img src="../eva-linux/assets/screenshot-desktop.jpg" alt="Eva Linux Desktop with Niri, Noctalia 5, and Kitty" style="border-radius:var(--radius-md); width:100%; height:auto;" loading="eager">
          </picture>
        </div>
        <div class="preview-caption">
          <span>Genuine desktop capture of Eva Linux v2: Niri infinite horizontal scrollable tiling, Noctalia 5 floating capsule bar, and Tokyo-Night Kitty terminal.</span>
          <div class="keybind-pill" title="Toggle Application Launcher">
            <kbd>Super</kbd><span class="pill-sep">+</span><kbd>Space</kbd>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Architectural Pillars -->
  <section class="section" style="background:var(--bg-surface-0); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
    <div class="container">
      <div style="text-align:center; margin-bottom:4rem;">
        <div class="eyebrow reveal">CURATED ARCHITECTURE</div>
        <h2 class="title-section reveal delay-100">Engineered for Velocity & Aesthetics</h2>
        <p class="lead reveal delay-200" style="margin:1rem auto 0; max-width:760px;">
          Eva Linux transforms a minimal Arch Linux installation into a turnkey Wayland powerhouse without bloating your system or enforcing rigid black boxes.
        </p>
      </div>

      <div class="grid-2x2">
        
        <div class="card reveal delay-100">
          <div class="badge badge-dev" style="margin-bottom:1rem;">WINDOW COMPOSITOR</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Niri Scrollable Tiling</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Windows arrange along an infinite horizontal ribbon with smooth spring animations. Preset column widths (33%, 50%, 66%) keep workspaces organized without window squishing or manual layout juggling.
          </p>
        </div>

        <div class="card reveal delay-200">
          <div class="badge badge-dev" style="margin-bottom:1rem;">DESKTOP SHELL</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Noctalia 5 Wayland Shell</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Integrated status capsule bar, system monitor widgets, network flyouts, volume controls, media player, and responsive application launcher triggered via <code>Super + Space</code>.
          </p>
        </div>

        <div class="card reveal delay-300">
          <div class="badge badge-dev" style="margin-bottom:1rem;">DEVELOPER CORE</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Kitty + LazyVim + Fastfetch</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Kitty GPU terminal styled with Tokyo-Night palette and JetBrains Mono Nerd Font, paired with a fully configured LazyVim IDE and custom Fastfetch system diagnostics.
          </p>
        </div>

        <div class="card reveal delay-400">
          <div class="badge badge-dev" style="margin-bottom:1rem;">ZERO-RISK SYNC</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">SilentSDDM & HyperFluent GRUB</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Pure upstream display manager and bootloader themes. The <code>eva-wallpaper-sync</code> utility automatically keeps SDDM and GRUB backgrounds synchronized with Noctalia without dangerous <code>grub-mkconfig</code> rebuilds.
          </p>
        </div>

      </div>
    </div>
  </section>

  <!-- Interactive Quickshell Overlay Spotlight -->
  <section class="section-lg" style="position:relative; overflow:hidden;">
    <div class="container">
      <div style="text-align:center; margin-bottom:3.5rem;">
        <div class="eyebrow reveal">INSTANT DESKTOP MASTERY</div>
        <h2 class="title-section reveal delay-100" style="margin-bottom:1rem;">Interactive Quickshell Cheatsheet</h2>
        <p class="lead reveal delay-200" style="margin:0 auto; max-width:760px;">
          Never memorize keybind manuals again. A native Wayland overlay dynamically renders every desktop, compositor, and application shortcut with live search and physical key recording.
        </p>
      </div>

      <div class="reveal delay-300 mockup-window" style="max-width:960px; margin:0 auto 3rem;">
        <div class="mockup-header">
          <div class="mockup-dots">
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
          </div>
          <span style="font-size:0.8125rem; color:var(--text-muted); font-family:var(--font-mono);">Quickshell Cheatsheet & Keybind Manager</span>
          <span class="badge badge-dev" style="padding:0.15rem 0.5rem; font-size:0.7rem;">WAYLAND OVERLAY</span>
        </div>
        <div style="background:var(--bg-surface-0); padding:0.5rem; display:flex; justify-content:center;">
          <picture>
            <source srcset="../eva-linux/assets/screenshot-keybinds.webp" type="image/webp">
            <img src="../eva-linux/assets/screenshot-keybinds.png" alt="Quickshell Keybind Cheatsheet Overlay" style="border-radius:var(--radius-md); width:100%; height:auto;" loading="lazy">
          </picture>
        </div>
        <div class="preview-caption">
          <span>Active keybind cheatsheet and shortcut manager triggered instantly from anywhere in the desktop.</span>
          <div class="keybind-pill" title="Trigger Keybind Overlay">
            <kbd>Super</kbd><span class="pill-sep">+</span><kbd>Shift</kbd><span class="pill-sep">+</span><kbd>/</kbd>
          </div>
        </div>
      </div>

      <div class="grid-3col">
        <div class="card card-glass">
          <div style="font-weight:700; font-size:1rem; margin-bottom:0.5rem; color:var(--text-primary);">Searchable Hotkey Groups</div>
          <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6;">
            Instant fuzzy filtering across 120 keybind actions: Window Management, Workspaces, Audio & Media, Launchers, and System Control.
          </p>
        </div>

        <div class="card card-glass">
          <div style="font-weight:700; font-size:1rem; margin-bottom:0.5rem; color:var(--text-primary);">In-Place Keybind Editor</div>
          <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6;">
            Click Edit directly in the overlay, press your new key combination, and save safely without risking malformed syntax in <code>config.kdl</code>.
          </p>
        </div>

        <div class="card card-glass">
          <div style="font-weight:700; font-size:1rem; margin-bottom:0.5rem; color:var(--text-primary);">Hardware Conflict Warning</div>
          <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6;">
            Real-time conflict detection alerts you before assigning an already-mapped key combination, preventing compositor lockout.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Hardware Requirements & Installation Walkthrough -->
  <section class="section-lg" id="install" style="background:var(--bg-surface-0); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
    <div class="container container-narrow">
      <div style="margin-bottom:3.5rem; text-align:center;">
        <div class="eyebrow reveal">INSTALLATION & REQUIREMENTS</div>
        <h2 class="title-section reveal delay-100" style="margin-bottom:1rem;">System Compatibility & Setup</h2>
        <p class="lead reveal delay-200" style="margin:0 auto; max-width:680px;">
          Eva Linux transforms an existing Arch Linux base install into a complete Wayland desktop.
        </p>
      </div>

      <!-- Notice Alert -->
      <div class="card card-glass reveal delay-300" style="border-left:4px solid var(--accent-primary); margin-bottom:2.5rem; padding:1.25rem 1.75rem;">
        <div style="display:flex; align-items:center; gap:0.75rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>Installer Notice: Not an ISO Distribution</span>
        </div>
        <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6; margin:0;">
          Eva Linux is a modular, script-based setup installer. Run it inside an existing Arch Linux, EndeavourOS, or CachyOS installation to automatically configure packages, user environment, Wayland compositors, and themes.
        </p>
      </div>

      <!-- Requirements Table -->
      <div class="card card-glass reveal delay-350" style="margin-bottom:3rem;">
        <h3 class="title-card" style="margin-bottom:1.25rem;">Hardware & Environment Requirements</h3>
        <div style="display:flex; flex-direction:column; gap:0.875rem; font-size:0.9375rem;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
            <span style="color:var(--text-muted);">Base Operating System</span>
            <span style="font-weight:600; color:var(--accent-primary);">Arch Linux, EndeavourOS, or CachyOS</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
            <span style="color:var(--text-muted);">Architecture</span>
            <span style="font-weight:600;">64-bit x86_64</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
            <span style="color:var(--text-muted);">Memory (RAM)</span>
            <span style="font-weight:600;">4 GB minimum (8 GB recommended)</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
            <span style="color:var(--text-muted);">Storage Space</span>
            <span style="font-weight:600;">20 GB free disk space</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
            <span style="color:var(--text-muted);">Graphics Stack</span>
            <span style="font-weight:600;">AMD (amdgpu/vulkan), Intel (mesa/vulkan), or NVIDIA (550xx+)</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted);">Safety Guarantee</span>
            <span style="font-weight:600; color:#10B981;">Automated configuration backup &amp; instant rollback (eva-restore)</span>
          </div>
        </div>
      </div>

      <!-- Installation Steps -->
      <div class="card reveal delay-400">
        <h3 class="title-card" style="margin-bottom:1.25rem;">Installation Instructions</h3>
        
        <div style="margin-bottom:1.75rem;">
          <div style="font-size:0.875rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">Method 1: One-Line Quick Bootstrap (Recommended)</div>
          <p style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:0.75rem;">
            Downloads and executes the modular installer directly in your terminal:
          </p>
          <div class="cmd-box">
            <code>curl -fsSL https://raw.githubusercontent.com/AmanicX/eva-linux/main/install.sh | bash</code>
            <button class="copy-btn" data-copy-text="curl -fsSL https://raw.githubusercontent.com/AmanicX/eva-linux/main/install.sh | bash" title="Copy command">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
        </div>

        <div style="margin-bottom:2rem;">
          <div style="font-size:0.875rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">Method 2: Clone Repository &amp; Run Locally</div>
          <p style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:0.75rem;">
            Inspect modules, configs, and themes before executing:
          </p>
          <div class="cmd-box">
            <code>git clone https://github.com/AmanicX/eva-linux.git &amp;&amp; cd eva-linux &amp;&amp; ./setup.sh</code>
            <button class="copy-btn" data-copy-text="git clone https://github.com/AmanicX/eva-linux.git &amp;&amp; cd eva-linux &amp;&amp; ./setup.sh" title="Copy command">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
        </div>

        <div style="background:var(--bg-surface-1); border-radius:var(--radius-md); padding:1.25rem; font-size:0.875rem; line-height:1.6; color:var(--text-secondary); margin-bottom:2rem;">
          <strong style="color:var(--text-primary); display:block; margin-bottom:0.5rem;">What happens during setup?</strong>
          <ul style="margin-left:1.25rem; display:flex; flex-direction:column; gap:0.35rem;">
            <li>Pre-flight system checks verify distribution, architecture, and network.</li>
            <li>Existing configurations in <code>~/.config/</code> are backed up with a timestamped manifest.</li>
            <li>Packages for Niri, Noctalia 5, Kitty, LazyVim, and Quickshell are verified or installed.</li>
            <li>SilentSDDM and HyperFluent GRUB themes are deployed optionally without breaking boot records.</li>
            <li>You are prompted to review every step; no unexpected changes are forced.</li>
          </ul>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <a href="./catalog/" class="btn btn-secondary">Inspect Component Architecture</a>
          <a href="./releases/" class="btn btn-primary">Eva Linux v2.0.0 Releases</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Upstream Credits & Attribution -->
  <section class="section" style="text-align:center;">
    <div class="container container-narrow">
      <div class="eyebrow reveal">OPEN SOURCE ECOSYSTEM</div>
      <h2 class="title-section reveal delay-100" style="margin-bottom:1rem;">Built on Great Foundations</h2>
      <p class="lead reveal delay-200" style="margin:0 auto 2.5rem; font-size:1rem;">
        Eva Linux stands on the shoulders of these incredible upstream open-source projects:
      </p>

      <div style="display:flex; flex-wrap:wrap; gap:0.75rem; justify-content:center; margin-bottom:3rem;">
        <span class="badge badge-dev" style="padding:0.4rem 0.85rem; font-size:0.8125rem;">Niri by YaLTeR</span>
        <span class="badge badge-dev" style="padding:0.4rem 0.85rem; font-size:0.8125rem;">Noctalia Shell Team</span>
        <span class="badge badge-dev" style="padding:0.4rem 0.85rem; font-size:0.8125rem;">Kitty by Kovid Goyal</span>
        <span class="badge badge-dev" style="padding:0.4rem 0.85rem; font-size:0.8125rem;">LazyVim by Folke Lemaitre</span>
        <span class="badge badge-dev" style="padding:0.4rem 0.85rem; font-size:0.8125rem;">Quickshell by outfoxxed</span>
        <span class="badge badge-dev" style="padding:0.4rem 0.85rem; font-size:0.8125rem;">SilentSDDM by uiramaru</span>
        <span class="badge badge-dev" style="padding:0.4rem 0.85rem; font-size:0.8125rem;">HyperFluent GRUB by Coopydood</span>
      </div>

      <a href="https://github.com/AmanicX/eva-linux" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
        Star Eva Linux on GitHub
      </a>
    </div>
  </section>

  ${renderFooter('../')}
`;

  return renderHead('Eva Linux - Curated Wayland Desktop for Power Users', evaLinux.full_description, '/eva-linux/', '../', 'eva-linux/assets/screenshot-desktop.jpg') + content;
}

// -----------------------------------------------------------------------------
// 10. EVA LINUX CATALOG & ARCHITECTURE (/eva-linux/catalog/)
// -----------------------------------------------------------------------------
function generateEvaLinuxCatalogPage() {
  const content = `
  ${renderNav('eva-linux', '../../')}

  <section class="section-lg">
    <div class="container container-narrow">
      <div style="margin-bottom:3.5rem;">
        <a href="../" style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.875rem; color:var(--accent-primary); margin-bottom:1rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Eva Linux Overview
        </a>
        <div class="eyebrow">SYSTEM COMPONENTS &amp; SCRIPTS</div>
        <h1 class="title-section" style="margin-bottom:1rem;">Eva Linux Architecture Catalog</h1>
        <p class="lead">
          Eva Linux delivers a modular, script-driven stack where each desktop component is independent, inspectable, and safely upgradeable.
        </p>
      </div>

      <div style="display:flex; flex-direction:column; gap:2rem;">
        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">eva-core (Installer &amp; Setup Engine)</h3>
            <span class="badge badge-stable">CORE ENGINE</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            The modular execution runner (<code>install.sh</code> and <code>setup.sh</code>) driving pre-flight validation, package installation via pacman and yay, dotfile symlinking, backup manifest logging, and automated recovery handlers.
          </p>
        </div>

        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">niri-workstation (Infinite Scrollable Compositor)</h3>
            <span class="badge badge-stable">WAYLAND</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Niri scrollable tiling compositor configuration (<code>~/.config/niri/config.kdl</code>), tuned spring animation physics, column preset rules (33%, 50%, 66%), multi-monitor workspace boundaries, and trackpad gesture mappings.
          </p>
        </div>

        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">noctalia-shell (Desktop Shell &amp; Widgets)</h3>
            <span class="badge badge-stable">SHELL</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Noctalia 5 desktop shell integrating the top status capsule bar, quick settings flyout, PipeWire audio mixer, MPRIS media playback widget, and application launcher triggered by <code>Super + Space</code>.
          </p>
        </div>

        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">quickshell-overlay (Interactive Keybind Cheatsheet)</h3>
            <span class="badge badge-stable">OVERLAY</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Interactive Wayland overlay triggered via <code>Super + Shift + /</code> that renders searchable hotkey categories, real-time conflict indicators, and physical key recording for fast customization.
          </p>
        </div>

        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">terminal-dev (Kitty &amp; LazyVim)</h3>
            <span class="badge badge-stable">DEV TOOLS</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            GPU-accelerated Kitty terminal configured with Tokyo-Night palette, JetBrains Mono Nerd Font, Fastfetch system diagnostics, and LazyVim IDE pre-configured with Treesitter and LSP support.
          </p>
        </div>

        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">eva-wallpaper-sync (Zero-Risk Bootloader Sync)</h3>
            <span class="badge badge-stable">UTILITY</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Safe synchronization utility that extracts Noctalia's active desktop wallpaper and seamlessly updates SilentSDDM and HyperFluent GRUB background images directly in place without dangerous <code>grub-mkconfig</code> rebuilds.
          </p>
        </div>

        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">eva-restore (Automated Rollback Engine)</h3>
            <span class="badge badge-stable">SAFETY</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Instant rollback tool located in <code>bin/eva-restore</code>. Restores previous desktop configurations from timestamped tarball archives generated automatically prior to any installer execution.
          </p>
        </div>

        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">Optional Themes (SilentSDDM, HyperFluent GRUB, Plymouth)</h3>
            <span class="badge badge-preview">OPTIONAL</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Modular styling packages for your login screen and boot sequence. Users choose whether to install or omit each component during the interactive setup process.
          </p>
        </div>
      </div>

      <div style="text-align:center; margin-top:3.5rem;">
        <a href="../releases/" class="btn btn-primary">Eva Linux v2.0.0 Releases</a>
      </div>
    </div>
  </section>

  ${renderFooter('../../')}
`;

  return renderHead('Eva Linux Component Architecture', 'Technical architecture and modular components of Eva Linux.', '/eva-linux/catalog/', '../../') + content;
}

// -----------------------------------------------------------------------------
// 11. EVA LINUX RELEASES & CHANGELOG (/eva-linux/releases/)
// -----------------------------------------------------------------------------
function generateEvaLinuxReleasesPage() {
  const content = `
  ${renderNav('eva-linux', '../../')}

  <section class="section-lg">
    <div class="container container-narrow">
      <div style="text-align:center; margin-bottom:3.5rem;">
        <a href="../" style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.875rem; color:var(--accent-primary); margin-bottom:1rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Eva Linux Overview
        </a>
        <div class="eyebrow reveal">OFFICIAL RELEASES &amp; CHANGELOG</div>
        <h1 class="title-section reveal delay-100" style="margin-bottom:1rem;">Eva Linux Releases Hub</h1>
        <p class="lead reveal delay-200" style="margin:0 auto; max-width:680px;">
          Eva Linux v2.0.0 marks a complete architectural transformation from monolithic scripts into a modular, reliable, and verified Wayland desktop installer.
        </p>
      </div>

      <!-- Release v2.0.0 Stable Card -->
      <div class="card card-glass" style="margin-bottom:2.5rem; border:1px solid var(--border-medium);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem;">
          <div>
            <h2 class="title-card" style="font-size:1.5rem; margin-bottom:0.25rem;">Eva Linux v2.0.0 Stable</h2>
            <span style="font-size:0.8125rem; color:var(--text-muted);">Published on November 20, 2026 &bull; Production Release</span>
          </div>
          <span class="badge badge-stable" style="font-size:0.8125rem;">v2.0.0 Stable</span>
        </div>

        <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.7; margin-bottom:1.5rem;">
          Eva Linux v2.0.0 represents a complete system refactoring. Every component has been audited, rewritten into modular units, tested on live Arch Linux installations, and integrated with upstream repositories.
        </p>

        <div style="font-size:0.8125rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.75rem;">Key Enhancements in v2.0.0</div>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:0.6rem; font-size:0.875rem; color:var(--text-secondary); margin-bottom:1.75rem;">
          <li style="display:flex; align-items:flex-start; gap:0.6rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5" style="margin-top:2px; flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>Modular Architecture:</strong> Split the installer into decoupled modules for preflight, packages, compositor, shell, terminal, editor, bootloader, and theme configurations.</span>
          </li>
          <li style="display:flex; align-items:flex-start; gap:0.6rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5" style="margin-top:2px; flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>Zero-Risk Wallpaper Sync:</strong> <code>eva-wallpaper-sync</code> replaces the active wallpaper across SilentSDDM and HyperFluent GRUB without dangerous <code>grub-mkconfig</code> executions.</span>
          </li>
          <li style="display:flex; align-items:flex-start; gap:0.6rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5" style="margin-top:2px; flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>Quickshell Cheatsheet Overlay:</strong> Instant <code>Super + Shift + /</code> overlay with searchable categories, keybind conflict detection, and physical key recording.</span>
          </li>
          <li style="display:flex; align-items:flex-start; gap:0.6rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5" style="margin-top:2px; flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>Automated Backup &amp; Rollback:</strong> Automated timestamped tarball backups of existing dotfiles and one-command restoration via <code>eva-restore</code>.</span>
          </li>
          <li style="display:flex; align-items:flex-start; gap:0.6rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5" style="margin-top:2px; flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>Pure Upstream Repositories:</strong> Replaced bloated or modified forks with official pure upstream releases for SilentSDDM, HyperFluent GRUB, and Plymouth.</span>
          </li>
        </ul>

        <div style="font-size:0.8125rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.5rem;">Quick Bootstrap Command</div>
        <div class="cmd-box" style="margin-bottom:1.5rem;">
          <code>curl -fsSL https://raw.githubusercontent.com/AmanicX/eva-linux/main/install.sh | bash</code>
          <button class="copy-btn" data-copy-text="curl -fsSL https://raw.githubusercontent.com/AmanicX/eva-linux/main/install.sh | bash" title="Copy command">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <a href="https://github.com/AmanicX/eva-linux/releases/tag/v2.0.0" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            View Release Tag on GitHub
          </a>
          <a href="https://github.com/AmanicX/eva-linux" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
            Inspect Repository Source
          </a>
        </div>
      </div>

      <div style="text-align:center;">
        <a href="https://github.com/AmanicX/eva-linux" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">
          Visit GitHub Repository &bull; AmanicX/eva-linux
        </a>
      </div>
    </div>
  </section>

  ${renderFooter('../../')}
`;

  return renderHead('Eva Linux v2.0.0 Stable Releases', 'Download and installation instructions for Eva Linux v2.0.0 Stable.', '/eva-linux/releases/', '../../') + content;
}

// -----------------------------------------------------------------------------
// 12. 404 NOT FOUND PAGE GENERATOR (/404.html)
// -----------------------------------------------------------------------------
function generate404Page() {
  const content = `
  ${renderNav('', './')}

  <section class="section-lg" style="text-align:center; min-height:60vh; display:flex; align-items:center;">
    <div class="container">
      <div class="eyebrow">404 &bull; ROUTE NOT FOUND</div>
      <h1 class="title-display" style="margin-bottom:1rem; font-size:3.5rem;">Lost in the Ecosystem</h1>
      <p class="lead" style="margin:0 auto 2.5rem;">
        The page or application route you requested does not exist or has moved.
      </p>
      <div style="display:flex; justify-content:center; gap:1rem;">
        <a href="./" class="btn btn-primary">Return to Ecosystem Home</a>
        <a href="./apps/" class="btn btn-secondary">Explore Application Catalog</a>
      </div>
    </div>
  </section>

  ${renderFooter('./')}
`;

  return renderHead('Page Not Found', 'The requested page was not found.', '/404.html', './') + content;
}

// -----------------------------------------------------------------------------
// 13. SITEMAP & ROBOTS GENERATOR
// -----------------------------------------------------------------------------
function generateSitemap() {
  const routes = [
    '',
    'apps/',
    'eva/',
    'eva/catalog/',
    'eva/releases/',
    'astra/',
    'astra/catalog/',
    'astra/releases/',
    'eva-linux/',
    'eva-linux/catalog/',
    'eva-linux/releases/'
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>https://amanicx.github.io/${r}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${r === '' || r === 'apps/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${r === '' ? '1.0' : (r.endsWith('/') && !r.includes('/catalog/') && !r.includes('/releases/') ? '0.8' : '0.6')}</priority>
  </url>`).join('\n')}
</urlset>`;
}

function generateRobots() {
  return `User-agent: *
Allow: /

Sitemap: https://amanicx.github.io/sitemap.xml
`;
}

// -----------------------------------------------------------------------------
// MAIN COMPILER EXECUTION
// -----------------------------------------------------------------------------
function buildAll() {
  console.log('🚀 Compiling AmanicX Unified Ecosystem Website...');

  const pages = [
    { path: join(ROOT, 'index.html'), html: generateHomePage() },
    { path: join(ROOT, 'apps/index.html'), html: generateAppsPage() },
    { path: join(ROOT, 'eva/index.html'), html: generateEvaPage() },
    { path: join(ROOT, 'eva/catalog/index.html'), html: generateEvaCatalogPage() },
    { path: join(ROOT, 'eva/releases/index.html'), html: generateEvaReleasesPage() },
    { path: join(ROOT, 'astra/index.html'), html: generateAstraPage() },
    { path: join(ROOT, 'astra/catalog/index.html'), html: generateAstraCatalogPage() },
    { path: join(ROOT, 'astra/releases/index.html'), html: generateAstraReleasesPage() },
    { path: join(ROOT, 'eva-linux/index.html'), html: generateEvaLinuxPage() },
    { path: join(ROOT, 'eva-linux/catalog/index.html'), html: generateEvaLinuxCatalogPage() },
    { path: join(ROOT, 'eva-linux/releases/index.html'), html: generateEvaLinuxReleasesPage() },
    { path: join(ROOT, '404.html'), html: generate404Page() }
  ];

  for (const page of pages) {
    mkdirSync(dirname(page.path), { recursive: true });
    writeFileSync(page.path, page.html, 'utf-8');
    console.log(`  ✓ Generated ${page.path.replace(ROOT + '/', '')}`);
  }

  writeFileSync(join(ROOT, 'sitemap.xml'), generateSitemap(), 'utf-8');
  console.log('  ✓ Generated sitemap.xml');

  writeFileSync(join(ROOT, 'robots.txt'), generateRobots(), 'utf-8');
  console.log('  ✓ Generated robots.txt');

  // Create .nojekyll for GitHub Pages
  writeFileSync(join(ROOT, '.nojekyll'), '# Disable Jekyll for GitHub Pages\n', 'utf-8');
  console.log('  ✓ Created .nojekyll');

  console.log('✨ Build completed successfully!');
}

buildAll();
