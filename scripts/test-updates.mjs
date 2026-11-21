import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { renderUpdates, sortUpdates } from './updates.mjs';

const fixtures = [
  { id: 'old', title: 'Older update', summary: 'Old', updated_at: '2026-10-01T00:00:00Z', url: 'https://github.com/AmanicX/astra/commits/main' },
  { id: 'new', title: 'Newest push', summary: 'New', updated_at: '2026-11-21T00:00:00Z', url: 'https://github.com/AmanicX/eva-linux/tree/v2.1' },
  { id: 'middle', title: 'Middle update', summary: 'Middle', updated_at: '2026-11-19T00:00:00Z', url: 'https://github.com/AmanicX/eva/commits/main' }
];

test('repository updates appear newest first without mutating source data', () => {
  assert.deepEqual(sortUpdates(fixtures).map(item => item.id), ['new', 'middle', 'old']);
  assert.equal(fixtures[0].id, 'old');
  const html = renderUpdates(fixtures);
  assert.ok(html.indexOf('Newest push') < html.indexOf('Middle update'));
  assert.ok(html.indexOf('Middle update') < html.indexOf('Older update'));
});

test('rendered update content is escaped', () => {
  const html = renderUpdates([{ ...fixtures[0], title: '<script>alert(1)</script>', summary: 'A & B' }]);
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('A &amp; B'));
  assert.ok(!html.includes('<script>'));
});

test('invalid dates and non-GitHub destinations fail closed', () => {
  assert.throws(() => sortUpdates([{ ...fixtures[0], updated_at: 'not a date' }]));
  assert.throws(() => renderUpdates([{ ...fixtures[0], url: 'javascript:alert(1)' }]));
});

test('overview and Eva Linux pages show v2.1 without zero-risk promises', () => {
  const root = new URL('../', import.meta.url);
  const home = readFileSync(new URL('index.html', root), 'utf8');
  const evaLinux = readFileSync(new URL('eva-linux/index.html', root), 'utf8');
  const notes = readFileSync(new URL('eva-linux/releases/index.html', root), 'utf8');
  assert.ok(home.includes('id="latest-updates"'));
  assert.ok(home.includes('Latest push: Eva Linux v2.1'));
  assert.ok(evaLinux.includes('v2.1'));
  assert.ok(notes.indexOf('Eva Linux v2.1') < notes.indexOf('Eva Linux v2.0.0'));
  assert.ok(!/zero-risk|instant rollback/i.test(evaLinux));
});
