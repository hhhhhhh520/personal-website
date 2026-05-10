"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Touch gesture state
 */
export interface TouchGestureState {
  /** Single tap detected */
  isTap: boolean;
  /** Double tap detected */
  isDoubleTap: boolean;
  /** Pinch zoom scale */
  pinchScale: number;
  /** Swipe direction (null if not swiping) */
  swipeDirection: "left" | "right" | "up" | "down" | null;
  /** Current touch count */
  touchCount: number;
}

/**
 * Touch gesture handlers
 */
export interface TouchGestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * Options for touch gesture detection
 */
export interface TouchGestureOptions {
  /** Maximum time between taps for double tap (ms) */
  doubleTapDelay?: number;
  /** Maximum distance for tap (px) */
  tapThreshold?: number;
  /** Minimum distance for swipe (px) */
  swipeThreshold?: number;
  /** Callback on tap */
  onTap?: () => void;
  /** Callback on double tap */
  onDoubleTap?: () => void;
  /** Callback on pinch zoom */
  onPinch?: (scale: number) => void;
  /** Callback on swipe */
  onSwipe?: (direction: "left" | "right" | "up" | "down") => void;
}

/**
 * Hook to detect touch gestures on mobile devices
 * Supports tap, double tap, pinch zoom, and swipe
 *
 * @example
 * ```tsx
 * const { gestureState, handlers } = useTouchGestures({
 *   onTap: () => console.log('tapped'),
 *   onDoubleTap: () => console.log('double tapped'),
 * });
 *
 * <div {...handlers}>Touch me</div>
 * ```
 */
export function useTouchGestures(
  options: TouchGestureOptions = {}
): {
  gestureState: TouchGestureState;
  handlers: TouchGestureHandlers;
  reset: () => void;
} {
  const {
    doubleTapDelay = 300,
    tapThreshold = 10,
    swipeThreshold = 50,
    onTap,
    onDoubleTap,
    onPinch,
    onSwipe,
  } = options;

  const [gestureState, setGestureState] = useState<TouchGestureState>({
    isTap: false,
    isDoubleTap: false,
    pinchScale: 1,
    swipeDirection: null,
    touchCount: 0,
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const initialPinchDistanceRef = useRef<number>(0);

  const reset = useCallback(() => {
    setGestureState({
      isTap: false,
      isDoubleTap: false,
      pinchScale: 1,
      swipeDirection: null,
      touchCount: 0,
    });
    touchStartRef.current = null;
    initialPinchDistanceRef.current = 0;
  }, []);

  const getPinchDistance = useCallback((touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getSwipeDirection = useCallback(
    (
      startX: number,
      startY: number,
      endX: number,
      endY: number
    ): "left" | "right" | "up" | "down" | null => {
      const dx = endX - startX;
      const dy = endY - startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < swipeThreshold) return null;

      if (absDx > absDy) {
        return dx > 0 ? "right" : "left";
      }
      return dy > 0 ? "down" : "up";
    },
    [swipeThreshold]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      setGestureState((prev) => ({
        ...prev,
        touchCount: e.touches.length,
      }));

      // Handle pinch zoom start
      if (e.touches.length === 2) {
        initialPinchDistanceRef.current = getPinchDistance(e.touches);
      }
    },
    [getPinchDistance]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // Handle pinch zoom
      if (e.touches.length === 2 && initialPinchDistanceRef.current > 0) {
        const currentDistance = getPinchDistance(e.touches);
        const scale = currentDistance / initialPinchDistanceRef.current;
        setGestureState((prev) => ({
          ...prev,
          pinchScale: scale,
        }));
        onPinch?.(scale);
      }
    },
    [getPinchDistance, onPinch]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];

      if (!touchStartRef.current) {
        reset();
        return;
      }

      const { x: startX, y: startY, time: startTime } = touchStartRef.current;
      const endX = touch.clientX;
      const endY = touch.clientY;
      const distance = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );

      // Check for swipe first (longer distance)
      const swipeDirection = getSwipeDirection(startX, startY, endX, endY);
      if (swipeDirection) {
        setGestureState((prev) => ({
          ...prev,
          swipeDirection,
          touchCount: 0,
        }));
        onSwipe?.(swipeDirection);
        reset();
        return;
      }

      // Check for tap (short distance)
      if (distance < tapThreshold) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;

        if (timeSinceLastTap < doubleTapDelay) {
          // Double tap detected
          setGestureState((prev) => ({
            ...prev,
            isDoubleTap: true,
            isTap: false,
            touchCount: 0,
          }));
          onDoubleTap?.();
          lastTapRef.current = 0;
        } else {
          // Single tap detected
          setGestureState((prev) => ({
            ...prev,
            isTap: true,
            isDoubleTap: false,
            touchCount: 0,
          }));
          onTap?.();
          lastTapRef.current = now;
        }
      }

      // Reset after gesture detection
      setTimeout(reset, 100);
    },
    [tapThreshold, doubleTapDelay, getSwipeDirection, onTap, onDoubleTap, onSwipe, reset]
  );

  return {
    gestureState,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    reset,
  };
}

export default useTouchGestures;
