const NEAR_MAX_THRESHOLD = 10;

export default function FieldCharacterCount({length, maxLength}) {
  const nearMax = length >= maxLength - NEAR_MAX_THRESHOLD;
  const atMax = length >= maxLength;

  return (
    <div
      className="field-character-count"
      style={{minHeight: '1.25rem', lineHeight: '1.25rem'}}
    >
      <span
        className={atMax ? 'field-character-count--max' : undefined}
        style={{visibility: nearMax ? 'visible' : 'hidden'}}
        aria-hidden={!nearMax}
      >
        {length}/{maxLength} characters
      </span>
    </div>
  );
}
