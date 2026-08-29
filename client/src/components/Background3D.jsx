import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Background3D({ isGenerating = false }) {
  const mountRef = useRef(null);
  const isGeneratingRef = useRef(isGenerating);

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 85;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // 1. Particle Sphere (Gemini Nebula core)
    const particleCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color('#9b72cf'); // Purple spark
    const color2 = new THREE.Color('#00f2fe'); // Cyan glow
    const color3 = new THREE.Color('#38bdf8'); // Sky blue
    const color4 = new THREE.Color('#ec4899'); // Rose magenta

    const palette = [color1, color2, color3, color4];

    for (let i = 0; i < particleCount; i++) {
      const radius = 35 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material with Soft Glow
    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = 32;
    canvasTexture.height = 32;
    const ctx = canvasTexture.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(180, 210, 255, 0.7)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvasTexture);

    const material = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 2. Geometric Icosahedron wireframe ring for high-tech holographic depth
    const icoGeometry = new THREE.IcosahedronGeometry(28, 1);
    const icoMaterial = new THREE.MeshBasicMaterial({
      color: 0x9b72cf,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
    scene.add(icoMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (event) => {
      targetMouseX = (event.clientX - window.innerWidth / 2) * 0.0005;
      targetMouseY = (event.clientY - window.innerHeight / 2) * 0.0005;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle Window Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const speedMultiplier = isGeneratingRef.current ? 3.0 : 1.0;

      // Rotate particle cloud
      particles.rotation.y = elapsedTime * 0.05 * speedMultiplier + mouseX;
      particles.rotation.x = elapsedTime * 0.03 * speedMultiplier + mouseY;

      // Rotate icosahedron in counter direction
      icoMesh.rotation.y = -elapsedTime * 0.04 * speedMultiplier + mouseX * 0.5;
      icoMesh.rotation.x = -elapsedTime * 0.02 * speedMultiplier + mouseY * 0.5;

      // Pulse particle scale slightly
      const pulse = 1 + Math.sin(elapsedTime * 1.5) * (isGeneratingRef.current ? 0.08 : 0.02);
      particles.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      icoGeometry.dispose();
      icoMaterial.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
