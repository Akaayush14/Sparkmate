// Staff Portal Functionality Controller

let activeCleanerId = 'staff-1';
let activeClockJobId = null;
let clockSeconds = 0;
let clockInterval = null;
let gpsBypassEnabled = false;

// Mock Upload State
let uploadedBeforePhotos = [];
let uploadedAfterPhotos = [];

// Switch Navigation Tabs
function switchStaffTab(tabName) {
  document.querySelectorAll('.mobile-body').forEach(view => view.style.display = 'none');
  document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));

  const view = document.getElementById(`staff-view-${tabName}`);
  if (view) view.style.display = 'block';

  const btn = document.querySelector(`.nav-tab-btn[onclick="switchStaffTab('${tabName}')"]`);
  if (btn) btn.classList.add('active');

  if (tabName === 'jobs') loadStaffJobs();
  if (tabName === 'earnings') loadStaffEarnings();
  if (tabName === 'profile') loadStaffProfile();
}

// Switch Active acting cleaner (Demo convenience)
document.getElementById('staff-cleaner-selector').addEventListener('change', (e) => {
  activeCleanerId = e.target.value;
  // Reset any active clock tracking to prevent leaking
  if (activeClockJobId) {
    clearInterval(clockInterval);
    activeClockJobId = null;
  }
  loadStaffJobs();
  loadStaffEarnings();
  loadStaffProfile();
});

// Load Active Cleaner Profile
function loadStaffProfile() {
  const staffList = db.get('staff') || [];
  const cleaner = staffList.find(s => s.id === activeCleanerId);
  if (cleaner) {
    document.getElementById('profile-avatar').textContent = cleaner.avatar;
    document.getElementById('profile-name-display').textContent = cleaner.name;
  }
}

// Proximity bypass simulator toggle
function simulateGPSLocation() {
  gpsBypassEnabled = !gpsBypassEnabled;
  alert(gpsBypassEnabled ? "GPS Geofencing Proximity Bypass: ENABLED. You can clock in from any simulated coordinates." : "GPS Geofencing: LOCKED. Proximity check will execute.");
}

// Load Jobs list for active cleaner
function loadStaffJobs() {
  const jobs = db.get('jobs') || [];
  const cleanerJobs = jobs.filter(j => j.cleanerId === activeCleanerId);
  const container = document.getElementById('staff-jobs-list-container');
  const detailsBox = document.getElementById('staff-active-job-detail');
  
  // Hide active details initially
  detailsBox.style.display = 'none';
  container.style.display = 'block';

  // Sort upcoming jobs
  const activeJobs = cleanerJobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled');

  if (activeJobs.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding:3rem 0; color:var(--text-secondary);">No scheduled jobs remaining for today.</p>`;
    return;
  }

  container.innerHTML = activeJobs.map(job => {
    let statusBadge = '';
    if (job.status === 'assigned') statusBadge = `<span style="background:var(--spark-blue); color:white; font-size:0.7rem; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700;">ASSIGNED</span>`;
    if (job.status === 'in-progress' || job.status === 'active') statusBadge = `<span style="background:var(--spark-green); color:white; font-size:0.7rem; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700; animation:pulse 1.5s infinite;">ACTIVE</span>`;

    return `
      <div class="job-card" onclick="openStaffJobDetails('${job.id}')">
        <div class="flex-between">
          <strong>${job.type}</strong>
          ${statusBadge}
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
          <i class="fa-solid fa-location-dot"></i> ${job.address.split(',')[0]}
        </div>
        <div class="flex-between" style="font-size: 0.8rem; color: var(--text-light); margin-top: 0.5rem;">
          <span>Schedule: ${job.date}</span>
          <span>Time: <strong>${job.time}</strong></span>
        </div>
      </div>
    `;
  }).join('');
}

// Expand specific job details
function openStaffJobDetails(jobId) {
  const jobs = db.get('jobs') || [];
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;

  const container = document.getElementById('staff-jobs-list-container');
  const detailsBox = document.getElementById('staff-active-job-detail');
  
  container.style.display = 'none';
  detailsBox.style.display = 'block';

  // Check if this job is currently clocked in
  const isClockedIn = activeClockJobId === jobId;

  detailsBox.innerHTML = `
    <button onclick="closeStaffJobDetails()" class="btn btn-secondary" style="padding:0.4rem 0.75rem; font-size:0.8rem; margin-bottom: 1rem;"><i class="fa-solid fa-chevron-left"></i> Back to Schedule</button>
    
    <div class="card" style="padding: 1.25rem; margin-bottom: 1rem;">
      <h3 style="font-size: 1.25rem;">${job.type}</h3>
      <p style="color:var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem;"><i class="fa-solid fa-location-dot"></i> ${job.address}</p>
      
      <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--border-color); font-size:0.85rem;">
        <div style="margin-bottom:0.4rem;"><strong>Access Info:</strong> <code>${job.accessCode}</code></div>
        <div><strong>Notes:</strong> <span style="color:var(--text-secondary); font-style:italic;">"${job.notes || 'No custom guidelines provided.'}"</span></div>
      </div>
      
      <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <button onclick="notifyClientOnWay('${job.id}')" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem;"><i class="fa-solid fa-bell"></i> Notify "On the Way"</button>
        <button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(job.address)}')" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem;"><i class="fa-solid fa-compass"></i> Navigate Map</button>
      </div>
    </div>

    <!-- Clock Widget -->
    <div class="card" style="text-align: center; margin-bottom: 1rem;">
      ${!isClockedIn ? `
        <h4>Arrived on Premises?</h4>
        <p style="font-size:0.8rem; color:var(--text-light); margin-bottom: 0.75rem;">GPS coordinate lock and QR scanner verification required to clock-in.</p>
        <button onclick="initiateClockIn('${job.id}')" class="btn btn-primary" style="width: 100%; justify-content: center;"><i class="fa-solid fa-right-to-bracket"></i> Clock In & Start Clean</button>
      ` : `
        <h4 style="color:var(--spark-green);"><i class="fa-solid fa-spinner fa-spin"></i> Clean in Progress</h4>
        <div class="timer-badge" id="clock-in-timer" style="display:block;">00:00:00</div>
        
        <!-- Checklist section inside active clean -->
        <div style="text-align:left; border-top:1px solid var(--border-color); padding-top:1rem; margin-top: 1rem;">
          <h4 style="font-size:0.95rem; margin-bottom: 0.5rem;">Cleaning checklist:</h4>
          <div id="staff-checklist-inputs">
            ${job.checklist.map((item, index) => `
              <div class="checklist-row">
                <label for="task-${index}">
                  <input type="checkbox" id="task-${index}" ${item.done ? 'checked' : ''} onchange="toggleStaffTask('${job.id}', ${index}, this.checked)">
                  <span>${item.item}</span>
                </label>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Before After Upload simulator -->
        <div style="text-align:left; margin-top: 1.25rem;">
          <h4 style="font-size:0.95rem; margin-bottom: 0.5rem;">Visual Proof (Before / After Photos):</h4>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
            <button onclick="simulatePhotoSnap('before')" class="btn btn-secondary" style="font-size:0.8rem; padding:0.5rem; justify-content:center;" id="btn-snap-before">
              ${uploadedBeforePhotos.length > 0 ? '<i class="fa-solid fa-check" style="color:var(--spark-green);"></i> Before Snap' : '<i class="fa-solid fa-camera"></i> Before Photo'}
            </button>
            <button onclick="simulatePhotoSnap('after')" class="btn btn-secondary" style="font-size:0.8rem; padding:0.5rem; justify-content:center;" id="btn-snap-after">
              ${uploadedAfterPhotos.length > 0 ? '<i class="fa-solid fa-check" style="color:var(--spark-green);"></i> After Snap' : '<i class="fa-solid fa-camera"></i> After Photo'}
            </button>
          </div>
        </div>

        <!-- Issue reporting -->
        <button onclick="reportActiveIssue('${job.id}')" class="btn btn-secondary" style="width: 100%; font-size: 0.8rem; margin-top: 1.25rem; color:#ef4444; border-color:rgba(239, 68, 68, 0.3);"><i class="fa-solid fa-circle-exclamation"></i> Flag Issue / Low Supply</button>

        <button onclick="completeClockOut('${job.id}')" class="btn btn-accent" style="width: 100%; justify-content: center; margin-top: 1.25rem; font-size: 1.1rem;"><i class="fa-solid fa-right-from-bracket"></i> Clock Out & Submit Clean</button>
      `}
    </div>
  `;

  // Start visual clock update if clocked in
  if (isClockedIn) {
    updateTimerText();
  }
}

function closeStaffJobDetails() {
  document.getElementById('staff-jobs-list-container').style.display = 'block';
  document.getElementById('staff-active-job-detail').style.display = 'none';
}

function notifyClientOnWay(jobId) {
  const notifs = db.get('notifications') || [];
  const staffList = db.get('staff') || [];
  const cleaner = staffList.find(s => s.id === activeCleanerId);
  const name = cleaner ? cleaner.name : 'Your cleaner';

  notifs.push({
    id: 'notif-' + (notifs.length + 1),
    recipient: 'client',
    type: 'alert',
    text: `${name} is on the way to New York HQ Office. ETA: 12 minutes.`,
    time: 'Just now'
  });
  db.set('notifications', notifs);
  alert('Notification sent to client: "On the way!"');
}

// Clock-in flow with QR scanning
function initiateClockIn(jobId) {
  // 1. Proximity Geofencing validation check
  if (!gpsBypassEnabled) {
    // Simulate finding GPS
    const confirmGPS = confirm("Validating GPS Geofence...\nSimulated location found: 123 Broadway, NY. Proximity match 100%. Proceed to QR scanner?");
    if (!confirmGPS) return;
  }

  // 2. Open QR Code overlay dialog
  const qrOverlay = document.getElementById('staff-qr-overlay');
  qrOverlay.style.display = 'flex';

  // Simulate automatic camera recognize after 1.5s
  setTimeout(() => {
    if (qrOverlay.style.display === 'flex') {
      qrOverlay.style.display = 'none';
      alert('QR Code Scanned successfully! Building check-in timestamp validated.');
      triggerClockInSuccess(jobId);
    }
  }, 1600);
}

function cancelQRScan() {
  document.getElementById('staff-qr-overlay').style.display = 'none';
}

function triggerClockInSuccess(jobId) {
  activeClockJobId = jobId;
  clockSeconds = 0;
  
  // Set job status in database to 'in-progress'
  const jobs = db.get('jobs') || [];
  const idx = jobs.findIndex(j => j.id === jobId);
  if (idx !== -1) {
    jobs[idx].status = 'in-progress';
    db.set('jobs', jobs);
  }

  // Create timer loop
  clockInterval = setInterval(() => {
    clockSeconds++;
    updateTimerText();
  }, 1000);

  // Notify admin
  const notifs = db.get('notifications') || [];
  notifs.push({
    id: 'notif-' + (notifs.length + 1),
    recipient: 'admin',
    type: 'clockin',
    text: `Sarah Connor clocked in at New York HQ Office. Clean active.`,
    time: 'Just now'
  });
  db.set('notifications', notifs);

  // Reset photo states
  uploadedBeforePhotos = [];
  uploadedAfterPhotos = [];

  // Re-draw job details
  openStaffJobDetails(jobId);
}

function updateTimerText() {
  const timerLabel = document.getElementById('clock-in-timer');
  if (!timerLabel) return;
  
  const hrs = Math.floor(clockSeconds / 3600);
  const mins = Math.floor((clockSeconds % 3600) / 60);
  const secs = clockSeconds % 60;
  
  const pad = (num) => num.toString().padStart(2, '0');
  timerLabel.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

function toggleStaffTask(jobId, taskIdx, isChecked) {
  const jobs = db.get('jobs') || [];
  const idx = jobs.findIndex(j => j.id === jobId);
  if (idx !== -1) {
    jobs[idx].checklist[taskIdx].done = isChecked;
    db.set('jobs', jobs);
  }
}

// Photo snappers using file upload to Firebase Storage
function simulatePhotoSnap(stage) {
  const fileInput = document.getElementById(`input-photo-${stage}`);
  if (!fileInput) return;
  
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const overlay = document.getElementById('upload-loading-overlay');
    const progressText = document.getElementById('upload-progress-text');
    if (overlay) {
      overlay.style.display = 'flex';
      if (progressText) progressText.textContent = `Uploading ${stage} photo to cloud...`;
    }
    
    try {
      const url = await db.uploadPhoto(activeClockJobId || 'job-102', stage, file);
      if (stage === 'before') {
        uploadedBeforePhotos = [url];
        const btn = document.getElementById('btn-snap-before');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-check" style="color:var(--spark-green);"></i> Before Snap';
      } else {
        uploadedAfterPhotos = [url];
        const btn = document.getElementById('btn-snap-after');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-check" style="color:var(--spark-green);"></i> After Snap';
      }
      alert(`${stage.charAt(0).toUpperCase() + stage.slice(1)} photo uploaded and synchronized successfully.`);
    } catch (err) {
      console.error(err);
      alert("Cloud upload failed. Bypassing with simulated upload.");
    } finally {
      if (overlay) overlay.style.display = 'none';
      fileInput.value = ''; // Reset input
    }
  };
  
  fileInput.click();
}

function reportActiveIssue(jobId) {
  const desc = prompt("Describe supply alert or cleaning obstacle:");
  if (desc) {
    const notifs = db.get('notifications') || [];
    notifs.push({
      id: 'notif-' + (notifs.length + 1),
      recipient: 'admin',
      type: 'late',
      text: `Sarah Connor logged anomaly at job ${jobId}: "${desc}"`,
      time: 'Just now'
    });
    db.set('notifications', notifs);
    alert('Issue flagged to Admin desk. Keep working if safe.');
  }
}

// Clock out and submit
function completeClockOut(jobId) {
  // Validate checklist completed
  const jobs = db.get('jobs') || [];
  const idx = jobs.findIndex(j => j.id === jobId);
  if (idx === -1) return;

  const incompleteTasks = jobs[idx].checklist.filter(item => !item.done);
  if (incompleteTasks.length > 0) {
    if (!confirm(`You have ${incompleteTasks.length} checklist items unchecked. Are you sure you want to clock out?`)) {
      return;
    }
  }

  if (uploadedBeforePhotos.length === 0 || uploadedAfterPhotos.length === 0) {
    alert("Warning: Before and After photo proofs are required to log compliance reports.");
    return;
  }

  // Clear clock timer
  clearInterval(clockInterval);
  activeClockJobId = null;

  // Update job in local database
  jobs[idx].status = 'completed';
  jobs[idx].photos = {
    before: uploadedBeforePhotos,
    after: uploadedAfterPhotos
  };
  
  // Set checklist completed if not ticked to force neat reports
  jobs[idx].checklist.forEach(t => t.done = true);
  db.set('jobs', jobs);

  // Update staff statistics completions count
  const staffList = db.get('staff') || [];
  const staffIdx = staffList.findIndex(s => s.id === activeCleanerId);
  if (staffIdx !== -1) {
    staffList[staffIdx].jobsCompleted = (staffList[staffIdx].jobsCompleted || 0) + 1;
    db.set('staff', staffList);
  }

  // Notify client and admin
  const notifs = db.get('notifications') || [];
  notifs.push({
    id: 'notif-' + (notifs.length + 1),
    recipient: 'client',
    type: 'invoice',
    text: `Job completed! Sarah Connor uploaded 2 photos and checked checklist. Invoice INV-099 is ready.`,
    time: 'Just now'
  });
  notifs.push({
    id: 'notif-' + (notifs.length + 2),
    recipient: 'admin',
    type: 'clockout',
    text: `Sarah Connor clocked out of New York HQ Office. Time clocked: 2.5 hours.`,
    time: 'Just now'
  });
  db.set('notifications', notifs);

  alert('Clean completed! Job reports compiled and sent to client database. Great job!');
  loadStaffJobs();
}

// Load Earnings Ledger Tab
function loadStaffEarnings() {
  const jobs = db.get('jobs') || [];
  const cleanerJobs = jobs.filter(j => j.cleanerId === activeCleanerId && j.status === 'completed');
  
  // Calculate earnings total
  // Staff pay rate = 65% of job pricing contract
  let totalEarnings = cleanerJobs.reduce((acc, job) => acc + (job.price * 0.65), 0);
  let hours = cleanerJobs.length * 2.5; // average duration

  document.getElementById('earnings-weekly-total').textContent = `$${totalEarnings.toFixed(2)}`;
  document.getElementById('earnings-hours-worked').textContent = `${hours} hrs logged from ${cleanerJobs.length} completions`;

  // Rating bonuses are not implemented yet
  document.getElementById('earnings-bonus-count').textContent = `0 cleans (+$0.00)`;

  const ledger = document.getElementById('completed-jobs-ledger');
  if (cleanerJobs.length === 0) {
    ledger.innerHTML = `<p style="text-align:center; font-size:0.85rem; padding: 2rem 0; color:var(--text-light);">No completed jobs registered this week.</p>`;
    return;
  }

  ledger.innerHTML = cleanerJobs.map(job => `
    <div style="border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding:0.75rem 1rem; display:flex; justify-content:space-between; align-items:center; background:var(--bg-secondary);">
      <div>
        <strong style="font-size:0.9rem;">${job.type}</strong>
        <span style="font-size:0.75rem; color:var(--text-light); display:block;">${job.date}</span>
      </div>
      <div style="text-align:right;">
        <strong style="color:var(--spark-green); font-size:1.05rem;">+$${(job.price * 0.65).toFixed(2)}</strong>
        <span style="font-size:0.7rem; color:var(--text-light); display:block;">(Base: $${job.price})</span>
      </div>
    </div>
  `).join('');
}

function triggerSOS() {
  alert('SOS BROADCAST SENT!\nDistress alert, GPS coordinates, and safety protocol dispatched to all area supervisors.');
}

// Global page initialization
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in and has valid role
  const role = localStorage.getItem('sparkmate_role');
  if (!role || role !== 'staff') {
    window.location.href = 'login.html';
    return;
  }

  // Also check if staff is approved
  const users = db.get('users') || [];
  const staffUser = users.find(u => u.role === 'staff' && u.approved);
  if (!staffUser) {
    alert('Your staff account is pending approval.');
    window.location.href = 'login.html';
    return;
  }

  loadStaffJobs();
  
  // Real-time synchronization callback across tabs
  db.onSync(() => {
    console.log('Synchronizing Staff portal state...');
    // Only reload job list if not currently clocked in (to avoid resetting checked ticks visually)
    if (!activeClockJobId) {
      loadStaffJobs();
    }
    if (document.getElementById('staff-view-earnings').style.display === 'block') loadStaffEarnings();
    if (document.getElementById('staff-view-profile').style.display === 'block') loadStaffProfile();
  });
});

// Expose module functions globally
window.switchStaffTab = switchStaffTab;
window.simulateGPSLocation = simulateGPSLocation;
window.loadStaffJobs = loadStaffJobs;
window.openStaffJobDetails = openStaffJobDetails;
window.closeStaffJobDetails = closeStaffJobDetails;
window.notifyClientOnWay = notifyClientOnWay;
window.initiateClockIn = initiateClockIn;
window.cancelQRScan = cancelQRScan;
window.triggerClockInSuccess = triggerClockInSuccess;
window.toggleStaffTask = toggleStaffTask;
window.simulatePhotoSnap = simulatePhotoSnap;
window.reportActiveIssue = reportActiveIssue;
window.completeClockOut = completeClockOut;
window.loadStaffEarnings = loadStaffEarnings;
window.triggerSOS = triggerSOS;
