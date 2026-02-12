"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Card from "./Card";
import "./PricingSection.css";

gsap.registerPlugin(ScrollTrigger);

const PricingSection = () => {
  const container = useRef(null);
  const cardRefs = useRef([]);
  const [isAnnual, setIsAnnual] = useState(true);

  useEffect(() => {
    // Increase to 4 cards
    cardRefs.current = cardRefs.current.slice(0, 4);
    const cards = cardRefs.current;

    if (!container.current || cards.length !== 4) return;

    // Increased scroll height to accommodate the sequence + pause
    const totalScrollHeight = window.innerHeight * 5; 
    const positions = [14, 38, 62, 86];
    const rotations = [-15, -5, 5, 15]; // Fanned rotation

    // Master Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current.querySelector(".cards"),
        start: "top top",
        end: `+=${totalScrollHeight}`,
        pin: true,
        scrub: 1,
        pinSpacing: true,
      }
    });

    // Initial State: Stacked, Fanned, Centered
    cards.forEach((card, index) => {
       gsap.set(card, { 
         left: "50%", 
         top: "50%", // Start centered
         xPercent: -50, 
         yPercent: -50,
         rotation: rotations[index], // Fanned out
         scale: 1
       });
    });

    // Step 1: Spread & Straighten (Directly, no move down)
    tl.to(cards, {
      left: (index) => `${positions[index]}%`,
      rotation: 0, // Straighten
      scale: 1,
      duration: 2,
      ease: "power2.out"
    });

    // Step 3: Flip Cards
    // We animate the inner elements manually within the timeline
    cards.forEach((card, index) => {
        const frontEl = card.querySelector(".flip-card-front");
        const backEl = card.querySelector(".flip-card-back");
        
        tl.to(frontEl, { rotateY: -180, duration: 1, ease: "power1.inOut" }, "flip");
        tl.to(backEl, { rotateY: 0, duration: 1, ease: "power1.inOut" }, "flip");
    });

    // Step 4: Float Animation
    // Continuous floating effect after spreading
    cards.forEach((card, index) => {
      // Different float durations/delays for organic feel
      const floatDuration = 3 + index * 0.5;
      const floatDelay = index * 0.2;
      
      gsap.to(card, {
        y: "-=15", // Float up 15px
        duration: floatDuration,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: floatDelay,
      });
    });

    // Step 5: Hold/Pause (Empty space in timeline)
    // This ensures the cards stay visible for a while before unpinning
    tl.to({}, { duration: 2 });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.globalTimeline.clear();
    };
  }, []);

  const [isIndia, setIsIndia] = useState(false);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // 1. Immediate check using Timezone (Fastest)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone === "Asia/Kolkata" || timezone === "Asia/Calcutta") {
          setIsIndia(true);
        }

        // 2. Reliable check using IP Geolocation API
        // This handles cases where system timezone is different or VPN is used
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        
        if (data.country_code === "IN") {
          setIsIndia(true);
        } else {
          setIsIndia(false);
        }
      } catch (error) {
        console.error("Location detection failed:", error);
        // Fallback is already handled by the timezone check above
      }
    };

    detectCountry();
  }, []);

  const periodLabel = isAnnual ? "/28 days" : "/28 days";

  const getPrice = (cardIndex) => {
    // Pricing configurations (Annual values provided by user)
    const prices = {
      india: {
        annual: ["₹999", "₹1199", "₹1699", "Talk to Sales"],
        monthly: ["₹1249", "₹1499", "₹2125", "Talk to Sales"], // approx +25%
      },
      global: {
        annual: ["$10", "$13", "$20", "Talk to Sales"],
        monthly: ["$12.50", "$16.25", "$25", "Talk to Sales"], // approx +25%
      }
    };

    const region = isIndia ? "india" : "global";
    const type = isAnnual ? "annual" : "monthly";
    
    return prices[region][type][cardIndex];
  };

  return (
    <div className="pricing-section" ref={container}>
      <section className="cards">
        <div className="pricing-header">
          <h2>Introductory Offer</h2>
          <div className="toggle-container">
            <span className={`toggle-option ${!isAnnual ? "active" : ""}`}>Monthly</span>
            <div className="toggle-switch" onClick={() => setIsAnnual(!isAnnual)}>
              <div className={`toggle-button ${isAnnual ? "annual" : "monthly"}`} />
            </div>
            <span className={`toggle-option ${isAnnual ? "active" : ""}`}>Annual</span>
          </div>
        </div>

        <div className="card-container" id="card-1" ref={(el) => (cardRefs.current[0] = el)}>
          <Card
            id="card-1"
            frontText="Studio"
            planTitle="Studio"
            planSubtitle="Best for teams and agencies"
            price={getPrice(0)}
            period={periodLabel}
            description="Full power for creative teams who need scale and flexibility"
            buttonText="Choose"
            features={[
              { label: "1 project", ok: true },
              { label: "Up to 3 pages", ok: true },
              { label: "Email support", ok: true },
              { label: "Basic analytics", ok: true },
            ]}
            pricingInfo={{
              currentPrice: getPrice(0),
              range: "per month",
              otherPrice1: "$199.90",
              otherRange1: "",
              otherPrice2: "$199.90",
              otherRange2: "",
              originalPrice: "$199.90",
              discount: "",
            }}
          />
        </div>

        <div className="card-container" id="card-2" ref={(el) => (cardRefs.current[1] = el)}>
          <Card
            id="card-2"
            frontText="Starter"
            planTitle="Starter"
            planSubtitle="Perfect to Book ANY SERVICE IN 10 SEC"
            badge="Most Popular"
            price={getPrice(1)}
            period={periodLabel}
            description="All the essentials to build and launch your first portfolio"
            buttonText="Choose"
            features={[
              { label: "1 project", ok: true },
              { label: "Up to 3 pages", ok: true },
              { label: "Email support", ok: false },
              { label: "Basic analytics", ok: false },
            ]}
            pricingInfo={{
              currentPrice: getPrice(1),
              range: "per month",
              otherPrice1: "$49.90",
              otherRange1: "",
              otherPrice2: "$49.90",
              otherRange2: "",
              originalPrice: "$49.90",
              discount: "",
            }}
          />
        </div>

        <div className="card-container" id="card-3" ref={(el) => (cardRefs.current[2] = el)}>
          <Card
            id="card-3"
            frontText="Pro"
            planTitle="Pro"
            planSubtitle="Perfect to Book ANY SERVICE IN 10 SEC"
            price={getPrice(2)}
            period={periodLabel}
            description="All the essentials to build and launch your first portfolio"
            buttonText="Choose"
            features={[
              { label: "1 project", ok: true },
              { label: "Up to 3 pages", ok: true },
              { label: "Email support", ok: true },
              { label: "Basic analytics", ok: false },
            ]}
            pricingInfo={{
              currentPrice: getPrice(2),
              range: "per month",
              otherPrice1: "$49.90",
              otherRange1: "",
              otherPrice2: "$49.90",
              otherRange2: "",
              originalPrice: "$49.90",
              discount: "",
            }}
          />
        </div>

        <div className="card-container" id="card-4" ref={(el) => (cardRefs.current[3] = el)}>
          <Card
            id="card-4"
            frontText="Enterprise"
            planTitle="Enterprise"
            planSubtitle="For large scale organizations"
            price={getPrice(3)}
            period={""}
            description="Custom solutions for enterprise needs"
            buttonText="Choose"
            features={[
              { label: "Unlimited projects", ok: true },
              { label: "Unlimited pages", ok: true },
              { label: "Priority support", ok: true },
              { label: "Advanced analytics", ok: true },
            ]}
            pricingInfo={{
              currentPrice: getPrice(3),
              range: "per month",
              otherPrice1: "$99.90",
              otherRange1: "",
              otherPrice2: "$99.90",
              otherRange2: "",
              originalPrice: "$99.90",
              discount: "",
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default PricingSection;
