// import gsap from "gsap";
// import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
// import { ScrollTrigger } from "gsap/ScrollTrigger";

  // At the top of each JS file that needs these libraries
const { gsap, ScrollTrigger } = window;
const THREE = window.THREE;
const VANTA = window.VANTA;

// Then use them normally
gsap.to(".element", { opacity: 1 });

  gsap.registerPlugin(ScrollTrigger);
  // Lenis removed: rely on native scroll and ScrollTrigger
  gsap.ticker.lagSmoothing(0);

  const animatedIcons = document.querySelector(".hero-animated-icons");
  const iconElements = document.querySelectorAll(".hero-animated-icon");
  const textSegments = document.querySelectorAll(".hero-text-segment");
  const placeholders = document.querySelectorAll(".hero-placeholder-icon");
  const heroHeader = document.querySelector(".hero-header-home");
  const heroSection = document.querySelector(".hero-home");

  const textAnimationOrder = [];
  textSegments.forEach((segment, index) => {
    textAnimationOrder.push({ segment, originalIndex: index });
  });

  for (let i = textAnimationOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [textAnimationOrder[i], textAnimationOrder[j]] = [
      textAnimationOrder[j],
      textAnimationOrder[i],
    ];
  }

  const isMobile = window.innerWidth <= 1000;
  const headerIconSize = isMobile ? 30 : 60;
  const currentIconSize = iconElements[0].getBoundingClientRect().width;
  const exactScale = headerIconSize / currentIconSize;

  // Set initial background
  heroSection.style.backgroundColor = "#141414";

  ScrollTrigger.create({
    trigger: ".hero-home",
    start: "top top",
    end: `+=${window.innerHeight * 4}px`,
    pin: true,
    pinSpacing: false,
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      // Get elements that should be hidden initially
      const heroAnimatedText = document.querySelector('.hero-animated-text');
      const ctaButton = document.querySelector('.btn');
      
      // Hide second screen elements until progress reaches appropriate point
      if (progress < 0.6) {
        heroAnimatedText?.classList.remove('show');
        ctaButton?.classList.remove('show');
      } else if (progress >= 0.8) {
        // Show second screen elements when text animation should start
        heroAnimatedText?.classList.add('show');
        ctaButton?.classList.add('show');
      }

      textSegments.forEach((segment) => {
        gsap.set(segment, { opacity: 0 });
      });

      if (progress <= 0.3) {
        const moveProgress = progress / 0.3;
        const containerMoveY = -window.innerHeight * 0.3 * moveProgress;

        // Keep background dark in first phase
        heroSection.style.backgroundColor = "#141414";

        // ADDED: Hide subtitle in first phase
        const subtitle = document.querySelector('.hero-text-segment-2');
        const subtitleParent = document.querySelector('.hero-animated-text h2');
        if (subtitle) {
          subtitle.style.opacity = '0';
          subtitle.style.visibility = 'hidden';
        }
        if (subtitleParent) {
          subtitleParent.style.opacity = '0';
          subtitleParent.style.visibility = 'hidden';
        }

        if (progress <= 0.15) {
          const headerProgress = progress / 0.15;
          const headerMoveY = -50 * headerProgress;
          const headerOpacity = 1 - headerProgress;

          gsap.set(heroHeader, {
            transform: `translate(-50%, calc(-50% + ${headerMoveY}px))`,
            opacity: headerOpacity,
          });
        } else {
          gsap.set(heroHeader, {
            transform: `translate(-50%, calc(-50% + -50px))`,
            opacity: 0,
          });
        }

        if (window.duplicateIcons) {
          window.duplicateIcons.forEach((duplicate) => {
            if (duplicate.parentNode) {
              duplicate.parentNode.removeChild(duplicate);
            }
          });
          window.duplicateIcons = null;
        }

        gsap.set(animatedIcons, {
          x: 0,
          y: containerMoveY,
          scale: 1,
          opacity: 1,
        });

        iconElements.forEach((icon, index) => {
          const staggerDelay = index * 0.15;
          const iconStart = staggerDelay;
          const iconEnd = staggerDelay + 0.7;

          const iconProgress = gsap.utils.mapRange(
            iconStart,
            iconEnd,
            0,
            1,
            moveProgress
          );
          const clampedProgress = Math.max(0, Math.min(1, iconProgress));

          const startOffset = -containerMoveY;
          const individualY = startOffset * (1 - clampedProgress);

          gsap.set(icon, {
            x: 0,
            y: individualY,
          });
        });
      } else if (progress <= 0.6) {
        const scaleProgress = (progress - 0.3) / 0.3;

        gsap.set(heroHeader, {
          transform: `translate(-50%, calc(-50% + -50px))`,
          opacity: 0,
        });

        // ADDED: Hide subtitle in second phase
        const subtitle = document.querySelector('.hero-text-segment-2');
        const subtitleParent = document.querySelector('.hero-animated-text h2');
        if (subtitle) {
          subtitle.style.opacity = '0';
          subtitle.style.visibility = 'hidden';
        }
        if (subtitleParent) {
          subtitleParent.style.opacity = '0';
          subtitleParent.style.visibility = 'hidden';
        }

        // Background transition happens here (slower)
        if (scaleProgress >= 0.7) {
          heroSection.style.backgroundColor = "transparent";
        } else {
          heroSection.style.backgroundColor = "#141414";
        }

        if (window.duplicateIcons) {
          window.duplicateIcons.forEach((duplicate) => {
            if (duplicate.parentNode) {
              duplicate.parentNode.removeChild(duplicate);
            }
          });
          window.duplicateIcons = null;
        }

        const targetCenterY = window.innerHeight / 2;
        const targetCenterX = window.innerWidth / 2;
        const containerRect = animatedIcons.getBoundingClientRect();
        const currentCenterX = containerRect.left + containerRect.width / 2;
        const currentCenterY = containerRect.top + containerRect.height / 2;
        
        // Apply easing to make scaling smoother
        const easedProgress = gsap.utils.interpolate(0, 1, Math.pow(scaleProgress, 0.6));
        
        const deltaX = (targetCenterX - currentCenterX) * easedProgress;
        const deltaY = (targetCenterY - currentCenterY) * easedProgress;
        const baseY = -window.innerHeight * 0.3;
        const currentScale = 1 + (exactScale - 1) * easedProgress;

        gsap.set(animatedIcons, {
          x: deltaX,
          y: baseY + deltaY,
          scale: currentScale,
          opacity: 1,
        });

        iconElements.forEach((icon) => {
          gsap.set(icon, { x: 0, y: 0 });
        });
      } else if (progress <= 0.8) {
        const moveProgress = (progress - 0.6) / 0.2;

        gsap.set(heroHeader, {
          transform: `translate(-50%, calc(-50% + -50px))`,
          opacity: 0,
        });

        heroSection.style.backgroundColor = "transparent";

        // ADDED: Hide subtitle in third phase
        const subtitle = document.querySelector('.hero-text-segment-2');
        const subtitleParent = document.querySelector('.hero-animated-text h2');
        if (subtitle) {
          subtitle.style.opacity = '0';
          subtitle.style.visibility = 'hidden';
        }
        if (subtitleParent) {
          subtitleParent.style.opacity = '0';
          subtitleParent.style.visibility = 'hidden';
        }

        const targetCenterY = window.innerHeight / 2;
        const targetCenterX = window.innerWidth / 2;
        const containerRect = animatedIcons.getBoundingClientRect();
        const currentCenterX = containerRect.left + containerRect.width / 2;
        const currentCenterY = containerRect.top + containerRect.height / 2;
        const deltaX = targetCenterX - currentCenterX;
        const deltaY = targetCenterY - currentCenterY;
        const baseY = -window.innerHeight * 0.3;

        gsap.set(animatedIcons, {
          x: deltaX,
          y: baseY + deltaY,
          scale: exactScale,
          opacity: 1,
        });

        iconElements.forEach((icon) => {
          gsap.set(icon, { x: 0, y: 0 });
        });

        if (!window.duplicateIcons) {
          window.duplicateIcons = [];

          iconElements.forEach((icon, index) => {
            const duplicate = icon.cloneNode(true);
            duplicate.className = "duplicate-icon";
            duplicate.style.position = "absolute";
            duplicate.style.width = headerIconSize + "px";
            duplicate.style.height = headerIconSize + "px";

            document.body.appendChild(duplicate);
            window.duplicateIcons.push(duplicate);
          });
        }

        if (window.duplicateIcons) {
          window.duplicateIcons.forEach((duplicate, index) => {
            if (index < placeholders.length) {
              const iconRect = iconElements[index].getBoundingClientRect();
              const startCenterX = iconRect.left + iconRect.width / 2;
              const startCenterY = iconRect.top + iconRect.height / 2;
              const startPageX = startCenterX + window.pageXOffset;
              const startPageY = startCenterY + window.pageYOffset;

              const targetRect = placeholders[index].getBoundingClientRect();
              const targetCenterX = targetRect.left + targetRect.width / 2;
              const targetCenterY = targetRect.top + targetRect.height / 2;
              const targetPageX = targetCenterX + window.pageXOffset;
              const targetPageY = targetCenterY + window.pageYOffset;

              const moveX = targetPageX - startPageX;
              const moveY = targetPageY - startPageY;

              let currentX = 0;
              let currentY = 0;

              // Slower, more controlled movement with easing
              if (moveProgress <= 0.6) {
                const verticalProgress = moveProgress / 0.6;
                const easedVertical = Math.pow(verticalProgress, 0.8);
                currentY = moveY * easedVertical;
              } else {
                const horizontalProgress = (moveProgress - 0.6) / 0.4;
                const easedHorizontal = Math.pow(horizontalProgress, 0.8);
                currentY = moveY;
                currentX = moveX * easedHorizontal;
              }

              const finalPageX = startPageX + currentX;
              const finalPageY = startPageY + currentY;

              duplicate.style.left = finalPageX - headerIconSize / 2 + "px";
              duplicate.style.top = finalPageY - headerIconSize / 2 + "px";
              duplicate.style.opacity = "1";
              duplicate.style.display = "flex";
            }
          });
        }
      } else {
        // Final phase 80-100%
        gsap.set(heroHeader, {
          transform: `translate(-50%, calc(-50% + -100px))`,
          opacity: 0,
        });

        heroSection.style.backgroundColor = "transparent";
        gsap.set(animatedIcons, { opacity: 0 });

        // UPDATED: Force subtitle to show with BLACK color and REDUCED spacing
        const subtitle = document.querySelector('.hero-text-segment-2');
        const subtitleParent = document.querySelector('.hero-animated-text h2');
        
        if (subtitle) {
          subtitle.setAttribute('style', 'opacity: 1 !important; visibility: visible !important; display: inline !important; color: #d1d1d1 !important; font-size: 1.5vw !important; font-weight: 800 !important; line-height: 1 !important;');
        }
        
        if (subtitleParent) {
          subtitleParent.setAttribute('style', 'opacity: 1 !important; visibility: visible !important; display: block !important; margin-top: 5px !important;');
        }

        // Ensure duplicate icons are positioned correctly
        if (window.duplicateIcons) {
          window.duplicateIcons.forEach((duplicate, index) => {
            if (index < placeholders.length) {
              const targetRect = placeholders[index].getBoundingClientRect();
              const targetCenterX = targetRect.left + targetRect.width / 2;
              const targetCenterY = targetRect.top + targetRect.height / 2;
              const targetPageX = targetCenterX + window.pageXOffset;
              const targetPageY = targetCenterY + window.pageYOffset;

              duplicate.style.left = targetPageX - headerIconSize / 2 + "px";
              duplicate.style.top = targetPageY - headerIconSize / 2 + "px";
              duplicate.style.opacity = "1";
              duplicate.style.display = "flex";
            }
          });
        }

        // Text animation with more spacing
        textAnimationOrder.forEach((item, randomIndex) => {
          const segmentStart = 0.8 + randomIndex * 0.03;
          const segmentEnd = segmentStart + 0.02;

          const segmentProgress = gsap.utils.mapRange(
            segmentStart,
            segmentEnd,
            0,
            1,
            progress
          );
          const clampedProgress = Math.max(0, Math.min(1, segmentProgress));

          gsap.set(item.segment, {
            opacity: clampedProgress,
          });
        });
      }
    },
  });
});

// INTRO SECTION -->
