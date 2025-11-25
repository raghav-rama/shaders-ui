import { type RefObject, useEffect } from "react";

export function useCursorFollower(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const cursor = ref.current;
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
  }, [ref]);
}
