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
        <a href="${prefix}astra-os/" class="nav-link ${activeRoute === 'astra-os' ? 'active' : ''}">AstraOS</a>
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
            <li><a href="${prefix}astra-os/">AstraOS Linux</a></li>
            <li><a href="${prefix}apps/">Application Catalog</a></li>
          </ul>
        </div>

        <div>
          <div class="footer-title">Releases & Docs</div>
          <ul class="footer-links">
            <li><a href="${prefix}eva/releases/">Eva Downloads (v2.2.2)</a></li>
            <li><a href="${prefix}astra/releases/">Astra Downloads (v0.1.0-pre)</a></li>
            <li><a href="${prefix}astra-os/releases/">AstraOS Build & ISO</a></li>
            <li><a href="${prefix}eva/catalog/">Eva Evolution Catalog</a></li>
            <li><a href="${prefix}astra/catalog/">Astra Architecture</a></li>
          </ul>
        </div>

        <div>
          <div class="footer-title">Community & Source</div>
          <ul class="footer-links">
            <li><a href="https://github.com/AmanicX" target="_blank" rel="noopener noreferrer">GitHub Organization</a></li>
            <li><a href="https://github.com/AmanicX/eva" target="_blank" rel="noopener noreferrer">Eva Repository</a></li>
            <li><a href="https://github.com/AmanicX/astra" target="_blank" rel="noopener noreferrer">Astra Repository</a></li>
            <li><a href="https://github.com/AmanicX/astra-os" target="_blank" rel="noopener noreferrer">AstraOS Repository</a></li>
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

// -----------------------------------------------------------------------------
// 1. HOME PAGE GENERATOR (/)
// -----------------------------------------------------------------------------
function generateHomePage() {
  const eva = ecosystem.projects.find(p => p.id === 'eva');
  const astra = ecosystem.projects.find(p => p.id === 'astra');
  const astraOs = ecosystem.projects.find(p => p.id === 'astra-os');

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
      <div class="card card-glass reveal delay-400" style="display:inline-flex; align-items:center; gap:1.5rem; padding:0.875rem 1.75rem; border-radius:var(--radius-full); max-width:100%; overflow-x:auto;">
        <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.8125rem; font-weight:600; color:var(--accent-primary);">
          <span style="width:8px; height:8px; border-radius:50%; background:var(--accent-primary); animation:ambient-pulse 2s infinite;"></span>
          LIVE UPDATES
        </div>
        <div style="height:14px; width:1px; background:var(--border-subtle);"></div>
        <div style="font-size:0.875rem; color:var(--text-secondary); display:flex; gap:1.5rem; white-space:nowrap;">
          <span><strong>Eva v2.2.2</strong> released today (Universal & Arch pacman)</span>
          <span>&bull;</span>
          <span><strong>Astra v0.1.0-pre.1</strong> permission engine testing</span>
          <span>&bull;</span>
          <span><strong>AstraOS</strong> Niri + Noctalia v5 ISO preview</span>
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

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:2rem;">
        
        <!-- Eva Card -->
        <div class="card card-feature reveal delay-100">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem;">
              <div style="display:flex; align-items:center; gap:0.875rem;">
                <img src="./eva/assets/icon.png" alt="Eva" width="44" height="44" style="border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
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
                <img src="./astra/assets/icon.png" alt="Astra" width="44" height="44" style="border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
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

        <!-- AstraOS Card -->
        <div class="card card-feature reveal delay-300">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem;">
              <div style="display:flex; align-items:center; gap:0.875rem;">
                <img src="./astra-os/assets/astraos-logo.svg" alt="AstraOS" width="44" height="44" style="border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
                <div>
                  <h3 class="title-card">AstraOS</h3>
                  <span style="font-size:0.8125rem; color:var(--text-muted);">Cosmic Arch Linux</span>
                </div>
              </div>
              <span class="badge badge-dev">v1.0 Preview</span>
            </div>
            <p style="color:var(--text-secondary); font-size:0.9375rem; line-height:1.6; margin-bottom:1.5rem;">
              ${astraOs.short_description}
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:2rem;">
              <span class="badge badge-dev">Niri Wayland</span>
              <span class="badge badge-dev">Noctalia v5 Shell</span>
              <span class="badge badge-dev">LazyVim Pre-baked</span>
              <span class="badge badge-dev">Btrfs UEFI</span>
            </div>
          </div>
          <div style="display:flex; gap:0.75rem;">
            <a href="./astra-os/" class="btn btn-sm btn-primary" style="flex:1;">Explore AstraOS</a>
            <a href="./astra-os/releases/" class="btn btn-sm btn-secondary">Build ISO</a>
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
              <div>[WORKSPACE] AstraOS Niri Wayland Compositor: Online</div>
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
      <div class="card card-glass reveal delay-300" style="margin-bottom:3rem; padding:1.25rem 1.75rem;">
        <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:1rem; align-items:center;">
          <div style="position:relative;">
            <input type="text" id="catalog-search" placeholder="Search by name, tags, description, or features..." 
              style="width:100%; padding:0.75rem 1rem 0.75rem 2.5rem; background:var(--bg-surface-1); border:1px solid var(--border-medium); border-radius:var(--radius-full); font-size:0.9375rem; color:var(--text-primary);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:var(--text-muted);">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          <div>
            <select id="filter-category" style="width:100%; padding:0.75rem 1rem; background:var(--bg-surface-1); border:1px solid var(--border-medium); border-radius:var(--radius-full); font-size:0.875rem; color:var(--text-primary); cursor:pointer;">
              <option value="all">All Categories</option>
              <option value="AI Character">AI Character & Studio</option>
              <option value="Assistant">Desktop Assistant</option>
              <option value="Operating System">Operating System</option>
            </select>
          </div>

          <div>
            <select id="filter-platform" style="width:100%; padding:0.75rem 1rem; background:var(--bg-surface-1); border:1px solid var(--border-medium); border-radius:var(--radius-full); font-size:0.875rem; color:var(--text-primary); cursor:pointer;">
              <option value="all">All Platforms</option>
              <option value="Linux">Linux (Pacman / AppImage)</option>
              <option value="Windows">Windows (EXE / MSI)</option>
              <option value="macOS">macOS (Apple Silicon)</option>
              <option value="Android">Android (APK)</option>
            </select>
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
                <img src="../${p.icon}" alt="${p.name} logo" width="56" height="56" style="border-radius:14px; box-shadow:0 6px 16px rgba(0,0,0,0.3);">
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

              <div style="font-size:0.8125rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.75rem;">Supported Platforms</div>
              <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:1.25rem;">
                ${p.platforms.map(plat => `<span class="badge badge-dev" style="font-size:0.75rem;">${plat}</span>`).join('')}
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
        <img src="../eva/assets/icon.png" alt="Eva Icon" width="48" height="48" style="border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.4);">
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
          <span style="font-size:0.8125rem; color:var(--text-muted); font-family:var(--font-mono);">Eva AI Character Studio — v2.2.2</span>
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
          <div style="border-radius:var(--radius-lg); overflow:hidden; border:1px solid var(--border-medium);">
            <img src="../eva/assets/photo-canopy.jpg" alt="Companion Studio Atmosphere" style="width:100%; height:320px; object-fit:cover;">
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
          <div style="border-radius:var(--radius-lg); overflow:hidden; border:1px solid var(--border-medium);">
            <img src="../eva/assets/sky-figure.jpg" alt="Anime Roleplay Atmosphere" style="width:100%; height:320px; object-fit:cover;">
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
          <div style="border-radius:var(--radius-lg); overflow:hidden; border:1px solid var(--border-medium);">
            <img src="../eva/assets/photo-ridge.jpg" alt="World Simulator Atmosphere" style="width:100%; height:320px; object-fit:cover;">
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

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:2rem;">
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

  return renderHead('Eva Studio — Characters with a world of their own', eva.full_description, '/eva/', '../', 'eva/assets/icon.png') + content;
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
        <img src="../astra/assets/icon.png" alt="Astra Icon" width="48" height="48" style="border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.4);">
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
          <span style="font-size:0.8125rem; color:var(--text-muted); font-family:var(--font-mono);">Astra Core — Tauri v2 + Rust Bridge</span>
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

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:2rem;">
        
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

  return renderHead('Astra — AI Desktop Assistant', astra.full_description, '/astra/', '../', 'astra/assets/icon.png') + content;
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
          <li style="display:flex; align-items:center; gap:0.5rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg> Direct AstraOS integration package (<code>astra-assistant</code>)</li>
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
// 9. ASTRAOS PROJECT PAGES GENERATOR (/astra-os/)
// -----------------------------------------------------------------------------
function generateAstraOsPage() {
  const astraOs = ecosystem.projects.find(p => p.id === 'astra-os');

  const content = `
  ${renderNav('astra-os', '../')}

  <!-- AstraOS Hero -->
  <section class="section-lg" style="position:relative; overflow:hidden;">
    <div class="ambient-flare flare-crimson" style="top:-80px; left:50%; width:650px; height:650px; transform:translateX(-50%);"></div>
    <div class="container" style="text-align:center; position:relative; z-index:2;">
      <div style="display:inline-flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;" class="reveal">
        <img src="../astra-os/assets/astraos-logo.svg" alt="AstraOS Logo" width="48" height="48" style="border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.4);">
        <span class="badge badge-dev" style="font-size:0.8125rem;">${astraOs.version}</span>
      </div>

      <h1 class="title-display reveal delay-100" style="margin-bottom:1.5rem; max-width:920px; margin-left:auto; margin-right:auto;">
        Curated Arch Linux with Niri & Noctalia
      </h1>
      <p class="lead reveal delay-200" style="margin:0 auto 2.5rem;">
        ${astraOs.short_description}
      </p>

      <div class="reveal delay-300" style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap; margin-bottom:4rem;">
        <a href="#install" class="btn btn-lg btn-primary">
          <span>Installation Guide & Hardware Specs</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a href="./releases/" class="btn btn-lg btn-secondary">
          <span>Build ISO from Source</span>
        </a>
      </div>

      <!-- Wallpaper & Desktop Preview -->
      <div class="reveal delay-400 mockup-window" style="max-width:1040px; margin:0 auto;">
        <div class="mockup-header">
          <div class="mockup-dots">
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
            <span class="mockup-dot"></span>
          </div>
          <span style="font-size:0.8125rem; color:var(--text-muted); font-family:var(--font-mono);">AstraOS — Niri Wayland Compositor + Noctalia v5</span>
          <span class="badge badge-dev" style="padding:0.15rem 0.5rem; font-size:0.7rem;">UEFI ONLY</span>
        </div>
        <div style="background:var(--bg-surface-0); padding:0.5rem; display:flex; justify-content:center;">
          <img src="../astra-os/assets/wallpaper.png" alt="AstraOS Desktop Wallpaper" style="border-radius:var(--radius-md); width:100%; height:auto;">
        </div>
      </div>
    </div>
  </section>

  <!-- Architectural Pillars -->
  <section class="section" style="background:var(--bg-surface-0); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
    <div class="container">
      <div style="text-align:center; margin-bottom:4rem;">
        <div class="eyebrow reveal">CURATED ENVIRONMENT</div>
        <h2 class="title-section reveal delay-100">Every Detail Pre-Configured</h2>
        <p class="lead reveal delay-200" style="margin:1rem auto 0;">
          AstraOS pairs modern Wayland scrollable tiling with the tools developers actually use every day.
        </p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:2rem;">
        
        <div class="card reveal delay-100">
          <div class="badge badge-dev" style="margin-bottom:1rem;">WINDOW COMPOSITOR</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Niri Scrollable Tiling</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Windows arrange themselves along an infinite horizontal ribbon. Scroll smoothly between tasks without squishing windows or manually juggling complex grid layouts.
          </p>
        </div>

        <div class="card reveal delay-200">
          <div class="badge badge-dev" style="margin-bottom:1rem;">DESKTOP SHELL</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Noctalia v5 Wayland Shell</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Integrated status bar, system monitors, network controls, volume slider, notifications, and application launcher triggered via <code>Super + Space</code>.
          </p>
        </div>

        <div class="card reveal delay-300">
          <div class="badge badge-dev" style="margin-bottom:1rem;">DEVELOPER CORE</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Kitty + Zsh + LazyVim</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Kitty GPU terminal with Oh My Posh 1_shell prompt, fastfetch diagnostics, and a pinned Neovim tree with LazyVim fully pre-baked and cached for instant offline launch.
          </p>
        </div>

        <div class="card reveal delay-400">
          <div class="badge badge-dev" style="margin-bottom:1rem;">STORAGE & RELIABILITY</div>
          <h3 class="title-card" style="margin-bottom:0.75rem;">Btrfs Subvolumes & Snapshots</h3>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Configured with <code>@</code> (root), <code>@home</code>, <code>@snapshots</code>, and <code>@pkg</code> subvolumes. Built on the Arch Linux Archive snapshot <code>2026/10/18</code> for reproducible stability.
          </p>
        </div>

      </div>
    </div>
  </section>

  <!-- Hardware Requirements & Installation Walkthrough -->
  <section class="section-lg" id="install">
    <div class="container container-narrow">
      <div style="margin-bottom:3.5rem;">
        <div class="eyebrow reveal">INSTALLATION & REQUIREMENTS</div>
        <h2 class="title-section reveal delay-100" style="margin-bottom:1rem;">System Compatibility & Setup</h2>
        <p class="lead reveal delay-200">
          AstraOS targets modern 64-bit UEFI systems. Secure Boot must be disabled.
        </p>
      </div>

      <!-- Requirements Table -->
      <div class="card card-glass reveal delay-300" style="margin-bottom:3rem;">
        <h3 class="title-card" style="margin-bottom:1.25rem;">Hardware Requirements</h3>
        <div style="display:flex; flex-direction:column; gap:0.875rem; font-size:0.9375rem;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
            <span style="color:var(--text-muted);">Processor</span>
            <span style="font-weight:600;">64-bit x86_64 (Intel or AMD)</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
            <span style="color:var(--text-muted);">Firmware</span>
            <span style="font-weight:600; color:var(--accent-primary);">UEFI only (CSM/Legacy not supported)</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
            <span style="color:var(--text-muted);">Secure Boot</span>
            <span style="font-weight:600; color:#F59E0B;">Disabled</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
            <span style="color:var(--text-muted);">Memory (RAM)</span>
            <span style="font-weight:600;">4 GB minimum (8 GB recommended)</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
            <span style="color:var(--text-muted);">Storage</span>
            <span style="font-weight:600;">25 GB free disk space (Btrfs root)</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-muted);">Graphics</span>
            <span style="font-weight:600;">AMD / Intel open drivers (Mesa); NVIDIA 580xx</span>
          </div>
        </div>
      </div>

      <!-- Installation Steps -->
      <div class="card reveal delay-400">
        <h3 class="title-card" style="margin-bottom:1.25rem;">Live Session & Installation Process</h3>
        <ol style="margin-left:1.5rem; color:var(--text-secondary); font-size:0.9375rem; line-height:1.8; margin-bottom:2rem;">
          <li>Flash the generated ISO image to a USB flash drive using <code>dd</code>:
            <div class="cmd-box" style="margin:0.75rem 0;">
              <code>sudo dd if=astraos-v1-x86_64.iso of=/dev/sdX bs=4M status=progress conv=fsync</code>
              <button class="copy-btn" data-copy-text="sudo dd if=astraos-v1-x86_64.iso of=/dev/sdX bs=4M status=progress conv=fsync">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
          </li>
          <li>Boot the USB stick in <strong>UEFI mode</strong>. The system boots into the SDDM login screen and automatically logs into the live Niri desktop.</li>
          <li>Live session credentials:
            <ul style="margin-left:1.5rem; margin-top:0.25rem;">
              <li><strong>User:</strong> <code>astra</code></li>
              <li><strong>Password:</strong> <code>astra</code> (for lockscreen and tty fallback)</li>
              <li><strong>Sudo:</strong> Passwordless in live environment</li>
            </ul>
          </li>
          <li>Launch the Astra Installer from the application menu (<code>Super + Space</code>) to partition and install to disk.</li>
        </ol>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <a href="./catalog/" class="btn btn-secondary">Inspect Package Architecture</a>
          <a href="./releases/" class="btn btn-primary">Build ISO from Source</a>
        </div>
      </div>
    </div>
  </section>

  ${renderFooter('../')}
`;

  return renderHead('AstraOS — Curated Arch Linux Distribution', astraOs.full_description, '/astra-os/', '../', 'astra-os/assets/wallpaper.png') + content;
}

// -----------------------------------------------------------------------------
// 10. ASTRAOS CATALOG & PACKAGES (/astra-os/catalog/)
// -----------------------------------------------------------------------------
function generateAstraOsCatalogPage() {
  const content = `
  ${renderNav('astra-os', '../../')}

  <section class="section-lg">
    <div class="container container-narrow">
      <div style="margin-bottom:3.5rem;">
        <a href="../" style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.875rem; color:var(--accent-primary); margin-bottom:1rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to AstraOS Overview
        </a>
        <div class="eyebrow">CUSTOM PACKAGES & ARCHITECTURE</div>
        <h1 class="title-section" style="margin-bottom:1rem;">AstraOS Component Catalog</h1>
        <p class="lead">
          AstraOS builds on Arch Linux by delivering custom maintained packages that establish its branding, shell integration, keybinds, and installer.
        </p>
      </div>

      <div style="display:flex; flex-direction:column; gap:2rem;">
        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">astra-branding</h3>
            <span class="badge badge-dev">PKGBUILD</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Provides AstraOS lockups, vector marks, wallpapers (aurora, ember, lunar), SDDM branding, <code>/etc/os-release</code> integration hook, and console motd banners.
          </p>
        </div>

        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">astra-desktop-config</h3>
            <span class="badge badge-dev">PKGBUILD</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Ships the complete desktop configuration: Niri compositor settings (<code>config.kdl</code>, <code>keybinds.kdl</code>), Noctalia v5 shell themes, Kitty terminal theme, Oh My Posh 1_shell config, and pre-baked LazyVim configuration.
          </p>
        </div>

        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">astra-installer</h3>
            <span class="badge badge-dev">PKGBUILD</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            The guided installation wizard for disk partitioning, GPT table creation, Btrfs subvolume layout (<code>@</code>, <code>@home</code>, <code>@snapshots</code>), user configuration, and GRUB EFI setup.
          </p>
        </div>

        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">astra-keybinds</h3>
            <span class="badge badge-dev">PKGBUILD</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            Provides an on-screen QuickShell overlay (triggered via <code>Super + Shift + /</code>) displaying all active desktop and application hotkeys dynamically.
          </p>
        </div>

        <div class="card card-glass">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h3 class="title-card">astra-updater</h3>
            <span class="badge badge-dev">PREVIEW</span>
          </div>
          <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
            CLI and systemd timer for managing snapshot updates against verified Arch Linux Archive milestones.
          </p>
        </div>
      </div>

      <div style="text-align:center; margin-top:3.5rem;">
        <a href="../releases/" class="btn btn-primary">How to Build AstraOS ISO</a>
      </div>
    </div>
  </section>

  ${renderFooter('../../')}
`;

  return renderHead('AstraOS Component Catalog', 'Technical architecture and custom packages for AstraOS Linux.', '/astra-os/catalog/', '../../') + content;
}

// -----------------------------------------------------------------------------
// 11. ASTRAOS RELEASES & BUILD HUB (/astra-os/releases/)
// -----------------------------------------------------------------------------
function generateAstraOsReleasesPage() {
  const content = `
  ${renderNav('astra-os', '../../')}

  <section class="section-lg">
    <div class="container container-narrow">
      <div style="text-align:center; margin-bottom:3.5rem;">
        <a href="../" style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.875rem; color:var(--accent-primary); margin-bottom:1rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to AstraOS Overview
        </a>
        <div class="eyebrow reveal">ISO SOURCE & BUILDS</div>
        <h1 class="title-section reveal delay-100" style="margin-bottom:1rem;">AstraOS ISO Build Guide</h1>
        <p class="lead reveal delay-200">
          AstraOS is currently in active development. You can compile the official bootable live ISO directly using Archiso on an Arch Linux host.
        </p>
      </div>

      <div class="card card-glass" style="margin-bottom:2.5rem;">
        <h3 class="title-card" style="margin-bottom:1rem;">Build Requirements</h3>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.9375rem; color:var(--text-secondary); margin-bottom:1.5rem;">
          <li>&bull; An Arch Linux host system with <code>sudo</code> privileges</li>
          <li>&bull; Required packages: <code>archiso</code>, <code>git</code>, <code>base-devel</code></li>
          <li>&bull; At least 15 GiB of free disk space for the rootfs image build</li>
        </ul>

        <div style="font-size:0.8125rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.5rem;">Build Commands</div>
        <div class="cmd-box" style="margin-bottom:1rem;">
          <code>git clone https://github.com/AmanicX/astra-os.git && cd astra-os && sudo ./scripts/build-iso.sh</code>
          <button class="copy-btn" data-copy-text="git clone https://github.com/AmanicX/astra-os.git && cd astra-os && sudo ./scripts/build-iso.sh">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>
        <p style="font-size:0.8125rem; color:var(--text-muted);">
          The script builds the local packages, syncs the pinned package snapshot, pre-bakes Neovim plugins, and outputs the final bootable ISO into <code>out/</code>.
        </p>
      </div>

      <div class="card" style="margin-bottom:2.5rem;">
        <h3 class="title-card" style="margin-bottom:0.75rem;">Public ISO Releases Status</h3>
        <p style="font-size:0.9375rem; color:var(--text-secondary); line-height:1.6;">
          Public pre-compiled ISO images are currently undergoing live hardware validation across AMD and Intel testbeds. As soon as release v1.0 passes certification, downloadable ISO links and SHA256 checksums will appear here automatically via GitHub Releases automation.
        </p>
      </div>

      <div style="text-align:center;">
        <a href="https://github.com/AmanicX/astra-os" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
          Track AstraOS on GitHub
        </a>
      </div>
    </div>
  </section>

  ${renderFooter('../../')}
`;

  return renderHead('AstraOS ISO Build Guide', 'Instructions for building the official AstraOS live ISO from source.', '/astra-os/releases/', '../../') + content;
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
    'astra-os/',
    'astra-os/catalog/',
    'astra-os/releases/'
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
    { path: join(ROOT, 'astra-os/index.html'), html: generateAstraOsPage() },
    { path: join(ROOT, 'astra-os/catalog/index.html'), html: generateAstraOsCatalogPage() },
    { path: join(ROOT, 'astra-os/releases/index.html'), html: generateAstraOsReleasesPage() },
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
  writeFileSync(join(ROOT, '.nojekyll'), '', 'utf-8');
  console.log('  ✓ Created .nojekyll');

  console.log('✨ Build completed successfully!');
}

buildAll();
