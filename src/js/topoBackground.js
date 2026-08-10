/* ========================================
   TOPO BACKGROUND  |  3D Organic Wave Relief (High Performance)
   Pauses automatically when scrolled out of view
   ======================================== */

export function initTopoBackground() {
  const canvas = document.getElementById('topoCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  let width = 0;
  let height = 0;
  let animationFrameId = null;
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let isVisible = true;

  function resize() {
    const parent = canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    width = rect.width || window.innerWidth;
    height = rect.height || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap DPR at 1.5 for performance
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  window.addEventListener('mousemove', (e) => {
    if (!isVisible) return;
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 20;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 20;
  }, { passive: true });

  // Pause rendering when hero is scrolled out of viewport
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    isVisible = entry.isIntersecting;
    if (isVisible && !animationFrameId) {
      lastFrameTime = performance.now();
      animationFrameId = requestAnimationFrame(draw);
    } else if (!isVisible && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }, { threshold: 0.05 });

  const heroSection = document.getElementById('hero') || canvas;
  observer.observe(heroSection);

  // Optimised parameters for smooth 60fps rendering
  const numLines = 36;
  const segments = 48;
  let time = 0;
  let lastFrameTime = performance.now();

  function draw(currentTime) {
    if (!isVisible) {
      animationFrameId = null;
      return;
    }

    // Limit frame rate update frequency if needed (60fps max)
    const delta = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;
    time += Math.min(delta, 0.1) * 0.4;

    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;

    // Fill background with subtle violet radial gradient bloom
    const bgGlow = ctx.createRadialGradient(
      width / 2 + mouseX * 2,
      height * 0.35 + mouseY * 2,
      50,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    bgGlow.addColorStop(0, '#100D1A');
    bgGlow.addColorStop(0.45, '#0A0A0E');
    bgGlow.addColorStop(1, '#060608');

    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    // Render topographic contour lines
    const lineSpacing = height / (numLines * 0.62);
    const startY = -height * 0.15;
    const stepX = (width + 160) / segments;

    for (let i = 0; i < numLines; i++) {
      const baseY = startY + i * lineSpacing;
      const distFromCenter = Math.abs(i - numLines / 2) / (numLines / 2);
      const alphaVal = Math.max(0.04, (1 - distFromCenter * 0.7) * 0.26);

      ctx.beginPath();

      for (let j = 0; j <= segments; j++) {
        const x = -80 + j * stepX;
        const nx = (x / width) * 4.2;
        const ny = (baseY / height) * 3.2;

        const wave1 = Math.sin(nx * 1.8 + ny * 2.2 + time * 1.2) * 38;
        const wave2 = Math.cos(nx * 3.0 - ny * 1.4 + time * 0.8) * 24;
        const wave3 = Math.sin(nx * 0.8 + ny * 3.8 + time * 1.6 + i * 0.1) * 45;

        const y = baseY + wave1 + wave2 + wave3;

        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      // Shadow stroke for depth
      ctx.strokeStyle = `rgba(0, 0, 0, ${alphaVal * 1.4})`;
      ctx.lineWidth = 3.0;
      ctx.stroke();

      // Subtle violet-silver specular ridge stroke
      ctx.strokeStyle = i % 3 === 0 
        ? `rgba(167, 139, 250, ${alphaVal * 0.75})` 
        : `rgba(230, 225, 235, ${alphaVal})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  animationFrameId = requestAnimationFrame(draw);

  return function cleanup() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    observer.disconnect();
    window.removeEventListener('resize', resize);
  };
}
