import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ScanCanvas({ isScanning, scanUrl, progress = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isScanning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x11161C, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11161C);

    const camera = new THREE.OrthographicCamera(-10, 10, 4.1, -4.1, 0.1, 100);
    camera.position.z = 20;

    const group = new THREE.Group();
    scene.add(group);

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x50606D,
      transparent: true,
      opacity: 0.65
    });

    // 1. Horizontal undulating wavy grid lines matching prototype exactly
    const horizontalLines = [];
    for (let y = -3.5; y <= 3.5; y += 1) {
      const positions = [];
      for (let x = -11; x <= 11; x += 0.5) {
        positions.push(x, y + Math.sin(x * 1.4 + y) * 0.12, 0);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const lineMesh = new THREE.Line(geo, lineMat);
      group.add(lineMesh);
      horizontalLines.push({ geo, baseY: y });
    }

    // 2. Vertical grid lines
    for (let x = -11; x <= 11; x += 1) {
      const pts = [
        new THREE.Vector3(x, -4.2, 0),
        new THREE.Vector3(x, 4.2, 0)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(geo, lineMat));
    }

    // 3. Laser scanning beam (core + subtle glow halo)
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x3E6E8E,
      transparent: true,
      opacity: 0.75
    });
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 9.2), beamMat);
    beam.rotation.z = 0.03;
    group.add(beam);

    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x5689AA,
      transparent: true,
      opacity: 0.25
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 9.2), glowMat);
    glow.rotation.z = 0.03;
    group.add(glow);

    const start = performance.now();

    function resize() {
      const w = Math.max(canvas.clientWidth, 1);
      const h = Math.max(canvas.clientHeight, 1);
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.left = -10;
      camera.right = 10;
      camera.top = 10 / aspect;
      camera.bottom = -10 / aspect;
      camera.updateProjectionMatrix();
    }

    function frame(now) {
      resize();
      const elapsed = now - start;
      const tSec = elapsed * 0.0018;

      // Animate wavy grid oscillation
      horizontalLines.forEach(({ geo, baseY }) => {
        const pos = geo.attributes.position;
        let idx = 0;
        for (let x = -11; x <= 11; x += 0.5) {
          pos.array[idx * 3 + 1] = baseY + Math.sin(x * 1.4 + baseY + tSec) * 0.13;
          idx++;
        }
        pos.needsUpdate = true;
      });

      // Sweep scanning beam continuously across grid
      const sweep = Math.sin(elapsed * 0.0018);
      const posX = sweep * 10.2;
      beam.position.x = posX;
      glow.position.x = posX;

      // Subtle group tilt for dynamic spatial perception
      group.rotation.z = Math.sin(elapsed * 0.0008) * 0.006;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [isScanning]);

  if (!isScanning) return null;

  const currentProgress = Math.min(Math.max(Math.round(progress), 0), 100);

  const getStageMessage = (pct) => {
    if (pct < 20) return 'Connecting & validating DNS, SSL & security headers…';
    if (pct < 45) return 'Spinning up headless browser & executing DOM audit…';
    if (pct < 70) return 'Benchmarking Core Web Vitals & 320px mobile viewport…';
    if (pct < 88) return 'Auditing conversion paths, form funnels & revenue friction…';
    if (pct < 100) return 'Synthesizing evidence, finding priorities & executive summary…';
    return 'Inspection finalized. Preparing report presentation…';
  };

  return (
    <section className="scan-stage" id="scanStage" aria-live="polite">
      <canvas ref={canvasRef} className="scan-canvas" id="scanCanvas" />
      <div className="scan-copy">
        <strong className="scan-title">Inspecting website</strong>
        <span className="scan-url mono">{scanUrl}</span>

        {/* Live Percentage & Diagnostic Status */}
        <div className="scan-progress-wrap">
          <div className="scan-progress-meta">
            <span className="scan-pct-val mono">{currentProgress}%</span>
            <span className="scan-pct-sub mono">COMPLETED</span>
          </div>

          <div className="scan-progress-track">
            <div
              className="scan-progress-fill"
              style={{ width: `${currentProgress}%` }}
            />
          </div>

          <div className="scan-stage-message mono">
            {getStageMessage(currentProgress)}
          </div>
        </div>
      </div>
    </section>
  );
}
