/* ========================================
   3D EYE-TRACKING FACE PORTRAIT
   Renders 3D head parallax + independent cursor-following eyeballs
   with natural blinking and micro-saccades from profile.jpg
   ======================================== */

export function initFaceEyeTracker() {
  const container = document.getElementById('about3dPortrait');
  if (!container) return;

  // Find or create canvas
  let canvas = document.getElementById('faceEyeTrackingCanvas') || document.getElementById('facePointCloudCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'faceEyeTrackingCanvas';
    container.appendChild(canvas);
  } else {
    canvas.id = 'faceEyeTrackingCanvas';
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 240;
  let height = 290;
  let animationFrameId = null;
  let isRunning = false;

  // Head tracking state
  let targetHeadYaw = 0;
  let targetHeadPitch = 0;
  let currentHeadYaw = 0;
  let currentHeadPitch = 0;

  // Global mouse coordinates
  let mouseScreenX = window.innerWidth / 2;
  let mouseScreenY = window.innerHeight / 2;
  let isHovered = false;

  // Pupil state (independent left and right)
  const leftEye = {
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    baseOffsetX: -32, // relative to face center
    baseOffsetY: -12,
    radius: 14,
    irisRadius: 8.5,
    pupilRadius: 4.8,
  };

  const rightEye = {
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    baseOffsetX: 32, // relative to face center
    baseOffsetY: -12,
    radius: 14,
    irisRadius: 8.5,
    pupilRadius: 4.8,
  };

  // Blinking system
  let blinkProgress = 0; // 0 = open, 1 = fully closed
  let isBlinking = false;
  let nextBlinkTime = performance.now() + 3000;
  let blinkStartTime = 0;
  const blinkDuration = 180; // ms

  // Load portrait image
  const profileImg = new Image();
  profileImg.crossOrigin = 'anonymous';
  profileImg.src = 'profile.jpg';
  let isImageLoaded = false;

  profileImg.onload = () => {
    isImageLoaded = true;
    startAnimation();
  };

  profileImg.onerror = () => {
    // If image fails, render stylized high-tech geometric avatar with eyes
    isImageLoaded = false;
    startAnimation();
  };

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    width = Math.max(180, Math.min(rect.width || 240, 360));
    height = Math.max(220, Math.min(rect.height || 290, 420));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
  }

  // Mouse and Touch listeners
  function onMouseMove(e) {
    mouseScreenX = e.clientX;
    mouseScreenY = e.clientY;

    const rect = container.getBoundingClientRect();
    const portraitCenterX = rect.left + rect.width / 2;
    const portraitCenterY = rect.top + rect.height / 2;

    const dx = (mouseScreenX - portraitCenterX) / (window.innerWidth / 2);
    const dy = (mouseScreenY - portraitCenterY) / (window.innerHeight / 2);

    // Head yaw and pitch limits
    targetHeadYaw = Math.max(-0.42, Math.min(0.42, dx * 0.42));
    targetHeadPitch = Math.max(-0.32, Math.min(0.32, dy * 0.32));
  }

  function onTouchMove(e) {
    if (e.touches && e.touches[0]) {
      onMouseMove(e.touches[0]);
    }
  }

  // Trigger rapid wink/blink on click
  function triggerClickBlink() {
    isBlinking = true;
    blinkStartTime = performance.now();
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  container.addEventListener('mouseenter', () => { isHovered = true; });
  container.addEventListener('mouseleave', () => { isHovered = false; });
  container.addEventListener('click', triggerClickBlink);

  // Eye calculation logic
  function updateEyes(now) {
    // Check blinking schedule
    if (!isBlinking && now >= nextBlinkTime) {
      isBlinking = true;
      blinkStartTime = now;
      nextBlinkTime = now + 2800 + Math.random() * 3200;
    }

    if (isBlinking) {
      const elapsed = now - blinkStartTime;
      if (elapsed >= blinkDuration) {
        isBlinking = false;
        blinkProgress = 0;
      } else {
        const half = blinkDuration / 2;
        if (elapsed < half) {
          blinkProgress = elapsed / half;
        } else {
          blinkProgress = 1 - (elapsed - half) / half;
        }
      }
    }

    // Smooth head interpolation
    currentHeadYaw += (targetHeadYaw - currentHeadYaw) * 0.09;
    currentHeadPitch += (targetHeadPitch - currentHeadPitch) * 0.09;

    const rect = container.getBoundingClientRect();
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate eye positions in 3D perspective
    [leftEye, rightEye].forEach(eye => {
      // 3D head rotation transforms socket position
      const cosY = Math.cos(currentHeadYaw);
      const sinY = Math.sin(currentHeadYaw);
      const cosX = Math.cos(currentHeadPitch);
      const sinX = Math.sin(currentHeadPitch);

      const rotatedOffsetX = eye.baseOffsetX * cosY;
      const rotatedOffsetY = eye.baseOffsetY * cosX + eye.baseOffsetX * sinX * 0.1;

      eye.socketX = centerX + rotatedOffsetX;
      eye.socketY = centerY + rotatedOffsetY;

      // Calculate vector from eye socket to mouse screen coordinate
      const socketScreenX = rect.left + eye.socketX;
      const socketScreenY = rect.top + eye.socketY;

      const deltaX = mouseScreenX - socketScreenX;
      const deltaY = mouseScreenY - socketScreenY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.hypot(deltaX, deltaY);

      // Max eye rotation limit
      const maxPupilTravel = 5.5;
      const travel = Math.min(maxPupilTravel, (distance / 320) * maxPupilTravel);

      eye.targetX = Math.cos(angle) * travel;
      eye.targetY = Math.sin(angle) * travel * 0.85;

      // Smooth pupil interpolation (saccadic follow)
      eye.currentX += (eye.targetX - eye.currentX) * 0.16;
      eye.currentY += (eye.targetY - eye.currentY) * 0.16;
    });
  }

  // Draw individual 3D eye
  function drawEyeball(eye) {
    ctx.save();
    ctx.translate(eye.socketX, eye.socketY);

    // Eyelid clipping mask based on blinkProgress
    const eyeHeight = eye.radius * (1 - blinkProgress * 0.95);

    ctx.beginPath();
    ctx.ellipse(0, 0, eye.radius * 1.05, Math.max(1, eyeHeight), 0, 0, Math.PI * 2);
    ctx.clip();

    // Sclera (Eyeball white with depth gradient)
    const scleraGrad = ctx.createRadialGradient(
      eye.currentX * 0.3, eye.currentY * 0.3, 2,
      0, 0, eye.radius
    );
    scleraGrad.addColorStop(0, '#FFFFFF');
    scleraGrad.addColorStop(0.7, '#F1F1F5');
    scleraGrad.addColorStop(1, '#D5D5DF');

    ctx.fillStyle = scleraGrad;
    ctx.fill();

    // Sclera top shadow (from upper eyelid)
    const shadowGrad = ctx.createLinearGradient(0, -eye.radius, 0, eye.radius);
    shadowGrad.addColorStop(0, 'rgba(30, 27, 75, 0.45)');
    shadowGrad.addColorStop(0.4, 'rgba(30, 27, 75, 0.05)');
    shadowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrad;
    ctx.fill();

    // Iris & Pupil (Look-At position)
    const pupilX = eye.currentX;
    const pupilY = eye.currentY;

    // Iris Outer Border
    ctx.beginPath();
    ctx.arc(pupilX, pupilY, eye.irisRadius, 0, Math.PI * 2);
    const irisGrad = ctx.createRadialGradient(
      pupilX - 1, pupilY - 1, 1,
      pupilX, pupilY, eye.irisRadius
    );
    irisGrad.addColorStop(0, '#584234');
    irisGrad.addColorStop(0.45, '#3B291D');
    irisGrad.addColorStop(0.85, '#22150E');
    irisGrad.addColorStop(1, '#110A06');
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // Iris Limbal Ring
    ctx.strokeStyle = 'rgba(15, 10, 5, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Pupil
    ctx.beginPath();
    ctx.arc(pupilX, pupilY, eye.pupilRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#080503';
    ctx.fill();

    // Specular Catchlight (Reflected light glint on cornea)
    ctx.beginPath();
    ctx.arc(pupilX - 2.8, pupilY - 2.8, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pupilX + 2.2, pupilY + 1.8, 0.9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    ctx.restore();

    // Upper and Lower Eyelid Outline
    if (blinkProgress > 0.1) {
      ctx.save();
      ctx.translate(eye.socketX, eye.socketY);
      ctx.beginPath();
      ctx.ellipse(0, 0, eye.radius * 1.1, Math.max(1, eyeHeight), 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(45, 30, 25, ${Math.min(0.9, blinkProgress * 1.2)})`;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Render loop
  function render(time) {
    if (!isRunning) return;

    updateEyes(time);

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    // 1. Draw Background Vignette / Card Backdrop
    const bgGrad = ctx.createRadialGradient(
      centerX + currentHeadYaw * 30,
      centerY + currentHeadPitch * 30,
      10,
      centerX,
      centerY,
      Math.max(width, height) * 0.75
    );

    if (isLight) {
      bgGrad.addColorStop(0, '#EAE9E4');
      bgGrad.addColorStop(1, '#D8D6CE');
    } else {
      bgGrad.addColorStop(0, '#1E1B2E');
      bgGrad.addColorStop(0.6, '#13111C');
      bgGrad.addColorStop(1, '#0C0A12');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 3D Head Transformation Matrix
    ctx.save();
    ctx.translate(centerX, centerY);

    // 3D Parallax skew and shift
    const shiftX = currentHeadYaw * 28;
    const shiftY = currentHeadPitch * 22;
    const scaleX = 1 - Math.abs(currentHeadYaw) * 0.08;
    const scaleY = 1 - Math.abs(currentHeadPitch) * 0.06;

    ctx.translate(shiftX, shiftY);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(currentHeadYaw * 0.12);

    // Draw Portrait Base Photo
    if (isImageLoaded) {
      const imgW = width * 0.94;
      const imgH = height * 0.94;
      const imgX = -imgW / 2;
      const imgY = -imgH / 2;

      ctx.save();
      // Rounded portrait frame
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 12);
      ctx.clip();

      ctx.drawImage(profileImg, imgX, imgY, imgW, imgH);

      // Subtle dynamic 3D lighting sheen over face
      const lightSheen = ctx.createLinearGradient(
        -imgW / 2 + currentHeadYaw * 100, -imgH / 2,
        imgW / 2 - currentHeadYaw * 100, imgH / 2
      );
      if (isLight) {
        lightSheen.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        lightSheen.addColorStop(0.5, 'transparent');
        lightSheen.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
      } else {
        lightSheen.addColorStop(0, 'rgba(167, 139, 250, 0.2)');
        lightSheen.addColorStop(0.5, 'transparent');
        lightSheen.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      }
      ctx.fillStyle = lightSheen;
      ctx.fillRect(imgX, imgY, imgW, imgH);

      ctx.restore();
    } else {
      // Fallback: Stylized 3D Avatar Silhouette
      ctx.beginPath();
      ctx.ellipse(0, -6, 52, 68, 0, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#C5C3BC' : '#2D283E';
      ctx.fill();
      ctx.strokeStyle = '#8B7CF6';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();

    // 3. Render Cursor-Tracking Eyeballs
    drawEyeball(leftEye);
    drawEyeball(rightEye);

    // 4. Subtle Violet Holographic HUD Overlay & Crosshair Glint
    ctx.save();
    ctx.strokeStyle = isLight ? 'rgba(139, 124, 246, 0.3)' : 'rgba(167, 139, 250, 0.4)';
    ctx.lineWidth = 1;

    // Corner brackets
    const pad = 12;
    const bracketLen = 14;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(pad, pad + bracketLen);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + bracketLen, pad);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - pad - bracketLen, pad);
    ctx.lineTo(width - pad, pad);
    ctx.lineTo(width - pad, pad + bracketLen);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(pad, height - pad - bracketLen);
    ctx.lineTo(pad, height - pad);
    ctx.lineTo(pad + bracketLen, height - pad);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - pad - bracketLen, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.lineTo(width - pad, height - pad - bracketLen);
    ctx.stroke();

    // Small status label at bottom
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = isLight ? 'rgba(30, 27, 75, 0.6)' : 'rgba(236, 234, 230, 0.6)';
    ctx.fillText('3D EYE TRACK · ACTIVE', pad + 4, height - pad - 4);

    ctx.restore();

    animationFrameId = requestAnimationFrame(render);
  }

  function startAnimation() {
    if (!isRunning) {
      isRunning = true;
      animationFrameId = requestAnimationFrame(render);
    }
  }

  function stopAnimation() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  // IntersectionObserver to pause render loop when offscreen
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

  window.addEventListener('resize', () => {
    resizeCanvas();
  }, { passive: true });

  resizeCanvas();
}
