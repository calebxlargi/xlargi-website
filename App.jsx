import React, { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
const ContainerScanner = lazy(() => import('./ContainerScanner'));
const ContactDialog = lazy(() => import('./ContactDialog'));
import NeuralGraphic from './NeuralGraphic';
import Arrow from './Arrow';


const chapters = [
  { id: 'home', label: 'Overview' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'automation', label: 'Automation' },
  { id: 'intelligence', label: 'Intelligence' },
];


class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function LoadingScreen({ phase, error, onContinue }) {
  return <div className="site-loader" role="status" aria-live="polite" aria-busy={!error}>
    <img src="/xlargi-logo.svg" alt="XLARGI" width="279" height="56" />
    <div className={`loader-track ${error ? 'is-stopped' : ''}`} aria-hidden="true"><span /></div>
    <p>{error ? 'The 3D scene could not finish loading.' : phase}</p>
    {error && <div className="loader-actions"><button className="pill" onClick={() => window.location.reload()}>Try again</button><button className="pill light" onClick={onContinue}>Continue to website</button></div>}
  </div>;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState('Loading the experience');
  const [loadError, setLoadError] = useState(false);
  const [skipScene, setSkipScene] = useState(false);
  const handleSceneReady = useCallback(() => { setLoadError(false); setReady(true); }, []);
  const handleSceneError = useCallback(() => setLoadError(true), []);
  const handlePhase = useCallback(value => setPhase(value), []);
  useEffect(() => {
    document.getElementById('boot-loader')?.remove();
  }, []);
  useEffect(() => {
    if (ready) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [ready]);
  const [menu, setMenu] = useState(false);
  const [contact, setContact] = useState(false);
  const [active, setActive] = useState('home');
  const progressRef = useRef(0);
  const story = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const element = story.current;
      if (!element) return;
      progressRef.current = Math.max(0, Math.min(1, -element.getBoundingClientRect().top / (element.offsetHeight - window.innerHeight)));
    };
    onScroll();
    const initialAnchor = requestAnimationFrame(() => {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-25% 0px -45% 0px', threshold: 0 });
    document.querySelectorAll('[data-section]').forEach(section => observer.observe(section));
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); } }), { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(element => reveal.observe(element));
    return () => { cancelAnimationFrame(initialAnchor); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); observer.disconnect(); reveal.disconnect(); };
  }, []);
  useEffect(() => {
    if (!menu) return;
    const onKey = event => { if (event.key === 'Escape') setMenu(false); };
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener('keydown', onKey); };
  }, [menu]);

  return <>
    {!ready && <LoadingScreen phase={phase} error={loadError} onContinue={() => { setSkipScene(true); setReady(true); }} />}
    <div inert={!ready ? '' : undefined} aria-hidden={!ready ? true : undefined}>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="XLARGI home" onClick={() => setMenu(false)}><img src="/xlargi-logo.svg" alt="XLARGI" width="558" height="111" /></a>
      <nav className="chapter-nav" aria-label="Experience chapters">{chapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`} aria-current={active === chapter.id ? 'location' : undefined}><span className="nav-tick" />{chapter.label}</a>)}</nav>
      <div className="header-actions"><button className="pill compact" onClick={() => setContact(true)}>Contact <Arrow /></button><button className={`menu-toggle ${menu ? 'open' : ''}`} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="site-menu" onClick={() => setMenu(value => !value)}><span /><span /></button></div>
    </header>
    {menu && <nav id="site-menu" className="menu-panel" aria-label="Main navigation"><span className="eyebrow">EXPLORE XLARGI</span>{[...chapters, { id: 'solutions', label: 'Our solutions' }, { id: 'about', label: 'The company' }].map((item, i) => <a key={item.id} href={`#${item.id}`} onClick={() => setMenu(false)}><small>0{i + 1}</small>{item.label}<Arrow /></a>)}<button onClick={() => { setMenu(false); setContact(true); }}>Let’s talk <Arrow /></button></nav>}
    <div className="story-scene">{!skipScene && <SceneBoundary onError={handleSceneError}><Suspense fallback={null}><ContainerScanner suspended={contact || menu} progressRef={progressRef} onReady={handleSceneReady} onError={handleSceneError} onPhase={handlePhase} /></Suspense></SceneBoundary>}</div>
    <main id="main">
      <div className="story" ref={story}>
        <section id="home" className="story-chapter hero" data-section>
          <div className="hero-top"><p className="eyebrow">ENGINEERED FOR THE REAL WORLD</p><h1>Moving industries<br />with connected<br />intelligence.</h1></div>
          <div className="hero-bottom"><p>AI, automation, and integrated systems.<br className="desktop-break" /> Built to turn your most complex operations into your next advantage.</p><a href="#inspection" className="pill">Scroll to explore <Arrow down /></a></div>
          <div className="hero-coordinate"><span className="status-dot" /> XLARGI / DIGITAL OPERATIONS<br /><span>03.1390° N &nbsp; 101.6869° E</span></div>
        </section>
        <section id="inspection" className="story-chapter" data-section>
          <div className="chapter-copy reveal"><p className="eyebrow">01 / VISION INTELLIGENCE</p><h2>Every detail.<br />A clearer decision.</h2><p>AI-powered container inspection detects damage, records condition, and brings the right information to your operators.</p><a className="text-link" href="#solutions">Explore container inspection <Arrow /></a></div>
          <aside className="telemetry detection-panel" aria-label="ADDS detection example">
            <div className="detection-heading"><span className="detection-dot" /><h3>ADDS live detection</h3><span className="demo-badge">DEMO</span></div>
            <dl className="detection-group"><div><dt>Container ID</dt><dd>MSKU 283753 5</dd></div><div><dt>Timestamp</dt><dd><time dateTime="2025-10-24T14:23:47">2025-10-24 14:23:47</time></dd></div></dl>
            <dl className="detection-group"><div><dt>Damage class</dt><dd>Hole</dd></div><div><dt>Location</dt><dd>Roof</dd></div><div><dt>Score</dt><dd>20</dd></div></dl>
            <dl className="detection-group"><div><dt>Damage class</dt><dd>Rust</dd></div><div><dt>Location</dt><dd>Left side</dd></div><div><dt>Score</dt><dd>15</dd></div></dl>
            <dl className="detection-group detection-total"><div><dt>Total damage score</dt><dd>20/100</dd></div><div><dt>Status</dt><dd>Inspection Required</dd></div></dl>
            <ul className="detection-checks"><li>Images stored for claim management</li><li>Searchable by different identifiers</li></ul>
            <p className="telemetry-note">Illustrative detection data · no live feed</p>
          </aside>
        </section>
        <section id="automation" className="story-chapter" data-section>
          <div className="chapter-copy reveal"><p className="eyebrow">02 / CONNECTED OPERATIONS</p><h2>One movement.<br />Everything in sync.</h2><p>Connect gate, rail, and quay operations with OCR, automated identification, and systems that work together.</p><a className="text-link" href="#solutions">Discover terminal automation <Arrow /></a></div>
          <figure className="terminal-flow" aria-label="Terminal information flow from gate to yard to quay">
            <figcaption><span className="eyebrow">ONE CONNECTED TERMINAL</span><h3>From arrival to vessel.</h3><p>Every handover carries the same container record.</p></figcaption>
            <ol className="terminal-flow-stages">
              <li><svg viewBox="0 0 48 40" aria-hidden="true"><path d="M6 35V7h36v28M3 35h12m18 0h12M6 14h36M14 7v7m20-7v7M18 35V24h12v11m-12-5h12" /></svg><span className="flow-step">01 / GATE</span><h4>Identify &amp; verify</h4><p>Capture container IDs and check entry details with OCR.</p></li>
              <li><svg viewBox="0 0 48 40" aria-hidden="true"><path d="M4 35V22h19v13H4Zm21 0V22h19v13H25ZM14 20V7h20v13H14ZM9 25v7m5-7v7m5-7v7m11-7v7m5-7v7m5-7v7M19 10v7m5-7v7m5-7v7" /></svg><span className="flow-step">02 / YARD</span><h4>Track &amp; coordinate</h4><p>Link container locations with movement and job updates.</p></li>
              <li><svg viewBox="0 0 48 40" aria-hidden="true"><path d="M3 27h42l-7 8H11l-8-8Zm8 0V17h24v10M16 17V4h23M16 9h17l6-5M33 9v10M3 39h42M20 21h5m3 0h4" /></svg><span className="flow-step">03 / QUAY</span><h4>Confirm the handover</h4><p>Identify crane moves and record vessel loading events.</p></li>
            </ol>
            <div className="terminal-flow-record"><span className="flow-record-dot" /><div><strong>Shared operational record</strong><p>Container ID · location · movement status</p></div></div>
          </figure>
        </section>
        <section id="intelligence" className="story-chapter" data-section>
          <div className="chapter-copy reveal"><p className="eyebrow">03 / DATA INTO ACTION</p><h2>See the whole.<br />Act on what matters.</h2><p>From data science to purpose-built software, we connect the physical and digital worlds to help your teams make better decisions.</p><a className="text-link" href="#expertise">Explore our expertise <Arrow /></a></div>
          <div className="scene-label"><span className="status-dot" /> INTELLIGENCE / INTEGRATION / IMPACT</div>
        </section>
      </div>
      <section id="solutions" className="solutions section-pad" data-section>
        <div className="section-heading reveal"><p className="eyebrow">BUILT AROUND YOUR OPERATIONS</p><h2>One partner.<br />Many possibilities.</h2><p>Intelligence at every point of your terminal.<br />Expertise across every stage of your transformation.</p></div>
        <div className="solution-grid">
          <a href="#expertise" className="solution-card reveal"><div className="solution-art portal-art"><div className="portal-drawing"><i /><i /><i /></div><span className="art-cross cross-one">+</span><span className="art-cross cross-two">+</span><span className="art-label">VISION / CAPTURE / ANALYSE</span><span className="card-number">01</span></div><div className="card-title"><h3>Container intelligence</h3><Arrow /></div><p>Automatic damage detection, multi-angle imaging, and a digital record of container condition.</p><div className="card-tags">CONTAINER INSPECTION <span>OCR</span></div></a>
          <a href="#expertise" className="solution-card reveal"><div className="solution-art terminal-art"><div className="container-lines">{Array.from({length: 9}, (_, i) => <i key={i} />)}</div><div className="terminal-crane" /><span className="art-cross cross-one">+</span><span className="art-label">GATE / RAIL / QUAY</span><span className="card-number">02</span></div><div className="card-title"><h3>Terminal automation</h3><Arrow /></div><p>Truck and train OCR portals, crane identification, and integrated gate operating systems.</p><div className="card-tags">AUTOMATION <span>INTEGRATION</span></div></a>
          <a href="#expertise" className="solution-card reveal"><div className="solution-art intelligence-art"><div className="orbital orbital-one" /><div className="orbital orbital-two" /><div className="orbital orbital-three" /><div className="core-node" /><span className="art-cross cross-one">+</span><span className="art-label">DATA / SOFTWARE / SYSTEMS</span><span className="card-number">03</span></div><div className="card-title"><h3>Digital transformation</h3><Arrow /></div><p>Custom software, cloud implementation, data science, and managed services built for your business.</p><div className="card-tags">AI & DATA <span>CLOUD</span></div></a>
        </div>
      </section>
      <section id="about" className="about-section section-pad" data-section>
        <p className="eyebrow reveal">XLARGI / EST. 2019 / MALAYSIA</p><h2 className="manifesto reveal">Complex challenges.<br /><span>Clear thinking.</span><br />Real-world impact.</h2>
        <div className="about-bottom reveal"><NeuralGraphic /><div><p>We are a boutique consultancy and software development company helping enterprises untangle complex digital challenges.</p><p>From AI and IoT to integrated port systems, we bring engineering, strategy, and delivery together. Designed for your operation. Built for what comes next.</p></div></div>
      </section>
      <section id="expertise" className="expertise-section section-pad" data-section><div className="expertise-intro reveal"><p className="eyebrow">FROM FIRST CONVERSATION TO DAILY OPERATION</p><h2>We see it<br />through.</h2><p>One delivery partner for consultation, design, implementation, and ongoing support.</p></div><div className="expertise-list">{[
        ['01', 'Consult & design', 'Understand the challenge. Define the right architecture. Design around your business.'],
        ['02', 'Build & integrate', 'Purpose-built applications, AI models, and connected systems that fit your operations.'],
        ['03', 'Deploy & support', 'Site preparation, cloud implementation, managed services, and continuous improvement.'],
      ].map(([num, title, body]) => <details className="expertise-item reveal" key={num}><summary><span>{num}</span><h3>{title}</h3><b>+</b></summary><p>{body}</p></details>)}</div></section>
      <section className="contact-section section-pad" id="contact" data-section><p className="eyebrow reveal">YOUR NEXT CHAPTER STARTS HERE</p><h2 className="reveal">Ready to move<br />things forward?</h2><button className="pill light reveal" onClick={() => setContact(true)}>Talk to XLARGI <Arrow /></button></section>
    </main>
    <footer className="site-footer"><a className="wordmark" href="#home"><img src="/xlargi-logo.svg" alt="XLARGI" width="558" height="111" /></a><span>© {new Date().getFullYear()} XLARGI SDN. BHD.</span><a href="#home">Back to top <Arrow direction="up" /></a><span className="footer-note">Intelligence. Engineered.</span></footer>
    {contact && <Suspense fallback={<div className="contact-pending" role="status">Opening contact form…</div>}><ContactDialog onClose={() => setContact(false)} /></Suspense>}
    </div>
  </>;
}
