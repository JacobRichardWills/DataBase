// Lead Book — client planner for an inspection business.
//
// Data: data/leadbook.json in this GitHub repo.
// Every edit goes into a draft kept on this device. "Save changes" merges the
// draft with the latest copy in the repo and commits it with a summary of
// what changed, so the History tab (the repo's commit log) reads like a diary.

/* ================= Constants ================= */

const STAGES = [
  { n: 1, label: 'Initial connection', short: 'Connected', list: 'Lead' },
  { n: 2, label: 'Service scheduled', short: 'Scheduled', list: 'Client' },
  { n: 3, label: 'Service completed', short: 'Completed', list: 'Serviced' },
  { n: 4, label: 'Recurring client', short: 'Recurring', list: 'Recurring' },
];

const TYPES = ['Homebuyer', 'Homeowner / seller', 'Realtor', 'Property manager', 'Lender', 'Contractor', 'Investor', 'Other'];
const SOURCES = ['Referral', 'Realtor', 'Past client', 'Door knock', 'Open house', 'Website', 'Social media', 'Networking event', 'Other'];

const ACTS = [
  { id: 'text', label: 'Text', title: 'Text sent', icon: 'message' },
  { id: 'call', label: 'Call', title: 'Phone call', icon: 'phone' },
  { id: 'email', label: 'Email', title: 'Email sent', icon: 'mail' },
  { id: 'in_person', label: 'In person', title: 'Met in person', icon: 'handshake' },
  { id: 'service', label: 'Service', title: 'Inspection', icon: 'clipboard' },
  { id: 'quote', label: 'Quote', title: 'Sent a quote', icon: 'receipt' },
  { id: 'note', label: 'Note', title: 'Note', icon: 'note' },
];
const ACT = Object.fromEntries(ACTS.map(a => [a.id, a]));
const OUTREACH = new Set(['text', 'call', 'email', 'in_person']);
const NOTE_COLORS = ['yellow', 'mint', 'sky', 'rose'];

const ICON = {
  phone: '<path d="M5 4h3.5l1.5 4-2 1.3a11 11 0 0 0 6.7 6.7l1.3-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>',
  message: '<path d="M4 5.5h16v10H9l-4.5 3.5v-3.5H4z"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
  handshake: '<path d="m3 11 3.5-3.5L10 9l2-1.5 2 1.5 3.5-1.5L21 11"/><path d="m6.5 13.5 3 3a1.5 1.5 0 0 0 2 0l.5-.5.5.5a1.5 1.5 0 0 0 2 0l3-3"/><path d="M3 11l3.5 2.5M21 11l-3.5 2.5M12 16l-2-2"/>',
  clipboard: '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5V3h6v1.5M8.5 12l2.2 2.2 4.8-4.7"/>',
  receipt: '<path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"/><path d="M9 8h6M9 11.5h6M9 15h3"/>',
  note: '<path d="M6 3.5h9l3.5 3.5v13.5H6z"/><path d="M9 11h6M9 15h4"/>',
  flag: '<path d="M5 21V4M5 4.5h11l-2 4 2 4H5"/>',
  pin: '<path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  chevL: '<path d="m14.5 6-6 6 6 6"/>',
  chevD: '<path d="m6 9.5 6 6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9.5l5-5 5 5M5 20h14"/>',
  archive: '<rect x="3.5" y="4.5" width="17" height="4" rx="1"/><path d="M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5M10 12.5h4"/>',
  restore: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5a3 3 0 0 0 3 4M16 5.5h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M9.5 17h5v3h-5z"/>',
  sparkle: '<path d="M12 3.5 13.8 9 19.5 11l-5.7 2L12 18.5 10.2 13 4.5 11l5.7-2z"/><path d="M19 3v3M17.5 4.5h3"/>',
  task: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  sticky: '<path d="M5 4h14v10l-6 6H5z"/><path d="M13 20v-6h6"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  commit: '<circle cx="12" cy="12" r="3.5"/><path d="M3 12h5.5M15.5 12H21"/>',
  code: '<path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  device: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
};
const icon = (n, cls = '') => `<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${ICON[n] || ''}</svg>`;

/* ================= Storage ================= */

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* full or blocked */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* blocked */ } },
};

const DEFAULT_GOALS = {
  items: [
    { id: 'new_clients', label: 'New contacts added', target: 10 },
    { id: 'outreach', label: 'Texts, calls & visits', target: 25 },
    { id: 'scheduled', label: 'Services scheduled', target: 3 },
    { id: 'completed', label: 'Services completed', target: 2 },
  ],
  updatedAt: '',
};
const emptyDb = () => ({ version: 2, clients: [], tasks: [], wins: [], goals: structuredClone(DEFAULT_GOALS) });

function guessDevice() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'Android phone';
  if (/iPhone|iPad/i.test(ua)) return 'iPhone';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows laptop';
  return 'browser';
}
const defaultCfg = () => ({
  theme: 'auto', lightFrom: 7, lightTo: 19, business: '', name: 'Jacob',
  owner: 'JacobRichardWills', repo: 'DataBase', branch: 'main', path: 'data/leadbook.json', token: '',
  device: guessDevice(),
});

let cfg = Object.assign(defaultCfg(), LS.get('lb.cfg', {}));
if (cfg.repo === 'DataBase-data') Object.assign(cfg, { repo: 'DataBase', path: 'data/leadbook.json', branch: 'main' }); // older setup
LS.set('lb.cfg', cfg);

let base = LS.get('lb2.base', null);          // last copy seen in the repo
let draft = LS.get('lb2.draft', null);        // what you see, including unsaved edits
let pending = LS.get('lb2.pending', []);      // [{key, text, at}]
let remoteSha = LS.get('lb2.sha', null);
let lastPull = LS.get('lb2.lastPull', '');
if (!draft) draft = base ? structuredClone(base) : emptyDb();
normalize(draft);

let ui = { filter: 'active', q: '', showDone: false, histFilter: 'all' };

function normalize(d) {
  d.clients ||= []; d.tasks ||= []; d.wins ||= [];
  d.goals ||= structuredClone(DEFAULT_GOALS);
  d.goals.items ||= structuredClone(DEFAULT_GOALS.items);
  for (const c of d.clients) { c.activities ||= []; c.stages ||= {}; }
  return d;
}

let persistTimer;
function persist(now = false) {
  clearTimeout(persistTimer);
  const go = () => { LS.set('lb2.draft', draft); LS.set('lb2.pending', pending); };
  if (now) go(); else persistTimer = setTimeout(go, 250);
}
function saveCfg() { LS.set('lb.cfg', cfg); }

/* ================= Utilities ================= */

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nowIso = () => new Date().toISOString();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const daysBetween = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
const fmtDay = (s, opts = { month: 'short', day: 'numeric' }) => s ? parseYmd(s).toLocaleDateString(undefined, opts) : '';
const dayOf = v => !v ? '' : v.length === 10 ? v : ymd(new Date(v));
const digits = p => String(p).replace(/[^\d+]/g, '');
const initials = n => String(n || '?').replace(/^the\s+/i, '').split(/\s+/).filter(w => /^[a-z0-9]/i.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();

function relDay(s) {
  if (!s) return '';
  const n = daysBetween(today(), s);
  if (n < -1) return `${-n} days overdue`;
  if (n === -1) return 'Overdue since yesterday';
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n < 7) return fmtDay(s, { weekday: 'long' });
  return fmtDay(s, { month: 'short', day: 'numeric' });
}
function shortDue(s) {
  const n = daysBetween(today(), s);
  if (n < 0) return `${-n}d overdue`;
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n < 7) return fmtDay(s, { weekday: 'short' });
  return fmtDay(s);
}
const dueClass = s => { if (!s) return ''; const n = daysBetween(today(), s); return n < 0 ? 'overdue' : n === 0 ? 'today' : ''; };
function relWhen(v) {
  if (!v) return '';
  const d = dayOf(v), n = daysBetween(d, today());
  if (n === 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n < 7 && n > 0) return fmtDay(d, { weekday: 'short' });
  return fmtDay(d, { month: 'short', day: 'numeric', year: parseYmd(d).getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}
function timeAgo(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const alive = x => !x.deleted;
const clients = () => draft.clients.filter(alive);
const activeClients = () => clients().filter(c => !c.archived);
const byId = id => draft.clients.find(c => c.id === id && alive(c));
const acts = c => (c.activities || []).filter(alive).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
const stageOf = c => Math.max(0, ...STAGES.filter(s => c.stages?.[s.n]).map(s => s.n));
const openTasks = () => draft.tasks.filter(t => alive(t) && t.kind === 'task' && !t.done);
function needsAction(c) {
  if (c.archived) return false;
  const t = today();
  if (c.nextFollowUp && c.nextFollowUp <= t) return true;
  return openTasks().some(k => k.clientId === c.id && k.due && k.due <= t);
}
const cdot = (c, cls = '') => `<span class="cdot ${cls}" data-st="${stageOf(c)}" aria-label="${esc(STAGES[stageOf(c) - 1]?.label || 'No stage')}${needsAction(c) ? ', needs action' : ''}">${esc(initials(c.name))}${needsAction(c) ? '<span class="alert"></span>' : ''}</span>`;

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
  $('meta[name="theme-color"]').setAttribute('content', t === 'dark' ? '#0B141E' : '#1F5594');
}
setInterval(applyTheme, 60 * 1000);

/* ================= Changes (draft) ================= */

// Record a change for the save bar. Same key = same change (typing in a field counts once).
function change(key, text, { rerender = true } = {}) {
  const i = pending.findIndex(p => p.key === key);
  const entry = { key, text, at: nowIso() };
  if (i >= 0) pending[i] = entry; else pending.push(entry);
  persist();
  updateSaveBar();
  if (rerender) render();
}
const touch = x => { x.updatedAt = nowIso(); return x; };

function updateSaveBar() {
  const n = pending.length;
  document.body.classList.toggle('has-pending', n > 0);
  $('#savebar').hidden = n === 0;
  $('#saveCount').textContent = `${n} unsaved ${n === 1 ? 'change' : 'changes'}`;
  const oldest = pending.reduce((m, p) => (!m || p.at < m ? p.at : m), '');
  $('#savebar .savebar-info span').textContent = oldest && Date.now() - new Date(oldest) > 3 * 3600e3
    ? `On this device since ${timeAgo(oldest)} — tap to review` : 'Saved on this device · tap to review';
  pill();
}

function discardAll() {
  draft = normalize(base ? structuredClone(base) : emptyDb());
  pending = [];
  persist(true);
  updateSaveBar();
  render();
  toast('Changes discarded');
}

/* ================= GitHub ================= */

const repoApi = () => `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}`;
const fileApi = () => `${repoApi()}/contents/${cfg.path.split('/').map(encodeURIComponent).join('/')}`;
const hasToken = () => !!cfg.token.trim();

async function gh(url, opts = {}) {
  return fetch(url, {
    cache: 'no-store',
    ...opts,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(hasToken() ? { Authorization: `Bearer ${cfg.token.trim()}` } : {}),
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
}

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
function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return JSON.stringify(v);
}

class GhError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
function explain(status) {
  if (status === 401) return 'GitHub didn’t accept the token. Paste a new one in Settings.';
  if (status === 403) return 'This token can’t write to the repo, or GitHub is rate-limiting. Check it has Contents: Read and write.';
  if (status === 404) return 'Couldn’t find the repo or file. Check the repo settings.';
  return `GitHub returned an error (${status}).`;
}

async function fetchRemote() {
  if (hasToken()) {
    const r = await gh(fileApi() + `?ref=${encodeURIComponent(cfg.branch)}`);
    if (r.status === 404) return { data: null, sha: null };
    if (!r.ok) throw new GhError(r.status, explain(r.status));
    const j = await r.json();
    let text = j.content ? b64dec(j.content) : '';
    if (!j.content) {
      const br = await gh(`${repoApi()}/git/blobs/${j.sha}`);
      if (!br.ok) throw new GhError(br.status, explain(br.status));
      text = b64dec((await br.json()).content);
    }
    return { data: normalize(JSON.parse(text)), sha: j.sha };
  }
  // Public repo without a token: read the raw file (no API rate limit).
  const url = `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/${cfg.branch}/${cfg.path}?t=${Date.now()}`;
  let r = await fetch(url, { cache: 'no-store' }).catch(() => null);
  if (!r || !r.ok) r = await fetch(`${cfg.path}?t=${Date.now()}`, { cache: 'no-store' }).catch(() => null); // same-site copy on Pages
  if (!r || r.status === 404) return { data: null, sha: null };
  if (!r.ok) throw new GhError(r.status, explain(r.status));
  return { data: normalize(await r.json()), sha: null };
}

function mergeList(a = [], b = [], withActs = false) {
  const map = new Map();
  for (const x of b) map.set(x.id, x);
  for (const x of a) {
    const o = map.get(x.id);
    if (!o) { map.set(x.id, x); continue; }
    const win = (x.updatedAt || '') >= (o.updatedAt || '') ? x : o;
    if (!withActs) { map.set(x.id, win); continue; }
    const lose = win === x ? o : x;
    const am = new Map();
    for (const y of lose.activities || []) am.set(y.id, y);
    for (const y of win.activities || []) { const z = am.get(y.id); if (!z || (y.updatedAt || '') >= (z.updatedAt || '')) am.set(y.id, y); }
    map.set(x.id, { ...win, activities: [...am.values()] });
  }
  return [...map.values()].sort((p, q) => (p.createdAt || '').localeCompare(q.createdAt || ''));
}
// a = local draft, b = copy from the repo. Newer edits win per item.
function mergeDb(a, b) {
  a = normalize(structuredClone(a)); b = normalize(structuredClone(b));
  return {
    version: 2,
    clients: mergeList(a.clients, b.clients, true),
    tasks: mergeList(a.tasks, b.tasks),
    wins: mergeList(a.wins, b.wins),
    goals: (a.goals.updatedAt || '') >= (b.goals.updatedAt || '') ? a.goals : b.goals,
  };
}

let pulling = false;
async function pull({ quiet = true } = {}) {
  if (pulling || saving) return;
  if (!navigator.onLine) { pill(); return; }
  pulling = true;
  try {
    const { data, sha } = await fetchRemote();
    lastPull = nowIso(); LS.set('lb2.lastPull', lastPull);
    pull.error = '';
    if (!data) { pill(); return; }
    if (sha) { remoteSha = sha; LS.set('lb2.sha', sha); }
    const changed = !base || canon(data) !== canon(base);
    if (changed) {
      base = data; LS.set('lb2.base', base);
      draft = pending.length ? mergeDb(draft, data) : structuredClone(data);
      normalize(draft);
      persist(true);
      if (!dialogOpen() && !editingInline()) render();
    }
  } catch (e) {
    console.error(e);
    pull.error = e.message || 'Couldn’t load the latest data.';
    if (!quiet) toast(pull.error);
  } finally {
    pulling = false;
    pill();
  }
}

let saving = false;
async function save() {
  if (!pending.length) return;
  if (!hasToken()) { tokenSheet(); return; }
  if (!navigator.onLine) { toast('You’re offline. Your changes are safe on this device — save when you’re back online.'); return; }
  saving = true;
  pill('busy', 'Saving');
  $('.save-btn').disabled = true;
  try {
    const lines = pending.map(p => p.text);
    let done = false;
    for (let attempt = 0; attempt < 4 && !done; attempt++) {
      const r = await gh(fileApi() + `?ref=${encodeURIComponent(cfg.branch)}`);
      let remote = null, sha = null;
      if (r.ok) { const j = await r.json(); sha = j.sha; remote = normalize(JSON.parse(j.content ? b64dec(j.content) : '{}')); }
      else if (r.status !== 404) throw new GhError(r.status, explain(r.status));
      const merged = remote ? mergeDb(draft, remote) : mergeDb(draft, emptyDb());
      prune(merged);
      const title = lines.length === 1 ? lines[0] : `${lines.length} updates: ${lines.slice(0, 2).join('; ')}${lines.length > 2 ? '…' : ''}`;
      const message = `${title.slice(0, 90)}\n\n${lines.map(l => '- ' + l).join('\n')}\n\nSaved from Lead Book app (${cfg.device || 'browser'})`;
      const put = await gh(fileApi(), {
        method: 'PUT',
        body: JSON.stringify({ message, content: b64enc(JSON.stringify(merged, null, 1) + '\n'), branch: cfg.branch, ...(sha ? { sha } : {}) }),
      });
      if (put.status === 409 || (put.status === 422 && sha)) continue; // someone saved in between; merge again
      if (!put.ok) throw new GhError(put.status, explain(put.status));
      const j = await put.json();
      remoteSha = j.content?.sha || null; LS.set('lb2.sha', remoteSha);
      base = merged; draft = structuredClone(merged); pending = [];
      LS.set('lb2.base', base); persist(true);
      done = true;
    }
    if (!done) throw new Error('The file kept changing while saving. Try again.');
    history.cache = null;
    updateSaveBar();
    render();
    toast('Saved to GitHub');
  } catch (e) {
    console.error(e);
    save.error = e.message;
    toast(e.message || 'Save failed. Your changes are still on this device.');
    if (e.status === 401) tokenSheet(e.message);
  } finally {
    saving = false;
    $('.save-btn').disabled = false;
    pill();
  }
}

// Drop deletion markers once they're a month old.
function prune(d) {
  const cut = new Date(Date.now() - 30 * 86400e3).toISOString();
  for (const k of ['clients', 'tasks', 'wins']) d[k] = d[k].filter(x => !(x.deleted && (x.updatedAt || '') < cut));
  for (const c of d.clients) c.activities = (c.activities || []).filter(a => !(a.deleted && (a.updatedAt || '') < cut));
}

function pill(state, text) {
  const p = $('#syncPill');
  if (!state) {
    if (saving) { state = 'busy'; text = 'Saving'; }
    else if (!navigator.onLine) { state = 'offline'; text = 'Offline'; }
    else if (pending.length) { state = 'pending'; text = `${pending.length} unsaved`; }
    else if (pull.error) { state = 'error'; text = 'Can’t reach GitHub'; }
    else if (!hasToken()) { state = 'off'; text = 'View only'; }
    else { state = 'ok'; text = 'Up to date'; }
  }
  p.dataset.state = state;
  p.querySelector('.sync-text').textContent = text;
}

window.addEventListener('online', () => pull());
window.addEventListener('offline', () => pill());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { applyTheme(); pull(); if (!dialogOpen()) render(); } });
setInterval(() => { if (document.visibilityState === 'visible') pull(); }, 90 * 1000);

/* ================= Rendering ================= */

const route = () => {
  const [name = 'dashboard', id] = location.hash.replace(/^#/, '').split('/');
  return { name: name || 'dashboard', id };
};
const editingInline = () => document.activeElement?.classList?.contains('ed');

function render() {
  const r = route();
  const tab = r.name === 'client' ? 'clients' : r.name;
  document.querySelectorAll('.tabs a').forEach(a => {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  $('#brandSub').textContent = cfg.business || '';
  $('#fab').hidden = !(r.name === 'dashboard' || r.name === 'clients');
  $('#fab').setAttribute('aria-label', r.name === 'clients' ? 'Add client' : 'Add');
  const views = { dashboard: viewDashboard, clients: viewClients, client: viewClients, history: viewHistory, settings: viewSettings };
  const active = document.activeElement;
  const keepSearch = active && active.id === 'q';
  const caret = keepSearch ? active.selectionStart : 0;
  const pane = $('.detail-pane');
  const paneScroll = pane ? pane.scrollTop : 0;
  $('#view').innerHTML = (views[r.name] || viewDashboard)(r);
  if (keepSearch) { const q = $('#q'); if (q) { q.focus(); q.setSelectionRange(caret, caret); } }
  if (pane && $('.detail-pane')) $('.detail-pane').scrollTop = paneScroll;
  const titles = { dashboard: 'Dashboard', clients: 'Clients', client: byId(r.id)?.name || 'Client', history: 'History', settings: 'Settings' };
  document.title = `${titles[r.name] || 'Dashboard'} · Lead Book`;
}

const empty = (title, body) => `<div class="empty"><strong>${esc(title)}</strong>${esc(body)}</div>`;
const sectionHead = (title, ico, right = '') => `<div class="section-head"><h2 class="section-title">${ico ? icon(ico) : ''}${title}</h2>${right}</div>`;

/* ---------- Dashboard ---------- */

function startOfWeek(s) { const d = parseYmd(s); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return ymd(d); }

function weekNumbers() {
  const start = startOfWeek(today()), end = addDays(start, 7);
  const inWeek = v => { const d = dayOf(v); return d >= start && d < end; };
  const cs = clients();
  const allActs = cs.flatMap(c => acts(c));
  return {
    new_clients: cs.filter(c => inWeek(c.createdAt)).length,
    outreach: allActs.filter(a => OUTREACH.has(a.type) && inWeek(a.date)).length,
    scheduled: cs.filter(c => c.stages[2] && inWeek(c.stages[2])).length,
    completed: cs.filter(c => c.stages[3] && inWeek(c.stages[3])).length,
  };
}

function viewDashboard() {
  const t = today();
  const hr = new Date().getHours();
  const hello = `${hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'}${cfg.name ? ', ' + cfg.name : ''}`;
  const act = activeClients();
  const dueClients = act.filter(c => c.nextFollowUp && c.nextFollowUp <= t);
  const tasksOpen = openTasks();
  const dueTasks = tasksOpen.filter(k => k.due && k.due <= t);
  const laterTasks = tasksOpen.filter(k => !k.due || k.due > t).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  const doneTasks = draft.tasks.filter(k => alive(k) && k.kind === 'task' && k.done).sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || '')).slice(0, 8);
  const overdueCount = dueClients.filter(c => c.nextFollowUp < t).length + dueTasks.filter(k => k.due < t).length;
  const notes = draft.tasks.filter(k => alive(k) && k.kind === 'note').sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const wins = draft.wins.filter(alive).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
  const winsWeek = wins.filter(w => w.date >= startOfWeek(t)).length;
  const upcoming = act.filter(c => c.nextFollowUp > t && c.nextFollowUp <= addDays(t, 7)).sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp));

  const attention = [
    ...dueClients.map(c => ({ sort: c.nextFollowUp, html: clientItem(c, c.followUpNote || 'Follow up', c.nextFollowUp) })),
    ...dueTasks.map(k => ({ sort: k.due, html: taskItem(k) })),
  ].sort((a, b) => a.sort.localeCompare(b.sort));

  const n = weekNumbers();
  const goals = draft.goals.items.map(g => {
    const v = n[g.id] ?? 0, pct = g.target ? Math.min(100, Math.round(v / g.target * 100)) : 0;
    return `<div class="goal"><div class="goal-label">${esc(g.label)}</div><div class="goal-num">${v}<small>/ ${g.target}</small></div>
      <div class="meter ${v >= g.target && g.target ? 'done' : ''}" role="img" aria-label="${v} of ${g.target}"><i style="width:${pct}%"></i></div></div>`;
  }).join('');

  return `
  <section class="hero">
    <img src="icons/icon-192.png" alt="">
    <div class="hero-text">
      <div class="hero-date">${esc(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))}</div>
      <div class="hero-hello">${esc(hello)}</div>
      ${cfg.business ? `<div class="hero-biz">${esc(cfg.business)}</div>` : ''}
    </div>
    <div class="hero-stats">
      <div class="${overdueCount ? 'hot' : ''}"><b>${attention.length}</b><span>Need attention${overdueCount ? ` · ${overdueCount} overdue` : ''}</span></div>
      <div><b>${act.length}</b><span>Active clients</span></div>
      <div><b>${winsWeek}</b><span>Wins this week</span></div>
    </div>
  </section>

  <div class="dash">
    <div class="col-left">
      <section class="section">
        ${sectionHead('Needs attention', 'bell', `<span class="count">${attention.length || ''}</span>`)}
        ${attention.length ? `<ul class="items panel">${attention.map(a => a.html).join('')}</ul>`
          : empty('You’re all caught up', 'No follow-ups or tasks due today.')}
      </section>

      <section class="section">
        ${sectionHead('Tasks & reminders', 'task', `<button class="btn sm ghost" type="button" data-action="add-task">${icon('plus')}Add</button>`)}
        ${laterTasks.length ? `<ul class="items panel">${laterTasks.map(taskItem).join('')}</ul>` : empty('No upcoming tasks', 'Add a to-do, with or without a date.')}
        ${doneTasks.length ? `<button class="btn sm ghost" type="button" data-action="toggle-done" style="margin-top:6px">${ui.showDone ? 'Hide' : 'Show'} completed (${doneTasks.length})</button>
          ${ui.showDone ? `<ul class="items panel" style="margin-top:6px">${doneTasks.map(taskItem).join('')}</ul>` : ''}` : ''}
      </section>

      <section class="section">
        ${sectionHead('Next 7 days', 'calendar', `<span class="count">${upcoming.length || ''}</span>`)}
        ${upcoming.length ? `<ul class="items panel">${upcoming.map(c => clientItem(c, c.followUpNote || 'Follow up', c.nextFollowUp)).join('')}</ul>` : empty('Nothing scheduled', 'Set a follow-up date on a client and it’ll show here.')}
      </section>
    </div>

    <div class="col-right">
      <section class="section">
        ${sectionHead('Wins', 'trophy', `<button class="btn sm ghost" type="button" data-action="add-win">${icon('plus')}Add</button>`)}
        ${wins.length ? `<ul class="wins">${wins.slice(0, 6).map(winItem).join('')}</ul>` : empty('Log your first win', 'A new referral, a booked inspection, a great conversation — write it down.')}
      </section>

      <section class="section">
        ${sectionHead('Weekly goals', 'target', `<span><span class="draft-flag">In the works</span> <button class="btn sm ghost" type="button" data-action="edit-goals">Edit</button></span>`)}
        <div class="goals">${goals}</div>
      </section>

      <section class="section">
        ${sectionHead('Sticky notes', 'sticky', `<button class="btn sm ghost" type="button" data-action="add-note">${icon('plus')}Add</button>`)}
        ${notes.length ? `<div class="stickies">${notes.map(k => `<button type="button" class="sticky" data-color="${esc(k.color || 'yellow')}" data-action="edit-note" data-id="${k.id}">${esc(k.text)}<small>${esc(relWhen(k.createdAt))}</small></button>`).join('')}</div>`
          : empty('No sticky notes', 'Jot down quick reminders here.')}
      </section>
    </div>
  </div>`;
}

function clientItem(c, sub, due) {
  return `<li class="item">${cdot(c, 'sm')}
    <a class="item-main" href="#client/${c.id}"><div class="item-title">${esc(c.name)}</div>
    <div class="item-sub ${dueClass(due)}">${esc(sub)}${due ? ' · ' + esc(relDay(due)) : ''}</div></a>
    ${c.phone ? `<a class="icon-btn sm" href="sms:${digits(c.phone)}" aria-label="Text ${esc(c.name)}">${icon('message')}</a>` : ''}
    <button class="icon-btn sm" type="button" data-action="log" data-id="${c.id}" aria-label="Log contact with ${esc(c.name)}">${icon('plus')}</button></li>`;
}
function taskItem(k) {
  const c = k.clientId ? byId(k.clientId) : null;
  const sub = [k.due ? relDay(k.due) : '', c ? c.name : ''].filter(Boolean).join(' · ');
  return `<li class="item${k.done ? ' done' : ''}">
    <button class="check" type="button" role="checkbox" aria-checked="${!!k.done}" data-action="toggle-task" data-id="${k.id}" aria-label="Mark done">${icon('check')}</button>
    <button class="item-main" type="button" data-action="edit-task" data-id="${k.id}"><div class="item-title">${esc(k.text)}</div>
    ${sub ? `<div class="item-sub ${k.done ? '' : dueClass(k.due)}">${esc(sub)}</div>` : ''}</button></li>`;
}
function winItem(w) {
  const claude = w.by === 'claude';
  return `<li><button type="button" class="win${claude ? ' by-claude' : ''}" data-action="edit-win" data-id="${w.id}">
    <span class="win-icon">${icon(claude ? 'sparkle' : 'trophy')}</span>
    <span><span class="win-text">${esc(w.text)}</span><span class="win-meta" style="display:block">${claude ? '<b>Claude</b> · ' : ''}${esc(relWhen(w.date))}</span></span></button></li>`;
}

/* ---------- Clients ---------- */

function filteredClients() {
  const q = ui.q.trim().toLowerCase();
  let arr = clients();
  if (ui.filter === 'archived') arr = arr.filter(c => c.archived);
  else {
    arr = arr.filter(c => !c.archived);
    if (ui.filter === 'action') arr = arr.filter(needsAction);
    else if (/^st\d$/.test(ui.filter)) arr = arr.filter(c => stageOf(c) === Number(ui.filter[2]));
  }
  if (q) arr = arr.filter(c => [c.name, c.business, c.phone, c.email, c.address, c.type, c.notes].filter(Boolean).join(' ').toLowerCase().includes(q));
  return arr.sort((a, b) => (needsAction(b) - needsAction(a)) || a.name.localeCompare(b.name));
}

function viewClients(r) {
  const all = clients(), act = all.filter(c => !c.archived);
  const counts = { action: act.filter(needsAction).length, archived: all.length - act.length };
  STAGES.forEach(s => { counts['st' + s.n] = act.filter(c => stageOf(c) === s.n).length; });
  const chip = (id, label, n, color) => `<button type="button" class="chip" data-action="filter" data-f="${id}" aria-pressed="${ui.filter === id}">${color ? `<i style="background:${color}"></i>` : ''}${esc(label)} <small>${n}</small></button>`;
  const arr = filteredClients();
  const sel = r.name === 'client' ? byId(r.id) : null;

  const list = `<div class="list-pane">
    <div class="page-head"><h1 class="page-title">Clients</h1></div>
    <label class="search">${icon('search')}<span class="sr-only">Search clients</span>
      <input id="q" type="search" placeholder="Search name, business, phone, notes" value="${esc(ui.q)}" autocomplete="off"></label>
    <div class="chips" role="group" aria-label="Filter">
      ${chip('active', 'All active', act.length)}
      ${counts.action ? chip('action', 'Needs action', counts.action, 'var(--alert)') : ''}
      ${STAGES.map(s => counts['st' + s.n] ? chip('st' + s.n, s.list, counts['st' + s.n], `var(--st${s.n})`) : '').join('')}
      ${chip('archived', 'Archive', counts.archived)}
    </div>
    <div class="legend">${STAGES.map(s => `<span><i style="background:var(--st${s.n})"></i>${s.label}</span>`).join('')}<span><i style="background:var(--alert)"></i>Needs action</span></div>
    ${arr.length ? `<ul class="list">${arr.map(c => clientRow(c, sel && sel.id === c.id)).join('')}</ul>`
      : ui.filter === 'archived' ? empty('Archive is empty', 'Clients you archive from their page land here.')
      : all.length ? empty('No matches', 'Try another search or filter.') : empty('No clients yet', 'Tap + to add your first one.')}
  </div>`;

  const detail = r.name === 'client'
    ? (sel ? clientDetail(sel) : empty('Client not found', 'They may have been deleted on another device.'))
    : `<div class="empty"><strong>Pick a client</strong>Their info, progress and history open here.</div>`;

  return `<div class="split${r.name === 'client' ? ' has-detail' : ''}">${list}<div class="detail-pane">${detail}</div></div>`;
}

function clientRow(c, selected) {
  const side = c.archived ? 'Archived' : c.nextFollowUp ? shortDue(c.nextFollowUp) : '';
  return `<li><a class="row${selected ? ' selected' : ''}" href="#client/${c.id}">${cdot(c)}
    <div class="row-main"><div class="row-name">${esc(c.name)}</div>${c.business || c.type ? `<div class="row-biz">${esc(c.business || c.type)}</div>` : ''}</div>
    ${side ? `<div class="row-side ${c.archived ? '' : dueClass(c.nextFollowUp)}">${esc(side)}</div>` : ''}</a></li>`;
}

function ed(c, field, { cls = '', type = 'text', placeholder = '', label = '' } = {}) {
  return `<input class="ed ${cls}" type="${type}" value="${esc(c[field])}" placeholder="${esc(placeholder)}" data-edit="${field}" data-id="${c.id}"${label ? ` aria-label="${esc(label)}"` : ''}${type === 'tel' ? ' inputmode="tel"' : ''}${type === 'email' ? ' inputmode="email" autocapitalize="off"' : ''}>`;
}
function edSelect(c, field, opts, blank) {
  return `<select class="ed" data-edit="${field}" data-id="${c.id}">${blank ? `<option value="">${blank}</option>` : ''}${opts.map(o => `<option${o === c[field] ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
}

function clientDetail(c) {
  const st = stageOf(c);
  const hist = acts(c);
  const mapHref = c.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}` : '';
  const dis = v => v ? '' : 'disabled';
  return `<article class="card">
    <a class="back" href="#clients">${icon('chevL')}Clients</a>
    <div class="c-head">${cdot(c)}
      <div class="c-head-main">
        ${ed(c, 'name', { cls: 'name', placeholder: 'Name', label: 'Name' })}
        ${ed(c, 'business', { cls: 'biz', placeholder: 'Business name', label: 'Business name' })}
      </div>
    </div>
    ${c.archived ? `<div class="archived-banner"><span>Archived ${esc(relWhen(c.archivedAt))}</span><button class="btn sm" type="button" data-action="reactivate" data-id="${c.id}">${icon('restore')}Reactivate</button></div>` : ''}
    <div class="c-actions">
      <a class="${dis(c.phone)}" href="${c.phone ? 'tel:' + digits(c.phone) : '#'}">${icon('phone')}Call</a>
      <a class="${dis(c.phone)}" href="${c.phone ? 'sms:' + digits(c.phone) : '#'}">${icon('message')}Text</a>
      <a class="${dis(c.email)}" href="${c.email ? 'mailto:' + esc(c.email) : '#'}">${icon('mail')}Email</a>
      <a class="${dis(c.address)}" href="${mapHref || '#'}" target="_blank" rel="noopener">${icon('pin')}Map</a>
    </div>

    <div class="c-block">
      <p class="c-block-title">Progress</p>
      <div class="journey">${STAGES.map(s => `<button type="button" class="step${c.stages[s.n] ? ' filled' : ''}" data-n="${s.n}" data-action="stage" data-id="${c.id}"
          aria-pressed="${!!c.stages[s.n]}" aria-label="${s.label}${c.stages[s.n] ? ', done ' + fmtDay(c.stages[s.n]) : ''}">
          <span class="ring">${icon('check')}</span><span class="step-label">${s.short}</span><span class="step-date">${esc(fmtDay(c.stages[s.n]))}</span></button>`).join('')}</div>
    </div>

    <div class="c-block">
      <div class="fu">
        <div><p class="c-block-title" style="margin-bottom:2px">Next follow-up</p>
          <div class="fu-date ${dueClass(c.nextFollowUp)}">${c.nextFollowUp ? esc(fmtDay(c.nextFollowUp, { weekday: 'long', month: 'short', day: 'numeric' })) + (daysBetween(today(), c.nextFollowUp) < 0 ? ` · ${esc(relDay(c.nextFollowUp))}` : '') : 'None set'}</div>
          ${c.followUpNote ? `<div class="fu-note">${esc(c.followUpNote)}</div>` : ''}</div>
        <div style="display:flex;gap:6px">
          ${c.nextFollowUp ? `<button class="btn sm" type="button" data-action="fu-done" data-id="${c.id}">${icon('check')}Done</button>` : ''}
          <button class="btn sm" type="button" data-action="followup" data-id="${c.id}">${icon('calendar')}${c.nextFollowUp ? 'Change' : 'Set'}</button>
        </div>
      </div>
    </div>

    <div class="c-block">
      <p class="c-block-title">Contact info</p>
      <div class="info">
        <label><span class="lbl">Phone</span>${ed(c, 'phone', { type: 'tel', placeholder: 'Add phone' })}</label>
        <label><span class="lbl">Email</span>${ed(c, 'email', { type: 'email', placeholder: 'Add email' })}</label>
        <label><span class="lbl">Type</span>${edSelect(c, 'type', TYPES, 'Choose…')}</label>
        <label><span class="lbl">Source</span>${edSelect(c, 'source', SOURCES, 'Choose…')}</label>
        <label class="wide"><span class="lbl">Address</span>${ed(c, 'address', { placeholder: 'Add address' })}</label>
        <label class="wide"><span class="lbl">Referred by</span>${ed(c, 'referredBy', { placeholder: 'Who sent them your way' })}</label>
      </div>
    </div>

    <div class="c-block">
      <details class="notes"${c.notes ? '' : ' open'}>
        <summary>Notes<span class="preview">${esc((c.notes || '').split('\n')[0])}</span>${icon('chevD')}</summary>
        <textarea class="ed" data-edit="notes" data-id="${c.id}" placeholder="Anything worth remembering — the house, their timeline, who else is involved.">${esc(c.notes)}</textarea>
      </details>
    </div>

    <div class="c-block">
      <p class="c-block-title">History <button class="btn sm" type="button" data-action="log" data-id="${c.id}">${icon('plus')}Log contact</button></p>
      ${hist.length ? `<ol class="timeline">${hist.map(a => timelineItem(c, a)).join('')}</ol>`
        : empty('No history yet', 'Log each text, call, visit or service so you always know where things stand.')}
    </div>

    <div class="c-block c-foot">
      ${c.archived ? `<button class="btn sm" type="button" data-action="reactivate" data-id="${c.id}">${icon('restore')}Reactivate</button>`
        : `<button class="btn sm" type="button" data-action="archive" data-id="${c.id}">${icon('archive')}Archive</button>`}
      <button class="btn sm danger" type="button" data-action="delete" data-id="${c.id}">${icon('trash')}Delete</button>
      <span class="muted" style="font-size:12.5px;align-self:center;margin-left:auto">${esc(STAGES[st - 1]?.label || 'No stage yet')} · added ${esc(relWhen(c.createdAt))}</span>
    </div>
  </article>`;
}

function timelineItem(c, a) {
  const isStage = a.type === 'stage';
  const ico = isStage ? 'flag' : ACT[a.type]?.icon || 'note';
  const title = a.title || ACT[a.type]?.title || 'Activity';
  return `<li class="tl" data-t="${esc(a.type)}"${isStage && a.stage ? ` style="--c: var(--st${a.stage})"` : ''}>
    <span class="tl-icon">${icon(ico)}</span>
    <button class="tl-body" type="button" data-action="edit-act" data-id="${c.id}" data-act="${a.id}">
      <div class="tl-head"><span class="tl-title">${esc(title)}</span><span class="tl-when">${esc(relWhen(a.date))}</span></div>
      ${a.note ? `<div class="tl-note">${esc(a.note)}</div>` : ''}
      ${a.by === 'claude' ? '<div class="tl-by">Added by Claude</div>' : ''}
    </button></li>`;
}

/* ---------- History (repo commits) ---------- */

const history = { cache: null, loading: false, error: '', details: {} };

async function loadHistory(force = false) {
  if (history.loading || (!force && (history.cache || history.error))) return;
  history.loading = true; history.error = '';
  try {
    const r = await gh(`${repoApi()}/commits?sha=${encodeURIComponent(cfg.branch)}&per_page=60`);
    if (!r.ok) throw new GhError(r.status, r.status === 403 ? 'GitHub is limiting requests for now. Add your token in Settings, or try again in a bit.' : explain(r.status));
    history.cache = await r.json();
  } catch (e) { history.error = e.message || 'Couldn’t load history.'; }
  history.loading = false;
  if (route().name === 'history') render();
}

function classify(cm) {
  const msg = cm.commit.message || '', who = (cm.commit.author?.name || '') + ' ' + (cm.author?.login || '');
  if (/Co-Authored-By: Claude|Claude-Session|claude\.ai\/code/i.test(msg) || /\bclaude\b/i.test(who)) return 'claude';
  if (/Saved from Lead Book app/i.test(msg)) return 'app';
  return 'you';
}
function parseMsg(msg) {
  const lines = msg.split('\n');
  const title = lines[0];
  const body = lines.slice(1).filter(l => !/^(Co-Authored-By|Claude-Session|Signed-off-by):/i.test(l.trim()) && !/^Saved from Lead Book app/i.test(l.trim()));
  const device = (msg.match(/Saved from Lead Book app \(([^)]+)\)/) || [])[1];
  const bullets = body.filter(l => /^\s*[-*]\s+/.test(l)).map(l => l.replace(/^\s*[-*]\s+/, ''));
  const text = body.filter(l => l.trim() && !/^\s*[-*]\s+/.test(l)).join(' ');
  return { title, bullets, text, device };
}

function viewHistory() {
  loadHistory();
  const chip = (id, label) => `<button type="button" class="chip" data-action="hist-filter" data-f="${id}" aria-pressed="${ui.histFilter === id}">${label}</button>`;
  const pend = pending.length ? `<section class="section" style="margin-top:0"><div class="pending-card"><b>Unsaved on this device</b>
      <ul>${pending.map(p => `<li>${esc(p.text)}</li>`).join('')}</ul>
      <button class="btn sm accent" type="button" data-action="save">Save changes</button></div></section>` : '';
  let body;
  if (history.loading && !history.cache) body = `<div class="empty">Loading history…</div>`;
  else if (history.error && !history.cache) body = `<div class="empty"><strong>Couldn’t load history</strong>${esc(history.error)}<div class="btn-row" style="justify-content:center"><button class="btn sm" type="button" data-action="hist-refresh">Try again</button></div></div>`;
  else {
    const items = (history.cache || []).filter(cm => ui.histFilter === 'all' || (ui.histFilter === 'claude' ? classify(cm) === 'claude' : classify(cm) !== 'claude'));
    const groups = new Map();
    for (const cm of items) {
      const d = ymd(new Date(cm.commit.author.date));
      if (!groups.has(d)) groups.set(d, []);
      groups.get(d).push(cm);
    }
    body = items.length ? [...groups].map(([d, cms]) => `<div class="feed-day">${esc(d === today() ? 'Today' : d === addDays(today(), -1) ? 'Yesterday' : fmtDay(d, { weekday: 'long', month: 'short', day: 'numeric' }))}</div>
      <ul class="feed">${cms.map(eventItem).join('')}</ul>`).join('') : empty('Nothing here yet', 'Saves from the app and changes Claude makes show up here.');
  }
  return `<div class="page-head"><div><h1 class="page-title">History</h1><p class="page-kicker">Everything saved to the repo — by you and by Claude.</p></div>
      <button class="icon-btn" type="button" data-action="hist-refresh" aria-label="Refresh">${icon('restore')}</button></div>
    ${pend}
    <div class="chips" role="group" aria-label="Show" style="padding-top:0">${chip('all', 'Everything')}${chip('you', 'My updates')}${chip('claude', 'Claude')}</div>
    ${body}`;
}

function eventItem(cm) {
  const who = classify(cm);
  const m = parseMsg(cm.commit.message);
  const time = new Date(cm.commit.author.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const whoLabel = who === 'claude' ? 'Claude' : who === 'app' ? `You${m.device ? ' · ' + m.device : ''}` : 'You · GitHub';
  const ico = who === 'claude' ? 'sparkle' : who === 'app' ? 'device' : 'code';
  const det = history.details[cm.sha];
  return `<li><details class="ev" data-who="${who}" data-sha="${cm.sha}">
    <summary><span class="ev-icon">${icon(ico)}</span>
      <span><div class="ev-title">${esc(m.title)}</div><div class="ev-meta"><b>${esc(whoLabel)}</b>${m.bullets.length > 1 ? ` · ${m.bullets.length} changes` : ''}</div></span>
      <span class="ev-time">${esc(time)}</span></summary>
    <div class="ev-detail">
      ${m.bullets.length ? `<ul>${m.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
      ${m.text ? `<p style="margin:0 0 8px">${esc(m.text)}</p>` : ''}
      <div class="ev-files" data-files="${cm.sha}">${det ? filesHtml(det) : 'Loading files…'}</div>
    </div></details></li>`;
}
function filesHtml(det) {
  if (det.error) return esc(det.error);
  return `${det.files.length} ${det.files.length === 1 ? 'file' : 'files'} changed: ${det.files.slice(0, 12).map(f => `<code>${esc(f.filename)}</code> <span class="add">+${f.additions}</span> <span class="del">−${f.deletions}</span>`).join(', ')}${det.files.length > 12 ? '…' : ''}
    · <a href="${esc(det.url)}" target="_blank" rel="noopener">View on GitHub</a>`;
}
async function loadCommitFiles(sha) {
  if (history.details[sha]) return;
  try {
    const r = await gh(`${repoApi()}/commits/${sha}`);
    if (!r.ok) throw new Error('Couldn’t load the file list.');
    const j = await r.json();
    history.details[sha] = { files: j.files || [], url: j.html_url };
  } catch (e) { history.details[sha] = { error: e.message }; }
  const el = document.querySelector(`[data-files="${sha}"]`);
  if (el) el.innerHTML = filesHtml(history.details[sha]);
}
document.addEventListener('toggle', e => {
  const d = e.target;
  if (d.classList?.contains('ev') && d.open) loadCommitFiles(d.dataset.sha);
}, true);

/* ---------- Settings ---------- */

function viewSettings() {
  const themeOpt = (v, l) => `<label><input type="radio" name="theme" value="${v}" data-action="theme"${cfg.theme === v ? ' checked' : ''}><span>${l}</span></label>`;
  const hours = sel => [...Array(24)].map((_, h) => `<option value="${h}"${h === sel ? ' selected' : ''}>${new Date(2000, 0, 1, h).toLocaleTimeString(undefined, { hour: 'numeric' })}</option>`).join('');
  const exampleCount = clients().filter(c => c.example).length + draft.tasks.filter(t => alive(t) && t.example).length + draft.wins.filter(w => alive(w) && w.example).length;
  const conn = !hasToken() ? `<div class="conn-state">View only on this device. You can look at everything; add a token to save changes.</div>`
    : pull.error ? `<div class="conn-state err">${esc(pull.error)}</div>`
      : `<div class="conn-state ok">Connected to ${esc(cfg.owner)}/${esc(cfg.repo)}${lastPull ? ` · checked ${esc(timeAgo(lastPull))}` : ''}</div>`;

  return `<div class="page-head"><h1 class="page-title">Settings</h1></div>
  <div class="settings">
    <section class="card">
      <h2>Appearance</h2>
      <p class="desc">Auto switches to dark in the evening. Pick Light or Dark to keep one look all day. This is saved per device.</p>
      <div class="seg" role="radiogroup" aria-label="Theme">${themeOpt('auto', 'Auto by time')}${themeOpt('light', 'Light')}${themeOpt('dark', 'Dark')}</div>
      <div class="two" style="margin-top:14px" ${cfg.theme !== 'auto' ? 'hidden' : ''}>
        <label class="field"><span>Light from</span><select data-action="light-from">${hours(cfg.lightFrom)}</select></label>
        <label class="field"><span>Dark from</span><select data-action="light-to">${hours(cfg.lightTo)}</select></label>
      </div>
    </section>

    <section class="card">
      <h2>You &amp; your business</h2>
      <form class="form" data-form="profile">
        <div class="two">
          <label class="field"><span>Your first name</span><input name="name" value="${esc(cfg.name)}"></label>
          <label class="field"><span>Business name</span><input name="business" value="${esc(cfg.business)}" placeholder="Shown on the dashboard"></label>
        </div>
        <div><button class="btn sm" type="submit">Save</button></div>
      </form>
    </section>

    <section class="card">
      <h2>Saving to GitHub</h2>
      <p class="desc">Your edits stay on this device until you tap <b>Save changes</b>. Saving needs a GitHub token — paste it once on each device.</p>
      <ol class="steps">
        <li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub → New fine-grained token</a>.</li>
        <li>Repository access: <b>Only select repositories</b> → <b>${esc(cfg.repo)}</b>.</li>
        <li>Permissions → Repository → <b>Contents: Read and write</b>. Generate, then paste it below.</li>
      </ol>
      <form class="form" data-form="sync" autocomplete="off">
        <label class="field"><span>GitHub token</span><input name="token" type="password" value="${esc(cfg.token)}" placeholder="github_pat_…" autocapitalize="off" spellcheck="false"></label>
        <label class="field"><span>This device’s name</span><input name="device" value="${esc(cfg.device)}"><span class="hint">Shown in History so you can tell your phone from your laptop.</span></label>
        <details><summary class="hint" style="cursor:pointer">Repo details</summary>
          <div class="two" style="margin-top:10px">
            <label class="field"><span>Owner</span><input name="owner" value="${esc(cfg.owner)}" autocapitalize="off" spellcheck="false"></label>
            <label class="field"><span>Repo</span><input name="repo" value="${esc(cfg.repo)}" autocapitalize="off" spellcheck="false"></label>
            <label class="field"><span>Branch</span><input name="branch" value="${esc(cfg.branch)}" autocapitalize="off" spellcheck="false"></label>
            <label class="field"><span>Data file</span><input name="path" value="${esc(cfg.path)}" autocapitalize="off" spellcheck="false"></label>
          </div></details>
        <div class="btn-row" style="margin-top:0"><button class="btn primary sm" type="submit">Save settings</button>
          ${hasToken() ? '<button class="btn sm" type="button" data-action="forget-token">Remove token from this device</button>' : ''}</div>
      </form>
      ${conn}
    </section>

    <section class="card">
      <h2>Import &amp; export</h2>
      <p class="desc">Back up everything as JSON, open your client list in a spreadsheet as CSV, or bring in a CSV (columns like name, business, phone, email, address, notes).</p>
      <div class="btn-row">
        <button class="btn sm" type="button" data-action="export-json">${icon('download')}Export JSON</button>
        <button class="btn sm" type="button" data-action="export-csv">${icon('download')}Export CSV</button>
        <label class="btn sm">${icon('upload')}Import file<input type="file" accept=".json,.csv,text/csv,application/json" data-action="import" hidden></label>
      </div>
    </section>

    ${exampleCount ? `<section class="card">
      <h2>Example data</h2>
      <p class="desc">${exampleCount} made-up clients, tasks and wins are here so you can see how things look. Remove them when you’re ready to start for real.</p>
      <button class="btn sm danger" type="button" data-action="clear-examples">${icon('trash')}Remove example data</button>
    </section>` : ''}

    <section class="card">
      <h2>App icon</h2>
      <p class="desc">Put Lead Book on your Android home screen: open this site in Chrome, tap ⋮, then <b>Add to Home screen</b> or <b>Install app</b>.</p>
      <img src="icons/icon-192.png" alt="Lead Book app icon" width="64" height="64" style="border-radius:16px">
    </section>
  </div>`;
}

/* ================= Sheets ================= */

const sheet = () => $('#sheet');
const dialogOpen = () => sheet().open;
function openSheet(html, onSubmit, after) {
  const d = sheet();
  d.innerHTML = html;
  const f = d.querySelector('form');
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (onSubmit(new FormData(f), f, e.submitter) !== false) d.close();
  });
  d.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => d.close()));
  d.showModal();
  if (after) after(d);
  const first = d.querySelector('[autofocus]');
  if (first && matchMedia('(min-width: 700px)').matches) first.focus();
}
sheet().addEventListener('click', e => { if (e.target === sheet()) sheet().close(); });

const options = (arr, sel, blank) => (blank ? `<option value="">${blank}</option>` : '') + arr.map(v => {
  const [val, label] = Array.isArray(v) ? v : [v, v];
  return `<option value="${esc(val)}"${val === sel ? ' selected' : ''}>${esc(label)}</option>`;
}).join('');

function shell(title, body, submit, extra = '') {
  return `<form class="sheet-form" method="dialog" novalidate>
    <div class="sheet-head"><h2 id="sheetTitle">${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="sheet-scroll"><div class="sheet-body">${body}</div></div>
    ${submit === null ? '' : `<div class="sheet-foot">${extra}<span class="spacer"></span><button type="button" class="btn" data-close>Cancel</button><button type="submit" class="btn primary">${esc(submit)}</button></div>`}
  </form>`;
}

const fuChoices = (cur, name = 'fu') => `
  <div class="seg" role="radiogroup" aria-label="Follow-up">
    ${[['keep', cur ? 'Keep ' + fmtDay(cur) : 'None'], ['1', 'Tomorrow'], ['3', 'In 3 days'], ['7', 'Next week'], ['14', 'In 2 weeks'], ['30', 'In a month'], ['clear', 'Clear']]
      .filter(([v]) => !(v === 'clear' && !cur))
      .map(([v, l], i) => `<label><input type="radio" name="${name}" value="${v}"${i === 0 ? ' checked' : ''}><span>${l}</span></label>`).join('')}
  </div>
  <label class="field" style="margin-top:8px"><span>Or pick a date</span><input type="date" name="${name}Date"></label>`;
function readFu(fd, cur, name = 'fu') {
  const d = fd.get(name + 'Date');
  if (d) return d;
  const v = fd.get(name);
  if (v === 'keep' || v == null) return cur || '';
  if (v === 'clear') return '';
  return addDays(today(), Number(v));
}

/* ----- Add menu ----- */
function addChooser() {
  openSheet(shell('Add', `<div class="chooser">
    <button type="button" data-pick="client">${icon('user')}<b>Client</b><span>A new lead or contact</span></button>
    <button type="button" data-pick="task">${icon('task')}<b>Task</b><span>A to-do, with or without a date</span></button>
    <button type="button" data-pick="note">${icon('sticky')}<b>Sticky note</b><span>A quick reminder on the dashboard</span></button>
    <button type="button" data-pick="win">${icon('trophy')}<b>Win</b><span>Something that went well</span></button>
  </div>`, null), null, d => d.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
    d.close();
    ({ client: () => clientSheet(), task: () => taskSheet(), note: () => noteSheet(), win: () => winSheet() })[b.dataset.pick]();
  })));
}

/* ----- New client (with match search) ----- */
function clientSheet() {
  const body = `<div class="form">
    ${'contacts' in navigator && 'ContactsManager' in window ? `<button type="button" class="btn sm" data-pick-contact>${icon('user')}Pick from phone contacts</button>` : ''}
    <label class="field"><span>Name</span><input name="name" required autofocus autocomplete="off"></label>
    <div class="matches" id="matches"></div>
    <label class="field"><span>Business name</span><input name="business" placeholder="Company, brokerage, or leave blank"></label>
    <div class="two">
      <label class="field"><span>Phone</span><input name="phone" type="tel" inputmode="tel"></label>
      <label class="field"><span>Email</span><input name="email" type="email" inputmode="email" autocapitalize="off"></label>
      <label class="field"><span>Type</span><select name="type">${options(TYPES, 'Homebuyer')}</select></label>
      <label class="field"><span>Source</span><select name="source">${options(SOURCES, '', 'Choose…')}</select></label>
    </div>
    <label class="field"><span>Notes</span><textarea name="notes"></textarea></label>
    <div class="field"><span>First follow-up</span>${fuChoices('')}</div>
  </div>`;
  openSheet(shell('New client', body, 'Create new client'), fd => {
    const name = String(fd.get('name') || '').trim();
    if (!name) { toast('Add a name first'); return false; }
    const t = nowIso();
    const c = {
      id: uid(), name, business: fd.get('business').trim(), phone: fd.get('phone').trim(), email: fd.get('email').trim(),
      type: fd.get('type'), source: fd.get('source'), notes: fd.get('notes').trim(), address: '', referredBy: '',
      stages: { 1: today() }, nextFollowUp: readFu(fd, '') || '', followUpNote: '', archived: false,
      createdAt: t, updatedAt: t, activities: [],
    };
    draft.clients.push(c);
    location.hash = '#client/' + c.id;
    change('c:new:' + c.id, `Added client ${name}`);
    toast(`Added ${name}`);
  }, d => {
    const input = d.querySelector('[name=name]'), box = d.querySelector('#matches');
    const show = () => {
      const q = input.value.trim().toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      const hits = q.length < 2 ? [] : clients().filter(c => {
        const hay = `${c.name} ${c.business || ''}`.toLowerCase();
        return words.every(w => hay.includes(w));
      }).slice(0, 5);
      box.innerHTML = hits.length ? `<div class="hint">Already in your list?</div>` + hits.map(c => `<div class="match">${cdot(c, 'sm')}
        <div class="match-main"><div class="match-name">${esc(c.name)}</div><div class="match-sub">${esc([c.business, c.archived ? 'Archived' : STAGES[stageOf(c) - 1]?.label].filter(Boolean).join(' · '))}</div></div>
        <button type="button" class="btn sm ${c.archived ? 'accent' : ''}" data-match="${c.id}">${c.archived ? 'Reactivate' : 'Open'}</button></div>`).join('') : '';
    };
    input.addEventListener('input', show);
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-match]');
      if (!b) return;
      const c = byId(b.dataset.match);
      d.close();
      if (c.archived) reactivate(c);
      location.hash = '#client/' + c.id;
    });
    const pick = d.querySelector('[data-pick-contact]');
    if (pick) pick.addEventListener('click', async () => {
      try {
        const [p] = await navigator.contacts.select(['name', 'tel', 'email'], { multiple: false });
        if (!p) return;
        const f = d.querySelector('form');
        if (p.name?.[0]) f.name.value = p.name[0];
        if (p.tel?.[0]) f.phone.value = p.tel[0];
        if (p.email?.[0]) f.email.value = p.email[0];
        show();
      } catch { /* cancelled */ }
    });
  });
}

function reactivate(c) {
  c.archived = false; c.archivedAt = ''; touch(c);
  change('c:arch:' + c.id, `Reactivated ${c.name}`);
  toast(`${c.name} is active again`);
}

/* ----- Log / edit activity ----- */
function actSheet(c, a) {
  const isEdit = !!a;
  const cur = a || { type: 'text', date: today(), title: '', note: '' };
  const body = `<div class="form">
    <p class="muted" style="margin:0">${esc(c.name)}${c.phone ? ' · ' + esc(c.phone) : ''}</p>
    ${cur.type === 'stage' ? '' : `<div class="field"><span>Type</span><div class="seg" role="radiogroup" aria-label="Type">
      ${ACTS.map(x => `<label><input type="radio" name="type" value="${x.id}"${x.id === cur.type ? ' checked' : ''}><span>${icon(x.icon)}${x.label}</span></label>`).join('')}
    </div></div>`}
    <div class="two">
      <label class="field"><span>Title</span><input name="title" value="${esc(cur.title || (isEdit ? '' : ACT[cur.type].title))}" placeholder="What happened"></label>
      <label class="field"><span>Date</span><input type="date" name="date" value="${esc(cur.date || today())}"></label>
    </div>
    <label class="field"><span>Notes</span><textarea name="note" placeholder="Details worth remembering">${esc(cur.note)}</textarea></label>
    ${isEdit ? '' : `<div class="field"><span>Next follow-up</span>${fuChoices(c.nextFollowUp)}</div>
      <label class="field"><span>Follow-up reminder</span><input name="fuNote" value="${esc(c.followUpNote)}" placeholder="e.g. Send sample report"></label>`}
  </div>`;
  const extra = isEdit ? `<button type="button" class="btn sm danger" data-del>${icon('trash')}Remove</button>` : '';
  openSheet(shell(isEdit ? 'Edit entry' : 'Log contact', body, isEdit ? 'Save' : 'Add to history', extra), fd => {
    const type = fd.get('type') || cur.type;
    const title = fd.get('title').trim() || ACT[type]?.title || 'Activity';
    if (isEdit) {
      Object.assign(a, { type, title, date: fd.get('date') || a.date, note: fd.get('note').trim() }); touch(a); touch(c);
      change('a:' + a.id, `Edited “${title}” for ${c.name}`);
    } else {
      const entry = { id: uid(), type, title, date: fd.get('date') || today(), note: fd.get('note').trim(), createdAt: nowIso(), updatedAt: nowIso() };
      c.activities.push(entry);
      c.nextFollowUp = readFu(fd, c.nextFollowUp);
      c.followUpNote = c.nextFollowUp ? fd.get('fuNote').trim() : '';
      touch(c);
      change('a:' + entry.id, `Logged ${title.toLowerCase()} with ${c.name}`);
      toast('Added to history');
    }
  }, d => {
    // Suggest a title that matches the type until the user types their own.
    const titleEl = d.querySelector('[name=title]');
    let userTitle = isEdit;
    titleEl.addEventListener('input', () => { userTitle = true; });
    d.querySelectorAll('[name=type]').forEach(r => r.addEventListener('change', () => { if (!userTitle) titleEl.value = ACT[r.value].title; }));
    const del = d.querySelector('[data-del]');
    if (del) del.addEventListener('click', () => {
      a.deleted = true; touch(a); touch(c);
      d.close();
      change('a:' + a.id, `Removed “${a.title}” from ${c.name}`);
    });
  });
}

function followupSheet(c) {
  openSheet(shell('Next follow-up', `<div class="form"><p class="muted" style="margin:0">${esc(c.name)}</p>${fuChoices(c.nextFollowUp)}
    <label class="field"><span>Reminder</span><input name="fuNote" value="${esc(c.followUpNote)}" placeholder="e.g. Call about the inspection report"></label></div>`, 'Save'), fd => {
    c.nextFollowUp = readFu(fd, c.nextFollowUp);
    c.followUpNote = c.nextFollowUp ? fd.get('fuNote').trim() : '';
    touch(c);
    change('c:fu:' + c.id, c.nextFollowUp ? `Set follow-up for ${c.name} to ${fmtDay(c.nextFollowUp)}` : `Cleared follow-up for ${c.name}`);
  });
}

/* ----- Tasks, notes, wins ----- */
function taskSheet(k) {
  const cur = k || { text: '', due: '', clientId: '' };
  const body = `<div class="form">
    <label class="field"><span>Task</span><input name="text" value="${esc(cur.text)}" required autofocus placeholder="e.g. Drop off business cards at Summit Peak"></label>
    <div class="two">
      <label class="field"><span>Due</span><input type="date" name="due" value="${esc(cur.due)}"></label>
      <label class="field"><span>Client <span class="muted">(optional)</span></span><select name="clientId">${options(activeClients().sort((a, b) => a.name.localeCompare(b.name)).map(c => [c.id, c.name]), cur.clientId, 'None')}</select></label>
    </div>
  </div>`;
  const extra = k ? `<button type="button" class="btn sm danger" data-del>${icon('trash')}Delete</button>` : '';
  openSheet(shell(k ? 'Edit task' : 'New task', body, k ? 'Save' : 'Add task', extra), fd => {
    const text = fd.get('text').trim();
    if (!text) { toast('Write the task first'); return false; }
    if (k) { Object.assign(k, { text, due: fd.get('due'), clientId: fd.get('clientId') }); touch(k); change('t:' + k.id, `Edited task “${text}”`); }
    else {
      const t = { id: uid(), kind: 'task', text, due: fd.get('due'), clientId: fd.get('clientId'), done: false, createdAt: nowIso(), updatedAt: nowIso() };
      draft.tasks.push(t);
      change('t:' + t.id, `Added task “${text}”`);
    }
  }, d => {
    const del = d.querySelector('[data-del]');
    if (del) del.addEventListener('click', () => { k.deleted = true; touch(k); d.close(); change('t:' + k.id, `Deleted task “${k.text}”`); });
  });
}

function noteSheet(k) {
  const cur = k || { text: '', color: 'yellow' };
  const body = `<div class="form">
    <label class="field"><span>Note</span><textarea name="text" autofocus placeholder="Quick reminder…">${esc(cur.text)}</textarea></label>
    <div class="field"><span>Color</span><div class="seg swatches">${NOTE_COLORS.map(c => `<label><input type="radio" name="color" value="${c}"${c === (cur.color || 'yellow') ? ' checked' : ''}><span class="sw" data-color="${c}" aria-label="${c}"></span></label>`).join('')}</div></div>
  </div>`;
  const extra = k ? `<button type="button" class="btn sm danger" data-del>${icon('trash')}Remove</button>` : '';
  openSheet(shell(k ? 'Sticky note' : 'New sticky note', body, k ? 'Save' : 'Add note', extra), fd => {
    const text = fd.get('text').trim();
    if (!text) { toast('Write something first'); return false; }
    if (k) { Object.assign(k, { text, color: fd.get('color') }); touch(k); change('n:' + k.id, `Edited sticky note “${text.slice(0, 40)}”`); }
    else {
      const n = { id: uid(), kind: 'note', text, color: fd.get('color'), createdAt: nowIso(), updatedAt: nowIso() };
      draft.tasks.push(n);
      change('n:' + n.id, `Added sticky note “${text.slice(0, 40)}”`);
    }
  }, d => {
    const del = d.querySelector('[data-del]');
    if (del) del.addEventListener('click', () => { k.deleted = true; touch(k); d.close(); change('n:' + k.id, `Removed sticky note “${k.text.slice(0, 40)}”`); });
  });
}

function winSheet(w) {
  const cur = w || { text: '', date: today() };
  const body = `<div class="form">
    ${w?.by === 'claude' ? '<p class="muted" style="margin:0">Added by Claude</p>' : ''}
    <label class="field"><span>What went well?</span><textarea name="text" autofocus placeholder="e.g. Megan sent over her first buyer">${esc(cur.text)}</textarea></label>
    <label class="field"><span>Date</span><input type="date" name="date" value="${esc(cur.date)}"></label>
  </div>`;
  const extra = w ? `<button type="button" class="btn sm danger" data-del>${icon('trash')}Remove</button>` : '';
  openSheet(shell(w ? 'Win' : 'New win', body, w ? 'Save' : 'Add win', extra), fd => {
    const text = fd.get('text').trim();
    if (!text) { toast('Write the win first'); return false; }
    if (w) { Object.assign(w, { text, date: fd.get('date') || w.date }); touch(w); change('w:' + w.id, `Edited win “${text.slice(0, 50)}”`); }
    else {
      const x = { id: uid(), text, by: 'me', date: fd.get('date') || today(), createdAt: nowIso(), updatedAt: nowIso() };
      draft.wins.push(x);
      change('w:' + x.id, `Added a win: “${text.slice(0, 50)}”`);
      toast('Nice work!');
    }
  }, d => {
    const del = d.querySelector('[data-del]');
    if (del) del.addEventListener('click', () => { w.deleted = true; touch(w); d.close(); change('w:' + w.id, `Removed win “${w.text.slice(0, 40)}”`); });
  });
}

function goalsSheet() {
  const body = `<div class="form"><p class="hint" style="margin:0">Targets for each week (Monday–Sunday). The numbers count themselves from your clients and history.</p>
    ${draft.goals.items.map(g => `<label class="field"><span>${esc(g.label)}</span><input type="number" min="0" inputmode="numeric" name="${g.id}" value="${g.target}"></label>`).join('')}</div>`;
  openSheet(shell('Weekly goals', body, 'Save goals'), fd => {
    draft.goals.items.forEach(g => { g.target = Math.max(0, parseInt(fd.get(g.id), 10) || 0); });
    draft.goals.updatedAt = nowIso();
    change('goals', 'Updated weekly goals');
  });
}

function reviewSheet() {
  const body = `<ul style="margin:0;padding-left:18px">${pending.map(p => `<li style="margin-bottom:4px">${esc(p.text)} <span class="muted" style="font-size:12.5px">· ${esc(timeAgo(p.at))}</span></li>`).join('')}</ul>
    <p class="hint">These are saved on this device. Save to put them in the repo, where your other devices and Claude can see them.</p>`;
  openSheet(shell('Unsaved changes', body, 'Save changes', `<button type="button" class="btn sm danger" data-discard>Discard all</button>`), () => { save(); }, d => {
    d.querySelector('[data-discard]').addEventListener('click', () => { if (confirm('Throw away all unsaved changes on this device?')) { d.close(); discardAll(); } });
  });
}

function tokenSheet(msg = '') {
  const body = `<div class="form">
    ${msg ? `<div class="conn-state err" style="margin:0">${esc(msg)}</div>` : ''}
    <p style="margin:0">To save to GitHub from this device, paste a token once. Your changes stay safe here until then.</p>
    <ol class="steps">
      <li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub → New fine-grained token</a>.</li>
      <li>Repository access: <b>Only select repositories</b> → <b>${esc(cfg.repo)}</b>.</li>
      <li>Permissions → <b>Contents: Read and write</b> → Generate token.</li>
    </ol>
    <label class="field"><span>Token</span><input name="token" type="password" placeholder="github_pat_…" autocapitalize="off" spellcheck="false" autofocus></label>
    <label class="field"><span>This device’s name</span><input name="device" value="${esc(cfg.device)}"></label>
  </div>`;
  openSheet(shell('Connect to GitHub', body, 'Save token & changes'), fd => {
    const t = String(fd.get('token') || '').trim();
    if (!t) { toast('Paste the token first'); return false; }
    cfg.token = t; cfg.device = String(fd.get('device') || cfg.device).trim(); saveCfg();
    save();
  });
}

/* ================= Import / export ================= */

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function toCsv() {
  const cols = ['name', 'business', 'phone', 'email', 'type', 'stage', 'source', 'referredBy', 'address', 'nextFollowUp', 'archived', 'notes'];
  const q = v => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  return [cols.join(','), ...clients().map(c => cols.map(k => q(String(k === 'stage' ? STAGES[stageOf(c) - 1]?.label || '' : k === 'archived' ? (c.archived ? 'yes' : '') : c[k] ?? ''))).join(','))].join('\n');
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
  const col = (...n) => head.findIndex(h => n.includes(h));
  const ix = { name: col('name', 'fullname', 'contact'), first: col('firstname', 'first'), last: col('lastname', 'last'), business: col('business', 'company', 'organization', 'brokerage'),
    phone: col('phone', 'phonenumber', 'mobile', 'cell'), email: col('email', 'emailaddress'), type: col('type'), source: col('source'), address: col('address'), notes: col('notes', 'note') };
  let n = 0;
  for (const r of rows.slice(1)) {
    const g = k => (ix[k] >= 0 ? (r[ix[k]] || '').trim() : '');
    const name = g('name') || [g('first'), g('last')].filter(Boolean).join(' ');
    if (!name) continue;
    const t = nowIso();
    const c = { id: uid(), name, business: g('business'), phone: g('phone'), email: g('email'), type: TYPES.find(x => x.toLowerCase() === g('type').toLowerCase()) || '',
      source: g('source'), address: g('address'), notes: g('notes'), referredBy: '', stages: { 1: today() }, nextFollowUp: '', followUpNote: '', archived: false, createdAt: t, updatedAt: t, activities: [] };
    draft.clients.push(c);
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
  const t = id ? draft.tasks.find(x => x.id === id) : null;
  switch (el.dataset.action) {
    case 'fab': route().name === 'clients' ? clientSheet() : addChooser(); break;
    case 'pill':
      if (pending.length) reviewSheet();
      else if (pull.error) { toast(pull.error); pull({ quiet: false }); }
      else if (!hasToken()) { location.hash = '#settings'; }
      else { pull({ quiet: false }); toast('Checked for updates'); }
      break;
    case 'save': save(); break;
    case 'review': reviewSheet(); break;
    case 'add-task': taskSheet(); break;
    case 'edit-task': if (t) taskSheet(t); break;
    case 'toggle-task':
      if (t) { t.done = !t.done; t.doneAt = t.done ? nowIso() : ''; touch(t); change('t:done:' + t.id, `${t.done ? 'Completed' : 'Reopened'} task “${t.text}”`); }
      break;
    case 'toggle-done': ui.showDone = !ui.showDone; render(); break;
    case 'add-note': noteSheet(); break;
    case 'edit-note': if (t) noteSheet(t); break;
    case 'add-win': winSheet(); break;
    case 'edit-win': { const w = draft.wins.find(x => x.id === id); if (w) winSheet(w); break; }
    case 'edit-goals': goalsSheet(); break;
    case 'log': if (c) actSheet(c); break;
    case 'edit-act': { const a = c?.activities.find(x => x.id === el.dataset.act); if (a) actSheet(c, a); break; }
    case 'followup': if (c) followupSheet(c); break;
    case 'fu-done':
      if (c) { c.nextFollowUp = ''; c.followUpNote = ''; touch(c); change('c:fu:' + c.id, `Marked follow-up done for ${c.name}`);
        toast('Follow-up cleared', { label: 'Log it', run: () => actSheet(c) }); }
      break;
    case 'stage': if (c) toggleStage(c, Number(el.dataset.n)); break;
    case 'archive':
      if (c) { c.archived = true; c.archivedAt = nowIso(); touch(c); location.hash = '#clients'; change('c:arch:' + c.id, `Archived ${c.name}`);
        toast(`Archived ${c.name}`, { label: 'Undo', run: () => { c.archived = false; touch(c); change('c:arch:' + c.id, `Un-archived ${c.name}`); } }); }
      break;
    case 'reactivate': if (c) reactivate(c); break;
    case 'delete':
      if (c && confirm(`Delete ${c.name} and their history? Archive keeps them instead.`)) {
        c.deleted = true; touch(c); location.hash = '#clients'; change('c:del:' + c.id, `Deleted client ${c.name}`);
        toast(`Deleted ${c.name}`, { label: 'Undo', run: () => { c.deleted = false; touch(c); change('c:del:' + c.id, `Restored ${c.name}`); } });
      }
      break;
    case 'filter': ui.filter = el.dataset.f; render(); break;
    case 'hist-filter': ui.histFilter = el.dataset.f; render(); break;
    case 'hist-refresh': history.details = {}; loadHistory(true); render(); break;
    case 'forget-token': cfg.token = ''; saveCfg(); render(); pill(); toast('Token removed from this device'); break;
    case 'export-json': download(`lead-book-${today()}.json`, JSON.stringify(draft, null, 1), 'application/json'); break;
    case 'export-csv': download(`lead-book-clients-${today()}.csv`, toCsv(), 'text/csv'); break;
    case 'clear-examples':
      if (confirm('Remove all example clients, tasks, notes and wins?')) {
        const t2 = nowIso();
        for (const k of ['clients', 'tasks', 'wins']) draft[k].forEach(x => { if (x.example && !x.deleted) { x.deleted = true; x.updatedAt = t2; } });
        change('examples', 'Removed example data');
      }
      break;
  }
});

function toggleStage(c, n) {
  const s = STAGES[n - 1];
  if (c.stages[n]) {
    // Unfill this step and any after it.
    for (let i = n; i <= 4; i++) delete c.stages[i];
    touch(c);
    change('c:st:' + c.id, `Moved ${c.name} back before “${s.label}”`);
  } else {
    for (let i = 1; i <= n; i++) if (!c.stages[i]) {
      c.stages[i] = today();
      c.activities.push({ id: uid(), type: 'stage', stage: i, title: STAGES[i - 1].label, date: today(), note: '', createdAt: nowIso(), updatedAt: nowIso() });
    }
    touch(c);
    change('c:st:' + c.id, `Moved ${c.name} to “${s.label}”`);
    if (n >= 2) toast(n === 2 ? 'Service scheduled — nice!' : n === 3 ? 'Service completed' : 'Recurring client!');
  }
}

const FIELD_LABELS = { name: 'name', business: 'business name', phone: 'phone', email: 'email', type: 'type', source: 'source', address: 'address', referredBy: 'referral', notes: 'notes' };
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'q') { ui.q = el.value; render(); return; }
  if (el.dataset.edit && el.tagName !== 'SELECT') {
    const c = byId(el.dataset.id);
    if (!c) return;
    const f = el.dataset.edit;
    if (f === 'name' && !el.value.trim()) return; // don't save an empty name
    c[f] = f === 'notes' ? el.value : el.value.trimStart();
    touch(c);
    change(`c:${c.id}:${f}`, `Edited ${FIELD_LABELS[f]} for ${c.name}`, { rerender: false });
    if (f === 'name' || f === 'business') { // keep the list beside the detail in step
      const row = document.querySelector(`.row.selected .row-${f === 'name' ? 'name' : 'biz'}`);
      if (row) row.textContent = c[f];
    }
  }
});

document.addEventListener('change', async e => {
  const el = e.target, act = el.dataset.action;
  if (el.dataset.edit && el.tagName === 'SELECT') {
    const c = byId(el.dataset.id);
    if (c) { c[el.dataset.edit] = el.value; touch(c); change(`c:${c.id}:${el.dataset.edit}`, `Set ${FIELD_LABELS[el.dataset.edit]} for ${c.name} to ${el.value || 'none'}`, { rerender: false }); }
  } else if (act === 'theme') { cfg.theme = el.value; saveCfg(); applyTheme(); render(); }
  else if (act === 'light-from') { cfg.lightFrom = Number(el.value); saveCfg(); applyTheme(); }
  else if (act === 'light-to') { cfg.lightTo = Number(el.value); saveCfg(); applyTheme(); }
  else if (act === 'import' && el.files[0]) {
    const f = el.files[0], text = await f.text();
    try {
      if (/\.json$/i.test(f.name) || text.trim().startsWith('{')) {
        const data = JSON.parse(text);
        if (!Array.isArray(data.clients)) throw new Error('no clients in that file');
        const before = clients().length;
        draft = mergeDb(draft, data);
        change('import:' + uid(), `Imported ${clients().length - before} clients from ${f.name}`);
      } else {
        const n = importCsv(text);
        if (n) change('import:' + uid(), `Imported ${n} clients from ${f.name}`);
        else toast('No rows with a name column found');
      }
    } catch (err) { toast('Couldn’t read that file: ' + err.message); }
    el.value = '';
  }
});

document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]');
  if (!f) return;
  e.preventDefault();
  const fd = new FormData(f);
  if (f.dataset.form === 'profile') { cfg.name = fd.get('name').trim(); cfg.business = fd.get('business').trim(); saveCfg(); render(); toast('Saved'); }
  if (f.dataset.form === 'sync') {
    for (const k of ['owner', 'repo', 'branch', 'path', 'token', 'device']) if (fd.has(k)) cfg[k] = String(fd.get(k) || '').trim();
    saveCfg();
    history.cache = null;
    pull({ quiet: false }).then(() => { render(); toast(pull.error || 'Settings saved'); });
  }
});

window.addEventListener('hashchange', () => { render(); if (!location.hash.startsWith('#client/') || innerWidth < 900) window.scrollTo(0, 0); });
window.addEventListener('beforeunload', () => persist(true));

/* ================= Boot ================= */

applyTheme();
render();
updateSaveBar();
pull();

if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

window.leadBook = { get draft() { return draft; }, get pending() { return pending; }, save, pull };
