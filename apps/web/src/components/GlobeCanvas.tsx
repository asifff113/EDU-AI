'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useRef } from 'react';
// Importing three types can require @types/three; avoid explicit typing here

function SpinningSphere() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  return (
    <mesh ref={ref} rotation={[0.3, 0.6, 0]}>
      <sphereGeometry args={[1.6, 64, 64]} />
      <meshStandardMaterial color={'#7c3aed'} metalness={0.2} roughness={0.6} />
    </mesh>
  );
}

export function GlobeCanvas() {
  return (
    <div className="relative w-full h-[55vh] sm:h-[70vh]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.9} />
        <directionalLight intensity={1.2} position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <Stars radius={80} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <SpinningSphere />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.25),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.25),transparent_40%)]" />
    </div>
  );
}
