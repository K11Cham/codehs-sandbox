# codehs-sandbox

Three programs I wrote by hand on [CodeHS](https://codehs.com), plus a playground that runs them in the browser.

**Live:** https://codehs-sandbox.pages.dev

This repo has two halves, and they were made in different ways:

| Folder | Who made it | How |
|---|---|---|
| [`programs/`](programs/) | **Kylar, by hand** | Typed in the CodeHS editor, Oct–Nov 2026. The files are byte-for-byte what CodeHS has saved: not reformatted, fixed or commented. |
| [`evidence/`](evidence/) | Screenshots of CodeHS | Each program's "My Code History" page, which logs every save with a timestamp and a reason (autosave, run, paste). |
| [`site/`](site/) | **Built with AI assistance** | The playground pages, the build script and a small runtime that imitates the CodeHS graphics and console libraries so the originals run unchanged. This README was drafted with AI assistance too. |

I use AI tools in some of my other projects and I'm open about it. This repo exists to show work that I did not do with AI, so the line is drawn at the folder level.

## The programs

| Program | CodeHS type | Created | Last edited | Saves | SHA-256 |
|---|---|---|---|---|---|
| [funni cube](programs/funni-cube/default.js) | JavaScript Graphics | Nov 5, 2026 | Nov 9, 2026 | 191 | `2922e3f7…482ba2cd2` |
| [overengineered-calculatoe](programs/overengineered-calculatoe/default.js) | JavaScript Console | Oct 16, 2026 | Nov 9, 2026 | 305 | `345a8b50…c675a0838c` |
| [bucketballs](programs/bucketballs/default.js) | JavaScript Graphics | Oct 26, 2026 | Oct 30, 2026 | 360 | `9b023164…5066c4f505` |

- **funni cube** renders a 4D tesseract. It rotates each vertex in the X–Z, Y–Z and Y–W planes (rotation happens in a *pair* of axes, and one of these pairs includes the fourth dimension), then projects twice: 4D → 3D by dividing by `w + wDistance`, and 3D → 2D by dividing by `z + camDistance`.
- **overengineered-calculatoe** is a lexer, a recursive-descent parser and a tree-walking interpreter for arithmetic. There is one parse function per precedence level (`expression → term → unary → exponent → factor`). `^` is right-associative and binds tighter than unary minus, so `2^3^2 = 512` and `-2^2 = -4`.
- **bucketballs** ("Crappy Basketball") is a projectile game: aim with A/D, set the power with W/S, shoot with Space. It uses Euler-step physics with gravity, bounces that keep 75% of the velocity, and hoop hits detected with `getElementAt`.

Full SHA-256 hashes (check them yourself with `sha256sum programs/*/default.js`):

```
2922e3f7e595229994093a5e1f11959acd5683b1d2ec78f1a16920e482ba2cd2  programs/funni-cube/default.js
345a8b508c443b439c2fd48927c33a7065f11328d18d6efad0b4c5c675a0838c  programs/overengineered-calculatoe/default.js
9b023164c881bd7441ff7636cb41cb5b13682ba9eca6b0376b3d145066c4f505  programs/bucketballs/default.js
```

These match the latest saved version in CodeHS on 2026-11-21. Each program page on the live site downloads the file it runs, hashes it in your browser and shows whether it still matches.

## What the CodeHS history shows

CodeHS records a save whenever you run the code, every few seconds while you type, and whenever you paste. It doesn't record where pasted text came from. Here is what it shows for each program, stated plainly:

- **overengineered-calculatoe**: typed almost entirely by hand. Only 3 of the final 149 non-trivial lines first appear in a "paste" save, and those are short lines like `function read() {`.
- **bucketballs**: 36 paste saves. About 34 of the final 181 non-trivial lines first appear in one. Most of those came from a single Oct 28 save where the four near-identical W/A/S/D key-handler blocks went in at once. The physics, collision and game-flow code first appears in typed saves.
- **funni cube**: 24 paste saves. About 38 of the final 74 non-trivial lines first appear in one: the 16-entry vertex table, the edge list and the generic `rotate()` helper. The `toPoint()` projection, the draw loop and the per-frame rotation were typed. A mid-history save (in `evidence/`) shows an earlier version where the 3D rotation is worked out axis by axis by hand.

Each program's first save is the default CodeHS starter program.

## How the playground runs the originals

`site/runner.html` loads a runtime from `site/runtime/`, then loads the original `programs/<name>/default.js` as a plain script on top of it. Nothing in `programs/` is edited or wrapped.

- `codehs-graphics.js` re-implements the parts of the CodeHS graphics library (chs-js-lib 0.3.5) that these programs use: `Circle`, `Rectangle`, `Line`, `Text`, `add`, `remove`, `removeAll`, `getElementAt`, `setTimer`, `stopTimer`, `mouseClickMethod`, `keyDownMethod`, `keyUpMethod` and `Randomizer`. It copies the library's observable behaviour: timers driven by `requestAnimationFrame` and keyed by function name, a 40 fps redraw, a 400×480 canvas, Line width 2, and Text drawn from its baseline. Quirks in the programs show up the same way they do on CodeHS.
- `codehs-console.js` provides `console.log` and `readLine`. On CodeHS, `readLine` opens a browser prompt. On the site, the answer comes from an input box.
- No CodeHS code is included. The runtime was written from scratch.

## Build and deploy

```sh
node site/build.mjs            # assembles dist/ and fails if any original's hash changed
npx wrangler@4.20.0 pages deploy dist --project-name codehs-sandbox
```

`dist/` is generated and ignored by git.
