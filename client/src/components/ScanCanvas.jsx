import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ScanCanvas({ isScanning, scanUrl, progress }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isScanning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x10151B, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-11, 11, 6.2, -6.2, 0.1, 50);
    camera.position.z = 20;

    const site = new THREE.Group();
    scene.add(site);

    const wireMat = new THREE.LineBasicMaterial({
      color: 0x586672,
      transparent: true,
      opacity: 0.72
    });

    const innerMat = new THREE.LineBasicMaterial({
      color: 0x3C4852,
      transparent: true,
      opacity: 0.52
    });

    // Wireframe layout matching prototype
    function line(points, material) {
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(([x, y]) => new THREE.Vector3(x, y, 0))
      );
      site.add(new THREE.Line(geometry, material));
    }

    const rects = [
      [-8.8, -4.3, 17.6, 1.0],
      [-8.8, -2.65, 11.4, 0.72],
      [3.35, -2.65, 5.45, 0.72],
      [-8.8, -1.18, 5.45, 2.35],
      [-2.92, -1.18, 5.45, 2.35],
      [2.96, -1.18, 5.45, 2.35],
      [-8.8, 2.05, 17.6, 0.66]
    ];

    rects.forEach(([x, y, w, h]) => {
      line([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], wireMat);
    });

    for (let i = 0; i < 7; i++) {
      const y = -3.78 + i * 0.31;
      line([[-7.9, y], [7.9, y]], innerMat);
    }

    for (let i = 0; i < 3; i++) {
      line([[-7.8 + i * 5.8, -0.65], [-7.8 + i * 5.8, 0.82]], innerMat);
    }

    // Single scanning beam
    const beam = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 12.2),
      new THREE.MeshBasicMaterial({ color: 0x3E6E8E, transparent: true, opacity: 0.8 })
    );
    beam.position.x = -11.2;
    site.add(beam);

    // Dynamic inspection line hits
    const hits = [];
    for (let i = 0; i < 14; i++) {
      const x = -8.2 + (i % 7) * 2.6;
      const y = -2.2 + Math.floor(i / 7) * 3.2;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.35, 0.035),
        new THREE.MeshBasicMaterial({ color: 0x91A0AB, transparent: true, opacity: 0 })
      );
      mesh.position.set(x, y + 0.02, 0.2);
      site.add(mesh);
      hits.push({ mesh, x });
    }

    let start = performance.now();
    const cycleDuration = 1600;

    function resize() {
      const w = Math.max(canvas.clientWidth, 1);
      const h = Math.max(canvas.clientHeight, 1);
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.left = -11;
      camera.right = 11;
      camera.top = 11 / aspect;
      camera.bottom = -11 / aspect;
      camera.updateProjectionMatrix();
    }

    function frame(now) {
      resize();
      const elapsed = (now - start) % cycleDuration;
      const t = elapsed / cycleDuration;
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      beam.position.x = -11.2 + 22.4 * e;

      hits.forEach((hit) => {
        const distance = Math.abs(hit.x - beam.position.x);
        const opacity = Math.max(0, 1 - distance / 2.2) * 0.8;
        hit.mesh.material.opacity = opacity;
      });

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

  return (
    <section className="scan-stage" id="scanStage">
      <canvas ref={canvasRef} className="scan-canvas" id="scanCanvas" />
      <div className="scan-overlay">
        <div className="scan-panel">
          <div className="scan-panel-title">INSPECTING TARGET…</div>
          <div className="scan-panel-url">{scanUrl}</div>
          <div className="scan-progress-track">
            <div
              className="scan-progress-bar"
              style={{ width: `${Math.min(Math.max(progress, 8), 98)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
