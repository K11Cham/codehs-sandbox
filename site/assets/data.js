// Facts about each program, read from CodeHS on 2026-11-21 (sandbox list,
// version-history API and the saved file). Dates are as CodeHS displays them.
window.PROGRAMS = {
  'funni-cube': {
    name: 'funni cube',
    tagline: 'A tesseract spinning through the fourth dimension',
    type: 'JavaScript Graphics',
    runtime: 'graphics',
    created: 'Nov 5, 2026',
    edited: 'Nov 9, 2026',
    saves: 191,
    hours: 2.1,
    pasteSaves: 24,
    bytes: 2306,
    sha256: '2922e3f7e595229994093a5e1f11959acd5683b1d2ec78f1a16920e482ba2cd2',
    evidence: [
      { file: 'history-first-save.jpg', caption: 'First save, Nov 5 10:59 AM: the default CodeHS starter program.' },
      { file: 'history-mid-2026-11-05-rotation-by-hand.jpg', caption: 'Nov 5, 2:13 PM: an earlier version with the 3D rotation worked out axis by axis, before the 4D rotate() helper.' },
      { file: 'history-latest-save.jpg', caption: 'Last save, Nov 9 12:52 PM: tuning the spin speed.' }
    ],
    provenance: 'The CodeHS history records 24 paste saves. About 38 of the final 74 non-trivial lines first appear in a paste save, most of them the 16-entry vertex table, the edge list and the generic rotate() helper. The projection maths in toPoint(), the draw loop and the per-frame rotation were typed. CodeHS does not record where pasted text came from.'
  },
  'overengineered-calculatoe': {
    name: 'overengineered-calculatoe',
    tagline: 'A lexer, parser and tree-walking interpreter for arithmetic',
    type: 'JavaScript Console',
    runtime: 'console',
    created: 'Oct 16, 2026',
    edited: 'Nov 9, 2026',
    saves: 305,
    hours: 4.1,
    pasteSaves: 15,
    bytes: 6127,
    sha256: '345a8b508c443b439c2fd48927c33a7065f11328d18d6efad0b4c5c675a0838c',
    evidence: [
      { file: 'history-first-save.jpg', caption: 'First save, Oct 16 10:46 AM: console.log("Hello world").' },
      { file: 'history-mid-2026-10-19-parser.jpg', caption: 'Oct 19, 2:54 PM: writing the parser’s read/peek/eat helpers.' },
      { file: 'history-latest-save.jpg', caption: 'Last save, Nov 9 5:10 PM: cleaning up the top-level eat(EOF).' }
    ],
    provenance: 'Typed almost entirely by hand: only 3 of the final 149 non-trivial lines first appear in a paste save, and those are short lines like function read() {. 305 saves over about four weeks.'
  },
  'bucketballs': {
    name: 'bucketballs',
    tagline: '“Crappy Basketball”: aim, set the power, shoot',
    type: 'JavaScript Graphics',
    runtime: 'graphics',
    created: 'Oct 26, 2026',
    edited: 'Oct 30, 2026',
    saves: 360,
    hours: 3.8,
    pasteSaves: 36,
    bytes: 5596,
    sha256: '9b023164c881bd7441ff7636cb41cb5b13682ba9eca6b0376b3d145066c4f505',
    evidence: [
      { file: 'history-first-save.jpg', caption: 'First save, Oct 26 12:18 PM: the default CodeHS starter program.' },
      { file: 'history-mid-2026-10-26-win-check.jpg', caption: 'Oct 26, 1:27 PM: an early hoop-collision win check.' },
      { file: 'history-latest-save.jpg', caption: 'Last save, Oct 30 1:27 PM: making the hoop thicker.' }
    ],
    provenance: 'The CodeHS history records 36 paste saves. About 34 of the final 181 non-trivial lines first appear in one, mostly a single Oct 28 save where the W/A/S/D key handlers (four near-identical blocks) went in at once; the rest are single function-header lines, consistent with moving code already in the file. The bodies of the physics, collision and game-flow functions first appear in typed saves.'
  }
};
