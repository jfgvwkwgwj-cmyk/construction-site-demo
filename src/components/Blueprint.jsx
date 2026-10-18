import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import config from '../config';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Drawing labels in the company's units
const U =
  config.units === 'metric'
    ? { houseW: '12.8 m', houseH: '8.7 m', extW: 'NEW EXTENSION · 24 m²', extH: '3.0 m', whSize: '3,500 m²', bridge: '36 m SPAN', lvl: '5 LVL' }
    : { houseW: `42'-0"`, houseH: `28'-6"`, extW: 'NEW EXTENSION · 450 SF', extH: `10'-0"`, whSize: '38,000 SF', bridge: `120'-0" SPAN`, lvl: '5 LVL' };

// Every shape uses pathLength="1" so GSAP can "draw" it by animating the dash offset.
const L = props => <path pathLength="1" className="bp-line" {...props} />;
const R = ({ x, y, w, h, ...p }) => <L d={`M${x} ${y}h${w}v${h}h${-w}Z`} {...p} />;

const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));

const drawings = {
  house: () => (
    <>
      <L d="M20 260H380" className="bp-line bp-strong" />
      <R x={90} y={150} w={220} h={110} />
      <L d="M70 158L200 70L330 158" className="bp-line bp-strong" />
      <R x={250} y={80} w={24} h={44} />
      <R x={180} y={195} w={40} h={65} />
      <R x={110} y={175} w={45} h={40} />
      <R x={245} y={175} w={45} h={40} />
      <L d="M132.5 175v40M110 195h45M267.5 175v40M245 195h45" className="bp-line bp-thin" />
      <L d="M90 280H310M90 274v12M310 274v12" className="bp-line bp-dim" />
      <L d="M345 70V260M339 70h12M339 260h12" className="bp-line bp-dim" />
      <text x="200" y="296" className="bp-text">{U.houseW}</text>
      <text x="362" y="168" className="bp-text" transform="rotate(90 362 168)">{U.houseH}</text>
    </>
  ),
  extension: () => (
    <>
      <L d="M20 260H380" className="bp-line bp-strong" />
      {/* existing house, drawn light */}
      <R x={60} y={128} w={150} h={132} className="bp-line bp-thin" />
      <L d="M48 136L135 74L222 136" className="bp-line bp-thin" />
      <R x={82} y={150} w={36} h={34} className="bp-line bp-thin" />
      <R x={150} y={150} w={36} h={34} className="bp-line bp-thin" />
      <R x={82} y={204} w={36} h={34} className="bp-line bp-thin" />
      <text x="135" y="64" className="bp-text">EXISTING</text>
      {/* new single-storey rear extension */}
      <R x={210} y={182} w={140} h={78} />
      <L d="M204 182H356" className="bp-line bp-strong" />
      <L d="M252 182v-12h52v12" className="bp-line bp-strong" />
      <R x={224} y={198} w={112} h={62} />
      <L d="M252 198v62M280 198v62M308 198v62" className="bp-line bp-thin" />
      <L d="M210 280H350M210 274v12M350 274v12" className="bp-line bp-dim" />
      <L d="M366 182V260M360 182h12M360 260h12" className="bp-line bp-dim" />
      <text x="280" y="296" className="bp-text">{U.extW}</text>
      <text x="382" y="221" className="bp-text" transform="rotate(90 382 221)">{U.extH}</text>
    </>
  ),
  loft: () => (
    <>
      <L d="M20 260H380" className="bp-line bp-strong" />
      {/* existing house, drawn light */}
      <R x={90} y={150} w={220} h={110} className="bp-line bp-thin" />
      <L d="M70 158L200 70L330 158" className="bp-line bp-thin" />
      <R x={180} y={195} w={40} h={65} className="bp-line bp-thin" />
      <R x={110} y={175} w={45} h={40} className="bp-line bp-thin" />
      <R x={245} y={175} w={45} h={40} className="bp-line bp-thin" />
      {/* new dormer + roof lights */}
      <R x={170} y={102} w={60} h={40} />
      <L d="M162 102H238" className="bp-line bp-strong" />
      <R x={180} y={110} w={40} h={24} />
      <L d="M200 110v24" className="bp-line bp-thin" />
      <R x={118} y={134} w={20} h={12} />
      <R x={262} y={134} w={20} h={12} />
      <L d="M238 116L318 104" className="bp-line bp-dim" />
      <text x="342" y="100" className="bp-text">NEW DORMER</text>
      <L d="M90 280H310M90 274v12M310 274v12" className="bp-line bp-dim" />
      <text x="200" y="296" className="bp-text">LOFT · 2 BED + BATH</text>
    </>
  ),
  tower: () => (
    <>
      <L d="M20 270H380" className="bp-line bp-strong" />
      <R x={130} y={60} w={120} h={210} />
      {range(6, i => <L key={i} d={`M130 ${95 + i * 30}H250`} className="bp-line bp-thin" />)}
      {range(3, i => <L key={'v' + i} d={`M${160 + i * 30} 60V270`} className="bp-line bp-thin" />)}
      <L d="M300 270V30M300 30H120M300 30L330 30M300 60L280 30M300 90L280 60M300 120L280 90" className="bp-line" />
      <L d="M150 30V58" className="bp-line bp-thin" />
      <R x={140} y={50} w={20} h={8} />
      <R x={318} y={26} w={22} h={14} />
      <L d="M105 60V270M99 60h12M99 270h12" className="bp-line bp-dim" />
      <text x="88" y="168" className="bp-text" transform="rotate(-90 88 168)">{U.lvl}</text>
    </>
  ),
  warehouse: () => (
    <>
      <L d="M10 260H390" className="bp-line bp-strong" />
      <L d="M40 260V140L100 110L160 140L220 110L280 140L340 110L360 120V260" className="bp-line bp-strong" />
      <L d="M100 110V140M220 110V140M340 110V140" className="bp-line bp-thin" />
      {range(4, i => (
        <g key={i}>
          <R x={60 + i * 75} y={190} w={50} h={70} />
          {range(5, j => <L key={j} d={`M${60 + i * 75} ${202 + j * 12}h50`} className="bp-line bp-thin" />)}
        </g>
      ))}
      <L d="M40 160H360" className="bp-line bp-thin" />
      <L d="M40 280H360M40 274v12M360 274v12" className="bp-line bp-dim" />
      <text x="200" y="296" className="bp-text">{U.whSize}</text>
    </>
  ),
  interior: () => (
    <>
      <L d="M20 260H380M20 40H380" className="bp-line bp-strong" />
      <R x={40} y={170} w={320} h={90} />
      <L d="M40 180H360" className="bp-line" />
      {range(5, i => <R key={i} x={50 + i * 62} y={190} w={52} h={62} className="bp-line bp-thin" />)}
      <R x={40} y={70} w={130} h={60} />
      <R x={230} y={70} w={130} h={60} />
      <L d="M83 70v60M126 70v60M273 70v60M316 70v60" className="bp-line bp-thin" />
      <L d="M200 40V95" className="bp-line bp-thin" />
      <L d="M186 95h28l-6 14h-16Z" className="bp-line" />
      <circle cx="200" cy="118" r="5" pathLength="1" className="bp-line bp-thin" />
      <text x="200" y="160" className="bp-text">ELEV. A — KITCHEN</text>
    </>
  ),
  bridge: () => (
    <>
      <L d="M10 210H390" className="bp-line bp-strong" />
      <L d="M10 222H390" className="bp-line" />
      <L d="M60 210Q200 40 340 210" className="bp-line bp-strong" />
      {range(9, i => {
        const x = 88 + i * 28;
        const t = (x - 60) / 280;
        const y = (1 - t) * (1 - t) * 210 + 2 * (1 - t) * t * 40 + t * t * 210;
        return <L key={i} d={`M${x} ${y}V210`} className="bp-line bp-thin" />;
      })}
      <R x={50} y={222} w={20} h={58} />
      <R x={330} y={222} w={20} h={58} />
      <L d="M10 280H390" className="bp-line bp-thin" />
      <L d="M60 250H340M60 244v12M340 244v12" className="bp-line bp-dim" />
      <text x="200" y="266" className="bp-text">{U.bridge}</text>
    </>
  )
};

export default function Blueprint({ type = 'house', className = '', autoplay = false, duration = 2.4 }) {
  const ref = useRef(null);
  const Drawing = drawings[type] || drawings.house;

  useGSAP(
    () => {
      const lines = ref.current.querySelectorAll('.bp-line');
      const texts = ref.current.querySelectorAll('.bp-text');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(texts, { opacity: 0 });
      const tl = gsap.timeline({
        paused: !autoplay,
        delay: autoplay ? 0.2 : 0,
        scrollTrigger: autoplay ? undefined : { trigger: ref.current, start: 'top 85%', once: true }
      });
      tl.to(lines, { strokeDashoffset: 0, duration, ease: 'power2.inOut', stagger: { amount: duration * 0.6 } }).to(
        texts,
        { opacity: 1, duration: 0.6, stagger: 0.1 },
        '-=0.6'
      );
      if (autoplay) tl.play();
    },
    { scope: ref }
  );

  return (
    <svg ref={ref} viewBox="0 0 400 300" className={`blueprint ${className}`} aria-hidden="true">
      <defs>
        <pattern id={`g-${type}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" className="bp-grid" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill={`url(#g-${type})`} />
      <Drawing />
    </svg>
  );
}
