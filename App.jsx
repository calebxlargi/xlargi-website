import React, { useEffect } from 'react';

const App = () => {
  // Scroll Reveal Logic
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');

    const reveal = () => {
      for (let i = 0; i < revealElements.length; i++) {
        let windowHeight = window.innerHeight;
        let elementTop = revealElements[i].getBoundingClientRect().top;
        let elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
          revealElements[i].classList.add("active");
        }
      }
    };

    window.addEventListener("scroll", reveal);
    reveal(); // Trigger once on load

    return () => window.removeEventListener("scroll", reveal);
  }, []);

  // Navbar Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('navbar');
      if (nav) {
        if (window.scrollY > 50) {
          nav.classList.add('shadow-lg');
          nav.style.background = 'rgba(5, 5, 5, 0.7)';
          nav.style.backdropFilter = 'blur(20px)';
        } else {
          nav.classList.remove('shadow-lg');
          nav.style.background = 'rgba(5, 5, 5, 0.3)';
          nav.style.backdropFilter = 'blur(10px)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Canvas Particle Animation
  useEffect(() => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationFrameId;

    const initCanvas = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 242, 255, 0.5)';
        ctx.fill();
      }
    }

    const createParticles = () => {
      particles = [];
      const particleCount = window.innerWidth < 768 ? 40 : 80;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animateCanvas = () => {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(112, 0, 255, ${1 - distance / 120})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animateCanvas);
    };

    initCanvas();
    createParticles();
    animateCanvas();

    const handleResize = () => {
      initCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="antialiased selection:bg-primary selection:text-black font-sans text-gray-100 bg-dark">
      {/* Navigation */}
      <nav className="fixed w-full z-50 nav-glass transition-all duration-300" id="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <a href="#" className="flex items-center gap-2">
                 <img 
                   src="lumima_logo_website.png" 
                   alt="XLARGI Logo" 
                   className="h-10 w-auto"
                   onError={(e) => {
                     e.target.onerror = null; 
                     e.target.style.display = 'none';
                     e.target.nextSibling.style.display = 'block';
                   }}
                 />
                 <span className="text-2xl font-bold tracking-tighter text-white hidden">
                    XLARGI<span className="text-primary">.</span>
                 </span>
              </a>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#home" className="text-gray-300 hover:text-white hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a href="#about" className="text-gray-300 hover:text-white hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">About</a>
                <a href="#adds-feature" className="text-gray-300 hover:text-white hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">ADDS</a>
                <a href="#solutions" className="text-gray-300 hover:text-white hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">Solutions</a>
                <a href="#expert-services" className="text-gray-300 hover:text-white hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">Services</a>
                <a href="#port-management" className="text-gray-300 hover:text-white hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">Port Systems</a>
                <a href="#case-study" className="text-gray-300 hover:text-white hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">Case Studies</a>
                <a href="#contact" className="btn-modern px-6 py-2.5 text-sm shadow-lg">Contact Us</a>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none" onClick={() => document.getElementById('mobile-menu').classList.toggle('hidden')}>
                <span className="sr-only">Open main menu</span>
                <i className="fa-solid fa-bars text-xl"></i>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        <div className="hidden md:hidden bg-black/95 backdrop-blur-xl absolute w-full" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-b border-gray-800">
            <a href="#home" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Home</a>
            <a href="#about" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">About</a>
            <a href="#adds-feature" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">ADDS</a>
            <a href="#solutions" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Solutions</a>
            <a href="#expert-services" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Services</a>
            <a href="#port-management" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Port Systems</a>
            <a href="#case-study" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Case Studies</a>
            <a href="#contact" className="text-primary font-bold block px-3 py-2 rounded-md text-base">Contact Us</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video className="w-full h-full object-cover opacity-30" autoPlay muted loop playsInline>
            <source src="https://njwscgft917wos7z.public.blob.vercel-storage.com/xlargi_hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/50 to-dark"></div>
        </div>

        {/* Canvas Background */}
        <div id="canvas-container" className="opacity-20 mix-blend-screen">
          <canvas id="hero-canvas"></canvas>
        </div>

        {/* Ambient Glow Elements */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Innovating for the <br />
            <span className="text-gradient">Digital Future</span>
          </h1>
          <p className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            We are a boutique consultancy and software development company providing turnkey IT solutions. From AI & IoT to integrated port systems, we untangle complex issues for your digital evolution.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#solutions" className="btn-modern px-8 py-4 uppercase tracking-wider text-sm">
              Explore Solutions
            </a>
            <a href="#contact" className="btn-modern-outline px-8 py-4 uppercase tracking-wider text-sm">
              Get in Touch
            </a>
          </div>

          {/* Tech Stack Ticker */}
          <div className="mt-20 pt-10 border-t border-white/5 backdrop-blur-[2px]">
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-6 font-semibold">Powering Next-Gen Solutions With</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <i className="fa-brands fa-unity text-4xl hover:text-white transition-colors" title="Unity"></i>
              <i className="fa-brands fa-react text-4xl hover:text-[#61DAFB] transition-colors" title="React"></i>
              <i className="fa-brands fa-angular text-4xl hover:text-[#DD0031] transition-colors" title="Angular"></i>
              <i className="fa-brands fa-python text-4xl hover:text-[#3776AB] transition-colors" title="Python"></i>
              <i className="fa-brands fa-aws text-4xl hover:text-[#FF9900] transition-colors" title="AWS"></i>
              <i className="fa-brands fa-node text-4xl hover:text-[#339933] transition-colors" title="Node.js"></i>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="absolute right-0 top-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="reveal space-y-6">
              
              <div className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                <h2 className="text-2xl font-bold mb-3 text-white">Who We Are</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary mb-4"></div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Founded in 2019, XLARGI is a boutique digital transformation consultancy. We are innovators and thought leaders helping enterprises untangle complex digital evolution challenges with cutting-edge engineering solutions.
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                <h4 className="text-xl font-bold mb-3 text-white">Our Vision</h4>
                <p className="text-gray-400 text-sm italic">
                  "To catalyze the next industrial revolution in ASEAN through seamless AI and IoT integration, driving sustainable growth and global competitiveness."
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                <h4 className="text-xl font-bold mb-3 text-white">Our Mission</h4>
                <p className="text-gray-400 text-sm italic">
                  "To engineer robust, future-proof digital infrastructure. We deliver high-impact solutions that solve complex challenges and anticipate tomorrow's innovations."
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="glass-card p-4 rounded-lg text-center">
                  <h3 className="text-3xl font-bold text-primary mb-1">6+</h3>
                  <p className="text-sm text-gray-500">Years Experience</p>
                </div>
                <div className="glass-card p-4 rounded-lg text-center">
                  <h3 className="text-3xl font-bold text-secondary mb-1">100%</h3>
                  <p className="text-sm text-gray-500">Reliable Solutions</p>
                </div>
              </div>
            </div>

            <div className="relative reveal delay-200">
              <div className="glass-card p-8 rounded-2xl border-l-4 border-primary relative overflow-hidden h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                
                <div className="flex items-center justify-center h-full">
                  <img src="lumima_logo_website.png" alt="XLARGI" className="max-w-[80%] max-h-[80%] object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Solution: ADDS Section */}
      <section id="adds-feature" className="py-24 relative overflow-hidden bg-white/5 border-y border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 skew-y-3 transform origin-bottom-left -z-10"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              New Generation Technology
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              ADDS <span className="text-gray-500 font-light">Damage Detection</span>
            </h2>
            <p className="text-2xl text-gray-300 font-light italic max-w-3xl mx-auto mb-8">
              "Where others glance, we see <span className="text-gradient font-bold not-italic">everything</span>."
            </p>
            <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing container damage detection through advanced AI. We turn every glance into insight, and every insight into action, delivering unprecedented accuracy across gate, quay, and rail operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 reveal delay-100">
            <div className="glass-card p-8 rounded-xl text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-xl -mr-10 -mt-10 group-hover:bg-primary/30 transition-colors"></div>
              <div className="text-4xl font-bold text-white mb-2">27 <span className="text-sm font-normal text-gray-400">sec</span></div>
              <div className="text-primary text-sm font-bold uppercase tracking-wider mb-3">Avg Transaction Time</div>
              <p className="text-gray-400 text-xs">Reduced from 45s manually. Automates 60% of total transactions.</p>
            </div>
            <div className="glass-card p-8 rounded-xl text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/20 rounded-full blur-xl -mr-10 -mt-10 group-hover:bg-secondary/30 transition-colors"></div>
              <div className="text-4xl font-bold text-white mb-2">+60%</div>
              <div className="text-secondary text-sm font-bold uppercase tracking-wider mb-3">Gate Capacity</div>
              <p className="text-gray-400 text-xs">Equivalent to +2,400 trucks. Pure, continuous precision 24/7.</p>
            </div>
            <div className="glass-card p-8 rounded-xl text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/20 rounded-full blur-xl -mr-10 -mt-10 group-hover:bg-green-500/30 transition-colors"></div>
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-green-400 text-sm font-bold uppercase tracking-wider mb-3">Digitized</div>
              <p className="text-gray-400 text-xs">Every box condition recorded. Clear digital evidence eliminates disputes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center reveal delay-200">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Deep Neural Network Architecture</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                ADDS isn't just a scanner; it's a learning system custom-built to match your operational needs. It augments human decision-making, allowing your team to focus on complex decisions while it automatically handles routine inspections.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mt-1 mr-4 shrink-0 border border-primary/20">
                    <i className="fa-solid fa-brain"></i>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">New AI Model</h4>
                    <p className="text-gray-400 text-sm">Enhanced AI-engine delivers unmatched accuracy and reliability in image-based detection.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary mt-1 mr-4 shrink-0 border border-secondary/20">
                    <i className="fa-solid fa-sliders"></i>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Refined Sensitivity</h4>
                    <p className="text-gray-400 text-sm">Customizable scoring (0-100) per container side and damage type. You say, we set.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mt-1 mr-4 shrink-0 border border-purple-500/20">
                    <i className="fa-solid fa-network-wired"></i>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Seamless Integration</h4>
                    <p className="text-gray-400 text-sm">Integrates with OCR suite and Gate Operating Systems (GOS) for automated routing.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl border border-white/10 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl pointer-events-none"></div>
              <h4 className="text-lg font-bold text-white mb-6 flex items-center">
                <i className="fa-solid fa-triangle-exclamation text-yellow-400 mr-3"></i> Detects New Damage Classes
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center space-x-3">
                  <i className="fa-solid fa-bullseye text-red-400"></i>
                  <span className="text-gray-300 text-sm">Holes & Punctures</span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center space-x-3">
                  <i className="fa-solid fa-door-open text-orange-400"></i>
                  <span className="text-gray-300 text-sm">Bent Door Bars</span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center space-x-3">
                  <i className="fa-solid fa-hand text-blue-400"></i>
                  <span className="text-gray-300 text-sm">Damaged Handles</span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center space-x-3">
                  <i className="fa-solid fa-wind text-cyan-400"></i>
                  <span className="text-gray-300 text-sm">Missing Air Covers</span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center space-x-3">
                  <i className="fa-solid fa-box text-purple-400"></i>
                  <span className="text-gray-300 text-sm">Dents & Bulges</span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center space-x-3">
                  <i className="fa-solid fa-eraser text-pink-400"></i>
                  <span className="text-gray-300 text-sm">Rust & Scratches</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Detection Score Example</span>
                  <span className="text-xs font-bold text-red-400">97/100 (CRITICAL)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '97%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Automatic alert sent to operator. Gate entry denied.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Automation Solutions */}
      <section id="solutions" className="py-24 relative overflow-hidden bg-dark-lighter">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4">Automation Solutions</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">End-to-end automation for modern terminals. From gate to quay, we digitize every movement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-xl reveal group border-t-4 border-t-blue-500">
              <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <i className="fa-solid fa-truck text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Truck OCR Portal</h3>
              <ul className="text-sm text-gray-400 space-y-2 mb-4">
                <li><i className="fa-solid fa-check text-blue-500 mr-2"></i> Modern Gate Automation</li>
                <li><i className="fa-solid fa-check text-blue-500 mr-2"></i> AI-based Trailer OCR</li>
                <li><i className="fa-solid fa-check text-blue-500 mr-2"></i> License Plate Recognition</li>
              </ul>
              <p className="text-xs text-gray-500 italic">Achieve shorter truck turnaround times with automated access validation.</p>
            </div>

            <div className="glass-card p-8 rounded-xl reveal delay-100 group border-t-4 border-t-purple-500">
              <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                <i className="fa-solid fa-train text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Train OCR Portal</h3>
              <ul className="text-sm text-gray-400 space-y-2 mb-4">
                <li><i className="fa-solid fa-check text-purple-500 mr-2"></i> Automated Rail Imaging</li>
                <li><i className="fa-solid fa-check text-purple-500 mr-2"></i> High Accuracy (97-99.5%)</li>
                <li><i className="fa-solid fa-check text-purple-500 mr-2"></i> Safety from Office</li>
              </ul>
              <p className="text-xs text-gray-500 italic">Move inspection tasks from trackside to office, automating manifest validation.</p>
            </div>

            <div className="glass-card p-8 rounded-xl reveal delay-200 group border-t-4 border-t-cyan-500">
              <div className="w-14 h-14 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                <i className="fa-solid fa-ship text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Quay & Crane OCR</h3>
              <ul className="text-sm text-gray-400 space-y-2 mb-4">
                <li><i className="fa-solid fa-check text-cyan-500 mr-2"></i> Crane OCR</li>
                <li><i className="fa-solid fa-check text-cyan-500 mr-2"></i> TopView Spreader OCR</li>
                <li><i className="fa-solid fa-check text-cyan-500 mr-2"></i> Prevents False Lifts</li>
              </ul>
              <p className="text-xs text-gray-500 italic">Digitize discharge & loading operations with "unmanned" crane environments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Expertise Section */}
      <section id="expert-services" className="py-24 relative overflow-hidden bg-white/5 border-y border-white/5">
        <div className="absolute inset-0 bg-gradient-to-l from-primary/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4">Services & Expertise</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Beyond hardware, we provide the intelligence and support to drive your digital transformation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-10 rounded-xl reveal group border-l-4 border-green-500">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center mr-6 text-green-400 group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-handshake-angle text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white">Professional Services</h3>
              </div>
              
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                As a delivery partner, we are fully equipped to deliver the entire solution – beginning from consultation, design & customization, implementation, all the way to solution evaluation. We ease your mind and streamline implementation & operations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fa-solid fa-check-circle text-green-500 mr-3"></i> App Software Development
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fa-solid fa-check-circle text-green-500 mr-3"></i> Cloud Solution Implementation
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fa-solid fa-check-circle text-green-500 mr-3"></i> Site Preparation
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fa-solid fa-check-circle text-green-500 mr-3"></i> Outsourcing
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fa-solid fa-check-circle text-green-500 mr-3"></i> Disaster Recovery Center (DRC)
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fa-solid fa-check-circle text-green-500 mr-3"></i> Managed Services
                </div>
              </div>
            </div>

            <div className="glass-card p-10 rounded-xl reveal delay-100 group border-l-4 border-yellow-500">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300">
                  <i className="fa-solid fa-brain text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white">Data Science & AI</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Unlock the hidden value in your operational data. Our cognitive computing solutions help you move from reactive to predictive operations.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start text-gray-300">
                  <i className="fa-solid fa-project-diagram text-yellow-500 mt-1 mr-3"></i>
                  <div>
                    <strong className="text-white block">Machine Learning</strong>
                    <span className="text-sm">Algorithms that learn from your data to optimize routes and resource allocation.</span>
                  </div>
                </li>
                <li className="flex items-start text-gray-300">
                  <i className="fa-solid fa-chart-line text-yellow-500 mt-1 mr-3"></i>
                  <div>
                    <strong className="text-white block">Big Data Analytics</strong>
                    <span className="text-sm">Process massive datasets to derive crucial business insights in real-time.</span>
                  </div>
                </li>
                <li className="flex items-start text-gray-300">
                  <i className="fa-solid fa-robot text-yellow-500 mt-1 mr-3"></i>
                  <div>
                    <strong className="text-white block">Cognitive Computing</strong>
                    <span className="text-sm">Simulating human thought processes to automate complex decision making.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Port Management Systems */}
      <section id="port-management" className="py-24 relative overflow-hidden bg-white/5 border-y border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-primary/10 -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4">Integrated Port Systems</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Comprehensive software suites for terminal operations, billing, and management.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-lg reveal hover:border-primary/50">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 text-primary">
                  <i className="fa-solid fa-desktop"></i>
                </div>
                <h3 className="text-lg font-bold text-white">CTOS</h3>
              </div>
              <p className="text-sm text-gray-400">Container Terminal Operation System. Managing discharging, loading, and yard operations with precision.</p>
            </div>

            <div className="glass-card p-6 rounded-lg reveal delay-100 hover:border-secondary/50">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3 text-secondary">
                  <i className="fa-solid fa-network-wired"></i>
                </div>
                <h3 className="text-lg font-bold text-white">MTOS</h3>
              </div>
              <p className="text-sm text-gray-400">Multi Terminal Operation System. Unified control across varied terminal types and locations.</p>
            </div>

            <div className="glass-card p-6 rounded-lg reveal delay-200 hover:border-green-500/50">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3 text-green-400">
                  <i className="fa-solid fa-globe"></i>
                </div>
                <h3 className="text-lg font-bold text-white">Integrated Port Management</h3>
              </div>
              <p className="text-sm text-gray-400">Integrated Sea Port Management System. A complete Port ERP solution for modern administration.</p>
            </div>

            <div className="glass-card p-6 rounded-lg reveal hover:border-yellow-500/50">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3 text-yellow-400">
                  <i className="fa-solid fa-calendar-check"></i>
                </div>
                <h3 className="text-lg font-bold text-white">VBS / Troboss</h3>
              </div>
              <p className="text-sm text-gray-400">Vehicle & Truck Online Booking System. Streamline gate flow by scheduling truck arrivals.</p>
            </div>

            <div className="glass-card p-6 rounded-lg reveal delay-100 hover:border-purple-500/50">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 text-purple-400">
                  <i className="fa-solid fa-wifi"></i>
                </div>
                <h3 className="text-lg font-bold text-white">Cyber City</h3>
              </div>
              <p className="text-sm text-gray-400">Cyber City Connectivity & Fiber Optic Solutions. Robust infrastructure for connected ports.</p>
            </div>

            <div className="glass-card p-6 rounded-lg reveal delay-200 hover:border-red-500/50">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mr-3 text-red-400">
                  <i className="fa-solid fa-file-invoice-dollar"></i>
                </div>
                <h3 className="text-lg font-bold text-white">Billing & CFS</h3>
              </div>
              <p className="text-sm text-gray-400">CTOS/MTOS Billing Systems & Cargo Freight Station management for streamlined financials.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section id="case-study" className="py-24 relative overflow-hidden bg-gradient-to-b from-dark to-dark-lighter">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-fixed opacity-10 grayscale"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 reveal">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                Success Story
              </div>
              <h2 className="text-4xl font-bold mb-6 text-white">Wharf Optimization at <span class="text-primary">European Port</span></h2>
              <p className="text-gray-300 text-lg mb-6 italic">
                "The new automated process has significantly enhanced safety by minimizing human presence in high-risk areas."
              </p>
              <p className="text-gray-400 mb-8 leading-relaxed">
                A major European port faced safety challenges with manual container registration under active cranes. By implementing our Wharf Optimization System—including Crane & Spreader OCR—they achieved fully unmanned operations at the quay.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-white/5 rounded-lg border-l-4 border-primary backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white mb-1">99%</div>
                  <div className="text-xs text-gray-400 uppercase">OCR Hit Rate</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border-l-4 border-secondary backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white mb-1">Safety</div>
                  <div className="text-xs text-gray-400 uppercase">Minimised Risk</div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 reveal delay-100">
              <div className="glass-card p-8 rounded-2xl relative">
                <h3 className="text-xl font-bold text-white mb-4">The Solution Deployed</h3>
                <ul className="space-y-4">
                  <li className="flex items-start text-gray-300">
                    <i className="fa-solid fa-check-circle text-primary mt-1 mr-3"></i>
                    <div>
                      <strong className="text-white block">Crane OCR</strong>
                      <span className="text-sm">Captures IDs, seals, and door direction during flight path.</span>
                    </div>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <i className="fa-solid fa-check-circle text-primary mt-1 mr-3"></i>
                    <div>
                      <strong className="text-white block">TopView</strong>
                      <span className="text-sm">Spreader OCR for early ID verification from container roof.</span>
                    </div>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <i className="fa-solid fa-check-circle text-primary mt-1 mr-3"></i>
                    <div>
                      <strong className="text-white block">Smart Apps</strong>
                      <span className="text-sm">Wharf App & Pinning App for digitized stevedore instructions.</span>
                    </div>
                  </li>
                </ul>
                <div className="mt-8 pt-6 border-t border-white/10 text-right">
                  <span className="block text-xs text-gray-500 mb-1">Project Impact</span>
                  <span className="text-lg font-bold text-white">Full Transparency & Safety</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center relative z-10">
          <div className="mb-4 md:mb-0">
            <span className="text-2xl font-bold tracking-tighter text-white">XLARGI<span className="text-primary">.</span></span>
            <p className="text-gray-500 text-sm mt-2">© 2025 XLARGI. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
