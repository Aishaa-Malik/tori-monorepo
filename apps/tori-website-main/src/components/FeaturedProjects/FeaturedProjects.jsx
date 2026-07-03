"use client";
import "./FeaturedProjects.css";
import featuredProjectsContent from "./featured-projects-content";
import AnimatedBodyText from "../AnimatedBodyText/AnimatedBodyText";
import Image from "next/image";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMobileViewport } from "@/lib/mobile-animation";

const FeaturedProjects = () => {
  const sectionRef = useRef(null);
  const lenis = useLenis();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!lenis) return;

    const updateScrollTrigger = () => ScrollTrigger.update();
    lenis.on("scroll", updateScrollTrigger);

    return () => {
      lenis.off("scroll", updateScrollTrigger);
    };
  }, [lenis]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const featuredProjectCards = gsap.utils.toArray(".featured-project-card");

      featuredProjectCards.forEach((featuredProjectCard, index) => {
        if (index < featuredProjectCards.length - 1) {
          const featuredProjectCardInner = featuredProjectCard.querySelector(
            ".featured-project-card-inner"
          );
          const featuredProjectCardScrim = featuredProjectCard.querySelector(
            ".featured-project-card-scrim"
          );

          gsap.fromTo(
            featuredProjectCardInner,
            {
              y: "0%",
              z: 0,
              rotationX: 0,
            },
            {
              y: "-50%",
              z: -250,
              rotationX: 45,
              force3D: true,
              ease: "none",
              scrollTrigger: {
                trigger: featuredProjectCards[index + 1],
                start: "top 100%",
                end: "top -75%",
                scrub: true,
                pin: featuredProjectCard,
                anticipatePin: 1,
                pinSpacing: false,
                invalidateOnRefresh: true,
              },
            }
          );

          if (featuredProjectCardScrim) {
            gsap.to(featuredProjectCardScrim, {
              opacity: 0.32,
              ease: "none",
              scrollTrigger: {
                trigger: featuredProjectCards[index + 1],
                start: "top 75%",
                end: "top 0%",
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
          }
        }
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const cloudinaryOrigin = "https://res.cloudinary.com";
    const existingPreconnect = document.querySelector(
      `link[rel="preconnect"][href="${cloudinaryOrigin}"]`
    );

    if (!existingPreconnect) {
      const preconnect = document.createElement("link");
      preconnect.rel = "preconnect";
      preconnect.href = cloudinaryOrigin;
      preconnect.crossOrigin = "anonymous";
      document.head.appendChild(preconnect);
    }

    const videos = Array.from(
      sectionRef.current?.querySelectorAll(".featured-project-card-img video") || []
    );

    if (!videos.length) return;

    const shouldSaveData =
      window.matchMedia?.("(prefers-reduced-data: reduce)").matches ||
      navigator.connection?.saveData;
    const isMobile = isMobileViewport();
    const visibility = new Map();
    let rafId = 0;
    const preloadVideo = (video) => {
      if (shouldSaveData || video.dataset.preloaded === "true") return;
      video.dataset.preloaded = "true";
      video.preload = "auto";
      video.load();
    };

    const playVideo = (video) => {
      if (shouldSaveData) return;
      preloadVideo(video);
      video.play().catch(() => {});
    };

    const syncActiveVideo = () => {
      rafId = 0;

      let activeVideo = null;
      let activeRatio = 0;

      videos.forEach((video) => {
        const ratio = visibility.get(video) || 0;
        if (ratio >= activeRatio) {
          activeRatio = ratio;
          activeVideo = video;
        }
      });

      videos.forEach((video) => {
        if (video === activeVideo && activeRatio > 0.18) {
          playVideo(video);
        } else {
          video.pause();
        }
      });
    };

    const scheduleSync = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(syncActiveVideo);
    };

    if (!("IntersectionObserver" in window)) {
      videos.slice(0, isMobile ? 3 : 1).forEach(preloadVideo);
      playVideo(videos[0]);
      return;
    }

    const preloadObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          preloadVideo(entry.target);
          preloadObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: `${isMobile ? 900 : 900}px 0px`,
        threshold: 0,
      }
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          visibility.set(video, entry.isIntersecting ? entry.intersectionRatio : 0);
          scheduleSync();
        });
      },
      {
        rootMargin: `${isMobile ? 420 : 0}px 0px`,
        threshold: [0, 0.18, 0.35, 0.55, 0.75, 0.95],
      }
    );

    videos.slice(0, isMobile ? 1 : 2).forEach(preloadVideo);

    videos.forEach((video) => {
      if (isMobile) {
        if (video.dataset.preloaded !== "true") {
          video.preload = "metadata";
        }
        video.pause();
      } else {
        video.pause();
      }
      preloadObserver.observe(video);
      observer.observe(video);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      preloadObserver.disconnect();
      observer.disconnect();
      videos.forEach((video) => video.pause());
    };
  }, []);

  return (
    <>
      <div className="featured-projects" ref={sectionRef}>
        {featuredProjectsContent.map((project, index) => (
          <div
            key={index}
            className={`featured-project-card feature-theme-${(index % 10) + 1}`}
            style={{ zIndex: index + 1 }}
          >
            <div className="featured-project-card-inner">
              <div className="featured-project-card-content">
                <div className="featured-project-card-info">
                  <p>{project.info}</p>
                </div>
                <div className="featured-project-card-content-main">
                  <div className="featured-project-card-title">
                    <h2>{project.title}</h2>
                  </div>
                  <div className="featured-project-card-description">
                    <div className="lg">
                      {project.description.split("\n\n").map((paragraph, paragraphIndex) => (
                        <AnimatedBodyText
                          key={paragraphIndex}
                          className="feature-description-segment"
                          start="top 95%"
                          end="bottom 75%"
                        >
                          {paragraph}
                        </AnimatedBodyText>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {(project.video || project.image) && (
                <div className="featured-project-card-img">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 92vw, 560px"
                      loading="lazy"
                    />
                  ) : (
                    <video
                      src={project.video}
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      aria-label={project.title}
                    />
                  )}
                </div>
              )}
              <div className="featured-project-card-scrim" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FeaturedProjects;
