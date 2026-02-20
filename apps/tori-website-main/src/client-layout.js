"use client";
import { useEffect, useRef } from "react";
import { ReactLenis } from "lenis/react";
import { ViewTransitions } from "next-view-transitions";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const desktopSettings = {
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical",
  gestureOrientation: "vertical",
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
  lerp: 0.1,
  wheelMultiplier: 1,
  smoothWheel: true,
  syncTouch: true,
  // ✅ Disable autoRaf — GSAP ticker will drive Lenis manually
  autoRaf: false,
};

const mobileSettings = {
  duration: 0.8,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical",
  gestureOrientation: "vertical",
  smoothTouch: true,
  touchMultiplier: 1.5,
  infinite: false,
  lerp: 0.09,
  wheelMultiplier: 1,
  smoothWheel: true,
  syncTouch: true,
  autoRaf: false,
};

export default function ClientLayout({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // ✅ THE CORRECT LENIS + GSAP PATTERN (from official Lenis docs)
    // Drive Lenis from GSAP's ticker so they share the same frame loop
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);

    // ✅ Tell ScrollTrigger to update on every Lenis scroll event
    const handleScroll = () => ScrollTrigger.update();
    lenisRef.current?.lenis?.on("scroll", handleScroll);

    // ✅ Remove GSAP's default lag smoothing — Lenis handles this
    gsap.ticker.lagSmoothing(0);

    // ✅ Handle resize — update options without reinitializing
    const handleResize = () => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;
      const isMobile = window.innerWidth <= 1000;
      const settings = isMobile ? mobileSettings : desktopSettings;
      lenis.options.duration = settings.duration;
      lenis.options.lerp = settings.lerp;
      lenis.options.touchMultiplier = settings.touchMultiplier;
      lenis.options.smoothTouch = settings.smoothTouch;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      gsap.ticker.remove(update);
      lenisRef.current?.lenis?.off("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ViewTransitions>
      <ReactLenis root ref={lenisRef} options={desktopSettings}>
        {children}
      </ReactLenis>
    </ViewTransitions>
  );
}
