import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function HumanModel({ healthStatus }: { healthStatus: "normal" | "warning" | "critical" }) {
  const group = useRef<THREE.Group>(null);
  
  // Animate the model slightly to simulate breathing
  useFrame((state) => {
    if (group.current) {
      const breathingRate = healthStatus === "critical" ? 3 : healthStatus === "warning" ? 2 : 1;
      group.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * breathingRate) * 0.02;
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const color = healthStatus === "critical" ? "#ef4444" : healthStatus === "warning" ? "#f59e0b" : "#10b981";
  const wireframeColor = healthStatus === "critical" ? "#fca5a5" : healthStatus === "warning" ? "#fcd34d" : "#6ee7b7";

  return (
    <group ref={group} position={[0, -1.5, 0]}>
      {/* Head */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshBasicMaterial color={wireframeColor} wireframe transparent opacity={0.3} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.2, 0]}>
        <capsuleGeometry args={[0.5, 1.2, 32, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <capsuleGeometry args={[0.52, 1.2, 16, 16]} />
        <meshBasicMaterial color={wireframeColor} wireframe transparent opacity={0.3} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.8, 1.5, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.15, 1.2, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.8, 1.5, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.15, 1.2, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.25, 0, 0]}>
        <capsuleGeometry args={[0.2, 1.2, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.25, 0, 0]}>
        <capsuleGeometry args={[0.2, 1.2, 16, 16]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* Heart / Core Indicator */}
      <mesh position={[0, 1.6, 0.4]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={healthStatus === "normal" ? "#34d399" : "#ef4444"} emissive={healthStatus === "normal" ? "#34d399" : "#ef4444"} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

export default function Model3D({ healthStatus = "normal" }: { healthStatus?: "normal" | "warning" | "critical" }) {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <HumanModel healthStatus={healthStatus} />
        
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2} far={4} />
        <Environment preset="city" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
