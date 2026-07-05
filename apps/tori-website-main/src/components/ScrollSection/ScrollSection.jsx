import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollSection.css';
import {
  createRafScrollListener,
  getStickyProgress,
  isMobileViewport,
} from '@/lib/mobile-animation';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: 1,
    image: "/images/aimfit.avif",
    quote: "Most of our customer conversations already happen on WhatsApp, but managing enquiries, timings, and follow-ups manually gets messy very quickly. Toriate gave us a cleaner way to think about bookings — customers can interact through WhatsApp, and the business gets better visibility instead of depending only on scattered chats",
    name: "Bengaluru",
    studio: "Aimfit Gym"

  },
  {
    id: 2,
    image: "/images/testimonials/sanjiwani.png",
    quote: "For a clinic, the problem is not just taking one appointment. It is remembering follow-ups, managing timing changes, and reducing the back-and-forth between staff and patients. Toriate’s WhatsApp-based booking flow makes the process feel familiar for patients while giving the clinic a more organized way to handle appointments.",
    name: "Hyderabad",
    studio: "Sanjiwani Chikitsa Kendra"
  },
  {
    id: 3,
    image: "/images/testimonials/poorna.png",
    quote: "Our patients and staff are already comfortable with WhatsApp, so the idea of moving appointment booking into a structured WhatsApp flow made sense immediately. Toriate helps reduce the confusion of manual coordination and gives the team a clearer view of bookings, timing, and appointment status.",
    name: "Bengaluru",
    studio: "Poorna Neuro"
  },
  {
    id: 4,
    image: "/images/asf.png",
    quote: "In yoga and fitness, customers often ask about batches, timings, and availability through WhatsApp. Toriate makes that experience more structured. Instead of manually replying to every booking-related message, the customer journey can happen inside WhatsApp while the business gets a cleaner dashboard to track appointments.",
    name: "Bengaluru",
    studio: "Ashish Yoga Fitness"
  }
];

const TestimonialCard = ({ data }) => {
  return (
    <div className="t-card">
      <div className="t-card-video-wrap">
        <Image
          src={data.image}
          alt={`${data.studio} testimonial`}
          className="t-card-video"
          fill
          sizes="(max-width: 768px) 86vw, 380px"
          loading="lazy"
        />
        {/* Uncomment when testimonial photos are replaced with videos.
        {!isPlaying && (
          <button className="t-card-play-btn" onClick={togglePlay}>
            <span>▶</span> Play
          </button>
        )}
        {isPlaying && (
           <button className="t-card-play-btn" onClick={togglePlay} style={{opacity: 0.5}}>
            <span>II</span> Pause
          </button>
        )}
        */}
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
  const railRef = useRef(null); // This acts as ".cards"
  const outlineRef = useRef(null);
  const fillRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky = stickyRef.current;
    const rail = railRef.current;
    const outlineCanvas = outlineRef.current;
    const fillCanvas = fillRef.current;

    if (!wrapper || !sticky || !rail || !outlineCanvas || !fillCanvas) return;

    const isMobile = isMobileViewport();

    const outlineCtx = outlineCanvas.getContext("2d");
    const fillCtx = fillCanvas.getContext("2d");

    // --- Provided Script Logic ---

    const stickyHeight = window.innerHeight * 5;

    function setCanvasSize(canvas, ctx) {
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2);
      // Force canvas to match viewport dimensions exactly without scrollbars
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100svh';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setCanvasSize(outlineCanvas, outlineCtx);
    setCanvasSize(fillCanvas, fillCtx);

    const triangleSize = isMobile ? 150 : 150;
    const lineWidth = 1;
    const SCALE_THRESHOLD = 0.01;
    const triangleStates = new Map();
    let animationFrameId = null;
    let canvasXPosition = 0;

    function drawTriangle(ctx, x, y, fillScale = 0, flipped = false) {
      const halfSize = triangleSize / 2;

      if (fillScale < SCALE_THRESHOLD) {
        ctx.beginPath();
        if (!flipped) {
          ctx.moveTo(x, y - halfSize);
          ctx.lineTo(x + halfSize, y + halfSize);
          ctx.lineTo(x - halfSize, y + halfSize);
        } else {
          ctx.moveTo(x, y + halfSize);
          ctx.lineTo(x + halfSize, y - halfSize);
          ctx.lineTo(x - halfSize, y - halfSize);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.075)";
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }

      if (fillScale >= SCALE_THRESHOLD) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(fillScale, fillScale);
        ctx.translate(-x, -y);

        ctx.beginPath();
        if (!flipped) {
          ctx.moveTo(x, y - halfSize);
          ctx.lineTo(x + halfSize, y + halfSize);
          ctx.lineTo(x - halfSize, y + halfSize);
        } else {
          ctx.moveTo(x, y + halfSize);
          ctx.lineTo(x + halfSize, y - halfSize);
          ctx.lineTo(x - halfSize, y - halfSize);
        }
        ctx.closePath();
        ctx.fillStyle = "#E6F2FF";
        ctx.strokeStyle = "#8AB9EB";
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }
    }

    function drawGrid(scrollProgress = 0) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      outlineCtx.clearRect(0, 0, outlineCanvas.width, outlineCanvas.height);
      fillCtx.clearRect(0, 0, fillCanvas.width, fillCanvas.height);

      const animationProgress =
        scrollProgress <= 0.65 ? 0 : (scrollProgress - 0.65) / 0.35;

      let needsUpdate = false;
      const animationSpeed = 0.15;

      triangleStates.forEach((state, key) => {
        // Draw all outlines regardless of scale to ensure full grid visibility
        // Calculate x with canvasXPosition for horizontal scrolling effect
        const x = state.col * (triangleSize * 0.5) + triangleSize / 2 + canvasXPosition;

        // Only draw if within visible viewport range to optimize and prevent artifacts
        if (x > -triangleSize && x < outlineCanvas.width + triangleSize) {
            const y = state.row * triangleSize + triangleSize / 2;
            const flipped = (state.row + state.col) % 2 !== 0;
            drawTriangle(outlineCtx, x, y, 0, flipped);
        }
      });

      triangleStates.forEach((state, key) => {
        const shouldBeVisible = animationProgress > 0 && state.order <= animationProgress;
        const targetScale = shouldBeVisible ? 1 : 0;
        const newScale =
          state.scale + (targetScale - state.scale) * animationSpeed;

        if (Math.abs(newScale - state.scale) > 0.001) {
          state.scale = newScale;
          needsUpdate = true;
        }

        if (state.scale >= SCALE_THRESHOLD) {
          const x = state.col * (triangleSize * 0.5) + triangleSize / 2 + canvasXPosition;

          if (x > -triangleSize && x < fillCanvas.width + triangleSize) {
              const y = state.row * triangleSize + triangleSize / 2;
              const flipped = (state.row + state.col) % 2 !== 0;
              drawTriangle(fillCtx, x, y, state.scale, flipped);
          }
        }
      });

      if (needsUpdate) {
        animationFrameId = requestAnimationFrame(() => drawGrid(scrollProgress));
      }
    }

    function initializeTriangles() {
      // Calculate extra columns to cover the scrolling area
      // We scroll by window.innerWidth * 2, so we need width * 3 total coverage roughly
      const extraWidth = window.innerWidth * (isMobile ? 2.25 : 3.5);
      const totalWidth = window.innerWidth + extraWidth;

      const cols = Math.ceil(totalWidth / (triangleSize * 0.5));
      const rows = Math.ceil(window.innerHeight / (triangleSize * 0.5));
      const totalTriangles = rows * cols;

      const positions = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          positions.push({ row: r, col: c, key: `${r}-${c}` });
        }
      }

      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
      }

      positions.forEach((pos, index) => {
        triangleStates.set(pos.key, {
          order: index / totalTriangles,
          scale: 0,
          row: pos.row,
          col: pos.col,
        });
      });
    }

    initializeTriangles();
    drawGrid();

    let resizeFrameId = null;
    const handleResize = () => {
      if (resizeFrameId) cancelAnimationFrame(resizeFrameId);

      resizeFrameId = requestAnimationFrame(() => {
        setCanvasSize(outlineCanvas, outlineCtx);
        setCanvasSize(fillCanvas, fillCtx);
        triangleStates.clear();
        initializeTriangles();
        drawGrid();
      });
    };

    window.addEventListener("resize", handleResize);

    const getHorizontalDistance = () =>
      Math.max(
        0,
        rail.scrollWidth -
          window.innerWidth +
          window.innerWidth * 0.06
      );

    // Mobile: native position:sticky (CSS) drives the pin, and a plain
    // rAF-based scroll listener drives the rail transform + canvas grid.
    // GSAP ScrollTrigger's own pin:true mechanism was found to permanently
    // freeze page scroll on real mobile browsers (the pin never releases),
    // which is the same class of bug already fixed in every other pinned
    // section on this site by switching away from ScrollTrigger's pin.
    if (isMobile) {
      const updateTestimonials = () => {
        const progress = getStickyProgress(wrapper);
        const x = -progress * getHorizontalDistance();
        rail.style.transform = `translate3d(${x}px, 0, 0)`;
        canvasXPosition = -progress * 200;
        drawGrid(progress);
      };

      const stopScrollListener = createRafScrollListener(updateTestimonials);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        stopScrollListener();
      };
    }

    const triggerTween = gsap.to(rail, {
      x: () => -getHorizontalDistance(),
      force3D: true,
      ease: "none",
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top top",
        end: `+=${stickyHeight}px`,
        pin: true,
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          canvasXPosition = -self.progress * 200;
          drawGrid(self.progress);
        },
      },
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      triggerTween.scrollTrigger?.kill();
      triggerTween.kill();
    };
  }, []);

  return (
    <div className="testimonials-spacer" ref={wrapperRef}>
      <div className="testimonials-sticky-viewport" ref={stickyRef}>

        {/* Background Grid - Replaced with 2 Canvases */}
        <div className="testimonials-bg">
            <picture>
              <source media="(max-width: 768px)" srcSet="/images/hero-mobile.webp" type="image/webp" />
              <img src="/images/hero.webp" alt="" loading="lazy" decoding="async" />
            </picture>
        </div>

        {/* Outline Layer (Z-Index 1) */}
        <canvas className="outline-layer" ref={outlineRef} />

        {/* Fill Layer (Z-Index 3) */}
        <canvas className="fill-layer" ref={fillRef} />

        {/* Cards Rail (Z-Index 2 - should be between layers according to reference styles, but checking z-indexes...)
            Reference styles: outline=1, fill=3, cards=2.
            So cards should be BETWEEN outline and fill.
        */}
        <div className="testimonials-rail" ref={railRef} style={{ zIndex: 2 }}>
          {testimonials.map(t => (
            <TestimonialCard key={t.id} data={t} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default ScrollSection;
