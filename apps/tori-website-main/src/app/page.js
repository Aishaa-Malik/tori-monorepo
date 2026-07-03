"use client";
import "./index.css";
import "./preloader.css";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";

import Nav from "@/components/Nav/Nav";
import AnimatedButton from "@/components/AnimatedButton/AnimatedButton";
import { createRevealObserver, isMobileViewport } from "@/lib/mobile-animation";
import LazyMount from "@/components/LazyMount/LazyMount";

import Copy from "@/components/Copy/Copy";
import SectionPill from "@/components/SectionPill/SectionPill";
let isInitialLoad = true;
gsap.registerPlugin(ScrollTrigger, CustomEase);
ScrollTrigger.config({ ignoreMobileResize: true });
CustomEase.create("hop", "0.9, 0, 0.1, 1");

import AnimatedBodyText from "@/components/AnimatedBodyText/AnimatedBodyText";

const ProcessAnimation = dynamic(
  () => import("@/components/ProcessAnimation/ProcessAnimation"),
  { ssr: false, loading: () => null }
);
const HowWeWork = dynamic(() => import("@/components/HowWeWork/HowWeWork"), {
  ssr: false,
  loading: () => null,
});
const FeaturedProjects = dynamic(
  () => import("@/components/FeaturedProjects/FeaturedProjects"),
  { ssr: false, loading: () => null }
);
const ScrollSection = dynamic(
  () => import("@/components/ScrollSection/ScrollSection"),
  { ssr: false, loading: () => null }
);
const PricingSection = dynamic(() => import("@/components/PricingSection"), {
  ssr: false,
  loading: () => null,
});
const FAQ = dynamic(() => import("@/components/FAQ/FAQ"), {
  ssr: false,
  loading: () => null,
});
const ClientReviews = dynamic(
  () => import("@/components/ClientReviews/ClientReviews"),
  { ssr: false, loading: () => null }
);
const CTAWindow = dynamic(() => import("@/components/CTAWindow/CTAWindow"), {
  ssr: false,
  loading: () => null,
});
const ConditionalFooter = dynamic(
  () => import("@/components/ConditionalFooter/ConditionalFooter"),
  { ssr: false, loading: () => null }
);
// Uncomment when the bottom-right demo video CTA should be shown again.
// const FloatingVideoPlayer = dynamic(
//   () => import("@/components/FloatingVideoPlayer/FloatingVideoPlayer"),
//   { ssr: false, loading: () => null }
// );

export default function Home() {
  const tagsRef = useRef(null);
  const [showPreloader, setShowPreloader] = useState(false); // Temporarily disable preloader
  const [loaderAnimating, setLoaderAnimating] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  useEffect(() => {
    const timers = [];
    let idleId = 0;

    const warmUpNonCriticalSections = () => {
      const cloudinaryOrigin = "https://res.cloudinary.com";
      if (!document.querySelector(`link[rel="preconnect"][href="${cloudinaryOrigin}"]`)) {
        const preconnect = document.createElement("link");
        preconnect.rel = "preconnect";
        preconnect.href = cloudinaryOrigin;
        preconnect.crossOrigin = "anonymous";
        document.head.appendChild(preconnect);
      }

      [
        ProcessAnimation,
        HowWeWork,
        FeaturedProjects,
        ScrollSection,
        PricingSection,
        FAQ,
        ClientReviews,
        CTAWindow,
        ConditionalFooter,
      ].forEach((Component, index) => {
        const timerId = window.setTimeout(() => {
          Component.preload?.();
        }, index * 450);
        timers.push(timerId);
      });
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(warmUpNonCriticalSections, {
        timeout: 2800,
      });
    } else {
      timers.push(window.setTimeout(warmUpNonCriticalSections, 1800));
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      timers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  useEffect(() => {
    if (lenis) {
      if (loaderAnimating) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  }, [lenis, loaderAnimating]);

  useGSAP(() => {
    const tl = gsap.timeline({
      delay: 0.3,
      defaults: {
        ease: "hop",
      },
    });

    if (showPreloader) {
      setLoaderAnimating(true);
      const counts = document.querySelectorAll(".count");

      counts.forEach((count, index) => {
        const digits = count.querySelectorAll(".digit h1");

        tl.to(
          digits,
          {
            y: "0%",
            duration: 1,
            stagger: 0.075,
          },
          index * 1
        );

        if (index < counts.length) {
          tl.to(
            digits,
            {
              y: "-100%",
              duration: 1,
              stagger: 0.075,
            },
            index * 1 + 1
          );
        }
      });

      tl.to(".spinner", {
        opacity: 0,
        duration: 0.3,
      });

      tl.to(
        ".word h1",
        {
          y: "0%",
          duration: 1,
        },
        "<"
      );

      tl.to(".divider", {
        scaleY: "100%",
        duration: 1,
        onComplete: () =>
          gsap.to(".divider", { opacity: 0, duration: 0.3, delay: 0.3 }),
      });

      tl.to("#word-1 h1", {
        y: "100%",
        duration: 1,
        delay: 0.3,
      });

      tl.to(
        "#word-2 h1",
        {
          y: "-100%",
          duration: 1,
        },
        "<"
      );

      tl.to(
        ".block",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          stagger: 0.1,
          delay: 0.75,
          onStart: () => {
            gsap.to(".hero-bg img", { scale: 1, duration: 2, ease: "hop" });
          },
          onComplete: () => {
            gsap.set(".loader", { pointerEvents: "none" });
            setLoaderAnimating(false);
            setShowPreloader(false);
          },
        },
        "<"
      );
    }
  }, [showPreloader]);

  useGSAP(
    () => {
      if (!tagsRef.current) return;

      const tags = tagsRef.current.querySelectorAll(".feature-tag");
      gsap.set(tags, { opacity: 0, x: -40 });

      if (isMobileViewport()) {
        return createRevealObserver(
          tagsRef.current,
          () => {
            gsap.to(tags, {
              opacity: 1,
              x: 0,
              duration: 0.42,
              stagger: 0.05,
              ease: "power2.out",
            });
          },
          { rootMargin: "0px 0px -10% 0px" }
        );
      }

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
    { scope: tagsRef }
  );

  return (
    <>
      {showPreloader && (
        <div className="loader">
          <div className="overlay">
            <div className="block"></div>
            <div className="block"></div>
          </div>
          <div className="intro-logo">
            <div className="word" id="word-1">
              <h1>
                <span>Terrene</span>
              </h1>
            </div>
            <div className="word" id="word-2">
              <h1>Balance</h1>
            </div>
          </div>
          <div className="divider"></div>
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <div className="counter">
            <div className="count">
              <div className="digit">
                <h1>0</h1>
              </div>
              <div className="digit">
                <h1>0</h1>
              </div>
            </div>
            <div className="count">
              <div className="digit">
                <h1>2</h1>
              </div>
              <div className="digit">
                <h1>7</h1>
              </div>
            </div>
            <div className="count">
              <div className="digit">
                <h1>6</h1>
              </div>
              <div className="digit">
                <h1>5</h1>
              </div>
            </div>
            <div className="count">
              <div className="digit">
                <h1>9</h1>
              </div>
              <div className="digit">
                <h1>8</h1>
              </div>
            </div>
            <div className="count">
              <div className="digit">
                <h1>9</h1>
              </div>
              <div className="digit">
                <h1>9</h1>
              </div>
            </div>
          </div>
        </div>
      )}
      <Nav />
      <section className="hero">
        <div className="hero-bg">
          <picture>
            <source media="(max-width: 768px)" srcSet="/images/hero-mobile.webp" type="image/webp" />
            <img
              src="/images/hero.webp"
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
        <div className="hero-gradient"></div>
        <div className="container">
          <div className="hero-content">
            <Copy animateOnScroll={false} delay={showPreloader ? 9.5 : 0.1}>
              <div className="hero-status-row">
                <div className="hero-status-pill">
                  <div className="hero-status-content">
                    <div className="hero-status-avatars">
                      <div className="hero-status-avatar">
                        <picture>
                          <source media="(max-width: 768px)" srcSet="/images/ayush-avatar.webp" type="image/webp" />
                          <img src="/images/ayush.webp" alt="" loading="eager" decoding="async" />
                        </picture>
                      </div>
                      <div className="hero-status-avatar">
                        <picture>
                          <source media="(max-width: 768px)" srcSet="/images/aisha-avatar.webp" type="image/webp" />
                          <img src="/images/aisha.webp" alt="" loading="eager" decoding="async" />
                        </picture>
                      </div>
                    </div>
                    <span className="hero-status-text">
                      <span className="resist-sans">Built by engineers from BITS Pilani & Amazon</span>{" "}
                      {/* <span className="itc-garamond-regular">BITS Pilani</span>{" "}
                      <span className="resist-sans">& </span>
                      <span className="itc-garamond-regular">Amazon</span> */}
                    </span>
                  </div>
                </div>
                <div className="hero-status-pill hero-bits-pill">
                  <div className="hero-status-content">
                    <div className="hero-status-avatar hero-bits-logo">
                      <picture>
                        <source media="(max-width: 768px)" srcSet="/images/bits-logo-mobile.webp" type="image/webp" />
                        <img src="/images/bits-logo.webp" alt="BITS Pilani" loading="eager" decoding="async" />
                      </picture>
                    </div>
                    <span className="hero-status-text">
                      <span className="resist-sans">Backed by BITS Pilani</span>
                    </span>
                  </div>
                </div>
              </div>
            </Copy>
            <div className="hero-header">
              <Copy animateOnScroll={false} delay={showPreloader ? 10 : 0.18}>

<h1>
  <div className="hero-title-line hero-title-desktop-line" style={{fontFamily: 'var(--font-itc-garamond)', fontWeight: 300, fontStyle: 'normal'}}>
    Turn WhatsApp chats into
  </div>
  <div className="hero-title-line hero-subtitle hero-title-desktop-line" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', gap: '0.8rem', whiteSpace: 'nowrap'}}>
    <span style={{fontFamily: 'var(--font-itc-garamond)', fontWeight: 300, fontStyle: 'normal'}}>paid bookings in 20 sec</span>
  </div>
  <div className="hero-title-line hero-title-mobile-line" style={{fontFamily: 'var(--font-itc-garamond)', fontWeight: 300, fontStyle: 'normal'}}>
    Turn WhatsApp
  </div>
  <div className="hero-title-line hero-title-mobile-line" style={{fontFamily: 'var(--font-itc-garamond)', fontWeight: 300, fontStyle: 'normal'}}>
    chats into paid
  </div>
  <div className="hero-title-line hero-title-mobile-line" style={{fontFamily: 'var(--font-itc-garamond)', fontWeight: 300, fontStyle: 'normal'}}>
    bookings in 20 sec
  </div>
</h1>

              </Copy>
            </div>
            <div className="hero-tagline">
              <Copy animateOnScroll={false} delay={showPreloader ? 10.15 : 0.24}>
                {/* <p>
                  At Terrene, we shape environments that elevate daily life,
                  invite pause& speak through texture and light.
                </p> */}
                <div className="hero-tagline-text">
                  <p className="hero-copy" style={{fontFamily: 'var(--font-itc-garamond)', fontWeight: 300, fontStyle: 'normal'}}>
                    <span className="hero-copy-line">For clinics, courts, turfs, studios & appointment-heavy businesses that still</span>
                    <span className="hero-copy-line">lose customers to calls, DMs, forms & no-shows. Tori Ate lets customers</span>
                    <span className="hero-copy-line">pick a service, choose a live slot, pay & confirm - <span className="hero-copy-highlight">without downloading an app.</span></span>
                  </p>
                </div>
              </Copy>
            </div>
            <AnimatedButton
              label="Get Started"
              route="/studio"
              animateOnScroll={false}
              delay={showPreloader ? 10.3 : 0.3}
            />
          </div>
        </div>
        
        <div className="hero-mockup">
          <picture>
            <source media="(max-width: 768px)" srcSet="/images/hand-mockup-mobile.webp" type="image/webp" />
            <img
              src="/images/hand-mockup.webp"
              alt="Phone mockup"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
        
          <div className="hero-stats">
          <div className="container">
            <div className="stat">
              <div className="stat-count">
                <Copy delay={0.1} animateOnScroll={false}>
                  <h2 style={{fontSize: '7rem'}}>20 Sec</h2>
                </Copy>
              </div>
              {/* <div className="stat-divider"></div> */}
              <div className="stat-info">
                <Copy delay={0.15} animateOnScroll={false}>
                  <AnimatedBodyText animate={false}>Average booking flow, from “Hi” to confirmed.</AnimatedBodyText>
                </Copy>
              </div>
            </div>
            <div className="stat">
              <div className="stat-count">
                <Copy delay={0.2} animateOnScroll={false}>
                  <h2 style={{fontSize: '7rem'}}>24/7</h2>
                </Copy>
              </div>
              {/* <div className="stat-divider"></div> */}
              <div className="stat-info">
                <Copy delay={0.25} animateOnScroll={false}>
                  <AnimatedBodyText animate={false}>Your WhatsApp booking desk stays open even when your staff is busy.</AnimatedBodyText>
                </Copy>
              </div>
            </div>
            <div className="stat">
              <div className="stat-count">
                <Copy delay={0.3} animateOnScroll={false}>
                  <h2 style={{fontSize: '7rem'}}>0</h2>
                </Copy>
              </div>
              {/* <div className="stat-divider"></div> */}
              <div className="stat-info">
                <Copy delay={0.35} animateOnScroll={false}>
                  <AnimatedBodyText animate={false}>App downloads. Customers book from the app already on their phone.</AnimatedBodyText>
                </Copy>
              </div>
            </div>
            <div className="stat">
              <div className="stat-count">
                <Copy delay={0.4} animateOnScroll={false}>
                  <h2 style={{fontSize: '7rem'}}>Paid</h2>
                </Copy>
              </div>
              {/* <div className="stat-divider"></div> */}
              <div className="stat-info">
                <Copy delay={0.45} animateOnScroll={false}>
                  <AnimatedBodyText animate={false}>Live slots, payment links, reminders& calendar sync built in.</AnimatedBodyText>
                </Copy>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-fade"></div>
      </section>

      <LazyMount minHeight="320svh" rootMargin="1200px 0px" mobileRootMargin="320px 0px">
        <ProcessAnimation />
      </LazyMount>

      {/* Process in focus section */}
      <section className="how-we-work-container" id="process">
        <LazyMount minHeight="160svh" rootMargin="1100px 0px" mobileRootMargin="420px 0px">
          <HowWeWork />
        </LazyMount>
      </section>

      <section className="featured-projects-container" id="features">
        <div className="container">
          <div className="featured-projects-header-callout">
            <Copy delay={0.1}>
              <SectionPill label="Features" />
            </Copy>
          </div>
          <div className="featured-projects-header">
            <Copy delay={0.15}>
              <h2>Why choose Tori Ate?</h2>
              <p className="featured-projects-supporting">
                Because appointment businesses do not need another “management software.” They need a faster way to turn interest into confirmed, paid bookings.
              </p>
            </Copy>
          </div>
        </div>
        <LazyMount minHeight="900svh" rootMargin="3200px 0px" mobileRootMargin="520px 0px">
          <FeaturedProjects />
        </LazyMount>
        <div className="features-tags" ref={tagsRef}>
          <div className="feature-tag">
            <h3>Fast</h3>
          </div>
          <div className="feature-tag">
            <h3>WhatsApp-native</h3>
          </div>
          <div className="feature-tag">
            <h3>Payment-first</h3>
          </div>
          <div className="feature-tag">
            <h3>No app download</h3>
          </div>
          <div className="feature-tag">
            <h3>Google Calendar sync</h3>
          </div>
          <div className="feature-tag">
            <h3>Built for repeat bookings</h3>
          </div>
        </div>
        <div className="testimonials-intro" id="testimonials">
          <SectionPill label="Testimonials" />
          <h2><span>Real businesses.</span> Real bookings. Less chaos.</h2>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <LazyMount minHeight="280svh" rootMargin="1000px 0px" mobileRootMargin="520px 0px">
        <ScrollSection />
      </LazyMount>

      {/* Beneath beyond section - Commented out as per user order request */}
      {/* <Spotlight /> */}

      {/* FAQ Section */}
      <div id="pricing">
        <LazyMount minHeight="162svh" rootMargin="1000px 0px" mobileRootMargin="520px 0px">
          <PricingSection />
        </LazyMount>
      </div>
      <div id="faq">
        <LazyMount minHeight="70svh" rootMargin="900px 0px">
          <FAQ />
        </LazyMount>
      </div>

      <section className="client-reviews-container" id="about-us">
        <div className="container">
          <div className="client-reviews-header-callout">
            <SectionPill label="About Us" />
            <h2 className="client-reviews-headline">Built by operators & engineers who understand speed.</h2>
          </div>
          <LazyMount minHeight="60svh" rootMargin="1600px 0px" mobileRootMargin="600px 0px">
            <ClientReviews />
          </LazyMount>
        </div>
      </section>
      {/* <section className="gallery-callout">
        <div className="container">
          <div className="gallery-callout-col">
            <div className="gallery-callout-row">
              <div className="gallery-callout-img gallery-callout-img-1">
                <img src="/images/gallery-callout-1.jpg" alt="" />
              </div>
              <div className="gallery-callout-img gallery-callout-img-2">
                <img src="/images/gallery-callout-2.jpg" alt="" />
                <div className="gallery-callout-img-content">
                  <h3>800+</h3>
                  <p>Project Images</p>
                </div>
              </div>
            </div>
            <div className="gallery-callout-row">
              <div className="gallery-callout-img gallery-callout-img-3">
                <img src="/images/gallery-callout-3.jpg" alt="" />
              </div>
              <div className="gallery-callout-img gallery-callout-img-4">
                <img src="/images/gallery-callout-4.jpg" alt="" />
              </div>
            </div>
          </div>
          <div className="gallery-callout-col">
            <div className="gallery-callout-copy">
              <Copy delay={0.1}>
                <h3>
                  Take a closer look at the projects that define our practice.
                  From intimate interiors to expansive landscapes, each image
                  highlights a unique perspective that might spark your next big
                  idea.
                </h3>
              </Copy>
              <AnimatedButton label="Explore Gallery" route="blueprints" />
            </div>
          </div>
        </div>
      </section> */}
      <div id="contact-us">
        <LazyMount minHeight="45svh" rootMargin="900px 0px">
          <CTAWindow
            title={"3 minutes to book?\nOr 20 seconds?"}
            subtitle="Your customers already use WhatsApp. Tori Ate turns that habit into a faster booking flow - with live slots, payment links, reminders & admin control built in."
            buttonLabel="Get Started Now"
            buttonRoute="blueprints"
            helperText="Built by BITS Pilani + Amazon engineering talent for businesses that cannot afford missed bookings."
            centered
          />
        </LazyMount>
      </div>
      <LazyMount minHeight="50svh" rootMargin="800px 0px">
        <ConditionalFooter />
      </LazyMount>
      {/* Uncomment when the bottom-right "Watch demo video" button should be shown again.
      <LazyMount minHeight="0" rootMargin="1200px 0px">
        <FloatingVideoPlayer videoId="1074968212" />
      </LazyMount>
      */}
    </>
  );
}
