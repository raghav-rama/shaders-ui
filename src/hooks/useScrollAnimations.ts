import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject, useLayoutEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimations(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (!scope.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        y: 40,
        opacity: 0,
        duration: 1.1,
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
    }, scope);

    return () => ctx.revert();
  }, [scope]);
}
