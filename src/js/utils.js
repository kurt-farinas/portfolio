/* ========================================
   UTILS  |  Toast, Email, Achievements, Konami
   ======================================== */

// Achievement toasts (disabled globally)
export function spawnToast(title, body) {
  // Toasts disabled globally
}

// Copy email helper
export function copyEmail() {
  const email = 'kurtfarinas2022@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    spawnToast('EMAIL COPIED', 'kurtfarinas2022@gmail.com copied to clipboard!');
  }).catch(() => {
    spawnToast('CONTACT EMAIL', 'kurtfarinas2022@gmail.com');
  });
}

// Achievement scroll observer
export function initAchievements() {
  let seenProjects = false;
  let seenContact = false;

  const achieveObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.target.id === 'projects' && !seenProjects) {
        seenProjects = true;
        spawnToast('ACHIEVEMENT UNLOCKED', 'Found the actual work section.');
      }
      if (entry.target.id === 'contact' && !seenContact) {
        seenContact = true;
        spawnToast('ACHIEVEMENT UNLOCKED', 'Scrolled to the end. Rare among recruiters.');
      }
    });
  }, { threshold: 0.3 });

  ['projects', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) achieveObserver.observe(el);
  });
}

// Konami code easter egg
export function initKonamiCode() {
  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiPos = 0;

  document.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === konami[konamiPos]) {
      konamiPos++;
      if (konamiPos === konami.length) {
        konamiPos = 0;
        spawnToast('SECRET FOUND', 'Most recruiters don\'t scroll this far, let alone type this. kurtfarinas2022@gmail.com');
        // Print to terminal if available
        const termOutput = document.getElementById('termOutput');
        if (termOutput) {
          const d = document.createElement('div');
          d.className = 'out-line';
          d.innerHTML = `<span class="out-special">// konami code detected. respect.</span>`;
          termOutput.appendChild(d);
          termOutput.scrollTop = termOutput.scrollHeight;
        }
      }
    } else {
      konamiPos = (key === konami[0]) ? 1 : 0;
    }
  });
}
