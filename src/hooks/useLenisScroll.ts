import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useLenisScroll() {
  const scrollPosition = useRef(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      smoothWheel: true,
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
}
