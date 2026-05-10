"use client";

import { useMemo } from "react";
import { useSceneConfig } from "@/hooks/useSceneConfig";

/**
 * Environment Component
 * Contains atmospheric effects like fog for depth perception
 *
 * Note: Returns fog as JSX primitive which R3F automatically applies to scene
 */
export function Environment() {
  const { enableFog } = useSceneConfig();

  // Use useMemo to create fog configuration
  const fogConfig = useMemo(() => {
    if (!enableFog) {
      return null;
    }
    return {
      color: "#0f0f23",
      near: 8,
      far: 25,
    };
  }, [enableFog]);

  // R3F supports <fog> as a primitive that attaches to scene.fog
  if (!fogConfig) {
    return null;
  }

  return (
    <fog
      attach="fog"
      args={[fogConfig.color, fogConfig.near, fogConfig.far] as [string, number, number]}
    />
  );
}

export default Environment;
