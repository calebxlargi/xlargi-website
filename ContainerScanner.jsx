import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createTerminalScene } from './terminalScene';

export default function ContainerScanner({ progressRef }) {
  const host = useRef(null);
  const [paused, setPaused] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(true);
  const pauseRef = useRef(false);
  useEffect(() => { pauseRef.current = paused; }, [paused]);

  useEffect(() => {
    const mount = host.current;
    const mobile = window.innerWidth < 700;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);
    const terminal = createTerminalScene(renderer, mobile);
    const camera = new THREE.PerspectiveCamera(43, 1, 0.2, 450);
    // The composer renders offscreen: its target needs MSAA independently of the canvas.
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: Math.min(mobile ? 2 : 4, renderer.capabilities.maxSamples) });
    const composer = new EffectComposer(renderer, target);
    composer.addPass(new RenderPass(terminal.scene, camera));
    const antialias = new SMAAPass();
    composer.addPass(antialias);
    const output = new OutputPass(); composer.addPass(output);
    function resize() {
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height); composer.setSize(width, height);
      camera.aspect = width / height; camera.updateProjectionMatrix();
    }
    const observer = new ResizeObserver(resize); observer.observe(mount); resize();
    let visible = true, elapsed = 0, previous = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visibleSections = new Set();
    const intersection = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visibleSections.add(entry.target) : visibleSections.delete(entry.target));
      visible = visibleSections.size > 0;
      setSceneVisible(visible);
    });
    document.querySelectorAll('.story, #about, #expertise').forEach(section => intersection.observe(section));
    renderer.setAnimationLoop(time => {
      const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
      previous = time;
      if (!visible || document.hidden) return;
      if (!pauseRef.current && !reduced.matches) elapsed += delta;
      terminal.update(elapsed, progressRef?.current || 0, camera);
      composer.render();
    });
    return () => {
      renderer.setAnimationLoop(null); observer.disconnect(); intersection.disconnect();
      antialias.dispose(); output.dispose(); composer.dispose(); terminal.dispose();
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [progressRef]);

  return <div className="scanner-background">
    <div ref={host} className="scanner-stage" role="img" aria-label="Detailed night-time container terminal with a moving truck, steel inspection portal, red scanning lights, quay cranes and cargo ships" />
    <div className="scanner-vignette" />
    {createPortal(<button type="button" className="scanner-toggle" hidden={!sceneVisible} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Play animation' : 'Pause animation'}</button>, document.body)}
  </div>;
}
