"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html, Sphere } from "@react-three/drei";
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
 * ProjectOrb Component
 * Interactive 3D sphere representing a project
 * Features floating animation, hover glow effects, and click navigation
 *
 * Touch support:
 * - Tap to navigate on touch devices
 * - Visual feedback on tap
 *
 * Performance optimizations:
 * - Reduced geometry segments on low-perf devices
 * - Optional float animation
 * - Conditional label rendering
 */
export function ProjectOrb({ project, position = [0, 0, 0] }: ProjectOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const router = useRouter();
  const { hasTouch, shouldReduceMotion } = useDeviceCapabilities();
  const { geometryDetail, enableFloat, rotateSpeed } = useSceneConfig();
  const segments = getGeometrySegments(geometryDetail);

  // Active state (hover on desktop, tap on mobile)
  const isActive = hovered || tapped;

  // Create material with project color
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: project.color,
      emissive: project.color,
      emissiveIntensity: isActive ? 0.8 : 0.3,
      roughness: 0.2,
      metalness: 0.7,
    });
  }, [project.color, isActive]);

  // Update emissive intensity smoothly
  useFrame(() => {
    if (meshRef.current) {
      const targetIntensity = isActive ? 0.8 : 0.3;
      const currentMaterial = meshRef.current.material as THREE.MeshStandardMaterial;
      currentMaterial.emissiveIntensity += (targetIntensity - currentMaterial.emissiveIntensity) * 0.1;
    }
  });

  // Handle touch tap with visual feedback
  const handlePointerDown = () => {
    if (hasTouch) {
      setTapped(true);
    }
  };

  const handlePointerUp = () => {
    if (hasTouch && tapped) {
      router.push(`/projects/${project.id}`);
      setTapped(false);
    }
  };

  // Click handler for non-touch devices
  const handleClick = () => {
    if (!hasTouch) {
      router.push(`/projects/${project.id}`);
    }
  };

  return (
    <Float
      speed={enableFloat ? 1.5 : 0}
      rotationIntensity={enableFloat ? 0.5 : 0}
      floatIntensity={enableFloat ? 0.8 : 0}
    >
      <group
        position={position}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={() => !hasTouch && setHovered(true)}
        onPointerOut={() => {
          setHovered(false);
          setTapped(false);
        }}
      >
        {/* Main sphere */}
        <Sphere
          ref={meshRef}
          args={[0.5, segments.sphere, segments.sphere]}
          material={material}
        />

        {/* Outer glow ring - only on non-mobile for performance */}
        {!hasTouch && (
          <mesh scale={1.2}>
            <ringGeometry args={[0.6, 0.65, segments.ring]} />
            <meshBasicMaterial
              color={project.color}
              transparent
              opacity={isActive ? 0.6 : 0.2}
            />
          </mesh>
        )}

        {/* Project name label - visible on hover/tap */}
        {isActive && (
          <Html
            position={[0, 0.9, 0]}
            center
            style={{
              transition: "opacity 0.2s ease",
              opacity: isActive ? 1 : 0,
              pointerEvents: "none",
            }}
          >
            <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 whitespace-nowrap">
              <span className="text-white text-sm font-medium">
                {project.name}
              </span>
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}

export default ProjectOrb;
