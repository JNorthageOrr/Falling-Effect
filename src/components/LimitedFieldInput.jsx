import {forwardRef, useCallback, useRef} from 'react';
import {useFallingLetters} from '../falling-letters/FallingLettersContext';
import {preserveScrollPosition} from '../falling-letters/documentMetrics';
import {shouldPlayOverflowSound} from '../falling-letters/overflowSound';

const LimitedFieldInput = forwardRef(function LimitedFieldInput(
  {as: Component = 'input', maxLength, onChange, value, className, ...props},
  forwardedRef,
) {
  const fallingLetters = useFallingLetters();
  const innerRef = useRef(null);

  const setRefs = useCallback(
    (node) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  const emitChange = useCallback(
    (input, nextValue, nativeEvent) => {
      onChange?.({
        ...nativeEvent,
        target: {...input, value: nextValue},
      });
    },
    [onChange],
  );

  const handleOverflow = useCallback(
    (input, incoming, nativeEvent) => {
      if (!incoming) return;

      const currentValue = input.value;
      const selectionStart = input.selectionStart ?? currentValue.length;
      const selectionEnd = input.selectionEnd ?? currentValue.length;
      const replacing = selectionEnd - selectionStart;
      const room = maxLength - (currentValue.length - replacing);

      const playSound = shouldPlayOverflowSound(
        input,
        currentValue.length,
        maxLength,
      );

      preserveScrollPosition(() => {
        if (room <= 0) {
          fallingLetters.spawnLetters(incoming, input, selectionStart, playSound);
          return;
        }

        const accepted = incoming.slice(0, room);
        const overflow = incoming.slice(room);
        const nextValue =
          currentValue.slice(0, selectionStart) +
          accepted +
          currentValue.slice(selectionEnd);

        fallingLetters.spawnLetters(
          overflow,
          input,
          selectionStart + accepted.length,
          playSound,
        );
        emitChange(input, nextValue, nativeEvent);
      });
    },
    [emitChange, fallingLetters, maxLength],
  );

  const handleBeforeInput = useCallback(
    (event) => {
      if (!maxLength || !fallingLetters) return;

      const input = event.target;
      const incoming = event.data;
      if (!incoming) return;

      const currentValue = input.value;
      const selectionStart = input.selectionStart ?? currentValue.length;
      const selectionEnd = input.selectionEnd ?? currentValue.length;
      const replacing = selectionEnd - selectionStart;
      const nextLength = currentValue.length - replacing + incoming.length;

      if (nextLength <= maxLength) return;

      event.preventDefault();
      handleOverflow(input, incoming, event);
    },
    [fallingLetters, handleOverflow, maxLength],
  );

  const handleChange = useCallback(
    (event) => {
      const input = event.target;
      const nextValue = input.value;

      if (!maxLength || !fallingLetters || nextValue.length <= maxLength) {
        onChange?.(event);
        return;
      }

      const overflow = nextValue.slice(maxLength);
      const accepted = nextValue.slice(0, maxLength);

      preserveScrollPosition(() => {
        const playSound = shouldPlayOverflowSound(
          input,
          value?.length ?? input.value.length,
          maxLength,
        );
        fallingLetters.spawnLetters(overflow, input, maxLength, playSound);
        emitChange(input, accepted, event);
      });
    },
    [emitChange, fallingLetters, maxLength, onChange],
  );

  return (
    <Component
      {...props}
      ref={setRefs}
      className={className}
      value={value}
      maxLength={fallingLetters ? undefined : maxLength}
      onBeforeInput={handleBeforeInput}
      onChange={handleChange}
    />
  );
});

export default LimitedFieldInput;
