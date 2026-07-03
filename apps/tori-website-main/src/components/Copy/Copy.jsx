"use client";
import "./Copy.css";
import React, { useRef } from "react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { createRevealObserver, isMobileViewport } from "@/lib/mobile-animation";

gsap.registerPlugin(SplitText, ScrollTrigger);

let fontsReadyPromise;

export default function Copy({ children, animateOnScroll = true, delay = 0 }) {
  const containerRef = useRef(null);
  const elementRefs = useRef([]);
  const splitRefs = useRef([]);
  const lines = useRef([]);

  const waitForFonts = async () => {
    try {
      if (!fontsReadyPromise) {
        fontsReadyPromise = document.fonts?.ready ?? Promise.resolve();
      }

      await fontsReadyPromise;
      return true;
    } catch (error) {
      return true;
    }
  };

  useGSAP(
    () => {
      if (!containerRef.current) return;
      let cleanupMobileObserver = null;
      let mobileTween = null;

      const initializeSplitText = async () => {
        splitRefs.current = [];
        lines.current = [];
        elementRefs.current = [];
        const isMobile = isMobileViewport();

        if (!isMobile) {
          await waitForFonts();
        }

        let elements = [];
        if (containerRef.current.hasAttribute("data-copy-wrapper")) {
          elements = Array.from(containerRef.current.children);
        } else {
          elements = [containerRef.current];
        }

        if (isMobile) {
          gsap.set(elements, { opacity: 0, y: 14, force3D: true });

          const mobileAnimationProps = {
            opacity: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.04,
            ease: "power2.out",
            delay: Math.min(delay, 0.18),
            clearProps: "transform",
          };

          if (animateOnScroll) {
            const playMobileAnimation = () => {
              if (mobileTween) return;
              mobileTween = gsap.to(elements, mobileAnimationProps);
            };

            cleanupMobileObserver = createRevealObserver(
              containerRef.current,
              playMobileAnimation,
              { rootMargin: "0px 0px -8% 0px" }
            );
          } else {
            mobileTween = gsap.to(elements, mobileAnimationProps);
          }

          return;
        }

        elements.forEach((element) => {
          elementRefs.current.push(element);

          const split = SplitText.create(element, {
            type: "lines",
            mask: "lines",
            linesClass: "line++",
            lineThreshold: 0.1,
          });

          splitRefs.current.push(split);

          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;

          if (textIndent && textIndent !== "0px") {
            if (split.lines.length > 0) {
              split.lines[0].style.paddingLeft = textIndent;
            }
            element.style.textIndent = "0";
          }

          lines.current.push(...split.lines);
        });

        gsap.set(lines.current, { y: "100%" });

        const animationProps = {
          y: "0%",
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          delay: delay,
        };

        if (animateOnScroll) {
          gsap.to(lines.current, {
            ...animationProps,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 90%",
              once: true,
            },
          });
        } else {
          gsap.to(lines.current, animationProps);
        }
      };

      initializeSplitText();

      return () => {
        cleanupMobileObserver?.();
        mobileTween?.kill();
        splitRefs.current.forEach((split) => {
          if (split) {
            split.revert();
          }
        });
      };
    },
    { scope: containerRef, dependencies: [animateOnScroll, delay] }
  );

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, { ref: containerRef });
  }

  return (
    <div ref={containerRef} data-copy-wrapper="true">
      {children}
    </div>
  );
}
