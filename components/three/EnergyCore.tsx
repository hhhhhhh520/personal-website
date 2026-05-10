"use client";

import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useSceneConfig, getGeometrySegments } from "@/hooks/useSceneConfig";

interface EnergyCoreProps {
  position?: [number, number, number];
}

/**
 * EnergyCore Component
 * A glowing, floating icosahedron with distortion effect
 * Serves as the central visual element in the main hall
 *
 * Performance optimizations:
 * - Disables distortion on low-perf devices (expensive shader)
 * - Disables float animation on mobile
 * - Reduces geometry detail on low-end GPUs
 */
export function EnergyCore({ position = [0, 1, 0] }: EnergyCoreProps) {
  const { enableDistortion, enableFloat, geometryDetail } = useSceneConfig();
  const segments = getGeometrySegments(geometryDetail);

  // Calculate icosahedron detail (0-3, where 1 is good balance)
  const icosahedronDetail = geometryDetail === "high" ? 2 : geometryDetail === "medium" ? 1 : 0;

  return (
    <Float
      speed={enableFloat ? 2 : 0}
      rotationIntensity={enableFloat ? 1 : 0}
      floatIntensity={enableFloat ? 2 : 0}
    >
      <mesh position={position}>
        <icosahedronGeometry args={[1, icosahedronDetail]} />
        {enableDistortion ? (
          <MeshDistortMaterial
            color="#6366f1"
            distort={0.4}
            speed={2}
            roughness={0}
            metalness={0.8}
          />
        ) : (
          <meshStandardMaterial
            color="#6366f1"
            emissive="#6366f1"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
          />
        )}
      </mesh>
    </Float>
  );
}

export default EnergyCore;
