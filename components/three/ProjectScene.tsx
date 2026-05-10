"use client";

import { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { ProjectOrb } from "./ProjectOrb";
import { projects } from "@/data/projects";
import { useSceneConfig, getGeometrySegments } from "@/hooks/useSceneConfig";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";

/**
 * ProjectScene Component
 * 3D exhibition hall displaying projects as interactive orbs
 * Features circular layout with orbital camera controls and starfield background
 *
 * Performance optimizations:
 * - Adaptive star count based on GPU tier
 * - Reduced geometry detail on low-perf devices
 * - Touch-friendly controls
 * - Reduced motion support
 * - Client-only rendering to avoid SSR issues with Next.js 16 + Turbopack
 */
export function ProjectScene() {
  const [isClient, setIsClient] = useState(false);
  const {
    dpr,
    antialias,
    autoRotate,
    autoRotateSpeed,
    rotateSpeed,
    starCount,
    starDepth,
    starSpeed,
    enableBloom,
    zoomSpeed,
    enableTouchGestures,
    geometryDetail,
  } = useSceneConfig();
  const { hasTouch, shouldReduceMotion } = useDeviceCapabilities();
  const segments = getGeometrySegments(geometryDetail);

  // Only render on client to avoid SSR issues with React Three Fiber
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate positions for projects in a circular layout
  const projectPositions = useMemo(() => {
    const radius = 4;
    const totalProjects = projects.length;

    return projects.map((_, index) => {
      const angle = (index / totalProjects) * Math.PI * 2;
      // Add height variation for depth (alternating pattern)
      const heightVariation = index % 2 === 0 ? 0.3 : -0.2;
      const height = heightVariation + (index % 3) * 0.15;

      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius,
      ] as [number, number, number];
    });
  }, []);

  if (!isClient) {
    return (
      <div
        style={{
          background: "linear-gradient(to bottom, #0a0a1a, #1a1a2e)",
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
      camera={{ position: [0, 3, 8], fov: 60 }}
      style={{
        background: "linear-gradient(to bottom, #0a0a1a, #1a1a2e)",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        touchAction: enableTouchGestures ? "none" : "auto",
      }}
      dpr={dpr}
      gl={{
        antialias,
        alpha: true,
        powerPreference: antialias ? "high-performance" : "low-power",
        preserveDrawingBuffer: false,
      }}
    >
      {/* Ambient lighting for base illumination */}
      <ambientLight intensity={0.2} />

      {/* Main directional light */}
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />

      {/* Accent lights for color depth */}
      <pointLight position={[-8, 5, -8]} intensity={0.6} color="#22d3ee" />
      <pointLight position={[8, -3, 8]} intensity={0.4} color="#a855f7" />

      {/* Starfield background - adaptive based on device */}
      <Stars
        radius={50}
        depth={starDepth}
        count={starCount}
        factor={4}
        saturation={0.5}
        fade
        speed={starSpeed}
      />

      {/* Project orbs arranged in a circle */}
      {projects.map((project, index) => (
        <ProjectOrb
          key={project.id}
          project={project}
          position={projectPositions[index]}
        />
      ))}

      {/* Central decorative element - glowing core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, segments.sphere, segments.sphere]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Camera controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        rotateSpeed={rotateSpeed}
        zoomSpeed={zoomSpeed}
        minDistance={4}
        maxDistance={12}
        autoRotate={autoRotate && !shouldReduceMotion}
        autoRotateSpeed={autoRotateSpeed}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 4}
        // Smooth touch experience
        dampingFactor={0.05}
        enableDamping
      />
    </Canvas>
  );
}

export default ProjectScene;
