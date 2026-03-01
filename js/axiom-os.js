/**
 * Precision Architecture: Diagnostic Reticle + Connectivity Grid
 * Single RAF loop, spring physics, velocity-aware telemetry, 4 grid-glow nodes.
 */
(function () {
  if (typeof document === 'undefined' || !document.body) return;

  var GRID_SIZE = 20;
  var STIFFNESS = 250;
  var DAMPING = 25;
  var PULSE_PERIOD = 0.5; // 2Hz
  var TELEMETRY_OFFSET_BASE = 14;
  var TELEMETRY_MAX_OFFSET = 28;

  var style = document.createElement('style');
  style.textContent = [
    '.axiom-reticle { pointer-events: none; position: fixed; left: 0; top: 0; z-index: 9999; mix-blend-mode: difference; will-change: transform; }',
    '.axiom-reticle .reticle-dot { width: 8px; height: 8px; border-radius: 50%; border: 4px solid #FFFFFF; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); box-sizing: border-box; }',
    '.axiom-reticle .reticle-ring { position: absolute; left: 50%; top: 50%; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); transform: translate(-50%, -50%); width: 40px; height: 40px; box-sizing: border-box; transition: width 0.25s ease, height 0.25s ease; }',
    '.axiom-reticle.magnetic .reticle-ring { width: 60px; height: 60px; }',
    '.axiom-reticle .reticle-telemetry { font-family: "JetBrains Mono", monospace; font-size: 9px; color: #FFFFFF; white-space: nowrap; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); margin-top: 10px; }',
    '.connectivity-grid-layer { position: fixed; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; }',
    '.grid-glow-node { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 0 8px 2px rgba(255,255,255,0.4); opacity: 0; will-change: transform, opacity; transition: opacity 0.15s ease; }',
    '@media (hover: none), (max-width: 1023px) { .axiom-reticle, .connectivity-grid-layer { display: none !important; } body { cursor: auto !important; } }'
  ].join('\n');
  document.head.appendChild(style);

  var cursor = document.createElement('div');
  cursor.className = 'axiom-reticle';
  cursor.innerHTML = '<div class="reticle-ring"></div><div class="reticle-dot"></div><div class="reticle-telemetry" id="reticle-telemetry">AX_0 AY_0</div>';
  document.body.appendChild(cursor);

  var gridLayer = document.createElement('div');
  gridLayer.className = 'connectivity-grid-layer';
  for (var i = 0; i < 4; i++) {
    var node = document.createElement('div');
    node.className = 'grid-glow-node';
    gridLayer.appendChild(node);
  }
  document.body.insertBefore(gridLayer, document.body.firstChild);

  var ringEl = cursor.querySelector('.reticle-ring');
  var telemetryEl = document.getElementById('reticle-telemetry');
  var glowNodes = gridLayer.querySelectorAll('.grid-glow-node');

  // State: mouse target and ring spring (position)
  var targetX = 0, targetY = 0;
  var ringCurX = 0, ringCurY = 0;
  var ringVelX = 0, ringVelY = 0;
  var lastMouseTime = 0;
  var vx = 0, vy = 0;
  var magnetic = false;
  var ringSize = 40;
  var ringVelSize = 0;
  var pulsePhase = 0;
  var lastTime = performance.now();
  var idleTimeout = 0;
  var gridActive = false;

  function getFourNearestIntersections(x, y) {
    var g = GRID_SIZE;
    var cx = Math.floor(x / g) * g;
    var cy = Math.floor(y / g) * g;
    return [
      { x: cx, y: cy },
      { x: cx + g, y: cy },
      { x: cx, y: cy + g },
      { x: cx + g, y: cy + g }
    ];
  }

  function setMagnetic(on) {
    magnetic = on;
    cursor.classList.toggle('magnetic', on);
  }

  document.addEventListener('mousemove', function (e) {
    var prevX = targetX, prevY = targetY;
    targetX = e.clientX;
    targetY = e.clientY;
    var t = performance.now() / 1000;
    var dt = Math.min(t - lastMouseTime, 0.1);
    if (dt > 0) {
      vx = (targetX - prevX) / dt;
      vy = (targetY - prevY) / dt;
    }
    lastMouseTime = t;
    gridActive = true;
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(function () { gridActive = false; }, 150);
  });

  document.addEventListener('mouseenter', function () { cursor.style.opacity = '1'; });
  document.addEventListener('mouseleave', function () { cursor.style.opacity = '0'; });

  var hoverTargets = '.service-card, .arch-block, .nav-link, a[href]';
  document.body.addEventListener('mouseover', function (e) {
    if (e.target.closest && (e.target.closest('.service-card') || e.target.closest('.arch-block') || e.target.closest('.nav-link') || e.target.closest('nav a'))) setMagnetic(true);
  });
  document.body.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget || !e.relatedTarget.closest) { setMagnetic(false); return; }
    if (!e.relatedTarget.closest('.service-card') && !e.relatedTarget.closest('.arch-block') && !e.relatedTarget.closest('.nav-link') && !e.relatedTarget.closest('nav a')) setMagnetic(false);
  });

  function tick(now) {
    var dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // Ring position: spring toward (0,0) relative to cursor so ring lags with weight
    var errX = 0 - ringCurX, errY = 0 - ringCurY;
    ringVelX += errX * STIFFNESS * dt;
    ringVelY += errY * STIFFNESS * dt;
    ringVelX *= (1 - DAMPING * dt);
    ringVelY *= (1 - DAMPING * dt);
    ringCurX += ringVelX * dt;
    ringCurY += ringVelY * dt;

    // Ring size: expand to 60px when magnetic (spring or transition in CSS)
    var sizeTarget = magnetic ? 60 : 40;
    var sizeErr = sizeTarget - ringSize;
    ringVelSize += sizeErr * STIFFNESS * dt;
    ringVelSize *= (1 - DAMPING * dt);
    ringSize += ringVelSize * dt;
    // 2Hz pulse when magnetic: scale 1 to 1.08
    if (magnetic) {
      pulsePhase += dt * (1 / PULSE_PERIOD) * Math.PI * 2;
    } else {
      pulsePhase = 0;
    }
    var pulseScale = magnetic ? (1 + 0.04 * Math.sin(pulsePhase)) : 1;
    if (ringEl) {
      ringEl.style.width = ringSize + 'px';
      ringEl.style.height = ringSize + 'px';
      ringEl.style.transform = 'translate(-50%, -50%) translate(' + ringCurX + 'px, ' + ringCurY + 'px) scale(' + pulseScale + ')';
    }

    // Velocity-aware telemetry: offset label opposite to velocity so it never overlaps dot
    var speed = Math.sqrt(vx * vx + vy * vy);
    var clamp = Math.min(speed / 600, 1);
    var angle = speed > 3 ? Math.atan2(vy, vx) + Math.PI : Math.PI / 2;
    var offsetX = Math.cos(angle) * (TELEMETRY_OFFSET_BASE + TELEMETRY_MAX_OFFSET * clamp);
    var offsetY = Math.sin(angle) * (TELEMETRY_OFFSET_BASE + TELEMETRY_MAX_OFFSET * clamp);
    if (telemetryEl) {
      telemetryEl.textContent = 'AX_' + Math.round(targetX) + ' AY_' + Math.round(targetY);
      telemetryEl.style.marginLeft = (offsetX) + 'px';
      telemetryEl.style.marginTop = (10 + offsetY) + 'px';
    }

    // Batch DOM: cursor container at mouse (translate3d); dot is centered in container
    cursor.style.transform = 'translate3d(' + targetX + 'px, ' + targetY + 'px, 0)';

    // Grid glow: 4 nearest intersections, translate3d, opacity 0.15 when moving else 0
    var intersections = getFourNearestIntersections(targetX, targetY);
    for (var i = 0; i < glowNodes.length; i++) {
      var n = glowNodes[i];
      var pt = intersections[i] || { x: 0, y: 0 };
      n.style.transform = 'translate3d(' + pt.x + 'px, ' + pt.y + 'px, 0) translate(-50%, -50%)';
      n.style.opacity = gridActive ? '0.15' : '0';
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
