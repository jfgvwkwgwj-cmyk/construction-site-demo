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
import ProcessDrawing from './components/ProcessDrawing';

import SplitText from './bits/SplitText';
import CountUp from './bits/CountUp';
import { ScrollVelocity } from './bits/ScrollVelocity';
import ScrollReveal from './bits/ScrollReveal';
import RotatingText from './bits/RotatingText';
import SpotlightCard from './bits/SpotlightCard';
import Magnet from './bits/Magnet';
import StarBorder from './bits/StarBorder';
import DotGrid from './bits/DotGrid';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const { company, theme, hero } = config;
const telHref = `tel:${company.phone.replace(/[^\d+]/g, '')}`;
const years = new Date().getFullYear() - company.founded;

const NAV = [
  ['Services', '#services'],
  ['Projects', '#projects'],
  ['Estimate', '#estimate'],
  ['Process', '#process'],
  ['Reviews', '#reviews']
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

/* ───────────────────────── Preloader (short) ───────────────────────── */
function Preloader({ onDone }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      gsap
        .timeline({ onComplete: onDone })
        .from('.pre-mark', { scale: 0.6, opacity: 0, duration: 0.5, ease: 'back.out(1.6)' })
        .from('.pre-name', { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.25')
        .to('.pre-bar i', { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, '-=0.3')
        .to(ref.current, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '+=0.05');
    },
    { scope: ref }
  );
  return (
    <div className="preloader" ref={ref}>
      <div className="pre-inner">
        <span className="pre-mark logo-mark">{company.short[0]}</span>
        <div className="pre-name">{company.name}</div>
        <div className="pre-bar">
          <i />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Nav ───────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ solid: false, hidden: false, light: false });

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const heroH = document.getElementById('top')?.offsetHeight || 800;
      setState({ solid: y > 40, hidden: y > 500 && y > last, light: y > heroH - 80 });
      last = y;
    };
    onScroll();
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
      <header
        className={`nav ${state.solid ? 'is-solid' : ''} ${state.light && !open ? 'is-light' : ''} ${state.hidden && !open ? 'is-hidden' : ''}`}
      >
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
          <Magnet padding={40} magnetStrength={5} wrapperClassName="hide-sm">
            <a href={telHref} className="nav-phone">
              <Icon name="phone" size={16} /> <span>{company.phone}</span>
            </a>
          </Magnet>
          <a href="#quote" onClick={go} className="btn btn-primary hide-sm">
            Book a site visit
          </a>
          <button className={`burger ${open ? 'is-open' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open}>
            <i />
            <i />
          </button>
        </div>
      </header>
      <div className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        {[...NAV, ['Contact', '#quote']].map(([label, href], i) => (
          <a key={href} href={href} onClick={navGo} style={{ transitionDelay: `${open ? 0.06 * i + 0.15 : 0}s` }}>
            <span>0{i + 1}</span>
            {label}
          </a>
        ))}
        <a href={telHref} className="btn btn-primary mm-call">
          <Icon name="phone" size={18} /> Call {company.phone}
        </a>
      </div>
    </>
  );
}

/* ───────────────────────── Hero (3D build on load, no scroll-jacking) ───────────────────────── */
function Hero({ ready }) {
  const ref = useRef(null);
  const hudRef = useRef(null);
  const progressRef = useRef(0);
  const scrollRef = useRef(0);
  const [mobile] = useState(() => window.matchMedia('(max-width: 700px)').matches);

  useGSAP(
    () => {
      // camera drifts as the hero scrolls away — the page itself scrolls normally
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: 'bottom top',
        onUpdate: self => (scrollRef.current = self.progress)
      });
      gsap.to('.hero-inner', {
        yPercent: 18,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true }
      });
    },
    { scope: ref }
  );

  useGSAP(
    () => {
      if (!ready) return;
      const o = { v: 0 };
      gsap.to(o, {
        v: 1,
        duration: 6,
        ease: 'power1.inOut',
        delay: 0.3,
        onUpdate: () => {
          progressRef.current = o.v;
          ref.current?.classList.toggle('is-complete', o.v > 0.98);
        }
      });
      gsap.from('.hero-fade', { y: 24, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.45 });
      gsap.from('.hud', { y: 20, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.9 });
    },
    { scope: ref, dependencies: [ready] }
  );

  return (
    <section className="hero is-dark" id="top" ref={ref}>
      <BuildScene
        progressRef={progressRef}
        scrollRef={scrollRef}
        hudRef={hudRef}
        accent={theme.brass}
        bg={theme.navy}
        mobile={mobile}
      />
      <div className="hero-shade" />

      <div className="container hero-inner">
        <div className="hero-copy">
          {ready && (
            <>
              <p className="eyebrow hero-fade">{hero.eyebrow}</p>
              <SplitText
                text={hero.headline}
                tag="h1"
                className="hero-title"
                splitType="words"
                textAlign="left"
                delay={70}
                duration={1.1}
                mask
                trigger="load"
              />
              <div className="hero-rotate hero-fade">
                <span>Specialists in</span>
                <RotatingText
                  texts={hero.rotating}
                  mainClassName="rot-word"
                  staggerDuration={0.015}
                  staggerFrom="first"
                  rotationInterval={2400}
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
                  duration={6}
                  radius={6}
                  glow={0.35}
                  backgroundColor={theme.brass}
                  textColor={theme.navy}
                  className="btn-star"
                >
                  Get an instant estimate <Icon name="arrow" size={18} />
                </StarBorder>
                <a href="#projects" onClick={go} className="btn btn-outline-light">
                  View our projects
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      <aside className="hud" ref={hudRef} aria-hidden="true">
        <div className="hud-row hud-top">
          <span>
            <i className="hud-dot" /> Project status
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

      <div className="container hero-trust">
        {[
          ['shield', 'Licensed, bonded & insured'],
          ['clock', `${years} years in ${company.city}`],
          ['check', 'Fixed, written pricing'],
          ['pin', 'Local crews, no subcontract chains']
        ].map(([icon, label]) => (
          <span key={label} className="trust-item">
            <Icon name={icon} size={16} /> {label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Credentials strip ───────────────────────── */
function Credentials() {
  const items = ['Licensed General Contractor', 'BBB Accredited', 'OSHA-30 Site Leads', 'Fully Bonded & Insured', 'Written Workmanship Warranty', 'EPA Lead-Safe Certified'];
  return (
    <div className="creds" aria-label="Credentials">
      <ScrollVelocity texts={[items.join('   ·   ') + '   ·   ']} velocity={18} numCopies={4} className="creds-text" />
    </div>
  );
}

/* ───────────────────────── Section header ───────────────────────── */
function SectionHead({ index, label, title, children }) {
  return (
    <div className="section-head">
      <p className="label reveal">
        <span>{index}</span> {label}
      </p>
      <SplitText text={title} tag="h2" className="h2" splitType="words" textAlign="left" delay={50} effect="rise" mask />
      {children && <p className="lead reveal">{children}</p>}
    </div>
  );
}

/* ───────────────────────── About + stats ───────────────────────── */
function About() {
  return (
    <section className="section about" id="about">
      <div className="container">
        <p className="label reveal">
          <span>01</span> Who we are
        </p>
        <ScrollReveal baseOpacity={0.15} enableBlur blurStrength={4} baseRotation={0} textClassName="about-text">
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
    <section className="section services" id="services">
      <div className="container">
        <SectionHead index="02" label="Services" title="One contractor, from footing to finish.">
          A single licensed team for the whole job. One contract, one point of contact, one standard of work.
        </SectionHead>
        <div className="services-grid">
          {config.services.map((s, i) => (
            <SpotlightCard
              key={s.title}
              className="service-card reveal"
              spotlightColor={`rgba(${accentRgb}, 0.14)`}
              intensity={0.2}
              borderGlow={0.5}
              flare={false}
              theme="light"
            >
              <div className="service-top">
                <span className="service-icon">
                  <Icon name={s.icon} size={24} />
                </span>
                <span className="service-num">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <a href="#estimate" onClick={go} className="service-link">
                Estimate this <Icon name="arrow" size={16} />
              </a>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Plan → Built ───────────────────────── */
function PlanToBuilt() {
  return (
    <section className="section plan" id="plan">
      <div className="container plan-grid">
        <SectionHead index="03" label="Plan to keys" title="What we draw is what you get.">
          Drag the handle. Every line on our drawings becomes something you can stand in, with nothing lost between paper and handover.
        </SectionHead>
        <div className="reveal">
          <Compare />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Projects (pinned horizontal gallery) ───────────────────────── */
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
          const media = card.querySelector('.proj-media > svg, .proj-media > img');
          if (!media) return;
          gsap.from(media, {
            scale: 1.12,
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
              <div className="proj-block" aria-hidden="true">
                <span>Sheet A-{String(101 + i * 100)}</span>
                <span>{p.size}</span>
                <span>{p.year}</span>
              </div>
              <div className="proj-meta">
                <h3>{p.title}</h3>
                <p>{p.location}</p>
              </div>
            </article>
          ))}
          <a href="#quote" onClick={go} className="proj-card proj-end">
            <span>Next on the board</span>
            <strong>Your project.</strong>
            <span className="proj-end-btn">
              Book a site visit <Icon name="arrow" size={18} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Estimate ───────────────────────── */
function Estimate({ onQuote }) {
  return (
    <section className="section estimate is-dark" id="estimate">
      <div className="estimate-bg" aria-hidden="true">
        <DotGrid dotSize={2} gap={30} baseColor="#1d2f47" activeColor={theme.brass} proximity={140} shockRadius={220} glow={0.25} />
      </div>
      <div className="container">
        <SectionHead index="05" label="Instant estimate" title="Know your number in ten seconds.">
          No email needed. Pick a project, set the size and choose a finish level for a ballpark built from our recent local jobs.
        </SectionHead>
        <div className="reveal">
          <Estimator onQuote={onQuote} />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Process (drawing builds as you scroll, page never stops) ───────────────────────── */
function Process() {
  const ref = useRef(null);
  const svgRef = useRef(null);

  useGSAP(
    () => {
      const svg = svgRef.current;
      const stages = [...svg.querySelectorAll('[data-stage]')];
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;

      stages.forEach(g => {
        gsap.set(g.querySelectorAll('.pd-line'), { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(g.querySelectorAll('.pd-text, .pd-fill, .pd-glow'), { opacity: 0 });
      });

      const steps = gsap.utils.toArray('.step');
      steps.forEach((step, i) => {
        const g = stages[i];
        if (!g) return;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: step, start: 'top 75%', end: 'top 35%', scrub: 0.6 }
        });
        tl.to(g.querySelectorAll('.pd-line'), { strokeDashoffset: 0, ease: 'none', stagger: 0.02 }).to(
          g.querySelectorAll('.pd-text, .pd-fill, .pd-glow'),
          { opacity: 1, ease: 'none', stagger: 0.02 },
          '-=0.3'
        );
        ScrollTrigger.create({
          trigger: step,
          start: 'top 60%',
          end: 'bottom 40%',
          toggleClass: { targets: step, className: 'is-active' },
          onToggle: self => self.isActive && (ref.current.querySelector('.pd-stage-label').textContent = config.process[i].title)
        });
      });

      gsap.fromTo(
        '.process-line i',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.process-list', start: 'top 70%', end: 'bottom 50%', scrub: true } }
      );
    },
    { scope: ref }
  );

  return (
    <section className="section process" id="process" ref={ref}>
      <div className="container">
        <SectionHead index="06" label="How it works" title="A process with no surprises.">
          You know the price, the schedule and who is in charge before a single shovel hits dirt.
        </SectionHead>
        <div className="process-grid">
          <div className="process-visual">
            <div className="pd-sheet">
              <div className="pd-head">
                <span>Drawing set</span>
                <span className="pd-stage-label">{config.process[0].title}</span>
              </div>
              <ProcessDrawing ref={svgRef} />
            </div>
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
      </div>
    </section>
  );
}

/* ───────────────────────── Reviews ───────────────────────── */
function Reviews() {
  return (
    <section className="section reviews" id="reviews">
      <div className="container">
        <SectionHead index="07" label="Client reviews" title="Our best marketing is our clients." />
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
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent('Site visit request — ' + (data.name || ''))}&body=${encodeURIComponent(body)}`;
    setStatus('sent');
  };

  return (
    <section className="section quote" id="quote">
      <div className="container quote-grid">
        <div>
          <p className="label reveal">
            <span>08</span> Book a site visit
          </p>
          <SplitText text="Let’s talk about your project." tag="h2" className="h2" splitType="words" textAlign="left" delay={50} mask />
          <p className="lead reveal">Tell us what you’re planning. A project lead, usually the owner, calls you back within one business day.</p>
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
              <p>Thank you. We’ll be in touch within one business day. Need us sooner? Call {company.phone}.</p>
            </div>
          ) : (
            <>
              <div className="form-head">
                <h3>Request a site visit</h3>
                <span>Free · No obligation</span>
              </div>
              <div className="field-row">
                <label className="field">
                  <span>Name</span>
                  <input id="q-name" name="name" required autoComplete="name" placeholder="Jane Smith" />
                </label>
                <label className="field">
                  <span>Phone</span>
                  <input id="q-phone" name="phone" required type="tel" autoComplete="tel" placeholder="(555) 000-0000" />
                </label>
              </div>
              <label className="field">
                <span>Email</span>
                <input id="q-email" name="email" type="email" autoComplete="email" placeholder="you@email.com" />
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
                  <select id="q-budget" name="budget" defaultValue="">
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
                  <select id="q-timeline" name="timeline" defaultValue="">
                    <option value="" disabled>
                      When to start
                    </option>
                    <option>As soon as possible</option>
                    <option>1–3 months</option>
                    <option>3–6 months</option>
                    <option>Just planning</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Project details</span>
                <textarea id="q-details" name="details" rows={4} placeholder="Tell us what you have in mind" />
              </label>
              <button className="btn btn-primary btn-lg" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Request my site visit'} <Icon name="arrow" size={18} />
              </button>
              {status === 'error' && <p className="form-error">That didn’t go through. Please call {company.phone}.</p>}
              <p className="form-note">No obligation. {company.license}</p>
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
    <footer className="footer is-dark" ref={ref}>
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
      <div
        className="footer-word"
        aria-hidden="true"
        style={{ fontSize: `min(${(94 / (company.short.length * 0.8)).toFixed(2)}vw, 320px)` }}
      >
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
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => clearTimeout(t);
  }, [ready]);

  useGSAP(
    () => {
      ScrollTrigger.batch('.reveal', {
        start: 'top 92%',
        once: true,
        onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.07, overwrite: true })
      });
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <Nav />
      <main>
        <Hero ready={ready} />
        <Credentials />
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
        <a href="#quote" onClick={go} className="btn btn-primary">
          Site visit
        </a>
      </div>
    </div>
  );
}
