/**
 * Decipher effect: random characters resolve into target text over 1.5s
 */
function runDecipher(el, targetText, durationMs) {
  if (!el || !targetText) return;
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  var len = targetText.length;
  var steps = 30;
  var stepDuration = durationMs / steps;
  var current = [];
  for (var i = 0; i < len; i++) current[i] = targetText[i] === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
  el.textContent = current.join('');
  var step = 0;
  var interval = setInterval(function () {
    var done = 0;
    for (var i = 0; i < len; i++) {
      if (current[i] === targetText[i]) { done++; continue; }
      if (Math.random() < 0.4) current[i] = targetText[i];
      else current[i] = targetText[i] === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
    }
    el.textContent = current.join('');
    step++;
    if (step >= steps || done === len) {
      el.textContent = targetText;
      clearInterval(interval);
    }
  }, stepDuration);
}
