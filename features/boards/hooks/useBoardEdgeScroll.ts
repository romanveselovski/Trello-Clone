"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

const SCROLL_SPEED = 14;
const EDGE_PX = 56;

export function useBoardEdgeScroll(
  containerRef: RefObject<HTMLElement | null>,
  enabled = true
) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const directionRef = useRef<-1 | 0 | 1>(0);

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(maxScroll > 2 && el.scrollLeft > 2);
    setCanScrollRight(maxScroll > 2 && el.scrollLeft < maxScroll - 2);
  }, [containerRef]);

  const startScroll = useCallback((direction: -1 | 1) => {
    directionRef.current = direction;
  }, []);

  const stopScroll = useCallback(() => {
    directionRef.current = 0;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const el = containerRef.current;
    if (!el) return;

    // Measure after layout — columns may paint a frame later
    const measure = () => updateScrollState();
    measure();
    const timeoutId = window.setTimeout(measure, 50);
    const rafMeasure = requestAnimationFrame(measure);

    el.addEventListener("scroll", updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    let rafId = 0;
    const tick = () => {
      const container = containerRef.current;
      const direction = directionRef.current;
      if (container && direction !== 0) {
        const before = container.scrollLeft;
        container.scrollLeft += direction * SCROLL_SPEED;
        if (container.scrollLeft === before) {
          directionRef.current = 0;
        }
        updateScrollState();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onPointerMove = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const { clientX: x, clientY: y } = event;

      if (y < rect.top || y > rect.bottom || x < rect.left || x > rect.right) {
        directionRef.current = 0;
        return;
      }

      if (x <= rect.left + EDGE_PX) {
        directionRef.current = -1;
      } else if (x >= rect.right - EDGE_PX) {
        directionRef.current = 1;
      } else {
        directionRef.current = 0;
      }
    };

    const clearDirection = () => {
      directionRef.current = 0;
    };

    document.addEventListener("pointermove", onPointerMove);
    window.addEventListener("blur", clearDirection);
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(rafMeasure);
      el.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
      document.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", clearDirection);
      window.removeEventListener("resize", updateScrollState);
      cancelAnimationFrame(rafId);
      directionRef.current = 0;
    };
  }, [containerRef, enabled, updateScrollState]);

  return {
    canScrollLeft,
    canScrollRight,
    startScroll,
    stopScroll,
    updateScrollState,
  };
}
