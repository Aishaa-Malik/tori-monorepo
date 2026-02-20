"use client";
import React, { useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./ProcessAnimation.css";

const ProcessAnimation = () => {
  const containerRef = useRef(null);

  const textContent =
    "Tori is 'YOUR 24/7 RECEPTIONIST'—an AI WHATSAPP SESSION BOOKING & front-desk AUTOMATION platform that replaces for clunky Forms with an Instant Chat Experience, allowing businesses to lock in Bookings in 10 seconds flat.";

  const keywords = useMemo(() => ["for", "clunky"], []);
  const words = useMemo(
    () => textContent.split(/\s+/).filter(Boolean),
    [textContent]
  );

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const wordHighlightBgColor = "60, 60, 60";
      const overlapWords = 15;
      const container = containerRef.current;
      if (!container) return;

      const allWords = Array.from(container.querySelectorAll(".word"));
      const totalWords = allWords.length;

      ScrollTrigger.getById("process-animation")?.kill();

      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        gsap.set(allWords, { opacity: 0.15 });
        const st = ScrollTrigger.create({
          id: "process-animation",
          trigger: container,
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(allWords, {
              opacity: 1,
              duration: 0.35,
              stagger: 0.04,
              ease: "power2.out",
            });
          },
        });
        return () => st.kill();
      }

      const timelineScale = totalWords / (totalWords + overlapWords);

      const st = ScrollTrigger.create({
        trigger: container,
        pin: true,
        start: "top top",
        end: () => `+=${window.innerHeight * 1.8}`,
        scrub: true,
        pinSpacing: true,
        anticipatePin: 1,
        markers: false,
        id: "process-animation",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;

          allWords.forEach((word, index) => {
            const wordText = word.querySelector("span");
            if (!wordText) return;

            if (progress <= 0.7) {
              const revealProgress = Math.min(1, progress / 0.55);
              const wordStart = (index / totalWords) * timelineScale;
              const wordEnd =
                ((index + overlapWords) / totalWords) * timelineScale;
              const duration = wordEnd - wordStart;

              const wordProgress =
                revealProgress <= wordStart
                  ? 0
                  : revealProgress >= wordEnd
                  ? 1
                  : (revealProgress - wordStart) / duration;

              gsap.set(word, {
                opacity: 0.3 + wordProgress * 0.7,
                backgroundColor: `rgba(${wordHighlightBgColor}, ${
                  wordProgress < 0.9
                    ? wordProgress * 0.3
                    : (1 - (wordProgress - 0.9) / 0.1) * 0.3
                })`,
              });
              gsap.set(wordText, { opacity: 1 });
            } else {
              const reverseProgress = (progress - 0.7) / 0.3;
              const reverseOverlapWords = 5;
              const reverseScale =
                totalWords / (totalWords + reverseOverlapWords);
              const reverseStart = (index / totalWords) * reverseScale;
              const reverseEnd =
                ((index + reverseOverlapWords) / totalWords) * reverseScale;
              const reverseDuration = reverseEnd - reverseStart;

              const reverseWordProgress =
                reverseProgress <= reverseStart
                  ? 0
                  : reverseProgress >= reverseEnd
                  ? 1
                  : (reverseProgress - reverseStart) / reverseDuration;

              if (reverseWordProgress > 0) {
                gsap.set(word, {
                  opacity: 1 - reverseWordProgress * 0.7,
                  backgroundColor: `rgba(${wordHighlightBgColor}, ${
                    reverseWordProgress * 0.3
                  })`,
                });
                gsap.set(wordText, { opacity: 1 - reverseWordProgress });
              } else {
                gsap.set(word, {
                  opacity: 1,
                  backgroundColor: `rgba(${wordHighlightBgColor}, 0)`,
                });
                gsap.set(wordText, { opacity: 1 });
              }
            }
          });
        },
        onLeaveBack: () => {
          allWords.forEach((word) => {
            gsap.set(word, {
              opacity: 1,
              backgroundColor: `rgba(${wordHighlightBgColor}, 0)`,
            });
            gsap.set(word.querySelector("span"), { opacity: 1 });
          });
        },
      });

      return () => {
        st.kill();
        const spacer = document.querySelector(
          '[data-gsap-spacer-id="process-animation"]'
        );
        spacer?.remove();
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      className="process-section process-animation-container"
      ref={containerRef}
    >
      <div className="process-copy-wrapper">
        <div className="process-text-content">
          <p>
            {words.map((word, index) => {
              const normalizedWord = word
                .toLowerCase()
                .replace(/[.,!?;:"]/g, "");
              const isKeyword = keywords.includes(normalizedWord);
              return (
                <span
                  key={`${normalizedWord}-${index}`}
                  className={`word${isKeyword ? " keyword-wrapper" : ""}`}
                >
                  <span className={isKeyword ? `keyword ${normalizedWord}` : ""}>
                    {word}
                  </span>
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProcessAnimation;
