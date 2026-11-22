/*
 * codehs-graphics.js: a small, canvas-based stand-in for the parts of the
 * CodeHS JavaScript graphics library (chs-js-lib 0.3.5) that Kylar's programs use.
 *
 * Written with AI assistance for the playground. It is NOT Kylar's code and it
 * is NOT CodeHS's code: it re-implements the observable behaviour (timing,
 * hit-testing, defaults) so his unmodified files run the same way they do on
 * CodeHS. Only API names are put on `window`; everything else stays inside
 * this closure so it can't collide with the top-level names in his programs.
 */
(function () {
  'use strict';

  var WIDTH = 400;
  var HEIGHT = 480;
  var FPS = 40; // chs-js-lib redraws at 40 fps, and 40 ms is its default timer delay

  var canvas = document.createElement('canvas');
  canvas.id = 'codehs-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Program output canvas');
  var dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = WIDTH * dpr;
  canvas.height = HEIGHT * dpr;
  canvas.style.width = WIDTH + 'px';
  canvas.style.height = HEIGHT + 'px';
  var ctx = canvas.getContext('2d');
  (document.getElementById('stage') || document.body).appendChild(canvas);

  var measureCtx = document.createElement('canvas').getContext('2d');

  /* ---------- error reporting (CodeHS wraps callbacks in an error handler) ---------- */
  function report(err) {
    try { window.parent.postMessage({ type: 'codehs-error', message: String(err && err.stack || err) }, '*'); } catch (e) {}
    console.error(err);
  }
  function guard(fn) {
    return function () {
      try { return fn.apply(this, arguments); } catch (e) { report(e); }
    };
  }

  /* ---------- Thing (base class) ---------- */
  function Thing() {
    this.alive = true;
    this.x = 0;
    this.y = 0;
    this.color = '#000000';
    this.stroke = '#000000';
    this.lineWidth = 1;
    this.filled = true;
    this.hasBorder = false;
    this.anchor = { horizontal: 0, vertical: 0 };
  }
  Thing.prototype.setPosition = function (x, y) {
    if (arguments.length !== 2) throw new Error('You should pass exactly 2 arguments to `setPosition(x, y)`.');
    if (typeof x !== 'number' || !isFinite(x)) throw new TypeError('Invalid value for x-coordinate. Make sure you are passing finite numbers to `setPosition(x, y)`.');
    if (typeof y !== 'number' || !isFinite(y)) throw new TypeError('Invalid value for y-coordinate. Make sure you are passing finite numbers to `setPosition(x, y)`.');
    this.x = x; this.y = y;
  };
  Thing.prototype.move = function (dx, dy) { this.x += dx; this.y += dy; };
  Thing.prototype.getX = function () { return this.x; };
  Thing.prototype.getY = function () { return this.y; };
  Thing.prototype.setColor = function (c) {
    if (c === undefined) throw new TypeError('Invalid color');
    this.color = c;
  };
  Thing.prototype.getColor = function () { return this.color; };
  Thing.prototype.setFilled = function (b) { this.filled = b; };
  Thing.prototype.setBorder = function (b) { this.hasBorder = b; };
  Thing.prototype.setBorderColor = function (c) { this.stroke = c; this.hasBorder = true; };
  Thing.prototype.setBorderWidth = function (w) { this.lineWidth = w; this.hasBorder = true; };
  Thing.prototype.getWidth = function () { return this.width; };
  Thing.prototype.getHeight = function () { return this.height; };
  Thing.prototype._draw = function (c, path) {
    c.save();
    if (this.hasBorder) { c.strokeStyle = String(this.stroke); c.lineWidth = this.lineWidth; }
    if (this.filled) c.fillStyle = String(this.color);
    c.translate(this.x - this.width * this.anchor.horizontal, this.y - this.height * this.anchor.vertical);
    path(c);
    if (this.filled) c.fill();
    if (this.hasBorder) c.stroke();
    c.restore();
  };
  Thing.prototype.containsPoint = function (x, y) { return this._containsPoint(x, y); };

  function inherit(Child) {
    Child.prototype = Object.create(Thing.prototype);
    Child.prototype.constructor = Child;
  }

  /* ---------- Circle: positioned by its centre ---------- */
  function Circle(radius) {
    if (arguments.length !== 1) throw new Error('You should pass exactly 1 argument to `new Circle(radius)`.');
    if (typeof radius !== 'number' || !isFinite(radius)) throw new TypeError('You must pass a finite number to `new Circle(radius)`.');
    Thing.call(this);
    this.type = 'Circle';
    this.anchor = { horizontal: 0.5, vertical: 0.5 };
    this.radius = Math.max(0, radius);
    this.lineWidth = 3;
  }
  inherit(Circle);
  Object.defineProperty(Circle.prototype, 'width', { get: function () { return this.radius * 2; } });
  Object.defineProperty(Circle.prototype, 'height', { get: function () { return this.radius * 2; } });
  Circle.prototype.getRadius = function () { return this.radius; };
  Circle.prototype.setRadius = function (r) { this.radius = Math.max(0, r); };
  Circle.prototype.draw = function (c) {
    var r = this.radius;
    this._draw(c, function (c) { c.beginPath(); c.arc(r, r, r, 0, Math.PI * 2, true); c.closePath(); });
  };
  Circle.prototype._containsPoint = function (x, y) {
    var r = this.radius + (this.hasBorder ? this.lineWidth : 0);
    var dx = x - this.x, dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= r;
  };

  /* ---------- Rectangle: positioned by its top-left corner ---------- */
  function Rectangle(width, height) {
    if (arguments.length !== 2) throw new Error('You should pass exactly 2 arguments to `new Rectangle(width, height)`.');
    Thing.call(this);
    this.type = 'Rectangle';
    this.width = Math.max(0, width);
    this.height = Math.max(0, height);
  }
  inherit(Rectangle);
  Rectangle.prototype.setSize = function (w, h) { this.width = Math.max(0, w); this.height = Math.max(0, h); };
  Rectangle.prototype.draw = function (c) {
    var w = this.width, h = this.height;
    this._draw(c, function (c) { c.beginPath(); c.rect(0, 0, w, h); c.closePath(); });
  };
  Rectangle.prototype._containsPoint = function (x, y) {
    return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
  };

  /* ---------- Line ---------- */
  function Line(x1, y1, x2, y2) {
    if (arguments.length !== 4) throw new Error('You should pass exactly 4 arguments to `new Line(x1, y1, x2, y2)`.');
    Thing.call(this);
    this.type = 'Line';
    this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
    this.lineWidth = 2;
    this.hasBorder = true;
  }
  inherit(Line);
  Object.defineProperty(Line.prototype, 'x', { get: function () { return Math.min(this.x1, this.x2); }, set: function () {} });
  Object.defineProperty(Line.prototype, 'y', { get: function () { return Math.min(this.y1, this.y2); }, set: function () {} });
  Object.defineProperty(Line.prototype, 'width', { get: function () { return Math.abs(this.x2 - this.x1); } });
  Object.defineProperty(Line.prototype, 'height', { get: function () { return Math.abs(this.y2 - this.y1); } });
  Line.prototype.getY = function () { return this.y1; }; // matches chs-js-lib
  Line.prototype.setColor = function (c) { if (c === undefined) throw new TypeError('Invalid color'); this.stroke = c; };
  Line.prototype.getColor = function () { return this.stroke; };
  Line.prototype.setLineWidth = function (w) { this.lineWidth = w; };
  Line.prototype.setStartpoint = function (x, y) { this.x1 = x; this.y1 = y; };
  Line.prototype.setEndpoint = function (x, y) { this.x2 = x; this.y2 = y; };
  Line.prototype.setPosition = function (x, y) {
    var dx = x - this.x1, dy = y - this.y1;
    this.x1 += dx; this.x2 += dx; this.y1 += dy; this.y2 += dy;
  };
  Line.prototype.getStartX = function () { return this.x1; };
  Line.prototype.getStartY = function () { return this.y1; };
  Line.prototype.getEndX = function () { return this.x2; };
  Line.prototype.getEndY = function () { return this.y2; };
  Line.prototype.draw = function (c) {
    c.save();
    c.strokeStyle = String(this.stroke);
    c.lineWidth = this.lineWidth;
    c.beginPath(); c.moveTo(this.x1, this.y1); c.lineTo(this.x2, this.y2); c.closePath();
    c.stroke();
    c.restore();
  };
  Line.prototype.containsPoint = function (x, y) {
    var inX = (this.x1 <= x && x <= this.x2) || (this.x2 <= x && x <= this.x1);
    var inY = (this.y1 <= y && y <= this.y2) || (this.y2 <= y && y <= this.y1);
    if (this.x1 === this.x2) return this.x1 === x && inY;
    var m = (this.y2 - this.y1) / (this.x2 - this.x1);
    return Math.abs(m * (x - this.x1) - (y - this.y1)) <= this.lineWidth && inX && inY;
  };

  /* ---------- Text: (x, y) is the left end of the baseline ---------- */
  function Text(label, font) {
    if (arguments.length < 1) throw new Error('You should pass at least one argument to `new Text(label, font)`.');
    Thing.call(this);
    this.type = 'Text';
    this.anchor = { horizontal: 0, vertical: 1 };
    this.label = label;
    this.font = font === undefined ? '20pt Arial' : font;
    this._measure();
  }
  inherit(Text);
  Text.prototype._measure = function () {
    measureCtx.font = this.font;
    this.width = measureCtx.measureText(this.label).width;
    this.height = measureCtx.measureText('m').width * 1.2;
  };
  Text.prototype.setFont = function (f) { this.font = f; this._measure(); };
  Text.prototype.setLabel = Text.prototype.setText = function (l) { this.label = l; this._measure(); };
  Text.prototype.getLabel = Text.prototype.getText = function () { return this.label; };
  Text.prototype.draw = function (c) {
    this._measure();
    c.save();
    c.fillStyle = String(this.color);
    c.font = this.font;
    c.fillText(this.label, this.x, this.y);
    c.restore();
  };
  Text.prototype._containsPoint = function (x, y) {
    return x >= this.x && x <= this.x + this.width && y <= this.y && y >= this.y - this.height;
  };

  /* ---------- the element pool, mirroring chs-js-lib ---------- */
  // add() pushes a reference even if the element is already there, remove()
  // only flags it as dead, and dead entries are dropped at the next redraw.
  var pool = [];

  function add(el) { el.alive = true; pool.push(el); }
  function remove(el) { if (el) el.alive = false; }
  function removeAll() { pool = []; }
  function getElementAt(x, y) {
    for (var i = pool.length; i--;) {
      if (pool[i].alive && pool[i].containsPoint(x, y)) return pool[i];
    }
    return null;
  }
  function getElementsAt(x, y) {
    return pool.filter(function (el) { return el.alive && el.containsPoint(x, y); });
  }

  var backgroundColor = null;
  function redraw() {
    pool = pool.filter(function (el) { return el.alive; });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (backgroundColor) { ctx.fillStyle = String(backgroundColor); ctx.fillRect(0, 0, WIDTH, HEIGHT); }
    for (var i = 0; i < pool.length; i++) {
      try { pool[i].draw(ctx); } catch (e) { report(e); }
    }
  }
  var lastDraw = Date.now();
  (function frame() {
    requestAnimationFrame(frame);
    var now = Date.now(), elapsed = now - lastDraw, interval = 1000 / FPS;
    if (elapsed > interval) { lastDraw = now - (elapsed % interval); redraw(); }
  })();

  /* ---------- timers: requestAnimationFrame-driven and keyed by function name ---------- */
  // Like chs-js-lib, a timer fires at most once per animation frame, when more
  // than `delay` ms have passed. Calling setTimer twice with the same function
  // stacks two timers, and stopTimer(fn) stops every timer with fn's name.
  var timers = {};
  function setTimer(fn, delay, data, name) {
    if (arguments.length < 2) throw new Error('2 parameters required for `setTimer`, ' + arguments.length + ' found.');
    if (typeof fn !== 'function') throw new TypeError('Invalid callback function. Make sure you are passing an actual function to `setTimer`.');
    if (typeof delay !== 'number' || !isFinite(delay)) throw new TypeError('Invalid delay for `setTimer`.');
    var key = name != null ? name : fn.name;
    var safe = guard(fn);
    var running = true, last = Date.now();
    (function tick() {
      if (!running) return;
      var now = Date.now();
      if (now - last > delay) { safe(data); last = now; }
      requestAnimationFrame(tick);
    })();
    (timers[key] = timers[key] || []).push(function () { running = false; });
  }
  function stopTimer(fnOrName) {
    var key = typeof fnOrName === 'function' ? fnOrName.name : fnOrName;
    (timers[key] || []).forEach(function (stop) { stop(); });
    timers[key] = [];
  }
  function stopAllTimers() { Object.keys(timers).forEach(stopTimer); }

  /* ---------- input ---------- */
  // CodeHS adds getX()/getY() to mouse events. Here they also account for the
  // canvas being scaled down to fit a phone screen.
  function canvasPoint(e) {
    var rect = canvas.getBoundingClientRect();
    var src = e.touches && e.touches.length ? e.touches[0] : (e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : e);
    return {
      x: Math.round((src.clientX - rect.left) * (WIDTH / rect.width)),
      y: Math.round((src.clientY - rect.top) * (HEIGHT / rect.height))
    };
  }
  MouseEvent.prototype.getX = function () { return canvasPoint(this).x; };
  MouseEvent.prototype.getY = function () { return canvasPoint(this).y; };

  var callbacks = {};
  canvas.addEventListener('click', function (e) { if (callbacks.click) callbacks.click(e); });
  canvas.addEventListener('mousemove', function (e) { if (callbacks.move) callbacks.move(e); });
  canvas.addEventListener('mousedown', function (e) { if (callbacks.down) callbacks.down(e); });
  canvas.addEventListener('mouseup', function (e) { if (callbacks.up) callbacks.up(e); });
  window.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key.indexOf('Arrow') === 0) e.preventDefault(); // keep the page from scrolling
    if (callbacks.keyDown) callbacks.keyDown(e);
  });
  window.addEventListener('keyup', function (e) { if (callbacks.keyUp) callbacks.keyUp(e); });

  // The playground's on-screen keys (for phones) arrive as messages and are
  // replayed as real keyboard events, so the program sees the same thing.
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'codehs-key') {
      window.dispatchEvent(new KeyboardEvent(d.phase === 'up' ? 'keyup' : 'keydown', { key: d.key, code: d.code, bubbles: true }));
    }
  });

  /* ---------- Randomizer ---------- */
  var Randomizer = {
    nextInt: function (lo, hi) {
      if (hi === undefined) { hi = lo - 1; lo = 0; }
      lo = Math.floor(lo);
      return lo + Math.floor(Math.random() * (hi - lo + 1));
    },
    nextFloat: function (lo, hi) {
      if (hi === undefined) { hi = lo; lo = 0; }
      return lo + (hi - lo) * Math.random();
    },
    nextBoolean: function (p) { return Math.random() < (p === undefined ? 0.5 : p); },
    nextColor: function () {
      function hex() { var v = Randomizer.nextInt(0, 255); return (v < 16 ? '0' : '') + v.toString(16); }
      return '#' + hex() + hex() + hex();
    }
  };

  /* ---------- export only the CodeHS API names ---------- */
  var api = {
    Circle: Circle, Rectangle: Rectangle, Line: Line, Text: Text,
    add: add, remove: remove, removeAll: removeAll,
    getElementAt: getElementAt, getElementsAt: getElementsAt,
    getWidth: function () { return WIDTH; }, getHeight: function () { return HEIGHT; },
    setBackgroundColor: function (c) { backgroundColor = c; },
    setTimer: setTimer, stopTimer: stopTimer, stopAllTimers: stopAllTimers,
    mouseClickMethod: function (fn) { callbacks.click = guard(fn); },
    mouseMoveMethod: function (fn) { callbacks.move = guard(fn); },
    mouseDownMethod: function (fn) { callbacks.down = guard(fn); },
    mouseUpMethod: function (fn) { callbacks.up = guard(fn); },
    keyDownMethod: function (fn) { callbacks.keyDown = guard(fn); },
    keyUpMethod: function (fn) { callbacks.keyUp = guard(fn); },
    Randomizer: Randomizer
  };
  Object.keys(api).forEach(function (k) { window[k] = api[k]; });
})();
