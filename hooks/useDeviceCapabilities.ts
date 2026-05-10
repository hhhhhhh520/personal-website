"use client";

import { useMemo } from "react";

/**
 * Extend Navigator interface for deviceMemory API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
 */
declare global {
  interface Navigator {
    deviceMemory?: number;
  }
}

/**
 * GPU performance tier classification
 */
export type GPUPerformanceTier = "high" | "medium" | "low" | "unknown";

/**
 * Device capabilities for 3D rendering optimization
 */
export interface DeviceCapabilities {
  /** Whether the device is a mobile phone or tablet */
  isMobile: boolean;
  /** Whether the device has low-performance GPU (integrated graphics) */
  isLowPerf: boolean;
  /** Whether WebGL is supported */
  hasWebGL: boolean;
  /** Whether the device supports touch input */
  hasTouch: boolean;
  /** Estimated device memory in GB (navigator.deviceMemory) */
  deviceMemory: number;
  /** GPU performance tier based on renderer detection */
  gpuTier: GPUPerformanceTier;
  /** Whether to disable complex effects for battery/performance */
  shouldReduceMotion: boolean;
  /** Screen width in pixels */
  screenWidth: number;
  /** Screen height in pixels */
  screenHeight: number;
  /** Effective pixel ratio considering GPU constraints */
  effectiveDpr: number;
}

/**
 * Detect GPU performance tier based on renderer string
 */
function detectGPUTier(renderer: string): GPUPerformanceTier {
  // High-performance GPUs
  const highPerfPatterns = [
    /NVIDIA.*RTX/i,
    /NVIDIA.*GTX\s*(10|16|20|30)/i,
    /AMD.*RX\s*(5|6|7)/i,
    /Apple.*M[1-4]\s*(Pro|Max)/i,
    /Radeon.*Pro/i,
  ];

  // Medium-performance GPUs (mid-range discrete or decent integrated)
  const mediumPerfPatterns = [
    /NVIDIA.*GTX\s*(9|750|850|950|960)/i,
    /AMD.*RX\s*(4|5[0-5])/i,
    /Intel.*Iris.*Xe/i,
    /Apple.*M[1-3]/i, // Base Apple Silicon
    /Radeon.*Vega/i,
  ];

  // Low-performance GPUs (integrated/mobile)
  const lowPerfPatterns = [
    /Intel.*HD/i,
    /Intel.*UHD/i,
    /Intel.*Graphics/i,
    /Mali-/i,
    /Adreno/i,
    /Apple.*GPU/i,
    /SwiftShader/i,
    /LLVMpipe/i,
  ];

  if (highPerfPatterns.some((p) => p.test(renderer))) return "high";
  if (mediumPerfPatterns.some((p) => p.test(renderer))) return "medium";
  if (lowPerfPatterns.some((p) => p.test(renderer))) return "low";
  return "unknown";
}

/**
 * Get effective DPR based on GPU tier and device memory
 */
function calculateEffectiveDpr(gpuTier: GPUPerformanceTier, deviceMemory: number, maxDpr: number): number {
  // Cap DPR based on GPU tier and memory
  switch (gpuTier) {
    case "high":
      return Math.min(maxDpr, deviceMemory >= 8 ? 2 : 1.5);
    case "medium":
      return Math.min(maxDpr, 1.5);
    case "low":
      return Math.min(maxDpr, 1);
    default:
      return Math.min(maxDpr, 1);
  }
}

/**
 * Detect device capabilities synchronously
 * Returns default values on SSR
 */
function detectCapabilities(): DeviceCapabilities {
  // SSR safety check
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isLowPerf: false,
      hasWebGL: true,
      hasTouch: false,
      deviceMemory: 8,
      gpuTier: "unknown",
      shouldReduceMotion: false,
      screenWidth: 1920,
      screenHeight: 1080,
      effectiveDpr: 2,
    };
  }

  // Detect mobile devices
  const isMobileUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Detect touch capability
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Combine UA and touch detection for mobile classification
  const isMobile = isMobileUA || (hasTouch && window.innerWidth < 768);

  // Check for reduced motion preference (accessibility)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Get device memory (returns undefined if not supported)
  const deviceMemory = navigator.deviceMemory || 4;

  // Screen dimensions
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Detect WebGL support and GPU info
  let hasWebGL = false;
  let gpuTier: GPUPerformanceTier = "unknown";

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (gl) {
      hasWebGL = true;

      // Try to get GPU renderer info
      const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");

      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(
          debugInfo.UNMASKED_RENDERER_WEBGL
        );

        gpuTier = detectGPUTier(renderer);
      }
    }
  } catch {
    hasWebGL = false;
  }

  // Mobile devices and low-memory devices are considered low-perf
  const isLowPerf = isMobile || gpuTier === "low" || deviceMemory < 4;

  // Calculate effective DPR
  const maxDpr = window.devicePixelRatio || 1;
  const effectiveDpr = calculateEffectiveDpr(gpuTier, deviceMemory, maxDpr);

  // Reduce motion if: accessibility preference, low GPU, or mobile
  const shouldReduceMotion = prefersReducedMotion || gpuTier === "low" || isMobile;

  return {
    isMobile,
    isLowPerf,
    hasWebGL,
    hasTouch,
    deviceMemory,
    gpuTier,
    shouldReduceMotion,
    screenWidth,
    screenHeight,
    effectiveDpr,
  };
}

/**
 * Hook to detect device capabilities for performance optimization
 * Uses useMemo for synchronous initialization (SSR-safe)
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  return useMemo(() => detectCapabilities(), []);
}

export default useDeviceCapabilities;
