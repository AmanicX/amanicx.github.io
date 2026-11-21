export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

export function sortUpdates(updates) {
  for (const update of updates) {
    if (!Number.isFinite(Date.parse(update.updated_at))) {
      throw new Error(`Invalid update date: ${update.id}`);
    }
  }
  return [...updates].sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at));
}

function getUpdateMeta(update) {
  const id = update.id || '';
  const url = update.url || '';

  if (id.startsWith('eva-linux') || url.includes('eva-linux')) {
    return {
      icon: './shared/assets/icons/eva-linux.svg',
      alt: 'Eva Linux',
      badge: 'v2.1 Stable',
      badgeClass: 'badge-stable',
      tags: ['Arch Linux', 'Wayland', 'Niri', 'Security Hardened']
    };
  }
  if (id.startsWith('eva') || url.includes('/eva/')) {
    return {
      icon: './shared/assets/icons/eva-dark.png',
      iconLight: './shared/assets/icons/eva-light.png',
      alt: 'Eva',
      badge: 'v2.2.2 Release',
      badgeClass: 'badge-stable',
      tags: ['AI Studio', 'Universal Linux', 'Pacman Package']
    };
  }
  if (id.startsWith('astra') || url.includes('/astra/')) {
    return {
      icon: './shared/assets/icons/astra.png',
      alt: 'Astra',
      badge: 'v0.1.0-pre.1 Preview',
      badgeClass: 'badge-preview',
      tags: ['Desktop Assistant', 'Rust / Tauri', 'Permission Engine']
    };
  }
  return {
    icon: './shared/assets/favicon.svg',
    alt: 'AmanicX',
    badge: 'Update',
    badgeClass: 'badge-dev',
    tags: ['Repository Update']
  };
}

export function renderUpdates(updates) {
  const sorted = sortUpdates(updates);
  return sorted.map((update, index) => {
    const url = new URL(update.url);
    if (url.origin !== 'https://github.com' || !url.pathname.startsWith('/AmanicX/')) {
      throw new Error(`Unsupported update destination: ${update.id}`);
    }
    const date = new Intl.DateTimeFormat('en', {
      dateStyle: 'medium', timeZone: 'UTC'
    }).format(new Date(update.updated_at));

    const meta = getUpdateMeta(update);
    const isFirst = index === 0;

    const tagsHtml = meta.tags && meta.tags.length > 0
      ? `<div class="update-tags">${meta.tags.map(t => `<span class="badge badge-dev update-tag">${escapeHtml(t)}</span>`).join('')}</div>`
      : '';
    const iconLightHtml = meta.iconLight
      ? `\n          <img src="${escapeHtml(meta.iconLight)}" alt="${escapeHtml(meta.alt)}" width="44" height="44" class="update-icon icon-theme-light" loading="lazy">`
      : '';
    const latestPillHtml = isFirst
      ? ' <span class="badge badge-accent update-latest-pill">LATEST PUSH</span>'
      : '';

    return `<li class="repository-update ${isFirst ? 'is-latest' : ''}" data-update-id="${escapeHtml(update.id)}">
      <div class="update-card-inner">
        <div class="update-icon-wrap">
          <img src="${escapeHtml(meta.icon)}" alt="${escapeHtml(meta.alt)}" width="44" height="44" class="update-icon${meta.iconLight ? ' icon-theme-dark' : ''}" loading="lazy">${iconLightHtml}
        </div>
        <div class="update-body">
          <div class="repository-update-heading">
            <div class="update-title-group">
              <h3><a href="${escapeHtml(url.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(update.title)}</a></h3>
              <span class="badge ${escapeHtml(meta.badgeClass)}">${escapeHtml(meta.badge)}</span>${latestPillHtml}
            </div>
            <time datetime="${escapeHtml(update.updated_at)}" class="update-time">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${date} UTC</span>
            </time>
          </div>
          <p class="update-summary">${escapeHtml(update.summary)}</p>
          <div class="update-footer">
            ${tagsHtml}
            <a href="${escapeHtml(url.href)}" class="update-action" target="_blank" rel="noopener noreferrer" aria-label="View ${escapeHtml(update.title)} on GitHub">
              <span>View on GitHub</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
            </a>
          </div>
        </div>
      </div>
    </li>`;
  }).join('\n');
}
