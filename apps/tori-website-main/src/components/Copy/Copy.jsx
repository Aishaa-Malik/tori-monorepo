"use client";
import "./Copy.css";
import React, { useRef } from "react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function Copy({ children, animateOnScroll = true, delay = 0 }) {
  const containerRef = useRef(null);
  const elementRefs = useRef([]);
  const splitRefs = useRef([]);
  const lines = useRef([]);

  const waitForFonts = async () => {
    try {
      await document.fonts.ready;

      const customFonts = ["Manrope"];
      const fontCheckPromises = customFonts.map((fontFamily) => {
        return document.fonts.check(`16px ${fontFamily}`);
      });

      await Promise.all(fontCheckPromises);
      await new Promise((resolve) => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return true;
    }
  };

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const initializeSplitText = async () => {
        await waitForFonts();

        if (!containerRef.current) return;

        // ✅ CHECK IF MOBILE
        const isMobile = window.innerWidth <= 768;

        // ✅ MOBILE: Skip SplitText, use simple fade animation
        if (isMobile) {
          gsap.set(containerRef.current, { opacity: 0, y: 20 });
          
          if (animateOnScroll) {
            gsap.to(containerRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: delay,
              ease: "power2.out",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 90%",
                once: true,
              },
            });
          } else {
            gsap.to(containerRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: delay,
              ease: "power2.out",
            });
          }
          
          return; // ✅ EXIT - Don't run SplitText on mobile
        }

        // ✅ DESKTOP: Use SplitText as normal
        splitRefs.current = [];
        lines.current = [];
        elementRefs.current = [];

        let elements = [];
        if (containerRef.current.hasAttribute("data-copy-wrapper")) {
          elements = Array.from(containerRef.current.children);
        } else {
          elements = [containerRef.current];
        }

        elements.forEach((element) => {
          elementRefs.current.push(element);

          const split = SplitText.create(element, {
            type: "lines",
            mask: false, // ✅ Changed from "lines" to false
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
          onComplete: () => {
            // ✅ Ensure visibility after animation
            gsap.set(lines.current, { clearProps: "transform" });
          }
        };

        if (animateOnScroll) {
          gsap.to(lines.current, {
            ...animationProps,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 90%",
              once: true,
              onEnter: () => {
                // ✅ Fallback: Make visible if animation fails
                setTimeout(() => {
                  if (lines.current.length > 0) {
                    const firstLine = lines.current[0];
                    const transform = window.getComputedStyle(firstLine).transform;
                    if (!transform || transform === 'none' || !transform.includes('matrix')) {
                      // Fallback: Force visible
                      gsap.set(lines.current, { y: "0%" });
                    }
                  }
                }, 2000);
              }
            },
          });
        } else {
          gsap.to(lines.current, animationProps);
          
          // ✅ Desktop fallback: Ensure animation completes
          setTimeout(() => {
            gsap.set(lines.current, { y: "0%" });
          }, delay * 1000 + 1500);
        }
      };

      initializeSplitText();

      return () => {
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
    return React.cloneElement(children, { ref: containerRef, suppressHydrationWarning: true });
  }

  return (
    <div ref={containerRef} data-copy-wrapper="true" suppressHydrationWarning>
      {children}
    </div>
  );
}
