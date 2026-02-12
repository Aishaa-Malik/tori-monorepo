// import Lenis from "lenis";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";


// /js/hero.js
// Use global variables directly without redeclaration
// Register ScrollTrigger plugin if not already registered
if (window.gsap && window.ScrollTrigger && !window.ScrollTrigger.isRegistered) {
  window.gsap.registerPlugin(window.ScrollTrigger);
}

// Your animation code
if (window.gsap && window.ScrollTrigger) {
  window.gsap.to(".magnetic-hover", {
    opacity: 1,
    duration: 2,
    scrollTrigger: ".magnetic-hover"
  });
}



//gsap.registerPlugin(ScrollTrigger);



document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth >= 900) {
    const videoContainer = document.querySelector(".hero-img");

    // Add null check for videoContainer
    if (!videoContainer) {
      console.warn("⚠️ .hero-img element not found. Magnetic hover animation will not work.");
      return;
    }

    // Lenis removed: rely on native scroll behavior
    gsap.ticker.lagSmoothing(0);

    const breakpoints = [
      { maxWidth: 1000, translateY: -135, movMultiplier: 450 },
      { maxWidth: 1100, translateY: -130, movMultiplier: 500 },
      { maxWidth: 1200, translateY: -125, movMultiplier: 550 },
      { maxWidth: 1300, translateY: -120, movMultiplier: 600 },
    ];

    const getInitialValues = () => {
      const width = window.innerWidth;

      for (const bp of breakpoints) {
        if (width <= bp.maxWidth) {
          return {
            translateY: bp.translateY,
            movementMultiplier: bp.movMultiplier,
          };
        }
      }

      return {
        translateY: -105,
        movementMultiplier: 650,
      };
    };

    const initialValues = getInitialValues();

    const animationState = {
      scrollProgress: 0,
      initialTranslateY: initialValues.translateY,
      currentTranslateY: initialValues.translateY,
      movementMultiplier: initialValues.movementMultiplier,
      scale: 0.25,
      fontSize: 80,
      gap: 2,
      targetMouseX: 0,
      currentMouseX: 0,
    };


    document.addEventListener("mousemove", (e) => {
      animationState.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    });

    const animate = () => {
      if (window.innerWidth < 900) return;
      
      // Add null check for videoContainer before accessing style
      if (!videoContainer) {
        console.warn("⚠️ videoContainer is null, stopping animation");
        return;
      }

      const {
        scale,
        targetMouseX,
        currentMouseX,
        currentTranslateY,
        fontSize,
        gap,
        movementMultiplier,
      } = animationState;

      const scaledMovementMultiplier = (1 - scale) * movementMultiplier;

      const maxHorizontalMovement =
        scale < 0.95 ? targetMouseX * scaledMovementMultiplier : 0;

      animationState.currentMouseX = gsap.utils.interpolate(
        currentMouseX,
        maxHorizontalMovement,
        0.05
      );

      videoContainer.style.transform = `translateY(${currentTranslateY}%) translateX(${animationState.currentMouseX}px) scale(${scale})`;

      videoContainer.style.gap = `${gap}em`;



      requestAnimationFrame(animate);
    };

    animate();
  }
});
