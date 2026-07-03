"use client";
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLenis } from 'lenis/react';
import './ProcessAnimation.css';
import {
  createRafScrollListener,
  getStickyProgress,
  isMobileViewport,
} from '@/lib/mobile-animation';

gsap.registerPlugin(ScrollTrigger);

const ProcessAnimation = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const lenis = useLenis();

  // Sync app-level Lenis with ScrollTrigger
  useEffect(() => {
    if (!lenis) return;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis]);

  useGSAP(() => {
    const isMobile = isMobileViewport();
    const wordHighlightBgColor = "60, 60, 60";
    const phrases = [
      { words: ["whatsapp", "booking", "layer"], className: "phrase-whatsapp-layer" },
      { words: ["live"], className: "phrase-live" },
      { words: ["google", "calendar", "slot"], className: "phrase-calendar-slot" },
      { words: ["confirmed", "instantly"], className: "phrase-confirmed" },
    ];
    const noBackgroundPhrases = [
      ["one", "tori", "ate", "number"],
    ];

    // Split paragraphs into word elements (exact WASTE logic)
    const paragraphs = textRef.current.querySelectorAll("p");
    paragraphs.forEach((paragraph) => {
      const text = paragraph.textContent;
      const words = text.split(/\s+/);
      const normalizedWords = words.map((word) =>
        word.toLowerCase().replace(/[.,!?;:"]/g, "")
      );
      paragraph.innerHTML = "";

      const getPhraseMatch = (wordIndex) => {
        for (const phrase of phrases) {
          for (let start = 0; start <= normalizedWords.length - phrase.words.length; start++) {
            const matches = phrase.words.every(
              (phraseWord, offset) => normalizedWords[start + offset] === phraseWord
            );

            if (matches && wordIndex === start) {
              return phrase;
            }
          }
        }

        return null;
      };

      const shouldSkipBackground = (wordIndex) => {
        return noBackgroundPhrases.some((phraseWords) => {
          for (let start = 0; start <= normalizedWords.length - phraseWords.length; start++) {
            const matches = phraseWords.every(
              (phraseWord, offset) => normalizedWords[start + offset] === phraseWord
            );

            if (matches && wordIndex >= start && wordIndex < start + phraseWords.length) {
              return true;
            }
          }

          return false;
        });
      };

      const appendIcon = (wordContainer, src, extraClass = "") => {
        const iconImg = Object.assign(document.createElement("img"), {
          src,
          className: `inline-icon ${extraClass}`.trim(),
          loading: "eager",
          decoding: "async",
        });
        iconImg.style.opacity = 0;
        wordContainer.appendChild(iconImg);
      };

      for (let index = 0; index < words.length; index++) {
        const phraseMatch = getPhraseMatch(index);

        if (phraseMatch) {
          const phraseWords = words.slice(index, index + phraseMatch.words.length);
          const lastWord = phraseWords[phraseWords.length - 1];
          const punctuationMatch = lastWord.match(/([.,!?;:]+)$/);
          const punctuation = punctuationMatch ? punctuationMatch[1] : "";
          const cleanedPhraseWords = phraseWords.map((phraseWord, phraseWordIndex) => {
            if (phraseWordIndex === phraseWords.length - 1) {
              return phraseWord.replace(/[.,!?;:]+$/, "");
            }

            return phraseWord;
          });

          const wordContainer = document.createElement("div");
          wordContainer.className = "word keyword-wrapper phrase-wrapper";

          const wordText = document.createElement("span");
          wordText.textContent = cleanedPhraseWords.join(" ");
          wordText.classList.add("keyword", phraseMatch.className);

          if (phraseMatch.className === "phrase-whatsapp-layer") {
            appendIcon(wordContainer, "/images/whatsapp-icon.webp", "phrase-leading-icon");
          }

          wordContainer.appendChild(wordText);

          if (punctuation) {
            const punctuationSpan = document.createElement("span");
            punctuationSpan.className = "phrase-punctuation";
            punctuationSpan.textContent = punctuation;
            wordContainer.appendChild(punctuationSpan);
          }

          if (phraseMatch.className === "phrase-calendar-slot") {
            appendIcon(wordContainer, "/images/calendar-icon.webp");
          }

          paragraph.appendChild(wordContainer);
          paragraph.appendChild(document.createTextNode(" "));
          index += phraseMatch.words.length - 1;
          continue;
        }

        const word = words[index];
        if (word.trim()) {
          const wordContainer = document.createElement("div");
          wordContainer.className = "word";
          if (shouldSkipBackground(index)) {
            wordContainer.classList.add("no-bg");
          }

          const wordText = document.createElement("span");
          const punctuationMatch = word.match(/([.,!?;:]+)$/);
          const punctuation = punctuationMatch ? punctuationMatch[1] : "";
          wordText.textContent = punctuation ? word.replace(/[.,!?;:]+$/, "") : word;

          wordContainer.appendChild(wordText);

          if (punctuation) {
            const punctuationSpan = document.createElement("span");
            punctuationSpan.className = "phrase-punctuation";
            punctuationSpan.textContent = punctuation;
            wordContainer.appendChild(punctuationSpan);
          }

          const normalizedWord = normalizedWords[index];

          if (normalizedWord === "appointment-heavy") {
            appendIcon(wordContainer, "/images/high-volume-icon.webp");
          } else if (normalizedWord === "message") {
            appendIcon(wordContainer, "/images/chat-icon.webp");
          } else if (normalizedWord === "payment") {
            appendIcon(wordContainer, "/images/money-icon.webp", "money-icon");
          }

          paragraph.appendChild(wordContainer);
          paragraph.appendChild(document.createTextNode(" "));
        }
      }
    });

    // Exact animation math from WASTE script.js
    const container = containerRef.current;
    const allWords = Array.from(container.querySelectorAll(".word"));
    const totalWords = allWords.length;

    const updateWordsForProgress = (progress) => {
        allWords.forEach((word, index) => {
          const wordText = word.querySelector("span");
          const wordIcon = word.querySelector("img.inline-icon");
          const punctuation = word.querySelector(".phrase-punctuation");

          if (progress <= 0.7) {
            // Phase 1: Reveal words (progress 0 → 0.7)
            const progressTarget = 0.7;
            const revealProgress = Math.min(1, progress / progressTarget);

            const overlapWords = isMobile ? 9 : 15;
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

            // Word container fades in
            word.style.opacity = wordProgress;

            // Grey background: stays full, then fades out at 90% progress
            const backgroundFadeStart =
              wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
            const backgroundOpacity = word.classList.contains("no-bg")
              ? 0
              : Math.max(0, 1 - backgroundFadeStart);
            word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;

            // Text reveals at 90% threshold
            const textRevealThreshold = 0.9;
            const textRevealProgress =
              wordProgress >= textRevealThreshold
                ? (wordProgress - textRevealThreshold) / (1 - textRevealThreshold)
                : 0;
            if (wordText) wordText.style.opacity = Math.pow(textRevealProgress, 0.5);
            if (wordIcon) wordIcon.style.opacity = Math.pow(textRevealProgress, 0.5);
            if (punctuation) punctuation.style.opacity = Math.pow(textRevealProgress, 0.5);
          } else {
            // Phase 2: Reverse/hide words (progress 0.7 → 1.0)
            const reverseProgress = (progress - 0.7) / 0.3;
            word.style.opacity = 1;
            const targetTextOpacity = 1;

            const reverseOverlapWords = isMobile ? 4 : 5;
            const reverseWordStart = index / totalWords;
            const reverseWordEnd =
              reverseWordStart + reverseOverlapWords / totalWords;

            const reverseTimelineScale =
              1 /
              Math.max(
                1,
                (totalWords - 1) / totalWords + reverseOverlapWords / totalWords
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
              if (wordText) wordText.style.opacity = targetTextOpacity * (1 - reverseWordProgress);
              if (wordIcon) wordIcon.style.opacity = targetTextOpacity * (1 - reverseWordProgress);
              if (punctuation) punctuation.style.opacity = targetTextOpacity * (1 - reverseWordProgress);
              word.style.backgroundColor = word.classList.contains("no-bg")
                ? "rgba(60, 60, 60, 0)"
                : `rgba(${wordHighlightBgColor}, ${reverseWordProgress})`;
            } else {
              if (wordText) wordText.style.opacity = targetTextOpacity;
              if (wordIcon) wordIcon.style.opacity = targetTextOpacity;
              if (punctuation) punctuation.style.opacity = targetTextOpacity;
              word.style.backgroundColor = `rgba(${wordHighlightBgColor}, 0)`;
            }
          }
        });
    };

    if (isMobile) {
      return createRafScrollListener(() => {
        updateWordsForProgress(getStickyProgress(container));
      });
    }

    const processTrigger = ScrollTrigger.create({
      trigger: container,
      pin: container,
      anticipatePin: 1,
      start: "top top",
      end: `+=${window.innerHeight * 4}`,
      pinSpacing: true,
      onUpdate: (self) => updateWordsForProgress(self.progress),
    });

    const refreshId = requestAnimationFrame(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return () => {
      cancelAnimationFrame(refreshId);
      processTrigger.kill();
    };
  }, { scope: containerRef });

  return (
    <section className="process-section process-animation-container" ref={containerRef}>
      <div className="process-copy-wrapper">
        <div className="process-text-content" ref={textRef}>
          <p>
            Tori Ate is the WhatsApp booking layer for
          </p>
          <p>
            appointment-heavy businesses. Customers message one Tori Ate number, choose a service, pick a live
          </p>
          <p>
            Google Calendar slot, pay through a payment link,
          </p>
          <p>
            & get confirmed instantly.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProcessAnimation;