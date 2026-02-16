"use client";
import "./Spotlight.css";

import { useEffect, useRef, useState } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Spotlight = () => {
  const spotlightRef = useRef(null);
  const introTextElementsRef = useRef([]);
  const scrollTriggerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
const vimeoSrc = "https://www.youtube.com/embed/6jca6cMROy8?autoplay=1&mute=1&loop=1&playlist=6jca6cMROy8&controls=0&modestbranding=1&rel=0";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Add initialized class after mount
    if (spotlightRef.current) {
      spotlightRef.current.classList.add("is-initialized");
    }

    const introTextElements = introTextElementsRef.current;

    if (!introTextElements[0] || !introTextElements[1]) {
      return;
    }

    // FIXED: Prevent scroll jumping with proper state management
    let hasReachedFullScreen = false;
    
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: ".spotlight",
      start: window.innerWidth < 768 ? "0% 0%" : "top top", // Force 0% for mobile
      end: window.innerWidth < 768 ? "+=100%" : "+=100%", // Limit mobile height
      pin: true,
      pinSpacing: window.innerWidth < 768 ? false : true, // Disable pin spacing on mobile to prevent jump
      immediateRender: true, // Prevent layout jump
      refreshPriority: 1, // Ensures this calculates after other elements
      onRefresh: (self) => {
        if (window.innerWidth < 768 && self.spacer) {
          // Forcefully wipe out the height GSAP just calculated 
          self.spacer.style.setProperty('height', '100vh', 'important');
          self.spacer.style.setProperty('padding-bottom', '0', 'important');
          self.spacer.style.setProperty('margin-bottom', '0', 'important');
        }
      },
      scrub: 1,
      anticipatePin: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        if (progress <= 0.5) {
          const animationProgress = progress / 0.5;
          const moveDistance = window.innerWidth * 0.6;
          
          gsap.set(introTextElements[0], {
            x: -animationProgress * moveDistance,
            opacity: 1
          });
          gsap.set(introTextElements[1], {
            x: animationProgress * moveDistance,
            opacity: 1
          });

          // Scale video smoothly to full screen
          gsap.set(".spotlight-video", {
            transform: `scale(${animationProgress})`,
          });
          
          hasReachedFullScreen = false;
        } else {
          const fadeProgress = (progress - 0.5) / 0.5;
          
          gsap.set(introTextElements[0], {
            opacity: 1 - fadeProgress
          });
          gsap.set(introTextElements[1], {
            opacity: 1 - fadeProgress
          });

          // CRITICAL FIX: Maintain full screen scale without recalculation
          if (!hasReachedFullScreen) {
            gsap.set(".spotlight-video", {
              transform: `scale(1)`,
            });
            hasReachedFullScreen = true;
          }
        }
      }
    });

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, []);

  // Video player controls
  const togglePlayPause = () => {
    const iframe = videoRef.current;
    if (iframe) {
      if (isPlaying) {
        iframe.contentWindow.postMessage('{"method":"pause"}', '*');
      } else {
        iframe.contentWindow.postMessage('{"method":"play"}', '*');
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const iframe = videoRef.current;
    if (iframe) {
      if (isMuted) {
        iframe.contentWindow.postMessage('{"method":"setVolume","value":1}', '*');
      } else {
        iframe.contentWindow.postMessage('{"method":"setVolume","value":0}', '*');
      }
      setIsMuted(!isMuted);
    }
  };

  const restartVideo = () => {
    const iframe = videoRef.current;
    if (iframe) {
      iframe.contentWindow.postMessage('{"method":"setCurrentTime","value":0}', '*');
      iframe.contentWindow.postMessage('{"method":"play"}', '*');
      setIsPlaying(true);
    }
  };

  const handleVideoHover = () => {
    setShowControls(true);
  };

  const handleVideoLeave = () => {
    setShowControls(false);
  };

  return (
    <section className="spotlight" ref={spotlightRef}>
      <div className="spotlight-inner">
        <div className="spotlight-intro-text-wrapper">
          <div
            className="spotlight-intro-text"
            ref={(el) => (introTextElementsRef.current[0] = el)}
          >
            <p>Watch</p>
          </div>
          <div
            className="spotlight-intro-text"
            ref={(el) => (introTextElementsRef.current[1] = el)}
          >
            <p>Film</p>
          </div>
        </div>
        <div 
          className="spotlight-video" 
          onMouseEnter={handleVideoHover}
          onMouseLeave={handleVideoLeave}
        >
          <iframe
            ref={videoRef}
            src={vimeoSrc}
            className="demo-video"
            title="SaaS demo video"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
          
          <div className={`video-controls ${showControls ? 'visible' : ''}`}>
            <button className="control-btn play-pause" onClick={togglePlayPause}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button className="control-btn mute-unmute" onClick={toggleMute}>
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button className="control-btn restart" onClick={restartVideo}>
              🔄
            </button>
          </div>
        </div>
      </div>
      <div className="spotlight-outline"></div>
    </section>
  );
};

export default Spotlight;
