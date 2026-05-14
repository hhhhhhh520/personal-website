"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneConfig, getGeometrySegments } from "@/hooks/useSceneConfig";

interface EnergyCoreProps {
  position?: [number, number, number];
}

/**
 * EnergyCore — multi-layered energy sphere
 *
 * Layers (outside → inside):
 * 1. Orbital rings (torus) rotating at different speeds/angles
 * 2. Wireframe icosahedron shell, slow reverse rotation
 * 3. Inner glowing sphere with pulse animation
 *
 * Color breathes between indigo (#6366f1) and cyan (#22d3ee).
 */
export function EnergyCore({ position = [0, 1, 0] }: EnergyCoreProps) {
  const { coreOrbitalRings, enableCorePulse, enableDistortion, geometryDetail } = useSceneConfig();
  const segments = getGeometrySegments(geometryDetail);
  const icosahedronDetail = geometryDetail === "high" ? 2 : geometryDetail === "medium" ? 1 : 0;

  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ringRefs = useRef<THREE.Mesh[]>([]);

  const colorA = useMemo(() => new THREE.Color("#6366f1"), []);
  const colorB = useMemo(() => new THREE.Color("#22d3ee"), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Breathing color
    const mix = (Math.sin(t * 0.5) + 1) / 2;
    tempColor.copy(colorA).lerp(colorB, mix);

    // Inner core pulse
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(tempColor);
      mat.color.copy(tempColor);
      if (enableCorePulse) {
        const scale = 1 + Math.sin(t * 2) * 0.1;
        innerRef.current.scale.setScalar(scale);
        mat.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.3;
      }
    }

    // Shell slow reverse rotation
    if (shellRef.current) {
      const shellMat = shellRef.current.material as THREE.MeshStandardMaterial;
      shellMat.emissive.copy(tempColor);
      shellMat.color.copy(tempColor);
      shellRef.current.rotation.y -= 0.002;
      shellRef.current.rotation.x += 0.001;
    }

    // Orbital rings
    for (let i = 0; i < ringRefs.current.length; i++) {
      const ring = ringRefs.current[i];
      if (!ring) continue;
      const speed = (i + 1) * 0.4;
      ring.rotation.x += 0.001 * speed;
      ring.rotation.z += 0.002 * speed;
      const ringMat = ring.material as THREE.MeshStandardMaterial;
      ringMat.emissive.copy(tempColor);
    }
  });

  // Build orbital ring configs
  const rings = useMemo(() => {
    const configs: { tilt: [number, number, number]; radius: number }[] = [];
    if (coreOrbitalRings >= 1) configs.push({ tilt: [0.3, 0, 0], radius: 1.6 });
    if (coreOrbitalRings >= 2) configs.push({ tilt: [0, 0.5, 0.8], radius: 1.9 });
    if (coreOrbitalRings >= 3) configs.push({ tilt: [0.7, 0.3, 0], radius: 2.2 });
    return configs;
  }, [coreOrbitalRings]);

  return (
    <group position={position}>
      {/* Orbital rings */}
      {rings.map((cfg, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringRefs.current[i] = el; }}
          rotation={cfg.tilt}
        >
          <torusGeometry args={[cfg.radius, 0.02, 8, segments.torus]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#6366f1"
            emissiveIntensity={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* Wireframe shell */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.2, icosahedronDetail]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.3}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Inner core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.5, segments.sphere, segments.sphere]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={1.2}
          roughness={0}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}

export default EnergyCore;
