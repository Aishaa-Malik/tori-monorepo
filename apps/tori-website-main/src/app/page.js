"use client";
import "./index.css";
import "./preloader.css";
import { useRef, useState, useEffect } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";

import Nav from "@/components/Nav/Nav";
import ConditionalFooter from "@/components/ConditionalFooter/ConditionalFooter";
import AnimatedButton from "@/components/AnimatedButton/AnimatedButton";
import FeaturedProjects from "@/components/FeaturedProjects/FeaturedProjects";
import HowWeWork from "@/components/HowWeWork/HowWeWork";
import Spotlight from "@/components/Spotlight/Spotlight";

import FAQ from "@/components/FAQ/FAQ";
import ClientReviews from "@/components/ClientReviews/ClientReviews";
import CTAWindow from "@/components/CTAWindow/CTAWindow";
import Copy from "@/components/Copy/Copy";
import PricingSection from "@/components/PricingSection";
import ScrollSection from "@/components/ScrollSection/ScrollSection";

let isInitialLoad = true;
gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

import AnimatedBodyText from "@/components/AnimatedBodyText/AnimatedBodyText";
import ProcessAnimation from "@/components/ProcessAnimation/ProcessAnimation";

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

      const tags = tagsRef.current.querySelectorAll(".what-we-do-tag");
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
          <img src="/images/hero.jpg" alt="" />
        </div>
        <div className="hero-gradient"></div>
        <div className="container">
          <div className="hero-content">
            {/* <Copy animateOnScroll={false} delay={showPreloader ? 9.5 : 0.5}> */}
              <div className="hero-status-pill">
                <div className="hero-status-content">
                  <div className="hero-status-avatars">
                    <div className="hero-status-avatar"><img src="/images/aisha-1.jpg" alt="" /></div>
                    <div className="hero-status-avatar"><img src="/images/ayush-2.png" alt="" /></div>
                    
                  </div>
                  <span className="hero-status-text">Founded by Engineers from BITS Pilani & (Ex-Amazon) NIT Jaipur</span>
                </div>
              </div>
            {/* </Copy> */}
            <div className="hero-header">
              <Copy animateOnScroll={false} delay={showPreloader ? 10 : 0.85}>
                
<h1>
  <div className="hero-title-wrapper">
    <div className="hero-title-row">
      Tori 
      <img src="/images/logo.png" alt="Tori" className="inline-logo" style={{width: '70px', height: '70px', display: 'inline-block', verticalAlign: 'middle', margin: '0 -2px'}} />
    </div>
    <div className="hero-title-row">
       lets book Sessions 
    </div>
  </div>
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.3rem'}}>
    <span className="itc-garamond"> 
     over "WHATSAPP" in JUST "10 sec"
     <img 
        src="/images/bomb10s.png" 
        alt="Tori" 
        className="bomb-icon"   
     />
    </span>
    
  </div>
   
</h1>

<div className="hero-mockup">
          <img src="/images/phns4.png" alt="Phone mockup" />
 </div>

              </Copy>
            </div>
            <div className="hero-tagline">
              <Copy animateOnScroll={false} delay={showPreloader ? 10.15 : 1}>
                {/* <p>
                  At Terrene, we shape environments that elevate daily life,
                  invite pause, and speak through texture and light.
                </p> */}
        
        
        
        <div className="hero-tagline-text">
  <p className="hero-copy" style={{ lineHeight: '1.5' }}>
    Your clients live on  
    <img 
      src="/images/whatsapp logo.png" 
      alt="WhatsApp" 
      style={{ width: '28px', height: 'auto', verticalAlign: 'middle', margin: '0 4px' }} 
    />
    WhatsApp! Why are you forcing them to use clunky forms 📝 & check  
    <img 
      src="/images/gmail logo.png" 
      alt="Gmail" 
      style={{ width: '24px', height: 'auto', verticalAlign: 'middle', margin: '0 4px' }} 
    />
    mail they’ll never open? Tori is THE 10-SEC 
    <img 
      src="/images/whatsapp logo.png" 
      alt="WhatsApp" 
      style={{ width: '28px', height: 'auto', verticalAlign: 'middle', margin: '0 4px' }} 
    />
    booking engine that <span className="hero-copy-highlight">"CAPTURES the CLIENTS" YOUR "COMPETITORS are LOSING"</span>
  </p>
</div>
              </Copy>
            </div>
            <div className="hero-cta">
              <AnimatedButton
                label="Claim Your Whatsapp AI Bot"
                route="/contact"
                animateOnScroll={false}
                delay={showPreloader ? 10.3 : 1.15}
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
              {/* <div className="stat-divider"></div> */}
              <div className="stat-info">
                <Copy delay={0.15} animateOnScroll={false}>
                  <AnimatedBodyText animate={false}>Average booking time (vs. 4 mins manually).</AnimatedBodyText>
                </Copy>
              </div>
            </div>
            <div className="stat">
              <div className="stat-count">
                <Copy delay={0.2} animateOnScroll={false}>
                  <h2 className="stat-value">24/7</h2>
                </Copy>
              </div>
              {/* <div className="stat-divider"></div> */}
              <div className="stat-info">
                <Copy delay={0.25} animateOnScroll={false}>
                  <AnimatedBodyText animate={false}>Front desk availability. Zero downtime.</AnimatedBodyText>
                </Copy>
              </div>
            </div>
            <div className="stat">
              <div className="stat-count">
                <Copy delay={0.3} animateOnScroll={false}>
                  <h2 className="stat-value">Zero</h2>
                </Copy>



              </div>
              {/* <div className="stat-divider"></div> */}
              <div className="stat-info">
                <Copy delay={0.35} animateOnScroll={false}>
                  <AnimatedBodyText animate={false}>Revenue lost to missed calls.</AnimatedBodyText>
                </Copy>
              </div>
            </div>
            <div className="stat">
              <div className="stat-count">
                <Copy delay={0.4} animateOnScroll={false}>
                  <h2 className="stat-value">100%</h2>
                </Copy>
              </div>
              {/* <div className="stat-divider"></div> */}
              <div className="stat-info">
                <Copy delay={0.45} animateOnScroll={false}>
                  <AnimatedBodyText animate={false}>Booking accuracy. Zero double-bookings.</AnimatedBodyText>
                </Copy>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-fade"></div>
      </section>
      <ProcessAnimation />

      
      <section className="featured-projects-container" id="features">
        <div className="container">
          <div className="featured-projects-header-callout">
            <Copy delay={0.1}>
              <p>Features</p>
            </Copy>
          </div>
          <div className="featured-projects-header">
            <Copy delay={0.15}>
              <h2>Why Choose Tori Ate?</h2>
            </Copy>
          </div>
        </div>
        <FeaturedProjects />
        <div className="features-tags" ref={tagsRef}>
          <div className="feature-tag">
            <h3>Fast</h3>
          </div>
          <div className="feature-tag">
            <h3>Instant Payment</h3>
          </div>
          <div className="feature-tag">
            <h3>Tactile</h3>
          </div>
          <div className="feature-tag">
            <h3>Light-forward</h3>
          </div>
          <div className="feature-tag">
            <h3>Slow design</h3>
          </div>
          <div className="feature-tag">
            <h3>Modular rhythm</h3>
          </div>
        </div>
      </section>

      
      
      {/* Process in focus section */}
      <section className="how-we-work-container" id="process">
        <div className="container">
          <HowWeWork />
        </div>
      </section>
      
      {/* Testimonials Section removed for re-implementation */}
      <div id="testimonials">
        <ScrollSection />
      </div>

      {/* Beneath beyond section */}
      <Spotlight />

      {/* FAQ Section */}
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
          <ClientReviews />
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
      <CTAWindow
        title={"3 Minutes to Book? Or 30 Seconds?\nThe Choice is Yours."}
        subtitle="While your competitors sleep, Toriate is chatting, booking, and collecting payments 24/7. We replace booking friction* with 3X more bookings and 70% fewer no-shows."
        buttonLabel="Get Started Now"
        buttonRoute="blueprints"
        helperText="Engineered by BITS Pilani & Ex-Amazon, NIT Jaipur alumni to ensure you never lose a customer to a slow link again."
        bgImg="/images/home-cta-window.png"
        centered
      />
      <ConditionalFooter />
    </>
  );
}
