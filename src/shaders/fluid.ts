export const fluidVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fluidFragmentShader = /* glsl */ `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
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
    float t = u_time * 0.35;

    vec2 warp = vec2(
      fbm(uv * 3.1 + t),
      fbm(uv * 3.1 - t + 10.0)
    );

    float dist = distance(uv, mouse);
    float mousePull = exp(-pow(dist * 10.0, 2.4));
    vec2 warpedUv = uv + warp * 0.14 + (mouse - uv) * mousePull * 0.18;

    float layers = fbm(warpedUv * 4.0 + t * 1.0);
    float halo = smoothstep(0.08, 0.94, 1.0 - length(centered)) * 0.12;
    float luminance = smoothstep(0.1, 0.9, layers + halo);
    luminance = clamp(luminance, 0.05, 0.78);

    vec3 base = vec3(0.02, 0.05, 0.12);
    vec3 mid = vec3(0.10, 0.24, 0.55);
    vec3 accent = vec3(0.52, 0.93, 0.86);

    vec3 color = mix(mid, accent, luminance);
    color = mix(base, color, 0.82);

    gl_FragColor = vec4(color, 1.0);
  }
`;
