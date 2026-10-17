import React from 'react';

const nodes = [
  [160,25],[226,45],[270,94],[280,154],[243,210],[176,237],[105,225],[49,183],[35,117],[73,58],
  [160,69],[210,94],[221,151],[188,192],[123,191],[91,146],[110,96],[160,121],
];
const edges = [];
for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
  const distance = Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]);
  if (distance < 112 && distance > 30) edges.push([a, b]);
}

export default function NeuralGraphic() {
  return <div className="neural-graphic" role="img" aria-label="Glowing artificial intelligence network connecting data nodes">
    <svg viewBox="0 0 320 280" fill="none" aria-hidden="true">
      <defs><radialGradient id="neural-glow"><stop stopColor="#88f2ff" stopOpacity=".2"/><stop offset="1" stopColor="#88f2ff" stopOpacity="0"/></radialGradient></defs>
      <circle cx="160" cy="132" r="126" fill="url(#neural-glow)" />
      <ellipse cx="160" cy="132" rx="122" ry="111" stroke="#88f2ff" strokeOpacity=".14" strokeDasharray="3 7" />
      {edges.map(([a,b], i) => <path key={i} d={`M${nodes[a][0]},${nodes[a][1]} L${nodes[b][0]},${nodes[b][1]}`} stroke="#88f2ff" strokeOpacity={i % 3 === 0 ? '.5' : '.19'} strokeWidth=".8"/>)}
      {nodes.map(([x,y], i) => <g key={i} className="neural-node" style={{animationDelay:`${i * -.23}s`}}><circle cx={x} cy={y} r="7" fill="#88f2ff" fillOpacity=".09"/><circle cx={x} cy={y} r={i%3===0?3.2:2} fill="#bbf8ff" /></g>)}
      <rect x="133" y="105" width="54" height="54" rx="8" fill="#0b2432" stroke="#88f2ff" strokeWidth="1.2" />
      <rect x="140" y="112" width="40" height="40" rx="4" stroke="#88f2ff" strokeOpacity=".3" />
      <text x="160" y="140" fill="#b8f8ff" textAnchor="middle" fontFamily="Sora, sans-serif" fontSize="22">AI</text>
      <text x="160" y="269" fill="#88f2ff" fillOpacity=".65" textAnchor="middle" fontFamily="monospace" fontSize="7" letterSpacing="2">DATA · INTELLIGENCE · CONNECTION</text>
    </svg>
  </div>;
}
