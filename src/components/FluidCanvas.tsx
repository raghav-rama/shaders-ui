import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { ShaderMaterial, Vector2 } from "three";
import { fluidFragmentShader, fluidVertexShader } from "../shaders/fluid";

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
        vertexShader={fluidVertexShader}
        fragmentShader={fluidFragmentShader}
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
      <FluidPlane />
    </Canvas>
  );
}
