import { spawnToast } from './utils.js';
import { projectDetails, workflowMessages } from './projectData.js';
import { playUiSound } from './sound.js';

let currentModalProject = null;
let currentModalSlideIdx = 0;

let lastFocusedElement = null;

function trapFocus(modal) {
  const focusables = modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  first.focus();

  modal._focusTrapHandler = function(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  modal.addEventListener('keydown', modal._focusTrapHandler);
}

function releaseFocus(modal) {
  if (modal._focusTrapHandler) {
    modal.removeEventListener('keydown', modal._focusTrapHandler);
    delete modal._focusTrapHandler;
  }
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

window.setModalCarouselSlide = function(idx) {
  if (!currentModalProject) return;
  const data = projectDetails[currentModalProject];
  if (!data || !data.slides || !data.slides[idx]) return;
  currentModalSlideIdx = idx;
  const slide = data.slides[idx];

  const img = document.getElementById('modalCarouselImg');
  if (img) {
    img.src = slide.src;
    img.onerror = () => { img.onerror = null; img.src = `${currentModalProject}-mockup.png`; };
    img.alt = slide.label;
  }

  const label = document.getElementById('modalCarouselLabel');
  if (label) label.textContent = slide.label;

  const tabs = document.querySelectorAll('#modalCarouselTabs .carousel-tab');
  tabs.forEach((t, i) => t.classList.toggle('active', i === idx));

  const dots = document.querySelectorAll('#modalCarouselDots .carousel-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
};

window.prevModalCarouselSlide = function() {
  if (!currentModalProject) return;
  const data = projectDetails[currentModalProject];
  if (!data || !data.slides) return;
  window.setModalCarouselSlide((currentModalSlideIdx - 1 + data.slides.length) % data.slides.length);
};

window.nextModalCarouselSlide = function() {
  if (!currentModalProject) return;
  const data = projectDetails[currentModalProject];
  if (!data || !data.slides) return;
  window.setModalCarouselSlide((currentModalSlideIdx + 1) % data.slides.length);
};

window.openModalCurrentScreenshot = function() {
  if (!currentModalProject) return;
  const data = projectDetails[currentModalProject];
  if (!data || !data.slides) return;
  const slide = data.slides[currentModalSlideIdx];
  if (typeof window.openScreenshotModal === 'function') {
    window.openScreenshotModal(slide.src, slide.label + '  |  ' + data.title);
  }
};

// Exposed globally for onclick handlers in HTML
window.openProjectModal = function(projectId) {
  const data = projectDetails[projectId];
  if (!data) return;
  currentModalProject = projectId;
  currentModalSlideIdx = 0;
  lastFocusedElement = document.activeElement;

  document.getElementById('modalBadge').textContent = data.badge;
  document.getElementById('modalStamp').textContent = data.stamp;
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalRoleTag').textContent = data.roleTag;
  document.getElementById('modalStatusBadge').innerHTML = data.statusBadge;
  document.getElementById('modalDesc').textContent = data.desc;

  // Build Modal Carousel tabs and dots
  const tabsContainer = document.getElementById('modalCarouselTabs');
  const dotsContainer = document.getElementById('modalCarouselDots');
  tabsContainer.innerHTML = data.slides.map((s, i) => 
    `<button type="button" class="carousel-tab ${i === 0 ? 'active' : ''}" onclick="setModalCarouselSlide(${i})">${s.tab}</button>`
  ).join('');
  dotsContainer.innerHTML = data.slides.map((s, i) => 
    `<button type="button" class="carousel-dot ${i === 0 ? 'active' : ''}" onclick="setModalCarouselSlide(${i})" aria-label="${s.tab}"></button>`
  ).join('');
  window.setModalCarouselSlide(0);

  const hlList = document.getElementById('modalHighlights');
  hlList.innerHTML = data.highlights.map(h => `<li>${h}</li>`).join('');

  const stackRow = document.getElementById('modalStack');
  stackRow.innerHTML = data.stack.map(s => `<span class="stack-chip">${s}</span>`).join('');

  // Reset to screenshot view by default
  window.switchModalView('screens');

  // Populate Architecture Pipeline & Code Snippet
  const pipelineGrid = document.getElementById('modalPipelineGrid');
  if (pipelineGrid && data.architecturePipeline) {
    pipelineGrid.innerHTML = data.architecturePipeline.map(p => `
      <div class="modal-pipeline-card">
        <div class="pipeline-step-badge">${p.step}</div>
        <div class="pipeline-card-body">
          <div class="pipeline-card-title">${p.title}</div>
          <div class="pipeline-card-desc">${p.desc}</div>
        </div>
      </div>
    `).join('');
  }

  const codeBox = document.getElementById('modalCodeBox');
  if (codeBox && data.codeSnippet) {
    const escapedCode = data.codeSnippet.code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    codeBox.innerHTML = `
      <div class="modal-code-header">
        <span class="modal-code-title">// ${data.codeSnippet.title}</span>
        <button type="button" class="btn-copy-code" onclick="copySnippetCode('${projectId}')">Copy Snippet</button>
      </div>
      <pre class="modal-code-pre"><code>${escapedCode}</code></pre>
    `;
  }

  const linksRow = document.getElementById('modalLinks');
  let linksHtml = '';
  if (data.demoUrl) {
    linksHtml += `<a href="${data.demoUrl}" target="_blank" rel="noopener" class="code-link-btn btn-showcase-demo">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
      Live Showcase Demo ↗
    </a>`;
  }
  if (data.codeUrl) {
    linksHtml += `<a href="${data.codeUrl}" target="_blank" rel="noopener" class="code-link-btn">
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"></path></svg>
      View Code
    </a>`;
  }
  if (data.codeStub) {
    linksHtml += `<span class="code-link-stub">
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"></path></svg>
      ${data.codeStub}
    </span>`;
  }
  linksRow.innerHTML = linksHtml;

  const modal = document.getElementById('projectModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  playUiSound('tab');
  trapFocus(modal);
};

window.switchModalView = function(viewMode) {
  const screensView = document.getElementById('modalViewScreens');
  const archView = document.getElementById('modalViewArch');
  const screensBtn = document.getElementById('modalViewScreensBtn');
  const archBtn = document.getElementById('modalViewArchBtn');

  playUiSound('tab');

  if (viewMode === 'arch') {
    if (screensView) screensView.style.display = 'none';
    if (archView) archView.style.display = 'block';
    if (screensBtn) screensBtn.classList.remove('active');
    if (archBtn) archBtn.classList.add('active');
  } else {
    if (screensView) screensView.style.display = 'block';
    if (archView) archView.style.display = 'none';
    if (screensBtn) screensBtn.classList.add('active');
    if (archBtn) archBtn.classList.remove('active');
  }
};

window.copySnippetCode = function(projectId) {
  const data = projectDetails[projectId];
  if (data && data.codeSnippet) {
    navigator.clipboard.writeText(data.codeSnippet.code)
      .then(() => {
        playUiSound('success');
        spawnToast('SNIPPET COPIED', 'Architecture pattern copied to clipboard');
      })
      .catch(() => spawnToast('COPY ERROR', 'Could not copy snippet'));
  }
};

window.closeProjectModal = function(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close')) return;
  const modal = document.getElementById('projectModal');
  if (modal.classList.contains('active')) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    playUiSound('click');
    releaseFocus(modal);
  }
};

window.setWorkflowStep = function(projectId, stepIdx) {
  const card = document.getElementById(`ticket-${projectId}`);
  if (!card) return;
  const steps = card.querySelectorAll('.workflow-step');
  steps.forEach((s, idx) => {
    if (idx === stepIdx) s.classList.add('active');
    else s.classList.remove('active');
  });
  const msg = workflowMessages[projectId][stepIdx];
  spawnToast(`WORKFLOW STEP ${stepIdx + 1}`, msg);
};

window.openResumeModal = function() {
  const modal = document.getElementById('resumeModal');
  if (modal) {
    lastFocusedElement = document.activeElement;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    spawnToast('CV PREVIEW', 'Loaded Kurt Fariñas Resume PDF viewer');
    trapFocus(modal);
  }
};

window.closeResumeModal = function(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close')) return;
  const modal = document.getElementById('resumeModal');
  if (modal && modal.classList.contains('active')) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    releaseFocus(modal);
  }
};

export function initModals() {
  // Close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeProjectModal();
      window.closeResumeModal();
      if (typeof window.closeScreenshotModal === 'function') {
        window.closeScreenshotModal();
      }
    }
  });
}


