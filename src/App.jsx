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
          <p className="hero__eyebrow"></p>
          <h1 className="hero__title">We'd love to hear from you</h1>
          <p className="hero__subtitle">
            How are we doing? What can we improve on?
          </p>
        </header>

        <main className="main">
          <section className="card">
            <div className="card__header">
              <h2>Contact Us</h2>
              <p>
                
              </p>
            </div>
            <ContactForm />
          </section>
        </main>

        <footer className="footer">
          {/*<ClearPileButton />*/}
        </footer>
      </div>
    </FallingLettersProvider>
  );
}
