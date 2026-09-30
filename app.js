// Lead Book — contact planner for an inspection business.
// Data lives in localStorage on each device and syncs to a JSON file in a
// (private) GitHub repo through the GitHub Contents API.

/* ================= Constants ================= */

const STATUSES = [
  { id: 'new', label: 'New lead' },
  { id: 'to_contact', label: 'Needs contact' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'follow_up', label: 'Follow up' },
  { id: 'scheduled', label: 'Inspection booked' },
  { id: 'client', label: 'Client' },
  { id: 'partner', label: 'Referral partner' },
  { id: 'cold', label: 'Not now' },
  { id: 'lost', label: 'Not interested' },
];
const STATUS = Object.fromEntries(STATUSES.map(s => [s.id, s]));
const ACTIVE_STATUSES = ['new', 'to_contact', 'contacted', 'follow_up', 'scheduled'];

const TYPES = ['Homebuyer', 'Homeowner / seller', 'Realtor', 'Property manager', 'Lender', 'Contractor', 'Investor', 'Other'];
const SOURCES = ['Referral', 'Realtor', 'Past client', 'Door knock', 'Open house', 'Website', 'Social media', 'Networking event', 'Other'];

const ACTS = [
  { id: 'call', label: 'Call', icon: 'phone' },
  { id: 'text', label: 'Text', icon: 'message' },
  { id: 'email', label: 'Email', icon: 'mail' },
  { id: 'visit', label: 'Visit', icon: 'pin' },
  { id: 'meeting', label: 'Meeting', icon: 'users' },
  { id: 'inspection', label: 'Inspection', icon: 'clipboard' },
  { id: 'note', label: 'Note', icon: 'note' },
];
const ACT = Object.fromEntries(ACTS.map(a => [a.id, a]));
const OUTREACH = new Set(['call', 'text', 'email', 'visit', 'meeting']);

const ICON = {
  phone: '<path d="M5 4h3.5l1.5 4-2 1.3a11 11 0 0 0 6.7 6.7l1.3-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>',
  message: '<path d="M4 5.5h16v10H9l-4.5 3.5v-3.5H4z"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
  pin: '<path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.8a3.4 3.4 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5V3h6v1.5M8.5 12l2.2 2.2 4.8-4.7"/>',
  note: '<path d="M6 3.5h9l3.5 3.5v13.5H6z"/><path d="M9 11h6M9 15h4"/>',
  log: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  chevL: '<path d="m14.5 6-6 6 6 6"/>',
  chevR: '<path d="m9.5 6 6 6-6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9.5l5-5 5 5M5 20h14"/>',
  contact: '<circle cx="12" cy="9" r="3.5"/><path d="M5.5 19.5c1-3 3.4-4.5 6.5-4.5s5.5 1.5 6.5 4.5"/><rect x="2.5" y="2.5" width="19" height="19" rx="4"/>',
};
const icon = (n, cls = '') => `<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${ICON[n] || ''}</svg>`;

/* ================= Storage ================= */

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } },
};

const DEFAULT_GOALS = { added: 10, outreach: 25, booked: 3, clients: 2 };
const emptyDb = () => ({ version: 1, contacts: [], goals: { ...DEFAULT_GOALS }, goalsUpdatedAt: '' });
const defaultCfg = () => ({
  theme: 'auto', lightFrom: 7, lightTo: 19, business: '',
  owner: 'JacobRichardWills', repo: 'DataBase-data', branch: '', path: 'contacts.json', token: '',
  device: guessDevice(),
});

function guessDevice() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'Android phone';
  if (/iPhone|iPad/i.test(ua)) return 'iPhone';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows laptop';
  return 'browser';
}

let db = Object.assign(emptyDb(), LS.get('lb.db', {}));
let cfg = Object.assign(defaultCfg(), LS.get('lb.cfg', {}));
let dirty = LS.get('lb.dirty', false);
let lastSync = LS.get('lb.lastSync', '');
let ui = { filter: 'active', q: '', sort: 'due', weekOffset: 0 };

function persist() { LS.set('lb.db', db); LS.set('lb.dirty', dirty); }
function saveCfg() { LS.set('lb.cfg', cfg); }

/* ================= Utilities ================= */

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nowIso = () => new Date().toISOString();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const daysBetween = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
const fmtDay = (s, opts = { weekday: 'short', month: 'short', day: 'numeric' }) => parseYmd(s).toLocaleDateString(undefined, opts);
const telHref = p => 'tel:' + String(p).replace(/[^\d+]/g, '');
const smsHref = p => 'sms:' + String(p).replace(/[^\d+]/g, '');

function relDue(s) {
  if (!s) return '';
  const n = daysBetween(today(), s);
  if (n < -1) return `Overdue ${-n} days`;
  if (n === -1) return 'Overdue since yesterday';
  if (n === 0) return 'Follow up today';
  if (n === 1) return 'Follow up tomorrow';
  if (n < 7) return `Follow up ${fmtDay(s, { weekday: 'long' })}`;
  return `Follow up ${fmtDay(s, { month: 'short', day: 'numeric' })}`;
}
function relTime(iso) {
  if (!iso) return '';
  const d = new Date(iso), t = today(), day = ymd(d);
  const n = daysBetween(day, t);
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (n === 0) return `Today ${time}`;
  if (n === 1) return `Yesterday ${time}`;
  if (n < 7) return d.toLocaleDateString(undefined, { weekday: 'short' }) + ' ' + time;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}

const live = () => db.contacts.filter(c => !c.deleted);
const byId = id => db.contacts.find(c => c.id === id && !c.deleted);
const acts = c => (c.activities || []).filter(a => !a.deleted).sort((a, b) => b.at.localeCompare(a.at));
const lastOutreach = c => acts(c).find(a => OUTREACH.has(a.type));

let toastTimer;
function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = esc(msg) + (action ? `<button type="button">${esc(action.label)}</button>` : '');
  if (action) t.querySelector('button').onclick = () => { action.run(); t.classList.remove('show'); };
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), action ? 6000 : 2600);
}

/* ================= Theme ================= */

function resolvedTheme() {
  if (cfg.theme === 'light' || cfg.theme === 'dark') return cfg.theme;
  const h = new Date().getHours();
  return h >= cfg.lightFrom && h < cfg.lightTo ? 'light' : 'dark';
}
function applyTheme() {
  const t = resolvedTheme();
  document.documentElement.dataset.theme = t;
  $('meta[name="theme-color"]').setAttribute('content', t === 'dark' ? '#0B141E' : '#16365E');
}
setInterval(applyTheme, 60 * 1000);

/* ================= Mutations ================= */

function commit() {
  dirty = true;
  persist();
  render();
  scheduleSync();
}

function upsertContact(data, id) {
  const t = nowIso();
  if (id) {
    const c = byId(id);
    const prev = c.status;
    Object.assign(c, data, { updatedAt: t });
    if (data.status && data.status !== prev) addStatusEntry(c, prev, data.status);
    return c;
  }
  const c = { id: uid(), createdAt: t, updatedAt: t, activities: [], ...data };
  db.contacts.push(c);
  return c;
}

function addStatusEntry(c, from, to) {
  c.activities = c.activities || [];
  c.activities.push({ id: uid(), type: 'status', from, to, at: nowIso(), updatedAt: nowIso() });
}

function setStatus(c, to) {
  if (c.status === to) return;
  const from = c.status;
  c.status = to;
  c.updatedAt = nowIso();
  addStatusEntry(c, from, to);
}

function deleteContact(id) {
  const c = byId(id);
  if (!c) return;
  c.deleted = true;
  c.updatedAt = nowIso();
  commit();
  location.hash = '#people';
  toast(`Deleted ${c.name}`, { label: 'Undo', run: () => { c.deleted = false; c.updatedAt = nowIso(); commit(); location.hash = '#person/' + c.id; } });
}

/* ================= GitHub sync ================= */

const syncReady = () => cfg.token && cfg.owner && cfg.repo && cfg.path;

function b64enc(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function b64dec(b64) {
  const bin = atob(b64.replace(/\s/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
// Key-sorted JSON so two copies of the same data compare equal.
function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return JSON.stringify(v);
}

async function gh(url, opts = {}) {
  return fetch(url, {
    cache: 'no-store',
    ...opts,
    headers: {
      Authorization: `Bearer ${cfg.token.trim()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
}
const repoApi = () => `https://api.github.com/repos/${encodeURIComponent(cfg.owner.trim())}/${encodeURIComponent(cfg.repo.trim())}`;
const fileApi = () => `${repoApi()}/contents/${cfg.path.trim().split('/').map(encodeURIComponent).join('/')}`;

class SyncError extends Error { constructor(status, msg) { super(msg); this.status = status; } }

function explain(status, body) {
  if (status === 401) return 'GitHub rejected the token. Paste a new one in Settings.';
  if (status === 403) return 'The token can’t write to this repo. Give it “Contents: Read and write”.';
  if (status === 404) return 'Repo not found. Check the owner and repo name, and that the token can see it.';
  return `GitHub error ${status}${body ? ': ' + body.slice(0, 120) : ''}`;
}

async function pullRemote() {
  const r = await gh(fileApi() + (cfg.branch ? `?ref=${encodeURIComponent(cfg.branch)}` : ''));
  if (r.status === 404) {
    // Distinguish "file not created yet" from "repo not reachable".
    const rr = await gh(repoApi());
    if (!rr.ok) throw new SyncError(rr.status, explain(rr.status));
    return { data: null, sha: null };
  }
  if (!r.ok) throw new SyncError(r.status, explain(r.status, await r.text()));
  const j = await r.json();
  let text;
  if (j.content) text = b64dec(j.content);
  else {
    // Files over 1 MB come back without content; read the blob instead.
    const br = await gh(`${repoApi()}/git/blobs/${j.sha}`);
    if (!br.ok) throw new SyncError(br.status, explain(br.status));
    text = b64dec((await br.json()).content);
  }
  return { data: JSON.parse(text || '{}'), sha: j.sha };
}

function mergeDb(a, b) {
  const map = new Map();
  for (const c of b.contacts || []) map.set(c.id, c);
  for (const c of a.contacts || []) {
    const o = map.get(c.id);
    if (!o) { map.set(c.id, c); continue; }
    const win = (c.updatedAt || '') >= (o.updatedAt || '') ? c : o;
    const lose = win === c ? o : c;
    const am = new Map();
    for (const x of lose.activities || []) am.set(x.id, x);
    for (const x of win.activities || []) {
      const y = am.get(x.id);
      if (!y || (x.updatedAt || x.at) >= (y.updatedAt || y.at)) am.set(x.id, x);
    }
    map.set(c.id, { ...win, activities: [...am.values()].sort((p, q) => p.at.localeCompare(q.at)) });
  }
  const ga = a.goalsUpdatedAt || '', gb = b.goalsUpdatedAt || '';
  return {
    version: 1,
    contacts: [...map.values()].sort((p, q) => (p.createdAt || '').localeCompare(q.createdAt || '')),
    goals: { ...DEFAULT_GOALS, ...(ga >= gb ? a.goals : b.goals) },
    goalsUpdatedAt: ga >= gb ? ga : gb,
  };
}

let syncing = false, syncAgain = false, syncTimer;
function scheduleSync(ms = 1500) { clearTimeout(syncTimer); syncTimer = setTimeout(sync, ms); }

function setSyncState(state, text) {
  const p = $('#syncPill');
  p.dataset.state = state;
  p.querySelector('.sync-text').textContent = text;
  p.title = state === 'ok' && lastSync ? `Last synced ${new Date(lastSync).toLocaleString()}` : text;
}
function idleSyncState() {
  if (!syncReady()) return setSyncState('off', 'Sync off');
  if (!navigator.onLine) return setSyncState('offline', dirty ? 'Offline · saved here' : 'Offline');
  if (dirty) return setSyncState('busy', 'Unsaved');
  setSyncState('ok', 'Synced');
}

async function sync() {
  if (!syncReady()) { idleSyncState(); return; }
  if (!navigator.onLine) { idleSyncState(); return; }
  if (syncing) { syncAgain = true; return; }
  syncing = true;
  setSyncState('busy', 'Syncing');
  try {
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data, sha } = await pullRemote();
      const merged = data ? mergeDb(db, data) : mergeDb(db, emptyDb());
      const localChanged = canon(merged) !== canon(db);
      db = merged;
      persist();
      if (localChanged) render();
      if (data && canon(merged) === canon(mergeDb(data, emptyDb()))) { dirty = false; break; }
      const res = await gh(fileApi(), {
        method: 'PUT',
        body: JSON.stringify({
          message: `Update contacts from ${cfg.device || 'browser'}`,
          content: b64enc(JSON.stringify(merged, null, 1) + '\n'),
          ...(sha ? { sha } : {}),
          ...(cfg.branch ? { branch: cfg.branch } : {}),
        }),
      });
      if (res.status === 409 || (res.status === 422 && sha)) continue; // someone else saved first; merge again
      if (!res.ok) throw new SyncError(res.status, explain(res.status, await res.text()));
      dirty = false;
      break;
    }
    lastSync = nowIso();
    LS.set('lb.lastSync', lastSync);
    persist();
    idleSyncState();
  } catch (e) {
    console.error(e);
    if (!navigator.onLine) idleSyncState();
    else setSyncState('error', e.status === 401 ? 'Token expired' : 'Sync failed');
    sync.lastError = e.message;
  } finally {
    syncing = false;
    if (syncAgain) { syncAgain = false; scheduleSync(300); }
  }
}

window.addEventListener('online', () => sync());
window.addEventListener('offline', idleSyncState);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { applyTheme(); sync(); render(); } });
setInterval(() => { if (document.visibilityState === 'visible' && !dialogOpen()) sync(); }, 2 * 60 * 1000);

/* ================= Rendering ================= */

const route = () => {
  const h = location.hash.replace(/^#/, '') || 'today';
  const [name, id] = h.split('/');
  return { name, id };
};

function render() {
  const r = route();
  const tab = r.name === 'person' ? 'people' : r.name;
  document.querySelectorAll('.tabs a').forEach(a => {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  $('#brandSub').textContent = cfg.business || '';
  $('#fab').hidden = !(r.name === 'today' || r.name === 'people');
  const v = $('#view');
  const views = { today: viewToday, people: viewPeople, person: viewPeople, week: viewWeek, settings: viewSettings };
  // Keep focus/scroll in the search box while typing.
  const active = document.activeElement;
  const keepSearch = active && active.id === 'q';
  const caret = keepSearch ? active.selectionStart : 0;
  v.innerHTML = (views[r.name] || viewToday)(r);
  if (keepSearch) { const q = $('#q'); if (q) { q.focus(); q.setSelectionRange(caret, caret); } }
  document.title = { today: 'Today', people: 'People', person: (byId(r.id) || {}).name || 'Contact', week: 'Week', settings: 'Settings' }[r.name] + ' · Lead Book';
}

function contactRow(c, { reason = '', selected = false } = {}) {
  const due = c.nextFollowUp ? daysBetween(today(), c.nextFollowUp) : null;
  const dueCls = due === null ? '' : due < 0 ? 'overdue' : due === 0 ? 'today' : '';
  const meta = [c.type, c.company].filter(Boolean).join(' · ') || c.phone || c.email || '';
  return `<li class="row${selected ? ' selected' : ''}" data-s="${esc(c.status)}">
    <a class="row-main" href="#person/${c.id}">
      <div class="row-top"><span class="row-name">${esc(c.name)}</span><span class="tag" data-s="${esc(c.status)}">${esc(STATUS[c.status]?.label || c.status)}</span></div>
      ${meta ? `<div class="row-meta">${esc(meta)}</div>` : ''}
      ${reason || c.nextFollowUp ? `<div class="row-due ${dueCls}">${esc(reason || relDue(c.nextFollowUp))}</div>` : ''}
    </a>
    <div class="row-actions">
      ${c.phone ? `<a class="icon-btn" href="${telHref(c.phone)}" aria-label="Call ${esc(c.name)}">${icon('phone')}</a>` : ''}
      <button class="icon-btn" type="button" data-action="log" data-id="${c.id}" aria-label="Log contact with ${esc(c.name)}">${icon('log')}</button>
    </div>
  </li>`;
}

function empty(title, body) { return `<div class="empty"><strong>${esc(title)}</strong>${esc(body)}</div>`; }

/* ---------- Today ---------- */
function viewToday() {
  const t = today();
  const all = live();
  const withDate = all.filter(c => c.nextFollowUp && !['lost'].includes(c.status));
  const overdue = withDate.filter(c => c.nextFollowUp < t).sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp));
  const dueToday = withDate.filter(c => c.nextFollowUp === t);
  const soon = withDate.filter(c => c.nextFollowUp > t && c.nextFollowUp <= addDays(t, 7)).sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp));
  const needs = all.filter(c => ['new', 'to_contact'].includes(c.status) && (!c.nextFollowUp || c.nextFollowUp > addDays(t, 7)))
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  const weekStart = startOfWeek(t);
  const doneThisWeek = all.flatMap(c => acts(c)).filter(a => OUTREACH.has(a.type) && ymd(new Date(a.at)) >= weekStart).length;

  const list = (arr, reasonFn) => `<ul class="list">${arr.map(c => contactRow(c, { reason: reasonFn ? reasonFn(c) : '' })).join('')}</ul>`;
  const sec = (title, arr, body, emptyEl = '') => (arr.length || emptyEl) ? `<section class="section">
      <div class="section-head"><h2 class="section-title">${title}</h2><span class="section-count">${arr.length || ''}</span></div>
      ${arr.length ? body : emptyEl}</section>` : '';

  const heading = new Date().toLocaleDateString(undefined, { weekday: 'long' });
  const dateLine = new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

  if (!all.length) {
    return `<div class="page-head"><div><div class="page-eyebrow">${esc(dateLine)}</div><h1 class="page-title">${esc(heading)}</h1><p class="page-kicker">Your follow-ups will show up here.</p></div></div>
      ${empty('No contacts yet', 'Add your first lead with the + button — a realtor you met, a homebuyer, a neighbor who’s selling.')}
      ${syncReady() ? '' : `<div class="section">${empty('Sync is off', 'Connect your private GitHub repo in Settings so your phone, laptop and Claude see the same list.')}</div>`}`;
  }

  return `<div class="page-head"><div><div class="page-eyebrow">${esc(dateLine)}</div><h1 class="page-title">${esc(heading)}</h1></div></div>
    <div class="day-strip">
      <div class="${overdue.length ? 'hot' : ''}"><b>${overdue.length}</b><span>Overdue</span></div>
      <div><b>${dueToday.length}</b><span>Due today</span></div>
      <div><b>${doneThisWeek}</b><span>Reached out this week</span></div>
    </div>
    ${sec('Overdue', overdue, list(overdue))}
    ${sec('Due today', dueToday, list(dueToday), overdue.length ? '' : empty('Nothing due today', 'Work the “Needs contact” list below, or add someone new.'))}
    ${sec('Needs contact', needs, list(needs, c => c.createdAt ? `Added ${relTime(c.createdAt).replace(/^(Today|Yesterday)/, m => m.toLowerCase())}` : ''))}
    ${sec('Next 7 days', soon, list(soon))}`;
}

/* ---------- People ---------- */
function filteredPeople() {
  const q = ui.q.trim().toLowerCase();
  let arr = live();
  if (ui.filter === 'active') arr = arr.filter(c => ACTIVE_STATUSES.includes(c.status));
  else if (ui.filter !== 'all') arr = arr.filter(c => c.status === ui.filter);
  if (q) arr = arr.filter(c => [c.name, c.company, c.phone, c.email, c.address, c.type, c.source, (c.tags || []).join(' '), c.notes]
    .filter(Boolean).join(' ').toLowerCase().includes(q));
  const byName = (a, b) => a.name.localeCompare(b.name);
  if (ui.sort === 'name') arr.sort(byName);
  else if (ui.sort === 'recent') arr.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  else if (ui.sort === 'status') arr.sort((a, b) => STATUSES.findIndex(s => s.id === a.status) - STATUSES.findIndex(s => s.id === b.status) || byName(a, b));
  else arr.sort((a, b) => (a.nextFollowUp || '9999').localeCompare(b.nextFollowUp || '9999') || byName(a, b));
  return arr;
}

function viewPeople(r) {
  const all = live();
  const counts = Object.fromEntries(STATUSES.map(s => [s.id, all.filter(c => c.status === s.id).length]));
  const activeCount = all.filter(c => ACTIVE_STATUSES.includes(c.status)).length;
  const chip = (id, label, n) => `<button type="button" class="chip" data-action="filter" data-f="${id}" aria-pressed="${ui.filter === id}">${esc(label)}<small>${n}</small></button>`;
  const arr = filteredPeople();
  const selected = r.name === 'person' ? byId(r.id) : null;

  const listPane = `<div class="list-pane">
    <div class="page-head"><h1 class="page-title">People</h1></div>
    <label class="search">${icon('search')}<span class="sr-only">Search contacts</span>
      <input id="q" type="search" placeholder="Search name, phone, address, notes" value="${esc(ui.q)}" autocomplete="off"></label>
    <div class="chips" role="group" aria-label="Filter by status">
      ${chip('active', 'Active', activeCount)}${chip('all', 'Everyone', all.length)}
      ${STATUSES.filter(s => counts[s.id]).map(s => chip(s.id, s.label, counts[s.id])).join('')}
    </div>
    <div class="toolbar-line"><span>${arr.length} ${arr.length === 1 ? 'person' : 'people'}</span>
      <label>Sort <select data-action="sort">
        ${[['due', 'Next follow-up'], ['recent', 'Recently updated'], ['status', 'Status'], ['name', 'Name']].map(([v, l]) => `<option value="${v}"${ui.sort === v ? ' selected' : ''}>${l}</option>`).join('')}
      </select></label></div>
    ${arr.length ? `<ul class="list">${arr.map(c => contactRow(c, { selected: selected && selected.id === c.id })).join('')}</ul>`
      : all.length ? empty('No matches', 'Try a different search or status filter.') : empty('No contacts yet', 'Tap + to add your first lead.')}
  </div>`;

  let detail = '';
  if (r.name === 'person') detail = selected ? personDetail(selected) : empty('Contact not found', 'It may have been deleted on another device.');
  else detail = `<div class="empty"><strong>Pick someone</strong>Their details, follow-up and history show here.</div>`;

  return `<div class="split${r.name === 'person' ? ' has-detail' : ''}">${listPane}<div class="detail-pane">${detail}</div></div>`;
}

function personDetail(c) {
  const due = c.nextFollowUp ? daysBetween(today(), c.nextFollowUp) : null;
  const mapHref = c.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}` : '';
  const facts = [
    ['Phone', c.phone && `<a href="${telHref(c.phone)}">${esc(c.phone)}</a>`],
    ['Email', c.email && `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`],
    ['Type', esc(c.type)], ['Company', esc(c.company)],
    ['Source', esc(c.source) + (c.referredBy ? ` · ${esc(c.referredBy)}` : '')],
    ['Added', c.createdAt ? esc(new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })) : ''],
    ['Address', c.address && `<a href="${mapHref}" target="_blank" rel="noopener">${esc(c.address)}</a>`, 'wide'],
    ['Tags', esc((c.tags || []).join(', ')), 'wide'],
    ['Notes', c.notes && `<span class="notes-text">${esc(c.notes)}</span>`, 'wide'],
  ].filter(f => f[1]);
  const history = acts(c);

  return `<article class="card">
    <div class="person-head">
      <a class="back" href="#people">${icon('chevL')}People</a>
      <h1 class="person-name">${esc(c.name)}</h1>
      ${[c.type, c.company].filter(Boolean).length ? `<div class="person-sub">${esc([c.type, c.company].filter(Boolean).join(' · '))}</div>` : ''}
      <div class="person-status">
        <span class="tag lg" data-s="${esc(c.status)}">${esc(STATUS[c.status]?.label)}</span>
        <label><span class="sr-only">Change status</span>
          <select class="status-select" data-action="status" data-id="${c.id}">
            ${STATUSES.map(s => `<option value="${s.id}"${s.id === c.status ? ' selected' : ''}>${s.label}</option>`).join('')}
          </select></label>
      </div>
    </div>
    <div class="quick">
      <a href="${c.phone ? telHref(c.phone) : '#'}" class="${c.phone ? '' : 'disabled'}">${icon('phone')}Call</a>
      <a href="${c.phone ? smsHref(c.phone) : '#'}" class="${c.phone ? '' : 'disabled'}">${icon('message')}Text</a>
      <a href="${c.email ? 'mailto:' + esc(c.email) : '#'}" class="${c.email ? '' : 'disabled'}">${icon('mail')}Email</a>
      <button type="button" data-action="log" data-id="${c.id}">${icon('log')}Log</button>
    </div>
    <div class="followup-bar">
      <div><div class="fu-label">Next follow-up</div>
        <div class="fu-date ${due !== null && due < 0 ? 'overdue' : ''}">${c.nextFollowUp ? esc(fmtDay(c.nextFollowUp, { weekday: 'long', month: 'short', day: 'numeric' })) + (due < 0 ? ` · ${-due}d overdue` : '') : 'Not set'}</div></div>
      <button type="button" class="btn sm" data-action="followup" data-id="${c.id}">${icon('calendar')}${c.nextFollowUp ? 'Change' : 'Set date'}</button>
    </div>
    ${facts.length ? `<dl class="facts">${facts.map(([k, v, w]) => `<div class="${w || ''}"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
    <div class="person-foot">
      <button type="button" class="btn sm" data-action="edit" data-id="${c.id}">${icon('edit')}Edit details</button>
      <button type="button" class="btn sm danger" data-action="delete" data-id="${c.id}">${icon('trash')}Delete</button>
    </div>
    <div class="section-head" style="padding: 4px 18px 0; margin-top: 8px"><h2 class="section-title">History</h2><span class="section-count">${history.length || ''}</span></div>
    ${history.length ? `<ol class="timeline">${history.map(a => timelineItem(c, a)).join('')}</ol>`
      : `<div style="padding: 6px 18px 18px">${empty('No history yet', 'Tap Log after each call, text or visit so you know where things stand.')}</div>`}
  </article>`;
}

function timelineItem(c, a) {
  if (a.type === 'status') {
    return `<li class="status"><span class="tl-icon"></span>
      <div class="tl-head"><span class="tl-type">${a.from ? `${esc(STATUS[a.from]?.label || a.from)} → ` : ''}${esc(STATUS[a.to]?.label || a.to)}</span><span class="tl-when">${esc(relTime(a.at))}</span></div></li>`;
  }
  return `<li><span class="tl-icon"></span>
    <div class="tl-head"><span class="tl-type">${esc(ACT[a.type]?.label || a.type)}${a.outcome ? ` · ${esc(a.outcome)}` : ''}</span><span class="tl-when">${esc(relTime(a.at))}</span></div>
    ${a.note ? `<div class="tl-note">${esc(a.note)}</div>` : ''}
    <button type="button" class="tl-del" data-action="del-act" data-id="${c.id}" data-act="${a.id}">Remove</button></li>`;
}

/* ---------- Week (key indicators) ---------- */
function startOfWeek(s) { const d = parseYmd(s); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return ymd(d); } // Monday

function weekStats(start) {
  const end = addDays(start, 7);
  const inWeek = iso => { const d = ymd(new Date(iso)); return d >= start && d < end; };
  const all = live();
  const allActs = all.flatMap(c => acts(c));
  return {
    added: all.filter(c => c.createdAt && inWeek(c.createdAt)).length,
    outreach: allActs.filter(a => OUTREACH.has(a.type) && inWeek(a.at)).length,
    booked: allActs.filter(a => a.type === 'status' && a.to === 'scheduled' && inWeek(a.at)).length,
    clients: allActs.filter(a => a.type === 'status' && a.to === 'client' && inWeek(a.at)).length,
  };
}

function viewWeek() {
  const start = addDays(startOfWeek(today()), ui.weekOffset * 7);
  const end = addDays(start, 6);
  const s = weekStats(start);
  const g = db.goals;
  const kpi = (label, n, goal) => {
    const pct = goal ? Math.min(100, Math.round(n / goal * 100)) : 0;
    return `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-num">${n}<small>/ ${goal}</small></div>
      <div class="meter ${n >= goal && goal ? 'done' : ''}" role="img" aria-label="${n} of ${goal}"><i style="width:${pct}%"></i></div></div>`;
  };
  const days = [...Array(7)].map((_, i) => addDays(start, i));
  const planned = live().filter(c => c.nextFollowUp && c.nextFollowUp >= start && c.nextFollowUp <= end && c.status !== 'lost');
  const label = ui.weekOffset === 0 ? 'This week' : ui.weekOffset === -1 ? 'Last week' : ui.weekOffset === 1 ? 'Next week' : `Week of ${fmtDay(start, { month: 'short', day: 'numeric' })}`;

  return `<div class="page-head">
      <div><h1 class="page-title">${label}</h1><p class="page-kicker">${esc(fmtDay(start, { month: 'short', day: 'numeric' }))} – ${esc(fmtDay(end, { month: 'short', day: 'numeric' }))}</p></div>
      <div class="week-nav">
        <button class="icon-btn" type="button" data-action="week" data-d="-1" aria-label="Previous week">${icon('chevL')}</button>
        ${ui.weekOffset ? `<button class="btn sm" type="button" data-action="week" data-d="0">Today</button>` : ''}
        <button class="icon-btn" type="button" data-action="week" data-d="1" aria-label="Next week">${icon('chevR')}</button>
      </div></div>
    <section><div class="section-head"><h2 class="section-title">Key indicators</h2><a class="section-count" href="#settings">Edit goals</a></div>
    <div class="kpis">
      ${kpi('New contacts', s.added, g.added)}${kpi('Calls, texts & visits', s.outreach, g.outreach)}
      ${kpi('Inspections booked', s.booked, g.booked)}${kpi('New clients', s.clients, g.clients)}
    </div></section>
    <section class="section"><div class="section-head"><h2 class="section-title">Follow-up plan</h2><span class="section-count">${planned.length || ''}</span></div>
    <div class="days">${days.map(d => {
      const ppl = planned.filter(c => c.nextFollowUp === d);
      return `<div class="day${d === today() ? ' is-today' : ''}"><div class="day-head">${esc(fmtDay(d, { weekday: 'long' }))}<span>${esc(fmtDay(d, { month: 'short', day: 'numeric' }))}</span></div>
        ${ppl.length ? `<ul>${ppl.map(c => `<li><a href="#person/${c.id}"><span>${esc(c.name)}</span><span class="tag" data-s="${esc(c.status)}">${esc(STATUS[c.status]?.label)}</span></a></li>`).join('')}</ul>` : '<div class="none">Nothing planned</div>'}</div>`;
    }).join('')}</div></section>`;
}

/* ---------- Settings ---------- */
function viewSettings() {
  const themeOpt = (v, l) => `<label><input type="radio" name="theme" value="${v}" data-action="theme"${cfg.theme === v ? ' checked' : ''}><span>${l}</span></label>`;
  const hours = sel => [...Array(24)].map((_, h) => `<option value="${h}"${h === sel ? ' selected' : ''}>${new Date(2000, 0, 1, h).toLocaleTimeString(undefined, { hour: 'numeric' })}</option>`).join('');
  const g = db.goals;
  const conn = !syncReady() ? '<div class="conn-state">Sync is off. Contacts are only saved on this device.</div>'
    : sync.lastError && document.querySelector('#syncPill')?.dataset.state === 'error' ? `<div class="conn-state err">${esc(sync.lastError)}</div>`
      : `<div class="conn-state ok">Connected to ${esc(cfg.owner)}/${esc(cfg.repo)}${lastSync ? ` · last synced ${esc(relTime(lastSync))}` : ''}</div>`;

  return `<div class="page-head"><h1 class="page-title">Settings</h1></div>
  <div class="settings">
    <section class="card">
      <h2>Appearance</h2>
      <p class="desc">Auto switches to dark in the evening. Pick Light or Dark to keep one look all day.</p>
      <div class="seg" role="radiogroup" aria-label="Theme">${themeOpt('auto', 'Auto by time')}${themeOpt('light', 'Light')}${themeOpt('dark', 'Dark')}</div>
      <div class="form two" style="margin-top:14px" ${cfg.theme !== 'auto' ? 'hidden' : ''}>
        <label class="field"><span>Light from</span><select data-action="light-from">${hours(cfg.lightFrom)}</select></label>
        <label class="field"><span>Dark from</span><select data-action="light-to">${hours(cfg.lightTo)}</select></label>
      </div>
    </section>

    <section class="card">
      <h2>Business</h2>
      <form class="form" data-form="business">
        <label class="field"><span>Business name</span><input name="business" value="${esc(cfg.business)}" placeholder="Shown under “Lead Book”"></label>
        <div><button class="btn sm" type="submit">Save name</button></div>
      </form>
    </section>

    <section class="card">
      <h2>Weekly goals</h2>
      <p class="desc">Your key indicators on the Week tab. Shared across devices.</p>
      <form class="form" data-form="goals">
        <div class="two">
          <label class="field"><span>New contacts</span><input type="number" min="0" inputmode="numeric" name="added" value="${g.added}"></label>
          <label class="field"><span>Calls, texts &amp; visits</span><input type="number" min="0" inputmode="numeric" name="outreach" value="${g.outreach}"></label>
          <label class="field"><span>Inspections booked</span><input type="number" min="0" inputmode="numeric" name="booked" value="${g.booked}"></label>
          <label class="field"><span>New clients</span><input type="number" min="0" inputmode="numeric" name="clients" value="${g.clients}"></label>
        </div>
        <div><button class="btn sm" type="submit">Save goals</button></div>
      </form>
    </section>

    <section class="card">
      <h2>Sync with GitHub</h2>
      <p class="desc">Contacts are saved to a JSON file in a <strong>private</strong> repo, so your phone, laptop and Claude all see the same list. The token stays on this device.</p>
      <form class="form" data-form="sync" autocomplete="off">
        <div class="two">
          <label class="field"><span>Owner</span><input name="owner" value="${esc(cfg.owner)}" autocapitalize="off" spellcheck="false"></label>
          <label class="field"><span>Private repo</span><input name="repo" value="${esc(cfg.repo)}" autocapitalize="off" spellcheck="false"></label>
          <label class="field"><span>File</span><input name="path" value="${esc(cfg.path)}" autocapitalize="off" spellcheck="false"></label>
          <label class="field"><span>Branch <span class="muted">(optional)</span></span><input name="branch" value="${esc(cfg.branch)}" placeholder="default" autocapitalize="off" spellcheck="false"></label>
        </div>
        <label class="field"><span>GitHub token</span><input name="token" type="password" value="${esc(cfg.token)}" placeholder="github_pat_…" autocapitalize="off" spellcheck="false"></label>
        <label class="field"><span>This device’s name</span><input name="device" value="${esc(cfg.device)}"><span class="hint">Shows in the repo’s history so you can tell which device made a change.</span></label>
        <div class="btn-row" style="margin-top:0"><button class="btn primary sm" type="submit">Save &amp; sync</button>
          ${cfg.token ? '<button class="btn sm" type="button" data-action="forget-token">Remove token from this device</button>' : ''}</div>
      </form>
      ${conn}
    </section>

    <section class="card">
      <h2>Import &amp; export</h2>
      <p class="desc">Back up everything as JSON, open it in a spreadsheet as CSV, or bring in a CSV list (columns like name, phone, email, company, type, address, notes).</p>
      <div class="btn-row">
        <button class="btn sm" type="button" data-action="export-json">${icon('download')}Export JSON</button>
        <button class="btn sm" type="button" data-action="export-csv">${icon('download')}Export CSV</button>
        <label class="btn sm">${icon('upload')}Import file<input type="file" accept=".json,.csv,text/csv,application/json" data-action="import" hidden></label>
      </div>
    </section>

    <section class="card">
      <h2>App icon</h2>
      <p class="desc">To put Lead Book on your Android home screen: open this site in Chrome, tap ⋮, then “Add to Home screen” (or “Install app”).</p>
      <div class="logo-pick"><img src="icons/icon-192.png" alt="Current app icon"></div>
    </section>
  </div>`;
}

/* ================= Sheets (dialogs) ================= */

const sheet = () => $('#sheet');
const dialogOpen = () => sheet().open;
function openSheet(html, onSubmit) {
  const d = sheet();
  d.innerHTML = html;
  const f = d.querySelector('form');
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (e.submitter && e.submitter.value === 'cancel') { d.close(); return; }
    if (onSubmit(new FormData(f), f) !== false) d.close();
  });
  d.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => d.close()));
  d.showModal();
  const first = d.querySelector('[autofocus]');
  if (first && matchMedia('(min-width: 700px)').matches) first.focus();
}
sheet().addEventListener('click', e => { if (e.target === sheet()) sheet().close(); });

const options = (arr, sel, blank) => (blank ? `<option value="">${blank}</option>` : '') + arr.map(v => {
  const [val, label] = Array.isArray(v) ? v : [v, v];
  return `<option value="${esc(val)}"${val === sel ? ' selected' : ''}>${esc(label)}</option>`;
}).join('');

function sheetShell(title, body, submitLabel) {
  return `<form class="sheet-form" method="dialog" novalidate>
    <div class="sheet-head"><h2 id="sheetTitle">${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="sheet-scroll"><div class="sheet-body">${body}</div></div>
    <div class="sheet-foot"><button type="button" class="btn" data-close>Cancel</button><button type="submit" class="btn primary">${esc(submitLabel)}</button></div>
  </form>`;
}

const followupChoices = cur => `
  <div class="seg" role="radiogroup" aria-label="Next follow-up">
    ${[['keep', cur ? 'Keep ' + fmtDay(cur, { month: 'short', day: 'numeric' }) : 'None'], ['1', 'Tomorrow'], ['3', 'In 3 days'], ['7', 'Next week'], ['14', 'In 2 weeks'], ['30', 'In a month'], ['clear', 'Clear']]
      .filter(([v]) => !(v === 'clear' && !cur))
      .map(([v, l], i) => `<label><input type="radio" name="fu" value="${v}"${i === 0 ? ' checked' : ''}><span>${l}</span></label>`).join('')}
  </div>
  <label class="field" style="margin-top:8px"><span>Or pick a date</span><input type="date" name="fuDate" min="${today()}"></label>`;

function resolveFollowup(fd, cur) {
  const d = fd.get('fuDate');
  if (d) return d;
  const v = fd.get('fu');
  if (v === 'keep' || v == null) return cur || '';
  if (v === 'clear') return '';
  return addDays(today(), Number(v));
}

function contactForm(c = {}) {
  const isNew = !c.id;
  const picker = isNew && 'contacts' in navigator && 'ContactsManager' in window
    ? `<button type="button" class="btn sm" data-pick-contact>${icon('contact')}Pick from phone contacts</button>` : '';
  const body = `<div class="form">
    ${picker}
    <label class="field"><span>Name</span><input name="name" required autofocus value="${esc(c.name)}" autocomplete="off"></label>
    <div class="two">
      <label class="field"><span>Phone</span><input name="phone" type="tel" inputmode="tel" value="${esc(c.phone)}"></label>
      <label class="field"><span>Email</span><input name="email" type="email" inputmode="email" autocapitalize="off" value="${esc(c.email)}"></label>
      <label class="field"><span>Type</span><select name="type">${options(TYPES, c.type || 'Homebuyer')}</select></label>
      <label class="field"><span>Company</span><input name="company" value="${esc(c.company)}" placeholder="Brokerage, lender…"></label>
      <label class="field"><span>Status</span><select name="status">${options(STATUSES.map(s => [s.id, s.label]), c.status || 'new')}</select></label>
      <label class="field"><span>Source</span><select name="source">${options(SOURCES, c.source, 'Choose…')}</select></label>
    </div>
    <label class="field"><span>Referred by</span><input name="referredBy" value="${esc(c.referredBy)}" placeholder="Who sent them your way"></label>
    <label class="field"><span>Address</span><input name="address" value="${esc(c.address)}" placeholder="Property or office address"></label>
    <label class="field"><span>Tags</span><input name="tags" value="${esc((c.tags || []).join(', '))}" placeholder="e.g. first-time buyer, radon, West Jordan"><span class="hint">Separate with commas.</span></label>
    <label class="field"><span>Notes</span><textarea name="notes">${esc(c.notes)}</textarea></label>
    ${isNew ? `<div class="field"><span>First follow-up</span>${followupChoices('')}</div>` : ''}
  </div>`;
  openSheet(sheetShell(isNew ? 'Add contact' : 'Edit contact', body, isNew ? 'Add contact' : 'Save changes'), (fd, f) => {
    const name = String(fd.get('name') || '').trim();
    if (!name) { f.querySelector('[name=name]').focus(); toast('Add a name first'); return false; }
    const data = {
      name,
      phone: fd.get('phone').trim(), email: fd.get('email').trim(), type: fd.get('type'), company: fd.get('company').trim(),
      status: fd.get('status'), source: fd.get('source'), referredBy: fd.get('referredBy').trim(), address: fd.get('address').trim(),
      tags: fd.get('tags').split(',').map(s => s.trim()).filter(Boolean), notes: fd.get('notes').trim(),
    };
    if (isNew) data.nextFollowUp = resolveFollowup(fd, '') || (data.status === 'new' || data.status === 'to_contact' ? today() : '');
    const saved = upsertContact(data, c.id);
    commit();
    if (isNew) { location.hash = '#person/' + saved.id; toast(`Added ${saved.name}`); } else toast('Saved');
  });
  const pickBtn = sheet().querySelector('[data-pick-contact]');
  if (pickBtn) pickBtn.addEventListener('click', async () => {
    try {
      const [p] = await navigator.contacts.select(['name', 'tel', 'email', 'address'], { multiple: false });
      if (!p) return;
      const f = sheet().querySelector('form');
      if (p.name?.[0]) f.name.value = p.name[0];
      if (p.tel?.[0]) f.phone.value = p.tel[0];
      if (p.email?.[0]) f.email.value = p.email[0];
      const a = p.address?.[0];
      if (a) f.address.value = [a.addressLine?.join(' '), a.city, a.region, a.postalCode].filter(Boolean).join(', ');
    } catch { /* user cancelled */ }
  });
}

function logForm(c) {
  const suggested = ['new', 'to_contact'].includes(c.status) ? 'contacted' : '';
  const body = `<div class="form">
    <p class="muted" style="margin:0">${esc(c.name)}${c.phone ? ' · ' + esc(c.phone) : ''}</p>
    <div class="field"><span>What happened</span>
      <div class="seg" role="radiogroup" aria-label="Activity type">
        ${ACTS.map((a, i) => `<label><input type="radio" name="type" value="${a.id}"${i === 0 ? ' checked' : ''}><span>${icon(a.icon)}${a.label}</span></label>`).join('')}
      </div></div>
    <div class="field"><span>Result</span>
      <div class="seg" role="radiogroup" aria-label="Result">
        ${['Reached', 'Left voicemail', 'No answer', 'Replied', 'Booked'].map(o => `<label><input type="radio" name="outcome" value="${o}"><span>${o}</span></label>`).join('')}
      </div></div>
    <label class="field"><span>Notes</span><textarea name="note" placeholder="What did you talk about? What’s next?"></textarea></label>
    <div class="two">
      <label class="field"><span>Status</span><select name="status">${options(STATUSES.map(s => [s.id, s.label + (s.id === c.status ? ' (current)' : '')]), suggested || c.status)}</select></label>
      <label class="field"><span>When</span><input type="date" name="date" value="${today()}" max="${today()}"></label>
    </div>
    <div class="field"><span>Next follow-up</span>${followupChoices(c.nextFollowUp)}</div>
  </div>`;
  openSheet(sheetShell('Log contact', body, 'Save'), fd => {
    const d = fd.get('date') || today();
    const at = d === today() ? nowIso() : new Date(parseYmd(d).setHours(12)).toISOString();
    c.activities = c.activities || [];
    c.activities.push({ id: uid(), type: fd.get('type'), outcome: fd.get('outcome') || '', note: fd.get('note').trim(), at, updatedAt: nowIso() });
    let status = fd.get('status');
    if (fd.get('outcome') === 'Booked' && ACTIVE_STATUSES.includes(status) && status !== 'scheduled') status = 'scheduled';
    setStatus(c, status);
    c.nextFollowUp = resolveFollowup(fd, c.nextFollowUp);
    c.updatedAt = nowIso();
    commit();
    toast('Logged');
  });
  // "Booked" result nudges the status to Inspection booked.
  sheet().querySelectorAll('[name=outcome]').forEach(r => r.addEventListener('change', () => {
    if (r.value === 'Booked' && r.checked) sheet().querySelector('[name=status]').value = 'scheduled';
  }));
}

function followupForm(c) {
  openSheet(sheetShell('Next follow-up', `<div class="form"><p class="muted" style="margin:0">${esc(c.name)}</p>${followupChoices(c.nextFollowUp)}</div>`, 'Save'), fd => {
    c.nextFollowUp = resolveFollowup(fd, c.nextFollowUp);
    c.updatedAt = nowIso();
    commit();
  });
}

/* ================= Import / export ================= */

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const CSV_COLS = ['name', 'phone', 'email', 'type', 'company', 'status', 'source', 'referredBy', 'address', 'tags', 'nextFollowUp', 'notes', 'lastContact'];
function toCsv() {
  const q = v => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  const rows = live().map(c => CSV_COLS.map(k => q(String(
    k === 'tags' ? (c.tags || []).join('; ') : k === 'status' ? STATUS[c.status]?.label || c.status : k === 'lastContact' ? (lastOutreach(c)?.at || '').slice(0, 10) : c[k] ?? ''))).join(','));
  return [CSV_COLS.join(','), ...rows].join('\n');
}
function parseCsv(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}
function importCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return 0;
  const head = rows[0].map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
  const col = (...names) => head.findIndex(h => names.includes(h));
  const idx = {
    name: col('name', 'fullname', 'contact'), first: col('firstname', 'first'), last: col('lastname', 'last'),
    phone: col('phone', 'phonenumber', 'mobile', 'cell'), email: col('email', 'emailaddress'), company: col('company', 'organization', 'brokerage'),
    type: col('type'), status: col('status'), source: col('source'), address: col('address'), notes: col('notes', 'note'), tags: col('tags'),
    followup: col('nextfollowup', 'followup'),
  };
  let n = 0;
  for (const r of rows.slice(1)) {
    const g = k => (idx[k] >= 0 ? (r[idx[k]] || '').trim() : '');
    const name = g('name') || [g('first'), g('last')].filter(Boolean).join(' ');
    if (!name) continue;
    const st = STATUSES.find(s => s.label.toLowerCase() === g('status').toLowerCase() || s.id === g('status'));
    upsertContact({
      name, phone: g('phone'), email: g('email'), company: g('company'), type: TYPES.find(t => t.toLowerCase() === g('type').toLowerCase()) || g('type') || 'Other',
      status: st ? st.id : 'to_contact', source: g('source'), address: g('address'), notes: g('notes'),
      tags: g('tags').split(/[;,]/).map(s => s.trim()).filter(Boolean), nextFollowUp: /^\d{4}-\d{2}-\d{2}$/.test(g('followup')) ? g('followup') : '',
    });
    n++;
  }
  return n;
}

/* ================= Events ================= */

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.tagName === 'SELECT' || el.type === 'radio' || el.type === 'file') return;
  const id = el.dataset.id;
  const c = id ? byId(id) : null;
  switch (el.dataset.action) {
    case 'new-contact': contactForm(); break;
    case 'log': if (c) logForm(c); break;
    case 'edit': if (c) contactForm(c); break;
    case 'followup': if (c) followupForm(c); break;
    case 'delete': if (c && confirm(`Delete ${c.name}? You can undo right after.`)) deleteContact(id); break;
    case 'del-act': {
      const a = c && c.activities.find(x => x.id === el.dataset.act);
      if (a) { a.deleted = true; a.updatedAt = nowIso(); c.updatedAt = nowIso(); commit(); toast('Removed', { label: 'Undo', run: () => { a.deleted = false; a.updatedAt = nowIso(); c.updatedAt = nowIso(); commit(); } }); }
      break;
    }
    case 'filter': ui.filter = el.dataset.f; render(); break;
    case 'week': ui.weekOffset = el.dataset.d === '0' ? 0 : ui.weekOffset + Number(el.dataset.d); render(); break;
    case 'sync-now':
      if (!syncReady()) { location.hash = '#settings'; toast('Set up sync to share contacts across devices'); }
      else if ($('#syncPill').dataset.state === 'error') { toast(sync.lastError || 'Sync failed'); sync(); }
      else sync();
      break;
    case 'forget-token': cfg.token = ''; saveCfg(); render(); idleSyncState(); toast('Token removed from this device'); break;
    case 'export-json': download(`lead-book-${today()}.json`, JSON.stringify(db, null, 1), 'application/json'); break;
    case 'export-csv': download(`lead-book-${today()}.csv`, toCsv(), 'text/csv'); break;
  }
});

document.addEventListener('change', async e => {
  const el = e.target;
  const act = el.dataset.action;
  if (act === 'status') { const c = byId(el.dataset.id); if (c) { setStatus(c, el.value); commit(); toast(`Status: ${STATUS[el.value].label}`); } }
  else if (act === 'sort') { ui.sort = el.value; render(); }
  else if (act === 'theme') { cfg.theme = el.value; saveCfg(); applyTheme(); render(); }
  else if (act === 'light-from') { cfg.lightFrom = Number(el.value); saveCfg(); applyTheme(); }
  else if (act === 'light-to') { cfg.lightTo = Number(el.value); saveCfg(); applyTheme(); }
  else if (act === 'import' && el.files[0]) {
    const f = el.files[0], text = await f.text();
    try {
      if (/\.json$/i.test(f.name) || text.trim().startsWith('{')) {
        const data = JSON.parse(text);
        if (!Array.isArray(data.contacts)) throw new Error('No contacts in that file');
        const before = live().length;
        db = mergeDb(db, data);
        commit();
        toast(`Imported · ${live().length - before} new contacts`);
      } else {
        const n = importCsv(text);
        commit();
        toast(n ? `Imported ${n} contacts` : 'No rows with a name column found');
      }
    } catch (err) { toast('Couldn’t read that file: ' + err.message); }
    el.value = '';
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'q') { ui.q = e.target.value; render(); }
});

document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]');
  if (!f) return;
  e.preventDefault();
  const fd = new FormData(f);
  if (f.dataset.form === 'business') { cfg.business = fd.get('business').trim(); saveCfg(); render(); toast('Saved'); }
  if (f.dataset.form === 'goals') {
    db.goals = Object.fromEntries(['added', 'outreach', 'booked', 'clients'].map(k => [k, Math.max(0, parseInt(fd.get(k), 10) || 0)]));
    db.goalsUpdatedAt = nowIso();
    commit();
    toast('Goals saved');
  }
  if (f.dataset.form === 'sync') {
    for (const k of ['owner', 'repo', 'path', 'branch', 'token', 'device']) cfg[k] = String(fd.get(k) || '').trim();
    saveCfg();
    sync.lastError = '';
    sync().then(() => { render(); toast($('#syncPill').dataset.state === 'ok' ? 'Connected and synced' : (sync.lastError || 'Sync failed')); });
  }
});

window.addEventListener('hashchange', () => { render(); if (!location.hash.startsWith('#person')) window.scrollTo(0, 0); });

/* ================= Boot ================= */

applyTheme();
render();
idleSyncState();
sync();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Handy for debugging in the console.
window.leadBook = { get db() { return db; }, sync };
