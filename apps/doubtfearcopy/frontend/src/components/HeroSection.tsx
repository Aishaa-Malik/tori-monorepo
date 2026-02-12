import React, { useEffect, useRef } from 'react';
import '../landingpage.css';
// Import required CSS files directly
import '../nonhero.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Register ScrollTrigger and ScrollToPlugin plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Import background image
const cloudyBackground = process.env.PUBLIC_URL + '/toriateBack.png';

const HeroSection: React.FC = () => {
  // Create refs for elements we need to animate
  const animatedIconsRef = useRef<HTMLDivElement>(null);
  const heroHeaderRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const animatedTextRef = useRef<HTMLHeadingElement>(null);
  const getStartedButtonRef = useRef<HTMLAnchorElement>(null);

  // Initialize moving cloudy background with Vanta Fog if available
  useEffect(() => {
    const heroSection = heroSectionRef.current;
    const VANTA = (window as any).VANTA;
    const THREE = (window as any).THREE;
    let vantaInstance: any = null;

    if (heroSection && VANTA && THREE) {
      try {
        vantaInstance = VANTA.FOG({
          el: heroSection,
          highlightColor: 0x888888,
          midtoneColor: 0x444444,
          lowlightColor: 0x222222,
          baseColor: 0x141414,
          blurFactor: 0.6,
          speed: 1.5, // Increased speed for more noticeable movement
          zoom: 0.8,  // Adjusted zoom for better visibility
        });
      } catch (e) {
        console.warn('VANTA initialization failed:', e);
      }
    }

    return () => {
      try {
        if (vantaInstance && typeof vantaInstance.destroy === 'function') {
          vantaInstance.destroy();
        }
      } catch {}
    };
  }, []);

  useEffect(() => {
    // Get references to DOM elements
    const animatedIcons = animatedIconsRef.current;
    const heroHeader = heroHeaderRef.current;
    const heroSection = heroSectionRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const animatedText = animatedTextRef.current;
    const getStartedButton = getStartedButtonRef.current;
    
    // Get icon elements within the animated icons container
    const iconElements = animatedIcons?.querySelectorAll('.hero-animated-icon');
    
    // Only proceed if we have the necessary elements
    if (!animatedIcons || !heroHeader || !heroSection || !title || !subtitle || !iconElements?.length) {
      console.warn('Some hero elements are missing');
      return;
    }

    const isMobile = window.innerWidth <= 1000;
    const headerIconSize = isMobile ? 30 : 60;
    const currentIconSize = iconElements.length > 0 ? iconElements[0].getBoundingClientRect().width : 50;
    const exactScale = headerIconSize / currentIconSize;

    // Initialize the timeline for smoother animations
    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 1, ease: "power2.inOut" }
    });
    
    // Set initial states with improved performance settings
    gsap.set(animatedIcons, {
      position: "fixed",
      bottom: "5rem",
      left: "1rem",
      right: "1rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "2rem",
      opacity: 1,
      scale: 1,
      y: 0,
      force3D: true, // Force 3D transforms for better performance
      willChange: "transform, opacity", // Hint to browser to optimize for animations
      zIndex: 10,
      backfaceVisibility: "visible" // Prevent flickering during animations
    });
    
    // Create ScrollTrigger for the hero section
    const scrollTrigger = ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      end: `+=${window.innerHeight * 4}px`,
      pin: true,
      pinSpacing: true,
      pinType: "fixed", // Ensures proper pin-spacer creation
      anticipatePin: 1, // Improves pin performance
      markers: false, // Set to true for debugging
      scrub: 1,
      onUpdate: (self: any) => {
        const progress = self.progress;

        // Phase 1: Text fade out (0 - 0.25)
        if (progress <= 0.25) {
          const fadeProgress = progress / 0.25;
          
          // Fade out the main title and subtitle
          gsap.to(title, {
            opacity: 1 - fadeProgress,
            y: -50 * fadeProgress,
            duration: 0.1
          });
          
          gsap.to(subtitle, {
            opacity: 1 - fadeProgress,
            y: -30 * fadeProgress,
            duration: 0.1
          });
        } 
        // Phase 2: Icons move up and scale down (0.25 - 0.75)
        else if (progress <= 0.75) {
          const moveProgress = (progress - 0.25) / 0.5;
          
          // Hide text completely
          gsap.to(title, { opacity: 0, duration: 0.1 });
          gsap.to(subtitle, { opacity: 0, duration: 0.1 });

          // Move icons to center and scale down
          const targetY = -window.innerHeight * 0.3 * moveProgress;
          const targetScale = 1 - (moveProgress * 0.7); // Scale from 1 to 0.3
          
          gsap.to(animatedIcons, {
            position: "fixed",
            bottom: progress < 0.3 ? "5rem" : "auto", // Keep at bottom until 30% progress
            top: progress >= 0.3 ? "50%" : "auto",
            left: "50%",
            xPercent: -50,
            yPercent: progress >= 0.3 ? -50 : 0,
            y: progress >= 0.3 ? targetY : 0,
            scale: targetScale,
            opacity: 1,
            duration: 0.1,
            overwrite: "auto"
          });
          
          // Show animated text and button when we're halfway through this phase
          if (moveProgress > 0.5) {
            const textFadeProgress = (moveProgress - 0.5) * 2; // 0 to 1 in the second half
            
            // Fade in the animated text
            if (animatedText) {
              gsap.to(animatedText, {
                opacity: textFadeProgress,
                y: 0,
                duration: 0.1
              });
            }
            
            // Fade in the Get Started button
            if (getStartedButton) {
              gsap.to(getStartedButton, {
                opacity: textFadeProgress,
                y: 0,
                duration: 0.1
              });
            }
          }
        } 
        // Phase 3: Icons fade out (0.75 - 1.0)
        else {
          const fadeProgress = (progress - 0.75) / 0.25;
          
          // Hide text completely
          gsap.to(title, { opacity: 0, duration: 0.1 });
          gsap.to(subtitle, { opacity: 0, duration: 0.1 });

          // Fade out icons
          gsap.to(animatedIcons, {
            opacity: 1 - fadeProgress,
            scale: 0.3,
            duration: 0.1,
            overwrite: "auto"
          });
          
          // Keep animated text and button visible
          if (animatedText) {
            gsap.to(animatedText, {
              opacity: 1,
              y: 0,
              duration: 0.1
            });
          }
          
          if (getStartedButton) {
            gsap.to(getStartedButton, {
              opacity: 1,
              y: 0,
              duration: 0.1
            });
          }
        }
      },
    });

    // Cleanup function to kill ScrollTrigger instances when component unmounts
    return () => {
      if (scrollTrigger) {
        scrollTrigger.kill();
      }
      ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Refs are already defined at the top of the component

  return (
    <section 
      ref={heroSectionRef} 
      className="hero-section-home hero-home"
      style={{
        backgroundImage: `url(${cloudyBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.5s ease-in-out',
        height: '100vh',
        width: '100%',
        overflow: 'visible',
        position: 'relative'
      }}
    >
      <div ref={heroHeaderRef} className="hero-header-home">
        <h1 ref={titleRef}>TORIATE</h1>
        <p ref={subtitleRef}>Redefining Tradition - a fusion of shows</p>
      </div>
      <div 
        ref={animatedIconsRef} 
        className="hero-animated-icons"
        style={{
          position: 'fixed',
          bottom: '5rem',
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem',
          zIndex: 10
        }}
      >
        <div className="hero-animated-icon" style={{ width: '120px', height: '120px' }}>
          <img src="/icon_1.png" alt="Icon 1" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="hero-animated-icon" style={{ width: '120px', height: '120px' }}>
          <img src="/icon_2.png" alt="Icon 2" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="hero-animated-icon" style={{ width: '120px', height: '120px' }}>
          <img src="/icon_3.png" alt="Icon 3" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="hero-animated-icon" style={{ width: '120px', height: '120px' }}>
          <img src="/icon_4.png" alt="Icon 4" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="hero-animated-icon" style={{ width: '120px', height: '120px' }}>
          <img src="/icon_5.png" alt="Icon 5" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>
      
      {/* Animated text that appears after scrolling */}
      {/* <h1 
        ref={animatedTextRef} 
        className="hero-animated-text"
        // style={{
        //   position: 'absolute',
        //   top: '30%',
        //   left: '50%',
        //   transform: 'translateX(-50%)',
        //   width: '80%',
        //   textAlign: 'center',
        //   opacity: 1,
        //   zIndex: 999,
        //   color: 'white',
        //   textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        //   fontWeight: 'bold',
        //   fontSize: '2.5rem',
        //   display: 'flex',
        //   flexWrap: 'wrap',
        //   justifyContent: 'center',
        //   alignItems: 'center',
        //   gap: '10px',
        //   pointerEvents: 'auto'
        // }}
      >
        <span className="hero-text-segment" style={{opacity: 1, display: 'inline-block'}}>Rrrreducing friction</span>
        <div className="hero-placeholder-icon" style={{display: 'inline-flex', width: '20px'}}></div>
        <span className="hero-text-segment" style={{opacity: 1, display: 'inline-block'}}> & no shows</span>
        <div className="hero-placeholder-icon" style={{display: 'inline-flex', width: '20px'}}></div>
        <span className="hero-text-segment" style={{opacity: 1, display: 'inline-block'}}>by</span>
        <span className="hero-text-segment" style={{opacity: 1, display: 'inline-block'}}>upto </span>
        <span className="hero-text-segment" style={{opacity: 1, display: 'inline-block'}}>45%</span>
        <div className="hero-placeholder-icon" style={{display: 'inline-flex', width: '20px'}}></div>
      </h1> */}
      
      {/* Subtitle text */}
      {/* <p style={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        textAlign: 'center',
        color: 'white',
        fontSize: '1.2rem',
        opacity: 1,
        zIndex: 20,
        textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
      }}>
        Turn WhatsApp into your booking engine—stop losing revenue, save countless hours, and delight every customer without any app downloads
      </p> */}


      
      
      {/* Get Started button */}
      
    </section>
  );
};

// Add a wrapper component to include the spacer and feature cards
const HeroSectionWithSpacer: React.FC = () => {
  return (
    <>
      <HeroSection />
      {/* <div className="hero-spacer" style={{ height: '30vh', background: 'transparent' }}></div> */}
      
      {/* Feature Cards Section */}
      {/* <section className="feature-cards-section" style={{
        background: 'linear-gradient(rgba(20, 20, 20, 0.8), rgba(20, 20, 20, 0.9))',
        padding: '4rem 0',
        position: 'relative',
        zIndex: 10
      }}> */}
        {/* <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem'
        }}> */}
          {/* Card 1 */}
          {/* <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'visible',
            width: '350px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}> */}
            {/* <div style={{ height: '200px', overflow: 'visible' }}>
              <img 
                src="/content/card1.jpg" 
                alt="Stop No-Shows Forever" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div> */}
            {/* <div style={{ padding: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                textTransform: 'uppercase'
              }}>
                STOP NO-SHOWS FOREVER
              </h3>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                Auto-pings customers 1hr before their slot. Watch your no-show rate drop to nearly zero.
              </p>
            </div> */}
          {/* </div>
           */}
          {/* Card 2 */}
          {/* <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'visible',
            width: '350px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ height: '200px', overflow: 'visible' }}>
              <img 
                src="/content/card2.jpg" 
                alt="Stop Losing Money to Booking Friction" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                textTransform: 'uppercase'
              }}>
                STOP LOSING MONEY TO BOOKING FRICTION
              </h3>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                Customers book in WhatsApp (no app installs). 45% less drop-offs – more paying customers.
              </p>
            </div>
          </div> */}
          
          {/* Card 3 */}
          {/* <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'visible',
            width: '350px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ height: '200px', overflow: 'visible' }}>
              <img 
                src="/content/card3.jpg" 
                alt="Stop Wasting Time on Manual Work" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                textTransform: 'uppercase'
              }}>
                STOP WASTING TIME ON MANUAL WORK
              </h3>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                No signups, no OTPs. Customer texts – instant booking with their verified details.
              </p>
            </div>
          </div> */}
        {/* </div> */}
      {/* </section> */}
    </>
  );
};

export default HeroSectionWithSpacer;