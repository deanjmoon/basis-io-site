/* [basis-io] sales workbook - tabs, local drafts, pipeline maths and save to the team sheet.
   Without this file every tab shows stacked and the page prints as a blank workbook. */
(function () {
  // Google Apps Script web app URL - see tools/workbook-sheet.gs for setup
  var ENDPOINT = 'REPLACE-SHEET-ENDPOINT';
  var STORE = 'basis-io-workbook-v1';

  var statusEl = document.querySelector('[data-status]');
  var personEl = document.getElementById('wb-person');
  var codeEl = document.getElementById('wb-code');
  var panels = Array.prototype.slice.call(document.querySelectorAll('.wb-panel'));
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.wb-tab'));

  function status(msg, isError) {
    statusEl.textContent = msg;
    statusEl.classList.toggle('is-error', !!isError);
  }

  // ---------- storage (wrapped: private windows can refuse it) ----------

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (err) { return {}; }
  }
  function store(data) {
    try { localStorage.setItem(STORE, JSON.stringify(data)); return true; } catch (err) { return false; }
  }
  var state = load();
  state.drafts = state.drafts || {};

  function draftsFor(person) {
    return state.drafts[person || '_'] = state.drafts[person || '_'] || {};
  }

  // ---------- tabs ----------

  var row = document.querySelector('.wb-tabs__row');
  row.setAttribute('role', 'tablist');
  tabs.forEach(function (t) {
    t.setAttribute('role', 'tab');
    t.addEventListener('click', function (ev) { ev.preventDefault(); show(t.getAttribute('aria-controls'), true); });
    t.addEventListener('keydown', function (ev) {
      var i = tabs.indexOf(t);
      if (ev.key === 'ArrowRight') { tabs[(i + 1) % tabs.length].focus(); ev.preventDefault(); }
      if (ev.key === 'ArrowLeft') { tabs[(i - 1 + tabs.length) % tabs.length].focus(); ev.preventDefault(); }
    });
  });
  panels.forEach(function (p) { p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', 'tab-' + p.id); });

  function show(id, fromClick) {
    if (!document.getElementById(id)) id = panels[0].id;
    panels.forEach(function (p) { p.hidden = p.id !== id; });
    tabs.forEach(function (t) {
      var on = t.getAttribute('aria-controls') === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    if (fromClick) {
      history.replaceState(null, '', '#' + id);
      document.querySelector('.wb-tabs').scrollIntoView({ block: 'start' });
    }
  }
  show(location.hash.slice(1));
  window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });

  // ---------- pipeline maths ----------

  var calcIn = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-calc-in]'), function (el) { calcIn[el.getAttribute('data-calc-in')] = el; });
  var calcOut = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-calc-out]'), function (el) { calcOut[el.getAttribute('data-calc-out')] = el; });
  var lastCalc = null;

  function num(k) { var v = parseFloat(calcIn[k] && calcIn[k].value); return isFinite(v) && v > 0 ? v : null; }
  function pct(k) { var v = num(k); return v ? Math.min(v, 100) / 100 : null; }
  function up(x) { return Math.ceil(x - 1e-9); }

  function runCalc() {
    var r = {};
    var rev = num('revenue'), per = num('revPerPractice'), ppl = num('practicesPerLicensee');
    if (rev && per) r.practices = up(rev / per);
    if (r.practices && ppl) r.licensees = up(r.practices / ppl);
    if (r.licensees && pct('licWin')) r.licOpps = up(r.licensees / pct('licWin'));
    if (r.licOpps && pct('meetingToOpp')) r.licMeetings = up(r.licOpps / pct('meetingToOpp'));
    if (r.practices && pct('pracWin')) r.pracMeetings = up(r.practices / pct('pracWin'));
    if (r.licMeetings && r.pracMeetings && pct('convToMeeting')) r.conversations = up((r.licMeetings + r.pracMeetings) / pct('convToMeeting'));
    if (r.conversations && num('touches')) r.touchesTotal = up(r.conversations * num('touches'));
    if (r.touchesTotal && num('weeks') && num('sellers')) r.touchesPerPersonWeek = up(r.touchesTotal / num('weeks') / num('sellers'));
    Object.keys(calcOut).forEach(function (k) {
      calcOut[k].textContent = r[k] != null ? r[k].toLocaleString('en-AU') : '–';
    });
    lastCalc = r;
  }

  function calcSummary() {
    if (!lastCalc || lastCalc.practices == null) return '';
    return Object.keys(calcOut).filter(function (k) { return lastCalc[k] != null; }).map(function (k) {
      return calcOut[k].previousElementSibling.textContent + ': ' + lastCalc[k];
    }).join(' | ');
  }
  runCalc();

  // ---------- answers: fields and table rows ----------

  function context(el) {
    var panel = el.closest('.wb-panel');
    var section = el.closest('.wb-section');
    return { tab: panel ? panel.getAttribute('data-tab') : '', section: section ? section.getAttribute('data-section') : '' };
  }

  function questionText(el) {
    var q = el.closest('.q');
    var own = el.id ? document.querySelector('label[for="' + el.id + '"]') : null;
    var lead = q && q.querySelector('.q__label');
    if (own && lead && own !== lead) return lead.textContent.trim() + ' - ' + own.textContent.trim();
    return (own || lead).textContent.trim();
  }

  var fields = Array.prototype.slice.call(document.querySelectorAll('.wb-panel textarea[name], .wb-panel input[name]'));
  var tables = Array.prototype.slice.call(document.querySelectorAll('.wb-panel table[data-name]'));

  function collect() {
    var out = [];
    var seenRadio = {};
    fields.forEach(function (el) {
      var c = context(el);
      if (el.type === 'radio') {
        if (seenRadio[el.name]) return;
        seenRadio[el.name] = true;
        var picked = document.querySelector('input[name="' + el.name + '"]:checked');
        out.push({ id: el.name, tab: c.tab, section: c.section, question: questionText(el), answer: picked ? picked.value : '' });
        return;
      }
      out.push({ id: el.name, tab: c.tab, section: c.section, question: questionText(el), answer: el.value.trim() });
    });
    tables.forEach(function (tbl) {
      var c = context(tbl);
      var heads = Array.prototype.map.call(tbl.querySelectorAll('thead th'), function (th) { return th.textContent.trim(); });
      Array.prototype.forEach.call(tbl.querySelectorAll('tbody tr'), function (tr) {
        var label = tr.getAttribute('data-row');
        var parts = [];
        Array.prototype.forEach.call(tr.querySelectorAll('input'), function (inp, i) {
          if (inp.value.trim()) parts.push(heads[i + 1] + ': ' + inp.value.trim());
        });
        out.push({
          id: tbl.getAttribute('data-name') + '.' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          tab: c.tab, section: c.section,
          question: tbl.getAttribute('data-question') + ' - ' + label,
          answer: parts.join(' | ')
        });
      });
    });
    var calc = calcSummary();
    if (calc) out.push({ id: 'plan.calc.result', tab: 'Business plan', section: 'Pipeline maths', question: 'Pipeline maths - result', answer: calc });
    return out;
  }

  // drafts are keyed per person so a shared laptop keeps four separate workbooks
  function snapshot() {
    var d = {};
    fields.forEach(function (el) {
      if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; }
      else if (el.value) d[el.name] = el.value;
    });
    tables.forEach(function (tbl) {
      Array.prototype.forEach.call(tbl.querySelectorAll('input'), function (inp, i) {
        if (inp.value) d[tbl.getAttribute('data-name') + '#' + i] = inp.value;
      });
    });
    return d;
  }

  function restore(d) {
    fields.forEach(function (el) {
      if (el.type === 'radio') el.checked = d[el.name] === el.value;
      else el.value = d[el.name] || '';
    });
    tables.forEach(function (tbl) {
      Array.prototype.forEach.call(tbl.querySelectorAll('input'), function (inp, i) {
        inp.value = d[tbl.getAttribute('data-name') + '#' + i] || '';
      });
    });
    runCalc();
  }

  var timer = null;
  document.addEventListener('input', function (ev) {
    if (!ev.target.closest('.wb-panel')) return;
    if (ev.target.closest('[data-calc]')) runCalc();
    clearTimeout(timer);
    timer = setTimeout(function () {
      state.drafts[personEl.value || '_'] = snapshot();
      state.dirty = true;
      status(store(state) ? 'Draft saved in this browser. Not yet in the team sheet.' : 'This browser will not keep drafts. Save to the team sheet or download a CSV.', false);
    }, 500);
  });
  // radios fire change rather than input in some browsers
  document.addEventListener('change', function (ev) {
    if (ev.target.type === 'radio') ev.target.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // ---------- person and team code ----------

  if (state.person) personEl.value = state.person;
  if (state.code) codeEl.value = state.code;
  restore(draftsFor(personEl.value));

  personEl.addEventListener('change', function () {
    state.person = personEl.value;
    // answers typed before a name was chosen belong to whoever chooses first
    var unnamed = state.drafts._;
    if (personEl.value && unnamed && Object.keys(unnamed).length && !Object.keys(draftsFor(personEl.value)).length) {
      state.drafts[personEl.value] = unnamed;
      delete state.drafts._;
    }
    restore(draftsFor(personEl.value));
    store(state);
    status(personEl.value ? 'Showing ' + personEl.value + "'s answers." : 'Choose your name before you start.');
  });
  codeEl.addEventListener('change', function () { state.code = codeEl.value; store(state); });

  // ---------- save to the team sheet ----------

  var saveBtn = document.querySelector('[data-action="save"]');
  saveBtn.addEventListener('click', function () {
    if (!personEl.value) { status('Choose your name first.', true); personEl.focus(); return; }
    if (ENDPOINT.indexOf('REPLACE') === 0) {
      status('The team sheet is not connected yet. Your answers are safe in this browser. Download a CSV to share them.', true);
      return;
    }
    if (!codeEl.value) { status('Enter the team code first.', true); codeEl.focus(); return; }
    var answers = collect();
    saveBtn.disabled = true;
    status('Saving ' + answers.filter(function (a) { return a.answer; }).length + ' answers…');
    // text/plain keeps this a simple request: Apps Script cannot answer a CORS preflight
    fetch(ENDPOINT, { method: 'POST', body: JSON.stringify({ code: codeEl.value, person: personEl.value, answers: answers }) })
      .then(function (res) { return res.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error === 'bad_code' ? 'The team code is wrong.' : 'The sheet refused the save (' + res.error + ').');
        state.dirty = false; store(state);
        status('Saved to the team sheet at ' + new Date().toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }) + '. ' + res.changed + ' answers changed.');
      })
      .catch(function (err) {
        status((err && err.message && err.message.indexOf('team code') > -1 ? err.message : 'Could not confirm the save. Your answers are still in this browser; try again.'), true);
      })
      .then(function () { saveBtn.disabled = false; });
  });

  // ---------- export and print ----------

  function csvCell(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }
  document.querySelector('[data-action="export"]').addEventListener('click', function () {
    var rows = [['Person', 'Tab', 'Section', 'Question', 'Answer']];
    collect().forEach(function (a) { rows.push([personEl.value, a.tab, a.section, a.question, a.answer]); });
    var blob = new Blob(['﻿' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n')], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'basis-io-workbook-' + (personEl.value || 'draft').toLowerCase() + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  document.querySelector('[data-action="print"]').addEventListener('click', function () {
    var kept = snapshot();
    restore({});
    window.print();
    restore(kept);
  });

  window.addEventListener('beforeunload', function (ev) {
    if (state.dirty && ENDPOINT.indexOf('REPLACE') !== 0) { ev.preventDefault(); ev.returnValue = ''; }
  });

  if (!personEl.value) status('Choose your name before you start.');
})();
