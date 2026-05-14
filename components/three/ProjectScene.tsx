"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ProjectOrb } from "./ProjectOrb";
import { projects } from "@/data/projects";
import { useSceneConfig, getGeometrySegments } from "@/hooks/useSceneConfig";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { ParticleBg } from "@/components/effects/ParticleBg";
import * as THREE from "three";

/**
 * CentralHub — animated energy core at the center of the project ring
 * Multi-layered: inner glow + wireframe shell + orbiting ring
 */
function CentralHub() {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 2) * 0.12;
      coreRef.current.scale.setScalar(pulse);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + Math.sin(t * 3) * 0.3;
    }

    if (shellRef.current) {
      shellRef.current.rotation.y += 0.003;
      shellRef.current.rotation.x -= 0.002;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += 0.008;
      ring1Ref.current.rotation.y += 0.003;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= 0.006;
      ring2Ref.current.rotation.x += 0.004;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Inner core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial
          color="#818cf8"
          emissive="#818cf8"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Wireframe shell */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.2}
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Orbital ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.6, 0.015, 8, 48]} />
        <meshStandardMaterial
          color="#818cf8"
          emissive="#818cf8"
          emissiveIntensity={0.5}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Orbital ring 2 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 5, Math.PI / 4, 0]}>
        <torusGeometry args={[0.75, 0.012, 8, 48]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

/**
 * ProjectScene — 3D project exhibition hall
 * Projects orbit around a central energy hub
 */
export function ProjectScene() {
  const [isClient, setIsClient] = useState(false);
  const {
    dpr,
    antialias,
    autoRotate,
    autoRotateSpeed,
    rotateSpeed,
    zoomSpeed,
    enableTouchGestures,
  } = useSceneConfig();
  const { hasTouch, shouldReduceMotion } = useDeviceCapabilities();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Circular layout for project orbs
  const projectPositions = useMemo(() => {
    const radius = 4;
    const totalProjects = projects.length;

    return projects.map((_, index) => {
      const angle = (index / totalProjects) * Math.PI * 2;
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
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-8, 5, -8]} intensity={0.6} color="#22d3ee" />
      <pointLight position={[8, -3, 8]} intensity={0.4} color="#a855f7" />

      {/* Particle background */}
      <ParticleBg />

      {/* Central energy hub */}
      <CentralHub />

      {/* Project orbs */}
      {projects.map((project, index) => (
        <ProjectOrb
          key={project.id}
          project={project}
          position={projectPositions[index]}
        />
      ))}

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
        dampingFactor={0.05}
        enableDamping
      />
    </Canvas>
  );
}

export default ProjectScene;
