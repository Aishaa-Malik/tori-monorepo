"use client";
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './features.css';

const FeaturedProjects = () => {
  const stickyRef = useRef(null);
  const cardsRef = useRef(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    const stickySection = stickyRef.current;
    const cards = cardsRef.current;

    if (!stickySection || !cards) {
      console.error("❌ Elements not found");
      return;
    }

    // Calculate scroll distance
    const cardWidth = cards.scrollWidth;
    const containerWidth = stickySection.offsetWidth;
    const maxTranslateX = -(cardWidth - containerWidth);

    console.log("✅ Features animation setup:", { cardWidth, containerWidth, maxTranslateX });

    // Create animation
    const tween = gsap.to(cards, {
      x: maxTranslateX,
      ease: "none",
      scrollTrigger: {
        trigger: stickySection,
        start: "top top",
        end: () => `+=${window.innerHeight * 4}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        markers: false,
        invalidateOnRefresh: true,
        onEnter: () => console.log("📍 Features entered"),
        onLeave: () => console.log("📍 Features left"),
      }
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, { scope: stickyRef, dependencies: [] });

  return (
    <div className="features-sticky" ref={stickyRef}>
      <div className="features-bg-img">
        <canvas className="outline-layer"></canvas>
        <canvas className="fill-layer"></canvas>
      </div>
      
      <div className="features-cards" ref={cardsRef}>
        {/* Your feature cards here */}
        <div className="features-card">
          <div className="features-card-img">
            <img src="/images/2ndpara.png" alt="Feature 1" />
          </div>
          <div className="features-card-title">
            <p>THE PROBLEM SOLVER</p>
            <h1>Book Appointments In 10 Seconds</h1>
          </div>
        </div>

        <div className="features-card">
          <div className="features-card-img">
            <img src="/images/Nobody Deletes.png" alt="Feature 2" />
          </div>
          <div className="features-card-title">
            <p>CUSTOMERS ALREADY HAVE IT</p>
            <h1>Built For WhatsApp</h1>
          </div>
        </div>

        <div className="features-card">
          <div className="features-card-img">
            <img src="/images/24-7 Support.png" alt="Feature 3" />
          </div>
          <div className="features-card-title">
            <p>CUSTOMER SATISFACTION GUARANTEED</p>
            <h1>99.9% Uptime + 24/7 Support</h1>
          </div>
        </div>

        <div className="features-card">
          <div className="features-card-img">
            <img src="/images/INSTANT CONFIRMATION & REMINDER.png" alt="Feature 4" />
          </div>
          <div className="features-card-title">
            <p>INSTANT CONFIRMATION & REMINDER</p>
            <h1>Automatic Payment + Updates</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProjects;
