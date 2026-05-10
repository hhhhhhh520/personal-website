"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Environment } from "./Environment";
import { EnergyCore } from "./EnergyCore";
import { Portal } from "./Portal";
import { ParticleBg } from "@/components/effects/ParticleBg";
import { useSceneConfig } from "@/hooks/useSceneConfig";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";

/**
 * Main 3D Scene Component
 * Contains the main Canvas setup with camera, lighting, and controls
 * Includes particle background, glow effects, energy core, and navigation portals
 *
 * Performance optimizations:
 * - Adaptive DPR based on GPU tier
 * - Conditional post-processing effects
 * - Touch-friendly controls
 * - Reduced motion support
 * - Client-only rendering to avoid SSR issues with Next.js 16 + Turbopack
 */
export function MainScene() {
  const [isClient, setIsClient] = useState(false);
  const { dpr, antialias, autoRotate, autoRotateSpeed, rotateSpeed, enableBloom, enableTouchGestures, zoomSpeed } = useSceneConfig();
  const { hasTouch, shouldReduceMotion } = useDeviceCapabilities();

  // Only render on client to avoid SSR issues with React Three Fiber
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        style={{
          background: "linear-gradient(to bottom, #0f0f23, #1a1a2e)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 60 }}
      style={{
        background: "linear-gradient(to bottom, #0f0f23, #1a1a2e)",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        touchAction: enableTouchGestures ? "none" : "auto",
      }}
      // Optimize performance based on device capabilities
      dpr={dpr}
      gl={{
        antialias,
        alpha: true,
        powerPreference: antialias ? "high-performance" : "low-power",
        // Disable preserveDrawingBuffer for performance
        preserveDrawingBuffer: false,
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />

      {/* Particle background */}
      <ParticleBg />

      {/* Environment effects (fog, additional atmosphere) */}
      <Environment />

      {/* Camera controls */}
      <OrbitControls
        enableZoom={hasTouch}
        enablePan={false}
        enableRotate={true}
        rotateSpeed={rotateSpeed}
        autoRotate={autoRotate && !shouldReduceMotion}
        autoRotateSpeed={autoRotateSpeed}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
        // Touch-friendly zoom settings
        zoomSpeed={zoomSpeed}
        minDistance={4}
        maxDistance={12}
        // Damping for smooth touch experience
        dampingFactor={0.05}
        enableDamping
      />

      {/* Portal navigation to different sections */}
      <Portal position={[-3, 0, -2]} label="项目展厅" target="/projects" />
      <Portal position={[3, 0, -2]} label="知识图书馆" target="/blog" />
      <Portal position={[-3, 0, 2]} label="技能矩阵" target="/skills" />
      <Portal position={[3, 0, 2]} label="关于我" target="/about" />

      {/* Central energy core */}
      <EnergyCore position={[0, 1, 0]} />

      {/* Post-processing glow effect — disabled, see import comment */}
      {/* <GlowEffect /> */}
    </Canvas>
  );
}

export default MainScene;
