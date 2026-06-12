const OVERFLOW_SPAWN_OFFSET_X = 5;
const OVERFLOW_SPAWN_OFFSET_Y = -1;

function getContentMetrics(input, style, rect) {
  const paddingLeft = parseFloat(style.paddingLeft) || 0;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingRight = parseFloat(style.paddingRight) || 0;
  const borderLeft = parseFloat(style.borderLeftWidth) || 0;
  const borderTop = parseFloat(style.borderTopWidth) || 0;
  const contentWidth = rect.width - paddingLeft - paddingRight;

  return {paddingLeft, paddingTop, borderLeft, borderTop, contentWidth};
}

function createMirror(input, style, contentWidth, isTextarea) {
  const mirror = document.createElement('div');
  mirror.setAttribute('aria-hidden', 'true');

  const mirrorStyles = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    'visibility:hidden',
    'pointer-events:none',
    `font:${style.font}`,
    `line-height:${style.lineHeight}`,
    `letter-spacing:${style.letterSpacing}`,
    `text-transform:${style.textTransform}`,
    'padding:0',
    'border:0',
  ];

  if (isTextarea) {
    mirrorStyles.push(
      'overflow:hidden',
      `width:${contentWidth}px`,
      'white-space:pre-wrap',
      'word-wrap:break-word',
      'overflow-wrap:break-word',
    );
  } else {
    mirrorStyles.push(
      'white-space:pre',
      'width:max-content',
      'max-width:none',
    );
  }

  mirror.style.cssText = mirrorStyles.join(';');
  return mirror;
}

function measureCaret(input, style, rect, caretIndex, metrics, isTextarea) {
  const mirror = createMirror(input, style, metrics.contentWidth, isTextarea);
  mirror.appendChild(document.createTextNode(input.value.slice(0, caretIndex)));

  const marker = document.createElement('span');
  marker.textContent = '\u200b';
  mirror.appendChild(marker);

  document.body.appendChild(mirror);
  const markerRect = marker.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();
  document.body.removeChild(mirror);

  const x =
    rect.left +
    metrics.borderLeft +
    metrics.paddingLeft +
    (markerRect.left - mirrorRect.left) -
    input.scrollLeft +
    OVERFLOW_SPAWN_OFFSET_X;
  const y =
    rect.top +
    metrics.borderTop +
    metrics.paddingTop +
    (markerRect.top - mirrorRect.top) -
    input.scrollTop +
    markerRect.height * 0.5 +
    OVERFLOW_SPAWN_OFFSET_Y;

  return {x, y};
}

/**
 * Measures where overflow characters visually sit at the caret in an input or textarea.
 */
export function getOverflowSpawnPoint(input, caretIndex) {
  const rect = input.getBoundingClientRect();
  const style = window.getComputedStyle(input);
  const metrics = getContentMetrics(input, style, rect);
  const index = Math.max(0, Math.min(caretIndex ?? input.value.length, input.value.length));
  const isTextarea = input.tagName === 'TEXTAREA';

  const {x, y} = measureCaret(input, style, rect, index, metrics, isTextarea);

  return {
    x,
    y,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    color: style.color,
  };
}
