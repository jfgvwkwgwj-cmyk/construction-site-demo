import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import config from '../config';
import Icon from './Icon';

const money = n => (n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${Math.round(n / 1000)}k`);

// Animated number that tweens between values
function Tween({ value, format }) {
  const ref = useRef(null);
  const cur = useRef(value);
  useEffect(() => {
    const o = { v: cur.current };
    const tw = gsap.to(o, {
      v: value,
      duration: 0.7,
      ease: 'power3.out',
      onUpdate: () => {
        cur.current = o.v;
        if (ref.current) ref.current.textContent = format(o.v);
      }
    });
    return () => tw.kill();
  }, [value, format]);
  return <span ref={ref}>{format(value)}</span>;
}

export default function Estimator({ onQuote }) {
  const { types, finishes, note } = config.estimator;
  const [typeIdx, setTypeIdx] = useState(0);
  const type = types[typeIdx];
  const [size, setSize] = useState(type.default);
  const [finishIdx, setFinishIdx] = useState(1);
  const finish = finishes[finishIdx];

  useEffect(() => setSize(types[typeIdx].default), [typeIdx, types]);

  const { low, high, weeks } = useMemo(() => {
    const m = finish.mult;
    return {
      low: Math.round((type.low * size * m) / 1000) * 1000,
      high: Math.round((type.high * size * m) / 1000) * 1000,
      weeks: Math.max(2, Math.round(type.weeksBase + (size / 1000) * type.weeksPer1000 * (0.85 + m * 0.15)))
    };
  }, [type, size, finish]);

  const fill = ((size - type.min) / (type.max - type.min)) * 100;

  const send = () =>
    onQuote?.({
      project: type.service,
      details: `Estimator: ${type.name}, ${size.toLocaleString()} ${type.unit}, ${finish.name} finish — ${money(low)}–${money(high)}, ~${weeks} weeks.`
    });

  return (
    <div className="est">
      <div className="est-controls">
        <fieldset className="est-group">
          <legend>Project</legend>
          <div className="est-types">
            {types.map((t, i) => (
              <button
                type="button"
                key={t.name}
                className={`est-type ${i === typeIdx ? 'is-on' : ''}`}
                onClick={() => setTypeIdx(i)}
                aria-pressed={i === typeIdx}
              >
                <Icon name={t.icon} size={22} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="est-group">
          <label htmlFor="est-size" className="est-legend">
            Size
            <output htmlFor="est-size" className="est-size">
              {size.toLocaleString()} <small>{type.unit}</small>
            </output>
          </label>
          <input
            id="est-size"
            type="range"
            min={type.min}
            max={type.max}
            step={type.step}
            value={size}
            onChange={e => setSize(+e.target.value)}
            className="est-range"
            style={{ '--fill': `${fill}%` }}
          />
          <div className="est-scale">
            <span>{type.min.toLocaleString()}</span>
            <span>{type.max.toLocaleString()}</span>
          </div>
        </div>

        <fieldset className="est-group">
          <legend>Finish level</legend>
          <div className="est-seg" style={{ '--i': finishIdx, '--n': finishes.length }}>
            <i className="est-seg-thumb" aria-hidden="true" />
            {finishes.map((f, i) => (
              <button type="button" key={f.name} className={i === finishIdx ? 'is-on' : ''} onClick={() => setFinishIdx(i)} aria-pressed={i === finishIdx}>
                {f.name}
              </button>
            ))}
          </div>
          <p className="est-hint">{finish.hint}</p>
        </fieldset>
      </div>

      <div className="est-result" aria-live="polite">
        <div className="est-ticket">
          <div className="est-ticket-head">
            <span>Ballpark estimate</span>
            <span>
              Ref #{(typeIdx + 1) * 1000 + finishIdx * 100 + Math.round(size / 100)}
            </span>
          </div>
          <div className="est-price">
            <Tween value={low} format={money} />
            <span className="est-dash">–</span>
            <Tween value={high} format={money} />
          </div>
          <div className="est-rows">
            <div>
              <span>Rate</span>
              <strong>
                ${Math.round(type.low * finish.mult)}–${Math.round(type.high * finish.mult)} / {type.unit}
              </strong>
            </div>
            <div>
              <span>Build time</span>
              <strong>
                ~<Tween value={weeks} format={v => Math.round(v)} /> weeks
              </strong>
            </div>
            <div>
              <span>Includes</span>
              <strong>Permits, labor, materials, cleanup</strong>
            </div>
          </div>
          <button type="button" className="btn btn-solid btn-lg" onClick={send}>
            Lock in an exact quote <Icon name="arrow" size={18} />
          </button>
          <p className="est-note">{note}</p>
        </div>
      </div>
    </div>
  );
}
