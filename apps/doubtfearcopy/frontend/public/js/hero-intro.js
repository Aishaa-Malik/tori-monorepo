// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
 

  // At the top of each JS file that needs these libraries
  const { gsap, ScrollTrigger } = window;
  const THREE = window.THREE;
  const VANTA = window.VANTA;
 gsap.registerPlugin(ScrollTrigger);
  // Then use them normally
  gsap.to(".element", { opacity: 1 });

  // const lenis = new Lenis();
  // lenis.on("scroll", ScrollTrigger.update);
  // gsap.ticker.add((time) => {
  //   lenis.raf(time * 1000);
  // });
  // gsap.ticker.lagSmoothing(0);

  // Use null checks to prevent errors when elements don't exist
  const animatedIcons = document.querySelector(".hero-animated-icons") || document.createElement("div");
  const iconElements = document.querySelectorAll(".hero-animated-icon") || [];
  const textSegments = document.querySelectorAll(".hero-text-segment") || [];
  const placeholders = document.querySelectorAll(".hero-placeholder-icon") || [];
  const heroHeader = document.querySelector(".hero-header-home") || document.createElement("div");
  const heroSection = document.querySelector(".hero-section-home") || document.createElement("div");

  const textAnimationOrder = [];
  textSegments.forEach((segment, index) => {
    textAnimationOrder.push({ segment, originalIndex: index });
  });

  for (let i = textAnimationOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [textAnimationOrder[i], textAnimationOrder[j]] = [
      textAnimationOrder[j],
      textAnimationOrder[i],
    ];
  }

  const isMobile = window.innerWidth <= 1000;
  const headerIconSize = isMobile ? 30 : 60;
  // Add safety check for iconElements length
  const currentIconSize = iconElements.length > 0 ? iconElements[0].getBoundingClientRect().width : 50;
  const exactScale = headerIconSize / currentIconSize;

  // Check if the hero section exists before creating ScrollTrigger
  if (document.querySelector(".hero-section-home")) {
    ScrollTrigger.create({
      trigger: ".hero-section-home",
      start: "top top",
      end: `+=${window.innerHeight * 4}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

      // Phase 1: Text fade out (0 - 0.25)
      if (progress <= 0.25) {
        const fadeProgress = progress / 0.25;
        
        // Fade out the main title and subtitle
        gsap.set(".hero-header-home h1", {
          opacity: 1 - fadeProgress,
          y: -50 * fadeProgress
        });
        
        gsap.set(".hero-header-home p", {
          opacity: 1 - fadeProgress,
          y: -30 * fadeProgress
        });

        // Keep icons at bottom
        gsap.set(animatedIcons, {
          position: "fixed",
          bottom: "1rem",
          left: "1rem",
          right: "1rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          opacity: 1,
          scale: 1,
          y: 0
        });

      } 
      // Phase 2: Icons move up and scale down (0.25 - 0.75)
      else if (progress <= 0.75) {
        const moveProgress = (progress - 0.25) / 0.5;
        
        // Hide text completely
        gsap.set(".hero-header-home h1", { opacity: 0 });
        gsap.set(".hero-header-home p", { opacity: 0 });

        // Move icons to center and scale down
        const targetY = -window.innerHeight * 0.3 * moveProgress;
        const targetScale = 1 - (moveProgress * 0.7); // Scale from 1 to 0.3
        
        gsap.set(animatedIcons, {
          position: "fixed",
          bottom: "auto",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, calc(-50% + ${targetY}px))`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          opacity: 1,
          scale: targetScale
        });

      } 
      // Phase 3: Icons fade out (0.75 - 1.0)
      else {
        const fadeProgress = (progress - 0.75) / 0.25;
        
        // Hide text completely
        gsap.set(".hero-header-home h1", { opacity: 0 });
        gsap.set(".hero-header-home p", { opacity: 0 });

        // Fade out icons
        gsap.set(animatedIcons, {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          opacity: 1 - fadeProgress,
          scale: 0.3
        });
      }
    },
  });
}
});




// INTRO SECTION -->

