/**
 * [basis-io] sales workbook - Google Apps Script receiver.
 * Not deployed to the website (tools/ is in .vercelignore).
 *
 * Setup, once:
 *  1. Create a Google Sheet, e.g. "basis-io Sales Workbook - Responses". Share it with the team.
 *  2. Extensions → Apps Script. Replace the contents of Code.gs with this file. Save.
 *  3. Project Settings → Script Properties → add TEAM_CODE = a passphrase the four of you share.
 *  4. Deploy → New deployment → type "Web app". Execute as: Me. Who has access: Anyone. Deploy, authorise.
 *  5. Copy the web app URL (ends in /exec) into ENDPOINT at the top of workbook/workbook.js.
 *
 * The URL only accepts writes that carry the team code. Nobody can read answers through it:
 * reading happens in the Sheet, under Google's own sharing.
 *
 * Two tabs are maintained:
 *  - "Side by side": one row per question, one column per person, plus Agreed and Notes
 *    columns for the workshop. Rows are never reordered, so Agreed text stays put.
 *  - "Log": every changed answer with a timestamp, so nothing is lost when someone edits.
 */

var PEOPLE = ['Dean', 'Jason', 'Nanette', 'Damien'];
var SIDE_HEAD = ['Question ID', 'Tab', 'Section', 'Question'].concat(PEOPLE, ['Agreed', 'Notes']);
var LOG_HEAD = ['Received', 'Person', 'Tab', 'Section', 'Question ID', 'Question', 'Answer'];

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return reply({ ok: false, error: 'bad_json' }); }

  var code = PropertiesService.getScriptProperties().getProperty('TEAM_CODE');
  if (!code || body.code !== code) return reply({ ok: false, error: 'bad_code' });
  if (PEOPLE.indexOf(body.person) < 0) return reply({ ok: false, error: 'bad_person' });
  if (!Array.isArray(body.answers) || body.answers.length > 1000) return reply({ ok: false, error: 'bad_answers' });

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var side = sheet(ss, 'Side by side', SIDE_HEAD);
    var log = sheet(ss, 'Log', LOG_HEAD);

    var last = side.getLastRow();
    var ids = last > 1 ? side.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    var col = SIDE_HEAD.indexOf(body.person) + 1;
    var current = last > 1 ? side.getRange(2, col, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];

    var newRows = [], logRows = [], now = new Date();
    body.answers.forEach(function (a) {
      var id = clean(a.id, 120);
      if (!id) return;
      var answer = clean(a.answer, 20000);
      var i = ids.indexOf(id);
      if (i < 0) {
        if (!answer) return;
        ids.push(id);
        current.push('');
        newRows.push([id, clean(a.tab, 80), clean(a.section, 120), clean(a.question, 500)]);
        i = ids.length - 1;
      }
      if (current[i] === answer || "'" + current[i] === answer) return;
      current[i] = answer;
      logRows.push([now, body.person, clean(a.tab, 80), clean(a.section, 120), id, clean(a.question, 500), answer]);
    });

    if (newRows.length) side.getRange(last + 1, 1, newRows.length, 4).setValues(newRows);
    if (logRows.length) {
      side.getRange(2, col, current.length, 1).setValues(current.map(function (v) { return [v]; }));
      log.getRange(log.getLastRow() + 1, 1, logRows.length, LOG_HEAD.length).setValues(logRows);
    }
    return reply({ ok: true, changed: logRows.length });
  } finally {
    lock.releaseLock();
  }
}

function sheet(ss, name, head) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange('A:Z').setWrap(true).setVerticalAlignment('top');
  }
  return sh;
}

// Strings only, length-capped, and never a formula: a leading = + - @ is escaped.
function clean(v, max) {
  var s = v == null ? '' : String(v).slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
