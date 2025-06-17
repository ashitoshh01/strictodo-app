
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

const FloatingObject = ({ position, children }: { position: [number, number, number], children: React.ReactNode }) => {
  return (
    <Float
      speed={1.4}
      rotationIntensity={1}
      floatIntensity={2}
      floatingRange={[-0.2, 0.2]}
    >
      <group position={position}>
        {children}
      </group>
    </Float>
  );
};

const AnimatedSphere = ({ position, color }: { position: [number, number, number], color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <FloatingObject position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </FloatingObject>
  );
};

const AnimatedBox = ({ position, color }: { position: [number, number, number], color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <FloatingObject position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      </mesh>
    </FloatingObject>
  );
};

const AnimatedTorus = ({ position, color }: { position: [number, number, number], color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <FloatingObject position={position}>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.6, 0.2, 16, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </FloatingObject>
  );
};

const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        
        <AnimatedSphere position={[-3, 2, -2]} color="#10b981" />
        <AnimatedBox position={[3, -1, -1]} color="#3b82f6" />
        <AnimatedTorus position={[-2, -2, -3]} color="#8b5cf6" />
        <AnimatedSphere position={[2, 3, -2]} color="#06b6d4" />
        <AnimatedBox position={[-4, -1, -2]} color="#f59e0b" />
        <AnimatedTorus position={[4, 1, -3]} color="#ef4444" />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
