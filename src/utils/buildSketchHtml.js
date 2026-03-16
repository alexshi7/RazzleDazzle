// Strip outer wrappers the model sometimes adds.
function unwrapSketchBody(code) {
  let s = code.trim();
  const p5Wrap = s.match(/^new\s+p5\s*\(\s*(?:function\s*\(p\)|(?:\(p\)|p)\s*=>)\s*\{([\s\S]*)\}\s*\)\s*;?\s*$/);
  if (p5Wrap) return p5Wrap[1].trim();
  const fnWrap = s.match(/^(?:\()?function\s*\(\s*p\s*\)\s*\{([\s\S]*)\}\s*\)?\s*;?\s*$/);
  if (fnWrap) return fnWrap[1].trim();
  const arrowWrap = s.match(/^(?:\(p\)|p)\s*=>\s*\{([\s\S]*)\}\s*;?\s*$/);
  if (arrowWrap) return arrowWrap[1].trim();
  const varWrap = s.match(/^(?:const|let|var)\s+\w+\s*=\s*(?:function\s*\(p\)|(?:\(p\)|p)\s*=>)\s*\{([\s\S]*)\}\s*;?\s*$/);
  if (varWrap) return varWrap[1].trim();
  return s;
}

// Convert global-mode function declarations to p5 instance assignments.
// e.g. "function draw() {" → "p.draw = function() {"
// This makes global-mode AI output work in instance mode.
const P5_EVENT_FUNCTIONS = [
  'setup','draw','preload',
  'mousePressed','mouseReleased','mouseMoved','mouseDragged','mouseClicked','doubleClicked','mouseWheel',
  'keyPressed','keyReleased','keyTyped',
  'touchStarted','touchMoved','touchEnded',
  'windowResized','deviceMoved','deviceTurned','deviceShaken',
];

const EVENT_ASSIGNMENT_RE = new RegExp(
  '([^\\s;{,(\\[/\\n])([ \\t]+)(p\\.(?:setup|draw|preload|mousePressed|mouseReleased|mouseMoved|mouseDragged|mouseClicked|keyPressed|keyReleased|windowResized)\\s*[=])',
  'g'
);

const VARIABLE_DECLARATION_RE = new RegExp(
  '([^\\s;{,(\\[/\\n])([ \\t]+)((?:let|const|var)\\s+\\w)',
  'g'
);

function normalizeToInstanceMode(code) {
  let result = code;
  for (const fn of P5_EVENT_FUNCTIONS) {
    // Match: function setup(...) { but NOT p.setup = function(...) { (already instance mode)
    const re = new RegExp(`(?<![.\\w])function\\s+${fn}\\s*\\(`, 'g');
    result = result.replace(re, `p.${fn} = function(`);
  }
  return result;
}

// Insert a semicolon+newline before statements that commonly run together
// on one line without separators — the most frequent cause of
// "Unexpected identifier 'p'" parse errors from AI-generated code.
function fixMissingSemicolons(code) {
  return code
    // After ] or ) or an identifier/number, before p.xxx = or let/const/var on the same line
    .replace(EVENT_ASSIGNMENT_RE, '$1;\n$3')
    .replace(VARIABLE_DECLARATION_RE, '$1;\n$3');
}

export function prepareSketchBody(sketchBody) {
  const unwrapped = unwrapSketchBody(sketchBody);
  const fixed = fixMissingSemicolons(unwrapped);
  return normalizeToInstanceMode(fixed);
}

export function validateSketchCode(sketchBody) {
  const normalized = prepareSketchBody(sketchBody);
  const wrappedBody = 'with(p){\n' + normalized + '\n}';

  try {
    // Compile only; this catches syntax errors before the iframe tries to run it.
    new Function('p', wrappedBody);
    return { ok: true, code: normalized };
  } catch (error) {
    return {
      ok: false,
      code: normalized,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function buildSketchHtml(sketchBody) {
  const normalized = prepareSketchBody(sketchBody);

  // Wrap body in with(p){...} so that any p5 global-style calls like
  // color(), fill(), background(), mouseX, etc. resolve to p.color() etc.
  // Closures defined inside a with() block capture the with-object in their
  // scope chain, so this works inside p.setup and p.draw function bodies too.
  // JSON.stringify ensures the code is a safe JS string literal — no template
  // literal interpolation, no </script> injection, no quote escaping issues.
  const wrappedBody = 'with(p){\n' + normalized + '\n}';
  const bodyLiteral = JSON.stringify(wrappedBody);

  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '  <style>',
    '    * { margin: 0; padding: 0; box-sizing: border-box; }',
    '    html, body { width: 100%; height: 100%; overflow: hidden; background: #fff; }',
    '    body { display: flex; align-items: stretch; justify-content: stretch; }',
    '    main { width: 100%; height: 100%; display: flex; }',
    '    canvas { display: block; width: 100% !important; height: 100% !important; object-fit: contain; }',
    '    #err {',
    '      position: absolute; top: 0; left: 0; width: 100%; padding: 8px;',
      '      background: rgba(255,50,50,0.9); color: #fff;',
    '      font-family: monospace; font-size: 12px; z-index: 999;',
    '      white-space: pre-wrap; word-break: break-word;',
    '    }',
    '  </style>',
    '</head>',
    '<body>',
    '  <main id="app"></main>',
    '  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.min.js"></scr' + 'ipt>',
    '  <script>',
    '    window.onerror = function(msg, src, line) {',
    '      var el = document.getElementById("err");',
    '      if (!el) { el = document.createElement("div"); el.id = "err"; document.body.appendChild(el); }',
    '      el.textContent = "Sketch error: " + msg + (line ? " (line " + line + ")" : "");',
    '      return true;',
    '    };',
    '    try {',
    '      new p5(new Function("p", ' + bodyLiteral + '), document.getElementById("app"));',
    '    } catch(e) { window.onerror(e.message); }',
    '  </scr' + 'ipt>',
    '</body>',
    '</html>',
  ].join('\n');
}
