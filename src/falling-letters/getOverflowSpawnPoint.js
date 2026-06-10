const OVERFLOW_SPAWN_OFFSET_X = 7;
const OVERFLOW_SPAWN_OFFSET_Y = -1;

/**
 * Measures where overflow characters visually sit at the right edge of an input.
 */
export function getOverflowSpawnPoint(input, textLength) {
  const rect = input.getBoundingClientRect();
  const style = window.getComputedStyle(input);

  const mirror = document.createElement('span');
  mirror.setAttribute('aria-hidden', 'true');
  mirror.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    'visibility:hidden',
    'white-space:pre',
    'pointer-events:none',
    `font:${style.font}`,
    `letter-spacing:${style.letterSpacing}`,
    `text-transform:${style.textTransform}`,
  ].join(';');
  mirror.textContent = input.value.slice(0, textLength);

  document.body.appendChild(mirror);
  const textWidth = mirror.offsetWidth;
  document.body.removeChild(mirror);

  const paddingLeft = parseFloat(style.paddingLeft) || 0;
  const paddingRight = parseFloat(style.paddingRight) || 0;
  const contentWidth = rect.width - paddingLeft - paddingRight;
  const scrollOffset = Math.max(0, textWidth - contentWidth);

  const x =
    Math.min(
      rect.right - paddingRight - 4,
      rect.left + paddingLeft + textWidth - scrollOffset,
    ) + OVERFLOW_SPAWN_OFFSET_X;
  const y = rect.top + rect.height * 0.55 + OVERFLOW_SPAWN_OFFSET_Y;

  return {
    x,
    y,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    color: style.color,
  };
}
