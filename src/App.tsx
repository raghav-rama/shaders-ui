import { useRef } from "react";
import { FluidCanvas } from "./components/FluidCanvas";
import { useLenisScroll } from "./hooks/useLenisScroll";
import { useScrollAnimations } from "./hooks/useScrollAnimations";
import { useCursorFollower } from "./hooks/useCursorFollower";
import "./App.css";

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  useLenisScroll();
  useScrollAnimations(appRef);
  useCursorFollower(cursorRef);

  return (
    <div className="app" ref={appRef}>
      <div className="background">
        <FluidCanvas />
      </div>

      <div className="cursor" ref={cursorRef} />

      <main className="page">
        <nav className="nav">
          <span className="brand">Flux Studio</span>
          <span className="tag">Realtime visual</span>
        </nav>

        <section className="hero">
          <p className="eyebrow fade-up">Immersive shader study</p>
          <h1 className="hero-title">Liquid light that follows your move.</h1>
          <p className="hero-copy fade-up">
            A canvas driven by a domain-warped GLSL shader running at 60fps.
            Move your pointer to bend the fluid and watch the typography slide
            upward as you scroll through the story.
          </p>
        </section>

        <section className="section fade-up">
          <h3>Realtime fluid canvas</h3>
          <p>
            The backdrop is a React Three Fiber plane with a custom shader. Time
            and mouse uniforms warp layered FBM noise to form the viscous
            motion, capped by a dynamic DPR for mobile stability.
          </p>
          <div className="pill-list">
            <span className="pill">GLSL domain warping</span>
            <span className="pill">R3F Canvas</span>
            <span className="pill">Responsive DPR</span>
          </div>
        </section>

        <section className="section fade-up">
          <h3>Guided scroll narrative</h3>
          <p>
            Lenis softens scroll momentum while GSAP ScrollTrigger fades
            sections upward as they enter view, matching the weighty feel of the
            fluid simulation behind them.
          </p>
          <div className="pill-list">
            <span className="pill">Lenis smooth scroll</span>
            <span className="pill">GSAP ScrollTrigger</span>
            <span className="pill">Section reveal</span>
          </div>
        </section>

        <section className="section fade-up">
          <h3>Custom cursor</h3>
          <p>
            A motion-smoothed ring follows the pointer without hitting React
            renders. It mirrors the shader forcefield so your hand and the fluid
            feel tethered.
          </p>
          <div className="pill-list">
            <span className="pill">RAF-driven updates</span>
            <span className="pill">Pointer tracking</span>
            <span className="pill">Blend mode</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
