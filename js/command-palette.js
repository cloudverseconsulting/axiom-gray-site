/**
 * Command Palette: ⌘K trigger, modal with three actions
 */
(function () {
  if (typeof document === 'undefined' || !document.body) return;

  var html = '<button type="button" id="axiom-cmd-trigger" class="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded border text-xs font-mono uppercase tracking-widest transition-colors" style="background:rgba(5,5,5,0.9);border-color:rgba(201,169,97,0.4);color:rgba(248,246,241,0.9);">' +
    '<span>⌘</span><span>K</span></button>' +
    '<div id="axiom-palette-backdrop" class="fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-200" style="background:rgba(0,0,0,0.85);">' +
    '<div id="axiom-palette" class="max-w-md w-full rounded border p-6 opacity-0 scale-95 transition-all duration-200" style="background:#0a0a0a;border-color:rgba(201,169,97,0.25);">' +
    '<div class="mb-4 font-mono text-[10px] uppercase tracking-[0.15em]" style="color:var(--gold);">Command Palette</div>' +
    '<ul class="space-y-2">' +
    '<li><a href="#" class="axiom-palette-item block py-3 px-4 rounded border transition-colors" style="border-color:rgba(79,93,117,0.3);color:rgba(248,246,241,0.9);" data-action="architect">Talk to an Architect</a></li>' +
    '<li><a href="#" class="axiom-palette-item block py-3 px-4 rounded border transition-colors" style="border-color:rgba(79,93,117,0.3);color:rgba(248,246,241,0.9);" data-action="stack">View Tech Stack</a></li>' +
    '<li><a href="#" class="axiom-palette-item block py-3 px-4 rounded border transition-colors" style="border-color:rgba(79,93,117,0.3);color:rgba(248,246,241,0.9);" data-action="manifesto">Download Manifesto (PDF)</a></li>' +
    '</ul>' +
    '<p class="mt-4 text-[10px] font-mono uppercase tracking-widest" style="color:rgba(79,93,117,0.7);">Esc to close</p>' +
    '</div></div>';

  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  var trigger = document.getElementById('axiom-cmd-trigger');
  var backdrop = document.getElementById('axiom-palette-backdrop');
  var palette = document.getElementById('axiom-palette');

  function open() {
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');
    requestAnimationFrame(function () {
      palette.classList.remove('opacity-0', 'scale-95');
      palette.classList.add('opacity-100', 'scale-100');
    });
  }
  function close() {
    palette.classList.add('opacity-0', 'scale-95');
    palette.classList.remove('opacity-100', 'scale-100');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    backdrop.classList.remove('opacity-100', 'pointer-events-auto');
  }

  trigger.addEventListener('click', open);
  backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); }
  });

  var path = window.location.pathname || '';
  var isServices = path.indexOf('services') !== -1;
  var isWork = path.indexOf('work') !== -1;
  var prefix = (isServices || isWork) ? '../' : '';
  var architectLink = prefix + 'contact/';
  var stackLink = isServices ? (prefix + 'index.html#services') : prefix + 'services/#services';
  document.querySelectorAll('.axiom-palette-item').forEach(function (item) {
    var action = item.getAttribute('data-action');
    if (action === 'architect') item.setAttribute('href', architectLink);
    if (action === 'stack') item.setAttribute('href', stackLink);
    item.addEventListener('click', function (e) {
      if (action === 'manifesto') {
        e.preventDefault();
        close();
        if (window.alert) window.alert('Manifesto PDF coming soon.');
      } else close();
    });
  });
})();
