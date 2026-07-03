"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Card from "./Card";
import SectionPill from "./SectionPill/SectionPill";
import "./PricingSection.css";
import {
  clamp01,
  createRafScrollListener,
  getStickyProgress,
  isMobileViewport,
} from "@/lib/mobile-animation";

gsap.registerPlugin(ScrollTrigger);

const PricingSection = () => {
  const container = useRef(null);
  const cardRefs = useRef([]);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, 4);
    const cards = cardRefs.current;

    if (!container.current || cards.length !== 4) return;

    let timelineInstance = null;
    let scrollTriggerInstance = null;
    let floatTweens = [];
    let lastLayoutWidth = window.innerWidth;
    let lastLayoutHeight = window.innerHeight;

    const getSpreadPositions = () => {
      const cardsContainer = container.current.querySelector(".cards");
      const cardsTrack = container.current.querySelector(".pricing-cards-track");
      const cardInner = cards[0]?.querySelector(".flip-card-inner");
      const sectionStyles = getComputedStyle(container.current);
      const viewportWidth = cardsContainer?.getBoundingClientRect().width || window.innerWidth;
      const cardWidth = cardInner?.offsetWidth || 320;
      const gap =
        parseFloat(sectionStyles.getPropertyValue("--pricing-card-gap")) || 16;

      if (isMobileViewport()) {
        const trackPadding = 16;
        const trackWidth =
          cards.length * cardWidth + (cards.length - 1) * gap + trackPadding * 2;
        if (cardsTrack) {
          cardsTrack.style.width = `${trackWidth}px`;
          cardsTrack.style.height = "100%";
        }
        return cards.map(
          (_, index) => trackPadding + cardWidth / 2 + index * (cardWidth + gap)
        );
      }

      const totalWidth = cards.length * cardWidth + (cards.length - 1) * gap;
      const startCenter = (viewportWidth - totalWidth) / 2 + cardWidth / 2;

      return cards.map((_, index) => {
        const centerX = startCenter + index * (cardWidth + gap);
        return centerX;
      });
    };

    const initAnimation = () => {
      const isMobile = isMobileViewport();
      timelineInstance?.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === container.current) st.kill();
      });
      floatTweens.forEach((tween) => tween.kill());
      floatTweens = [];

      const totalScrollHeight = window.innerHeight * 6.5;
      const positions = isMobile ? [] : getSpreadPositions();
      const rotations = [-15, -5, 5, 15];
      const sectionStyles = getComputedStyle(container.current);
      const cardStartY =
        sectionStyles.getPropertyValue("--pricing-card-start-y").trim() || "90%";

      if (isMobile) {
        const section = container.current;
        const cardsRail = section.querySelector(".pricing-cards-rail");
        const cardsTrack = section.querySelector(".pricing-cards-track");
        const cardInner = cards[0]?.querySelector(".flip-card-inner");
        const cardWidth = cardInner?.offsetWidth || 315;
        const gap = parseFloat(sectionStyles.getPropertyValue("--pricing-card-gap")) || 28;
        const trackPadding = 16;
        const trackWidth =
          cards.length * cardWidth + (cards.length - 1) * gap + trackPadding * 2;
        const stepSize = cardWidth + gap;
        const initialCenter = window.innerWidth / 2;
        const finalCenters = cards.map(
          (_, index) => trackPadding + cardWidth / 2 + index * (cardWidth + gap)
        );
        const easeOut = (value) => 1 - Math.pow(1 - clamp01(value), 3);
        const mobileRotations = [-24, -9, 9, 24];
        const minPanX = -Math.max(0, trackWidth - window.innerWidth);
        let horizontalEnabled = false;
        let panX = 0;
        let snapTimeoutId = 0;
        let dragState = null;
        const cardData = cards.map((card) => ({
          card,
          frontEl: card.querySelector(".flip-card-front"),
          backEl: card.querySelector(".flip-card-back"),
        }));

        if (cardsTrack) {
          cardsTrack.style.width = `${trackWidth}px`;
          cardsTrack.style.height = "100%";
          cardsTrack.style.willChange = "transform";
          cardsTrack.style.transform = "translate3d(0, 0, 0)";
        }

        cardsRail?.classList.remove("is-swipeable");

        cardData.forEach(({ card, frontEl, backEl }, index) => {
          card.style.position = "absolute";
          card.style.left = "0px";
          card.style.top = cardStartY;
          card.style.width = "var(--pricing-card-width)";
          card.style.zIndex = `${index + 1}`;
          card.style.willChange = "transform";

          if (frontEl) {
            frontEl.style.transform = "rotateY(0deg)";
            frontEl.style.willChange = "transform";
          }
          if (backEl) {
            backEl.style.transform = "rotateY(180deg)";
            backEl.style.willChange = "transform";
          }
        });

        const applyPan = (nextPanX) => {
          panX = Math.min(0, Math.max(minPanX, nextPanX));
          if (cardsTrack) {
            cardsTrack.style.transform = `translate3d(${panX}px, 0, 0)`;
          }
        };

        const updateMobilePricing = () => {
          const progress = getStickyProgress(section);
          // Rotate + spread completes fully before the flip begins, with a
          // short settled pause in between (0.48-0.56) so the two steps read
          // as distinct instead of blending into one motion.
          const spreadProgress = easeOut((progress - 0.12) / 0.36);
          const flipProgress = clamp01((progress - 0.56) / 0.2);
          const nextHorizontalEnabled = progress >= 0.82;

          if (nextHorizontalEnabled !== horizontalEnabled) {
            horizontalEnabled = nextHorizontalEnabled;
            cardsRail?.classList.toggle("is-swipeable", horizontalEnabled);
            applyPan(0);
          }

          cardData.forEach(({ card, frontEl, backEl }, index) => {
            const centerX =
              initialCenter + (finalCenters[index] - initialCenter) * spreadProgress;
            const rotation = mobileRotations[index] * (1 - spreadProgress);
            const x = Math.round(centerX - cardWidth / 2);

            card.style.transform = `translate3d(${x}px, -50%, 0) rotate(${rotation}deg)`;

            if (frontEl) {
              frontEl.style.transform = `rotateY(${-180 * flipProgress}deg)`;
            }

            if (backEl) {
              backEl.style.transform = `rotateY(${180 - 180 * flipProgress}deg)`;
            }
          });
        };

        // Manual axis-locked drag for the revealed card row. Native overflow-x
        // scrolling is intentionally avoided here: a scrollable element nested
        // inside a position:sticky ancestor is what was causing the whole
        // section to jitter on iOS/Android during momentum scroll.
        const handleTouchStart = (event) => {
          if (!horizontalEnabled || event.touches.length !== 1) return;
          if (snapTimeoutId) {
            clearTimeout(snapTimeoutId);
            snapTimeoutId = 0;
          }
          if (cardsTrack) cardsTrack.style.transition = "";
          const touch = event.touches[0];
          dragState = {
            startX: touch.clientX,
            startY: touch.clientY,
            startPanX: panX,
            axis: null,
          };
        };

        const handleTouchMove = (event) => {
          if (!dragState || !horizontalEnabled) return;
          const touch = event.touches[0];
          const dx = touch.clientX - dragState.startX;
          const dy = touch.clientY - dragState.startY;

          if (!dragState.axis) {
            if (Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) {
              dragState.axis = "x";
            } else if (Math.abs(dy) > 5) {
              dragState.axis = "y";
            }
          }

          if (dragState.axis === "x") {
            if (event.cancelable) event.preventDefault();
            applyPan(dragState.startPanX + dx);
          }
        };

        const snapToNearestCard = () => {
          const rawIndex = Math.round(-panX / stepSize);
          const clampedIndex = Math.max(0, Math.min(cards.length - 1, rawIndex));
          const target = Math.max(minPanX, Math.min(0, -clampedIndex * stepSize));

          if (cardsTrack) {
            cardsTrack.style.transition = "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)";
          }
          applyPan(target);
          snapTimeoutId = window.setTimeout(() => {
            snapTimeoutId = 0;
            if (cardsTrack) cardsTrack.style.transition = "";
          }, 340);
        };

        const handleTouchEnd = () => {
          if (dragState?.axis === "x") {
            snapToNearestCard();
          }
          dragState = null;
        };

        cardsRail?.addEventListener("touchstart", handleTouchStart, { passive: true });
        cardsRail?.addEventListener("touchmove", handleTouchMove, { passive: false });
        cardsRail?.addEventListener("touchend", handleTouchEnd, { passive: true });
        cardsRail?.addEventListener("touchcancel", handleTouchEnd, { passive: true });

        const stopScrollListener = createRafScrollListener(updateMobilePricing);

        return () => {
          stopScrollListener();
          if (snapTimeoutId) clearTimeout(snapTimeoutId);
          cardsRail?.removeEventListener("touchstart", handleTouchStart);
          cardsRail?.removeEventListener("touchmove", handleTouchMove);
          cardsRail?.removeEventListener("touchend", handleTouchEnd);
          cardsRail?.removeEventListener("touchcancel", handleTouchEnd);
          cardsRail?.classList.remove("is-swipeable");
          if (cardsTrack) {
            cardsTrack.style.willChange = "";
            cardsTrack.style.transition = "";
          }
          cardData.forEach(({ card, frontEl, backEl }) => {
            card.style.willChange = "";
            if (frontEl) frontEl.style.willChange = "";
            if (backEl) backEl.style.willChange = "";
          });
        };
      }

      cards.forEach((card, index) => {
        gsap.set(card, {
          left: isMobile ? `${window.innerWidth / 2}px` : "50%",
          top: cardStartY,
          xPercent: -50,
          yPercent: -50,
          rotation: rotations[index],
          scale: 1,
          zIndex: index + 1,
          force3D: true,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top -45%",
          end: `+=${totalScrollHeight}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          pinSpacing: true,
          markers: false,
        },
      });

      timelineInstance = tl;
      scrollTriggerInstance = tl.scrollTrigger;

      tl.to({}, { duration: 1.25 });

      tl.to(cards, {
        left: (index) => `${positions[index]}px`,
        rotation: 0,
        xPercent: -50,
        yPercent: -50,
        scale: 1,
        duration: 2,
        ease: "power2.out",
      });

      cards.forEach((card) => {
        const frontEl = card.querySelector(".flip-card-front");
        const backEl = card.querySelector(".flip-card-back");

        tl.to(
          frontEl,
          { rotateY: -180, duration: 1, ease: "power1.inOut" },
          "flip"
        );
        tl.to(
          backEl,
          { rotateY: 0, duration: 1, ease: "power1.inOut" },
          "flip"
        );
      });

      tl.to({}, { duration: 4 });
      ScrollTrigger.refresh();
    };

    let cleanupAnimation = null;
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cleanupAnimation = initAnimation();
      });
    });

    const handleResize = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      const widthDelta = Math.abs(nextWidth - lastLayoutWidth);
      const heightDelta = Math.abs(nextHeight - lastLayoutHeight);

      if (isMobileViewport() && widthDelta < 24 && heightDelta < 180) {
        return;
      }

      lastLayoutWidth = nextWidth;
      lastLayoutHeight = nextHeight;
      cleanupAnimation?.();
      cleanupAnimation = initAnimation();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      cleanupAnimation?.();
      timelineInstance?.kill();
      scrollTriggerInstance?.kill();
      floatTweens.forEach((tween) => tween.kill());
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === container.current) st.kill();
      });
    };
  }, []);

  const [isIndia, setIsIndia] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let hasDetectedCountry = false;
    let observer = null;

    const detectCountry = async () => {
      if (hasDetectedCountry) return;
      hasDetectedCountry = true;

      try {
        // Reliable check using IP geolocation, deferred until pricing is near view.
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (cancelled) return;

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

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone === "Asia/Kolkata" || timezone === "Asia/Calcutta") {
      setIsIndia(true);
    }

    const section = container.current;
    if (!section || !("IntersectionObserver" in window)) {
      detectCountry();
      return () => {
        cancelled = true;
      };
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        detectCountry();
        observer?.disconnect();
      },
      { rootMargin: "700px 0px", threshold: 0 }
    );

    observer.observe(section);

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  const periodLabel = isAnnual ? "/yr" : "/28 days";
  const comparisonPeriodLabel = "/yr";

  const prices = {
    india: {
      monthly: ["₹1299", "₹2499", "₹5499", "Talk to Sales"],
      annual: ["₹12999", "₹24999", "₹54999", "Talk to Sales"],
      monthlyRaw: [1299, 2499, 5499, null],
    },
    global: {
      monthly: ["$12.50", "$16.25", "$25", "Talk to Sales"],
      annual: ["$10", "$13", "$20", "Talk to Sales"],
      monthlyRaw: [12.5, 16.25, 25, null],
    },
  };

  const getPrice = (cardIndex) => {
    const region = isIndia ? "india" : "global";
    const type = isAnnual ? "annual" : "monthly";
    return prices[region][type][cardIndex];
  };

  const getComparisonPrice = (cardIndex) => {
    if (!isAnnual) return null;

    const region = isIndia ? "india" : "global";
    const raw = prices[region].monthlyRaw[cardIndex];
    if (raw === null) return null;

    const total = raw * 12;
    if (isIndia) {
      return `₹${total.toLocaleString("en-IN")}`;
    }
    return `$${total.toFixed(2)}`;
  };

  return (
    <div className="pricing-section" ref={container}>
      <section className="cards">
        <div className="pricing-header">
          <SectionPill label="Pricing" />
          <h2>Simple pricing for appointment-heavy businesses.</h2>
          <p className="pricing-supporting">
            Start small. Prove the booking flow. Scale once Tori Ate starts recovering time, slots revenue.
          </p>
          <div className="toggle-container">
            <span className={`toggle-option ${!isAnnual ? "active" : ""}`}>Monthly</span>
            <div className="toggle-switch" onClick={() => setIsAnnual(!isAnnual)}>
              <div className={`toggle-button ${isAnnual ? "annual" : "monthly"}`} />
            </div>
            <span className={`toggle-option ${isAnnual ? "active" : ""}`}>Annual</span>
            <img
              src="/images/pricing.png"
              alt="Get 2 months free"
              className="pricing-promo-img"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="pricing-cards-rail">
        <div className="pricing-cards-track">
          <div className="card-container" id="card-1" ref={(el) => (cardRefs.current[0] = el)}>
          <Card
            id="card-1"

            planTitle="Starter"
            planSubtitle="For single-location businesses starting with WhatsApp bookings."
            price={getPrice(0)}
            period={periodLabel}
            comparisonPrice={getComparisonPrice(0)}
            comparisonPeriod={comparisonPeriodLabel}
            description="Best for: small clinics, solo physiotherapists, small studios, single courts, small turfs."
            buttonText="Choose Starter"
            features={[
              { label: "WhatsApp booking flow", ok: true },
              { label: "Google Calendar sync", ok: true },
              { label: "Payment link support", ok: true },
              { label: "Basic admin dashboard", ok: true },
              { label: "Service and slot setup", ok: true },
              { label: "Booking confirmation messages", ok: true },
              { label: "Basic support", ok: true },
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

            planTitle="Growth"
            planSubtitle="For businesses that want fewer no-shows and better booking control."
            badge="Most Popular"
            price={getPrice(1)}
            period={periodLabel}
            comparisonPrice={getComparisonPrice(1)}
            comparisonPeriod={comparisonPeriodLabel}
            description="Best for: premium physio clinics, racket centres, turfs, pickleball clubs& studios with repeat bookings."
            buttonText="Choose Growth"
            features={[
              { label: "Everything in Starter", ok: true },
              { label: "Automated WhatsApp reminders", ok: true },
              { label: "Staff / employee management", ok: true },
              { label: "Revenue and appointment analytics", ok: true },
              { label: "Reschedule and cancellation flow", ok: true },
              { label: "More booking volume", ok: true },
              { label: "Priority onboarding support", ok: true },
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

            planTitle="Pro"
            planSubtitle="For high-volume operators who want to own repeat demand."
            price={getPrice(2)}
            period={periodLabel}
            comparisonPrice={getComparisonPrice(2)}
            comparisonPeriod={comparisonPeriodLabel}
            description="Best for: multi-court venues, premium clinics, recovery centres, larger turfs& high-volume appointment businesses."
            buttonText="Choose Pro"
            features={[
              { label: "Everything in Growth", ok: true },
              { label: "Multi-service advanced setup", ok: true },
              { label: "Higher booking volume", ok: true },
              { label: "Advanced analytics dashboard", ok: true },
              { label: "Customer rebooking flows", ok: true },
              { label: "Waitlist / slot recovery support", ok: true },
              { label: "Priority support", ok: true },
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

            planTitle="Enterprise"
            planSubtitle="Custom WhatsApp booking system across branches, teams & workflows."
            price={getPrice(3)}
            period=""
            comparisonPrice={null}
            description="Best for: clinic chains, sports venue chains, premium studios and large appointment-heavy businesses."
            buttonText="Talk to Sales"
            features={[
              { label: "Multi-location rollout", ok: true },
              { label: "Custom workflows & integrations", ok: true },
              { label: "Dedicated onboarding + priority support", ok: true },
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
        </div>
        </div>
        <div className="pricing-scroll-cue" aria-hidden="true">
          Swipe right <span>-&gt;</span>
        </div>
      </section>
    </div>
  );
};

export default PricingSection;
