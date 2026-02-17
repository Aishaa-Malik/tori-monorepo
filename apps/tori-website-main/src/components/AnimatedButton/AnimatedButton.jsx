"use client";
import "./AnimatedButton.css";
import React, { useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useViewTransition } from "@/hooks/useViewTransition";

import { IoMdArrowForward } from "react-icons/io";

gsap.registerPlugin(SplitText, ScrollTrigger);

const AnimatedButton = ({
  label,
  route,
  animate = true,
  animateOnScroll = true,
  delay = 0,
  className = "",
  ...props
}) => {
  const { navigateWithTransition } = useViewTransition();
  const buttonRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);
  const splitRef = useRef(null);

  const waitForFonts = async () => {
    try {
      await document.fonts.ready;
      const customFonts = ["Manrope", "Inter"];
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
      if (!buttonRef.current || !textRef.current) return;

      if (!animate) {
        gsap.set(buttonRef.current, { scale: 1, opacity: 1 });
        gsap.set(iconRef.current, { opacity: 1, x: 0 });
        return;
      }

      const initializeAnimation = async () => {
        await waitForFonts();

        if (!buttonRef.current || !iconRef.current || !textRef.current) return;

        // ✅ Skip SplitText if label contains HTML/JSX
        const isJSX = typeof label !== 'string';
        
        if (!isJSX) {
          const split = SplitText.create(textRef.current, {
            type: "lines",
            mask: "lines",
            linesClass: "line++",
            lineThreshold: 0.1,
          });
          splitRef.current = split;
        }

        gsap.set(buttonRef.current, { 
          scale: 0.8, 
          opacity: 0,
          transformOrigin: "center" 
        });
        gsap.set(iconRef.current, { opacity: 0, x: -10 });
        
        if (!isJSX && splitRef.current) {
          gsap.set(splitRef.current.lines, { y: "100%", opacity: 0 });
        } else {
          gsap.set(textRef.current, { opacity: 0, y: 20 });
        }

        const tl = gsap.timeline({ delay: delay });

        tl.to(buttonRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        });

        tl.to(
          iconRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.3"
        );

        if (!isJSX && splitRef.current) {
          tl.to(
            splitRef.current.lines,
            {
              y: "0%",
              opacity: 1,
              duration: 0.6,
              stagger: 0.08,
              ease: "power3.out",
            },
            "-=0.4"
          );
        } else {
          tl.to(
            textRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
            },
            "-=0.4"
          );
        }

        if (animateOnScroll) {
          ScrollTrigger.create({
            trigger: buttonRef.current,
            start: "top 90%",
            once: true,
            animation: tl,
          });
        }
      };

      initializeAnimation();

      return () => {
        if (splitRef.current) {
          splitRef.current.revert();
        }
      };
    },
    { scope: buttonRef, dependencies: [animate, animateOnScroll, delay] }
  );

  const buttonContent = (
    <>
      <div className="icon" ref={iconRef}>
        <IoMdArrowForward />
      </div>
      <span className="button-text" ref={textRef}>
        {label}
      </span>
    </>
  );

  if (route) {
    return (
      <a
        href={route}
        className={`btn ${className}`}
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          navigateWithTransition(route);
        }}
        {...props}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <button
      className={`btn ${className}`}
      ref={buttonRef}
      suppressHydrationWarning
      {...props}
    >
      {buttonContent}
    </button>
  );
};

export default AnimatedButton;
