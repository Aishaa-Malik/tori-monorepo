// Use global variables directly without redeclaration
// Access data from global scope if needed
try {
  const data = window.appData || {};
  // Use window properties instead of local variables to avoid redeclaration
  window.appCarouselItems = data.carouselItems || [];
  window.appServices = data.services || [];
  window.appArchive = data.archive || [];
} catch (e) {
  console.error("Error accessing data:", e);
}

document.addEventListener("DOMContentLoaded", () => {
  // Lenis removed: use native smooth scrolling
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.ticker?.lagSmoothing?.(0);
  }

  // time and date
  // updateDateTime();
  // setInterval(updateDateTime, 1000);

  // function updateDateTime() {
  //   const now = new Date();
  //   const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //   const timeZoneAbbr = timeZone.split("/").pop().replace("_", " ");

  //   const timeOptions = {
  //     hour: "numeric",
  //     minute: "2-digit",
  //     hour12: true,
  //   };
  //   const timeStr =
  //     now.toLocaleTimeString("en-US", timeOptions) + ` [${timeZoneAbbr}]`;
  //   document.getElementById("current-time").textContent = timeStr;

  //   const dateOptions = {
  //     month: "long",
  //     day: "numeric",
  //     year: "numeric",
  //   };
  //   const dateStr = now.toLocaleDateString("en-US", dateOptions);
  //   document.getElementById("current-date").textContent = dateStr;
  // }

  // updateDateTime();
  // setInterval(updateDateTime, 1000);


  // scroll driven animations
  window.gsap.registerPlugin(window.ScrollTrigger);
  const heroSectionPinnedHeight = window.innerHeight * 5;
  const finishAboutHeaderClipReveal = window.innerHeight * 7;
  const portraitsSectionPinnedHeight = window.innerHeight * 1;
  const carouselSectionPinnedHeight = window.innerHeight * 5;

  // make first slide in carousel visible on page load
  window.gsap.set("#project-01", {
    clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
  });

  // handle nav + site info color changes
  const nav = document.querySelector("nav");
  const siteIntro = document.querySelector(".site-intro");

  // Only create ScrollTrigger if elements exist
  if (nav && siteIntro && document.querySelector(".first")) {
    window.ScrollTrigger.create({
      trigger: ".first",
      start: "-1% top",
      end: `+=${window.innerHeight}`,
      onEnter: () => {
        nav.classList.add("dark-inpagetransition");
        nav.classList.remove("light-inpagetransition");
        siteIntro.classList.add("dark-inpagetransition");
        siteIntro.classList.remove("light-inpagetransition");
      },
      onLeave: () => {
        nav.classList.remove("dark-inpagetransition");
        nav.classList.add("light-inpagetransition");
        siteIntro.classList.remove("dark-inpagetransition");
        siteIntro.classList.add("light-inpagetransition");
      },
      onEnterBack: () => {
        nav.classList.add("dark-inpagetransition");
        nav.classList.remove("light-inpagetransition");
        siteIntro.classList.add("dark-inpagetransition");
        siteIntro.classList.remove("light-inpagetransition");
      },
      onLeaveBack: () => {
        nav.classList.remove("dark-inpagetransition");
        nav.classList.add("light-inpagetransition");
        siteIntro.classList.remove("dark-inpagetransition");
        siteIntro.classList.add("light-inpagetransition");
      },
    });
  }

  // Only create second ScrollTrigger if elements exist
  if (nav && siteIntro && document.querySelector(".second")) {
    window.ScrollTrigger.create({
      trigger: ".second",
      start: `top+=${window.innerHeight * 7}px top`,
      onEnter: () => {
        nav.classList.remove("light-inpagetransition");
        nav.classList.add("dark-inpagetransition");
        siteIntro.classList.remove("light-inpagetransition");
        siteIntro.classList.add("dark-inpagetransition");
      },
      onLeaveBack: () => {
        nav.classList.add("light-inpagetransition");
        nav.classList.remove("dark-inpagetransition");
        siteIntro.classList.add("light-inpagetransition");
        siteIntro.classList.remove("dark-inpagetransition");
      },
    });
  }

  // nav-item scroll progress animations
  const infoProgress = document.querySelector(
    ".nav-item-inpagetransition:first-child .progress-inpagetransition"
  );
  const workProgress = document.querySelector(
    ".nav-item-inpagetransition:nth-child(2) .progress-inpagetransition"
  );
  const archiveProgress = document.querySelector(
    ".nav-item-inpagetransition:nth-child(3) .progress-inpagetransition"
  );
  const contactProgress = document.querySelector(
    ".nav-item-inpagetransition:nth-child(4) .progress-inpagetransition"
  );

  window.gsap.set([infoProgress, workProgress, archiveProgress, contactProgress], {
    scaleX: 0,
    transformOrigin: "left",
  });

  window.ScrollTrigger.create({
    trigger: ".second",
    start: "top 100%",
    endTrigger: ".second",
    end: "top -100%",
    onUpdate: (self) => {
      if (self.direction > 0) {
        if (self.progress === 1) {
          gsap.set(infoProgress, { transformOrigin: "right" });
          gsap.to(infoProgress, {
            scaleX: 0,
            duration: 0.5,
            ease: "power2.inOut",
          });
        } else {
          gsap.set(infoProgress, { transformOrigin: "left" });
          gsap.to(infoProgress, {
            scaleX: self.progress,
            duration: 0,
          });
        }
      } else if (self.direction < 0) {
        if (self.progress === 0) {
          gsap.set(infoProgress, { transformOrigin: "left" });
          gsap.to(infoProgress, {
            scaleX: 0,
            duration: 0.5,
            ease: "power2.inOut",
          });
        } else {
          gsap.set(infoProgress, { transformOrigin: "left" });
          gsap.to(infoProgress, {
            scaleX: self.progress,
            duration: 0,
          });
        }
      }
    },
  });

  window.ScrollTrigger.create({
    trigger: ".second",
    start: "top -100%",
    end: `+=${window.innerHeight * 5}`,
    scrub: true,
    onUpdate: (self) => {
      if (self.direction > 0) {
        if (self.progress === 1) {
          gsap.set(workProgress, { transformOrigin: "right" });
          gsap.to(workProgress, {
            scaleX: 0,
            duration: 0.5,
            ease: "power2.inOut",
          });
        } else {
          gsap.set(workProgress, { transformOrigin: "left" });
          gsap.to(workProgress, {
            scaleX: self.progress,
            duration: 0,
          });
        }
      } else if (self.direction < 0) {
        if (self.progress === 0) {
          gsap.set(workProgress, { transformOrigin: "left" });
          gsap.to(workProgress, {
            scaleX: 0,
            duration: 0.5,
            ease: "power2.inOut",
          });
        } else {
          gsap.set(workProgress, { transformOrigin: "left" });
          gsap.to(workProgress, {
            scaleX: self.progress,
            duration: 0,
          });
        }
      }
    },
  });

  window.ScrollTrigger.create({
    trigger: ".second",
    start: `top+=${window.innerHeight * 6}px top`,
    end: () =>
      `+=${
        document.querySelector(".fourth").getBoundingClientRect().top -
        document.querySelector(".third").getBoundingClientRect().top
      }`,
    scrub: true,
    onUpdate: (self) => {
      if (self.direction > 0) {
        if (self.progress === 1) {
          gsap.set(archiveProgress, { transformOrigin: "right" });
          gsap.to(archiveProgress, {
            scaleX: 0,
            duration: 0.5,
            ease: "power2.inOut",
          });
        } else {
          gsap.set(archiveProgress, { transformOrigin: "left" });
          gsap.to(archiveProgress, {
            scaleX: self.progress,
            duration: 0,
          });
        }
      } else if (self.direction < 0) {
        if (self.progress === 0) {
          gsap.set(archiveProgress, { transformOrigin: "left" });
          gsap.to(archiveProgress, {
            scaleX: 0,
            duration: 0.5,
            ease: "power2.inOut",
          });
        } else {
          gsap.set(archiveProgress, { transformOrigin: "left" });
          gsap.to(archiveProgress, {
            scaleX: self.progress,
            duration: 0,
          });
        }
      }
    },
  });

  window.ScrollTrigger.create({
    trigger: ".third",
    start: `top+=${window.innerHeight * 7}px top`,
    end: `+=${window.innerHeight * 2}`,
    scrub: true,
    onUpdate: (self) => {
      if (self.direction > 0) {
        if (self.progress === 1) {
          gsap.set(contactProgress, { transformOrigin: "right" });
          gsap.to(contactProgress, {
            scaleX: 0,
            duration: 0.5,
            ease: "power2.inOut",
          });
        } else {
          gsap.set(contactProgress, { transformOrigin: "left" });
          gsap.to(contactProgress, {
            scaleX: self.progress,
            duration: 0,
          });
        }
      } else if (self.direction < 0) {
        if (self.progress === 0) {
          gsap.set(contactProgress, { transformOrigin: "left" });
          gsap.to(contactProgress, {
            scaleX: 0,
            duration: 0.5,
            ease: "power2.inOut",
          });
        } else {
          gsap.set(contactProgress, { transformOrigin: "left" });
          gsap.to(contactProgress, {
            scaleX: self.progress,
            duration: 0,
          });
        }
      }
    },
  });

  // reveal about section inside hero
  window.ScrollTrigger.create({
    trigger: ".first",
    start: "1% top",
    end: `+=${finishAboutHeaderClipReveal}`,
    scrub: 1,
    onUpdate: (self) => {
      const startTop = window.gsap.utils.interpolate(50, 0, self.progress);
      const endBottom = window.gsap.utils.interpolate(50, 100, self.progress);

      const clipPath = `polygon(0% ${startTop}%, 100% ${startTop}%, 100% ${endBottom}%, 0% ${endBottom}%)`;
      window.gsap.set(".about-header", {
        clipPath: clipPath,
      });
    },
  });

  // about header fades in
  window.ScrollTrigger.create({
    trigger: ".first",
    start: "25% top",
    end: `+=${finishAboutHeaderClipReveal}`,
    scrub: 1,
    onUpdate: (self) => {
      const scale = window.gsap.utils.interpolate(0.75, 1, self.progress);
      const opacity = window.gsap.utils.interpolate(0, 1, self.progress);

      window.gsap.set(".about-header h1", {
        scale: scale,
        opacity: opacity,
      });
    },
  });

  // about header fades out partially
  window.ScrollTrigger.create({
    trigger: ".second",
    start: "bottom top",
    end: `+=${finishAboutHeaderClipReveal}`,
    scrub: 1,
    onUpdate: (self) => {
      const opacity = window.gsap.utils.interpolate(1, 0.25, self.progress);

      window.gsap.set(".about-header h1", {
        opacity: opacity,
      });
    },
  });

  // animate carousel slides


  // pin sections
  window.ScrollTrigger.create({
    trigger: ".first",
    start: "top top",
    end: `+=${heroSectionPinnedHeight}`,
    pin: true,
    pinSpacing: false,
  });

  window.ScrollTrigger.create({
    trigger: ".second",
    start: "top bottom",
    end: `+=${portraitsSectionPinnedHeight}`,
    pin: true,
    pinSpacing: true,
  });

  window.ScrollTrigger.create({
    trigger: ".second",
    start: "top top",
    end: `+=${carouselSectionPinnedHeight}`,
    pin: true,
    pinSpacing: true,
  });


  window.gsap.set(".line", {
    position: "relative",
    opacity: 0,
    y: 20,
    willChange: "transform, opacity",
  });

  window.gsap.set(".char", {
    position: "relative",
    opacity: 0,
    willChange: "opacity",
  });



  // navigation click handling
  document.querySelectorAll(".nav-item-inpagetransition").forEach((navItem) => {
    navItem.addEventListener("click", (e) => {
      e.preventDefault();

      const sectionId = navItem.id;
      let scrollTarget = 0;

      switch (sectionId) {
        case "hero":
          scrollTarget = 0;
          break;
        case "carousel":
          scrollTarget = window.innerHeight * 4;
          break;
        case "archive":
          scrollTarget = window.innerHeight * 10;
          break;
        case "footer":
          scrollTarget = window.innerHeight * 12;
          break;
      }

      window.scrollTo({ top: scrollTarget, behavior: "smooth" });
    });
  });
});
console.log("Script loaded");
