(function () {
  'use strict';
  var slug = document.body.dataset.slug;
  var P = window.PROGRAMS[slug];
  var $ = function (s) { return document.querySelector(s); };

  /* ---------- theme toggle ---------- */
  initTheme();

  /* ---------- meta line ---------- */
  var meta = $('#meta');
  if (meta) {
    meta.innerHTML =
      '<li><strong>' + P.type + '</strong> on CodeHS</li>' +
      '<li>Created <strong>' + P.created + '</strong></li>' +
      '<li>Last edited <strong>' + P.edited + '</strong></li>' +
      '<li><strong>' + P.saves + '</strong> saves in its history</li>';
  }

  /* ---------- live run ---------- */
  var frame = $('#screen');
  var runCount = 0;
  function run(input) {
    runCount++;
    var url = 'runner?p=' + encodeURIComponent(slug) + '&run=' + runCount;
    if (P.runtime === 'console') url += '#' + encodeURIComponent(input || '');
    frame.src = url;
  }

  if (P.runtime === 'console') {
    var form = $('#calc');
    var field = $('#expr');
    form.addEventListener('submit', function (e) { e.preventDefault(); run(field.value); });
    document.querySelectorAll('.examples button').forEach(function (b) {
      b.addEventListener('click', function () { field.value = b.textContent; run(field.value); field.focus(); });
    });
    run(field.value);
  } else {
    run();
    var restart = $('#restart');
    if (restart) restart.addEventListener('click', function () { run(); });
  }

  // On-screen keys for phones: each press is forwarded into the program's
  // frame and replayed as a real keydown/keyup there.
  document.querySelectorAll('.pad button').forEach(function (b) {
    var key = b.dataset.key, code = b.dataset.code;
    function send(phase) {
      frame.contentWindow.postMessage({ type: 'codehs-key', key: key, code: code, phase: phase }, '*');
      b.setAttribute('aria-pressed', phase === 'down' ? 'true' : 'false');
    }
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); b.setPointerCapture(e.pointerId); send('down'); });
    b.addEventListener('pointerup', function () { send('up'); });
    b.addEventListener('pointercancel', function () { send('up'); });
    b.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); send('down'); } });
    b.addEventListener('keyup', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); send('up'); } });
  });

  /* ---------- source + hash check ---------- */
  var srcUrl = 'programs/' + slug + '/default.js';
  var rawLink = $('#raw');
  if (rawLink) rawLink.href = srcUrl;
  fetch(srcUrl, { cache: 'no-store' }).then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
    var text = new TextDecoder('utf-8').decode(buf);
    var code = $('#code');
    var html = window.Prism ? Prism.highlight(text, Prism.languages.javascript, 'javascript') : escapeHtml(text);
    code.innerHTML = splitLines(html);
    return crypto.subtle.digest('SHA-256', buf).then(function (d) {
      var hex = Array.from(new Uint8Array(d)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      var ok = hex === P.sha256 && buf.byteLength === P.bytes;
      $('#hash').innerHTML =
        '<span>SHA-256 of the file served here</span><code>' + hex + '</code>' +
        (ok ? '<span class="ok">✓ identical to the copy saved from CodeHS (' + P.bytes + ' bytes)</span>'
            : '<span class="bad">✗ does not match the CodeHS copy (' + P.sha256.slice(0, 12) + '…)</span>');
    });
  }).catch(function () { $('#hash').textContent = 'Could not load the source file.'; });

  /* ---------- evidence ---------- */
  var shots = $('#shots');
  if (shots) {
    shots.innerHTML = P.evidence.map(function (e) {
      var src = 'evidence/' + slug + '/' + e.file;
      return '<li><figure><a href="' + src + '"><img src="' + src + '" alt="CodeHS My Code History page for ' + escapeHtml(P.name) + '. ' + escapeHtml(e.caption) + '" loading="lazy" width="800" height="600"></a>' +
             '<figcaption>' + escapeHtml(e.caption) + '</figcaption></figure></li>';
    }).join('');
    $('#stats').innerHTML =
      stat(P.saves, 'saves in CodeHS history') + stat('~' + P.hours + ' h', 'active time CodeHS logged') +
      stat(P.pasteSaves, 'saves marked “paste”') + stat(P.created.replace(', 2026', ''), 'first save (2026)');
    $('#provenance').textContent = P.provenance;
  }

  function stat(b, s) { return '<div class="stat"><b>' + b + '</b><span>' + s + '</span></div>'; }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // Wrap each source line in a span so CSS can number it. Prism's output can
  // span lines (e.g. template strings), so re-open any open spans per line.
  function splitLines(html) {
    var out = [], open = [];
    html.split('\n').forEach(function (line) {
      var prefix = open.join('');
      var re = /<span[^>]*>|<\/span>/g, m;
      while ((m = re.exec(line))) { if (m[0] === '</span>') open.pop(); else open.push(m[0]); }
      out.push('<span class="ln">' + prefix + line + '</span>'.repeat(open.length) + '</span>');
    });
    return out.join('');
  }
})();

function initTheme() {
  var btn = document.getElementById('theme');
  if (!btn) return;
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved) document.documentElement.dataset.theme = saved;
  function label() {
    var dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    btn.textContent = dark ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    return dark;
  }
  label();
  btn.addEventListener('click', function () {
    var next = label() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
  });
}
