import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollSection.css';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: 1,
    image: "/images/rev-1.png",
    quote: "Tori takes bookings 24/7, so even if I'm not present in the clinic, I never miss a patient.",
    name: "Patients get instant confirmation and automatic reminders.",
    studio: "Navneet Grover - Physiotherapist"
  },
  {
    id: 2,
    image: "/images/rev-4-4.png",
    quote: "Patients can EASILY BOOK their APPOINTMENTS, SURGERIES, and MEDICAL PURCHASES.",
    name: "",
    studio: "Hitesh"
  },
  {
    id: 3,
    image: "/images/rev-2-2.png",
    quote: "From INSTANT PATIENT RESPONSES to CONFIRMED APPOINTMENTS -everything happens DIRECTLY ON WHATSAPP." ,
    name: "saves my patients' time and helps my clinic GROW EFFORTLESSLY.",
    studio: "Tanvi Nagpal - Physiotherapist"
  },
  {
    id: 4,
    image: "/images/rev-3-3-3.png",
    quote: "A SOLID feature is its seamless integration with WHATSAPP, for those who don't want to download apps like fit pass, cult, dont have that much tech knowledge like people in 50s they can book workouts" ,
    name: "represents a revolutionary advancement in the Health and wellness domain, offering",
    studio: "Mamata Gujrati - Yoga Instructor"
  },
  {
    id: 5,
    image: "/images/rev-5-5-5.png",
    quote: "With TORI, customers book instantly while businesses grow" ,
    name: "",
    studio: "Dhruv Sharma - Turf Owner"
  },
  
];

const TestimonialCard = ({ data }) => {
  return (
    <div className="t-card">
      <div className="t-card-video-wrap">
        <img 
          src={data.image}
          alt={`Testimonial from ${data.name}`}
          className="t-card-video" // Keeping class name for layout consistency or should I change it?
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </div>
      <div className="t-card-divider"></div>
      <div className="t-card-content">
        <p className="t-card-quote">"{data.quote}"</p>
        <div className="t-card-author">
          <h3>{data.name}</h3>
          <p>{data.studio}</p>
        </div>
      </div>
    </div>
  );
};

const ScrollSection = () => {
  const wrapperRef = useRef(null);
  const stickyRef = useRef(null);
  const railRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky = stickyRef.current;
    const rail = railRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!wrapper || !sticky || !rail || !canvas) return;

    // --- 1. Horizontal Scroll Animation ---
    
    // Calculate how far the rail needs to move
    // Movement = (Rail Width - Viewport Width) + Padding
    const getScrollDistance = () => {
      const railWidth = rail.scrollWidth;
      const viewportWidth = window.innerWidth;
      return -(railWidth - viewportWidth + window.innerWidth * 0.1); // Add 10vw overscroll
    };

    const scrollAnim = gsap.fromTo(rail, 
      {
        x: 0 
      },
      {
        x: () => getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Increased scrub for smoother feel
          invalidateOnRefresh: true,
        }
      }
    );

    // --- 2. Canvas Triangle Grid Animation ---

    let width, height;
    const triangleSize = 150;
    const triangles = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      initTriangles();
      render(0); // Initial render
    };

    const initTriangles = () => {
      triangles.length = 0;
      const cols = Math.ceil(width / (triangleSize * 0.5));
      const rows = Math.ceil(height / triangleSize);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * (triangleSize * 0.5);
          const y = r * triangleSize + (c % 2 === 0 ? 0 : triangleSize / 2);
          const isFlipped = (c % 2 !== 0);
          
          // Randomize order slightly for the fill effect
          const order = (c / cols) + (Math.random() * 0.1); 
          
          triangles.push({ x, y, isFlipped, order, scale: 0 });
        }
      }
    };

    const drawTriangle = (x, y, scale, isFlipped, isFill) => {
      const s = triangleSize;
      const h = s * Math.sqrt(3) / 2; // height of equilateral triangle
      
      ctx.beginPath();
      if (!isFlipped) {
         ctx.moveTo(x, y);
         ctx.lineTo(x + s, y);
         ctx.lineTo(x + s / 2, y + h);
      } else {
         ctx.moveTo(x + s / 2, y);
         ctx.lineTo(x + s, y + h);
         ctx.lineTo(x, y + h);
      }
      ctx.closePath();

      if (isFill) {
        // Only draw fill if scale > 0.01
        if (scale > 0.01) {
            // Simple scaling approach: draw smaller triangle at center
            const cx = x + s/2;
            const cy = y + h/2; // Approx center
            
            // To properly scale, we'd need centroid math, but let's keep it simple and just use alpha or simple stroke for now to avoid artifacts
            // Actually, user wants "orange triangle". Let's use Alpha for smoothness or full fill.
            ctx.fillStyle = `rgba(255, 107, 0, ${scale})`; // Orange with opacity
            ctx.fill();
        }
      } else {
        // Outline
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const render = (progress) => {
      ctx.clearRect(0, 0, width, height);

      // Draw Outlines
      triangles.forEach(t => {
        drawTriangle(t.x, t.y, 1, t.isFlipped, false);
      });

      // Draw Fills based on progress
      // We map progress (0 to 1) to the triangles
      // We want them to start appearing after some scrolling
      const effectiveProgress = Math.max(0, (progress - 0.2) * 1.5); // Delayed start (0.2)
      
      triangles.forEach(t => {
        // Calculate scale/opacity based on order and progress
        // If progress > t.order, it starts filling
        let p = (effectiveProgress - t.order) * 3; // Reduced speed multiplier for smoother fill
        p = Math.max(0, Math.min(1, p)); // Clamp 0-1
        
        if (p > 0) {
            drawTriangle(t.x, t.y, p, t.isFlipped, true);
        }
      });
    };

    // Link Canvas Render to ScrollTrigger
    ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        render(self.progress);
      }
    });

    window.addEventListener('resize', resize);
    resize(); // Init

    return () => {
      window.removeEventListener('resize', resize);
      scrollAnim.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="testimonials-spacer" ref={wrapperRef}>
      <div className="testimonials-sticky-viewport" ref={stickyRef}>
        
        {/* Background Grid */}
        <div className="testimonials-bg">
            <img src="/images/hero.jpg" alt="" />
        </div>
        <canvas className="testimonials-canvas" ref={canvasRef} />

        {/* Content */}
        <div className="testimonials-header">
          <h2><span>Real Stories</span> Real Results</h2>
        </div>

        <div className="testimonials-rail" ref={railRef}>
          {testimonials.map(t => (
            <TestimonialCard key={t.id} data={t} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default ScrollSection;
