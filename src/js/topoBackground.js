/* ========================================
   TOPO BACKGROUND  |  3D Organic Wave Relief
   Renders dark topographical relief curves
   ======================================== */

export function initTopoBackground() {
  const canvas = document.getElementById('topoCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let animationFrameId = null;
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  function resize() {
    const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    width = rect.width || window.innerWidth;
    height = rect.height || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 30;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 30;
  });

  // Parameters for generating topographic contour curves
  const numLines = 55;
  let time = 0;

  function draw() {
    time += 0.003;
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    // Deep dark gradient base
    const bgGradient = ctx.createRadialGradient(
      width / 2 + mouseX * 2,
      height / 2 + mouseY * 2,
      100,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.85
    );
    bgGradient.addColorStop(0, '#131316');
    bgGradient.addColorStop(0.5, '#0B0B0D');
    bgGradient.addColorStop(1, '#050506');

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Render topographic contour lines
    const lineSpacing = height / (numLines * 0.65);
    const startY = -height * 0.2;

    for (let i = 0; i < numLines; i++) {
      const baseY = startY + i * lineSpacing;
      
      // Calculate depth multiplier (center lines pop more)
      const distFromCenter = Math.abs(i - numLines / 2) / (numLines / 2);
      const alphaVal = Math.max(0.04, (1 - distFromCenter * 0.75) * 0.28);
      const shadowAlpha = alphaVal * 1.5;

      ctx.beginPath();

      const segments = 80;
      const stepX = (width + 200) / segments;

      for (let j = 0; j <= segments; j++) {
        const x = -100 + j * stepX;
        
        // Multi-frequency sine waves creating organic 3D terrain ridges
        const nx = (x / width) * 4.5;
        const ny = (baseY / height) * 3.5;
        
        const wave1 = Math.sin(nx * 1.8 + ny * 2.2 + time * 0.8) * 45;
        const wave2 = Math.cos(nx * 3.2 - ny * 1.5 + time * 0.5) * 30;
        const wave3 = Math.sin(nx * 0.8 + ny * 4.0 + time * 1.2 + i * 0.12) * 60;
        const wave4 = Math.cos((x * 0.003) + (baseY * 0.004) + time) * 25;
        
        // Mouse depth influence
        const mouseEffect = Math.sin((x / width - 0.5) * Math.PI) * mouseY * (1 - distFromCenter);

        const y = baseY + wave1 + wave2 + wave3 + wave4 + mouseEffect;

        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      // 1. Draw Deep Shadow under the ridge (creates 3D carved depth effect)
      ctx.save();
      ctx.translate(1.5, 3.5);
      ctx.strokeStyle = `rgba(0, 0, 0, ${shadowAlpha * 0.95})`;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();

      // 2. Draw Main Ridge Specular Line (creates light reflection on top edge)
      ctx.strokeStyle = `rgba(225, 220, 230, ${alphaVal})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // Subtle edge vignette overlay
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.4,
      width / 2, height / 2, Math.max(width, height) * 0.8
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(5,5,6,0.7)');

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    animationFrameId = requestAnimationFrame(draw);
  }

  draw();

  return function cleanup() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', resize);
  };
}
