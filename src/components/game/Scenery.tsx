import { useMemo } from "react";

function Tree({
  position,
  scale = 1,
  tint = "#2f7d32",
  rot = 0,
}: {
  position: [number, number, number];
  scale?: number;
  tint?: string;
  rot?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rot, 0]}>
      {/* trunk */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.1, 0.17, 1.1, 6]} />
        <meshStandardMaterial color="#7a4a24" roughness={1} flatShading />
      </mesh>
      {/* layered canopy — chunky low-poly clusters */}
      <mesh castShadow position={[0, 1.25, 0]}>
        <icosahedronGeometry args={[0.78, 0]} />
        <meshStandardMaterial color={tint} roughness={0.95} flatShading />
      </mesh>
      <mesh castShadow position={[0.34, 1.62, -0.18]}>
        <icosahedronGeometry args={[0.52, 0]} />
        <meshStandardMaterial color="#43a047" roughness={0.95} flatShading />
      </mesh>
      <mesh castShadow position={[-0.32, 1.5, 0.24]}>
        <icosahedronGeometry args={[0.46, 0]} />
        <meshStandardMaterial color="#2e7031" roughness={0.95} flatShading />
      </mesh>
      <mesh castShadow position={[0.02, 2.02, 0.06]}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#5ab24d" roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

function Bush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.28, 0]}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color="#357a35" roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[0.3, 0.2, 0.14]}>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#48924a" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function Temple({
  position,
  rotation = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* stepped stone plinth */}
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[3.4, 0.24, 3.4]} />
        <meshStandardMaterial color="#b9b2a0" roughness={1} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.36, 0]}>
        <boxGeometry args={[2.9, 0.24, 2.9]} />
        <meshStandardMaterial color="#cfc7b3" roughness={1} flatShading />
      </mesh>
      {/* walls */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[2.2, 1.25, 2.2]} />
        <meshStandardMaterial color="#efe6d0" roughness={0.95} flatShading />
      </mesh>
      {/* doorway */}
      <mesh position={[0, 0.9, 1.12]}>
        <boxGeometry args={[0.7, 1, 0.05]} />
        <meshStandardMaterial color="#4a2c14" roughness={1} />
      </mesh>
      {/* pagoda roofs (3 tiers) */}
      {[
        { y: 1.95, r: 2.3, h: 0.55, c: "#e2601a" },
        { y: 2.55, r: 1.75, h: 0.5, c: "#d1500f" },
        { y: 3.05, r: 1.15, h: 0.55, c: "#c2410c" },
      ].map((t, i) => (
        <mesh key={i} castShadow position={[0, t.y, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[t.r, t.h, 4]} />
          <meshStandardMaterial color={t.c} roughness={0.75} flatShading />
        </mesh>
      ))}
      {/* gold finial */}
      <mesh castShadow position={[0, 3.55, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.45, 6]} />
        <meshStandardMaterial color="#f5c542" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 3.85, 0]}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color="#ffd75e" metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  );
}

/** Tall red hanging banner on a wooden frame with gold finials, like the reference art. */
function Banner({
  position,
  rotation = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* stone footing */}
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <dodecahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color="#a9a396" roughness={1} flatShading />
      </mesh>
      {/* pole */}
      <mesh castShadow position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.07, 0.085, 3.4, 8]} />
        <meshStandardMaterial color="#6b4423" roughness={1} flatShading />
      </mesh>
      {/* gold cap */}
      <mesh castShadow position={[0, 3.48, 0]}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color="#f2c14e" metalness={0.7} roughness={0.28} />
      </mesh>
      {/* crossbar */}
      <mesh castShadow position={[0.5, 3.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 1.15, 6]} />
        <meshStandardMaterial color="#6b4423" roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[1.05, 3.18, 0]}>
        <octahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial color="#f2c14e" metalness={0.7} roughness={0.28} />
      </mesh>
      {/* hanging cloth */}
      <mesh castShadow position={[0.5, 2.12, 0]}>
        <boxGeometry args={[1.0, 1.95, 0.04]} />
        <meshStandardMaterial color="#b4241f" roughness={0.9} flatShading />
      </mesh>
      {/* pointed cloth tail */}
      <mesh castShadow position={[0.5, 1.02, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.5, 0.04]} />
        <meshStandardMaterial color="#9d1c18" roughness={0.9} flatShading />
      </mesh>
      {/* gold emblem */}
      <mesh position={[0.5, 2.2, 0.03]}>
        <torusGeometry args={[0.27, 0.045, 6, 20]} />
        <meshStandardMaterial color="#e0a92e" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0.5, 2.2, 0.03]}>
        <circleGeometry args={[0.16, 8]} />
        <meshStandardMaterial color="#e0a92e" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** Rocky cluster: a big angular boulder with smaller chips around it. */
function Rocks({
  position,
  scale = 1,
  rot = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rot?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rot, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.26, 0]} rotation={[0.2, 0.6, 0.1]}>
        <dodecahedronGeometry args={[0.46, 0]} />
        <meshStandardMaterial color="#b0a99b" roughness={1} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0.5, 0.15, 0.24]} rotation={[0.5, 1.2, 0.3]}>
        <dodecahedronGeometry args={[0.27, 0]} />
        <meshStandardMaterial color="#aca596" roughness={1} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.42, 0.11, -0.2]} rotation={[0.1, 2.1, 0.4]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#bdb6a7" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

/** Flat cobble tile sunk into the grass. */
function Cobble({
  position,
  scale,
  rot,
  tone,
}: {
  position: [number, number, number];
  scale: number;
  rot: number;
  tone: string;
}) {
  return (
    <mesh
      position={position}
      rotation={[0, rot, 0]}
      scale={[scale, scale * 0.22, scale]}
      receiveShadow
    >
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color={tone} roughness={1} flatShading />
    </mesh>
  );
}

export default function Scenery() {
  const rand = useMemo(() => {
    let seed = 7;
    return () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  }, []);

  const { trees, bushes, rocks, cobbles } = useMemo(() => {
    const tints = ["#2f7d32", "#3f9142", "#57a044", "#276d2d", "#4e9b3f"];
    const trees: Array<{ p: [number, number, number]; s: number; tint: string; r: number }> = [];
    for (let i = 0; i < 46; i++) {
      const a = rand() * Math.PI * 2;
      const r = 7.6 + rand() * 11;
      trees.push({
        p: [Math.cos(a) * r, 0, Math.sin(a) * r],
        s: 0.65 + rand() * 1.0,
        tint: tints[Math.floor(rand() * tints.length)]!,
        r: rand() * Math.PI,
      });
    }

    const bushes: Array<{ p: [number, number, number]; s: number }> = [];
    for (let i = 0; i < 22; i++) {
      const a = rand() * Math.PI * 2;
      const r = 5.0 + rand() * 10;
      bushes.push({ p: [Math.cos(a) * r, 0, Math.sin(a) * r], s: 0.7 + rand() * 0.8 });
    }

    const rocks: Array<{ p: [number, number, number]; s: number; r: number }> = [];
    for (let i = 0; i < 16; i++) {
      const a = rand() * Math.PI * 2;
      const r = 8.5 + rand() * 8;
      rocks.push({
        p: [Math.cos(a) * r, 0, Math.sin(a) * r],
        s: 0.45 + rand() * 0.5,
        r: rand() * Math.PI,
      });
    }

    const tones = ["#c9c2b3", "#b6afa1", "#d8d1c1", "#a9a294"];
    const cobbles: Array<{ p: [number, number, number]; s: number; r: number; tone: string }> = [];
    for (let i = 0; i < 60; i++) {
      const a = rand() * Math.PI * 2;
      const r = 5.2 + rand() * 9.5;
      cobbles.push({
        p: [Math.cos(a) * r, 0.02, Math.sin(a) * r],
        s: 0.45 + rand() * 0.6,
        r: rand() * Math.PI,
        tone: tones[Math.floor(rand() * tones.length)]!,
      });
    }

    return { trees, bushes, rocks, cobbles };
  }, [rand]);

  return (
    <group>
      {/* distant hills */}
      {[
        [-16, -18, 5],
        [10, -22, 6.5],
        [22, -10, 4.5],
        [-24, -6, 5.5],
      ].map(([x, z, s], i) => (
        <mesh key={`h${i}`} position={[x!, -0.5, z!]} castShadow={false}>
          <coneGeometry args={[s! * 1.6, s! * 1.6, 5]} />
          <meshStandardMaterial color={i % 2 ? "#4d7c4a" : "#5f8f56"} roughness={1} flatShading />
        </mesh>
      ))}

      <Temple position={[-9, 0, -7]} rotation={0.5} scale={1.0} />
      <Temple position={[8.5, 0, -8]} rotation={-0.4} scale={0.9} />
      <Temple position={[0, 0, -13]} rotation={0} scale={1.3} />

      <Banner position={[-5.6, 0, 1.8]} rotation={0.5} scale={1.0} />
      <Banner position={[5.6, 0, 1.8]} rotation={-0.5 + Math.PI} scale={1.0} />

      {cobbles.map((c, i) => (
        <Cobble key={`c${i}`} position={c.p} scale={c.s} rot={c.r} tone={c.tone} />
      ))}

      {rocks.map((r, i) => (
        <Rocks key={`r${i}`} position={r.p} scale={r.s} rot={r.r} />
      ))}

      {bushes.map((b, i) => (
        <Bush key={`b${i}`} position={b.p} scale={b.s} />
      ))}

      {trees.map((t, i) => (
        <Tree key={`t${i}`} position={t.p} scale={t.s} tint={t.tint} rot={t.r} />
      ))}
    </group>
  );
}
