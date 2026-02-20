"use client";
import { useEffect } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function LenisGSAPSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // ✅ Tell ScrollTrigger to read scroll position from Lenis, not raw browser
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    // ✅ Every Lenis scroll tick → update ScrollTrigger positions
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // ✅ After proxy is set, recalculate all trigger positions
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      ScrollTrigger.scrollerProxy(document.body, null);
    };
  }, [lenis]);

  return null; // Renders nothing — purely syncs the two systems
}
