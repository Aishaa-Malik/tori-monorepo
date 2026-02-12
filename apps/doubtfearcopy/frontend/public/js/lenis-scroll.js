document.addEventListener("DOMContentLoaded", () => {
  // Lenis removed: use native scrolling and GSAP ScrollTrigger only
  const { gsap, ScrollTrigger } = window;
  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Optional: enable CSS smooth scrolling globally
  try {
    document.documentElement.style.scrollBehavior = "smooth";
  } catch (e) {}

  console.log("Lenis disabled: using native scrolling with ScrollTrigger.");
});




