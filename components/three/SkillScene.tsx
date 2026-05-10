"use client";

import { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { SkillOrb } from "./SkillOrb";
import {
  skills,
  getSkillsGroupedByCategory,
  type Skill,
  type SkillCategory,
} from "@/data/skills";
import { useSceneConfig, getGeometrySegments } from "@/hooks/useSceneConfig";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";

interface SkillSceneProps {
  onSkillClick?: (skill: Skill) => void;
  onSkillHover?: (skillId: string | null) => void;
  hoveredSkillId?: string | null;
  filterCategory?: SkillCategory | null;
}

/**
 * Category color mapping for cluster indicators
 */
const categoryColors: Record<SkillCategory, string> = {
  language: "#3776AB",
  framework: "#009688",
  tool: "#F05032",
  concept: "#8B5CF6",
};

/**
 * Category labels for cluster indicators
 */
const categoryLabels: Record<SkillCategory, string> = {
  language: "编程语言",
  framework: "框架",
  tool: "工具",
  concept: "概念",
};

/**
 * Calculate positions for skills in a cluster layout
 * Each category forms a cluster, skills within cluster are arranged in a small circle
 */
function calculateSkillPositions(
  filterCategory?: SkillCategory | null
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();
  const groupedSkills = getSkillsGroupedByCategory();

  // If filtering by category, show only that category in center
  if (filterCategory) {
    const categorySkills = groupedSkills[filterCategory];
    const centerRadius = 2.5;
    categorySkills.forEach((skill, index) => {
      const angle = (index / categorySkills.length) * Math.PI * 2;
      const height = (index % 2 === 0 ? 0.3 : -0.2) + (index % 3) * 0.1;
      positions.set(skill.id, [
        Math.cos(angle) * centerRadius,
        height,
        Math.sin(angle) * centerRadius,
      ]);
    });
    return positions;
  }

  // Define cluster centers for each category (4 corners layout)
  const clusterCenters: Record<SkillCategory, [number, number, number]> = {
    language: [-2.5, 0.5, 0],
    framework: [2.5, 0.5, 0],
    tool: [-2.5, -0.5, 2],
    concept: [2.5, -0.5, 2],
  };

  // Calculate positions within each cluster
  const clusterRadius = 1.8;
  const categories: SkillCategory[] = ["language", "framework", "tool", "concept"];

  categories.forEach((category) => {
    const categorySkills = groupedSkills[category];
    const center = clusterCenters[category];

    categorySkills.forEach((skill, index) => {
      const angle = (index / categorySkills.length) * Math.PI * 2;
      const localRadius = clusterRadius * (skill.level === "expert" ? 0.8 : skill.level === "proficient" ? 0.9 : 1);
      const heightOffset = skill.level === "expert" ? 0.3 : skill.level === "proficient" ? 0 : -0.2;

      positions.set(skill.id, [
        center[0] + Math.cos(angle) * localRadius,
        center[1] + heightOffset + (index % 3) * 0.15,
        center[2] + Math.sin(angle) * localRadius,
      ]);
    });
  });

  return positions;
}

/**
 * SkillScene Component
 * 3D exhibition displaying skills as interactive orbs organized by category clusters
 */
export function SkillScene({
  onSkillClick,
  onSkillHover,
  hoveredSkillId,
  filterCategory,
}: SkillSceneProps) {
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
    zoomSpeed,
    enableTouchGestures,
    geometryDetail,
  } = useSceneConfig();
  const { shouldReduceMotion } = useDeviceCapabilities();
  const segments = getGeometrySegments(geometryDetail);

  // Only render on client to avoid SSR issues with React Three Fiber
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate positions for skills
  const skillPositions = useMemo(() => calculateSkillPositions(filterCategory), [filterCategory]);

  // Filter skills based on category
  const displayedSkills = useMemo(() => {
    if (filterCategory) {
      return skills.filter((s) => s.category === filterCategory);
    }
    return skills;
  }, [filterCategory]);

  // Calculate cluster center positions for category indicators
  const clusterCenters = useMemo(() => {
    if (filterCategory) {
      return [{ category: filterCategory, position: [0, 1.5, 0] as [number, number, number] }];
    }
    return [
      { category: "language" as SkillCategory, position: [-2.5, 1.5, 0] as [number, number, number] },
      { category: "framework" as SkillCategory, position: [2.5, 1.5, 0] as [number, number, number] },
      { category: "tool" as SkillCategory, position: [-2.5, -0.8, 2] as [number, number, number] },
      { category: "concept" as SkillCategory, position: [2.5, -0.8, 2] as [number, number, number] },
    ];
  }, [filterCategory]);

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
      camera={{ position: [0, 2, 8], fov: 55 }}
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

      {/* Skill orbs */}
      {displayedSkills.map((skill) => (
        <SkillOrb
          key={skill.id}
          skill={skill}
          position={skillPositions.get(skill.id) || [0, 0, 0]}
          onClick={onSkillClick}
          isHovered={hoveredSkillId === skill.id}
          onHover={onSkillHover}
        />
      ))}

      {/* Category cluster indicators */}
      {!filterCategory && (
        <>
          {clusterCenters.map((cluster) => (
            <mesh key={cluster.category} position={cluster.position}>
              <sphereGeometry args={[0.12, segments.sphere, segments.sphere]} />
              <meshStandardMaterial
                color={categoryColors[cluster.category]}
                emissive={categoryColors[cluster.category]}
                emissiveIntensity={0.6}
                transparent
                opacity={0.5}
              />
            </mesh>
          ))}
        </>
      )}

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
        dampingFactor={0.05}
        enableDamping
      />
    </Canvas>
  );
}

export default SkillScene;