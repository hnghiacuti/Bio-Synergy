import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Text } from "@react-three/drei";
import * as THREE from "three";

type BodyPart = "brain" | "heart" | "lungs" | "stomach" | "liver" | "kidneys" | "intestines" | null;

function HumanModel({ healthStatus, onPartClick }: { healthStatus: "normal" | "warning" | "critical", onPartClick: (part: BodyPart) => void }) {
  const group = useRef<THREE.Group>(null);
  const [hoveredPart, setHoveredPart] = useState<BodyPart>(null);
  
  useFrame((state) => {
    if (group.current) {
      const breathingRate = healthStatus === "critical" ? 3 : healthStatus === "warning" ? 2 : 1;
      group.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * breathingRate) * 0.01;
      // group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const bodyColor = healthStatus === "critical" ? "#fca5a5" : healthStatus === "warning" ? "#fcd34d" : "#6ee7b7";
  
  const handlePointerOver = (e: any, part: BodyPart) => {
    e.stopPropagation();
    setHoveredPart(part);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHoveredPart(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: any, part: BodyPart) => {
    e.stopPropagation();
    onPartClick(part);
  };

  return (
    <group ref={group} position={[0, -1.5, 0]}>
      {/* Outer Body (Transparent) */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color={bodyColor} transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <capsuleGeometry args={[0.55, 1.2, 32, 32]} />
        <meshStandardMaterial color={bodyColor} transparent opacity={0.2} depthWrite={false} />
      </mesh>
      
      {/* Organs */}
      {/* Brain */}
      <mesh 
        position={[0, 2.6, 0]} 
        onPointerOver={(e) => handlePointerOver(e, "brain")}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, "brain")}
      >
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color={hoveredPart === "brain" ? "#f472b6" : "#db2777"} emissive={hoveredPart === "brain" ? "#f472b6" : "#000000"} emissiveIntensity={0.5} />
      </mesh>

      {/* Heart */}
      <mesh 
        position={[-0.1, 1.6, 0.2]} 
        onPointerOver={(e) => handlePointerOver(e, "heart")}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, "heart")}
      >
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={hoveredPart === "heart" ? "#ef4444" : "#dc2626"} emissive={healthStatus === "critical" ? "#ef4444" : "#000000"} emissiveIntensity={healthStatus === "critical" ? 2 : 0} />
      </mesh>

      {/* Lungs */}
      <mesh 
        position={[0.2, 1.6, 0]} 
        onPointerOver={(e) => handlePointerOver(e, "lungs")}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, "lungs")}
      >
        <capsuleGeometry args={[0.15, 0.3, 16, 16]} />
        <meshStandardMaterial color={hoveredPart === "lungs" ? "#60a5fa" : "#3b82f6"} />
      </mesh>
      <mesh 
        position={[-0.2, 1.6, -0.1]} 
        onPointerOver={(e) => handlePointerOver(e, "lungs")}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, "lungs")}
      >
        <capsuleGeometry args={[0.15, 0.3, 16, 16]} />
        <meshStandardMaterial color={hoveredPart === "lungs" ? "#60a5fa" : "#3b82f6"} />
      </mesh>

      {/* Stomach */}
      <mesh 
        position={[0.1, 1.0, 0.1]} 
        rotation={[0, 0, 0.5]}
        onPointerOver={(e) => handlePointerOver(e, "stomach")}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, "stomach")}
      >
        <capsuleGeometry args={[0.15, 0.2, 16, 16]} />
        <meshStandardMaterial color={hoveredPart === "stomach" ? "#fbbf24" : "#d97706"} />
      </mesh>

      {/* Liver */}
      <mesh 
        position={[-0.15, 1.1, 0.1]} 
        rotation={[0, 0, -0.3]}
        onPointerOver={(e) => handlePointerOver(e, "liver")}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, "liver")}
      >
        <capsuleGeometry args={[0.18, 0.25, 16, 16]} />
        <meshStandardMaterial color={hoveredPart === "liver" ? "#ef4444" : "#991b1b"} />
      </mesh>

      {/* Kidneys */}
      <mesh 
        position={[-0.2, 0.8, -0.1]} 
        onPointerOver={(e) => handlePointerOver(e, "kidneys")}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, "kidneys")}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={hoveredPart === "kidneys" ? "#c2410c" : "#9a3412"} />
      </mesh>
      <mesh 
        position={[0.2, 0.8, -0.1]} 
        onPointerOver={(e) => handlePointerOver(e, "kidneys")}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, "kidneys")}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={hoveredPart === "kidneys" ? "#c2410c" : "#9a3412"} />
      </mesh>

      {/* Intestines */}
      <mesh 
        position={[0, 0.5, 0.1]} 
        onPointerOver={(e) => handlePointerOver(e, "intestines")}
        onPointerOut={handlePointerOut}
        onClick={(e) => handleClick(e, "intestines")}
      >
        <torusGeometry args={[0.25, 0.1, 16, 32]} />
        <meshStandardMaterial color={hoveredPart === "intestines" ? "#fca5a5" : "#f87171"} />
      </mesh>

      {/* Labels for hovered parts */}
      {hoveredPart && (
        <Text
          position={[0, 3.2, 0]}
          fontSize={0.2}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
        >
          {hoveredPart === "brain" ? "Não bộ" : 
           hoveredPart === "heart" ? "Tim" : 
           hoveredPart === "lungs" ? "Phổi" : 
           hoveredPart === "stomach" ? "Dạ dày" : 
           hoveredPart === "liver" ? "Gan" : 
           hoveredPart === "kidneys" ? "Thận" : 
           hoveredPart === "intestines" ? "Ruột" : ""}
        </Text>
      )}
    </group>
  );
}

export default function Model3D({ healthStatus = "normal", onPartClick }: { healthStatus?: "normal" | "warning" | "critical", onPartClick?: (part: string) => void }) {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <HumanModel healthStatus={healthStatus} onPartClick={(part) => onPartClick && part && onPartClick(part)} />
        
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2} far={4} />
        <Environment preset="city" />
        <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}
