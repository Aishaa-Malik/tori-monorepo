"use client";
import "./HowWeWork.css";

import { useEffect, useRef, useState } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import Copy from "../Copy/Copy";
import AnimatedBodyText from "../AnimatedBodyText/AnimatedBodyText";
import SectionPill from "../SectionPill/SectionPill";
import { createRafScrollListener, isMobileViewport } from "@/lib/mobile-animation";

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
    setIsMobile(window.innerWidth <= 900);
  };

  useEffect(() => {
    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    const videos = Array.from(
      containerRef.current?.querySelectorAll(".how-we-work-card-img video") || []
    );

    if (!videos.length) return;

    const shouldSaveData =
      window.matchMedia?.("(prefers-reduced-data: reduce)").matches ||
      navigator.connection?.saveData;
    const isMobileDevice = isMobileViewport();

    const playVideo = (video) => {
      if (shouldSaveData) return;
      if (video.preload !== "auto") {
        video.preload = "auto";
        video.load();
      }
      video.play().catch(() => {});
    };

    if (!("IntersectionObserver" in window)) {
      videos.forEach(playVideo);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            playVideo(video);
          } else {
            video.pause();
          }
        });
      },
      { rootMargin: `${isMobileDevice ? 360 : 560}px 0px`, threshold: 0.05 }
    );

    videos.forEach((video) => {
      video.pause();
      observer.observe(video);
    });

    return () => {
      observer.disconnect();
      videos.forEach((video) => video.pause());
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
      const resetHeaderPin = () => {
        header.classList.remove("is-fixed", "is-ended");
        header.style.removeProperty("--hww-pin-left");
        header.style.removeProperty("--hww-pin-width");
        header.style.removeProperty("--hww-pin-offset-left");
      };

      const measureHeader = () => {
        resetHeaderPin();

        const headerRect = header.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offsetLeft = headerRect.left - containerRect.left;

        header.style.setProperty("--hww-pin-left", `${headerRect.left}px`);
        header.style.setProperty("--hww-pin-width", `${headerRect.width}px`);
        header.style.setProperty("--hww-pin-offset-left", `${offsetLeft}px`);
      };

      const updateHeaderPin = () => {
        const rect = container.getBoundingClientRect();
        const shouldPin = rect.top <= 0 && rect.bottom > window.innerHeight;
        const shouldEnd = rect.bottom <= window.innerHeight;

        header.classList.toggle("is-fixed", shouldPin);
        header.classList.toggle("is-ended", shouldEnd);
      };

      measureHeader();
      updateHeaderPin();

      const handleResize = () => {
        measureHeader();
        updateHeaderPin();
      };

      window.addEventListener("scroll", updateHeaderPin, { passive: true });
      window.addEventListener("resize", handleResize);

      const cardElements = cards.querySelectorAll(".how-we-work-card");

      cardElements.forEach((card, index) => {
        gsap.set(card, { transformOrigin: "center center", force3D: true });

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

      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        window.removeEventListener("scroll", updateHeaderPin);
        window.removeEventListener("resize", handleResize);
        resetHeaderPin();
        scrollTriggersRef.current.forEach((trigger) => trigger.kill());
        scrollTriggersRef.current = [];
      };
    }

    const cardElements = Array.from(cards.querySelectorAll(".how-we-work-card"));
    const updateActiveStep = () => {
      const viewportCenter = window.innerHeight * 0.5;
      let closestIndex = 0;
      let closestDistance = Infinity;

      cardElements.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height * 0.5;
        const distance = Math.abs(cardCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveStep(closestIndex);
    };

    return createRafScrollListener(updateActiveStep);
  }, [isMobile]);

  return (
    <div className="how-we-work" ref={containerRef}>
      <div className="how-we-work-col how-we-work-header" ref={headerRef}>
        <div className="container">
          <div className="how-we-work-header-content">
            <div className="how-we-work-header-callout">
              <Copy delay={0.1}>
                <SectionPill label="Process" />
                <div className="speed-badge-header">
                  <span className="speed-badge-icon">⚡</span>
                  <span className="speed-badge-divider"></span>
                  <span className="speed-badge-text-header">20x faster than traditional booking</span>
                </div>
              </Copy>
            </div>
            <Copy delay={0.15}>
              <h3 style={{ color: "#E6F2FF" }}>
                <span className="process-title-line">From “Hi” to “Booked”</span>
                <span className="process-title-line">in 20 seconds.</span>
              </h3>
              <h4 className="subheading">
                Forget clunky apps, endless forms &  “please call to confirm” chaos. Tori Ate turns a WhatsApp message into a confirmed appointment with payment, reminders &  calendar sync built in.
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
            <video
              src="https://res.cloudinary.com/dbpdaigyn/video/upload/f_auto,q_auto/v1781455377/VID1-FINAL_twwfeh.mp4"
              loop
              muted
              playsInline
              preload="metadata"
            />
          </div>
          <div className="how-we-work-card-copy">
            <div className="how-we-work-card-index-label">
              <h3>Say “Hi” to start</h3>
            </div>
            <AnimatedBodyText className="md" start="top 88%" end="top 48%">
Your customer simply messages your Tori Ate WhatsApp number.
They do not need to download an app, create an account, remember a password, or open your website.
Just like messaging a friend - but it books revenue for your business.
            </AnimatedBodyText>
          </div>
        </div>
        <div className="how-we-work-card">
          <div className="how-we-work-card-img">
            <video
              src="https://res.cloudinary.com/dbpdaigyn/video/upload/f_auto,q_auto/v1781455361/VID2-FINAL_l02rr8.mp4"
              loop
              muted
              playsInline
              preload="metadata"
            />
          </div>
          <div className="how-we-work-card-copy">
            <div className="how-we-work-card-index-label">
              <h3>Pick a service and live slot</h3>
            </div>
            <AnimatedBodyText className="md" start="top 88%" end="top 48%">
Tori Ate shows your services and only displays available time slots from your connected Google Calendar.
If a slot is already booked, it does not show up.
No double-booking. No manual checking. No “wait, let me confirm and call you back.”
            </AnimatedBodyText>
          </div>
        </div>
        <div className="how-we-work-card">
          <div className="how-we-work-card-img">
            <video
              src="https://res.cloudinary.com/dbpdaigyn/video/upload/f_auto,q_auto/v1781455371/VID3-FINAL_qv4klz.mp4"
              loop
              muted
              playsInline
              preload="metadata"
            />
          </div>
          <div className="how-we-work-card-copy">
            <div className="how-we-work-card-index-label">
              <h3>Pay & confirm instantly</h3>
            </div>
            <AnimatedBodyText className="md" start="top 88%" end="top 48%">
Once the customer selects a slot, Tori Ate sends the payment link inside WhatsApp.
After payment, the appointment is confirmed and added to the calendar.
The customer gets clarity. You get commitment. Your staff gets one less thing to chase.
            </AnimatedBodyText>
          </div>
        </div>
        <div className="how-we-work-card">
          <div className="how-we-work-card-img">
            <video
              src="https://res.cloudinary.com/dbpdaigyn/video/upload/f_auto,q_auto/v1781455373/VID4-FINAL_sqr5zg.mp4"
              loop
              muted
              playsInline
              preload="metadata"
            />
          </div>
          <div className="how-we-work-card-copy">
            <div className="how-we-work-card-index-label">
              <h3>Reminders reduce no-shows</h3>
            </div>
            <AnimatedBodyText className="md" start="top 88%" end="top 48%">
Before the appointment, Tori Ate sends WhatsApp reminders so customers do not forget.
If someone needs to reschedule, they can do it through the same flow instead of disappearing.
Less ghosting. Fewer empty slots. More predictable revenue.
            </AnimatedBodyText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowWeWork;
