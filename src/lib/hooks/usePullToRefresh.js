/**
 * usePullToRefresh - Custom hook for pull-to-refresh functionality
 * Detects pull-down gesture and triggers refresh callback
 */

import { useEffect, useRef, useState } from "react";

export function usePullToRefresh(onRefresh) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const PULL_THRESHOLD = 80; // Distance to trigger refresh

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let currentY = 0;

    const handleTouchStart = (e) => {
      // Only start pull if at top of page
      if (container.scrollTop === 0) {
        touchStartY = e.touches[0].clientY;
        startY.current = touchStartY;
      }
    };

    const handleTouchMove = (e) => {
      if (!startY.current || container.scrollTop > 0) return;

      currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0) {
        // Prevent default scroll behavior when pulling down
        e.preventDefault();
        setIsPulling(true);
        // Apply resistance to pull distance
        setPullDistance(Math.min(distance * 0.5, PULL_THRESHOLD * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error("Refresh error:", error);
        } finally {
          setIsRefreshing(false);
        }
      }

      setIsPulling(false);
      setPullDistance(0);
      startY.current = 0;
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    pullThreshold: PULL_THRESHOLD,
  };
}
