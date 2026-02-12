console.log("=== FEATURES.JS STARTING ===");

let isInitialized = false; // Prevent multiple initializations
let retryCount = 0;
const maxRetries = 10;

function initializeFeatures() {
  if (isInitialized) {
    console.log("⚠️ Features already initialized, skipping...");
    return;
  }
  
  console.log(`🚀 Initializing features (attempt ${retryCount + 1}/${maxRetries})`);
  
  // Debug: Check what's available
  console.log("window.gsap available:", !!window.gsap);
  console.log("window.ScrollTrigger available:", !!window.ScrollTrigger);
  console.log("Document ready state:", document.readyState);
  
  // Wait for GSAP to be fully loaded and check global access
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    console.error("❌ GSAP or ScrollTrigger not loaded. Check CDN links in HTML.");
    console.log("Available on window:", Object.keys(window).filter(key => key.toLowerCase().includes('gsap') || key.toLowerCase().includes('scroll')));
    
    if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(initializeFeatures, 1000);
    }
    return;
  }
  
  // Use global variables directly like other working files
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  
  console.log("Direct gsap access:", !!gsap);
  console.log("Direct ScrollTrigger access:", !!ScrollTrigger);
  
  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  console.log("✅ ScrollTrigger registered successfully");
  
  // Find elements with detailed logging
  console.log("🔍 Looking for elements...");
  const stickySection = document.querySelector(".features-sticky");
  const cards = document.querySelector(".features-cards");
  
  console.log("Sticky section found:", !!stickySection);
  console.log("Cards found:", !!cards);
  
  if (stickySection) {
    console.log("Sticky section dimensions:", {
      width: stickySection.offsetWidth,
      height: stickySection.offsetHeight,
      top: stickySection.offsetTop
    });
  }
  
  if (cards) {
    console.log("Cards dimensions:", {
      width: cards.offsetWidth,
      height: cards.offsetHeight,
      childCount: cards.children.length
    });
  }
  
  if (!stickySection || !cards) {
    console.error("❌ Required elements not found:", 
      !stickySection ? "features-sticky missing" : "", 
      !cards ? "features-cards missing" : "");
    
    // Try again with exponential backoff if elements not found
    if (retryCount < maxRetries) {
      retryCount++;
      const delay = Math.min(1000 * Math.pow(1.5, retryCount), 5000);
      console.log(`⏳ Retrying in ${delay}ms...`);
      setTimeout(initializeFeatures, delay);
    } else {
      console.error("❌ Max retries reached. Features animation will not work.");
    }
    return;
  }
  
  console.log("✅ Found required elements");
  
  // Clean up any existing ScrollTriggers for this section
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.trigger === stickySection) {
      console.log("🧹 Cleaning up existing ScrollTrigger");
      trigger.kill();
    }
  });
  
  // Remove any inline styles that might be interfering
  cards.removeAttribute("style");
  console.log("🧹 Removed inline styles from cards");
  
  // Set initial position
  gsap.set(cards, { x: 0 });
  
  // Calculate the total scroll distance needed
  const cardWidth = cards.scrollWidth;
  const containerWidth = stickySection.offsetWidth;
  const maxTranslateX = -(cardWidth - containerWidth);
  
  console.log("Animation setup:", {
    cardWidth,
    containerWidth,
    maxTranslateX
  });
  
  // Create ScrollTrigger with proper bounds
  const trigger = ScrollTrigger.create({
    trigger: stickySection,
    start: "top top",
    end: () => `+=${window.innerHeight * 4}px`, // Adjust scroll distance
    pin: true,
    pinSpacing: true,
    scrub: 1,
    markers: false, // Remove markers for production
    onEnter: () => {
      console.log("📍 ScrollTrigger entered");
    },
    onLeave: () => {
      console.log("📍 ScrollTrigger left");
    },
    onUpdate: (self) => {
      // Ensure progress is between 0 and 1
      const progress = Math.max(0, Math.min(1, self.progress));
      
      // Calculate translateX with proper bounds
      const translateX = Math.max(maxTranslateX, progress * maxTranslateX);
      
      // Use GSAP for smooth animation
      gsap.set(cards, { x: translateX });
      
      // Only log occasionally to avoid spam
      if (Math.floor(progress * 100) % 10 === 0) {
        console.log(`📊 Progress: ${progress.toFixed(3)}, TranslateX: ${translateX.toFixed(2)}px`);
      }
    }
  });
  
  console.log("✅ ScrollTrigger created:", trigger);
  isInitialized = true;
  console.log("=== FEATURES.JS SETUP COMPLETE ===");
}

// Use MutationObserver to watch for DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      // Check if features elements were added
      const addedNodes = Array.from(mutation.addedNodes);
      const hasFeatures = addedNodes.some(node => 
        node.nodeType === Node.ELEMENT_NODE && 
        (node.querySelector?.('.features-sticky') || node.classList?.contains('features-sticky'))
      );
      
      if (hasFeatures && !isInitialized) {
        console.log("🔍 Features elements detected via MutationObserver");
        // Small delay to ensure elements are fully rendered
        setTimeout(initializeFeatures, 100);
      }
    }
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Fallback initialization strategies
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeFeatures, 500);
  });
} else {
  // Try immediately
  setTimeout(initializeFeatures, 100);
}

// Additional fallback for when window loads
window.addEventListener('load', () => {
  if (!isInitialized) {
    console.log("🔄 Window load event - trying features initialization");
    setTimeout(initializeFeatures, 1000);
  }
});
