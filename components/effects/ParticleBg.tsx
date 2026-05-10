"use client";

import { Stars } from "@react-three/drei";
import { useSceneConfig } from "@/hooks/useSceneConfig";

/**
 * Particle Background Component
 * Renders a star field background with performance-adaptive particle count
 *
 * Performance tiers:
 * - High GPU: 5000 particles, full depth
 * - Medium GPU: 3000 particles, reduced depth
 * - Low GPU/Mobile: 800-1500 particles, minimal depth
 */
export function ParticleBg() {
  const { starCount, starDepth, starSpeed } = useSceneConfig();

  return (
    <Stars
      radius={100}
      depth={starDepth}
      count={starCount}
      factor={4}
      saturation={0}
      fade
      speed={starSpeed}
    />
  );
}

export default ParticleBg;
