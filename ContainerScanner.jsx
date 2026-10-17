import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createTerminalScene } from './terminalScene';

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

async function pageAssetsReady() {
  await Promise.all([
    fetch('/icons/arrows.svg').then(response => { if (!response.ok) throw new Error('Arrow icons failed to load'); return response.text(); }),
    document.fonts.load('400 16px Sora'),
    document.fonts.load('400 12px "IBM Plex Mono"'),
    ...Array.from(document.images, image => image.decode()),
    ...['/maersk-logo.svg'].map(src => {
      const image = new Image(); image.src = src; return image.decode();
    }),
  ]);
  await document.fonts.ready;
}

export default function ContainerScanner({ progressRef, onReady, onError, onPhase, suspended = false }) {
  const host = useRef(null);
  const [paused, setPaused] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(true);
  const pauseRef = useRef(false);
  const suspendedRef = useRef(suspended);
  const [initialized, setInitialized] = useState(false);
  const dirty = useRef(true);
  useEffect(() => { suspendedRef.current = suspended; dirty.current = true; }, [suspended]);
  useEffect(() => { pauseRef.current = paused; dirty.current = true; }, [paused]);

  useEffect(() => {
    const mount = host.current;
    setInitialized(false);
    let cancelled = false;
    let dispose = () => {};
    const watchdog = window.setTimeout(() => { if (!cancelled) onError(); }, 30000);
    const assets = pageAssetsReady();
    // Attach an error handler immediately while the procedural scene is being prepared.
    assets.catch(() => {});
    async function initialize() {
      // Paint the loader first; deferring also avoids duplicate construction in Strict Mode.
      await nextFrame(); await nextFrame();
      if (cancelled) return;
      const started = performance.now();
      onPhase('Building the terminal');
      // iPads can request a desktop user agent; keep their landscape view on the touch renderer.
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const mobile = ios || window.innerWidth < 700 || (window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 900);
      let lastScrollTime = -Infinity;
      const noteScroll = () => { lastScrollTime = performance.now(); };
      if (mobile) window.addEventListener('scroll', noteScroll, { passive: true });
      let resizeTimer;
      const contextLost = event => {
        event.preventDefault();
        renderer?.setAnimationLoop(null);
        if (!cancelled) onError();
      };
      let renderer, terminal, composer, antialias, output, observer, intersection;
      dispose = () => {
        renderer?.setAnimationLoop(null);
        clearTimeout(resizeTimer);
        window.removeEventListener('scroll', noteScroll);
        renderer?.domElement.removeEventListener('webglcontextlost', contextLost);
        observer?.disconnect(); intersection?.disconnect();
        antialias?.dispose(); output?.dispose(); composer?.dispose(); terminal?.dispose();
        renderer?.dispose(); renderer?.domElement.remove();
      };
      try {
        // Phones use native antialiasing in one render instead of five full-screen postprocessing passes.
        renderer = new THREE.WebGLRenderer({ antialias: mobile, alpha: false, stencil: false, powerPreference: 'high-performance' });
        let pixelRatio = Math.min(window.devicePixelRatio, ios ? 1 : mobile ? 1.25 : 2);
        renderer.setPixelRatio(pixelRatio);
        renderer.info.autoReset = false;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.shadowMap.enabled = !mobile;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        mount.appendChild(renderer.domElement);
        renderer.domElement.addEventListener('webglcontextlost', contextLost);
        const failedAssets = [];
        const manager = new THREE.LoadingManager();
        const sceneAssets = new Promise(resolve => { manager.onLoad = resolve; });
        manager.onError = url => failedAssets.push(url);
        manager.itemStart('terminal');
        terminal = createTerminalScene(renderer, mobile, manager);
        manager.itemEnd('terminal');
        const camera = new THREE.PerspectiveCamera(43, 1, 0.2, 450);
        // MSAA belongs on the offscreen target; canvas AA would duplicate its cost.
        if (!mobile) {
        const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: Math.min(mobile ? 2 : 4, renderer.capabilities.maxSamples) });
        composer = new EffectComposer(renderer, target);
        composer.addPass(new RenderPass(terminal.scene, camera));
        antialias = new SMAAPass(); composer.addPass(antialias);
        output = new OutputPass(); composer.addPass(output);
        }
        let lastWidth = 0, lastHeight = 0;
        function resize() {
          const { width, height } = mount.getBoundingClientRect();
          if (!width || !height) return;
          if (width === lastWidth && height === lastHeight) return;
          lastWidth = width; lastHeight = height;
          renderer.setSize(width, height); composer?.setSize(width, height);
          camera.aspect = width / height; camera.updateProjectionMatrix();
          dirty.current = true;
        }
        observer = new ResizeObserver(() => {
          // Safari's browser chrome can emit a burst of resize events during a swipe.
          // Coalesce buffer reallocations, but still handle rotation and split-view resizing.
          if (!ios) { resize(); return; }
          clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(resize, 180);
        });
        observer.observe(mount); resize();
        onPhase('Loading textures and fonts');
        // SMAA's bundled lookup images load asynchronously, outside LoadingManager.
        await Promise.all([assets, sceneAssets, ...(antialias ? [antialias._areaTexture.image.decode(), antialias._searchTexture.image.decode()] : [])]);
        if (cancelled) return;
        if (failedAssets.length) throw new Error('A terminal texture failed to load');
        onPhase('Preparing lighting');
        await nextFrame();
        if (cancelled) return;
        terminal.prepare();
        terminal.update(0, progressRef.current, camera);
        await renderer.compileAsync(terminal.scene, camera);
        if (cancelled) return;
        let renderedFrames = 0;
        function renderFrame() {
          renderer.info.reset();
          if (composer) composer.render(); else renderer.render(terminal.scene, camera);
          if (import.meta.env.DEV) mount.dataset.renderedFrames = String(++renderedFrames);
        }
        renderFrame();
        // Reveal only after a fully textured frame has actually been presented.
        await nextFrame(); await nextFrame();
        if (cancelled) return;
        clearTimeout(watchdog);
        mount.dataset.sceneState = 'ready';
        if (import.meta.env.DEV) console.info('XLARGI scene ready', JSON.stringify({ initializationMs: Math.round(performance.now() - started), drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, textures: renderer.info.memory.textures, quality: ios ? 'ios-native-aa' : mobile ? 'mobile-native-aa' : 'desktop-smaa', pixelRatio }));
        setInitialized(true); onReady();
        let visible = true, elapsed = 0, previous = 0, lastRendered = 0, lastProgress = -1;
        let frameTotal = 0, frameCount = 0;
        const interval = mobile ? 1000 / 30 : 1000 / 60;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        const visibleSections = new Set();
        intersection = new IntersectionObserver(entries => {
          entries.forEach(entry => entry.isIntersecting ? visibleSections.add(entry.target) : visibleSections.delete(entry.target));
          visible = visibleSections.size > 0;
          if (mobile && !visible) mount.dataset.sceneActivity = 'idle';
          setSceneVisible(visible); dirty.current = true;
        });
        document.querySelectorAll(mobile ? '.story' : '.story, #about, #expertise').forEach(section => intersection.observe(section));
        renderer.setAnimationLoop(time => {
          const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
          previous = time;
          if (!visible || document.hidden || suspendedRef.current) { lastRendered = 0; return; }
          const animated = !pauseRef.current && !reduced.matches && !suspendedRef.current;
          const scrolling = mobile && performance.now() - lastScrollTime < 180;
          // Give touch scrolling priority over autonomous truck and water animation.
          if (animated && !scrolling) elapsed += delta;
          const progress = progressRef.current;
          if (!animated && progress === lastProgress && !dirty.current) { lastRendered = 0; return; }
          const frameInterval = scrolling ? 1000 / 20 : interval;
          if (lastRendered && time - lastRendered < frameInterval - 1) return;
          // Reduce resolution sooner on slow phones; native antialiasing stays enabled.
          if (animated && !scrolling && lastRendered) {
            frameTotal += time - lastRendered; frameCount++;
            if (frameCount === (mobile ? 30 : 90)) {
              if (frameTotal / frameCount > (mobile ? 40 : 27) && pixelRatio > (mobile ? 1 : 1.25)) {
                pixelRatio = Math.max(mobile ? 1 : 1.25, pixelRatio - 0.25);
                renderer.setPixelRatio(pixelRatio); composer?.setPixelRatio(pixelRatio);
                // Pixel ratio changes resize the drawing buffer even when CSS dimensions are unchanged.
                lastWidth = 0; resize();
              }
              frameTotal = 0; frameCount = 0;
            }
          }
          try {
            terminal.update(elapsed, progress, camera); renderFrame();
          } catch {
            renderer.setAnimationLoop(null); onError(); return;
          }
          lastProgress = progress; dirty.current = false; lastRendered = time;
        });
      } catch {
        if (!cancelled) { clearTimeout(watchdog); onError(); }
      }
    }
    initialize();
    return () => { cancelled = true; clearTimeout(watchdog); dispose(); };
  }, [progressRef, onReady, onError, onPhase]);

  return <div className="scanner-background">
    <div ref={host} className="scanner-stage" role="img" aria-label="Detailed night-time container terminal with a moving truck, steel inspection portal, red scanning lights, quay cranes and cargo ships" />
    <div className="scanner-vignette" />
    {createPortal(<button type="button" className="scanner-toggle" hidden={!sceneVisible || !initialized} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Play animation' : 'Pause animation'}</button>, document.body)}
  </div>;
}
