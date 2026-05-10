"use client";

import { useEffect, useState, Component, type ReactNode } from "react";
import { useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useSceneConfig } from "@/hooks/useSceneConfig";

/**
 * Error boundary for EffectComposer - catches WebGL init failures
 * so the 3D scene still renders even if post-processing breaks.
 */
class PostProcessingErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/**
 * Glow Effect Component
 * Post-processing bloom effect for luminous elements
 *
 * Automatically disabled on low-performance devices to maintain frame rate
 * Uses conservative bloom settings to avoid visual noise
 */
export function GlowEffect() {
  const { enableBloom } = useSceneConfig();
  const { gl } = useThree();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!enableBloom) return;
    if (!gl) return;

    // Wait for WebGL context to be fully ready
    let frameCount = 0;
    let animationId: number;

    const checkReady = () => {
      frameCount++;
      if (frameCount >= 5 && gl?.domElement?.parentElement) {
        setIsReady(true);
      } else {
        animationId = requestAnimationFrame(checkReady);
      }
    };

    animationId = requestAnimationFrame(checkReady);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gl, enableBloom]);

  if (!enableBloom || !isReady) {
    return null;
  }

  return (
    <PostProcessingErrorBoundary>
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.8}
          intensity={0.5}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </PostProcessingErrorBoundary>
  );
}

export default GlowEffect;
