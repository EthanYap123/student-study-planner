// Core: state, router and shared UI helpers

const App = { routes: {}, stack: [], cleanups: [], session: {} };

/* ---------- Utilities ---------- */

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const uid = () => Math.random().toString(36).slice(2, 9);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const today = () => new Date().toISOString().slice(0, 10);
function fmtDate(d = new Date()) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function wait(ms) {
  return new Promise(res => { const t = setTimeout(res, ms); App.cleanups.push(() => clearTimeout(t)); });
}
// Delegated listener scoped to one screen render
function on(root, event, selector, fn) {
  root.addEventListener(event, e => {
    const el = e.target.closest(selector);
    if (el && root.contains(el)) fn(e, el);
  });
}

/* ---------- Persistent state ---------- */

const STORE_KEY = 'mylearningai-state-v1';

function defaultState() {
  return {
    user: null,
    loggedIn: false,
    history: DATA.quizHistory.map(h => ({ ...h })),
    sheets: DATA.revisionSheets.map(s => ({ ...s })),
    plan: null,
    practice: {
      day: today(), questions: 12, correct: 10, seconds: 25 * 60,
      last: { correct: 8, total: 10 },
      recent: { linear: Date.now() - 2 * 864e5, triangles: Date.now() - 5 * 864e5 },
      sessions: 3
    },
    streak: { current: 6, best: 12, day: null },
    readNotifs: [],
    bookmarks: [],
    settings: {
      theme: 'light', text: 'normal',
      notif: { quiz: true, plan: true, ai: true, checkin: true, email: false },
      privacy: { twofa: false, analytics: true, personalised: true }
    }
  };
}

const Store = {
  state: null,
  load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { saved = null; }
    const base = defaultState();
    this.state = saved ? { ...base, ...saved, settings: { ...base.settings, ...(saved.settings || {}) } } : base;
    // Reset today's practice counters on a new day
    if (this.state.practice.day !== today()) {
      this.state.practice = { ...this.state.practice, day: today(), questions: 0, correct: 0, seconds: 0 };
    }
  },
  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.state)); } catch (e) { /* storage unavailable: keep in memory */ }
  },
  set(fn) { fn(this.state); this.save(); },
  reset() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    this.state = defaultState();
  }
};

// Counts a study day towards the streak (once per day)
function markStudied() {
  Store.set(s => {
    if (s.streak.day === today()) return;
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    s.streak.current = (s.streak.day === null || s.streak.day === yesterday) ? s.streak.current + 1 : 1;
    s.streak.best = Math.max(s.streak.best, s.streak.current);
    s.streak.day = today();
  });
}

function applySettings() {
  const { theme, text } = Store.state.settings;
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.text = text;
}

/* ---------- Router ---------- */

function route(path, view) { App.routes[path] = view; }

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  return { path, query: Object.fromEntries(new URLSearchParams(qs || '')), full: raw };
}

function go(path) {
  if (location.hash === '#' + path) render();
  else location.hash = path;
}

function replace(path) {
  history.replaceState(null, '', '#' + path);
  if (App.stack.length) App.stack[App.stack.length - 1] = path;
  render();
}

function back(fallback = '/home') {
  if (App.stack.length > 1) history.back();
  else replace(fallback);
}

function trackStack(full) {
  const s = App.stack;
  if (s.length > 1 && s[s.length - 2] === full) s.pop();
  else if (s[s.length - 1] !== full) s.push(full);
}

function render() {
  const { path, query, full } = parseHash();
  const view = App.routes[path];
  if (!view) return replace(Store.state.loggedIn ? '/home' : '/welcome');
  if (!view.public && !Store.state.loggedIn) return replace('/welcome');
  if (view.public && view.authOnly && Store.state.loggedIn) return replace('/home');
  if (view.guard && !view.guard(query)) return replace(view.fallback || '/home');

  trackStack(full);
  App.cleanups.forEach(fn => fn());
  App.cleanups = [];
  closeOverlays();

  const app = $('#app');
  app.innerHTML = view.render(query);
  const screen = app.firstElementChild;
  if (view.mount) view.mount(screen, query);
  const content = $('.content', screen);
  if (content) content.scrollTop = 0;
  document.title = (view.title ? view.title + ' · ' : '') + 'MyLearningAI';
}

/* ---------- Shared UI ---------- */

function topbar({ back: fb = '/home', home = false, right = '', label = 'Back' } = {}) {
  return `<div class="topbar">
    <button class="back" data-back="${fb}">${icon('arrow-left')} ${label}</button>
    <div class="topbar-actions">${right}${home ? `<button class="icon-btn teal" data-go="/home" aria-label="Home">${icon('home')}</button>` : ''}</div>
  </div>`;
}

function unreadCount() {
  return DATA.notifications.filter(n => n.unread && !Store.state.readNotifs.includes(n.id)).length;
}

function tabbar(active) {
  const n = unreadCount();
  const tab = (id, ic, label, path) => `<button class="${active === id ? 'on' : ''}" data-go="${path}" ${active === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${id === 'notif' && n ? `<span class="dot">${n}</span>` : ''}</button>`;
  return `<nav class="tabbar" aria-label="Main">
    ${tab('home', 'home', 'Home', '/home')}${tab('notif', 'bell', 'Notifications', '/notifications')}${tab('help', 'help', 'Help', '/help')}${tab('settings', 'settings', 'Settings', '/settings')}
  </nav>`;
}

function toast(msg) {
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.textContent = msg;
  $('.device').appendChild(t);
  setTimeout(() => t.remove(), 2700);
}

function closeOverlays() { $$('.overlay').forEach(o => o.remove()); }

// Opens a dialog/sheet/drawer. Returns a close function.
function overlay(html, { kind = 'center', onMount } = {}) {
  closeOverlays();
  const o = document.createElement('div');
  o.className = 'overlay' + (kind === 'bottom' ? ' bottom' : kind === 'left' ? ' left' : '');
  o.innerHTML = html;
  const close = () => { o.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  o.addEventListener('click', e => {
    if (e.target === o || e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', onKey);
  $('.device').appendChild(o);
  const first = $('input, button:not([data-close]), [tabindex]', o);
  if (first) first.focus({ preventScroll: true });
  if (onMount) onMount(o, close);
  return close;
}

function confirmDialog({ title, text, rows = '', yes = 'Confirm', no = 'Cancel', danger = false, iconName = 'check' }) {
  return new Promise(resolve => {
    let answered = false;
    overlay(`<div class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <button class="icon-btn close" data-close aria-label="Close">${icon('x')}</button>
      <div class="dot-icon ${danger ? 'red' : ''}">${icon(iconName)}</div>
      <h2>${title}</h2><p>${text}</p>${rows}
      <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${yes}</button>
      <button class="btn btn-ghost" data-close>${no}</button>
    </div>`, {
      onMount(o, close) {
        $('[data-yes]', o).addEventListener('click', () => { answered = true; close(); resolve(true); });
        new MutationObserver((_, obs) => { if (!o.isConnected) { obs.disconnect(); if (!answered) resolve(false); } })
          .observe($('.device'), { childList: true });
      }
    });
  });
}

function promptDialog({ title, label, value = '', yes = 'Save' }) {
  return new Promise(resolve => {
    let done = false;
    overlay(`<form class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <button type="button" class="icon-btn close" data-close aria-label="Close">${icon('x')}</button>
      <h2 style="margin-top:0">${title}</h2>
      <div class="field"><label for="pd-in">${label}</label><input id="pd-in" class="input" value="${esc(value)}" required maxlength="80"></div>
      <button class="btn btn-primary" type="submit">${yes}</button>
    </form>`, {
      onMount(o, close) {
        const inp = $('#pd-in', o);
        inp.select();
        $('form', o).addEventListener('submit', e => {
          e.preventDefault();
          if (!inp.value.trim()) return;
          done = true; close(); resolve(inp.value.trim());
        });
        new MutationObserver((_, obs) => { if (!o.isConnected) { obs.disconnect(); if (!done) resolve(null); } })
          .observe($('.device'), { childList: true });
      }
    });
  });
}

/* ---------- File picking ---------- */

function pickFiles({ accept = '', multiple = true, capture = false } = {}) {
  return new Promise(resolve => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = accept;
    inp.multiple = multiple;
    if (capture) inp.setAttribute('capture', 'environment');
    inp.addEventListener('change', () => resolve(Array.from(inp.files || [])));
    inp.click();
  });
}

// Turns browser File objects into the prototype's file records (only name/size are used)
function toRecords(files) {
  return files.map(f => {
    const mb = Math.max(0.1, Math.round(f.size / 1048576 * 10) / 10);
    return { id: uid(), name: f.name, size: mb, pages: Math.max(1, Math.round(mb * 5)) };
  });
}

function extOk(name, exts) {
  const ext = name.split('.').pop().toLowerCase();
  return exts.includes(ext);
}

// Wires a dropzone element for click and drag & drop. onFiles receives File[].
function wireDropzone(zone, { accept, exts, onFiles, onReject }) {
  const handle = files => {
    const ok = files.filter(f => extOk(f.name, exts));
    if (ok.length < files.length && onReject) onReject(files.length - ok.length);
    if (ok.length) onFiles(ok);
  };
  zone.addEventListener('click', async e => {
    if (e.target.closest('[data-sample]')) return;
    handle(await pickFiles({ accept }));
  });
  zone.addEventListener('keydown', async e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle(await pickFiles({ accept })); }
  });
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag');
    handle(Array.from(e.dataTransfer.files || []));
  });
}

function fileRow(f, { manage = false, showPages = false } = {}) {
  return `<div class="file-row" data-id="${f.id}" ${manage ? 'draggable="true"' : ''}>
    ${manage ? `<span class="grip" aria-hidden="true">${icon('grip')}</span>` : ''}
    ${icon('file')}
    <div class="grow"><span class="name">${esc(f.name)}</span>${showPages ? `<small>${f.size} MB · ${plural(f.pages, 'page')} detected</small>` : ''}</div>
    ${!showPages ? `<small>${f.size} MB</small>` : ''}
    ${manage ? `<button class="icon-btn" data-rename="${f.id}" aria-label="Rename ${esc(f.name)}">${icon('pencil')}</button>
    <button class="icon-btn red" data-remove="${f.id}" aria-label="Delete ${esc(f.name)}">${icon('trash')}</button>` : ''}
  </div>`;
}

/* ---------- Charts ---------- */

function ring(pct, size = 70) {
  const r = 30, c = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px" role="img" aria-label="${pct}%">
    <svg viewBox="0 0 70 70"><circle class="track" cx="35" cy="35" r="${r}"/><circle class="val" cx="35" cy="35" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}"/></svg>
    <span>${pct}%</span></div>`;
}

/* ---------- Boot ---------- */

function boot() {
  Store.load();
  applySettings();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySettings);

  const app = $('#app');
  app.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); go(g.dataset.go); return; }
    const b = e.target.closest('[data-back]');
    if (b) { e.preventDefault(); back(b.dataset.back); }
  });
  window.addEventListener('hashchange', render);

  $('#reset-demo').addEventListener('click', () => {
    Store.reset();
    App.session = {};
    App.stack = [];
    applySettings();
    replace('/welcome');
    toast('Demo data reset');
  });

  const clock = $('#sb-time');
  const tick = () => { if (clock) clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, ''); };
  tick();
  setInterval(tick, 30000);

  render();
}

document.addEventListener('DOMContentLoaded', boot);
