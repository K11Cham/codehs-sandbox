/*
 * codehs-console.js: a stand-in for the CodeHS "JavaScript Console" program
 * type, covering only what Kylar's calculator uses: console.log, print/println
 * and readLine.
 *
 * Written with AI assistance for the playground; not Kylar's code. On CodeHS,
 * readLine(prompt) opens the browser's prompt() dialog, then echoes the prompt
 * and the answer into the console. Here the answer comes from the playground's
 * input box (passed in the URL fragment) so visitors can type expressions.
 */
(function () {
  'use strict';

  var out = document.getElementById('console');

  function write(text, cls) {
    var span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = text;
    out.appendChild(span);
  }
  function fmt(v) {
    if (typeof v === 'string') return v;
    try { return typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v); } catch (e) { return String(v); }
  }

  var nativeLog = console.log.bind(console);
  console.log = function () {
    var parts = Array.prototype.map.call(arguments, fmt);
    write(parts.join(' ') + '\n');
    nativeLog.apply(null, arguments);
  };

  function print(t) { write(fmt(t)); }
  function println(t) { write((arguments.length ? fmt(t) : '') + '\n'); }

  var given = (function () {
    try { return decodeURIComponent(location.hash.slice(1)); } catch (e) { return location.hash.slice(1); }
  })();

  function readLine(prompt) {
    if (arguments.length !== 1) throw new Error('You should pass exactly 1 argument to readLine');
    var value = given;
    print(prompt);
    write(value + '\n', 'input');
    return value;
  }

  window.addEventListener('error', function (e) {
    var err = e.error;
    write((err && err.name ? err.name + ': ' + err.message : e.message) + '\n', 'error');
  });

  window.print = print;
  window.println = println;
  window.readLine = readLine;
})();
