import {useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {getDocumentFloorY, getDocumentScrollHeight} from './documentMetrics';

const TEETER_MS = 520;
const GRAVITY = 1450;
const MAX_LETTERS = 120;
const BOUNCE_RESTITUTION = 0.34;
const SKITTISH_BOUNCE_RESTITUTION = 0.44;
const GROUND_FRICTION = 0.42;
const SKITTISH_GROUND_FRICTION = 0.62;
const MIN_BOUNCE_VELOCITY = 90;
const SKITTISH_MIN_BOUNCE_VELOCITY = 65;
const MAX_BOUNCES = 3;
const SKITTISH_MAX_BOUNCES = 4;

function updateTeeterWobble(letter, elapsed) {
  const progress = Math.min(elapsed / TEETER_MS, 1);
  const wobble = Math.sin(elapsed * 0.018) * (1 - progress) * 14;
  const tip = progress * progress * 28;

  return {
    ...letter,
    rotation: (letter.baseRotation ?? 0) + wobble + tip,
    x: letter.originX + Math.sin(elapsed * 0.022) * (1 - progress) * 2,
    y: letter.originY,
  };
}

function updateTeeterLeanRight(letter, elapsed) {
  const progress = Math.min(elapsed / TEETER_MS, 1);
  const eased = progress * progress;

  return {
    ...letter,
    rotation: (letter.baseRotation ?? 0) + eased * 42,
    x: letter.originX + eased * 12,
    y: letter.originY,
  };
}

function updateTeeter(letter, elapsed) {
  if (letter.teeterStyle === 'leanRight') {
    return updateTeeterLeanRight(letter, elapsed);
  }

  return updateTeeterWobble(letter, elapsed);
}

function updateFalling(letter, dt) {
  const vy = letter.vy + GRAVITY * dt;
  const drag = letter.isSkittish ? 0.7 : 1.1;
  const vx = letter.vx * (1 - dt * drag);
  const x = letter.x + vx * dt;
  const y = letter.y + vy * dt;
  const spin = letter.rotation + vx * dt * 0.28;

  return {...letter, x, y, vx, vy, rotation: spin};
}

function settleLetter(letter, floorY) {
  return {
    ...letter,
    phase: 'landed',
    y: floorY,
    vx: 0,
    vy: 0,
  };
}

function handleFloorImpact(letter, floorY) {
  const isSkittish = letter.isSkittish;
  const nextBounce = (letter.bounceCount ?? 0) + 1;
  const impactSpeed = Math.abs(letter.vy);
  const maxBounces = isSkittish ? SKITTISH_MAX_BOUNCES : MAX_BOUNCES;
  const minBounceVelocity = isSkittish
    ? SKITTISH_MIN_BOUNCE_VELOCITY
    : MIN_BOUNCE_VELOCITY;

  if (nextBounce > maxBounces || impactSpeed < minBounceVelocity) {
    return settleLetter(letter, floorY);
  }

  const restitution = isSkittish
    ? SKITTISH_BOUNCE_RESTITUTION
    : BOUNCE_RESTITUTION;
  let vx = letter.vx * (isSkittish ? SKITTISH_GROUND_FRICTION : GROUND_FRICTION);

  if (isSkittish && nextBounce === 1) {
    vx += letter.skittishDir * (210 + Math.random() * 140);
  } else if (isSkittish) {
    vx += letter.skittishDir * (35 + Math.random() * 45);
  }

  return {
    ...letter,
    y: floorY,
    vy: -letter.vy * restitution,
    vx,
    bounceCount: nextBounce,
    rotation: letter.rotation + vx * 0.1,
  };
}

export default function FallingLettersLayer({letters, setLetters, layerHeight}) {
  const lettersRef = useRef(letters);

  useEffect(() => {
    lettersRef.current = letters;
  }, [letters]);

  useEffect(() => {
    let frameId;
    let lastTime = performance.now();
    let running = true;

    const tick = (now) => {
      if (!running) return;

      const prev = lettersRef.current;
      if (!prev.length) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.032);
      lastTime = now;
      const floorY = getDocumentFloorY();
      let changed = false;

      const next = prev.map((letter) => {
        if (letter.phase === 'landed') return letter;
        if (now < letter.createdAt) return letter;

        changed = true;
        const elapsed = now - letter.createdAt;

        if (letter.phase === 'teeter') {
          if (elapsed < TEETER_MS) {
            return updateTeeter(letter, elapsed);
          }

          const skittishBoost = letter.isSkittish
            ? letter.skittishDir * (18 + Math.random() * 22)
            : 0;
          const leanBoost =
            letter.teeterStyle === 'leanRight' ? 28 + Math.random() * 18 : 0;

          return {
            ...letter,
            phase: 'falling',
            vy: 35 + Math.random() * 25,
            vx: letter.vx + (Math.random() - 0.5) * 10 + skittishBoost + leanBoost,
          };
        }

        const falling = updateFalling(letter, dt);

        if (falling.y >= floorY) {
          return handleFloorImpact(falling, floorY);
        }

        return falling;
      });

      if (changed) {
        const landed = next.filter((letter) => letter.phase === 'landed');
        const active = next.filter((letter) => letter.phase !== 'landed');
        const trimmed =
          landed.length > MAX_LETTERS
            ? [...active, ...landed.slice(-MAX_LETTERS)]
            : next;

        lettersRef.current = trimmed;
        setLetters(trimmed);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(frameId);
    };
  }, [setLetters]);

  if (!letters.length && !layerHeight) return null;

  const layer = (
    <div
      className="falling-letters-layer"
      aria-hidden="true"
      style={{height: `${layerHeight || getDocumentScrollHeight()}px`}}
    >
      {letters.map((letter) => (
        <span
          key={letter.id}
          className={`falling-letter falling-letter--${letter.phase}`}
          style={{
            left: `${letter.x}px`,
            top: `${letter.y}px`,
            transform: `translate(-50%, -50%) rotate(${letter.rotation}deg)`,
            fontSize: letter.fontSize,
            fontFamily: letter.fontFamily,
            color: letter.color,
          }}
        >
          {letter.char}
        </span>
      ))}
    </div>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(layer, document.body);
}
