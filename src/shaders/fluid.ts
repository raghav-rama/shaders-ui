export const heroVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const heroFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, -1.2, 1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p + 0.13;
      a *= 0.55;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 mouse = u_mouse;

    vec2 centered = (uv - 0.5) * vec2(aspect, 1.0);
    float t = u_time * 0.35;

    // Domain warp with a light swirl
    vec2 warp = vec2(
      fbm(uv * 2.4 + t * 0.6),
      fbm(uv * 2.4 - t * 0.45)
    );
    uv += warp * 0.12;

    // Cursor influence as a soft lens + hue shift
    float d = distance(vUv, mouse);
    float lens = exp(-pow(d * 8.0, 2.0));
    uv += (mouse - vUv) * lens * 0.2;

    float swirl = sin(atan(centered.y, centered.x) * 3.5 + t * 1.2) * 0.12;
    float radial = length(centered);
    float mask = smoothstep(0.9, 0.3, radial + swirl);

    float cloud = fbm(uv * 3.0 + vec2(t * 0.2, -t * 0.15));
    float detail = fbm(uv * 6.0 - vec2(t * 0.4, t * 0.3));
    float density = mix(cloud, detail, 0.45) + lens * 0.45;

    vec3 baseA = vec3(0.07, 0.14, 0.42);
    vec3 baseB = vec3(0.02, 0.07, 0.22);
    vec3 warm = vec3(0.95, 0.7, 0.45);
    vec3 violet = vec3(0.5, 0.4, 0.9);

    vec3 base = mix(baseB, baseA, smoothstep(0.0, 1.0, vUv.y));
    vec3 ink = mix(violet, warm, clamp(density * 1.2, 0.0, 1.0));
    vec3 color = mix(base, ink, mask * 0.9);
    color += lens * warm * 0.35;
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;
