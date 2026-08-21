import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SIZE, neighbors, rc, type Cell } from "@/lib/baghchal";
import Scenery from "./Scenery";
import engraving from "@/assets/tiger-engraving.png";

const SPACING = 1.15;

export function nodePosition(i: number): [number, number, number] {
  const [r, c] = rc(i);
  return [(c - 2) * SPACING, 0.41, (r - 2) * SPACING];
}

function BoardLines() {
  const segments = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{ a: number; b: number }> = [];
    for (let i = 0; i < SIZE * SIZE; i++) {
      for (const n of neighbors(i)) {
        const key = i < n ? `${i}-${n}` : `${n}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ a: i, b: n });
      }
    }
    return out;
  }, []);

  return (
    <group>
      {segments.map(({ a, b }, k) => {
        const pa = new THREE.Vector3(...nodePosition(a));
        const pb = new THREE.Vector3(...nodePosition(b));
        const mid = pa.clone().add(pb).multiplyScalar(0.5);
        const len = pa.distanceTo(pb);
        const angle = Math.atan2(pb.z - pa.z, pb.x - pa.x);
        return (
          <mesh key={k} position={[mid.x, 0.402, mid.z]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[len, 0.008, 0.03]} />
            <meshStandardMaterial color="#4a2c12" roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

function Engraving() {
  const tex = useLoader(THREE.TextureLoader, engraving);
  return (
    <mesh position={[-1.75, 0.403, -1.85]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.7, 1.7]} />
      <meshStandardMaterial map={tex} transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
}

/** Smoothly eases a piece to its node and adds a gentle idle bob when selected. */
function PieceBase({
  position,
  selected,
  children,
}: {
  position: [number, number, number];
  selected: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(...position), [position]);
  const started = useRef(false);

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    if (!started.current) {
      g.position.copy(target);
      g.position.y += 1.2;
      g.scale.setScalar(0.4);
      started.current = true;
    }
    const lift = selected ? 0.14 + Math.sin(state.clock.elapsedTime * 3) * 0.03 : 0;
    const k = 1 - Math.pow(0.001, dt);
    g.position.lerp(new THREE.Vector3(target.x, target.y + lift, target.z), k);
    const s = selected ? 1.08 : 1;
    g.scale.lerp(new THREE.Vector3(s, s, s), k);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, selected ? 0.5 : 0, k * 0.6);
  });

  return <group ref={ref}>{children}</group>;
}

/** Round wooden plinth every piece stands on, as in the reference art. */
function Plinth() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.235, 0.245, 0.06, 24]} />
        <meshStandardMaterial color="#5b3418" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.065, 0]}>
        <cylinderGeometry args={[0.205, 0.205, 0.02, 24]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Tiger({ position, selected }: { position: [number, number, number]; selected: boolean }) {
  const body = selected ? "#fbbf24" : "#f97316";
  const dark = "#3b1d0c";
  const cream = "#fde9c8";
  return (
    <PieceBase position={position} selected={selected}>
      <Plinth />
      {/* torso */}
      <mesh castShadow position={[0, 0.3, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.135, 0.3, 6, 12]} />
        <meshStandardMaterial color={body} roughness={0.45} />
      </mesh>
      {/* stripes on back */}
      {[-0.12, -0.02, 0.08].map((z, k) => (
        <mesh key={k} position={[0, 0.31, z]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.135, 0.014, 6, 16]} />
          <meshStandardMaterial color={dark} roughness={0.7} />
        </mesh>
      ))}
      {/* legs */}
      {[
        [-0.09, 0.12],
        [0.09, 0.12],
        [-0.09, -0.14],
        [0.09, -0.14],
      ].map(([x, z], k) => (
        <mesh key={`l${k}`} castShadow position={[x!, 0.16, z!]}>
          <cylinderGeometry args={[0.042, 0.05, 0.24, 8]} />
          <meshStandardMaterial color={k < 2 ? cream : body} roughness={0.55} />
        </mesh>
      ))}
      {/* head */}
      <mesh castShadow position={[0, 0.42, 0.19]}>
        <sphereGeometry args={[0.135, 16, 12]} />
        <meshStandardMaterial color={body} roughness={0.42} />
      </mesh>
      {/* mane / cheeks */}
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 0.39, 0.2]}>
          <sphereGeometry args={[0.065, 10, 8]} />
          <meshStandardMaterial color={cream} roughness={0.6} />
        </mesh>
      ))}
      {/* muzzle */}
      <mesh position={[0, 0.38, 0.29]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshStandardMaterial color={cream} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.41, 0.33]}>
        <sphereGeometry args={[0.024, 8, 8]} />
        <meshStandardMaterial color="#c2410c" roughness={0.4} />
      </mesh>
      {/* eyes */}
      {[-0.055, 0.055].map((x) => (
        <mesh key={`e${x}`} position={[x, 0.46, 0.3]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#facc15" emissive="#ca8a04" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* ears */}
      {[-0.085, 0.085].map((x) => (
        <mesh key={`ear${x}`} castShadow position={[x, 0.53, 0.16]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.045, 0.03, 10]} />
          <meshStandardMaterial color={dark} roughness={0.6} />
        </mesh>
      ))}
      {/* tail */}
      <mesh castShadow position={[0, 0.4, -0.22]} rotation={[0.9, 0, 0.3]}>
        <capsuleGeometry args={[0.026, 0.2, 4, 8]} />
        <meshStandardMaterial color={body} roughness={0.5} />
      </mesh>
    </PieceBase>
  );
}

function Goat({ position, selected }: { position: [number, number, number]; selected: boolean }) {
  const coat = selected ? "#e6f9b8" : "#f6f5f2";
  const shade = selected ? "#cbe89a" : "#dedbd4";
  return (
    <PieceBase position={position} selected={selected}>
      <Plinth />
      {/* torso */}
      <mesh castShadow position={[0, 0.28, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.12, 0.24, 6, 12]} />
        <meshStandardMaterial color={coat} roughness={0.6} />
      </mesh>
      {/* legs */}
      {[
        [-0.075, 0.1],
        [0.075, 0.1],
        [-0.075, -0.12],
        [0.075, -0.12],
      ].map(([x, z], k) => (
        <mesh key={`l${k}`} castShadow position={[x!, 0.16, z!]}>
          <cylinderGeometry args={[0.032, 0.038, 0.22, 8]} />
          <meshStandardMaterial color={shade} roughness={0.65} />
        </mesh>
      ))}
      {/* neck + head */}
      <mesh castShadow position={[0, 0.38, 0.12]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.16, 10]} />
        <meshStandardMaterial color={coat} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.46, 0.2]}>
        <sphereGeometry args={[0.085, 14, 10]} />
        <meshStandardMaterial color={coat} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.43, 0.28]}>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshStandardMaterial color={coat} roughness={0.55} />
      </mesh>
      {/* eyes */}
      {[-0.04, 0.04].map((x) => (
        <mesh key={`e${x}`} position={[x, 0.48, 0.26]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color="#3f2d18" />
        </mesh>
      ))}
      {/* ears */}
      {[-0.085, 0.085].map((x) => (
        <mesh key={`ear${x}`} position={[x, 0.5, 0.17]} rotation={[0, 0, x > 0 ? -0.9 : 0.9]}>
          <capsuleGeometry args={[0.018, 0.06, 3, 8]} />
          <meshStandardMaterial color={shade} roughness={0.6} />
        </mesh>
      ))}
      {/* swept horns */}
      {[-0.04, 0.04].map((x) => (
        <mesh
          key={`h${x}`}
          castShadow
          position={[x, 0.56, 0.14]}
          rotation={[-0.9, 0, x > 0 ? -0.2 : 0.2]}
        >
          <capsuleGeometry args={[0.017, 0.13, 3, 8]} />
          <meshStandardMaterial color="#5a4632" roughness={0.5} />
        </mesh>
      ))}
      {/* beard */}
      <mesh position={[0, 0.38, 0.25]}>
        <coneGeometry args={[0.028, 0.08, 6]} />
        <meshStandardMaterial color={shade} roughness={0.7} />
      </mesh>
      {/* tail */}
      <mesh position={[0, 0.36, -0.18]} rotation={[0.6, 0, 0]}>
        <coneGeometry args={[0.03, 0.08, 6]} />
        <meshStandardMaterial color={coat} roughness={0.6} />
      </mesh>
    </PieceBase>
  );
}

function Node({
  i,
  highlighted,
  onClick,
}: {
  i: number;
  highlighted: boolean;
  onClick: (i: number) => void;
}) {
  const [hover, setHover] = useState(false);
  const pos = nodePosition(i);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ring.current) return;
    const pulse = highlighted ? 1 + Math.sin(state.clock.elapsedTime * 3.4) * 0.08 : 1;
    ring.current.scale.setScalar(pulse);
  });

  return (
    <group>
      <mesh position={[pos[0], 0.404, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.085, 20]} />
        <meshStandardMaterial color="#3f2412" roughness={0.9} />
      </mesh>
      <mesh
        ref={ring}
        position={[pos[0], 0.408, pos[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={highlighted}
        onClick={(e) => {
          e.stopPropagation();
          onClick(i);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <ringGeometry args={[0.13, 0.2, 28]} />
        <meshStandardMaterial
          color={hover ? "#fde047" : "#84cc16"}
          emissive={hover ? "#facc15" : "#4d7c0f"}
          emissiveIntensity={hover ? 0.7 : 0.3}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* invisible click pad so empty nodes stay clickable */}
      <mesh
        position={[pos[0], 0.403, pos[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          onClick(i);
        }}
      >
        <circleGeometry args={[0.24, 12]} />
      </mesh>
    </group>
  );
}

export interface BoardSceneProps {
  board: Cell[];
  selected: number | null;
  targets: number[];
  onNodeClick: (i: number) => void;
}

function Board() {
  return (
    <group>
      {/* thick wooden slab */}
      <mesh receiveShadow castShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[6.4, 0.4, 6.4]} />
        <meshStandardMaterial color="#7a4a20" roughness={0.8} />
      </mesh>
      {/* playing surface */}
      <mesh position={[0, 0.401, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.2, 6.2]} />
        <meshStandardMaterial color="#a9713a" roughness={0.85} />
      </mesh>
      {/* etched border frames */}
      {[5.9, 5.6].map((s, k) => (
        <mesh key={k} position={[0, 0.402, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[s / 2, s / 2 + 0.02, 4, 1, Math.PI / 4]} />
          <meshStandardMaterial color="#5c3517" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ board, selected, targets, onNodeClick }: BoardSceneProps) {
  return (
    <group>
      {/* grass ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#6aa84f" roughness={1} />
      </mesh>

      <Scenery />
      <Board />
      <Engraving />
      <BoardLines />

      {board.map((_, i) => (
        <Node key={`n${i}`} i={i} highlighted={targets.includes(i)} onClick={onNodeClick} />
      ))}

      {board.map((cell, i) => {
        if (cell === "empty") return null;
        const p = nodePosition(i);
        return (
          <group
            key={`p${i}`}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick(i);
            }}
          >
            {cell === "tiger" ? (
              <Tiger position={p} selected={selected === i} />
            ) : (
              <Goat position={p} selected={selected === i} />
            )}
          </group>
        );
      })}

      <ContactShadows position={[0, 0.41, 0]} opacity={0.3} scale={8} blur={2.2} far={2} />
    </group>
  );
}

export default function BoardScene(props: BoardSceneProps) {
  return (
    <Canvas
      shadows
      gl={{ alpha: true }}
      camera={{ position: [0, 7.4, 8.2], fov: 40 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.4, 0)}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.65} />
      <hemisphereLight args={["#cfe8ff", "#4f7a35", 0.7]} />
      <directionalLight
        position={[6, 12, 6]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <Scene {...props} />
      <Environment preset="park" />
    </Canvas>
  );
}
