(function() {
  // Simple DOMContentLoaded ensures page is ready
  document.addEventListener("DOMContentLoaded", function() {
    try {
      // Check if libraries are loaded
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error("GSAP or ScrollTrigger not loaded. Check CDN links in HTML.");
        return;
      }

      console.log("Hero animations initializing...");
      
      // Check if we're on the home page
      const isHomePage = document.querySelector(".hero-section-home");
      if (!isHomePage) {
        console.log("Not on home page, skipping hero animations");
        return;
      }

      // Register plugin
      gsap.registerPlugin(ScrollTrigger);
      
      // Apply initial styles to hero section
      gsap.set(".hero-section-home", {
        backgroundColor: "rgb(20, 20, 20)",
        translate: "none",
        rotate: "none",
        scale: "none",
        left: "0px",
        top: "0px",
        margin: "0px",
        maxWidth: "731px",
        width: "731px",
        maxHeight: "918px",
        height: "918px",
        padding: "24px",
        boxSizing: "border-box",
        position: "fixed",
        transform: "none"
      });
      
      // Apply styles to hero header
      gsap.set(".hero-header-home", {
        translate: "none",
        rotate: "none",
        scale: "none",
        transform: "translate(-50%, -50%)",
        opacity: 1,
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "100%"
      });
      
      // Apply styles to hero animated icons
      gsap.set(".hero-animated-icons", {
        translate: "none",
        rotate: "none",
        scale: "none",
        opacity: 1,
        transform: "none",
        position: "absolute",
        bottom: "24px",
        left: "24px",
        right: "24px",
        display: "flex",
        justifyContent: "space-between"
      });

      // Hero image animation
      const heroImg = document.querySelector(".hero-img img");
      if (heroImg) {
        let currentImageIndex = 1;
        const totalImages = 10;
        let scrollTriggerInstance = null;

        setInterval(() => {
          currentImageIndex = currentImageIndex >= totalImages ? 1 : currentImageIndex + 1;
          // heroImg.src = `/images/work-items/work-item-${currentImageIndex}.jpg`;
        }, 250);

        const initAnimations = () => {
          if (scrollTriggerInstance) {
            scrollTriggerInstance.kill();
          }

          scrollTriggerInstance = ScrollTrigger.create({
            trigger: ".hero-img-holder",
            start: "top bottom",
            end: "top top",
            scrub: true,
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.set(".hero-img", {
                y: `${-110 + 110 * progress}%`,
                scale: 0.25 + 0.75 * progress,
                rotation: -15 + 15 * progress,
              });
            },
          });
        };

        initAnimations();

        window.addEventListener("resize", () => {
          initAnimations();
        });
      }
      
      console.log("Hero animations initialized successfully");
    } catch (error) {
      console.error("Error in hero animations:", error);
    }
  });
})();
