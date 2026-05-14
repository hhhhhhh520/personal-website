"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { useSceneConfig } from "@/hooks/useSceneConfig";

/**
 * ParticleBg — deep-space multi-layer particle field
 *
 * High/Medium: custom Points with 2-3 layers, slow drift animation
 * Low: falls back to drei Stars (current behavior)
 *
 * Each layer has different particle size, speed, opacity, and color tint
 * to create a sense of depth and atmosphere.
 */

interface ParticleLayerProps {
  count: number;
  size: number;
  speed: number;
  opacity: number;
  color: THREE.Color;
  spread: number;
  enableDrift: boolean;
}

function ParticleLayer({ count, size, speed, opacity, color, spread, enableDrift }: ParticleLayerProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * spread;
      pos[i3 + 1] = (Math.random() - 0.5) * spread;
      pos[i3 + 2] = (Math.random() - 0.5) * spread;
      // Random drift direction
      vel[i3] = (Math.random() - 0.5) * 0.002;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.002;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return { positions: pos, velocities: vel };
  }, [count, spread]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame(() => {
    if (!enableDrift || !pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3] += velocities[i3] * speed;
      arr[i3 + 1] += velocities[i3 + 1] * speed;
      arr[i3 + 2] += velocities[i3 + 2] * speed;
      // Wrap around when particle drifts too far
      for (let j = 0; j < 3; j++) {
        if (arr[i3 + j] > spread / 2) arr[i3 + j] = -spread / 2;
        if (arr[i3 + j] < -spread / 2) arr[i3 + j] = spread / 2;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function ParticleBg() {
  const { particleLayers, enableParticleDrift, starCount, starDepth, starSpeed } = useSceneConfig();

  // Low-perf fallback: use drei Stars
  if (particleLayers <= 1 && !enableParticleDrift) {
    return (
      <Stars
        radius={100}
        depth={starDepth}
        count={starCount}
        factor={4}
        saturation={0}
        fade
        speed={starSpeed}
      />
    );
  }

  const layers: ParticleLayerProps[] = [];

  // Layer 1: main star field (white, largest)
  layers.push({
    count: Math.floor(starCount * 0.5),
    size: 2,
    speed: 1,
    opacity: 0.8,
    color: new THREE.Color("#ffffff"),
    spread: 150,
    enableDrift: enableParticleDrift,
  });

  // Layer 2: mid-depth accent particles (indigo tint, smaller)
  if (particleLayers >= 2) {
    layers.push({
      count: Math.floor(starCount * 0.3),
      size: 1.5,
      speed: 0.6,
      opacity: 0.5,
      color: new THREE.Color("#818cf8"),
      spread: 120,
      enableDrift: enableParticleDrift,
    });
  }

  // Layer 3: deep background dust (cyan, tiny, slow)
  if (particleLayers >= 3) {
    layers.push({
      count: Math.floor(starCount * 0.2),
      size: 1,
      speed: 0.3,
      opacity: 0.3,
      color: new THREE.Color("#22d3ee"),
      spread: 200,
      enableDrift: enableParticleDrift,
    });
  }

  return (
    <group>
      {layers.map((layer, i) => (
        <ParticleLayer key={i} {...layer} />
      ))}
    </group>
  );
}

export default ParticleBg;
