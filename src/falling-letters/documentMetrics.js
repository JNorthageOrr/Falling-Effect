export function getDocumentScrollHeight() {
  const doc = document.documentElement;
  const body = document.body;

  return Math.max(
    doc.scrollHeight,
    body?.scrollHeight ?? 0,
    doc.offsetHeight,
    body?.offsetHeight ?? 0,
  );
}

export const FLOOR_INSET = 93;

export function getDocumentFloorY() {
  return getDocumentScrollHeight() - FLOOR_INSET;
}

export function toDocumentPoint(viewportX, viewportY) {
  return {
    x: viewportX + window.scrollX,
    y: viewportY + window.scrollY,
  };
}

/** Run work without letting the browser jump scroll (e.g. focused off-screen inputs). */
export function preserveScrollPosition(fn) {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  fn();

  const restore = () => {
    window.scrollTo(scrollX, scrollY);
  };

  restore();
  requestAnimationFrame(() => {
    restore();
    requestAnimationFrame(restore);
  });
  setTimeout(restore, 0);
}
