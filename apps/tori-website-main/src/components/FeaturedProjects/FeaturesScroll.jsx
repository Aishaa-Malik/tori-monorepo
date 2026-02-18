"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './FeaturesScroll.css';

const FeaturesScroll = () => {
  const stickyRef = useRef(null);
  const cardsRef = useRef(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    const stickySection = stickyRef.current;
    const cards = cardsRef.current;

    if (!stickySection || !cards) {
      console.error("❌ Features elements not found");
      return;
    }

    // ✅ Set initial position
    gsap.set(cards, { x: 0 });

    // Calculate scroll distance
    const cardWidth = cards.scrollWidth;
    const containerWidth = stickySection.offsetWidth;
    const maxTranslateX = -(cardWidth - containerWidth);

    console.log("✅ Features setup:", { cardWidth, containerWidth, maxTranslateX });

    // ✅ Wait for page to be ready before creating ScrollTrigger
    setTimeout(() => {
      const tween = gsap.to(cards, {
        x: maxTranslateX,
        ease: "none",
        scrollTrigger: {
          trigger: stickySection,
          start: "top top", // ✅ Only starts when section is at top
          end: () => `+=${Math.abs(maxTranslateX) * 2}`, // Dynamic based on content width
          pin: true,
          pinSpacing: true,
          scrub: 1,
          markers: false,
          id: "features-horizontal-scroll",
          invalidateOnRefresh: true,
          onEnter: () => {
            console.log("📍 Features scroll started");
            gsap.set(cards, { x: 0 }); // ✅ Ensure reset on enter
          },
          onLeave: () => {
            console.log("📍 Features scroll ended");
          },
          onEnterBack: () => {
            console.log("📍 Features scroll re-entered (scrolling up)");
          }
        }
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, 100); // ✅ Small delay to ensure ProcessAnimation is complete

  }, { scope: stickyRef });

  return (
    <div className="features-sticky" ref={stickyRef}>
      <div className="features-bg-img">
        <canvas className="outline-layer"></canvas>
        <canvas className="fill-layer"></canvas>
      </div>
      
      <div className="features-cards" ref={cardsRef}>
        <div className="features-card">
          <div className="features-card-img">
            <img src="/images/2ndpara.png" alt="Book appointments in 10 seconds" />
          </div>
          <div className="features-card-title">
            <p>THE PROBLEM SOLVER</p>
            <h1>Book Appointments In 10 Seconds</h1>
          </div>
        </div>

        <div className="features-card">
          <div className="features-card-img">
            <img src="/images/Nobody Deletes.png" alt="Built for WhatsApp" />
          </div>
          <div className="features-card-title">
            <p>CUSTOMERS ALREADY HAVE IT</p>
            <h1>Built For WhatsApp</h1>
          </div>
        </div>

        <div className="features-card">
          <div className="features-card-img">
            <img src="/images/24-7 Support.png" alt="24/7 Support" />
          </div>
          <div className="features-card-title">
            <p>CUSTOMER SATISFACTION GUARANTEED</p>
            <h1>99.9% Uptime + 24/7 Support</h1>
          </div>
        </div>

        <div className="features-card">
          <div className="features-card-img">
            <img src="/images/INSTANT CONFIRMATION & REMINDER.png" alt="Instant confirmation" />
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

export default FeaturesScroll;
