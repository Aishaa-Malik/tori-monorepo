"use client";
import "./Footer.css";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Copy from "../Copy/Copy";

import { RiLinkedinBoxLine } from "react-icons/ri";
import { RiInstagramLine } from "react-icons/ri";
import { RiDribbbleLine } from "react-icons/ri";
import { RiYoutubeLine } from "react-icons/ri";
import { createRevealObserver, isMobileViewport } from "@/lib/mobile-animation";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const socialIconsRef = useRef(null);

  useGSAP(
    () => {
      if (!socialIconsRef.current) return;

      const icons = socialIconsRef.current.querySelectorAll(".icon");
      gsap.set(icons, { opacity: 0, x: -40 });

      if (isMobileViewport()) {
        return createRevealObserver(
          socialIconsRef.current,
          () => {
            gsap.to(icons, {
              opacity: 1,
              x: 0,
              duration: 0.42,
              stagger: -0.05,
              ease: "power2.out",
            });
          },
          { rootMargin: "0px 0px -8% 0px" }
        );
      }

      ScrollTrigger.create({
        trigger: socialIconsRef.current,
        start: "top 90%",
        once: true,
        animation: gsap.to(icons, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: -0.1,
          ease: "power3.out",
        }),
      });
    },
    { scope: socialIconsRef }
  );

  return (
    <div className="footer" id="contact">
      <div className="footer-meta">
        <div className="container footer-meta-header">
          <div className="footer-meta-col">
            <div className="footer-meta-block">
              <div className="footer-meta-logo">
                <h3 className="lg">
                  Unshakeable Promise <span className="footer-promise-emoji">❤️</span>
                </h3>
              </div>
              <Copy delay={0.2}>
                <div className="footer-promise-panel">
                  <p className="footer-promise-lead">
                    Technology is cold. We are not. Every subscription helps fund work for people, animals & the planet. Kindness should not wait for profitability, rain or shine.
                  </p>
                  <div className="footer-promise-grid">
                    <div className="footer-promise-card">
                      <span>5%</span>
                      <p>of revenue is locked to this mission forever.</p>
                    </div>
                    <div className="footer-promise-card">
                      <span>🐕</span>
                      <p>Street animals, forgotten communities & real lives come first.</p>
                    </div>
                    <div className="footer-promise-card">
                      <span>🌳</span>
                      <p>From transforming lives to creating new forests.</p>
                    </div>
                  </div>
                </div>
              </Copy>
            </div>
          </div>
          <div className="footer-meta-col">
            <div className="footer-nav-links">
              <Copy delay={0.1}>
                <a href="/growth#roi-calculator">
                  <h3>ROI Calculator</h3>
                </a>
                <a href="/growth#why-switch">
                  <h3>Why switch from your software?</h3>
                </a>
                <a href="/privacy-policy">
                  <h3>Privacy Policy</h3>
                </a>
                <a href="/terms-and-conditions">
                  <h3>Terms & Conditions</h3>
                </a>
              </Copy>
              <div className="footer-socials-wrapper" ref={socialIconsRef}>
                <a
                  className="icon"
                  href="https://www.linkedin.com/company/tori-ate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <RiLinkedinBoxLine />
                </a>
                <a
                  className="icon"
                  href="https://www.instagram.com/toriatedubai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <RiInstagramLine />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-outro">
        <div className="container">
          <div className="footer-header">
            <img src="/logos/terrene-footer-logo.svg" alt="" loading="lazy" decoding="async" />
          </div>
          <div className="footer-copyright">
            <p>Made with ❤️ by <a href="https://www.69kelvin.com" target="_blank" rel="noopener noreferrer">69 Kelvin</a></p>
            <p>Incorp in Delaware, USA 🥰</p>
            <p> &copy; 2026 Tori Ate Inc</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
