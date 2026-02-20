import React, { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Preloader = ({ setIsReady, isReady }) => {
  useEffect(() => {
    let timeoutId;
    let fallbackId;

    const finishLoading = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (fallbackId) clearTimeout(fallbackId);
      timeoutId = setTimeout(() => {
        ScrollTrigger.refresh();
        setIsReady(true);
      }, 200);
    };

    const handleLoad = () => {
      finishLoading();
    };

    if (document.readyState === "complete") {
      finishLoading();
    } else {
      if (document.readyState === "interactive") {
        finishLoading();
      }
      window.addEventListener("load", handleLoad);
    }

    fallbackId = setTimeout(() => {
      finishLoading();
    }, 6000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (fallbackId) clearTimeout(fallbackId);
      window.removeEventListener("load", handleLoad);
    };
  }, [setIsReady]);

  return (
    <div className={`preloader-overlay ${isReady ? "is-hidden" : ""}`}>
      <div className="loader-content">
        <span className="logo-text">TORI</span>
        <div className="loader-bar"></div>
      </div>
    </div>
  );
};

export default Preloader;
