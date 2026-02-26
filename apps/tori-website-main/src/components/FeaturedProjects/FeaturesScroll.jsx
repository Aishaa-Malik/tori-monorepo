"use client";
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './FeaturesScroll.css';
import featuredProjectsContent from './featuredProjectsContent'; // ✅ Import data

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
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 50);
        },
      },
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

      {/* ✅ Dynamically render all 10 cards from featuredProjectsContent */}
      <div className="features-cards" ref={cardsRef}>
        {featuredProjectsContent.map((item, index) => (
          <div
            className="features-card"
            key={index}
            id={item.id || undefined} 
          >
            <div className="features-card-img">
              <img src={item.image} alt={item.title} />
            </div>
            <div className="features-card-title">
              <p>{item.info}</p>
              <h1>{item.title}</h1>
            </div>
            {/* ✅ Description added — uses pre-line to respect \n line breaks */}
            {item.description && (
              <div
                className="features-card-description"
                style={{ whiteSpace: "pre-line" }}
              >
                <p>{item.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesScroll;
