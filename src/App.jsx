import {FallingLettersProvider, useFallingLetters} from './falling-letters/FallingLettersContext';
import ContactForm from './components/ContactForm';

function ClearPileButton() {
  const {clearPile} = useFallingLetters();

  return (
    <button type="button" className="btn btn--ghost" onClick={clearPile}>
      Clear letter pile
    </button>
  );
}

export default function App() {
  return (
    <FallingLettersProvider>
      <div className="page">
        <header className="hero">
          <p className="hero__eyebrow">Overflow input effect</p>
          <h1 className="hero__title">Falling Letters</h1>
          <p className="hero__subtitle">
            Fill any field to its character limit, then keep typing. Extra letters
            teeter on the edge, fall with gravity, bounce, and pile up at the
            bottom of the page.
          </p>
        </header>

        <main className="main">
          <section className="card">
            <div className="card__header">
              <h2>Contact Us</h2>
              <p>
                Try the effect on any field below. Scroll to the footer and keep
                typing — letters still fall to the bottom of the page.
              </p>
            </div>
            <ContactForm />
          </section>

          <section className="tips">
            <h3>Tips</h3>
            <ul>
              <li>Character counts appear when you are within 10 characters of the limit.</li>
              <li>Paste a long string at the limit to spawn many letters at once.</li>
              <li>About one in six letters takes a skittish sideways bounce.</li>
              <li>Respects <code>prefers-reduced-motion</code> — no animation, still enforces limits.</li>
            </ul>
          </section>
        </main>

        <footer className="footer">
          <p>Falling Letters demo — extracted from checkout form experiments.</p>
          <ClearPileButton />
        </footer>
      </div>
    </FallingLettersProvider>
  );
}
