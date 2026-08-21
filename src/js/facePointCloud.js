/* ========================================
   3D PARTICLE POINT-CLOUD FACE
   Generates interactive 3D spatial particle depth from profile.jpg
   Inspired by cybernetic spatial computing & point clouds
   ======================================== */

export function initFacePointCloud() {
  const canvas = document.getElementById('facePointCloudCanvas');
  const container = document.getElementById('about3dPortrait') || document.getElementById('hero3dPortrait');
  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let particles = [];
  let animationFrameId = null;
  let isRunning = false;
  let width = 240;
  let height = 300;
  let centerX = width / 2;
  let centerY = height / 2;

  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let isHovered = false;
  let scrollDispersion = 0;

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    width = Math.max(180, Math.min(rect.width || 240, 380));
    height = Math.max(220, Math.min(rect.height || 300, 460));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    centerX = width / 2;
    centerY = height / 2;
  }

  // Load and sample image for 3D point cloud
  function loadAndSampleFace() {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'profile.jpg';

    img.onload = () => {
      buildPointCloudFromImage(img);
    };

    img.onerror = () => {
      // Fallback: procedural 3D geometric face matrix
      buildProceduralFace();
    };
  }

  function buildPointCloudFromImage(img) {
    const sampleCanvas = document.createElement('canvas');
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    
    // Sample resolution: balanced density (~4,500 particles for high FPS)
    const sampleW = 68;
    const sampleH = 82;
    sampleCanvas.width = sampleW;
    sampleCanvas.height = sampleH;

    // Draw and sample
    sampleCtx.drawImage(img, 0, 0, sampleW, sampleH);
    let imgData;
    try {
      imgData = sampleCtx.getImageData(0, 0, sampleW, sampleH).data;
    } catch (e) {
      buildProceduralFace();
      return;
    }

    particles = [];
    const spacing = Math.min(width, height) / 58;
    const depthScale = 90;

    for (let y = 0; y < sampleH; y += 1) {
      for (let x = 0; x < sampleW; x += 1) {
        const idx = (y * sampleW + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];
        const a = imgData[idx + 3];

        if (a < 30) continue;

        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Exclude completely black empty background corners if any
        if (brightness < 0.06 && a < 100) continue;

        // 3D coordinates
        // Center around (0, 0, 0)
        const ox = (x - sampleW / 2) * spacing;
        const oy = (y - sampleH / 2) * spacing;
        // Depth based on brightness curve (features like nose, forehead, cheeks protrude)
        const oz = (brightness - 0.45) * depthScale;

        // Subtle initial jitter for organic depth
        const jitterZ = (Math.random() - 0.5) * 6;

        particles.push({
          x: ox + (Math.random() - 0.5) * 150,
          y: oy + (Math.random() - 0.5) * 150,
          z: oz + (Math.random() - 0.5) * 200,
          ox: ox,
          oy: oy,
          oz: oz + jitterZ,
          vx: 0,
          vy: 0,
          vz: 0,
          r: Math.min(245, Math.max(180, r + 40)),
          g: Math.min(245, Math.max(180, g + 30)),
          b: Math.min(255, Math.max(200, b + 50)),
          size: Math.max(1.1, brightness * 2.2),
          alpha: Math.min(0.95, Math.max(0.25, brightness * 1.1)),
          baseAlpha: Math.min(0.95, Math.max(0.25, brightness * 1.1)),
        });
      }
    }

    startAnimation();
  }

  function buildProceduralFace() {
    particles = [];
    const rows = 40;
    const cols = 35;
    const spacing = 7;
    for (let y = -rows / 2; y <= rows / 2; y++) {
      for (let x = -cols / 2; x <= cols / 2; x++) {
        const dist = Math.hypot(x / (cols / 2), y / (rows / 2));
        if (dist > 1.05) continue;
        const z = Math.cos(dist * Math.PI * 0.5) * 50;
        particles.push({
          x: x * spacing + (Math.random() - 0.5) * 50,
          y: y * spacing + (Math.random() - 0.5) * 50,
          z: z + (Math.random() - 0.5) * 50,
          ox: x * spacing,
          oy: y * spacing,
          oz: z,
          vx: 0,
          vy: 0,
          vz: 0,
          r: 210,
          g: 205,
          b: 235,
          size: 1.6,
          alpha: 0.75,
          baseAlpha: 0.75,
        });
      }
    }
    startAnimation();
  }

  // Shockwave burst on click or touch
  function triggerBurst(force = 22) {
    particles.forEach(p => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * force + 8;
      p.vx += Math.cos(angle) * distance;
      p.vy += Math.sin(angle) * distance;
      p.vz += (Math.random() - 0.5) * distance * 2.5;
    });
  }

  // Interaction handlers
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    targetRotY = (nx - 0.5) * 0.75;
    targetRotX = -(ny - 0.5) * 0.65;
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    isHovered = true;
  });

  window.addEventListener('mousemove', (e) => {
    if (isHovered) return;
    const nx = e.clientX / window.innerWidth;
    const ny = e.clientY / window.innerHeight;
    targetRotY = (nx - 0.5) * 0.45;
    targetRotX = -(ny - 0.5) * 0.35;
  }, { passive: true });

  container.addEventListener('mouseleave', () => {
    isHovered = false;
  });

  container.addEventListener('click', () => {
    triggerBurst(26);
  });

  // Touch support for mobile devices
  container.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const nx = (touch.clientX - rect.left) / rect.width;
      const ny = (touch.clientY - rect.top) / rect.height;
      targetRotY = (nx - 0.5) * 0.8;
      targetRotX = -(ny - 0.5) * 0.7;
    }
  }, { passive: true });

  container.addEventListener('touchstart', () => {
    triggerBurst(18);
  }, { passive: true });

  // Scroll reaction
  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const vh = window.innerHeight || 800;
    scrollDispersion = Math.min(1, Math.max(0, scrollY / (vh * 0.75)));
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Animation render loop
  let time = 0;

  function render() {
    if (!isRunning) return;

    time += 0.02;
    ctx.clearRect(0, 0, width, height);

    // Smooth rotation dampening
    currentRotX += (targetRotX - currentRotX) * 0.08;
    currentRotY += (targetRotY - currentRotY) * 0.08;

    // Ambient floating idle wave
    const ambientYaw = Math.sin(time * 0.7) * 0.06;
    const ambientPitch = Math.cos(time * 0.5) * 0.04;
    const rotX = currentRotX + ambientPitch;
    const rotY = currentRotY + ambientYaw;

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const fov = 380;
    const cameraZ = 280;

    // Scroll dispersion effect
    const disperseZ = scrollDispersion * 450;
    const disperseX = scrollDispersion * 240;
    const globalFade = Math.max(0, 1 - scrollDispersion * 1.35);

    if (globalFade <= 0.01) {
      animationFrameId = requestAnimationFrame(render);
      return;
    }

    const len = particles.length;
    for (let i = 0; i < len; i++) {
      const p = particles[i];

      // Spring physics to return to target point
      const spring = 0.07;
      const friction = 0.86;
      p.vx += (p.ox - p.x) * spring;
      p.vy += (p.oy - p.y) * spring;
      p.vz += (p.oz - p.z) * spring;

      p.vx *= friction;
      p.vy *= friction;
      p.vz *= friction;

      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      // Apply scroll displacement in 3D
      const scrollShiftX = (p.ox >= 0 ? 1 : -1) * disperseX;
      const targetX = p.x + scrollShiftX;
      const targetY = p.y - scrollDispersion * 40;
      const targetZ = p.z - disperseZ;

      // 3D Matrix Rotation (Yaw -> Pitch)
      const x1 = targetX * cosY + targetZ * sinY;
      const z1 = -targetX * sinY + targetZ * cosY;

      const y1 = targetY * cosX - z1 * sinX;
      const z2 = targetY * sinX + z1 * cosX;

      // Perspective projection
      const depth = fov + z2 + cameraZ;
      if (depth <= 20) continue;

      const scale = fov / depth;
      const projX = centerX + x1 * scale;
      const projY = centerY + y1 * scale;
      const projSize = Math.max(0.7, p.size * scale);

      // Depth shading (brighter in front, darker in back)
      const depthAlpha = Math.max(0.12, Math.min(1, (z2 + 140) / 260)) * p.baseAlpha * globalFade;

      if (isLight) {
        // Light mode: dark obsidian / violet particles
        ctx.fillStyle = `rgba(30, 27, 75, ${(depthAlpha * 0.8).toFixed(3)})`;
      } else {
        // Dark mode: glowing silver-violet cybernetic particles
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${depthAlpha.toFixed(3)})`;
      }

      ctx.beginPath();
      ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
      ctx.fill();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  function startAnimation() {
    if (!isRunning) {
      isRunning = true;
      render();
    }
  }

  function stopAnimation() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  // IntersectionObserver to pause render loop when hero is off-screen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startAnimation();
      } else {
        stopAnimation();
      }
    });
  }, { threshold: 0.05 });

  observer.observe(container);

  // Handle window resizing
  window.addEventListener('resize', () => {
    resizeCanvas();
  }, { passive: true });

  // Initial setup
  resizeCanvas();
  loadAndSampleFace();
}
