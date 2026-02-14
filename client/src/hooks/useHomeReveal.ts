import { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export function useHomeReveal(
  scope: RefObject<HTMLElement | null>,
  dependencies: unknown[] = []
) {
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (!items.length) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(items, { opacity: 1, y: 0, filter: "blur(0px)" });
        return;
      }

      gsap.set(items, { opacity: 0, y: 22, filter: "blur(8px)" });

      const timeline = gsap.timeline({
        defaults: { duration: 0.8, ease: "power3.out" },
      });

      items.forEach((item, index) => {
        timeline.to(
          item,
          { opacity: 1, y: 0, filter: "blur(0px)" },
          index * 0.06
        );
      });
    },
    {
      scope,
      dependencies,
      revertOnUpdate: true,
    }
  );
}
