"use client"; 
import React, { useRef } from 'react'; 
import gsap from 'gsap'; 
import { ScrollTrigger } from 'gsap/ScrollTrigger'; 
import { useGSAP } from '@gsap/react'; 
import Lenis from 'lenis'; 
import './ProcessAnimation.css'; 

const ProcessAnimation = () => { 
  const containerRef = useRef(null); 
  const textRef = useRef(null); 

  useGSAP(() => { 
    gsap.registerPlugin(ScrollTrigger); 

    // 2. Constants & Processing 
    const wordHighlightBgColor = "60, 60, 60"; 
    const keywords = [
      "for", "clunky"
    ];

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

    // 3. Exact Animation Math from script.js 
    const container = containerRef.current; 
    const allWords = Array.from(container.querySelectorAll(".word")); 
    const totalWords = allWords.length; 

    ScrollTrigger.create({ 
      trigger: container, 
      pin: container, 
      start: "top top", 
      end: `+=${window.innerHeight * 4}`, 
      pinSpacing: true, 
      onUpdate: (self) => { 
        const progress = self.progress; 

        allWords.forEach((word, index) => { 
          const wordText = word.querySelector("span"); 

          if (progress <= 0.7) { 
            const progressTarget = 0.7; 
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

            word.style.opacity = wordProgress; 
            const backgroundFadeStart = wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0; 
            const backgroundOpacity = Math.max(0, 1 - backgroundFadeStart); 
            word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`; 

            const textRevealThreshold = 0.9; 
            const textRevealProgress = wordProgress >= textRevealThreshold ? (wordProgress - textRevealThreshold) / (1 - textRevealThreshold) : 0; 
            wordText.style.opacity = Math.pow(textRevealProgress, 0.5); 
          } else { 
            const reverseProgress = (progress - 0.7) / 0.3; 
            word.style.opacity = 1; 
            const reverseOverlapWords = 5; 
            const reverseWordStart = index / totalWords; 
            const reverseWordEnd = reverseWordStart + reverseOverlapWords / totalWords; 

            const reverseTimelineScale = 1 / Math.max(1, (totalWords - 1) / totalWords + reverseOverlapWords / totalWords); 
            const reverseAdjustedStart = reverseWordStart * reverseTimelineScale; 
            const reverseAdjustedEnd = reverseWordEnd * reverseTimelineScale; 
            const reverseDuration = reverseAdjustedEnd - reverseAdjustedStart; 

            const reverseWordProgress = reverseProgress <= reverseAdjustedStart ? 0 : reverseProgress >= reverseAdjustedEnd ? 1 : (reverseProgress - reverseAdjustedStart) / reverseDuration; 

            if (reverseWordProgress > 0) { 
              wordText.style.opacity = 1 - reverseWordProgress; 
              word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${reverseWordProgress})`; 
            } else { 
              wordText.style.opacity = 1; 
              word.style.backgroundColor = `rgba(${wordHighlightBgColor}, 0)`; 
            } 
          } 
        }); 
      }, 
    }); 

    return () => lenis.destroy(); 
  }, { scope: containerRef }); 

  return ( 
    <section className="process-section process-animation-container" ref={containerRef}> 
      <div className="process-copy-wrapper"> 
        <div className="process-text-content" ref={textRef}> 
          <p> 
             Tori is 'YOUR 24/7 RECEPTIONIST'—an AI WHATSAPP SESSION BOOKING &
             front-desk AUTOMATION platform that replaces Clunky Forms with an Instant 
             Chat Experience, allowing businesses to lock in Bookings in 10 seconds flat.
          </p> 
          {/* <p> 
            We believe great design starts with clarity and expression ends. 
            That's why Huebase is built to simplify your workflow while 
            amplifying your creative reach. From the first concept to the final 
            handoff, it's a space where your ideas take shape and more, your 
            palette comes to life, and your interface begins. 
          </p>  */}
        </div> 
      </div> 
    </section> 
  ); 
}; 

export default ProcessAnimation;