"use client";

import { useState, useEffect } from "react";

export function useScrollThreshold(threshold = 12) {
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const onScroll = () => setPassed(main.scrollTop > threshold);
    onScroll();
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return passed;
}
