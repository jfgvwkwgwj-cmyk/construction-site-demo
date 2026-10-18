import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import config from './config';
import { initSmoothScroll, scrollToTarget, getLenis } from './lib/scroll';
import Icon from './components/Icon';
import Blueprint from './components/Blueprint';
import BuildScene from './components/BuildScene';
import Estimator from './components/Estimator';
import Compare from './components/Compare';
import Crosshair from './bits/Crosshair';

import SplitText from './bits/SplitText';
import CountUp from './bits/CountUp';
import { ScrollVelocity } from './bits/ScrollVelocity';
import ScrollReveal from './bits/ScrollReveal';
import RotatingText from './bits/RotatingText';
import SpotlightCard from './bits/SpotlightCard';
import Magnet from './bits/Magnet';
import StarBorder from './bits/StarBorder';
import DotGrid from './bits/DotGrid';
import Noise from './bits/Noise';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const { company, theme, hero } = config;
const telHref = `tel:${company.phone.replace(/[^\d+]/g, '')}`;
const years = new Date().getFullYear() - company.founded;

const NAV = [
  ['Services', '#services'],
  ['Projects', '#projects'],
  ['Estimate', '#estimate'],
  ['Process', '#process'],
  ['Reviews', '#reviews'],
  ['Contact', '#quote']
];

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
const accentRgb = hexToRgb(theme.accent);

const go = e => {
  const href = e.currentTarget.getAttribute('href');
  if (href?.startsWith('#')) {
    e.preventDefault();
    scrollToTarget(href);
  }
};

/* ───────────────────────── Preloader ───────────────────────── */
const PRE_PHRASES = ['Surveying site', 'Pulling permits', 'Pouring foundation', 'Raising steel', 'Ready to build'];
function Preloader({ onDone }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      const counter = { v: 0 };
      const num = ref.current.querySelector('.pre-num');
      const msg = ref.current.querySelector('.pre-msg');
      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(counter, {
        v: 100,
        duration: 1.6,
        ease: 'power3.inOut',
        onUpdate: () => {
          num.textContent = String(Math.round(counter.v)).padStart(3, '0');
          const phrase = PRE_PHRASES[Math.min(PRE_PHRASES.length - 1, Math.floor((counter.v / 100) * PRE_PHRASES.length))];
          if (msg.textContent !== phrase) msg.textContent = phrase;
        }
      })
        .to('.pre-bar i', { scaleX: 1, duration: 1.6, ease: 'power3.inOut' }, 0)
        .to('.pre-inner', { y: -40, opacity: 0, duration: 0.5, ease: 'power2.in' })
        .to(ref.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '-=0.15');
    },
    { scope: ref }
  );
  return (
    <div className="preloader" ref={ref}>
      <div className="pre-inner">
        <div className="pre-name">{company.name}</div>
        <div className="pre-bar">
          <i />
        </div>
        <div className="pre-meta">
          <span className="pre-msg">{PRE_PHRASES[0]}</span>
          <span className="pre-num">000</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Nav ───────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ solid: false, hidden: false });

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setState({ solid: y > 40, hidden: y > 400 && y > last });
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const l = getLenis();
    if (open) l?.stop();
    else l?.start();
  }, [open]);

  const navGo = e => {
    setOpen(false);
    go(e);
  };

  return (
    <>
      <header className={`nav ${state.solid ? 'is-solid' : ''} ${state.hidden && !open ? 'is-hidden' : ''}`}>
        <a href="#top" onClick={navGo} className="logo" aria-label={company.name}>
          <span className="logo-mark">{company.short[0]}</span>
          <span className="logo-text">
            {company.short}
            <small>{company.tagline}</small>
          </span>
        </a>
        <nav className="nav-links" aria-label="Main">
          {NAV.map(([label, href]) => (
            <a key={href} href={href} onClick={go}>
              {label}
            </a>
          ))}
        </nav>
        <div className="nav-cta">
          <Magnet padding={40} magnetStrength={4}>
            <a href={telHref} className="btn btn-ghost">
              <Icon name="phone" size={18} /> <span>{company.phone}</span>
            </a>
          </Magnet>
          <a href="#quote" onClick={go} className="btn btn-solid hide-sm">
            Free estimate
          </a>
          <button className={`burger ${open ? 'is-open' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open}>
            <i />
            <i />
          </button>
        </div>
      </header>
      <div className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        {NAV.map(([label, href], i) => (
          <a key={href} href={href} onClick={navGo} style={{ transitionDelay: `${open ? 0.08 * i + 0.15 : 0}s` }}>
            <span>0{i + 1}</span>
            {label}
          </a>
        ))}
        <a href={telHref} className="btn btn-solid mm-call">
          <Icon name="phone" size={18} /> Call {company.phone}
        </a>
      </div>
    </>
  );
}

/* ───────────────────────── Section header ───────────────────────── */
function SectionHead({ index, label, title, children }) {
  return (
    <div className="section-head">
      <p className="label reveal">
        <span>{index}</span> {label}
      </p>
      <SplitText text={title} tag="h2" className="h2" splitType="words" textAlign="left" delay={60} effect="rise" mask />
      {children && <p className="lead reveal">{children}</p>}
    </div>
  );
}

/* ───────────────────────── Hero (3D build) ───────────────────────── */
function Hero({ ready }) {
  const ref = useRef(null);
  const hudRef = useRef(null);
  const progressRef = useRef(0);
  const parts = useRef({ intro: 0, scroll: 0 });
  const [mobile] = useState(() => window.matchMedia('(max-width: 700px)').matches);

  const sync = () => {
    const { intro, scroll } = parts.current;
    progressRef.current = intro * 0.2 + scroll * 0.8;
    ref.current?.classList.toggle('is-topped', progressRef.current > 0.97);
  };

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * (mobile ? 1.4 : 1.8)}`,
        pin: '.hero-stage',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: self => {
          parts.current.scroll = self.progress;
          sync();
        }
      });
      gsap.to('.hero-copy', {
        opacity: 0,
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: () => `top+=${window.innerHeight * 0.9} top`,
          end: () => `top+=${window.innerHeight * (mobile ? 1.3 : 1.5)} top`,
          scrub: true,
          invalidateOnRefresh: true
        }
      });
      gsap.to('.scroll-cue', { opacity: 0, scrollTrigger: { trigger: ref.current, start: 'top+=40 top', end: 'top+=200 top', scrub: true } });
    },
    { scope: ref }
  );

  useGSAP(
    () => {
      if (!ready) return;
      gsap.to(parts.current, { intro: 1, duration: 3, ease: 'power2.inOut', delay: 0.2, onUpdate: sync });
      gsap.from('.hero-fade', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.5 });
      gsap.from('.hud', { x: 40, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.9 });
    },
    { scope: ref, dependencies: [ready] }
  );

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-stage">
        <BuildScene progressRef={progressRef} hudRef={hudRef} accent={theme.accent} bg={theme.bg} mobile={mobile} />
        <div className="hero-shade" />

        <div className="container hero-inner">
          <div className="hero-copy">
            {ready && (
              <>
                <p className="eyebrow hero-fade">
                  <Icon name="shield" size={16} /> {hero.eyebrow}
                </p>
                <SplitText
                  text={hero.headline}
                  tag="h1"
                  className="hero-title"
                  splitType="words, chars"
                  textAlign="left"
                  delay={28}
                  duration={1.1}
                  mask
                  trigger="load"
                />
                <div className="hero-rotate hero-fade">
                  <span>Specialists in</span>
                  <RotatingText
                    texts={hero.rotating}
                    mainClassName="rot-pill"
                    staggerDuration={0.02}
                    staggerFrom="last"
                    rotationInterval={2200}
                    splitBy="characters"
                  />
                </div>
                <p className="hero-sub hero-fade">{hero.sub}</p>
                <div className="hero-actions hero-fade">
                  <StarBorder
                    as="a"
                    href="#estimate"
                    onClick={go}
                    color="#ffffff"
                    duration={5}
                    radius={999}
                    backgroundColor={theme.accent}
                    textColor="#111"
                    className="btn-star"
                  >
                    Price my project <Icon name="arrow" size={18} />
                  </StarBorder>
                  <a href="#projects" onClick={go} className="btn btn-line">
                    See our work
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="hud" ref={hudRef} aria-hidden="true">
          <div className="hud-row hud-top">
            <span>
              <i className="hud-dot" /> Live build
            </span>
            <span>
              <b data-hud="pct">000</b>%
            </span>
          </div>
          <div className="hud-phase" data-hud="phase">
            Surveying site
          </div>
          <div className="hud-bar">
            <i data-hud="bar" />
          </div>
          <div className="hud-row">
            <span>
              Level <b data-hud="lvl">00</b>/09
            </span>
            <span>
              EL <b data-hud="el">+000'</b>
            </span>
          </div>
        </aside>

        <div className="stamp" aria-hidden="true">
          <span>Topped out</span>
          <small>On schedule · On budget</small>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span>Scroll to build</span>
          <i />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Caution tape ───────────────────────── */
function Tape() {
  const words = config.services.map(s => s.title.toUpperCase());
  return (
    <div className="tapes" aria-hidden="true">
      <div className="tape tape-a">
        <ScrollVelocity texts={[words.join('  ◆  ') + '  ◆  ']} velocity={30} numCopies={4} className="tape-text" />
      </div>
      <div className="tape tape-b">
        <ScrollVelocity
          texts={[`HARD HAT AREA  ◆  ${company.license.toUpperCase()}  ◆  FULLY INSURED  ◆  BUILT IN ${company.city.toUpperCase()}  ◆  `]}
          velocity={-24}
          numCopies={4}
          className="tape-text"
        />
      </div>
    </div>
  );
}

/* ───────────────────────── Elevation gauge (desktop) ───────────────────────── */
function Gauge() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const mark = el.querySelector('.gauge-mark');
    const val = el.querySelector('.gauge-val');
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      mark.style.top = `${(1 - p) * 100}%`;
      val.textContent = `+${String(Math.round(p * 240)).padStart(3, '0')}'`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="gauge" ref={ref} aria-hidden="true">
      <span className="gauge-cap">EL</span>
      <div className="gauge-track">
        <div className="gauge-mark">
          <span className="gauge-val">+000'</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Plan → Built ───────────────────────── */
function PlanToBuilt() {
  return (
    <section className="section" id="plan">
      <div className="container plan-grid">
        <SectionHead index="03" label="Plan to keys" title="What we draw is what you get.">
          Drag the slider. Every line on our plans ends up as something you can stand in, and nothing gets lost between paper and handover.
        </SectionHead>
        <div className="reveal">
          <Compare />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Estimate ───────────────────────── */
function Estimate({ onQuote }) {
  return (
    <section className="section estimate" id="estimate">
      <div className="estimate-bg" aria-hidden="true">
        <DotGrid dotSize={2} gap={28} baseColor="#24262a" activeColor={theme.accent} proximity={140} shockRadius={240} glow={0.3} />
      </div>
      <div className="container">
        <SectionHead index="05" label="Instant estimate" title="Know your number in ten seconds.">
          No email required. Pick a project, drag the size, choose a finish. You get a real ballpark built from our recent local jobs.
        </SectionHead>
        <div className="reveal">
          <Estimator onQuote={onQuote} />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Stats + About ───────────────────────── */
function About() {
  return (
    <section className="section about" id="about">
      <div className="container">
        <p className="label reveal">
          <span>01</span> Who we are
        </p>
        <ScrollReveal baseOpacity={0.12} enableBlur blurStrength={6} baseRotation={2} textClassName="about-text">
          {config.about}
        </ScrollReveal>
        <div className="stats">
          {config.stats.map(s => (
            <div className="stat reveal" key={s.label}>
              <div className="stat-num">
                <CountUp to={s.value} decimals={s.decimals} duration={2.2} separator="," />
                <span className="stat-suffix">{s.suffix}</span>
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Services ───────────────────────── */
function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <SectionHead index="02" label="Services" title="Everything from footing to finish.">
          One licensed team for the whole job — no juggling subcontractors, no finger-pointing.
        </SectionHead>
        <div className="services-grid">
          {config.services.map((s, i) => (
            <SpotlightCard
              key={s.title}
              className="service-card reveal"
              spotlightColor={`rgba(${accentRgb}, 0.22)`}
              intensity={0.25}
              borderGlow={0.8}
              theme="dark"
            >
              <div className="service-top">
                <span className="service-icon">
                  <Icon name={s.icon} size={26} />
                </span>
                <span className="service-num">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <a href="#quote" onClick={go} className="service-link">
                Get pricing <Icon name="arrow" size={16} />
              </a>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Projects (pinned horizontal scroll) ───────────────────────── */
function Projects() {
  const ref = useRef(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const track = ref.current.querySelector('.proj-track');
        const dist = () => track.scrollWidth - window.innerWidth + 48;
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current.querySelector('.proj-pin'),
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true
          }
        });
        gsap.to('.proj-progress i', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: ref.current.querySelector('.proj-pin'), start: 'top top', end: () => `+=${dist()}`, scrub: true }
        });
        ref.current.querySelectorAll('.proj-card').forEach(card => {
          gsap.from(card.querySelector('.proj-media > svg, .proj-media > img'), {
            scale: 1.15,
            ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true }
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <section className="section projects" id="projects" ref={ref}>
      <div className="proj-pin">
        <div className="container proj-head">
          <SectionHead index="04" label="Selected work" title="Built here. Still standing." />
          <div className="proj-progress" aria-hidden="true">
            <i />
          </div>
        </div>
        <div className="proj-track">
          {config.projects.map((p, i) => (
            <article className="proj-card" key={p.title}>
              <div className="proj-media">
                {p.image ? <img src={p.image} alt={p.title} loading="lazy" /> : <Blueprint type={p.type} />}
                <span className="proj-tag">{p.category}</span>
              </div>
              <div className="proj-meta">
                <span className="proj-idx">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>
                    {p.location} · {p.year} · {p.size}
                  </p>
                </div>
              </div>
            </article>
          ))}
          <a href="#quote" onClick={go} className="proj-card proj-end">
            <span>Your project</span>
            <strong>could be next.</strong>
            <span className="proj-end-btn">
              Start a conversation <Icon name="arrow" size={18} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Process ───────────────────────── */
function Process() {
  const ref = useRef(null);
  useGSAP(
    () => {
      gsap.fromTo(
        '.process-line i',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.process-list', start: 'top 70%', end: 'bottom 60%', scrub: true }
        }
      );
      gsap.utils.toArray('.step').forEach(step => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 65%',
          end: 'bottom 65%',
          toggleClass: { targets: step, className: 'is-active' }
        });
      });
    },
    { scope: ref }
  );
  return (
    <section className="section process" id="process" ref={ref}>
      <div className="container process-grid">
        <div className="process-sticky">
          <SectionHead index="06" label="How it works" title="A process with no surprises.">
            You’ll know the price, the schedule and who’s in charge before a single shovel hits dirt.
          </SectionHead>
        </div>
        <ol className="process-list">
          <div className="process-line" aria-hidden="true">
            <i />
          </div>
          {config.process.map((s, i) => (
            <li className="step" key={s.title}>
              <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────────────────────── Reviews ───────────────────────── */
function Reviews() {
  return (
    <section className="section" id="reviews">
      <div className="container">
        <SectionHead index="07" label="Reviews" title="Our best marketing is our clients." />
        <div className="reviews-grid">
          {config.testimonials.map(t => (
            <figure className="review reveal" key={t.name}>
              <div className="stars" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>
                <span className="avatar">{t.name[0]}</span>
                <span>
                  <strong>{t.name}</strong>
                  <small>{t.role}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Quote / Contact ───────────────────────── */
function Quote({ prefill }) {
  const [status, setStatus] = useState('idle');
  const formRef = useRef(null);

  useEffect(() => {
    if (!prefill || !formRef.current) return;
    const f = formRef.current;
    const radio = f.querySelector(`input[name="project"][value="${prefill.project}"]`);
    if (radio) radio.checked = true;
    if (f.details) f.details.value = prefill.details;
    setStatus('idle');
  }, [prefill]);

  const submit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (company.formEndpoint) {
      setStatus('sending');
      try {
        const res = await fetch(company.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
        setStatus(res.ok ? 'sent' : 'error');
      } catch {
        setStatus('error');
      }
      return;
    }
    const body = Object.entries(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent('Estimate request — ' + (data.name || ''))}&body=${encodeURIComponent(body)}`;
    setStatus('sent');
  };

  return (
    <section className="section quote" id="quote">
      <div className="container quote-grid">
        <div>
          <p className="label reveal">
            <span>08</span> Site visit
          </p>
          <SplitText text="Let’s build something solid." tag="h2" className="h2 h2-xl" splitType="words" textAlign="left" delay={60} mask />
          <p className="lead reveal">Tell us about your project. A real person — usually the owner — calls you back within one business day.</p>
          <ul className="contact-list reveal">
            <li>
              <Icon name="phone" size={20} />
              <a href={telHref}>{company.phone}</a>
            </li>
            <li>
              <Icon name="mail" size={20} />
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
            <li>
              <Icon name="pin" size={20} /> {company.address}
            </li>
            <li>
              <Icon name="clock" size={20} /> {company.hours}
            </li>
          </ul>
          <div className="area reveal">
            <span className="area-label">Service area</span>
            <div className="area-pills">
              {company.serviceArea.map(c => (
                <span key={c}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        <form className="quote-form reveal" onSubmit={submit} ref={formRef}>
          {status === 'sent' ? (
            <div className="form-done">
              <span className="done-icon">
                <Icon name="check" size={32} />
              </span>
              <h3>Request received.</h3>
              <p>Thanks — we’ll be in touch within one business day. Need us sooner? Call {company.phone}.</p>
            </div>
          ) : (
            <>
              <div className="field-row">
                <label className="field">
                  <span>Name</span>
                  <input name="name" required autoComplete="name" placeholder="Jane Smith" />
                </label>
                <label className="field">
                  <span>Phone</span>
                  <input name="phone" required type="tel" autoComplete="tel" placeholder="(555) 000-0000" />
                </label>
              </div>
              <label className="field">
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" placeholder="you@email.com" />
              </label>
              <div className="field">
                <span>Project type</span>
                <div className="chips">
                  {config.services.map((s, i) => (
                    <label key={s.title} className="chip">
                      <input type="radio" name="project" value={s.title} defaultChecked={i === 0} />
                      <span>{s.title}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="field-row">
                <label className="field">
                  <span>Budget</span>
                  <select name="budget" defaultValue="">
                    <option value="" disabled>
                      Select a range
                    </option>
                    <option>Under $25k</option>
                    <option>$25k – $100k</option>
                    <option>$100k – $500k</option>
                    <option>$500k+</option>
                  </select>
                </label>
                <label className="field">
                  <span>Timeline</span>
                  <select name="timeline" defaultValue="">
                    <option value="" disabled>
                      When to start
                    </option>
                    <option>ASAP</option>
                    <option>1–3 months</option>
                    <option>3–6 months</option>
                    <option>Just planning</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Project details</span>
                <textarea name="details" rows={4} placeholder="Tell us what you have in mind…" />
              </label>
              <button className="btn btn-solid btn-lg" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Request my free estimate'} <Icon name="arrow" size={18} />
              </button>
              {status === 'error' && <p className="form-error">Something went wrong. Please call {company.phone}.</p>}
              <p className="form-note">No spam, no pressure. {company.license}</p>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

/* ───────────────────────── Footer ───────────────────────── */
function Footer() {
  const ref = useRef(null);
  useGSAP(
    () => {
      gsap.from('.footer-word span', {
        yPercent: 100,
        ease: 'power4.out',
        duration: 1.2,
        stagger: 0.04,
        scrollTrigger: { trigger: '.footer-word', start: 'top 95%' }
      });
    },
    { scope: ref }
  );
  return (
    <footer className="footer" ref={ref}>
      <div className="container footer-top">
        <div>
          <a href="#top" onClick={go} className="logo">
            <span className="logo-mark">{company.short[0]}</span>
            <span className="logo-text">
              {company.short}
              <small>{company.tagline}</small>
            </span>
          </a>
          <p className="footer-blurb">
            {company.license} · Fully insured · Serving {company.city} and surrounding areas since {company.founded}.
          </p>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Explore</h4>
            {NAV.map(([l, h]) => (
              <a key={h} href={h} onClick={go}>
                {l}
              </a>
            ))}
          </div>
          <div>
            <h4>Contact</h4>
            <a href={telHref}>{company.phone}</a>
            <a href={`mailto:${company.email}`}>{company.email}</a>
            <span>{company.hours}</span>
          </div>
          <div>
            <h4>Follow</h4>
            {Object.entries(company.socials).map(([k, v]) => (
              <a key={k} href={v} target="_blank" rel="noreferrer">
                {k[0].toUpperCase() + k.slice(1)}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-word" aria-hidden="true" style={{ fontSize: `min(${(94 / (company.short.length * 0.8)).toFixed(2)}vw, 320px)` }}>
        {company.short.split('').map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </span>
        <a href="#top" onClick={go}>
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}

/* ───────────────────────── App ───────────────────────── */
export default function App() {
  const [ready, setReady] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [finePointer] = useState(() => window.matchMedia('(pointer: fine)').matches);
  const root = useRef(null);

  const handleQuote = data => {
    setPrefill({ ...data, at: Date.now() });
    scrollToTarget('#quote');
  };

  useEffect(() => {
    const lenis = initSmoothScroll();
    lenis.stop();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!ready) return;
    getLenis()?.start();
    document.documentElement.classList.add('is-ready');
    // fonts + layout can shift trigger positions — recalc once settled
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => clearTimeout(t);
  }, [ready]);

  useGSAP(
    () => {
      ScrollTrigger.batch('.reveal', {
        start: 'top 90%',
        once: true,
        onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.08, overwrite: true })
      });
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <Noise opacity={0.06} fixed fps={18} zIndex={90} />
      {finePointer && ready && <Crosshair color={theme.accent} opacity={0.28} smoothing={0.25} showCoordinates targetEffect="lock" />}
      <Gauge />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Tape />
        <About />
        <Services />
        <PlanToBuilt />
        <Projects />
        <Estimate onQuote={handleQuote} />
        <Process />
        <Reviews />
        <Quote prefill={prefill} />
      </main>
      <Footer />
      <div className="call-bar">
        <a href={telHref} className="btn btn-ghost">
          <Icon name="phone" size={18} /> Call now
        </a>
        <a href="#quote" onClick={go} className="btn btn-solid">
          Free estimate
        </a>
      </div>
    </div>
  );
}
