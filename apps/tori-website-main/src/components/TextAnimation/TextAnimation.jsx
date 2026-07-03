"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import './TextAnimation.css';

const TextAnimation = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const lenis = useLenis();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const wordHighlightBgColor = "60, 60, 60";
    const keywords = [
      "vibrant",
      "living",
      "clarity",
      "expression",
      "shape",
      "intuitive",
      "storytelling",
      "interactive",
      "vision",
    ];
    const keywordSet = new Set(keywords);

    const wrapParagraph = (paragraph) => {
      const nodes = Array.from(paragraph.childNodes);
      paragraph.innerHTML = "";

      nodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const parts = (node.textContent || "").split(/\s+/);
          parts.forEach((word) => {
            if (word.trim()) {
              const wordContainer = document.createElement("div");
              wordContainer.className = "word";

              const wordText = document.createElement("span");
              wordText.textContent = word;

              const normalizedWord = word
                .toLowerCase()
                .replace(/[.,!?;:"]/g, "");

              if (keywordSet.has(normalizedWord)) {
                wordContainer.classList.add("keyword-wrapper");
                wordText.classList.add("keyword", normalizedWord);
              }

              wordContainer.appendChild(wordText);
              paragraph.appendChild(wordContainer);
            }
          });

          return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          if (el.tagName === "BR") return;

          const wordContainer = document.createElement("div");
          wordContainer.className = "word";

          const wordContent = document.createElement("span");
          wordContent.appendChild(el);

          wordContainer.appendChild(wordContent);
          paragraph.appendChild(wordContainer);
        }
      });
    };

    const textRoot = textRef.current;
    const container = containerRef.current;
    if (!textRoot || !container) return;

    const paragraphs = textRoot.querySelectorAll("p");
    paragraphs.forEach(wrapParagraph);

    const words = Array.from(container.querySelectorAll(".word"));
    const totalWords = words.length;

    scrollTriggerRef.current?.kill();
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      pin: container,
      start: "top top",
      end: `+=${window.innerHeight * 4}`,
      pinSpacing: true,
      onUpdate: (self) => {
        const progress = self.progress;

        words.forEach((word, index) => {
          const wordText = word.querySelector("span");
          if (!wordText) return;

          if (progress <= 0.7) {
            const progressTarget = 0.7;
            const revealProgress = Math.min(1, progress / progressTarget);

            const overlapWords = 15;
            const totalAnimationLength = 1 + overlapWords / totalWords;

            const wordStart = index / totalWords;
            const wordEnd = wordStart + overlapWords / totalWords;

            const timelineScale =
              1 /
              Math.min(
                totalAnimationLength,
                1 + (totalWords - 1) / totalWords + overlapWords / totalWords
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
            word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;

            const textRevealThreshold = 0.9;
            const textRevealProgress =
              wordProgress >= textRevealThreshold
                ? (wordProgress - textRevealThreshold) /
                  (1 - textRevealThreshold)
                : 0;
            wordText.style.opacity = Math.pow(textRevealProgress, 0.5);
          } else {
            const reverseProgress = (progress - 0.7) / 0.3;
            word.style.opacity = 1;
            const targetTextOpacity = 1;

            const reverseOverlapWords = 5;
            const reverseWordStart = index / totalWords;
            const reverseWordEnd =
              reverseWordStart + reverseOverlapWords / totalWords;

            const reverseTimelineScale =
              1 /
              Math.max(
                1,
                (totalWords - 1) / totalWords +
                  reverseOverlapWords / totalWords
              );

            const reverseAdjustedStart = reverseWordStart * reverseTimelineScale;
            const reverseAdjustedEnd = reverseWordEnd * reverseTimelineScale;
            const reverseDuration = reverseAdjustedEnd - reverseAdjustedStart;

            const reverseWordProgress =
              reverseProgress <= reverseAdjustedStart
                ? 0
                : reverseProgress >= reverseAdjustedEnd
                ? 1
                : (reverseProgress - reverseAdjustedStart) / reverseDuration;

            if (reverseWordProgress > 0) {
              wordText.style.opacity =
                targetTextOpacity * (1 - reverseWordProgress);
              word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${reverseWordProgress})`;
            } else {
              wordText.style.opacity = targetTextOpacity;
              word.style.backgroundColor = `rgba(${wordHighlightBgColor}, 0)`;
            }
          }
        });
      },
    });

    return () => {
      scrollTriggerRef.current?.kill();
      scrollTriggerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!lenis) return;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  return (
    <section className="about about-animation anime-text-container" ref={containerRef}>
      <div className="about-copy-container">
        <div className="about-animated-text" ref={textRef}>
          <p>
            Tori is the 'Stripe for Scheduling'—an AI WhatsApp appointment scheduling &
             front-desk automation platform that replaces clunky forms with an instant 
             chat experience, allowing high-volume businesses to lock in bookings in 20 seconds flat.
          </p>
          {/* <p>
            We believe great design starts with clarity and expression ends.
            That's why Huebase is built to simplify your workflow while
            amplifying your creative reach. From the first concept to the final
            handoff, it's a space where your ideas take shape and more, your
            palette comes to life& your interface begins.
          </p> */}
        </div>
      </div>
    </section>
  );
};

export default TextAnimation;
