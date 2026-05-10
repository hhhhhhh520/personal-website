"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html, Sphere } from "@react-three/drei";
import * as THREE from "three";
import type { Skill } from "@/data/skills";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useSceneConfig, getGeometrySegments } from "@/hooks/useSceneConfig";

interface SkillOrbProps {
  skill: Skill;
  position?: [number, number, number];
  onClick?: (skill: Skill) => void;
  isHovered?: boolean;
  onHover?: (skillId: string | null) => void;
}

/**
 * Level to visual properties mapping
 */
const levelConfig = {
  expert: {
    scale: 0.55,
    emissiveIntensity: 0.5,
    ringOpacity: 0.5,
  },
  proficient: {
    scale: 0.45,
    emissiveIntensity: 0.35,
    ringOpacity: 0.35,
  },
  familiar: {
    scale: 0.35,
    emissiveIntensity: 0.2,
    ringOpacity: 0.2,
  },
};

/**
 * SkillOrb Component
 * Interactive 3D sphere representing a skill
 * Features floating animation, hover glow effects, and click interaction
 */
export function SkillOrb({
  skill,
  position = [0, 0, 0],
  onClick,
  isHovered = false,
  onHover,
}: SkillOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [localHovered, setLocalHovered] = useState(false);
  const { hasTouch, shouldReduceMotion } = useDeviceCapabilities();
  const { geometryDetail, enableFloat, rotateSpeed } = useSceneConfig();
  const segments = getGeometrySegments(geometryDetail);

  // Active state (hover on desktop, tap on mobile)
  const isActive = isHovered || localHovered;
  const config = levelConfig[skill.level];

  // Create material with skill color
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: skill.color,
      emissive: skill.color,
      emissiveIntensity: isActive ? 0.8 : config.emissiveIntensity,
      roughness: 0.2,
      metalness: 0.7,
    });
  }, [skill.color, isActive, config.emissiveIntensity]);

  // Update emissive intensity smoothly
  useFrame(() => {
    if (meshRef.current) {
      const targetIntensity = isActive ? 0.8 : config.emissiveIntensity;
      const currentMaterial = meshRef.current.material as THREE.MeshStandardMaterial;
      currentMaterial.emissiveIntensity +=
        (targetIntensity - currentMaterial.emissiveIntensity) * 0.1;
    }
  });

  // Handle hover events
  const handlePointerOver = () => {
    if (!hasTouch) {
      setLocalHovered(true);
      onHover?.(skill.id);
    }
  };

  const handlePointerOut = () => {
    setLocalHovered(false);
    onHover?.(null);
  };

  // Click handler
  const handleClick = () => {
    onClick?.(skill);
  };

  return (
    <Float
      speed={enableFloat ? 1.5 : 0}
      rotationIntensity={enableFloat ? 0.4 : 0}
      floatIntensity={enableFloat ? 0.6 : 0}
    >
      <group
        position={position}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Main sphere */}
        <Sphere
          ref={meshRef}
          args={[config.scale, segments.sphere, segments.sphere]}
          material={material}
        />

        {/* Outer glow ring - only on non-mobile for performance */}
        {!hasTouch && (
          <mesh scale={1.15}>
            <ringGeometry args={[config.scale * 1.1, config.scale * 1.2, segments.ring]} />
            <meshBasicMaterial
              color={skill.color}
              transparent
              opacity={isActive ? 0.7 : config.ringOpacity}
            />
          </mesh>
        )}

        {/* Skill name label - visible on hover */}
        {isActive && (
          <Html
            position={[0, config.scale + 0.4, 0]}
            center
            style={{
              transition: "opacity 0.2s ease",
              opacity: isActive ? 1 : 0,
              pointerEvents: "none",
            }}
          >
            <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 whitespace-nowrap">
              <span className="text-white text-sm font-medium">{skill.name}</span>
              <span className="text-white/60 text-xs ml-2">
                {skill.level === "expert" ? "精通" : skill.level === "proficient" ? "熟练" : "了解"}
              </span>
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}

export default SkillOrb;
