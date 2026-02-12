"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./AnimatedBodyText.css";

gsap.registerPlugin(ScrollTrigger);

const AnimatedBodyText = ({ children, className = "", style = {}, start = "top 90%", end = "bottom 40%", animate = true, ...props }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Word highlighting logic (optional, keeping for consistency if keywords appear)
    const keywordColors = {
        vibrant: "#7C5DFA",      // Purple
        living: "#FF6B35",       // Orange
        clarity: "#A2FF00",      // Lime Green
        expression: "#FF6B35",   // Orange
        shape: "#7C5DFA",        // Purple
        intuitive: "#7C5DFA",    // Purple
        storytelling: "#FFB703", // Gold
        interactive: "#FF6B35",  // Orange
        vision: "#FF6B35",       // Orange
    };
    const keywords = Object.keys(keywordColors);
    const wordHighlightBgColor = "60, 60, 60"; // Default fallback if needed

    // 1. Prepare text
    // If children is a string, split it. If it's complex, we might need more logic.
    // Assuming simple string or simple element tree for "body text".
    // For now, we'll treat children as text content.
    
    let textContent = "";
    if (typeof children === "string") {
        textContent = children;
    } else if (Array.isArray(children)) {
        textContent = children.map(c => (typeof c === "string" ? c : "")).join("");
    } else {
        // Fallback for non-string children
        return; 
    }

    const words = textContent.split(/\s+/);
    container.innerHTML = "";

    words.forEach((word) => {
        if (word.trim()) {
            const wordContainer = document.createElement("div");
            wordContainer.className = "abt-word"; // abt = AnimatedBodyText

            const wordText = document.createElement("span");
            wordText.textContent = word;

            const normalizedWord = word.toLowerCase().replace(/[.,!?;:"]/g, "");
            
            // Check for keywords
            if (keywords.includes(normalizedWord)) {
                wordContainer.classList.add("abt-keyword-wrapper");
                wordText.classList.add("abt-keyword", normalizedWord);
            }

            wordContainer.appendChild(wordText);
            container.appendChild(wordContainer);
            
            if (!animate) {
              wordText.style.opacity = 1;
              wordContainer.style.opacity = 1;
              wordContainer.style.backgroundColor = "transparent";
            }
        }
    });

    if (!animate) return;

    // 2. Animation
    const wordElements = Array.from(container.querySelectorAll(".abt-word"));
    const totalWords = wordElements.length;

    const st = ScrollTrigger.create({
        trigger: container,
        start: start,
        end: end,
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;
            
            wordElements.forEach((word, index) => {
                const wordText = word.querySelector("span");
                const isKeyword = word.classList.contains("abt-keyword-wrapper");
                const normalizedWord = wordText.textContent.toLowerCase().replace(/[.,!?;:"]/g, "");

                // Calculate stagger
                // Using the math from TextAnimation.jsx Phase 1
                
                // We want to complete the reveal by progress 1.0 (since we don't have a reverse phase here)
                const progressTarget = 1.0; 
                const revealProgress = Math.min(1, progress / progressTarget);

                const overlapWords = 5; // Reduced overlap for shorter paragraphs? Or keep 15? 
                // TextAnimation used 15 for a long section. For body text, 5-10 is better.
                const effectiveOverlap = Math.min(10, totalWords / 2);
                
                const totalAnimationLength = 1 + effectiveOverlap / totalWords;
                const wordStart = index / totalWords;
                const wordEnd = wordStart + effectiveOverlap / totalWords;
                
                const timelineScale = 1 / Math.min(totalAnimationLength, 1 + (totalWords - 1) / totalWords + effectiveOverlap / totalWords);
                
                const adjustedStart = wordStart * timelineScale;
                const adjustedEnd = wordEnd * timelineScale;
                const duration = adjustedEnd - adjustedStart;
                
                const wordProgress = revealProgress <= adjustedStart ? 0 : revealProgress >= adjustedEnd ? 1 : (revealProgress - adjustedStart) / duration;

                word.style.opacity = wordProgress;
                
                // Background animation
                // In TextAnimation.jsx, background fades in then out for normal words (passing highlight).
                // And keywords stay? Wait, TextAnimation.jsx (the one I replaced) had specific logic.
                // The "CORRECTED" one provided by user had a background color variable.
                
                // Let's mimic the effect:
                // Fade in background opacity.
                // For normal words, maybe we DON'T want a background pill?
                // Standard body text usually doesn't have grey pills everywhere.
                // But the user said "implement ... the text animation thats happening in this section".
                // That section HAS grey pills for normal words that fade out.
                // I will replicate it.
                
                const backgroundFadeStart = wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
                let backgroundOpacity = Math.max(0, 1 - backgroundFadeStart);
                
                // If it's a keyword, we might want it to STAY?
                // The provided TextAnimation.jsx had complex logic.
                // Let's stick to the "passing highlight" for normal words.
                
                let bgColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;
                
                if (isKeyword && keywordColors[normalizedWord]) {
                    // Keywords in the reference get their specific color and STAY.
                    // Or do they? The reference TextAnimation.jsx used:
                    // word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;
                    // It actually applied the GREY highlight to everything in Phase 1.
                    // Then Phase 2 reversed it.
                    // Wait, the "CORRECTED" code I implemented in TextAnimation.jsx sets background color explicitly in the DOM creation for keywords!
                    // And then ScrollTrigger updates opacity.
                    // Let's check the DOM creation part of the *current* TextAnimation.jsx I wrote.
                    
                    /*
                    if (keywords.includes(normalizedWord)) {
                        wordContainer.classList.add("keyword-wrapper");
                        wordText.classList.add("keyword", normalizedWord);
                    }
                    */
                   
                   // It actually DOES NOT set background color in the loop in my last write!
                   // Wait, I used the code the user provided.
                   // Let's re-read the user's provided "FIXED: TextAnimeSection.jsx" code (which I wrote to TextAnimation.jsx).
                   
                   /*
                   if (keywords.includes(normalizedWord)) {
                     // ...
                     wordText.classList.add("keyword", normalizedWord);
                   }
                   // ...
                   // ScrollTrigger loop:
                   word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;
                   */
                   
                   // It seems it overrides background color with grey!
                   // But wait, CSS handles the specific colors?
                   // The CSS has:
                   /*
                   .about-animated-text .word span.keyword.vibrant::before { background-color: #7a78ff; }
                   */
                   // The CSS puts a pseudo-element ::before for the color!
                   // And the JS animates the *container's* background color (grey).
                   // So we get a grey passing highlight on the container, AND a colored pill on the keyword span via CSS?
                   // The JS `word.style.backgroundColor` affects the `.word` div.
                   // The keyword color is on `span.keyword::before`.
                   
                   // So to replicate exactly:
                   // 1. Apply grey passing highlight to `.abt-word` via JS.
                   // 2. Use CSS to handle specific keyword colors on the inner span.
                }
                
                word.style.backgroundColor = bgColor;
                
                // Text reveal
                const textRevealThreshold = 0.9;
                const textRevealProgress = wordProgress >= textRevealThreshold ? (wordProgress - textRevealThreshold) / (1 - textRevealThreshold) : 0;
                wordText.style.opacity = Math.pow(textRevealProgress, 0.5);
            });
        }
    });

    return () => {
        st.kill();
    };
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={`animated-body-text ${className}`}
      style={style}
      suppressHydrationWarning
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedBodyText;
