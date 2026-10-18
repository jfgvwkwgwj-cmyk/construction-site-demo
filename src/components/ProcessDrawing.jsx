import { forwardRef } from 'react';
import config from '../config';

const SURVEY = config.units === 'metric' ? '26.8 m' : `88'-0"`;

/*
  An architectural elevation drawn in four stages, one per process step.
  Each <g data-stage="n"> is animated by the parent (stroke "drawing" tied to scroll).
*/
const P = props => <path pathLength="1" className="pd-line" {...props} />;
const Rect = ({ x, y, w, h, ...p }) => <P d={`M${x} ${y}h${w}v${h}h${-w}Z`} {...p} />;
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));

const GRID = [70, 160, 250, 340]; // column grid lines A–D
const GROUND = 340;
const FLOOR_H = 62;

const ProcessDrawing = forwardRef(function ProcessDrawing(_, ref) {
  return (
    <svg ref={ref} viewBox="0 0 410 470" className="pd" role="img" aria-label="Elevation drawing of a three-storey building, drawn in stages">
      <defs>
        <pattern id="pd-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0V6" className="pd-hatch" />
        </pattern>
        <pattern id="pd-paper" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" fill="none" className="pd-grid" />
        </pattern>
      </defs>
      <rect width="410" height="470" fill="url(#pd-paper)" />

      {/* Stage 1 — site visit: ground, grid bubbles, survey dimension */}
      <g data-stage="0">
        <P d={`M20 ${GROUND}H390`} className="pd-line pd-strong" />
        {GRID.map((x, i) => (
          <g key={x}>
            <P d={`M${x} 34V${GROUND + 70}`} className="pd-line pd-axis" />
            <circle cx={x} cy={22} r={11} pathLength="1" className="pd-line pd-thin" />
            <text x={x} y={26} className="pd-text pd-bubble">
              {'ABCD'[i]}
            </text>
          </g>
        ))}
        <P d={`M70 ${GROUND + 52}H340M70 ${GROUND + 46}v12M340 ${GROUND + 46}v12`} className="pd-line pd-dim" />
        <text x="205" y={GROUND + 47} className="pd-text">
          SURVEYED · {SURVEY}
        </text>
        {/* survey stakes */}
        {[70, 340].map(x => (
          <P key={x} d={`M${x - 6} ${GROUND - 14}l6 14l6 -14Z`} className="pd-line pd-accent" />
        ))}
      </g>

      {/* Stage 2 — proposal: footings below grade, hatched */}
      <g data-stage="1">
        {GRID.map(x => (
          <g key={x}>
            <rect x={x - 18} y={GROUND + 6} width={36} height={18} fill="url(#pd-hatch)" className="pd-fill" />
            <Rect x={x - 18} y={GROUND + 6} w={36} h={18} className="pd-line" />
          </g>
        ))}
        <P d={`M52 ${GROUND}V${GROUND + 6}M358 ${GROUND}V${GROUND + 6}`} className="pd-line" />
        <text x="205" y={GROUND + 72} className="pd-text pd-muted">
          FOUNDATION PLAN · FIXED PRICE
        </text>
      </g>

      {/* Stage 3 — build: columns, slabs, roof */}
      <g data-stage="2">
        {GRID.map(x => (
          <P key={x} d={`M${x - 4} ${GROUND}V${GROUND - FLOOR_H * 3 - 6}M${x + 4} ${GROUND}V${GROUND - FLOOR_H * 3 - 6}`} className="pd-line" />
        ))}
        {range(4, i => (
          <Rect key={i} x={52} y={GROUND - FLOOR_H * i - 6} w={306} h={6} className="pd-line pd-strong-ink" />
        ))}
        <Rect x={46} y={GROUND - FLOOR_H * 3 - 18} w={318} h={12} className="pd-line" />
        {range(3, i => (
          <text key={i} x={392} y={GROUND - FLOOR_H * (i + 1) + 2} className="pd-text pd-level">
            L{i + 2}
          </text>
        ))}
      </g>

      {/* Stage 4 — walkthrough: glazing, door, details, landscaping */}
      <g data-stage="3">
        {range(3, f =>
          range(3, b => (
            <g key={`${f}-${b}`}>
              <Rect x={GRID[b] + 12} y={GROUND - FLOOR_H * (f + 1) + 10} w={66} h={FLOOR_H - 26} className="pd-line pd-thin" />
              <P d={`M${GRID[b] + 45} ${GROUND - FLOOR_H * (f + 1) + 10}v${FLOOR_H - 26}`} className="pd-line pd-thin" />
              {(f + b) % 2 === 0 && (
                <rect x={GRID[b] + 13} y={GROUND - FLOOR_H * (f + 1) + 11} width={64} height={FLOOR_H - 28} className="pd-glow" />
              )}
            </g>
          ))
        ).flat()}
        <Rect x={185} y={GROUND - 46} w={40} h={46} className="pd-line pd-accent" />
        <P d={`M28 ${GROUND}c0-30 8-42 16-42s16 12 16 42M44 ${GROUND - 20}V${GROUND}`} className="pd-line pd-thin" />
        <P d={`M366 ${GROUND}c0-24 6-34 12-34s12 10 12 34M378 ${GROUND - 16}V${GROUND}`} className="pd-line pd-thin" />
        <g className="pd-check">
          <circle cx="352" cy="78" r="20" pathLength="1" className="pd-line pd-accent" />
          <P d="M342 78l7 7l13-14" className="pd-line pd-accent" />
        </g>
      </g>

      {/* title block */}
      <g className="pd-title">
        <P d="M20 430H390M20 462H390M20 430V462M390 430V462M240 430V462M320 430V462" className="pd-line pd-thin" />
        <text x="30" y="450" className="pd-text pd-left">
          ELEVATION — SOUTH
        </text>
        <text x="280" y="450" className="pd-text">
          1:100
        </text>
        <text x="355" y="450" className="pd-text" data-sheet>
          A-201
        </text>
      </g>
    </svg>
  );
});

export default ProcessDrawing;
