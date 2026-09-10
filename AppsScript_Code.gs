/**
 * ============================================================
 *  Google Apps Script — "NGƯƠN ĐANG ONLINE" + razbivka po vezelor
 * ============================================================
 *  Acest app script conteaza in TIMP REAL:
 *     - cati oameni acuma au deschis situl (online)
 *     - ce vezelo folosesc: Chrome(3), Bing(1), Firefox(1), ...
 *
 *  INSTALARE (O DATA, 5 minut) -> vezi INSTRUCTIONS_APPS_SCRIPT.md
 * ============================================================
 */

// O phiên "moare" dacă n-a trimis heartbeat de mais de 60 secunde
var TTL_MS = 60 * 1000;

function doGet() {
  return out_({ ok: false, error: 'Use POST with action=heartbeat' });
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  var action = String(p.action || '');
  var lock = LockService.getScriptLock();
  var got = false;
  try {
    got = lock.waitLock(20000);
    if (action === 'heartbeat') return heartbeat_(p);
    if (action === 'leave')     return leave_(p);
    return out_({ ok: false, error: 'unknown action: ' + action });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    if (got) lock.releaseLock();
  }
}

// inregistre / actualizeaza phiênul activ + sgun un raspuns cu online & vezelo
function heartbeat_(p) {
  var sid = String(p.sid || '').trim();
  if (!sid) return out_({ ok: false, error: 'no sid' });

  var browser = String(p.browser || 'Other').trim();
  if (!browser) browser = 'Other';

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Online');
  if (!sh) {
    sh = ss.insertSheet('Online');
    sh.getRange('A1').setValue('{}');
  }

  var data = {};
  try { data = JSON.parse(sh.getRange('A1').getValue() || '{}'); } catch (err) { data = {}; }
  if (typeof data !== 'object' || data === null) data = {};

  var now = Date.now();
  var out = {};
  Object.keys(data).forEach(function (k) {
    var rec = data[k] || {};
    if (now - Number(rec.t || 0) <= TTL_MS) out[k] = rec;
  });
  out[sid] = { b: browser, t: now };
  sh.getRange('A1').setValue(JSON.stringify(out));

  var browsers = {};
  Object.keys(out).forEach(function (k) {
    var b = String(out[k].b || 'Other');
    browsers[b] = (browsers[b] || 0) + 1;
  });

  return out_({ ok: true, online: Object.keys(out).length, browsers: browsers });
}

// scoaterea phiênulului la inchiderea tab-ului (optional)
function leave_(p) {
  var sid = String(p.sid || '').trim();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Online');
  if (sh && sid) {
    var data = {};
    try { data = JSON.parse(sh.getRange('A1').getValue() || '{}'); } catch (err) { data = {}; }
    if (typeof data === 'object' && data) {
      delete data[sid];
      sh.getRange('A1').setValue(JSON.stringify(data));
    }
  }
  return out_({ ok: true });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType('application/json');
}