import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import config from './config';
import { initSmoothScroll, scrollToTarget, getLenis } from './lib/scroll';
import Icon from './components/Icon';
import Blueprint from './components/Blueprint';

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
function Preloader({ onDone }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      const counter = { v: 0 };
      const num = ref.current.querySelector('.pre-num');
      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(counter, {
        v: 100,
        duration: 1.6,
        ease: 'power3.inOut',
        onUpdate: () => (num.textContent = String(Math.round(counter.v)).padStart(3, '0'))
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
          <span>Est. {company.founded}</span>
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

/* ───────────────────────── Hero ───────────────────────── */
function Hero({ ready }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (!ready) return;
      gsap.from('.hero-fade', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.5 });
      // parallax the drawing as the hero scrolls away
      gsap.to('.hero-art', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true }
      });
    },
    { scope: ref, dependencies: [ready] }
  );

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-bg">
        {hero.image ? (
          <img src={hero.image} alt="" className="hero-img" />
        ) : (
          <DotGrid dotSize={2} gap={26} baseColor="#2a2c30" activeColor={theme.accent} proximity={160} shockRadius={260} glow={0.4} />
        )}
        <div className="hero-vignette" />
      </div>

      <div className="container hero-grid">
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
                  href="#quote"
                  onClick={go}
                  color="#ffffff"
                  duration={5}
                  radius={999}
                  backgroundColor={theme.accent}
                  textColor="#111"
                  className="btn-star"
                >
                  Get a free estimate <Icon name="arrow" size={18} />
                </StarBorder>
                <a href="#projects" onClick={go} className="btn btn-line">
                  See our work
                </a>
              </div>
            </>
          )}
        </div>
        <div className="hero-art">{ready && <Blueprint type="house" autoplay duration={2.8} />}</div>
      </div>

      <div className="container hero-trust">
        {[
          ['shield', 'Licensed & insured'],
          ['clock', `${years}+ years local`],
          ['check', 'Written fixed pricing'],
          ['pin', `Serving ${company.city}`]
        ].map(([icon, label]) => (
          <span key={label} className="trust-item">
            <Icon name={icon} size={18} /> {label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Marquee ───────────────────────── */
function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <ScrollVelocity
        texts={[config.services.map(s => s.title).join('  ✦  ') + '  ✦  ']}
        velocity={40}
        numCopies={4}
        className="marquee-text"
        skewWithVelocity={6}
        outlineAlternate
      />
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
      <SplitText text={title} tag="h2" className="h2" splitType="words" textAlign="left" delay={60} effect="rise" mask />
      {children && <p className="lead reveal">{children}</p>}
    </div>
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
          <SectionHead index="03" label="Selected work" title="Built here. Still standing." />
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
          <SectionHead index="04" label="How it works" title="A process with no surprises.">
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
        <SectionHead index="05" label="Reviews" title="Our best marketing is our clients." />
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
function Quote() {
  const [status, setStatus] = useState('idle');

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
            <span>06</span> Free estimate
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

        <form className="quote-form reveal" onSubmit={submit}>
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
  const root = useRef(null);

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
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Services />
        <Projects />
        <Process />
        <Reviews />
        <Quote />
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
