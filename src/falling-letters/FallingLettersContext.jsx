import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {getOverflowSpawnPoint} from './getOverflowSpawnPoint';
import {getDocumentScrollHeight, toDocumentPoint} from './documentMetrics';
import FallingLettersLayer from './FallingLettersLayer';

const FallingLettersContext = createContext(null);

const STAGGER_MS = 45;

export function useFallingLetters() {
  return useContext(FallingLettersContext);
}

export function FallingLettersProvider({children}) {
  const [letters, setLetters] = useState([]);
  const [layerHeight, setLayerHeight] = useState(0);
  const idRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const refreshLayerHeight = useCallback(() => {
    const nextHeight = getDocumentScrollHeight();
    setLayerHeight((prev) => (prev === nextHeight ? prev : nextHeight));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      reducedMotionRef.current = mq.matches;
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    refreshLayerHeight();
    window.addEventListener('resize', refreshLayerHeight);

    const observer = new ResizeObserver(refreshLayerHeight);
    observer.observe(document.documentElement);
    if (document.body) observer.observe(document.body);

    return () => {
      window.removeEventListener('resize', refreshLayerHeight);
      observer.disconnect();
    };
  }, [refreshLayerHeight]);

  const spawnLetters = useCallback(
    (overflowText, inputEl, caretIndex) => {
      if (reducedMotionRef.current || !overflowText || !inputEl) return;

      refreshLayerHeight();

      const spawnStyle = getOverflowSpawnPoint(inputEl, caretIndex);
      const docPoint = toDocumentPoint(spawnStyle.x, spawnStyle.y);
      const now = performance.now();
      const chars = [...overflowText];

      const newLetters = chars.map((char, index) => {
        const isSkittish = Math.random() < 1 / 6;
        const teeterStyle = Math.random() < 1 / 3 ? 'wobble' : 'leanRight';

        return {
          id: idRef.current++,
          char: char === ' ' ? '\u00a0' : char,
          phase: 'teeter',
          teeterStyle,
          createdAt: now + index * STAGGER_MS,
          originX: docPoint.x + index * 6,
          originY: docPoint.y,
          x: docPoint.x + index * 6,
          y: docPoint.y,
          vx: (Math.random() - 0.5) * (isSkittish ? 22 : 12),
          vy: 0,
          bounceCount: 0,
          isSkittish,
          skittishDir: isSkittish ? (Math.random() < 0.5 ? -1 : 1) : 0,
          baseRotation: (Math.random() - 0.5) * 12,
          rotation: (Math.random() - 0.5) * 12,
          fontSize: spawnStyle.fontSize,
          fontFamily: spawnStyle.fontFamily,
          color: spawnStyle.color,
        };
      });

      setLetters((prev) => [...prev, ...newLetters]);
    },
    [refreshLayerHeight],
  );

  const clearPile = useCallback(() => {
    setLetters([]);
  }, []);

  const value = useMemo(
    () => ({spawnLetters, clearPile}),
    [spawnLetters, clearPile],
  );

  return (
    <FallingLettersContext.Provider value={value}>
      {children}
      <FallingLettersLayer
        letters={letters}
        setLetters={setLetters}
        layerHeight={layerHeight}
      />
    </FallingLettersContext.Provider>
  );
}

export default FallingLettersContext;
