"use client";
import "./TopBar.css";

import { useRef, useEffect } from "react";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { useViewTransition } from "@/hooks/useViewTransition";
import AnimatedButton from "../AnimatedButton/AnimatedButton";
import AnimatedButton2 from "../AnimatedButton2/AnimatedButton2";

gsap.registerPlugin(ScrollTrigger);

const TopBar = () => {
  const topBarRef = useRef(null);
  const logoRef = useRef(null);
  const ctaRef = useRef(null);
  const { navigateWithTransition } = useViewTransition();

  // Scroll Progress Animation for Nav Links
  useGSAP(() => {
    const links = gsap.utils.toArray(".nav-link");
    
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      
      const sectionId = href.substring(1);
      const section = document.getElementById(sectionId);
      const navText = link.querySelector(".nav-text");
      
      if (section) {
        // Create scroll trigger for each section linked to the nav item
        // We animate both the link background and the text background synchronously
        
        // 1. Animate Link Background (White Fill)
        gsap.fromTo(
          link,
          {
            backgroundPosition: "100.5% 0", // Start Transparent
          },
          {
            backgroundPosition: "0% 0",   // End White
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",    
              end: "bottom top",   
              scrub: true,
              refreshPriority: -1, // Ensure this calculates AFTER layout-shifting pins (like Spotlight/Pricing)
            },
          }
        );
        
        // 2. Animate Text Color (via background-clip)
        if (navText) {
          gsap.fromTo(
            navText,
            {
              backgroundPosition: "100.5% 0", // Start White text
            },
            {
              backgroundPosition: "0% 0",   // End Black text
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top top",    
                end: "bottom top",   
                scrub: true,
                refreshPriority: -1, // Ensure this calculates AFTER layout-shifting pins
              },
            }
          );
        }
      }
    });
  }, { scope: topBarRef, dependencies: [] });

  
  // Restore scroll animation for Logo and CTA sections
  useEffect(() => {
    // We animate logo and CTA, but NOT the middle nav (which stays fixed/visible)
    const logo = logoRef.current;
    const cta = ctaRef.current;
    const topBar = topBarRef.current; // Use this for height reference if needed
    
    if (!logo || !cta || !topBar) return;
    
    // Initial state
    gsap.set([logo, cta], { y: 0 });
    
    let lastScrollY = 0;
    let isScrolling = false;
    const topBarHeight = topBar.offsetHeight;
    
    const handleScroll = () => {
      if (isScrolling) return;
      
      isScrolling = true;
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 1 : -1;
      
      // If scrolling down (> 50px), hide logo and CTA (move them up)
      if (direction === 1 && currentScrollY > 50) {
        gsap.to([logo, cta], {
          y: -topBarHeight * 2, // Move up enough to hide
          duration: 0.5,
          ease: "power2.out",
        });
      } 
      // If scrolling up, show them
      else if (direction === -1) {
        gsap.to([logo, cta], {
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }
      
      lastScrollY = currentScrollY;
      
      setTimeout(() => {
        isScrolling = false;
      }, 100);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="top-bar" ref={topBarRef}>
      <div className="top-bar-logo" ref={logoRef}>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateWithTransition("/");
          }}
        >
          <img src="/images/logo.png" alt="" />
        </a>
      </div>
      
      <div className="top-bar-nav">
        <div className="nav-pill">
          <a href="#features" className="nav-link"><span className="nav-text">Features</span></a>
          <a href="#process" className="nav-link"><span className="nav-text">Process</span></a>
          <a href="#pricing-card" className="nav-link"><span className="nav-text">Pricing</span></a>
          <a href="#testimonials" className="nav-link"><span className="nav-text">Testimonials</span></a>
          <a href="#faq" className="nav-link"><span className="nav-text">FAQ</span></a>
          <a href="#about-us" className="nav-link"><span className="nav-text">About us</span></a>
          <a href="#contact" className="nav-link"><span className="nav-text">Contact us</span></a>
        </div>
      </div>
      
      <div className="top-bar-cta" ref={ctaRef}>
        <AnimatedButton2 label="Login" route="/connect" animate={false} bgColor="orange" className="login-btn" />
        <AnimatedButton label="Book ANY SERVICE IN 10 SEC" route="/connect" animate={false} />
      </div>
    </div>
  );
};

export default TopBar;
