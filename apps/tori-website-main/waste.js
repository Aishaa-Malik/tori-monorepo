"use client";

import { useEffect, useRef, useState } from "react";
import Card from "./Card";
import ReactLenis from "@studio-freight/react-lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const container = useRef(null);
  const cardRefs = useRef([]);
  const [isAnnual, setIsAnnual] = useState(true);

  useGSAP(
    () => {
      const cards = cardRefs.current;
      const totalScrollHeight = window.innerHeight * 3;
      const positions = [20, 50, 80];
      const rotations = [-10, 0, 10];

      ScrollTrigger.create({
        trigger: container.current.querySelector(".cards"),
        start: "top top",
        end: () => `+=${totalScrollHeight}`,
        pin: true,
        pinSpacing: true,
      });

      cards.forEach((card, index) => {
        gsap.to(card, {
          left: `${positions[index]}%`,
          top: "50%",
          rotation: `${rotations[index]}`,
          ease: "none",
          scrollTrigger: {
            trigger: container.current.querySelector(".cards"),
            start: "top top",
            end: () => `+=${window.innerHeight}`,
            scrub: 0.5,
            id: `spread-${index}`,
          },
        });
      });

      cards.forEach((card, index) => {
        const frontEl = card.querySelector(".flip-card-front");
        const backEl = card.querySelector(".flip-card-back");
        const staggerOffset = index * 0.05;
        const startOffset = 1 / 3 + staggerOffset;
        const endOffset = 2 / 3 + staggerOffset;

        ScrollTrigger.create({
          trigger: container.current.querySelector(".cards"),
          start: "top top",
          end: () => `+=${totalScrollHeight}`,
          scrub: 1,
          id: `rotate-flip-${index}`,
          onUpdate: (self) => {
            const progress = self.progress;
            if (progress >= startOffset && progress <= endOffset) {
              const animationProgress = (progress - startOffset) / (1 / 3);
              const frontRotation = -180 * animationProgress;
              const backRotation = 180 - 180 * animationProgress;
              const cardRotation = rotations[index] * (1 - animationProgress);

              gsap.to(frontEl, { rotateY: frontRotation, ease: "power1.out" });
              gsap.to(backEl, { rotateY: backRotation, ease: "power1.out" });
              gsap.to(card, {
                xPercent: -50,
                yPercent: -50,
                top: "50%",
                left: `${positions[index]}%`,
                rotate: cardRotation,
                ease: "power1.out",
              });
            }
          },
        });
      });
    },
    { scope: container }
  );

  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      <ReactLenis root>
        <main ref={container}>
          <section className="hero">
            <h1>
              Keep scrolling to
              <br />
              reveal the cards
            </h1>
          </section>

          <section className="cards">
            <div className="pricing-header">
              <h2>Introductory Offer</h2>
              <div className="toggle-container">
                <span
                  className={`toggle-option ${!isAnnual ? "active" : ""}`}
                  onClick={() => setIsAnnual(false)}
                >
                  Monthly
                </span>
                <div className="toggle-switch" onClick={() => setIsAnnual(!isAnnual)}>
                  <div className={`toggle-button ${isAnnual ? "annual" : "monthly"}`}></div>
                </div>
                <span
                  className={`toggle-option ${isAnnual ? "active" : ""}`}
                  onClick={() => setIsAnnual(true)}
                >
                  Annual
                </span>
              </div>
            </div>

            <Card
              ref={(el) => (cardRefs.current[0] = el)}
              className="card-container"
              id="card-1"
              frontText="$0"
              price="$0"
              period=""
              description="Includes the core and public plugins like ScrollTrigger"
              buttonText="SIGN UP FOR FREE"
              features={["GSAP Core Library and Tools", "Community Support", "8 Plugins"]}
              pricingInfo={[
                { price: "$89", range: "1-2", current: true },
                { price: "$99", range: "3-5", current: false },
                { price: "$139", range: "6-15", current: false },
              ]}
            />

            <Card
              ref={(el) => (cardRefs.current[1] = el)}
              className="card-container"
              id="card-2"
              frontText="$99"
              price="$99"
              period=""
              description="For individuals who want access to some of the bonus plugins."
              buttonText="JOIN CLUB"
              features={["Everything in GSAP", "Access to private NPM repo", "14 Plugins"]}
              pricingInfo={[
                { price: "$89", range: "1-2", current: false },
                { price: "$99", range: "3-5", current: true },
                { price: "$139", range: "6-15", current: false },
              ]}
            />

            <Card
              ref={(el) => (cardRefs.current[2] = el)}
              className="card-container"
              id="card-3"
              frontText="$149"
              price="$149"
              period=""
              description="All the plugins, no Commercial License. Ideal for this site."
              buttonText="GET CLUB PREMIUM"
              features={["Everything in GSAP Plus", "30 Plugins"]}
              pricingInfo={[
                { price: "$89", range: "1-2", current: false },
                { price: "$99", range: "3-5", current: false },
                { price: "$139", range: "6-15", current: true },
              ]}
            />
          </section>

          <section className="hero">
            <h1>Footer or Upcoming Section</h1>
          </section>
        </main>
      </ReactLenis>
    </>
  );
}
