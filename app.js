'use strict';

/* ══════════════════════════════════════════════════════════════
   ORV Schedule Maker — app.js
   ══════════════════════════════════════════════════════════════ */

/* ── Constants ─────────────────────────────────────────────── */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'];
const ROW_H = 64; // px per 30-min slot

const PALETTE = [
  '#E76F51', // coral
  '#F4A261', // sandy orange
  '#2A9D8F', // teal
  '#457B9D', // steel blue
  '#E9C46A', // amber yellow
  '#9B72CF', // soft purple
  '#52B788', // mint
  '#F28482', // rose
];

/* ── State ─────────────────────────────────────────────────── */
let courses    = [];
let editingId  = null;
let ctxTargetId = null;

/* ── Time helpers ──────────────────────────────────────────── */
const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fromMin = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

function fmt12(t) {
  let [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

/* ── Color assignment ──────────────────────────────────────── */

function nextColor() {
  const used = new Set(courses.map(c => c.color));
  for (const col of PALETTE) if (!used.has(col)) return col;
  return PALETTE[courses.length % PALETTE.length];
}

/* ══════════════════════════════════════════════════════════════
   GRID RENDERING
   ══════════════════════════════════════════════════════════════ */
function renderGrid() {
  const wrapper = document.getElementById('grid-wrapper');
  wrapper.innerHTML = '';

  /* Empty state */
  if (courses.length === 0) {
    const el = document.createElement('div');
    el.className = 'grid-empty';
    el.innerHTML = '<p>No lectures yet.<br>Click <em>＋ Add Lecture</em> to begin.</p>';
    wrapper.appendChild(el);
    return;
  }

  /* Dynamic time range */
  const allStarts = courses.map(c => toMin(c.startTime));
  const allEnds   = courses.map(c => toMin(c.endTime));
  const gridStart = Math.floor(Math.min(...allStarts) / 30) * 30;
  const gridEnd   = Math.ceil (Math.max(...allEnds)   / 30) * 30;
  const totalSlots = (gridEnd - gridStart) / 30;
  const totalHeight = totalSlots * ROW_H;

  /* Outer container */
  const container = document.createElement('div');
  container.className = 'grid-container';

  /* ── Header row ─────────────────────────────────────────── */
  const header = document.createElement('div');
  header.className = 'grid-header';

  const corner = document.createElement('div');
  corner.className = 'time-corner';
  header.appendChild(corner);

  DAYS.forEach(day => {
    const dh = document.createElement('div');
    dh.className = 'day-header';
    dh.textContent = day.toUpperCase();
    header.appendChild(dh);
  });
  container.appendChild(header);

  /* ── Body ───────────────────────────────────────────────── */
  const body = document.createElement('div');
  body.className = 'grid-body';

  /* Time axis */
  const axis = document.createElement('div');
  axis.className = 'time-axis';
  for (let s = 0; s < totalSlots; s++) {
    const t = gridStart + s * 30;
    const lbl = document.createElement('div');
    lbl.className = 'time-label' + (t % 60 === 0 ? ' hour' : '');
    lbl.textContent = fmt12(fromMin(t));
    axis.appendChild(lbl);
  }
  body.appendChild(axis);

  /* Day columns */
  const daysWrap = document.createElement('div');
  daysWrap.className = 'days-container';

  DAYS.forEach(day => {
    const col = document.createElement('div');
    col.className = 'day-col';
    col.style.height = `${totalHeight}px`;

    /* Grid lines */
    for (let s = 0; s < totalSlots; s++) {
      const absTime = gridStart + s * 30;
      const line = document.createElement('div');
      line.className = `grid-line ${absTime % 60 === 0 ? 'hour' : 'half'}`;
      line.style.top = `${s * ROW_H}px`;
      col.appendChild(line);
    }

    /* Lectures for this day */
    courses.forEach(course => {
      if (!course.days.includes(day)) return;

      const startM = toMin(course.startTime);
      const endM   = toMin(course.endTime);
      const top    = (startM - gridStart) / 30 * ROW_H;
      const height = (endM - startM) / 30 * ROW_H;

      const block = document.createElement('div');
      block.className = 'course-block';
      block.dataset.id = course.id;
      block.style.cssText = `
        top: ${top}px;
        height: ${Math.max(height - 4, 22)}px;
        background: ${course.color};
        box-shadow: 0 2px 10px ${course.color}60, inset 0 0 0 1px ${course.color}99;
      `;

      const nameEl = document.createElement('div');
      nameEl.className = 'block-name';
      nameEl.textContent = course.name;
      block.appendChild(nameEl);

      /* Only show time if tall enough */
      if (height >= ROW_H) {
        const timeEl = document.createElement('div');
        timeEl.className = 'block-time';
        timeEl.textContent = `${fmt12(course.startTime)} – ${fmt12(course.endTime)}`;
        block.appendChild(timeEl);
      }

      block.addEventListener('click', e => {
        e.stopPropagation();
        showCtxMenu(e, course.id);
      });

      col.appendChild(block);
    });

    daysWrap.appendChild(col);
  });

  body.appendChild(daysWrap);
  container.appendChild(body);
  wrapper.appendChild(container);
}

/* ══════════════════════════════════════════════════════════════
   MODAL
   ══════════════════════════════════════════════════════════════ */
function buildHourOpts(sel) {
  sel.innerHTML = '';
  for (let h = 1; h <= 12; h++) {
    const opt = document.createElement('option');
    opt.value = String(h);
    opt.textContent = String(h);
    sel.appendChild(opt);
  }
}

function buildMinOpts(sel) {
  sel.innerHTML = '';
  for (let m = 0; m < 60; m += 5) {
    const opt = document.createElement('option');
    opt.value = String(m).padStart(2, '0');
    opt.textContent = String(m).padStart(2, '0');
    sel.appendChild(opt);
  }
}

function buildAmPmOpts(sel) {
  sel.innerHTML = '';
  ['AM', 'PM'].forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
}

function getTime(prefix) {
  let h    = parseInt(document.getElementById(`field-${prefix}-h`).value, 10);
  const m  = document.getElementById(`field-${prefix}-m`).value;
  const ap = document.getElementById(`field-${prefix}-ap`).value;
  if (ap === 'AM' && h === 12) h = 0;
  if (ap === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${m}`;
}

function setTime(prefix, hhmm) {
  let [h, m] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  document.getElementById(`field-${prefix}-h`).value  = String(h);
  document.getElementById(`field-${prefix}-m`).value  = String(m).padStart(2, '0');
  document.getElementById(`field-${prefix}-ap`).value = ap;
}

function openModal(mode, id = null) {
  editingId = id;

  const errEl = document.getElementById('modal-error');
  errEl.textContent = '';
  errEl.classList.add('hidden');
  document.querySelectorAll('#day-checks input').forEach(cb => (cb.checked = false));

  ['start', 'end'].forEach(p => {
    buildHourOpts(document.getElementById(`field-${p}-h`));
    buildMinOpts(document.getElementById(`field-${p}-m`));
    buildAmPmOpts(document.getElementById(`field-${p}-ap`));
  });

  if (mode === 'edit' && id) {
    const c = courses.find(x => x.id === id);
    if (!c) return;
    document.getElementById('modal-heading').textContent = 'Edit Lecture';
    document.getElementById('field-name').value = c.name;
    setTime('start', c.startTime);
    setTime('end', c.endTime);
    c.days.forEach(d => {
      const cb = document.querySelector(`#day-checks input[value="${d}"]`);
      if (cb) cb.checked = true;
    });
  } else {
    document.getElementById('modal-heading').textContent = 'Add Lecture';
    document.getElementById('field-name').value = '';
    setTime('start', '08:00');
    setTime('end', '09:30');
  }

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('field-name').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  editingId = null;
}

function confirmModal() {
  const name      = document.getElementById('field-name').value.trim();
  const startTime = getTime('start');
  const endTime   = getTime('end');
  const days      = [...document.querySelectorAll('#day-checks input:checked')].map(cb => cb.value);

  if (!name)                              { showModalErr('Please enter a course name.');               return; }
  if (!startTime || !endTime)             { showModalErr('Please select start and end times.');        return; }
  if (toMin(endTime) <= toMin(startTime)) { showModalErr('End time must be after start time.');        return; }
  if (days.length === 0)                  { showModalErr('Please select at least one day.');           return; }

  if (editingId) {
    const idx = courses.findIndex(c => c.id === editingId);
    if (idx !== -1) courses[idx] = { ...courses[idx], name, startTime, endTime, days };
  } else {
    courses.push({ id: crypto.randomUUID(), name, startTime, endTime, days, color: nextColor() });
  }

  closeModal();
  renderGrid();
}

function showModalErr(msg) {
  const el = document.getElementById('modal-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

/* ══════════════════════════════════════════════════════════════
   CONTEXT MENU
   ══════════════════════════════════════════════════════════════ */
function showCtxMenu(e, id) {
  ctxTargetId = id;
  const menu = document.getElementById('ctx-menu');
  menu.classList.remove('hidden');
  const x = Math.min(e.clientX + 6, window.innerWidth  - 145);
  const y = Math.min(e.clientY + 6, window.innerHeight -  90);
  menu.style.left = `${x}px`;
  menu.style.top  = `${y}px`;
}

function hideCtxMenu() {
  document.getElementById('ctx-menu').classList.add('hidden');
  ctxTargetId = null;
}

/* ══════════════════════════════════════════════════════════════
   SAVE / LOAD
   ══════════════════════════════════════════════════════════════ */
function saveSchedule() {
  if (courses.length === 0) { alert('Add at least one lecture before saving.'); return; }

  const titleVal = document.getElementById('schedule-title').value.trim();
  const filename = titleVal || 'schedule';

  /* Sync display title */
  const dt = document.getElementById('display-title');
  if (titleVal) { dt.textContent = titleVal; dt.classList.remove('hidden'); }
  else          { dt.classList.add('hidden'); }

  /* 1 ── JSON */
  const json = JSON.stringify({ title: titleVal, courses }, null, 2);
  dlBlob(new Blob([json], { type: 'application/json' }), `${filename}.json`);

  /* 2 ── PNG via html2canvas */
  const target = document.getElementById('schedule-display');

  html2canvas(target, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#040410',
    scale: 2,
    logging: false,
    ignoreElements: el => ['ctx-menu', 'modal-overlay', 'controls-bar'].includes(el.id),
  })
  .then(canvas => {
    canvas.toBlob(blob => {
      if (blob) dlBlob(blob, `${filename}.png`);
    }, 'image/png');
  })
  .catch(err => {
    console.warn('html2canvas failed:', err);
    alert('JSON saved. Screenshot failed — make sure bg.jpg is in the project folder and try from a local server if needed.');
  });
}

function dlBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function loadSchedule(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data.courses)) throw new Error();
      courses = data.courses;
      const titleInput = document.getElementById('schedule-title');
      titleInput.value = data.title || '';
      const dt = document.getElementById('display-title');
      if (data.title) { dt.textContent = data.title; dt.classList.remove('hidden'); }
      else              dt.classList.add('hidden');
      renderGrid();
    } catch {
      alert('Could not load schedule: invalid or corrupt file.');
    }
  };
  reader.readAsText(file);
}

function newSchedule() {
  if (courses.length > 0 && !confirm('Clear the current schedule and start fresh?')) return;
  courses = [];
  document.getElementById('schedule-title').value = '';
  const dt = document.getElementById('display-title');
  dt.textContent = '';
  dt.classList.add('hidden');
  renderGrid();
}

/* ══════════════════════════════════════════════════════════════
   INIT & EVENT WIRING
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();

  /* ─── Toolbar buttons ─── */
  document.getElementById('btn-add') .addEventListener('click', () => openModal('add'));
  document.getElementById('btn-save').addEventListener('click', saveSchedule);
  document.getElementById('btn-new') .addEventListener('click', newSchedule);
  document.getElementById('btn-load').addEventListener('click', () => {
    document.getElementById('load-file-input').click();
  });
  document.getElementById('load-file-input').addEventListener('change', e => {
    if (e.target.files[0]) { loadSchedule(e.target.files[0]); e.target.value = ''; }
  });

  /* ─── Modal ─── */
  document.getElementById('btn-modal-confirm').addEventListener('click', confirmModal);
  document.getElementById('btn-modal-cancel') .addEventListener('click', closeModal);
  document.getElementById('modal-overlay')     .addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  /* Auto-advance end time when start changes */
  function onStartChange() {
    const sm = toMin(getTime('start'));
    if (toMin(getTime('end')) <= sm) setTime('end', fromMin(sm + 90));
  }
  ['field-start-h', 'field-start-m', 'field-start-ap'].forEach(id => {
    document.getElementById(id).addEventListener('change', onStartChange);
  });

  /* ─── Context menu ─── */
  document.getElementById('ctx-edit').addEventListener('click', () => {
    const id = ctxTargetId; hideCtxMenu(); if (id) openModal('edit', id);
  });
  document.getElementById('ctx-delete').addEventListener('click', () => {
    const id = ctxTargetId; hideCtxMenu();
    if (id && confirm('Delete this lecture?')) { courses = courses.filter(c => c.id !== id); renderGrid(); }
  });
  document.addEventListener('click', e => {
    const m = document.getElementById('ctx-menu');
    if (!m.classList.contains('hidden') && !m.contains(e.target)) hideCtxMenu();
  });

  /* ─── Keyboard ─── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); hideCtxMenu(); }
    if (e.key === 'Enter') {
      const ov = document.getElementById('modal-overlay');
      if (!ov.classList.contains('hidden') && document.activeElement.tagName !== 'BUTTON') {
        e.preventDefault(); confirmModal();
      }
    }
  });

  /* ─── Sync display title ─── */
  document.getElementById('schedule-title').addEventListener('input', e => {
    const dt = document.getElementById('display-title');
    if (e.target.value.trim()) { dt.textContent = e.target.value; dt.classList.remove('hidden'); }
    else dt.classList.add('hidden');
  });
});
