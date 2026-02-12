"use client";
import "./HowWeWork.css";

import { useEffect, useRef, useState } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "../Copy/Copy";
import AnimatedBodyText from "../AnimatedBodyText/AnimatedBodyText";

gsap.registerPlugin(ScrollTrigger);

const HowWeWork = () => {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const stepsRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollTriggersRef = useRef([]);

  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 1000);
  };

  useEffect(() => {
    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useGSAP(
    () => {
      if (!stepsRef.current) return;

      const steps = stepsRef.current.querySelectorAll(".how-we-work-step");
      gsap.set(steps, { opacity: 0, x: -40 });

      ScrollTrigger.create({
        trigger: stepsRef.current,
        start: "top 75%",
        once: true,
        animation: gsap.to(steps, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: -0.1,
          ease: "none",
        }),
      });
    },
    { scope: stepsRef }
  );

  useEffect(() => {
    const container = containerRef.current;
    const header = headerRef.current;
    const cards = cardsRef.current;

    if (!container || !header || !cards) return;

    if (!isMobile) {
      const mainTrigger = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        endTrigger: cards,
        end: "bottom bottom",
        pin: header,
        pinSpacing: false,
      });
      scrollTriggersRef.current.push(mainTrigger);

      const cardElements = cards.querySelectorAll(".how-we-work-card");

      cardElements.forEach((card, index) => {
        const cardTrigger = ScrollTrigger.create({
          trigger: card,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveStep(index),
          onEnterBack: () => setActiveStep(index),
          onLeave: () => {
            if (index < cardElements.length - 1) {
              setActiveStep(index + 1);
            }
          },
          onLeaveBack: () => {
            if (index > 0) {
              setActiveStep(index - 1);
            }
          },
        });
        scrollTriggersRef.current.push(cardTrigger);
      });
    }

    return () => {
      scrollTriggersRef.current.forEach((trigger) => trigger.kill());
      scrollTriggersRef.current = [];
    };
  }, [isMobile]);

  return (
    <div className="how-we-work" ref={containerRef}>
      <div className="how-we-work-col how-we-work-header" ref={headerRef}>
        <div className="container">
          <div className="how-we-work-header-content">
            <div className="how-we-work-header-callout">
              <Copy delay={0.1}>
                <p>Process</p>
              </Copy>
            </div>
            <Copy delay={0.15}>
              <h3>
                From "Hi" to "Booked" in 10 seconds ONLY.
              </h3>
              <h4 className="subheading">
                Forget clunky apps and endless forms. Let your customers book appointments, choose slots, and pay directly inside WhatsApp. It’s natural, instant, and 10x faster than your competitors.
              </h4>
            </Copy>
            <div className="how-we-work-steps" ref={stepsRef}>
              <div
                className={`how-we-work-step ${
                  activeStep === 0 ? "active" : ""
                }`}
              >
                <p className="how-we-work-step-label">Step</p>
                <p className="how-we-work-step-index">1</p>
              </div>
              <div
                className={`how-we-work-step ${
                  activeStep === 1 ? "active" : ""
                }`}
              >
                <p className="how-we-work-step-label">Step</p>
                <p className="how-we-work-step-index">2</p>
              </div>
              <div
                className={`how-we-work-step ${
                  activeStep === 2 ? "active" : ""
                }`}
              >
                <p className="how-we-work-step-label">Step</p>
                <p className="how-we-work-step-index">3</p>
              </div>
              {/* <div
                className={`how-we-work-step ${
                  activeStep === 3 ? "active" : ""
                }`}
              >
                <p className="how-we-work-step-label">Step</p>
                <p className="how-we-work-step-index">4</p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      <div className="how-we-work-col how-we-work-cards" ref={cardsRef}>
        <div className="how-we-work-card">
          <div className="how-we-work-card-img">
            <img src="/images/demo-1.png" alt="" />
          </div>
          <div className="how-we-work-card-copy">
            <div className="how-we-work-card-index-label">
              <h3>Say "Hi" to Start</h3>
            </div>
            <AnimatedBodyText className="md">
Your customer doesn't need to download an app,
 create an account, or remember a password. 
 They simply send a "Hi" to Tori's WhatsApp - the app they already use daily. No downloads. No passwords. No "create an account" nonsense. just like messaging a friend. 
 Tori instantly wakes up, ready to serve.
            </AnimatedBodyText>
          </div>
        </div>
        <div className="how-we-work-card">
          <div className="how-we-work-card-img">
            <img src="/images/demo-2.png" alt="" />
          </div>
          <div className="how-we-work-card-copy">
            <div className="how-we-work-card-index-label">
              <h3>AI shows available slots in seconds</h3>
            </div>
            <p className="md">
Tori instantly presents your services & your real-time available time slots in a clean, interactive list.
 We sync deeply with your Google Calendar in real-time, so double-bookings are mathematically impossible.
 The customer picks their preferred date, time, & service in a natural conversation. 
  Feels effortless. Takes 10 seconds.
  (That's 10X faster than traditional booking pages.)
            </p>
          </div>
        </div>
        <div className="how-we-work-card">
          <div className="how-we-work-card-img">
            <img src="/images/demo-3.png" alt="" />
          </div>
          <div className="how-we-work-card-copy">
            <div className="how-we-work-card-index-label">
              <h3>Pay & Confirm Instantly</h3>
              <div className="speed-badge">
                <span className="speed-badge-dot"></span>
                <span className="speed-badge-text">⚡ 10X Faster Than Traditional Booking</span>
              </div>
            </div>
            <p className="md">
The moment a slot is picked, Toriate generates a secure payment link right in the chat. Once paid, the appointment is confirmed, added to both calendars, and a reminder is set. The whole process is done before they can even lock their phone.
            </p>
          </div>
        </div>
        <div className="how-we-work-card">
          <div className="how-we-work-card-img">
            <img src="/images/demo-4-reminder.png" alt="" />
          </div>
          <div className="how-we-work-card-copy">
            <div className="how-we-work-card-index-label">
              <h3>Zero No-Shows, Zero Stress</h3>
            </div>
            <AnimatedBodyText className="md">
Email reminders get buried in spam; WhatsApp reminders get read instantly.
 Tori automatically nudges your customers before their slot (e.g., 24h & 1h prior). 
 If life happens, they can reschedule with a single tap — keeping your calendar optimized without you lifting a finger.
            </AnimatedBodyText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowWeWork;
