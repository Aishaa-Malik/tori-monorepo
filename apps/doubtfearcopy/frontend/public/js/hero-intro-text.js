(function() {
  // Simple DOMContentLoaded ensures page is ready
  document.addEventListener("DOMContentLoaded", function() {
    try {
      // Check if libraries are loaded
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error("GSAP or ScrollTrigger not loaded. Check CDN links in HTML.");
        return;
      }

      console.log("Hero intro text animations initializing...");
      
      // Register plugin
      gsap.registerPlugin(ScrollTrigger);
      
      // Apply styles to hero section elements
      gsap.set(".hero-section-home", {
        backgroundColor: "rgb(20, 20, 20)",
        padding: "24px",
        height: "100vh",
        width: "100vw",
        margin: "0px",
        top: "0px",
        left: "0px",
        position: "fixed",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        zIndex: 100
      });
      
      gsap.set(".hero-header-home", {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 1,
        zIndex: 10,
        width: "100%",
        textAlign: "center"
      });
      
      gsap.set(".hero-animated-icons", {
        position: "fixed",
        bottom: "1rem",
        left: "1rem",
        right: "1rem",
        width: "auto",
        height: "auto",
        opacity: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        zIndex: 2
      });
      
      // Apply styles to hero text segments
      gsap.set(".hero-text-segment", {
        opacity: 0,
        y: 20
      });
      
      gsap.set(".hero-text-segment-2", {
        opacity: 0,
        y: 20
      });
      
      // Animate hero text segments in
      gsap.to(".hero-text-segment", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5
      });
      
      gsap.to(".hero-text-segment-2", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 1
      });

      // REMOVED: Lenis initialization
      // Lenis is already initialized globally in lenis-scroll.js
      // No need to create another instance here
      
      console.log("Hero intro text animations initialized successfully");
    } catch (error) {
      console.error("Error in hero intro text animations:", error);
    }
  });
})();
