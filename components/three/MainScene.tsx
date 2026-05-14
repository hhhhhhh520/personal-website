"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Environment } from "./Environment";
import { EnergyCore } from "./EnergyCore";
import { Portal } from "./Portal";
import { ParticleBg } from "@/components/effects/ParticleBg";
import { useSceneConfig } from "@/hooks/useSceneConfig";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";

export function MainScene({ locale = "zh" }: { locale?: string }) {
  const portalColors = {
    projects: "#3B82F6",
    blog: "#22c55e",
    skills: "#a855f7",
    about: "#f59e0b",
  };
  const { dpr, antialias, autoRotate, autoRotateSpeed, rotateSpeed, enableTouchGestures, zoomSpeed } = useSceneConfig();
  const { hasTouch, shouldReduceMotion } = useDeviceCapabilities();

  return (
    <Canvas
      camera={{ position: [0, 0.5, 10], fov: 50 }}
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
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 4}
        // Touch-friendly zoom settings
        zoomSpeed={zoomSpeed}
        minDistance={4}
        maxDistance={12}
        // Damping for smooth touch experience
        dampingFactor={0.05}
        enableDamping
      />

      {/* Portal navigation — spread to sides, below text area */}
      <Portal position={[-5, -1.5, -2]} label="项目展厅" target="/projects" color={portalColors.projects} locale={locale} />
      <Portal position={[5, -1.5, -2]} label="知识图书馆" target="/blog" color={portalColors.blog} locale={locale} />
      <Portal position={[-5, -1.5, 3]} label="技能矩阵" target="/skills" color={portalColors.skills} locale={locale} />
      <Portal position={[5, -1.5, 3]} label="关于我" target="/about" color={portalColors.about} locale={locale} />

      {/* Energy core — below text, centered */}
      <EnergyCore position={[0, -2, 0]} />

      {/* Post-processing glow effect — disabled, see import comment */}
      {/* <GlowEffect /> */}
    </Canvas>
  );
}

export default MainScene;
