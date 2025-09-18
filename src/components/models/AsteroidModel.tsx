"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import type * as THREE from "three";

interface AsteroidProps {
  position: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: number;
  autoRotate?: boolean;
}

function AsteroidGLTF({
  position,
  rotation,
  scale = 1,
  autoRotate = true,
}: AsteroidProps) {
  const { scene } = useGLTF("/models/asteroid.glb");
  const asteroidRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (asteroidRef.current) {
      asteroidRef.current.position.copy(position);
      if (rotation) asteroidRef.current.rotation.copy(rotation);
      if (autoRotate) {
        asteroidRef.current.rotation.x += 0.005;
        asteroidRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <primitive
      ref={asteroidRef}
      object={scene.clone()}
      scale={[scale, scale, scale]}
    />
  );
}

function AsteroidFallback({
  position,
  rotation,
  scale = 1,
  autoRotate = true,
}: AsteroidProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(position);
      if (rotation) meshRef.current.rotation.copy(rotation);
      if (autoRotate) {
        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <mesh ref={meshRef} scale={[scale, scale, scale]}>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#888888" roughness={0.8} />
    </mesh>
  );
}

export function AsteroidModel(props: AsteroidProps) {
  return (
    <Suspense fallback={<AsteroidFallback {...props} />}>
      <AsteroidGLTF {...props} />
    </Suspense>
  );
}

useGLTF.preload("/models/asteroid.glb");
