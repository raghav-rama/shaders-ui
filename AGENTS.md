# Hero Fluid Background – Build Notes

Use a modern React stack with WebGL for the background and high-performance DOM animations on top.

## Stack
- React + Vite
- React Three Fiber (R3F) for the canvas layer
- GLSL fragment shader for the fluid feel (domain-warped FBM, cursor lens warp)
- GSAP + ScrollTrigger for text reveals
- Lenis for smooth scrolling
- Optional custom cursor ring (RAF-driven, pointer-events: none)

## Background Layer (Canvas)
- Position the R3F canvas fixed, full-viewport, behind content (`z-index: 0`).
- Use a single full-screen plane; `dpr={[1, 1.5]}` to cap pixel density for mobile.
- Shader: domain-warped FBM noise with a dark blue base and violet/warm accents. Cursor adds a subtle lens/distortion, not a glowing hotspot.
- Uniforms: `u_time`, `u_mouse` (normalized), `u_resolution`.
- Mouse handling: track pointer with `pointermove`, lerp on RAF/useFrame to avoid jitter.

## Foreground Layer (HTML)
- Standard sections (`nav`, `hero`, `section`), positioned above the canvas.
- Text animations via GSAP+ScrollTrigger fade/slide up on enter.
- Custom cursor ring: a fixed `div` updated in RAF (not React state). Hide native cursor when enabled.

## Performance
- Keep the shader simple (no multi-pass FBO) for portability.
- Cap DPR and avoid stacking CSS gradients under the canvas to prevent seams.
- Prefer additive/screen mixing with clamped output to avoid white blowouts.

## Quick Impl Steps
1) Install R3F, drei, GSAP/ScrollTrigger, Lenis.
2) Create fixed `<Canvas>` with orthographic camera, full-screen plane, and the shader.
3) Hook mouse to shader uniforms; lerp for smoothness.
4) Add Lenis and ScrollTrigger for scroll/animation.
5) (Optional) Add the RAF-driven cursor ring and hide the native cursor when active.
