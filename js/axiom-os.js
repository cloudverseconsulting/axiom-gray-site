/**
 * Axiom-OS: Crosshair cursor with X/Y coordinates
 */
(function () {
  if (typeof document === 'undefined' || !document.body) return;
  var style = document.createElement('style');
  style.textContent = [
    '.axiom-cursor { pointer-events: none; position: fixed; z-index: 9999; transform: translate(-50%, -50%); mix-blend-mode: difference; }',
    '.axiom-cursor .crosshair { width: 20px; height: 20px; border: 1px solid rgba(201,169,97,0.9); border-radius: 50%; }',
    '.axiom-cursor .coords { font-family: \"JetBrains Mono\", \"Space Mono\", monospace; font-size: 9px; letter-spacing: 0.05em; color: rgba(248,246,241,0.9); margin-top: 6px; white-space: nowrap; }',
    '@media (hover: none) { .axiom-cursor { display: none !important; } body { cursor: auto !important; } }'
  ].join('\n');
  document.head.appendChild(style);

  var cursor = document.createElement('div');
  cursor.className = 'axiom-cursor';
  cursor.innerHTML = '<div class="crosshair"></div><div class="coords" id="cursor-coords">0, 0</div>';
  document.body.appendChild(cursor);

  var coordsEl = document.getElementById('cursor-coords');
  var update = function (e) {
    if (!e) return;
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    if (coordsEl) coordsEl.textContent = e.clientX + ', ' + e.clientY;
  };
  document.addEventListener('mousemove', update);
  document.addEventListener('mouseenter', function () { cursor.style.opacity = '1'; });
  document.addEventListener('mouseleave', function () { cursor.style.opacity = '0'; });
})();
