"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Ring } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useSceneConfig, getGeometrySegments } from "@/hooks/useSceneConfig";

interface PortalProps {
  position: [number, number, number];
  label: string;
  target: string;
}

/**
 * Portal Component
 * Interactive glowing ring that navigates to different sections
 * Features hover effects with color change and rotation speed increase
 *
 * Touch support:
 * - Tap to navigate on touch devices
 * - No hover effects on touch (replaced with tap feedback)
 *
 * Performance optimizations:
 * - Reduced geometry segments on low-perf devices
 * - Static ring on reduced motion mode
 * - Uses Html instead of Text to avoid troika-three-text dependency issues
 */
export function Portal({ position, label, target }: PortalProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const router = useRouter();
  const { hasTouch, shouldReduceMotion } = useDeviceCapabilities();
  const { geometryDetail, rotateSpeed } = useSceneConfig();
  const segments = getGeometrySegments(geometryDetail);

  // Handle touch tap with visual feedback
  const handlePointerDown = () => {
    if (hasTouch) {
      setTapped(true);
    }
  };

  const handlePointerUp = () => {
    if (hasTouch && tapped) {
      router.push(target);
      setTapped(false);
    }
  };

  // Click handler for non-touch devices
  const handleClick = () => {
    if (!hasTouch) {
      router.push(target);
    }
  };

  useFrame((state, delta) => {
    if (ringRef.current && !shouldReduceMotion) {
      const speed = hovered || tapped ? rotateSpeed * 4 : rotateSpeed;
      ringRef.current.rotation.z += delta * speed;
    }
  });

  // Active state (hover on desktop, tap on mobile)
  const isActive = hovered || tapped;

  return (
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
      <Ring
        ref={ringRef}
        args={[0.8, 1, segments.ring]}
        material={
          new THREE.MeshStandardMaterial({
            color: isActive ? "#818cf8" : "#4f46e5",
            emissive: isActive ? "#818cf8" : "#4f46e5",
            emissiveIntensity: isActive ? 0.8 : 0.5,
          })
        }
      />
      {/* Use Html instead of Text to avoid troika-three-text WebGL issues */}
      <Html
        position={[0, -1.5, 0]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="text-white text-sm font-medium whitespace-nowrap bg-black/30 px-2 py-1 rounded">
          {label}
        </div>
      </Html>
    </group>
  );
}

export default Portal;
