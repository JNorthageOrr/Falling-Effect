# Falling Letters Effect (React)

A standalone demo of the overflow input effect: when users type past a field's character limit, extra letters teeter, fall with gravity, bounce, and pile up at the bottom of the page.

Extracted from checkout form experiments.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Project structure

```
src/
  falling-letters/          # Core effect (physics, portal layer, spawn logic)
    FallingLettersContext.jsx
    FallingLettersLayer.jsx
    documentMetrics.js
    getOverflowSpawnPoint.js
  components/
    LimitedFieldInput.jsx   # Drop-in input/textarea with overflow handling
    FieldCharacterCount.jsx
    ContactForm.jsx         # Demo contact form
  App.jsx                   # Landing page
  styles/global.css
```

## Usage in your own app

1. Wrap your page (or app) in `FallingLettersProvider`.
2. Replace `input` / `textarea` elements with `LimitedFieldInput`, passing `maxLength`.
3. Import the falling-letter styles from `global.css` (or copy the `.falling-letters-*` rules).

```jsx
import { FallingLettersProvider } from './falling-letters/FallingLettersContext';
import LimitedFieldInput from './components/LimitedFieldInput';

function MyForm() {
  const [name, setName] = useState('');

  return (
    <FallingLettersProvider>
      <LimitedFieldInput
        value={name}
        maxLength={60}
        onChange={(e) => setName(e.target.value)}
      />
    </FallingLettersProvider>
  );
}
```

## Features

- Teeter (wobble or lean-right) before falling
- Gravity-based fall with bounce physics
- ~1/6 "skittish" letters bounce sideways
- Letters settle at physics position (no snap on land)
- Document-bottom pile (scrolls with page, not viewport-fixed)
- Scroll position preserved when typing while scrolled away
- Respects `prefers-reduced-motion`

## Build

```bash
npm run build
npm run preview
```
