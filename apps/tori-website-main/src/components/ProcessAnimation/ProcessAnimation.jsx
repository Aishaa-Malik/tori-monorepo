"use client"; 
import React, { useRef } from 'react'; 
import gsap from 'gsap'; 
import { ScrollTrigger } from 'gsap/ScrollTrigger'; 
import { useGSAP } from '@gsap/react'; 
import './ProcessAnimation.css'; 

const ProcessAnimation = () => { 
  const containerRef = useRef(null); 
  const textRef = useRef(null); 

  useGSAP(() => { 
    gsap.registerPlugin(ScrollTrigger); 

    // Constants & Processing 
    const wordHighlightBgColor = "60, 60, 60"; 
    const keywords = ["for", "clunky"];

    const paragraphs = textRef.current.querySelectorAll("p"); 
    paragraphs.forEach((paragraph) => { 
      const text = paragraph.textContent; 
      const words = text.split(/\s+/); 
      paragraph.innerHTML = ""; 

      words.forEach((word) => { 
        if (word.trim()) { 
          const wordContainer = document.createElement("div"); 
          wordContainer.className = "word"; 
          const wordText = document.createElement("span"); 
          wordText.textContent = word; 

          const normalizedWord = word.toLowerCase().replace(/[.,!?;:"]/g, ""); 
          if (keywords.includes(normalizedWord)) { 
            wordContainer.classList.add("keyword-wrapper"); 
            wordText.classList.add("keyword", normalizedWord); 
          } 

          wordContainer.appendChild(wordText); 
          paragraph.appendChild(wordContainer); 
        } 
      }); 
    }); 

    // Animation Setup
    const container = containerRef.current; 
    const allWords = Array.from(container.querySelectorAll(".word")); 
    const totalWords = allWords.length; 

    const st = ScrollTrigger.create({ 
      trigger: container, 
      pin: true,
      start: "top top",
      end: `+=${window.innerHeight * 2.5}`,
      scrub: true,
      pinSpacing: true,
      anticipatePin: 1,
      markers: false,
      invalidateOnRefresh: true,
      
      onUpdate: (self) => { 
  const progress = self.progress; 

  allWords.forEach((word, index) => { 
    const wordText = word.querySelector("span"); 

    if (progress <= 0.7) { 
      // REVEAL PHASE (0% → 70%)
      const progressTarget = 0.55; 
      const revealProgress = Math.min(1, progress / progressTarget); 
      const overlapWords = 15; 
      const totalAnimationLength = 1 + overlapWords / totalWords; 
      const wordStart = index / totalWords; 
      const wordEnd = wordStart + overlapWords / totalWords; 

      const timelineScale = 1 / Math.min(totalAnimationLength, 1 + (totalWords - 1) / totalWords + overlapWords / totalWords); 
      const adjustedStart = wordStart * timelineScale; 
      const adjustedEnd = wordEnd * timelineScale; 
      const duration = adjustedEnd - adjustedStart; 

      const wordProgress = revealProgress <= adjustedStart ? 0 : revealProgress >= adjustedEnd ? 1 : (revealProgress - adjustedStart) / duration; 

      // ✅ Keep visible by default, highlight on progress
      word.style.opacity = 0.3 + (wordProgress * 0.7); // Fade from 30% to 100%
      
      // Background highlight
      const backgroundOpacity = wordProgress < 0.9 ? wordProgress * 0.3 : (1 - (wordProgress - 0.9) / 0.1) * 0.3;
      word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`; 

      // Text fully visible
      wordText.style.opacity = 1;
      
    } else { 
      // REVERSE PHASE (70% → 100%)
      const reverseProgress = (progress - 0.7) / 0.3; 
      
      const reverseOverlapWords = 5; 
      const reverseWordStart = index / totalWords; 
      const reverseWordEnd = reverseWordStart + reverseOverlapWords / totalWords; 

      const reverseTimelineScale = 1 / Math.max(1, (totalWords - 1) / totalWords + reverseOverlapWords / totalWords); 
      const reverseAdjustedStart = reverseWordStart * reverseTimelineScale; 
      const reverseAdjustedEnd = reverseWordEnd * reverseTimelineScale; 
      const reverseDuration = reverseAdjustedEnd - reverseAdjustedStart; 

      const reverseWordProgress = reverseProgress <= reverseAdjustedStart ? 0 : reverseProgress >= reverseAdjustedEnd ? 1 : (reverseProgress - reverseAdjustedStart) / reverseDuration; 

      if (reverseWordProgress > 0) { 
        word.style.opacity = 1 - (reverseWordProgress * 0.7); // Fade from 100% to 30%
        wordText.style.opacity = 1 - reverseWordProgress; 
        word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${reverseWordProgress * 0.3})`; 
      } else { 
        word.style.opacity = 1; 
        wordText.style.opacity = 1; 
        word.style.backgroundColor = `rgba(${wordHighlightBgColor}, 0)`; 
      } 
    } 
  }); 
},

      
      onLeave: () => {
        ScrollTrigger.refresh();
      }
    }); 

    return () => {
      st.kill();
    }; 
  }, { scope: containerRef }); 

  return ( 
    <section className="process-section process-animation-container" ref={containerRef}> 
      <div className="process-copy-wrapper"> 
        <div className="process-text-content" ref={textRef}> 
          <p> 
            Tori is 'YOUR 24/7 RECEPTIONIST'—an AI WHATSAPP SESSION BOOKING &
            front-desk AUTOMATION platform that replaces for clunky Forms with an Instant 
            Chat Experience, allowing businesses to lock in Bookings in 10 seconds flat.
          </p> 
        </div> 
      </div> 
    </section> 
  ); 
}; 

export default ProcessAnimation;
