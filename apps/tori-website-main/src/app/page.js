"use client";
import "./index.css";
import { useRef, useState, useEffect } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

import Nav from "@/components/Nav/Nav";
import ConditionalFooter from "@/components/ConditionalFooter/ConditionalFooter";
import AnimatedButton from "@/components/AnimatedButton/AnimatedButton";
import HowWeWork from "@/components/HowWeWork/HowWeWork";
import Spotlight from "@/components/Spotlight/Spotlight";
import FeaturesScroll from "@/components/FeaturedProjects/FeaturesScroll";
import FAQ from "@/components/FAQ/FAQ";
import ClientReviews from "@/components/ClientReviews/ClientReviews";
import CTAWindow from "@/components/CTAWindow/CTAWindow";
import Copy from "@/components/Copy/Copy";
import PricingSection from "@/components/PricingSection";
import ScrollSection from "@/components/ScrollSection/ScrollSection";
import Preloader from "@/components/Preloader/Preloader";
import AnimatedBodyText from "@/components/AnimatedBodyText/AnimatedBodyText";
import ProcessAnimation from "@/components/ProcessAnimation/ProcessAnimation";

let isInitialLoad = true;

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("hop", "0.9, 0, 0.1, 1");

  ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    limitCallbacks: true,
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });
}

export default function Home() {
  const tagsRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Cleanup isInitialLoad on unmount
  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  // FIX 4: Refresh ScrollTrigger after all images load — wrapped in requestAnimationFrame
  // so it never fires mid-React-commit
  useEffect(() => {
    const images = document.querySelectorAll("img");
    let loadedImages = 0;

    const checkAllImagesLoaded = () => {
      loadedImages++;
      if (loadedImages === images.length) {
        // ✅ Defer until after React's paint cycle
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkAllImagesLoaded();
      } else {
        img.addEventListener("load", checkAllImagesLoaded);
        img.addEventListener("error", checkAllImagesLoaded);
      }
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", checkAllImagesLoaded);
        img.removeEventListener("error", checkAllImagesLoaded);
      });
    };
  }, [isReady]);

  // FIX 2: Tags animation — gated behind isReady so GSAP never runs
  // before React has fully committed the DOM tree
  useGSAP(
    () => {
      if (!tagsRef.current || !isReady) return;
      const tags = tagsRef.current.querySelectorAll(".what-we-do-tag");
      if (!tags.length) return;

      gsap.set(tags, { opacity: 0, x: -40 });

      ScrollTrigger.create({
        trigger: tagsRef.current,
        start: "top 90%",
        once: true,
        animation: gsap.to(tags, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        }),
      });
    },
    { scope: tagsRef, dependencies: [isReady] }
  );

  return (
    <>
      {/* FIX 3: Preloader always stays in the DOM — hides via CSS/opacity,
          never unmounts. This prevents React fiber tree restructuring while
          GSAP holds references to old DOM nodes (was causing insertBefore crash). */}
      <Preloader setIsReady={setIsReady} isReady={isReady} />

      <div className={`main-content ${isReady ? "is-visible" : "is-hidden"}`}>
        <Nav />
        <section className="hero">
          <div className="hero-bg">
            <img
              src="/images/hero.jpg"
              alt=""
              width="1920"
              height="1080"
              fetchPriority="high"
            />
          </div>
          <div className="hero-gradient"></div>
          <div className="container">
            <div className="hero-content">
              <div className="hero-status-pill hero-status-pill-mobile">
                <div className="hero-status-content">
                  <div className="hero-status-avatars">
                    <div className="hero-status-avatar">
                      <img src="/images/aisha-1.jpg" alt="" />
                    </div>
                    <div className="hero-status-avatar">
                      <img src="/images/ayush-2.png" alt="" />
                    </div>
                  </div>
                  <span className="hero-status-text">
                    Founded by Engineers from BITS Pilani, AMAZON & NIT Jaipur
                  </span>
                </div>
              </div>

              <div className="hero-text-section">
                <div className="hero-content-overlay"></div>

                <div className="hero-header">
                  <Copy animateOnScroll={false} delay={0.85}>
                    <h1>
                      <div className="hero-title-wrapper">
                        <div className="hero-title-row">
                          Tori
                          <img
                            src="/images/logo.png"
                            alt="Tori"
                            className="inline-logo"
                            width="70"
                            height="70"
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle",
                              margin: "0 -2px",
                            }}
                          />
                        </div>
                        <div className="hero-title-row">lets book Sessions</div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <span className="itc-garamond hero-subheadline">
                          over "WHATSAPP" in JUST "10 sec"
                          <img
                            src="/images/bomb10s.png"
                            alt="Tori"
                            className="bomb-icon"
                            width="30"
                            height="30"
                          />
                        </span>
                        <div>
                          <AnimatedButton
                            className="wedges-style"
                            label={<>FIND LIKE-MINDED PEOPLE <br />
                            MEET| WORKOUT| FUN| BOOK| ALL-TOGETHER</>}
                            animateOnScroll={false}
                            delay={1.15}
                            route={"/contact"}
                          />
                        </div>
                      </div>
                    </h1>
                  </Copy>
                </div>

                <div className="hero-tagline">
                  <Copy animateOnScroll={false} delay={1}>
                    <div className="hero-tagline-text">
                      <p className="hero-copy">
                        Your clients live on{" "}
                        <img
                          src="/images/whatsapp logo.png"
                          alt="WhatsApp"
                          width="18"
                          height="18"
                          style={{
                            verticalAlign: "middle",
                            margin: "0 4px",
                            width: "18px",
                            height: "18px",
                          }}
                        />
                        WhatsApp! Why are you forcing them to use clunky forms 📝 & check{" "}
                        <img
                          src="/images/gmail logo.png"
                          alt="Gmail"
                          width="16"
                          height="16"
                          style={{
                            verticalAlign: "middle",
                            margin: "0 4px",
                            width: "16px",
                            height: "16px",
                          }}
                        />
                        mail they'll never open? Tori is THE 10-SEC{" "}
                        <img
                          src="/images/whatsapp logo.png"
                          alt="WhatsApp"
                          width="18"
                          height="18"
                          style={{
                            verticalAlign: "middle",
                            margin: "0 4px",
                            width: "18px",
                            height: "18px",
                          }}
                        />
                        booking engine that{" "}
                        <span className="hero-copy-highlight">
                          "CAPTURES the CLIENTS" YOUR "COMPETITORS are LOSING"
                        </span>
                      </p>
                    </div>
                  </Copy>
                </div>
              </div>

              <div className="hero-cta">
                <AnimatedButton
                  className="wedges-style"
                  label={
                    <>
                      GET YOUR 24/7 AI RECEPTIONIST &<br />
                      "REIMAGINE" the <br /> "ULTIMATE BOOKING EXPERIENCE" <br />
                      of your CUSTOMERS
                    </>
                  }
                  animateOnScroll={false}
                  delay={1.15}
                  route={"/contact"}
                />
              </div>

              <div className="hero-mockup">
                <img
                  src="/images/phns4.png"
                  alt="Phone mockup"
                  width="390"
                  height="944"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>

          <div className="hero-stats">
            <div className="container">
              <div className="stat">
                <div className="stat-count">
                  <Copy delay={0.1} animateOnScroll={false}>
                    <h2 className="stat-value">10 Sec</h2>
                  </Copy>
                </div>
                <div className="stat-info">
                  <Copy delay={0.15} animateOnScroll={false}>
                    <AnimatedBodyText animate={false}>
                      Average booking time (vs. 4 mins manually).
                    </AnimatedBodyText>
                  </Copy>
                </div>
              </div>
              <div className="stat">
                <div className="stat-count">
                  <Copy delay={0.2} animateOnScroll={false}>
                    <h2 className="stat-value">24/7</h2>
                  </Copy>
                </div>
                <div className="stat-info">
                  <Copy delay={0.25} animateOnScroll={false}>
                    <AnimatedBodyText animate={false}>
                      Front desk availability. Zero downtime.
                    </AnimatedBodyText>
                  </Copy>
                </div>
              </div>
              <div className="stat">
                <div className="stat-count">
                  <Copy delay={0.3} animateOnScroll={false}>
                    <h2 className="stat-value">Zero</h2>
                  </Copy>
                </div>
                <div className="stat-info">
                  <Copy delay={0.35} animateOnScroll={false}>
                    <AnimatedBodyText animate={false}>
                      Revenue lost to missed calls.
                    </AnimatedBodyText>
                  </Copy>
                </div>
              </div>
              <div className="stat">
                <div className="stat-count">
                  <Copy delay={0.4} animateOnScroll={false}>
                    <h2 className="stat-value">100%</h2>
                  </Copy>
                </div>
                <div className="stat-info">
                  <Copy delay={0.45} animateOnScroll={false}>
                    <AnimatedBodyText animate={false}>
                      Booking accuracy. Zero double-bookings.
                    </AnimatedBodyText>
                  </Copy>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-fade"></div>
        </section>

        <div className="process-animation-section">
          <ProcessAnimation />
        </div>

        {/* Clear separation between ProcessAnimation and FeaturesScroll */}
        <div style={{ height: "5vh", background: "#0d0c0c" }}></div>

        <section className="featured-projects-container" id="features">
          <div className="container">
            <div className="featured-projects-header-callout">
              <Copy delay={0.1}>
                <p style={{ color: "white", fontWeight: "bold", fontFamily: "'Bebas Neue', sans-serif" }}>Features</p>
              </Copy>
            </div>
            <div className="featured-projects-header">
              <Copy delay={0.15}>
                <h2 style={{ color: "white", fontWeight: "bold", fontFamily: "'Bebas Neue', sans-serif" }}>Why Choose Tori Ate?</h2>
              </Copy>
            </div>
          </div>
          <FeaturesScroll />
        </section>

        <section className="how-we-work-container" id="process">
          <div className="container">
            <HowWeWork />
          </div>
        </section>

        <div id="testimonials">
          <ScrollSection />
        </div>

        <Spotlight />

        <div id="pricing">
          <PricingSection />
        </div>

        <div id="faq">
          <FAQ />
        </div>

        <section className="client-reviews-container" id="about-us">
          <div className="container">
            <div className="client-reviews-header-callout">
              <p>About</p>
            </div>
            {/* FIX 1: Stable wrapper div gives React a fixed anchor point
                so GSAP mutations to nearby nodes don't break insertBefore */}
            {/* <div key="client-reviews-wrapper"> */}
              <ClientReviews />
            {/* </div> */}
          </div>
        </section>

        <CTAWindow
          title={"3 Minutes to Book? Or 30 Seconds?\nThe Choice is Yours."}
          subtitle="While your competitors sleep, Toriate is chatting, booking, and collecting payments 24/7. We replace booking friction* with 3X more bookings and 70% fewer no-shows."
          buttonLabel="Get Started Now"
          buttonRoute="contact"
          helperText="Engineered by BITS Pilani & Ex-Amazon, NIT Jaipur alumni to ensure you never lose a customer to a slow link again."
          bgImg="/images/home-cta-window.png"
          centered
        />
        <ConditionalFooter />
      </div>
    </>
  );
}
