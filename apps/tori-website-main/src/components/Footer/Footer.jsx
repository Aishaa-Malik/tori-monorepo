"use client";
import "./Footer.css";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useViewTransition } from "@/hooks/useViewTransition";
import Copy from "../Copy/Copy";

import { RiLinkedinBoxLine } from "react-icons/ri";
import { RiInstagramLine } from "react-icons/ri";
import { RiMailLine } from "react-icons/ri";
import { RiMapPinLine } from "react-icons/ri";
import { RiYoutubeLine } from "react-icons/ri";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const { navigateWithTransition } = useViewTransition();
  const socialIconsRef = useRef(null);

  useGSAP(
    () => {
      if (!socialIconsRef.current) return;

      const icons = socialIconsRef.current.querySelectorAll(".icon");
      gsap.set(icons, { opacity: 0, x: -40 });

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
                <Copy delay={0.1}>
                  <h3 className="lg">Unshakeable Promise ❤️</h3>
                </Copy>
              </div>
              <Copy delay={0.2}>
                <h2 style={{fontSize: '1.5rem'}}>Technology is cold. We are not. <br />We build software, but we live for humanity.<br />

Your subscription automatically funds & helps us fight to transform the lives of the forgotten—from feeding street animals 🐕 to transforming the life's of the poor to creating new forests 🌳. We’ve locked 5% of our revenue (not profit) to this mission forever. 

This isn't a tax write-off. It is our unconditional duty. Rain or shine, profit or loss, we will never stop giving. Because kindness shouldn't wait for profitability.</h2>
              </Copy>
            </div>
          </div>
          <div className="footer-meta-col">
            <div className="footer-nav-links">
              <Copy delay={0.1}>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateWithTransition("/");
                  }}
                >
                  <h3>Index</h3>
                </a>
                <a
                  href="/studio"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateWithTransition("/studio");
                  }}
                >
                  <h3>Studio</h3>
                </a>
                <a
                  href="/spaces"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateWithTransition("/spaces");
                  }}
                >
                  <h3>Our Spaces</h3>
                </a>
                <a
                  href="/sample-space"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateWithTransition("/sample-space");
                  }}
                >
                  <h3>One Installation</h3>
                </a>
                <a
                  href="/blueprints"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateWithTransition("/blueprints");
                  }}
                >
                  <h3>Blueprints</h3>
                </a>
                <a
                  href="/connect"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateWithTransition("/connect");
                  }}
                >
                  <h3>Connect</h3>
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateWithTransition("/connect");
                  }}
                >
                  <h3>Privacy Policy</h3>
                </a>
              </Copy>
            </div>
          </div>
        </div>
        <div className="container footer-socials">
          <div className="footer-meta-col">
            <div className="footer-socials-wrapper" ref={socialIconsRef}>
              <a
                className="icon"
                href="https://www.linkedin.com/company/tori-ate"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <RiLinkedinBoxLine />
              </a>
              <a
                className="icon"
                href="https://www.instagram.com/tori_ate._/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <RiInstagramLine />
              </a>
              <a
                className="icon"
                href="mailto:torieate@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gmail"
              >
                <RiMailLine />
              </a>
              <a
                className="icon"
                href="https://www.youtube.com/@Tori-h5h6y"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <RiYoutubeLine />
              </a>
              <a
                className="icon"
                href="https://maps.app.goo.gl/35WxbDrxD6wrQ8jL8"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Maps"
              >
                <RiMapPinLine />
              </a>
            </div>
          </div>
          <div className="footer-meta-col">
            <Copy delay={0.1}>
              <p>
                We believe design is not decoration but the quiet structure that
                shapes experience.
              </p>
            </Copy>
          </div>
        </div>
      </div>
      <div className="footer-outro">
        <div className="container">
          <div className="footer-header">
            <img src="/images/tori-footer-logo.svg" alt="" />
          </div>
          <div className="footer-copyright">
            <p>
              Developed with ❤️ by <a href="https://69kelvin.com" target="_blank" rel="noopener noreferrer">69 Kelvin</a>
            </p>
            <p>Incorporated in Delaware, US 🥰</p>
            <p> &copy; 2025 Tori Ate Inc</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
