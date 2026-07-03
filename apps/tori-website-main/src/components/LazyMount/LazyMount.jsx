"use client";

import { useEffect, useRef, useState } from "react";

const expandRootMargin = (rootMargin) => {
  const parts = String(rootMargin || "0px").trim().split(/\s+/);
  const [top = "0px", right = top, bottom = top, left = right] = parts;

  return { top, right, bottom, left };
};

const capPxValue = (value, maxPx) => {
  const match = String(value).trim().match(/^(-?\d+(?:\.\d+)?)px$/);
  if (!match) return value;

  const numericValue = Number(match[1]);
  if (numericValue <= 0) return value;

  return `${Math.min(numericValue, maxPx)}px`;
};

const getEffectiveRootMargin = (rootMargin, mobileRootMargin, mobileMaxRootMargin) => {
  if (typeof window === "undefined" || window.innerWidth > 768) {
    return rootMargin;
  }

  if (mobileRootMargin) {
    return mobileRootMargin;
  }

  const { top, right, bottom, left } = expandRootMargin(rootMargin);
  return [
    capPxValue(top, mobileMaxRootMargin),
    right,
    capPxValue(bottom, mobileMaxRootMargin),
    left,
  ].join(" ");
};

const LazyMount = ({
  children,
  minHeight = "60svh",
  rootMargin = "900px 0px",
  mobileRootMargin,
  mobileMaxRootMargin = 900,
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || shouldRender) return;

    if (!("IntersectionObserver" in window)) {
      setShouldRender(true);
      return;
    }

    const effectiveRootMargin = getEffectiveRootMargin(
      rootMargin,
      mobileRootMargin,
      mobileMaxRootMargin
    );

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: effectiveRootMargin, threshold: 0 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [mobileMaxRootMargin, mobileRootMargin, rootMargin, shouldRender]);

  return (
    <div ref={ref} style={!shouldRender ? { minHeight } : undefined}>
      {shouldRender ? children : null}
    </div>
  );
};

export default LazyMount;
