"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import type { Project } from "@/data/projects";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useSceneConfig, getGeometrySegments } from "@/hooks/useSceneConfig";

interface ProjectOrbProps {
  project: Project;
  position?: [number, number, number];
}

/**
 * ProjectOrb — animated multi-layered orb with orbital rings
 *
 * Structure:
 * - Inner core: glowing sphere with pulse animation
 * - Outer shell: wireframe icosahedron, slow counter-rotation
 * - Orbital ring: tilted torus ring rotating around the sphere
 * - Label: always-visible project name below
 */
export function ProjectOrb({ project, position = [0, 0, 0] }: ProjectOrbProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const router = useRouter();
  const { hasTouch, shouldReduceMotion } = useDeviceCapabilities();
  const { geometryDetail, enableFloat } = useSceneConfig();
  const segments = getGeometrySegments(geometryDetail);

  const isActive = hovered || tapped;
  const baseColor = useMemo(() => new THREE.Color(project.color), [project.color]);
  const brightColor = useMemo(() => new THREE.Color(project.color).multiplyScalar(1.4), [project.color]);

  // Navigate with locale-aware fallback
  const navigate = () => {
    const path = `/projects/${project.id}`;
    try {
      router.push(path);
    } catch {
      window.location.href = path;
    }
  };

  useFrame((state, delta) => {
    if (shouldReduceMotion) return;

    const t = state.clock.elapsedTime;

    // Core pulse
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 2.5) * 0.08;
      coreRef.current.scale.setScalar(pulse);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isActive ? 1.0 + Math.sin(t * 3) * 0.3 : 0.5 + Math.sin(t * 2) * 0.2;
    }

    // Shell counter-rotation
    if (shellRef.current) {
      shellRef.current.rotation.y -= delta * 0.3;
      shellRef.current.rotation.x += delta * 0.15;
      const mat = shellRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = isActive ? 0.35 : 0.18;
    }

    // Ring orbit
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (isActive ? 1.5 : 0.6);
      ringRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <Float
      speed={enableFloat ? 1.5 : 0}
      rotationIntensity={enableFloat ? 0.3 : 0}
      floatIntensity={enableFloat ? 0.6 : 0}
    >
      <group
        position={position}
        onClick={navigate}
        onPointerDown={() => hasTouch && setTapped(true)}
        onPointerUp={() => { if (tapped) { navigate(); setTapped(false); } }}
        onPointerOver={() => !hasTouch && setHovered(true)}
        onPointerOut={() => { setHovered(false); setTapped(false); }}
      >
        {/* Invisible hit area */}
        <mesh visible={false}>
          <sphereGeometry args={[1.0, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Inner core — glowing sphere */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.35, segments.sphere, segments.sphere]} />
          <meshStandardMaterial
            color={isActive ? brightColor : baseColor}
            emissive={isActive ? brightColor : baseColor}
            emissiveIntensity={0.5}
            roughness={0.15}
            metalness={0.8}
          />
        </mesh>

        {/* Outer shell — wireframe icosahedron */}
        <mesh ref={shellRef}>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={0.3}
            wireframe
            transparent
            opacity={0.18}
          />
        </mesh>

        {/* Orbital ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.75, 0.02, 8, segments.ring]} />
          <meshStandardMaterial
            color={isActive ? brightColor : baseColor}
            emissive={isActive ? brightColor : baseColor}
            emissiveIntensity={isActive ? 0.8 : 0.4}
            transparent
            opacity={isActive ? 0.9 : 0.5}
          />
        </mesh>

        {/* Glow halo — visible on hover */}
        {isActive && (
          <mesh>
            <sphereGeometry args={[0.9, 16, 16]} />
            <meshBasicMaterial
              color={baseColor}
              transparent
              opacity={0.08}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Project label — always visible */}
        <Html
          position={[0, -1.1, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            className="px-3 py-1.5 rounded-lg whitespace-nowrap text-center"
            style={{
              background: `linear-gradient(135deg, ${project.color}66, ${project.color}22)`,
              border: `1px solid ${project.color}88`,
              boxShadow: `0 0 12px ${project.color}44`,
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="text-white text-sm font-medium"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
              {project.name}
            </span>
          </div>
        </Html>
      </group>
    </Float>
  );
}

export default ProjectOrb;
