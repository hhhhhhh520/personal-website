"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useSceneConfig, getGeometrySegments } from "@/hooks/useSceneConfig";

interface PortalProps {
  position: [number, number, number];
  label: string;
  target: string;
  color?: string;
  locale?: string;
}

/**
 * Portal — animated concentric rings with center glow
 *
 * Structure:
 * - Outer ring: main ring (thickest)
 * - Inner rings: 1-2 thinner rings rotating in opposite directions
 * - Center face: semi-transparent circular plane (portal "surface")
 * - Html label below
 *
 * Each portal has a unique color for visual distinction.
 */
export function Portal({ position, label, target, color = "#4f46e5", locale = "zh" }: PortalProps) {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRefs = useRef<THREE.Mesh[]>([]);
  const centerRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const router = useRouter();
  const { hasTouch, shouldReduceMotion } = useDeviceCapabilities();
  const { portalRings, enablePortalCenter, geometryDetail } = useSceneConfig();
  const segments = getGeometrySegments(geometryDetail);

  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const brightColor = useMemo(() => new THREE.Color(color).multiplyScalar(1.5), [color]);

  const fullTarget = `/${locale}${target}`;

  const navigate = () => {
    try {
      router.push(fullTarget);
    } catch {
      window.location.href = fullTarget;
    }
  };

  const handlePointerDown = () => {
    setTapped(true);
  };

  const handlePointerUp = () => {
    if (tapped) {
      navigate();
      setTapped(false);
    }
  };

  const handleClick = () => {
    navigate();
  };

  const isActive = hovered || tapped;

  useFrame((state, delta) => {
    if (shouldReduceMotion) return;

    // Outer ring rotation
    if (outerRef.current) {
      const speed = isActive ? 2.5 : 0.5;
      outerRef.current.rotation.z += delta * speed;
    }

    // Inner rings rotate in opposite direction at varied speeds
    for (let i = 0; i < innerRefs.current.length; i++) {
      const ring = innerRefs.current[i];
      if (!ring) continue;
      const speed = isActive ? (3 + i) * -0.8 : (1 + i) * -0.3;
      ring.rotation.z += delta * speed;
    }

    // Center face pulse
    if (centerRef.current) {
      const mat = centerRef.current.material as THREE.MeshStandardMaterial;
      const pulse = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;
      mat.opacity = isActive ? 0.3 + pulse * 0.15 : 0.15 + pulse * 0.1;
      mat.emissiveIntensity = isActive ? 0.8 + pulse * 0.3 : 0.4 + pulse * 0.2;
    }
  });

  // Inner ring configs
  const innerRingCount = Math.max(0, portalRings - 1);
  const innerRings = useMemo(() => {
    return Array.from({ length: innerRingCount }, (_, i) => ({
      radius: 0.75 - i * 0.2,
      tube: 0.025,
    }));
  }, [innerRingCount]);

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={() => !hasTouch && setHovered(true)}
      onPointerOut={() => { setHovered(false); setTapped(false); }}
    >
      {/* Invisible hit area — larger than visual rings for easier clicking */}
      <mesh visible={false}>
        <sphereGeometry args={[1.8, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Outer ring */}
      <mesh ref={outerRef}>
        <torusGeometry args={[1, 0.05, 8, segments.ring]} />
        <meshStandardMaterial
          color={isActive ? brightColor : baseColor}
          emissive={isActive ? brightColor : baseColor}
          emissiveIntensity={isActive ? 1 : 0.6}
        />
      </mesh>

      {/* Inner rings */}
      {innerRings.map((cfg, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) innerRefs.current[i] = el; }}
        >
          <torusGeometry args={[cfg.radius, cfg.tube, 8, segments.ring]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Center face — portal surface */}
      {enablePortalCenter && (
        <mesh ref={centerRef} rotation={[0, 0, 0]}>
          <circleGeometry args={[0.7, segments.ring]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={0.4}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Label */}
      <Html
        position={[0, -1.6, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          className="text-white text-base font-bold whitespace-nowrap px-5 py-2.5 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${color}88, ${color}44)`,
            border: `1.5px solid ${color}aa`,
            boxShadow: `0 0 16px ${color}66, 0 0 32px ${color}33`,
            backdropFilter: "blur(12px)",
            textShadow: "0 2px 6px rgba(0,0,0,0.8)",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

export default Portal;
