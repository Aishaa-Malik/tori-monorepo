"use client";
import React, { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./AnimatedBodyText.css";

gsap.registerPlugin(ScrollTrigger);

const keywordColors = {
  vibrant: "#7C5DFA",
  living: "#FF6B35",
  clarity: "#A2FF00",
  expression: "#FF6B35",
  shape: "#7C5DFA",
  intuitive: "#7C5DFA",
  storytelling: "#FFB703",
  interactive: "#FF6B35",
  vision: "#FF6B35",
};

const AnimatedBodyText = ({
  children,
  className = "",
  style = {},
  start = "top 90%",
  end = "bottom 40%",
  animate = true,
  ...props
}) => {
  const containerRef = useRef(null);

  const textContent = useMemo(() => {
    if (typeof children === "string") return children;
    if (Array.isArray(children)) {
      return children.map((c) => (typeof c === "string" ? c : "")).join("");
    }
    return "";
  }, [children]);

  const words = useMemo(() => {
    if (!textContent) return [];
    return textContent.split(/\s+/).filter(Boolean);
  }, [textContent]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!animate) return;
    if (words.length === 0) return;

    const wordElements = Array.from(container.querySelectorAll(".abt-word"));
    const totalWords = wordElements.length;
    const keywords = Object.keys(keywordColors);
    const wordHighlightBgColor = "60, 60, 60";

    const st = ScrollTrigger.create({
      trigger: container,
      start,
      end,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        wordElements.forEach((word, index) => {
          const wordText = word.querySelector("span");
          if (!wordText) return;
          const isKeyword = word.classList.contains("abt-keyword-wrapper");
          const normalizedWord = wordText.textContent
            .toLowerCase()
            .replace(/[.,!?;:"]/g, "");

          const revealProgress = Math.min(1, progress / 1.0);
          const effectiveOverlap = Math.min(10, totalWords / 2);
          const totalAnimationLength = 1 + effectiveOverlap / totalWords;
          const wordStart = index / totalWords;
          const wordEnd = wordStart + effectiveOverlap / totalWords;
          const timelineScale =
            1 /
            Math.min(
              totalAnimationLength,
              1 + (totalWords - 1) / totalWords + effectiveOverlap / totalWords
            );
          const adjustedStart = wordStart * timelineScale;
          const adjustedEnd = wordEnd * timelineScale;
          const duration = adjustedEnd - adjustedStart;
          const wordProgress =
            revealProgress <= adjustedStart
              ? 0
              : revealProgress >= adjustedEnd
              ? 1
              : (revealProgress - adjustedStart) / duration;

          word.style.opacity = wordProgress;

          const backgroundFadeStart =
            wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
          const backgroundOpacity = Math.max(0, 1 - backgroundFadeStart);
          let bgColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;

          if (isKeyword && keywords.includes(normalizedWord)) {
            bgColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;
          }

          word.style.backgroundColor = bgColor;

          const textRevealThreshold = 0.9;
          const textRevealProgress =
            wordProgress >= textRevealThreshold
              ? (wordProgress - textRevealThreshold) / (1 - textRevealThreshold)
              : 0;
          wordText.style.opacity = Math.pow(textRevealProgress, 0.5);
        });
      },
    });

    return () => {
      st.kill();
    };
  }, [animate, end, start, words, textContent]);

  if (!textContent) {
    return (
      <div
        ref={containerRef}
        className={`animated-body-text ${className}`}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`animated-body-text ${className}`}
      style={style}
      suppressHydrationWarning
      {...props}
    >
      {words.map((word, index) => {
        const normalizedWord = word.toLowerCase().replace(/[.,!?;:"]/g, "");
        const isKeyword = Object.prototype.hasOwnProperty.call(
          keywordColors,
          normalizedWord
        );
        return (
          <div
            key={`${normalizedWord}-${index}`}
            className={`abt-word${isKeyword ? " abt-keyword-wrapper" : ""}`}
            style={
              animate
                ? undefined
                : { opacity: 1, backgroundColor: "transparent" }
            }
          >
            <span
              className={isKeyword ? `abt-keyword ${normalizedWord}` : ""}
              style={animate ? undefined : { opacity: 1 }}
            >
              {word}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AnimatedBodyText;
