"use client";

import { useDeviceCapabilities, type GPUPerformanceTier } from "./useDeviceCapabilities";

/**
 * Scene configuration based on device capabilities
 * Provides granular performance settings for 3D rendering
 */
export interface SceneConfig {
  // Particle/Star settings
  /** Number of stars/particles in background */
  starCount: number;
  /** Particle depth for parallax effect */
  starDepth: number;
  /** Particle animation speed */
  starSpeed: number;

  // Rendering quality
  /** Device pixel ratio for rendering */
  dpr: number;
  /** Enable anti-aliasing */
  antialias: boolean;
  /** Geometry detail level (segments for spheres, etc.) */
  geometryDetail: "high" | "medium" | "low";

  // Effects
  /** Enable fog effect */
  enableFog: boolean;
  /** Enable bloom/glow post-processing */
  enableBloom: boolean;
  /** Enable distortion materials (expensive shaders) */
  enableDistortion: boolean;
  /** Enable float animations */
  enableFloat: boolean;

  // Camera behavior
  /** Enable auto-rotation */
  autoRotate: boolean;
  /** Auto-rotation speed */
  autoRotateSpeed: number;
  /** Orbit control rotation speed */
  rotateSpeed: number;

  // Touch/Mobile specific
  /** Enable touch gestures */
  enableTouchGestures: boolean;
  /** Pinch-to-zoom sensitivity */
  zoomSpeed: number;
}

/**
 * Get scene configuration based on GPU tier
 */
function getConfigForTier(tier: GPUPerformanceTier, isMobile: boolean, hasTouch: boolean, effectiveDpr: number): SceneConfig {
  switch (tier) {
    case "high":
      return {
        starCount: 5000,
        starDepth: 50,
        starSpeed: 1,
        dpr: effectiveDpr,
        antialias: true,
        geometryDetail: "high",
        enableFog: true,
        enableBloom: true,
        enableDistortion: true,
        enableFloat: true,
        autoRotate: false,
        autoRotateSpeed: 0.3,
        rotateSpeed: 0.5,
        enableTouchGestures: hasTouch,
        zoomSpeed: 0.5,
      };

    case "medium":
      return {
        starCount: 3000,
        starDepth: 40,
        starSpeed: 0.7,
        dpr: Math.min(effectiveDpr, 1.5),
        antialias: true,
        geometryDetail: "medium",
        enableFog: true,
        enableBloom: true,
        enableDistortion: true,
        enableFloat: true,
        autoRotate: false,
        autoRotateSpeed: 0.3,
        rotateSpeed: 0.5,
        enableTouchGestures: hasTouch,
        zoomSpeed: 0.5,
      };

    case "low":
    default:
      return {
        starCount: isMobile ? 800 : 1500,
        starDepth: 25,
        starSpeed: 0.3,
        dpr: Math.min(effectiveDpr, 1),
        antialias: false,
        geometryDetail: "low",
        enableFog: false,
        enableBloom: false,
        enableDistortion: false,
        enableFloat: !isMobile, // Disable float on mobile for performance
        autoRotate: true,
        autoRotateSpeed: 0.2,
        rotateSpeed: 0.3,
        enableTouchGestures: hasTouch,
        zoomSpeed: 0.3,
      };
  }
}

/**
 * Hook to get scene configuration based on device capabilities
 * Returns optimized settings for mobile, low-perf, and desktop devices
 */
export function useSceneConfig(): SceneConfig {
  const { isMobile, isLowPerf, hasTouch, gpuTier, effectiveDpr, shouldReduceMotion } = useDeviceCapabilities();

  // Use GPU tier for base configuration
  let config = getConfigForTier(
    isLowPerf ? "low" : gpuTier,
    isMobile,
    hasTouch,
    effectiveDpr
  );

  // Override with reduced motion settings if needed
  if (shouldReduceMotion) {
    config = {
      ...config,
      enableFloat: false,
      starSpeed: 0,
      autoRotate: false,
      enableDistortion: false,
    };
  }

  return config;
}

/**
 * Get geometry segment count based on detail level
 */
export function getGeometrySegments(detail: "high" | "medium" | "low"): { sphere: number; ring: number; torus: number } {
  switch (detail) {
    case "high":
      return { sphere: 32, ring: 64, torus: 32 };
    case "medium":
      return { sphere: 20, ring: 32, torus: 20 };
    case "low":
      return { sphere: 12, ring: 16, torus: 12 };
  }
}

export default useSceneConfig;
