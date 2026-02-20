"use client";
import "./ClientReviews.css";
import clientReviewsContent from "./client-reviews-content";

import { useState, useEffect, useRef } from "react";

import { gsap } from "gsap";

const ClientReviews = () => {
  const [activeClient, setActiveClient] = useState(0);
  const [visualClient, setVisualClient] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [nextImage, setNextImage] = useState(null);
  const clientRefs = useRef([]);
  const containerRef = useRef(null);
  const lineRefs = useRef([]);
  const clientInfoRefs = useRef([]);
  const imageContainerRef = useRef(null);
  const masterTimelineRef = useRef(null);

  const getExpandedWidth = () => {
    if (!containerRef.current) return "10rem";

    const containerWidth = containerRef.current.offsetWidth;
    const padding = 16;
    const gap = 4;
    const inactiveItemWidth = 48;
    const inactiveItems = clientReviewsContent.length - 1;

    const remainingSpace =
      containerWidth -
      padding -
      inactiveItemWidth * inactiveItems -
      gap * inactiveItems;

    return `${remainingSpace}px`;
  };

  const handleNextImageLoad = (event) => {
    gsap.to(event.currentTarget, {
      opacity: 1,
      duration: 1,
      delay: 0.5,
      ease: "power2.out",
      onComplete: () => {
        setNextImage(null);
      },
    });
  };

  useEffect(() => {
    gsap.set(clientRefs.current, {
      width: "3rem",
    });

    gsap.set(clientInfoRefs.current, {
      opacity: 0,
    });

    if (clientRefs.current[0]) {
      const expandedWidth = getExpandedWidth();
      gsap.to(clientRefs.current[0], {
        width: expandedWidth,
        duration: 0.75,
        ease: "power4.inOut",
      });
    }

    if (clientInfoRefs.current[0]) {
      gsap.to(clientInfoRefs.current[0], {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    return () => {
    };
  }, []);

  useEffect(() => {
    const lines = lineRefs.current.filter(Boolean);
    if (lines.length === 0) return;
    gsap.set(lines, { y: "110%" });
    gsap.to(lines, {
      y: "0%",
      duration: 0.5,
      stagger: 0.05,
      ease: "power4.out",
    });
  }, [activeClient]);

  const handleClientClick = (index) => {
    if (index === activeClient || isAnimating) return;

    if (masterTimelineRef.current) {
      masterTimelineRef.current.kill();
    }

    setIsAnimating(true);

    const expandedWidth = getExpandedWidth();

    masterTimelineRef.current = gsap.timeline();
    const tl = masterTimelineRef.current;

    if (clientInfoRefs.current[visualClient]) {
      tl.to(
        clientInfoRefs.current[visualClient],
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        0
      );
    }

    tl.to(
      clientRefs.current[activeClient],
      {
        width: "3rem",
        duration: 0.75,
        ease: "power4.inOut",
      },
      0
    ).to(
      clientRefs.current[index],
      {
        width: expandedWidth,
        duration: 0.75,
        ease: "power4.inOut",
      },
      0
    );

    tl.call(
      () => {
        setVisualClient(index);
      },
      [],
      0.2
    );

    tl.to(
      {},
      {
        duration: 0.1,
        onComplete: () => {
          if (clientInfoRefs.current[index]) {
            const clientInfoAnim = gsap.to(clientInfoRefs.current[index], {
              opacity: 0,
              duration: 0,
              ease: "power2.out",
              onComplete: () => {
                gsap.to(clientInfoRefs.current[index], {
                  opacity: 1,
                  duration: 0.5,
                  ease: "power2.out",
                });
              },
            });
            tl.add(clientInfoAnim, 0.5);
          }
        },
      },
      0.5
    );

    setNextImage(clientReviewsContent[index].image);

    const lines = lineRefs.current.filter(Boolean);
    if (lines.length > 0) {
      const textOutAnim = gsap.to(lines, {
        y: "-110%",
        duration: 0.5,
        stagger: 0.05,
        ease: "power4.in",
        onComplete: () => {
          setActiveClient(index);
        },
      });
      tl.add(textOutAnim, 0);
    } else {
      setActiveClient(index);
    }

    tl.call(() => {
      setTimeout(() => {
        setIsAnimating(false);
        masterTimelineRef.current = null;
      }, 250);
    });
  };

  return (
    <div className="client-reviews">
      <div className="container">
        <div className="client-reviews-wrapper">
          <div className="client-review-content">
            <div className="client-review-img" ref={imageContainerRef}>
              <img src={clientReviewsContent[activeClient].image} alt="" />
              {nextImage && (
                <img
                  src={nextImage}
                  alt=""
                  className="fade-in-overlay"
                  onLoad={handleNextImageLoad}
                />
              )}
            </div>
            <div className="client-review-copy">
              <div className="text-wrapper">
                <h3>
                  {String(clientReviewsContent[activeClient].review)
                    .replace(/\\n/g, "\n")
                    .split(/\r?\n/)
                    .map((line, i, arr) => {
                      const processLine = (text, lineIndex) => {
                        if (clientReviewsContent[activeClient].name !== "Ayush")
                          return text;

                        const keywords = [
                          "Engineering",
                          "BITS Pilani",
                          "Won Smart India Hackathon",
                          "among 0.7M people",
                          "Won Inspire Manak Awards",
                          "Govt of India",
                        ];

                        let parts = [text];

                        keywords.forEach((keyword) => {
                          const newParts = [];
                          parts.forEach((part) => {
                            if (typeof part !== "string") {
                              newParts.push(part);
                              return;
                            }

                            const regex = new RegExp(`(${keyword})`, "gi");
                            const split = part.split(regex);

                            split.forEach((s, splitIndex) => {
                              if (s.toLowerCase() === keyword.toLowerCase()) {
                                newParts.push(
                                  <span
                                    className="highlight-text"
                                    key={`${keyword}-${lineIndex}-${splitIndex}`}
                                  >
                                    {s}
                                  </span>
                                );
                              } else if (s) {
                                newParts.push(s);
                              }
                            });
                          });
                          parts = newParts;
                        });

                        return parts;
                      };

                      return (
                        <span key={i}>
                        <span ref={(el) => (lineRefs.current[i] = el)}>
                          {processLine(line, i)}
                        </span>
                          {i < arr.length - 1 && <br />}
                        </span>
                      );
                    })}
                </h3>
              </div>
            </div>
          </div>
          <div className="clients-list" ref={containerRef}>
            {clientReviewsContent.map((client, index) => (
              <div
                key={client.id}
                ref={(el) => (clientRefs.current[index] = el)}
                className={`client-item ${
                  index === visualClient ? "active" : ""
                } ${isAnimating ? "animating" : ""}`}
                onClick={() => handleClientClick(index)}
              >
                <div className="client-avatar">
                  <img src={client.avatar} alt={client.name} />
                </div>
                {index === visualClient && (
                  <div
                    className="client-info"
                    ref={(el) => (clientInfoRefs.current[index] = el)}
                    style={{ opacity: 0 }}
                  >
                    <p className="client-name md">{client.name}</p>
                    <p className="client-title">{client.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientReviews;
