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
    const dpr = 1.0; // 1.0 DPR for max 60fps canvas throughput
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  let cursorX = -1000;
  let cursorY = -1000;

  window.addEventListener('mousemove', (e) => {
    if (!isVisible) return;
    const rect = canvas.getBoundingClientRect();
    cursorX = e.clientX - rect.left;
    cursorY = e.clientY - rect.top;
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 16;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 16;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    cursorX = -1000;
    cursorY = -1000;
  });

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
  const numLines = 22;
  const segments = 36;
  let time = 0;
  let lastFrameTime = performance.now();

  // Theme-aware color palettes
  function getThemeColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      return {
        bgInner: '#F5F3EF',
        bgMid: '#FAF9F6',
        bgOuter: '#FCFBF9',
        ridgeColor1: '80, 80, 85',
        ridgeColor2: '120, 120, 125',
      };
    }
    return {
      bgInner: '#0D0D11',
      bgMid: '#08080A',
      bgOuter: '#060608',
      ridgeColor1: '200, 200, 210',
      ridgeColor2: '230, 230, 240',
    };
  }

  function draw(currentTime) {
    if (!isVisible) {
      animationFrameId = null;
      return;
    }

    const delta = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;
    time += Math.min(delta, 0.1) * 0.35;

    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;

    const colors = getThemeColors();

    // Fill background with subtle radial gradient bloom
    const bgGlow = ctx.createRadialGradient(
      width / 2 + mouseX * 2,
      height * 0.35 + mouseY * 2,
      50,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    bgGlow.addColorStop(0, colors.bgInner);
    bgGlow.addColorStop(0.45, colors.bgMid);
    bgGlow.addColorStop(1, colors.bgOuter);

    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    // Render topographic contour lines
    const lineSpacing = height / (numLines * 0.65);
    const startY = -height * 0.12;
    const stepX = (width + 160) / segments;

    for (let i = 0; i < numLines; i++) {
      const baseY = startY + i * lineSpacing;
      const distFromCenter = Math.abs(i - numLines / 2) / (numLines / 2);
      const alphaVal = Math.max(0.04, (1 - distFromCenter * 0.65) * 0.28);

      ctx.beginPath();

      for (let j = 0; j <= segments; j++) {
        const x = -80 + j * stepX;
        const nx = (x / width) * 4.0;
        const ny = (baseY / height) * 3.0;

        const wave1 = Math.sin(nx * 1.8 + ny * 2.2 + time * 1.2) * 36;
        const wave2 = Math.cos(nx * 3.0 - ny * 1.4 + time * 0.8) * 22;
        const wave3 = Math.sin(nx * 0.8 + ny * 3.8 + time * 1.6 + i * 0.1) * 40;

        // Dynamic proximity ripple under cursor
        const dx = x - cursorX;
        const dy = baseY - cursorY;
        const distSq = dx * dx + dy * dy;
        let ripple = 0;
        if (distSq < 48400) { // 220px radius
          const dist = Math.sqrt(distSq);
          const factor = 1 - dist / 220;
          ripple = Math.sin(dist * 0.06 - time * 3.5) * (factor * factor) * 18;
        }

        const y = baseY + wave1 + wave2 + wave3 + ripple;

        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      // Single optimized specular ridge stroke
      ctx.strokeStyle = i % 2 === 0 
        ? `rgba(${colors.ridgeColor1}, ${alphaVal * 0.8})` 
        : `rgba(${colors.ridgeColor2}, ${alphaVal})`;
      ctx.lineWidth = 1.3;
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
