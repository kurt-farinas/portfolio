/* ========================================
   WORKFLOW & STATE SIMULATOR ENGINE
   Hands-on interactive proof of full-stack state machines
   ======================================== */

import { playUiSound } from './sound.js';

// State stores for active simulations
const simState = {
  hris: {
    step: 1, // 1: Draft, 2: Admin Verified, 3: Approver Stamped
    applicantName: "Juan Dela Cruz (Teacher III)",
    leaveType: "Vacation Leave (5 Days)",
    applicantSignature: true,
    adminVerified: false,
    approverSigned: false,
    leaveCreditsVacation: 15.0,
    leaveCreditsSick: 12.5
  },
  gym: {
    lastScan: null,
    activeCheckins: 14,
    todayRevenue: 4200,
    scanLog: [
      { time: "08:15 AM", name: "Denver B.", type: "VIP Member", status: "GRANTED" },
      { time: "08:42 AM", name: "Carlos M.", type: "Regular Member", status: "GRANTED" }
    ]
  }
};

export function renderHrisSimulator(container) {
  if (!container) return;
  const state = simState.hris;

  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-header-left">
          <span class="sim-badge">INTERACTIVE STATE MACHINE</span>
          <span class="sim-title">CS Form No. 6 Approval Simulator</span>
        </div>
        <button type="button" class="sim-btn-reset" onclick="window.resetHrisSim()">Reset Workflow ↺</button>
      </div>

      <!-- Step Progression Stepper -->
      <div class="sim-stepper">
        <div class="sim-step-item ${state.step >= 1 ? 'completed' : ''} ${state.step === 1 ? 'current' : ''}">
          <div class="sim-step-circle">1</div>
          <div class="sim-step-label">Applicant Submission</div>
        </div>
        <div class="sim-step-line ${state.step >= 2 ? 'active' : ''}"></div>
        <div class="sim-step-item ${state.step >= 2 ? 'completed' : ''} ${state.step === 2 ? 'current' : ''}">
          <div class="sim-step-circle">2</div>
          <div class="sim-step-label">Admin Verification</div>
        </div>
        <div class="sim-step-line ${state.step >= 3 ? 'active' : ''}"></div>
        <div class="sim-step-item ${state.step >= 3 ? 'completed' : ''} ${state.step === 3 ? 'current' : ''}">
          <div class="sim-step-circle">3</div>
          <div class="sim-step-label">Approver Sign-Off</div>
        </div>
      </div>

      <!-- Live Simulated Document Preview -->
      <div class="sim-doc-preview">
        <div class="sim-doc-header">
          <div class="sim-doc-title">CIVIL SERVICE FORM NO. 6 (REVISED 2020)</div>
          <div class="sim-doc-badge ${state.step === 3 ? 'badge-approved' : (state.step === 2 ? 'badge-verified' : 'badge-pending')}">
            ${state.step === 3 ? 'APPROVED & STAMPED' : (state.step === 2 ? 'ADMIN VERIFIED' : 'PENDING REVIEW')}
          </div>
        </div>

        <div class="sim-doc-grid">
          <div class="sim-doc-field">
            <span class="sim-field-label">Applicant:</span>
            <span class="sim-field-val">${state.applicantName}</span>
          </div>
          <div class="sim-doc-field">
            <span class="sim-field-label">Type of Leave:</span>
            <span class="sim-field-val">${state.leaveType}</span>
          </div>
          <div class="sim-doc-field">
            <span class="sim-field-label">Vacation Balance:</span>
            <span class="sim-field-val font-mono">${state.adminVerified ? (state.leaveCreditsVacation - 5).toFixed(1) + ' Days' : state.leaveCreditsVacation.toFixed(1) + ' Days'}</span>
          </div>
          <div class="sim-doc-field">
            <span class="sim-field-label">Audit Trail ID:</span>
            <span class="sim-field-val font-mono">DEPED-SJC-2026-${state.step >= 2 ? 'V718' : 'DRAFT'}</span>
          </div>
        </div>

        <!-- Signature Stamp Row -->
        <div class="sim-sig-row">
          <div class="sim-sig-box signed">
            <span class="sig-label">Applicant E-Signature:</span>
            <div class="sig-stamp">[ Verified E-Signature Uploaded ]</div>
          </div>
          <div class="sim-sig-box ${state.adminVerified ? 'signed' : 'waiting'}">
            <span class="sig-label">Admin Verification Seal:</span>
            <div class="sig-stamp">${state.adminVerified ? '✓ Verified by HR Admin' : 'Pending Verification'}</div>
          </div>
          <div class="sim-sig-box ${state.approverSigned ? 'signed approved' : 'waiting'}">
            <span class="sig-label">Division Head Approval:</span>
            <div class="sig-stamp">${state.approverSigned ? '✓ Official Sign-Off Stamped' : 'Pending Final Sign-Off'}</div>
          </div>
        </div>
      </div>

      <!-- Action Controls -->
      <div class="sim-action-controls">
        ${state.step === 1 ? `
          <button type="button" class="sim-action-btn primary" onclick="window.advanceHrisSim(2)">
            Simulate Admin: Verify Leave Credits &amp; Forward →
          </button>
        ` : ''}
        ${state.step === 2 ? `
          <button type="button" class="sim-action-btn success" onclick="window.advanceHrisSim(3)">
            Simulate Approver: Grant Final Digital Sign-Off ✓
          </button>
        ` : ''}
        ${state.step === 3 ? `
          <div class="sim-success-notice">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Workflow Completed: Document locked &amp; printable CS Form No. 6 generated with verified audit hash.</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function advanceHrisSim(nextStep) {
  simState.hris.step = nextStep;
  if (nextStep === 2) {
    simState.hris.adminVerified = true;
    playUiSound('tab');
  } else if (nextStep === 3) {
    simState.hris.approverSigned = true;
    playUiSound('success');
  }
  const container = document.getElementById('modalSimulatorWrap');
  if (container) renderHrisSimulator(container);
}

export function resetHrisSim() {
  simState.hris.step = 1;
  simState.hris.adminVerified = false;
  simState.hris.approverSigned = false;
  playUiSound('click');
  const container = document.getElementById('modalSimulatorWrap');
  if (container) renderHrisSimulator(container);
}

export function renderGymSimulator(container) {
  if (!container) return;
  const state = simState.gym;

  container.innerHTML = `
    <div class="sim-card">
      <div class="sim-header">
        <div class="sim-header-left">
          <span class="sim-badge">LIVE SCANNER &amp; ANALYTICS SANDBOX</span>
          <span class="sim-title">Contactless QR Check-In Terminal</span>
        </div>
        <button type="button" class="sim-btn-reset" onclick="window.resetGymSim()">Clear Session ↺</button>
      </div>

      <div class="gym-sim-grid">
        <!-- Left: Simulated Camera Scan Terminal -->
        <div class="gym-scanner-col">
          <div class="gym-scanner-viewport ${state.lastScan ? ('scan-' + state.lastScan.status.toLowerCase()) : ''}">
            <div class="scanner-laser"></div>
            <div class="scanner-target-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <div class="scanner-status-text">
              ${state.lastScan ? state.lastScan.message : 'Point member QR badge to scan'}
            </div>
          </div>

          <!-- Sample Test Badges -->
          <div class="gym-test-badges-title">// CLICK A SAMPLE MEMBER BADGE TO TEST:</div>
          <div class="gym-test-badges">
            <button type="button" class="gym-badge-btn badge-vip" onclick="window.scanGymMember('denver')">
              <span class="badge-dot dot-green"></span>
              <div class="badge-btn-text">
                <strong>Denver B.</strong>
                <span>VIP Annual · Active Plan</span>
              </div>
            </button>

            <button type="button" class="gym-badge-btn badge-expired" onclick="window.scanGymMember('maria')">
              <span class="badge-dot dot-amber"></span>
              <div class="badge-btn-text">
                <strong>Maria S.</strong>
                <span>Monthly · Expired 2d Ago</span>
              </div>
            </button>

            <button type="button" class="gym-badge-btn badge-walkin" onclick="window.scanGymMember('alex')">
              <span class="badge-dot dot-blue"></span>
              <div class="badge-btn-text">
                <strong>Alex G.</strong>
                <span>Walk-in Day Pass (₱100)</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Right: Live Real-Time Dashboard Stats -->
        <div class="gym-telemetry-col">
          <div class="gym-stats-row">
            <div class="gym-mini-stat">
              <span class="mini-stat-label">Active Inside:</span>
              <span class="mini-stat-val font-mono">${state.activeCheckins} Members</span>
            </div>
            <div class="gym-mini-stat">
              <span class="mini-stat-label">Today's Revenue:</span>
              <span class="mini-stat-val font-mono">₱${state.todayRevenue.toLocaleString()}</span>
            </div>
          </div>

          <div class="gym-log-card">
            <div class="gym-log-title">// REAL-TIME ACCESS LOG (AJAX + MYSQL)</div>
            <div class="gym-log-list">
              ${state.scanLog.map(item => `
                <div class="gym-log-item log-${item.status.toLowerCase()}">
                  <span class="log-time font-mono">${item.time}</span>
                  <span class="log-name">${item.name}</span>
                  <span class="log-type">${item.type}</span>
                  <span class="log-status">${item.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function scanGymMember(memberKey) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (memberKey === 'denver') {
    simState.gym.lastScan = {
      status: 'GRANTED',
      message: 'ACCESS GRANTED: Denver B. (VIP Member)'
    };
    simState.gym.activeCheckins += 1;
    simState.gym.scanLog.unshift({
      time: timeStr,
      name: 'Denver B.',
      type: 'VIP Annual',
      status: 'GRANTED'
    });
    playUiSound('success');
  } else if (memberKey === 'maria') {
    simState.gym.lastScan = {
      status: 'WARNING',
      message: 'ACCESS DENIED: Membership Expired (2 Days Ago)'
    };
    simState.gym.scanLog.unshift({
      time: timeStr,
      name: 'Maria S.',
      type: 'Monthly Plan',
      status: 'EXPIRED'
    });
    playUiSound('warning');
  } else if (memberKey === 'alex') {
    simState.gym.lastScan = {
      status: 'GRANTED',
      message: 'ACCESS GRANTED: POS Receipt #POS-8821 Issued'
    };
    simState.gym.activeCheckins += 1;
    simState.gym.todayRevenue += 100;
    simState.gym.scanLog.unshift({
      time: timeStr,
      name: 'Alex G.',
      type: 'Day Pass (₱100)',
      status: 'GRANTED'
    });
    playUiSound('success');
  }

  // Keep log at max 5 entries
  if (simState.gym.scanLog.length > 5) simState.gym.scanLog.pop();

  const container = document.getElementById('modalSimulatorWrap');
  if (container) renderGymSimulator(container);
}

export function resetGymSim() {
  simState.gym.lastScan = null;
  simState.gym.activeCheckins = 14;
  simState.gym.todayRevenue = 4200;
  simState.gym.scanLog = [
    { time: "08:15 AM", name: "Denver B.", type: "VIP Member", status: "GRANTED" },
    { time: "08:42 AM", name: "Carlos M.", type: "Regular Member", status: "GRANTED" }
  ];
  playUiSound('click');
  const container = document.getElementById('modalSimulatorWrap');
  if (container) renderGymSimulator(container);
}

export function initSimulators() {
  window.renderHrisSimulator = renderHrisSimulator;
  window.advanceHrisSim = advanceHrisSim;
  window.resetHrisSim = resetHrisSim;
  window.renderGymSimulator = renderGymSimulator;
  window.scanGymMember = scanGymMember;
  window.resetGymSim = resetGymSim;
}
