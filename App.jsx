import React, { useEffect, useRef, useState } from 'react';
import ContainerScanner from './ContainerScanner';
import NeuralGraphic from './NeuralGraphic';
import { useForm, ValidationError } from '@formspree/react';

const chapters = [
  { id: 'home', label: 'Overview' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'automation', label: 'Automation' },
  { id: 'intelligence', label: 'Intelligence' },
];
const Arrow = ({ down = false }) => <span aria-hidden="true">{down ? '↓' : '↗'}</span>;

function ContactDialog({ onClose }) {
  const dialog = useRef(null);
  const [formState, submit] = useForm('mjyglvln', { data: { subject: 'XLARGI website enquiry' } });
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = old; };
  }, []);
  return <dialog ref={dialog} className="contact-dialog" aria-labelledby="contact-title" onCancel={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }}>
    <div className="dialog-inner">
      <button className="close-button" type="button" onClick={onClose} aria-label="Close contact form">×</button>
      <p className="eyebrow">LET’S BUILD WHAT’S NEXT</p>
      <h2 id="contact-title">Start a conversation.</h2>
      <p className="dialog-intro">Tell us where you want to go. We’ll help you get there.</p>
      {formState.succeeded ? <div className="contact-success" role="status"><h3>Message received.</h3><p>Thank you for getting in touch. We’ll be in touch soon.</p><button type="button" className="pill light" onClick={onClose}>Done <Arrow /></button></div> : <form action="https://formspree.io/f/mjyglvln" method="POST" onSubmit={submit} aria-busy={formState.submitting}>
        <input type="text" name="_gotcha" tabIndex="-1" autoComplete="off" className="contact-honeypot" aria-hidden="true" />
        <div className="form-row"><label>Your name<input name="name" autoComplete="name" required /></label><label>Work email<input type="email" name="email" autoComplete="email" required /></label></div>
        <label>Company<input name="company" autoComplete="organization" /></label>
        <label>What are you working on?<textarea name="message" rows="3" required /></label>
        <div className="contact-errors" role="alert"><ValidationError field="name" prefix="Name" errors={formState.errors} /><ValidationError field="email" prefix="Email" errors={formState.errors} /><ValidationError field="message" prefix="Message" errors={formState.errors} /><ValidationError errors={formState.errors} /></div>
        <button type="submit" className="pill light" disabled={formState.submitting}>{formState.submitting ? 'Sending…' : 'Message us'} <Arrow /></button>
      </form>}
    </div>
  </dialog>;
}

export default function App() {
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
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="XLARGI home" onClick={() => setMenu(false)}><img src="/xlargi-logo.svg" alt="XLARGI" width="558" height="111" /></a>
      <nav className="chapter-nav" aria-label="Experience chapters">{chapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`} aria-current={active === chapter.id ? 'location' : undefined}><span className="nav-tick" />{chapter.label}</a>)}</nav>
      <div className="header-actions"><button className="pill compact" onClick={() => setContact(true)}>Contact <Arrow /></button><button className={`menu-toggle ${menu ? 'open' : ''}`} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="site-menu" onClick={() => setMenu(value => !value)}><span /><span /></button></div>
    </header>
    {menu && <nav id="site-menu" className="menu-panel" aria-label="Main navigation"><span className="eyebrow">EXPLORE XLARGI</span>{[...chapters, { id: 'solutions', label: 'Our solutions' }, { id: 'about', label: 'The company' }].map((item, i) => <a key={item.id} href={`#${item.id}`} onClick={() => setMenu(false)}><small>0{i + 1}</small>{item.label}<Arrow /></a>)}<button onClick={() => { setMenu(false); setContact(true); }}>Let’s talk <Arrow /></button></nav>}
    <div className="story-scene"><ContainerScanner progressRef={progressRef} /></div>
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
          <div className="system-map"><span>GATE</span><i /><span>YARD</span><i /><span>QUAY</span><p>CONNECTED BY DESIGN</p></div>
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
        <div className="about-bottom reveal"><NeuralGraphic /><div><p>We are a boutique consultancy and software development company helping enterprises untangle complex digital challenges.</p><p>From AI and IoT to integrated port systems, we bring engineering, strategy, and delivery together. Designed for your operation. Built for what comes next.</p><button className="pill" onClick={() => setContact(true)}>Meet your next partner <Arrow /></button></div></div>
      </section>
      <section id="expertise" className="expertise-section section-pad" data-section><div className="expertise-intro reveal"><p className="eyebrow">FROM FIRST CONVERSATION TO DAILY OPERATION</p><h2>We see it<br />through.</h2><p>One delivery partner for consultation, design, implementation, and ongoing support.</p></div><div className="expertise-list">{[
        ['01', 'Consult & design', 'Understand the challenge. Define the right architecture. Design around your business.'],
        ['02', 'Build & integrate', 'Purpose-built applications, AI models, and connected systems that fit your operations.'],
        ['03', 'Deploy & support', 'Site preparation, cloud implementation, managed services, and continuous improvement.'],
      ].map(([num, title, body]) => <details className="expertise-item reveal" key={num}><summary><span>{num}</span><h3>{title}</h3><b>+</b></summary><p>{body}</p></details>)}</div></section>
      <section className="contact-section section-pad" id="contact" data-section><p className="eyebrow reveal">YOUR NEXT CHAPTER STARTS HERE</p><h2 className="reveal">Ready to move<br />things forward?</h2><button className="pill light reveal" onClick={() => setContact(true)}>Talk to XLARGI <Arrow /></button></section>
    </main>
    <footer className="site-footer"><a className="wordmark" href="#home"><img src="/xlargi-logo.svg" alt="XLARGI" width="558" height="111" /></a><span>© {new Date().getFullYear()} XLARGI SDN. BHD.</span><a href="#home">Back to top ↑</a><span className="footer-note">Intelligence. Engineered.</span></footer>
    {contact && <ContactDialog onClose={() => setContact(false)} />}
  </>;
}
