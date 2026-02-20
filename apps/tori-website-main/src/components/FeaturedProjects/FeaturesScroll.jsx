"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './FeaturesScroll.css';

const FeaturesScroll = () => {
  const stickyRef = useRef(null);
  const cardsRef = useRef(null);
  const tweenRef = useRef(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    const stickySection = stickyRef.current;
    const cards = cardsRef.current;
    if (!stickySection || !cards) return;

    // Kill any existing trigger with this ID (Strict Mode guard)
    ScrollTrigger.getById("features-horizontal-scroll")?.kill();

    // ✅ MOBILE: Skip pin + horizontal scroll entirely — CSS handles vertical stacking
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Simple fade-in for each card on mobile
      const cardEls = cards.querySelectorAll(".features-card");
      gsap.set(cardEls, { opacity: 0, y: 30 });
      cardEls.forEach((card, i) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              delay: i * 0.08,
              ease: "power2.out",
            });
          },
        });
      });
      return;
    }

    // ✅ DESKTOP: Full horizontal pin scroll
    gsap.set(cards, { x: 0 });

    tweenRef.current = gsap.to(cards, {
      x: () => -(cards.scrollWidth - stickySection.offsetWidth),
      ease: "none",
      scrollTrigger: {
        trigger: stickySection,
        start: "top top",
        end: () => `+=${(cards.scrollWidth - stickySection.offsetWidth) * 2}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        markers: false,
        id: "features-horizontal-scroll",
        invalidateOnRefresh: true,
        onLeave: () => {
          // Wait for pin release + Lenis to settle before refreshing HowWeWork
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 50);
        },
      }
    });

    return () => {
      tweenRef.current?.scrollTrigger?.kill();
      tweenRef.current?.kill();
    };

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
