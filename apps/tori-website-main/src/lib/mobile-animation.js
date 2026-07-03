export const MOBILE_QUERY = "(max-width: 768px)";

export const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;

export const clamp01 = (value) => Math.min(1, Math.max(0, value));

export const createRafScrollListener = (update) => {
  if (typeof window === "undefined") return () => {};

  let rafId = 0;
  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;

  const run = () => {
    rafId = 0;
    update();
  };

  const requestUpdate = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(run);
  };

  const requestResizeUpdate = () => {
    const nextWidth = window.innerWidth;
    const nextHeight = window.innerHeight;
    const widthDelta = Math.abs(nextWidth - lastWidth);
    const heightDelta = Math.abs(nextHeight - lastHeight);

    if (isMobileViewport() && widthDelta < 24 && heightDelta < 180) {
      return;
    }

    lastWidth = nextWidth;
    lastHeight = nextHeight;
    requestUpdate();
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestResizeUpdate);
  window.addEventListener("orientationchange", requestUpdate);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestResizeUpdate);
    window.removeEventListener("orientationchange", requestUpdate);
  };
};

export const createRevealObserver = (element, onReveal, options = {}) => {
  if (!element || typeof window === "undefined") return () => {};

  if (!("IntersectionObserver" in window)) {
    onReveal();
    return () => {};
  }

  let hasRevealed = false;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting || hasRevealed) return;
      hasRevealed = true;
      onReveal();
      observer.disconnect();
    },
    {
      rootMargin: options.rootMargin || "0px 0px -10% 0px",
      threshold: options.threshold ?? 0.01,
    }
  );

  observer.observe(element);
  return () => observer.disconnect();
};

export const getStickyProgress = (element) => {
  if (!element || typeof window === "undefined") return 0;

  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
  const scrollableDistance = Math.max(1, element.offsetHeight - viewportHeight);

  return clamp01(-rect.top / scrollableDistance);
};
