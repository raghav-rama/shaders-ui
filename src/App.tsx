import Lenis from "lenis";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ShaderMaterial, Vector2 } from "three";
import "./App.css";

gsap.registerPlugin(ScrollTrigger);

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.5;

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(st * frequency);
      st = st * 2.0 + vec2(0.0, 1.0);
      amplitude *= 0.55;
      frequency *= 1.7;
    }

    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 mouse = u_mouse;
    vec2 centered = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    float t = u_time * 0.3;

    vec2 warp = vec2(
      fbm(uv * 3.0 + t),
      fbm(uv * 3.0 - t + 10.0)
    );

    float mousePull = smoothstep(0.6, 0.04, distance(uv, mouse));
    vec2 warpedUv = uv + warp * 0.12 + (mouse - uv) * mousePull * 0.35;

    float layers = fbm(warpedUv * 3.5 + t * 0.8);
    float halo = smoothstep(0.1, 0.9, 1.0 - length(centered)) * 0.15;
    float luminance = smoothstep(0.2, 0.95, layers + halo + mousePull * 0.8);

    vec3 base = vec3(0.02, 0.03, 0.08);
    vec3 mid = vec3(0.13, 0.27, 0.52);
    vec3 accent = vec3(0.98, 0.86, 0.48);

    vec3 color = mix(mid, accent, luminance);
    color = mix(base, color, 0.92);
    color += mousePull * 0.25 * accent;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function FluidPlane() {
  const materialRef = useRef<ShaderMaterial>(null);
  const mouseTarget = useRef(new Vector2(0.5, 0.5));
  const mouse = useRef(new Vector2(0.5, 0.5));
  const { size, viewport } = useThree();

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      mouseTarget.current.set(
        event.clientX / size.width,
        1 - event.clientY / size.height
      );
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [size.height, size.width]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_resolution.value.set(
        size.width,
        size.height
      );
    }
  }, [size.height, size.width]);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.u_time.value += delta;
    mouse.current.lerp(mouseTarget.current, 0.08);
    material.uniforms.u_mouse.value.copy(mouse.current);
  });

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_mouse: { value: new Vector2(0.5, 0.5) },
      u_resolution: {
        value: new Vector2(
          typeof window !== "undefined" ? window.innerWidth : 1,
          typeof window !== "undefined" ? window.innerHeight : 1
        ),
      },
    }),
    []
  );

  return (
    <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, 0]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={false}
      />
    </mesh>
  );
}

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef(0);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let rafId = 0;

    const handleMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const render = () => {
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      rafId = requestAnimationFrame(render);
    };

    render();
    window.addEventListener("pointermove", handleMove);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      smoothWheel: true,
      // smoothTouch: false,
      wheelMultiplier: 1,
    });

    const onScroll = ({ scroll }: { scroll: number }) => {
      scrollPosition.current = scroll;
      ScrollTrigger.update();
    };

    lenis.on("scroll", onScroll);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return scrollPosition.current;
      },
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
      pinType: document.body.style.transform ? "transform" : "fixed",
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    raf(0);

    return () => {
      lenis.off("scroll", onScroll);
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  useLayoutEffect(() => {
    if (!appRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        y: 40,
        opacity: 0,
        duration: 1.3,
        ease: "power3.out",
      });

      gsap.utils.toArray<HTMLElement>(".fade-up").forEach((element, index) => {
        gsap.from(element, {
          y: 50,
          opacity: 0,
          duration: 1,
          delay: index * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, appRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="app" ref={appRef}>
      <div className="background">
        <Canvas
          className="fluid-canvas"
          dpr={[1, 1.5]}
          orthographic
          camera={{ position: [0, 0, 1], zoom: 1.2 }}
        >
          <FluidPlane />
        </Canvas>
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
