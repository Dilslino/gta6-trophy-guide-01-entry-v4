// Vice City Trophy Atlas — offline checklist, filters, roadmap and missable wall.
// Data lives in data/trophies.json (55 trophies, each with a cited guide).
// Progress lives in localStorage; nothing is sent anywhere.

const DATA_URL = 'data/trophies.json';
const EARNED_KEY = 'vice-city-trophy-atlas:earned:v4';
const SPOILER_KEY = 'vice-city-trophy-atlas:spoiler:v4';

const $ = (sel) => document.querySelector(sel);
const listEl = $('#trophyList');
const countEl = $('#listCount');
const emptyEl = $('#emptyNote');
const missableEl = $('#missableList');
const searchEl = $('#searchInput');
const spoilerEl = $('#spoilerToggle');
const progressLabel = $('#progressLabel');
const progressNext = $('#progressNext');
const progressFill = $('#progressFill');

const state = {
  trophies: [],
  earned: new Set(),
  spoiler: false,
  tier: 'all',
  kind: 'all',
  earnedFilter: 'all',
  query: '',
  openGuides: new Set(),
};

const KIND_LABELS = {
  story: 'Story', side: 'Side quest', collectible: 'Collectible', activity: 'Activity',
  robbery: 'Robbery', economy: 'Money', misc: 'One-off', completion: 'Completion',
  platinum: 'Platinum',
};

function loadEarned() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  try {
    localStorage.setItem(EARNED_KEY, JSON.stringify([...state.earned]));
  } catch {
    /* storage full or unavailable: the checklist still works in memory */
  }
}

function loadSpoiler() {
  try {
    return localStorage.getItem(SPOILER_KEY) === '1';
  } catch {
    return false;
  }
}

function saveSpoiler() {
  try {
    localStorage.setItem(SPOILER_KEY, state.spoiler ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function trophyHiddenBySpoiler(t) {
  return state.spoiler && t.kind === 'story' && !state.earned.has(t.id);
}

function guideStatus(t) {
  if (t.guide.startsWith('RESOLVED at launch:')) return ['RESOLVED AT LAUNCH', ''];
  if (t.guide.startsWith('STATUS AT LAUNCH:')) return ['STILL UNCONFIRMED AT LAUNCH', 'unconfirmed'];
  return null;
}

function sourcesLine(t) {
  const links = (t.sources || []).map((s) => {
    const name = escapeHtml(s.name);
    return s.url
      ? `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${name}</a>`
      : name;
  });
  return links.length ? `Sources: ${links.join(' &middot; ')}` : '';
}

function cardHtml(t) {
  const earned = state.earned.has(t.id);
  const hidden = trophyHiddenBySpoiler(t);
  const status = guideStatus(t);
  const open = state.openGuides.has(t.id);
  const name = hidden ? 'Hidden story trophy' : escapeHtml(t.name);
  const desc = hidden
    ? 'A story trophy. Earn it in the game (or uncheck the spoiler setting) to reveal its name and description.'
    : escapeHtml(t.description);
  const kindLabel = t.missable ? 'Missable' : (KIND_LABELS[t.kind] || t.kind);
  const guideText = escapeHtml(t.guide);
  const statusHtml = status
    ? `<span class="status ${status[1]}">${status[0]}</span><br>`
    : '';
  return `<article class="trophy-card${earned ? ' earned' : ''}${t.missable ? ' missable-card-border' : ''}" data-id="${t.id}">
    <label class="trophy-check" title="Mark as earned">
      <span class="visually-hidden">Earned: ${name}</span>
      <input type="checkbox" data-check="${t.id}" ${earned ? 'checked' : ''}>
    </label>
    <div>
      <div class="trophy-head">
        <h3 class="trophy-name">${name}</h3>
        <span class="badge ${t.grade}">${t.grade}</span>
        <span class="kind-tag">${escapeHtml(kindLabel)}</span>
        ${t.missable ? '<span class="missable-flag">Missable</span>' : ''}
      </div>
      <p class="trophy-desc">${desc}</p>
      <p class="sources-line">${sourcesLine(t)}</p>
      <button class="guide-toggle" type="button" data-guide="${t.id}" aria-expanded="${open}">
        ${open ? 'Hide the step-by-step guide' : 'Read the step-by-step guide'}
      </button>
      ${open ? `<p class="guide-body">${statusHtml}${guideText}</p>` : ''}
    </div>
  </article>`;
}

function visibleTrophies() {
  const q = state.query.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (state.tier !== 'all' && t.grade !== state.tier) return false;
    if (state.kind === 'missable') {
      if (!t.missable) return false;
    } else if (state.kind !== 'all' && t.kind !== state.kind) {
      return false;
    }
    if (state.earnedFilter === 'earned' && !state.earned.has(t.id)) return false;
    if (state.earnedFilter === 'todo' && state.earned.has(t.id)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${t.kind} ${t.grade}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderList() {
  const shown = visibleTrophies();
  listEl.innerHTML = shown.map(cardHtml).join('');
  countEl.textContent = `Showing ${shown.length} of ${state.trophies.length} trophies. Tick a trophy when you earn it; your checklist is saved in this browser. Open any card to read its cited step-by-step guide.`;
  emptyEl.hidden = shown.length !== 0;
}

function renderMissable() {
  const missables = state.trophies.filter((t) => t.missable);
  missableEl.innerHTML = missables.map((t) => {
    const earned = state.earned.has(t.id);
    return `<div class="missable-card">
      <h3>${escapeHtml(t.name)} <span class="badge ${t.grade}">${t.grade}</span> ${earned ? '<span class="kind-tag">Earned</span>' : ''}</h3>
      <p class="why">Why it can be missed: the first meditation, at Jason&rsquo;s house in Chapter 1, disappears for good after Chapter 1 ends.</p>
      <p>${escapeHtml(t.guide)}</p>
      <p class="sources-line">${sourcesLine(t)}</p>
    </div>`;
  }).join('') || '<p>No missable trophies are flagged. That would be surprising: check the data file.</p>';
}

function renderProgress() {
  const total = state.trophies.length;
  const done = state.earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressLabel.textContent = `${done} of ${total} earned · ${pct}%`;
  progressFill.style.width = `${pct}%`;
  document.title = total
    ? `${done}/${total} trophies · Vice City Trophy Atlas`
    : 'Vice City Trophy Atlas — GTA VI Trophy Guide & Tracker';
  if (done === total && total > 0) {
    progressNext.textContent = 'Platinum earned — you are a Leonida Legend.';
  } else if (!state.earned.has('positive-mental-attitude')) {
    progressNext.textContent = 'Next up: the Chapter 1 balcony meditation';
  } else {
    const next = state.trophies.find((t) => !state.earned.has(t.id));
    progressNext.textContent = next ? `Next up: ${next.name}` : '';
  }
}

function renderAll() {
  renderProgress();
  renderMissable();
  renderList();
}

function setChipGroup(groupEl, attr, value) {
  groupEl.querySelectorAll('.chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset[attr] === value);
  });
}

function bindChips(groupEl, attr, apply) {
  groupEl.addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    apply(chip.dataset[attr]);
    setChipGroup(groupEl, attr, chip.dataset[attr]);
    renderList();
  });
}

function exportProgress() {
  const payload = {
    app: 'vice-city-trophy-atlas',
    version: 4,
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('no earned list');
      const known = new Set(state.trophies.map((t) => t.id));
      state.earned = new Set(ids.filter((id) => known.has(id)));
      saveEarned();
      renderAll();
    } catch {
      alert('That file is not a Trophy Atlas progress export.');
    }
  };
  reader.readAsText(file);
}

function applyHash() {
  const hash = location.hash || '';
  if (hash.startsWith('#guide-')) {
    const id = hash.slice('#guide-'.length);
    const target = state.trophies.find((t) => t.id === id);
    if (target) {
      state.openGuides.add(id);
      renderList();
      const card = listEl.querySelector(`[data-id="${id}"]`);
      if (card) card.scrollIntoView({ block: 'start' });
      return;
    }
  }
  if (hash === '#roadmap' || hash === '#missable' || hash === '#list') {
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ block: 'start' });
  }
}

async function init() {
  state.earned = loadEarned();
  state.spoiler = loadSpoiler();
  spoilerEl.checked = state.spoiler;

  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`could not load ${DATA_URL}`);
  const data = await response.json();
  state.trophies = Array.isArray(data) ? data : data.trophies;

  bindChips($('#tierChips'), 'tier', (v) => { state.tier = v; });
  bindChips($('#kindChips'), 'kind', (v) => { state.kind = v; });
  bindChips($('#earnedChips'), 'earned', (v) => { state.earnedFilter = v; });

  searchEl.addEventListener('input', () => {
    state.query = searchEl.value;
    renderList();
  });

  spoilerEl.addEventListener('change', () => {
    state.spoiler = spoilerEl.checked;
    saveSpoiler();
    renderList();
  });

  listEl.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-guide]');
    if (!toggle) return;
    const id = toggle.dataset.guide;
    if (state.openGuides.has(id)) state.openGuides.delete(id);
    else state.openGuides.add(id);
    renderList();
    // Re-rendering rebuilds the cards, so hand focus back to the same toggle.
    const again = listEl.querySelector(`[data-guide="${id}"]`);
    if (again) again.focus();
  });

  listEl.addEventListener('change', (event) => {
    const box = event.target.closest('[data-check]');
    if (!box) return;
    if (box.checked) state.earned.add(box.dataset.check);
    else state.earned.delete(box.dataset.check);
    saveEarned();
    renderAll();
  });

  $('#exportBtn').addEventListener('click', exportProgress);
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importProgress(file);
    event.target.value = '';
  });
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('Clear every tick on the checklist?')) return;
    state.earned.clear();
    saveEarned();
    renderAll();
  });

  window.addEventListener('hashchange', applyHash);

  renderAll();
  applyHash();
}

init().catch((error) => {
  listEl.innerHTML = `<p class="empty-note">The trophy data could not be loaded (${escapeHtml(error.message)}). Serve this folder with a static server and reload.</p>`;
});
