import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Blueprint from './Blueprint';
import config from '../config';

const BRICK = config.buildStyle === 'brick';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The finished house, drawn on the same 400×300 grid as the blueprint so the two line up exactly.
function BuiltHouse() {
  return (
    <svg viewBox="0 0 400 300" className="built" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2433" />
          <stop offset="0.65" stopColor="#3a3340" />
          <stop offset="1" stopColor="#8a5a3c" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9d2c6" />
          <stop offset="1" stopColor="#b8afa2" />
        </linearGradient>
        <linearGradient id="roofG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2b2d31" />
          <stop offset="1" stopColor="#3d4046" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#ffd08a" />
          <stop offset="1" stopColor="#f59e3b" />
        </radialGradient>
        <pattern id="siding" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 7.5H8" stroke="#00000018" strokeWidth="1" />
        </pattern>
        <pattern id="brick" width="16" height="8" patternUnits="userSpaceOnUse">
          <rect width="16" height="8" fill="#a65a42" />
          <rect x="0" y="0" width="7.4" height="3.4" fill="#b2634a" />
          <rect x="8" y="0" width="7.4" height="3.4" fill="#9c5039" />
          <rect x="-4" y="4" width="7.4" height="3.4" fill="#a95c43" />
          <rect x="4" y="4" width="7.4" height="3.4" fill="#b86a50" />
          <rect x="12" y="4" width="7.4" height="3.4" fill="#9a4f38" />
          <path d="M0 3.7H16M0 7.7H16M7.7 0V3.7M15.7 0V3.7M3.7 4V8M11.7 4V8" stroke="#d6cbbb" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#sky)" />
      <circle cx="330" cy="62" r="16" fill="#f7d9a8" opacity="0.85" />
      {/* lawn */}
      <path d="M0 260H400V300H0Z" fill="#20281f" />
      <path d="M180 260h40l14 40h-68Z" fill="#6b655c" />
      {/* tree */}
      <path d="M50 260v-38" stroke="#3a2b20" strokeWidth="5" />
      <circle cx="50" cy="205" r="26" fill="#2f4030" />
      <circle cx="38" cy="214" r="18" fill="#3a5038" />
      {/* chimney behind roof */}
      <rect x="250" y="80" width="24" height="44" fill="#7a4b38" />
      <rect x="247" y="76" width="30" height="7" fill="#5c382a" />
      {/* walls */}
      {BRICK ? (
        <rect x="90" y="150" width="220" height="110" fill="url(#brick)" />
      ) : (
        <>
          <rect x="90" y="150" width="220" height="110" fill="url(#wall)" />
          <rect x="90" y="150" width="220" height="110" fill="url(#siding)" />
        </>
      )}
      {/* roof */}
      <path d="M70 158L200 70L330 158Z" fill="url(#roofG)" />
      <path d="M70 158L200 70L330 158" fill="none" stroke={config.theme.accentOnDark} strokeWidth="2.5" />
      <path d="M90 158H310" stroke="#00000033" strokeWidth="6" />
      {/* windows */}
      {[110, 245].map(x => (
        <g key={x}>
          <rect x={x - 4} y={171} width={53} height={48} fill={BRICK ? '#f1efe9' : '#4a4540'} />
          <rect x={x} y={175} width={45} height={40} fill="url(#glow)" />
          <path d={`M${x + 22.5} 175v40M${x} 195h45`} stroke={BRICK ? '#f1efe9' : '#4a4540'} strokeWidth="2.5" />
        </g>
      ))}
      {/* door */}
      <rect x="176" y="191" width="48" height="69" fill={BRICK ? '#f1efe9' : '#4a4540'} />
      <rect x="180" y="195" width="40" height="65" fill={BRICK ? '#26352f' : '#7a3b26'} />
      <circle cx="212" cy="230" r="2.2" fill={config.theme.accentOnDark} />
      <rect x="168" y="186" width="64" height="6" fill="#2b2d31" />
      {/* porch light glow */}
      <circle cx="200" cy="182" r="22" fill="#ffd08a" opacity="0.12" />
    </svg>
  );
}

export default function Compare() {
  const ref = useRef(null);
  const [pos, setPos] = useState(100);
  const dragging = useRef(false);

  useGSAP(
    () => {
      const o = { v: 100 };
      gsap.to(o, {
        v: 50,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => !dragging.current && setPos(o.v),
        scrollTrigger: { trigger: ref.current, start: 'top 65%', once: true }
      });
    },
    { scope: ref }
  );

  const setFromEvent = e => {
    const r = ref.current.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      className="compare"
      ref={ref}
      onPointerDown={e => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromEvent(e);
      }}
      onPointerMove={e => dragging.current && setFromEvent(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div className="compare-layer compare-plan">
        <Blueprint type="house" duration={1.6} />
        <span className="compare-tag">Plan · Sheet A-201</span>
      </div>
      <div className="compare-layer compare-built" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <BuiltHouse />
        <span className="compare-tag compare-tag-r">Built · Handover day</span>
      </div>
      <div className="compare-handle" style={{ left: `${pos}%` }}>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(pos)}
          onChange={e => {
            dragging.current = true;
            setPos(+e.target.value);
          }}
          aria-label="Compare plan and finished build"
          className="compare-input"
        />
        <span className="compare-knob" aria-hidden="true">
          ‹ ›
        </span>
      </div>
    </div>
  );
}
