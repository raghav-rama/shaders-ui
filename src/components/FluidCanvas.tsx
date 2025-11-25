import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { ShaderMaterial, Vector2 } from "three";
import { heroFragment, heroVertex } from "../shaders/fluid";

function FluidLayer() {
  const materialRef = useRef<ShaderMaterial>(null);
  const mouseTarget = useRef(new Vector2(0.5, 0.5));
  const mouse = useRef(new Vector2(0.5, 0.5));
  const mouseVelocity = useRef(new Vector2());
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

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_mouse: { value: new Vector2(0.5, 0.5) },
      u_mouseVel: { value: new Vector2(0, 0) },
      u_resolution: {
        value: new Vector2(
          typeof window !== "undefined" ? window.innerWidth : 1,
          typeof window !== "undefined" ? window.innerHeight : 1
        ),
      },
    }),
    []
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.u_time.value += delta;

    const prev = mouse.current.clone();
    mouse.current.lerp(mouseTarget.current, 0.18);
    mouseVelocity.current
      .copy(mouse.current)
      .sub(prev)
      .multiplyScalar(60); // rough px/sec proxy

    mat.uniforms.u_mouse.value.copy(mouse.current);
    mat.uniforms.u_mouseVel.value.copy(mouseVelocity.current);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={heroVertex}
        fragmentShader={heroFragment}
        uniforms={uniforms}
        transparent={false}
      />
    </mesh>
  );
}

export function FluidCanvas() {
  return (
    <Canvas
      className="fluid-canvas"
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1.2 }}
    >
      <FluidLayer />
    </Canvas>
  );
}
