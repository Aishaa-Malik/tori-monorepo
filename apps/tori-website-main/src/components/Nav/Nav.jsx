"use client";
import "./Nav.css";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useRouter } from "next/navigation";

import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import SplitText from "gsap/SplitText";
import { useLenis } from "lenis/react";

import MenuBtn from "../MenuBtn/MenuBtn";
import { useViewTransition } from "@/hooks/useViewTransition";

gsap.registerPlugin(SplitText);

const Nav = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const menuRef = useRef(null);
  const isInitializedRef = useRef(false);
  const hasMenuStateChangedRef = useRef(false);
  const splitTextRefs = useRef([]);
  const router = useRouter();
  const lenis = useLenis();

  const { navigateWithTransition } = useViewTransition();

  useEffect(() => {
    if (lenis) {
      if (isOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  }, [lenis, isOpen]);

  useLayoutEffect(() => {
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "hop",
      "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1"
    );
  }, []);

  useLayoutEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;

      splitTextRefs.current.forEach((split) => {
        if (split.revert) split.revert();
      });
      splitTextRefs.current = [];

      gsap.set(menu, {
        clipPath: "circle(0% at 50% 50%)",
      });

      if (window.matchMedia("(max-width: 768px)").matches) {
        isInitializedRef.current = true;
        return;
      }

      const h2Elements = menu.querySelectorAll("h2");
      const pElements = menu.querySelectorAll("p");

      h2Elements.forEach((h2, index) => {
        const split = SplitText.create(h2, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
        });

        gsap.set(split.lines, { y: "120%" });

        split.lines.forEach((line) => {
          line.style.pointerEvents = "auto";
        });

        splitTextRefs.current.push(split);
      });

      pElements.forEach((p, index) => {
        const split = SplitText.create(p, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
        });

        gsap.set(split.lines, { y: "120%" });

        split.lines.forEach((line) => {
          line.style.pointerEvents = "auto";
        });

        splitTextRefs.current.push(split);
      });

      isInitializedRef.current = true;
    }
  }, []);

  const animateMenu = useCallback((open) => {
    if (!menuRef.current) {
      return;
    }

    const menu = menuRef.current;
    const cleanupClosedMenu = () => {
      menu.style.pointerEvents = "none";

      splitTextRefs.current.forEach((split) => {
        gsap.set(split.lines, { y: "120%" });
      });

      document.body.classList.remove("menu-open");
      setIsAnimating(false);
      setIsNavigating(false);
    };

    setIsAnimating(true);
    gsap.killTweensOf(menu);

    if (open) {
      document.body.classList.add("menu-open");

      gsap.to(menu, {
        clipPath: "circle(100% at 50% 50%)",
        ease: "power3.out",
        duration: 2,
        onStart: () => {
          menu.style.pointerEvents = "all";
          splitTextRefs.current.forEach((split, index) => {
            gsap.to(split.lines, {
              y: "0%",
              stagger: 0.05,
              delay: 0.35 + index * 0.1,
              duration: 1,
              ease: "power4.out",
            });
          });
        },
        onComplete: () => {
          setIsAnimating(false);
        },
      });
    } else {
      if (splitTextRefs.current.length === 0) {
        gsap.to(menu, {
          clipPath: "circle(0% at 50% 50%)",
          ease: "power3.out",
          duration: 0.55,
          onComplete: cleanupClosedMenu,
        });
        return;
      }

      const textTimeline = gsap.timeline({
        onStart: () => {
          gsap.to(menu, {
            clipPath: "circle(0% at 50% 50%)",
            ease: "power3.out",
            duration: 1,
            delay: 0.75,
            onComplete: cleanupClosedMenu,
          });
        },
      });

      splitTextRefs.current.forEach((split, index) => {
        textTimeline.to(
          split.lines,
          {
            y: "-120%",
            stagger: 0.03,
            delay: index * 0.05,
            duration: 1,
            ease: "power3.out",
          },
          0
        );
      });
    }
  }, []);

  useEffect(() => {
    if (isInitializedRef.current && hasMenuStateChangedRef.current) {
      animateMenu(isOpen);
    }
  }, [isOpen, animateMenu]);

  const toggleMenu = useCallback(() => {
    if (!isInitializedRef.current || isNavigating) return;
    if (isAnimating && !isOpen) return;

    hasMenuStateChangedRef.current = true;
    setIsOpen((prevIsOpen) => {
      return !prevIsOpen;
    });
  }, [isAnimating, isNavigating, isOpen]);

  const handleLinkClick = useCallback(
    (e, href) => {
      e.preventDefault();

      const currentPath = window.location.pathname;

      // Handle anchor links
      if (href.startsWith("#")) {
        if (currentPath === "/") {
            // Already on home, just scroll
            if (lenis) {
                lenis.scrollTo(href);
            } else {
                const element = document.querySelector(href);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }
            if (isOpen) {
              hasMenuStateChangedRef.current = true;
              setIsOpen(false);
            }
            return;
        } else {
            // Not on home, navigate to home with hash
            // If navigating to home with hash, ensure the transition handles it or just use standard nav
            setIsNavigating(true);
            navigateWithTransition("/" + href);
            return;
        }
      }

      if (currentPath === href) {
        if (isOpen) {
          hasMenuStateChangedRef.current = true;
          setIsOpen(false);
        }
        return;
      }

      if (isNavigating) return;

      setIsNavigating(true);
      navigateWithTransition(href);
    },
    [isNavigating, router, isOpen, setIsOpen, lenis, navigateWithTransition]
  );

  const splitTextIntoSpans = (text) => {
    return text
      .split("")
      .map((char, index) =>
        char === " " ? (
          <span key={index}>&nbsp;&nbsp;</span>
        ) : (
          <span key={index}>{char}</span>
        )
      );
  };

  return (
    <div>
      <MenuBtn isOpen={isOpen} toggleMenu={toggleMenu} />
      <div className="menu" ref={menuRef}>
        <div className="menu-wrapper">
          <div className="col col-1">
            <div className="links">
              <div className="link">
                <a href="/" onClick={(e) => handleLinkClick(e, "/")}>
                  <h2>Index</h2>
                </a>
              </div>
              <div className="link">
                <a
                  href="#process"
                  onClick={(e) => handleLinkClick(e, "#process")}
                >
                  <h2>Process</h2>
                </a>
              </div>
              <div className="link">
                <a
                  href="#features"
                  onClick={(e) => handleLinkClick(e, "#features")}
                >
                  <h2>Features</h2>
                </a>
              </div>

              <div className="link">
                <a
                  href="#testimonials"
                  onClick={(e) => handleLinkClick(e, "#testimonials")}
                >
                  <h2>Testimonials</h2>
                </a>
              </div>
              <div className="link">
                <a
                  href="#pricing"
                  onClick={(e) => handleLinkClick(e, "#pricing")}
                >
                  <h2>Pricing</h2>
                </a>
              </div>
              <div className="link">
                <a
                  href="#faq"
                  onClick={(e) => handleLinkClick(e, "#faq")}
                >
                  <h2>FAQ</h2>
                </a>
              </div>
              <div className="link">
                <a
                  href="#about-us"
                  onClick={(e) => handleLinkClick(e, "#about-us")}
                >
                  <h2>About Us</h2>
                </a>
              </div>
              <div className="link">
                <a
                  href="#contact-us"
                  onClick={(e) => handleLinkClick(e, "#contact-us")}
                >
                  <h2>Contact Us</h2>
                </a>
              </div>
            </div>
          </div>
          <div className="col col-2">
            <div className="socials">
              <div className="sub-col">
                <div className="menu-meta menu-commissions">
                  <p>Queries</p>
                  <p>yushy@toriate.com</p>
                  <p>+91 98280 44677</p>
                </div>
                <div className="menu-meta">
                  <p>Address</p>
                  <p>8 The Green, Ste A</p>
                  <p>Dover, Delaware, US</p>
                </div>
              </div>
              <div className="sub-col">
                <div className="menu-meta">
                  <p>Social</p>
                  <p>Instagram</p>
                  <p>LinkedIn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
