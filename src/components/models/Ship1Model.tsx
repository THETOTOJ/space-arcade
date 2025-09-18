"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import type * as THREE from "three";

interface ShipModelProps {
  position: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: number;
  autoRotate?: boolean;
}

function Ship1GLTF({
  position,
  rotation,
  scale = 1,
  autoRotate = true,
}: ShipModelProps) {
  const { scene } = useGLTF("/models/ship1.glb");
  const shipRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (shipRef.current) {
      shipRef.current.position.copy(position);
      if (rotation) shipRef.current.rotation.copy(rotation);
      if (autoRotate) shipRef.current.rotation.y += 0.01;
    }
  });

  return (
    <primitive
      ref={shipRef}
      object={scene.clone()}
      scale={[scale, scale, scale]}
    />
  );
}

function Ship1Fallback({
  position,
  rotation,
  scale = 1,
  autoRotate = true,
}: ShipModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(position);
      if (rotation) meshRef.current.rotation.copy(rotation);
      if (autoRotate) meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} scale={[scale, scale, scale]}>
      <coneGeometry args={[0.4, 1.2, 6]} />
      <meshStandardMaterial color="#00ff88" />
    </mesh>
  );
}

export function Ship1Model(props: ShipModelProps) {
  return (
    <Suspense fallback={<Ship1Fallback {...props} />}>
      <Ship1GLTF {...props} />
    </Suspense>
  );
}

useGLTF.preload("/models/ship1.glb");
