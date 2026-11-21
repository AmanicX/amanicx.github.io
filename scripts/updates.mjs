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

export function renderUpdates(updates) {
  return sortUpdates(updates).map(update => {
    const url = new URL(update.url);
    if (url.origin !== 'https://github.com' || !url.pathname.startsWith('/AmanicX/')) {
      throw new Error(`Unsupported update destination: ${update.id}`);
    }
    const date = new Intl.DateTimeFormat('en', {
      dateStyle: 'medium', timeZone: 'UTC'
    }).format(new Date(update.updated_at));
    return `<li class="repository-update" data-update-id="${escapeHtml(update.id)}">
      <div class="repository-update-heading">
        <h3><a href="${escapeHtml(url.href)}">${escapeHtml(update.title)}</a></h3>
        <time datetime="${escapeHtml(update.updated_at)}">${date} UTC</time>
      </div>
      <p>${escapeHtml(update.summary)}</p>
    </li>`;
  }).join('\n');
}
