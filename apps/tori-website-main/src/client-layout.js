"use client";
import { useEffect, useState } from "react";

import { ViewTransitions } from "next-view-transitions";

export default function ClientLayout({ children }) {
  const [isMobile, setIsMobile] = useState(null);
  const [DesktopLenisLayout, setDesktopLenisLayout] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile !== false || DesktopLenisLayout) return;

    let isMounted = true;
    import("@/DesktopLenisLayout").then((module) => {
      if (isMounted) {
        setDesktopLenisLayout(() => module.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [DesktopLenisLayout, isMobile]);

  if (isMobile !== false) {
    return <ViewTransitions>{children}</ViewTransitions>;
  }

  if (!DesktopLenisLayout) {
    return <ViewTransitions>{children}</ViewTransitions>;
  }

  return (
    <ViewTransitions>
      <DesktopLenisLayout>
        {children}
      </DesktopLenisLayout>
    </ViewTransitions>
  );
}
