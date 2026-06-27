// Admin Portal Functionality Controller

let revenueChart = null;
let npsChart = null;
let kpiChart = null;

// Tab View Switcher
function switchAdminView(viewName) {
  document.querySelectorAll('.portal-view').forEach(view => view.classList.remove('active'));
  document.querySelectorAll('.portal-btn').forEach(btn => btn.classList.remove('active'));
  
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) targetView.classList.add('active');
  
  // Activate sidebar button
  const matchingBtn = document.querySelector(`.portal-btn[onclick="switchAdminView('${viewName}')"]`);
  if (matchingBtn) matchingBtn.classList.add('active');

  // Trigger page-specific loads
  if (viewName === 'dashboard') loadDashboard();
  if (viewName === 'dispatch') loadDispatchBoard();
  if (viewName === 'staff') loadStaffRoster();
  if (viewName === 'billing') loadBillingLedger();
  if (viewName === 'inventory') loadInventory();
  if (viewName === 'analytics') initAnalyticsCharts();

  // Close mobile sidebar drawer if open
  document.getElementById('sidebar').classList.remove('open');
}

// Mobile sidebar helper
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function logout() {
  localStorage.removeItem('sparkmate_role');
  window.location.href = 'index.html';
}

// Load Dashboard Panel
async function loadDashboard() {
  const jobs = await db.get('jobs') || [];
  const staff = await db.get('staff') || [];
  const notifs = await db.get('notifications') || [];

  // Metrics
  const activeCleans = jobs.filter(j => j.status === 'in-progress' || j.status === 'active').length;
  const totalRevenue = jobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + j.price, 0);
  
  // Admin alerts count
  const adminNotifs = notifs.filter(n => n.recipient === 'admin');

  document.getElementById('stat-active-jobs').textContent = activeCleans;
  document.getElementById('stat-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
  document.getElementById('stat-rating').textContent = '--';
  document.getElementById('stat-alerts').textContent = adminNotifs.length;

  // Render Alerts List
  const alertContainer = document.getElementById('alerts-list-container');
  if (adminNotifs.length === 0) {
    alertContainer.innerHTML = `<p style="text-align:center; padding: 2rem 0; font-size:0.85rem; color:var(--text-light);">No warnings in inbox.</p>`;
  } else {
    alertContainer.innerHTML = adminNotifs.map(n => `
      <div class="alert-item ${n.type === 'late' ? 'late' : ''}">
        <div>
          <strong style="font-size:0.85rem; display:block;">${n.text}</strong>
          <span style="font-size:0.75rem; color:var(--text-light);">${n.time}</span>
        </div>
        <button onclick="dismissAlert('${n.id}')" style="background:none; border:none; cursor:pointer; color:var(--text-light);"><i class="fa-solid fa-circle-check" style="font-size:1.15rem;"></i></button>
      </div>
    `).join('');
  }

  // Render Live map pins
  renderLiveMapPins(staff, jobs);
}

async function dismissAlert(notifId) {
  let notifs = await db.get('notifications') || [];
  notifs = notifs.filter(n => n.id !== notifId);
  await db.set('notifications', notifs);
  loadDashboard();
}

async function clearAllAlerts() {
  let notifs = await db.get('notifications') || [];
  notifs = notifs.filter(n => n.recipient !== 'admin');
  await db.set('notifications', notifs);
  loadDashboard();
}

// Render Live GPS Map Pins
function renderLiveMapPins(staff, jobs) {
  const mapElement = document.getElementById('ops-map');
  // Clear existing pins but keep grid/labels
  const existingPins = mapElement.querySelectorAll('.map-pin');
  existingPins.forEach(p => p.remove());

  // Render Staff locations
  // We can calculate virtual offsets based on coordinate grid bounding boxes
  // bounding box NY: Lat: [40.700, 40.730], Lng: [-74.015, -73.990]
  staff.forEach(person => {
    const latPct = ((person.coords.lat - 40.700) / 0.030) * 100;
    const lngPct = ((person.coords.lng + 74.015) / 0.025) * 100;

    // Pin position ratios (clip map container bound values)
    const topPct = Math.max(5, Math.min(95, 100 - latPct));
    const leftPct = Math.max(5, Math.min(95, lngPct));

    const pin = document.createElement('div');
    pin.className = 'map-pin';
    pin.style.top = `${topPct}%`;
    pin.style.left = `${leftPct}%`;
    
    // Check if staff has active clock job running
    const hasActiveJob = person.status === 'active';

    pin.innerHTML = `
      <div class="pin-head ${hasActiveJob ? 'active' : ''}">
        <i class="fa-solid fa-broom"></i>
      </div>
      <div class="pin-label">${person.name} (${person.status})</div>
    `;

    pin.addEventListener('click', () => {
      alert(`Staff: ${person.name}\nSpeed: Fast\nPhone: ${person.phone}`);
    });

    mapElement.appendChild(pin);
  });
}

// Dispatch Emergency cleanup
async function dispatchUrgentClean() {
  const address = prompt("Enter Emergency Clean Address:", "789 Corporate Plaza, New York, NY 10019");
  if (!address) return;

  const jobs = await db.get('jobs') || [];
  const newId = 'job-' + (jobs.length + 101);
  const urgentJob = {
    id: newId,
    clientId: 'client-1',
    clientName: 'Aayush Kharel',
    siteId: 'site-1',
    address: address,
    accessCode: 'KEY-BOX-901',
    date: new Date().toISOString().split('T')[0],
    time: 'ASAP Urgent',
    duration: '2 hours',
    type: 'Deep Clean',
    price: 240, // premium price
    status: 'pending',
    cleanerId: null,
    cleanerName: 'Auto Assigning',
    checklist: [
      { id: 't1', room: 'All Zones', item: 'Deep sanitization and sweeping', done: false }
    ],
    photos: { before: [], after: [] },
    review: null,
    invoiceStatus: 'unpaid'
  };

  jobs.push(urgentJob);
  await db.set('jobs', jobs);
  
  // Alert admin
  alert('Emergency cleanup logged. Job dispatched to scheduler.');
  loadDashboard();
}

// Load Dispatch Board Lanes
async function loadDispatchBoard() {
  const jobs = await db.get('jobs') || [];
  const staff = await db.get('staff') || [];

  const laneUnassigned = document.getElementById('lane-unassigned');
  const laneAssigned = document.getElementById('lane-assigned');
  const laneActive = document.getElementById('lane-active');

  const unassignedJobs = jobs.filter(j => j.status === 'pending' || !j.cleanerId);
  const assignedJobs = jobs.filter(j => j.status === 'assigned' && j.cleanerId);
  const activeJobs = jobs.filter(j => j.status === 'in-progress' || j.status === 'completed');

  const renderCard = (job) => `
    <div class="dispatch-card">
      <strong style="display:block; font-size: 0.95rem;">${job.type}</strong>
      <span style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-bottom: 0.5rem;"><i class="fa-solid fa-location-dot"></i> ${job.address.split(',')[0]}</span>
      
      <div style="font-size:0.8rem; background:var(--bg-tertiary); padding: 0.4rem; border-radius:4px; margin-bottom: 0.5rem;">
        <div>Date: <strong>${job.date}</strong></div>
        <div>Time: <strong>${job.time}</strong></div>
      </div>
      
      <div style="margin-top:0.5rem;">
        <label style="font-size:0.75rem; font-weight:600; display:block; margin-bottom:0.25rem;">Assign Cleaner:</label>
        <select onchange="reassignDispatchJob('${job.id}', this.value)" style="padding:0.25rem 0.5rem; font-size:0.8rem;">
          <option value="">Choose Staff...</option>
          ${staff.map(s => `<option value="${s.id}" ${job.cleanerId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
      </div>
    </div>
  `;

  laneUnassigned.innerHTML = unassignedJobs.length === 0 
    ? '<p style="font-size:0.8rem; color:var(--text-light); text-align:center;">No unassigned cleans.</p>'
    : unassignedJobs.map(renderCard).join('');

  laneAssigned.innerHTML = assignedJobs.length === 0 
    ? '<p style="font-size:0.8rem; color:var(--text-light); text-align:center;">No pending scheduled cleans.</p>'
    : assignedJobs.map(renderCard).join('');

  laneActive.innerHTML = activeJobs.length === 0 
    ? '<p style="font-size:0.8rem; color:var(--text-light); text-align:center;">No active cleans.</p>'
    : activeJobs.map(job => `
      <div class="dispatch-card" style="border-left:4px solid ${job.status === 'completed' ? 'var(--spark-green)' : '#328cc1'}">
        <div class="flex-between">
          <strong style="font-size: 0.95rem;">${job.type}</strong>
          <span style="font-size:0.7rem; font-weight:700; color:white; background:${job.status === 'completed' ? 'var(--spark-green)' : 'var(--spark-blue)'}; padding:0.15rem 0.35rem; border-radius:3px; text-transform:uppercase;">
            ${job.status}
          </span>
        </div>
        <span style="font-size:0.75rem; color:var(--text-secondary); display:block; margin: 0.25rem 0 0.5rem;"><i class="fa-solid fa-location-dot"></i> ${job.address.split(',')[0]}</span>
        <span style="font-size:0.8rem; font-weight:600; display:block;">Cleaner: ${job.cleanerName}</span>
      </div>
    `).join('');
}

async function reassignDispatchJob(jobId, cleanerId) {
  const jobs = await db.get('jobs') || [];
  const staff = await db.get('staff') || [];
  
  const jobIdx = jobs.findIndex(j => j.id === jobId);
  if (jobIdx !== -1) {
    if (!cleanerId) {
      jobs[jobIdx].cleanerId = null;
      jobs[jobIdx].cleanerName = 'Auto Assigning';
      jobs[jobIdx].status = 'pending';
    } else {
      const cleaner = staff.find(s => s.id === cleanerId);
      jobs[jobIdx].cleanerId = cleanerId;
      jobs[jobIdx].cleanerName = cleaner ? cleaner.name : 'Cleaner';
      jobs[jobIdx].status = 'assigned';
    }
    await db.set('jobs', jobs);

    // Notify client
    const notifs = await db.get('notifications') || [];
    notifs.push({
      id: 'notif-' + (notifs.length + 1),
      recipient: 'client',
      type: 'info',
      text: `Your upcoming clean has been assigned to ${jobs[jobIdx].cleanerName}.`,
      time: 'Just now'
    });
    await db.set('notifications', notifs);

    alert('Cleaner assigned successfully!');
    loadDispatchBoard();
  }
}

// Load Staff CRM
async function loadStaffRoster() {
  const staff = await db.get('staff') || [];
  const users = await db.get('users') || [];
  const tbody = document.getElementById('staff-crm-tbody');
  
  tbody.innerHTML = staff.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.jobsCompleted} completed</td>
      <td>
        <span style="font-size:0.75rem; font-weight:700; color:white; background:${s.status === 'active' ? 'var(--spark-green)' : 'var(--spark-blue)'}; padding:0.2rem 0.5rem; border-radius:4px; text-transform:uppercase;">
          ${s.status}
        </span>
      </td>
      <td>
        <button onclick="alert('Viewing onboarding document folder for DBS check...');" class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;"><i class="fa-solid fa-folder-open"></i> Docs</button>
      </td>
    </tr>
  `).join('');

  // Load pending approvals
  const pendingApprovals = users.filter(u => u.role === 'staff' && !u.approved);
  const pendingContainer = document.getElementById('pending-approvals-container');
  
  if (pendingApprovals.length === 0) {
    pendingContainer.innerHTML = '<p style="text-align:center; padding: 1rem 0; font-size:0.85rem; color:var(--text-light);">No pending staff approvals.</p>';
  } else {
    pendingContainer.innerHTML = pendingApprovals.map(u => `
      <div class="card" style="padding:1rem; margin-bottom:1rem;">
        <div class="flex-between" style="margin-bottom:0.5rem;">
          <div>
            <h4 style="margin-bottom:0.25rem;">${u.name}</h4>
            <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.25rem;"><i class="fa-solid fa-envelope"></i> ${u.email}</p>
            <p style="font-size:0.8rem; color:var(--text-secondary);"><i class="fa-solid fa-phone"></i> ${u.phone}</p>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button onclick="approveStaff('${u.uid}')" class="btn btn-accent" style="padding:0.5rem 0.75rem;"><i class="fa-solid fa-check"></i> Approve</button>
            <button onclick="rejectStaff('${u.uid}')" class="btn btn-danger" style="padding:0.5rem 0.75rem;"><i class="fa-solid fa-times"></i> Reject</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Load Payroll ledger
  const payrollTbody = document.getElementById('payroll-tbody');
  const jobs = await db.get('jobs') || [];

  payrollTbody.innerHTML = staff.map(s => {
    const completions = jobs.filter(j => j.cleanerId === s.id && j.status === 'completed');
    const baseWages = completions.reduce((acc, job) => acc + (job.price * 0.65), 0);
    const net = baseWages;
    
    return `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td>${completions.length * 2.5} hours</td>
        <td>$${baseWages.toFixed(2)}</td>
        <td>+$0.00</td>
        <td><strong style="color:var(--spark-green);">$${net.toFixed(2)}</strong></td>
        <td>
          <button onclick="alert('Payout transfer of $${net.toFixed(2)} initialized to bank account on file.');" class="btn btn-primary" style="padding:0.3rem 0.6rem; font-size:0.75rem;"><i class="fa-solid fa-paper-plane"></i> Release Pay</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function approveStaff(uid) {
  const users = await db.get('users') || [];
  const user = users.find(u => u.uid === uid);
  
  if (user) {
    // Update user's approved status in Firestore
    await db.updateUser(uid, { approved: true });
    
    // Add to staff list
    const staff = await db.get('staff') || [];
    const newStaffId = 'staff-' + (staff.length + 1);
    staff.push({
      id: newStaffId,
      name: user.name,
      jobsCompleted: 0,
      phone: user.phone,
      status: 'available',
      coords: { lat: 40.7100 + (Math.random() * 0.02), lng: -74.0050 + (Math.random() * 0.02) },
      avatar: user.name.split(' ').map(n => n.charAt(0)).join(''),
      bio: 'Newly approved SparkMate cleaning professional.'
    });
    
    await db.set('staff', staff);
    
    alert(`Staff approved successfully!\n\nOnce the staff member has verified their email, they will be able to log in.`);
    
    loadStaffRoster();
  }
}

async function rejectStaff(uid) {
  if (!confirm('Are you sure you want to reject this staff application?')) return;
  
  // For now, we'll just remove from cache/localStorage. In a real app, you'd delete from Firestore.
  const users = await db.get('users') || [];
  const filteredUsers = users.filter(u => u.uid !== uid);
  await db.set('users', filteredUsers);
  
  alert('Staff application rejected.');
  loadStaffRoster();
}

function onboardStaffMember() {
  const name = document.getElementById('ob-name').value;
  const phone = document.getElementById('ob-phone').value;
  const dbs = document.getElementById('ob-dbs').checked;
  const idChecked = document.getElementById('ob-id').checked;
  const trained = document.getElementById('ob-training').checked;

  if (!dbs || !idChecked) {
    alert("Warning: Staff compliance documents (ID Verification & DBS Background check) must be flagged valid before onboarding cleaner.");
    return;
  }

  const staff = db.get('staff') || [];
  const newId = 'staff-' + (staff.length + 1);
  staff.push({
    id: newId,
    name: name,
    rating: 5.0,
    jobsCompleted: 0,
    phone: phone,
    status: 'available',
    coords: { lat: 40.7100 + (Math.random() * 0.02), lng: -74.0050 + (Math.random() * 0.02) },
    avatar: name.split(' ').map(n => n.charAt(0)).join(''),
    bio: 'Newly onboarded SparkMate compliance professional.'
  });

  db.set('staff', staff);
  alert(`Onboarded successfully! Cleaner ${name} registered on portal dispatcher.`);
  document.getElementById('ob-name').value = '';
  document.getElementById('ob-phone').value = '';
  loadStaffRoster();
}

// Load Billing ledger
function loadBillingLedger() {
  const invoices = db.get('invoices') || [];
  const tbody = document.getElementById('admin-billing-tbody');

  if (invoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem 0; color:var(--text-secondary);">No invoice histories.</td></tr>`;
    return;
  }

  tbody.innerHTML = invoices.map(inv => {
    const isPaid = inv.status === 'paid';
    return `
      <tr>
        <td><strong>${inv.id}</strong></td>
        <td>Aayush Kharel</td>
        <td>$${inv.amount.toFixed(2)}</td>
        <td>${inv.date}</td>
        <td>
          <span style="font-size:0.75rem; font-weight:700; color:white; background:${isPaid ? 'var(--spark-green)' : '#ef4444'}; padding:0.2rem 0.5rem; border-radius:4px; text-transform:uppercase;">
            ${inv.status}
          </span>
        </td>
        <td>
          <button onclick="alert('Sending invoice reminder email to client...');" class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;"><i class="fa-solid fa-envelope"></i> Send Reminder</button>
        </td>
      </tr>
    `;
  }).join('');
}

function compileCorporateQuote() {
  const clientName = document.getElementById('quote-client').value;
  const size = parseInt(document.getElementById('quote-size').value);
  const freq = parseInt(document.getElementById('quote-freq').value);

  // estimate base cost
  const rate = size * 0.04 * freq;
  alert(`Corporate Proposal Built!\nClient: ${clientName}\nEstimated monthly rate: $${rate.toFixed(2)}/mo.\nContract PDF drafted successfully.`);
  document.getElementById('quote-client').value = '';
}

// Load Inventory list
function loadInventory() {
  const inventory = db.get('inventory') || [];
  const tbody = document.getElementById('inventory-tbody');

  tbody.innerHTML = inventory.map(item => {
    const isLow = item.qty < item.minQty;
    return `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td>${item.qty} units</td>
        <td>${item.minQty} units</td>
        <td>${item.supplier}</td>
        <td>
          <span style="font-size:0.75rem; font-weight:700; color:white; background:${isLow ? '#ef4444' : 'var(--spark-green)'}; padding:0.2rem 0.5rem; border-radius:4px; text-transform:uppercase;">
            ${item.status}
          </span>
        </td>
        <td>
          <button onclick="orderStockItem('${item.id}')" class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;"><i class="fa-solid fa-truck-pickup"></i> Order Restock</button>
        </td>
      </tr>
    `;
  }).join('');
}

function orderStockItem(itemId) {
  const inventory = db.get('inventory') || [];
  const idx = inventory.findIndex(i => i.id === itemId);
  if (idx !== -1) {
    inventory[idx].qty += 25;
    inventory[idx].status = 'good';
    db.set('inventory', inventory);
    alert('Stock ordered successfully! Replenished 25 units.');
    loadInventory();
  }
}

function triggerAutoRestock() {
  const inventory = db.get('inventory') || [];
  inventory.forEach(item => {
    if (item.qty < item.minQty) {
      item.qty += 20;
      item.status = 'good';
    }
  });
  db.set('inventory', inventory);
  alert('Auto-restock process triggered. All low stock suppliers notified.');
  loadInventory();
}

// Analytics Charts (Chart.js implementation)
function initAnalyticsCharts() {
  const ctxRev = document.getElementById('chart-revenue').getContext('2d');
  const ctxNps = document.getElementById('chart-nps').getContext('2d');
  const ctxKpis = document.getElementById('chart-kpis').getContext('2d');

  // Destroy existing charts to prevent canvas leakage on rebuild
  if (revenueChart) revenueChart.destroy();
  if (npsChart) npsChart.destroy();
  if (kpiChart) kpiChart.destroy();

  // Create Revenue Chart
  revenueChart = new Chart(ctxRev, {
    type: 'line',
    data: {
      labels: ['March', 'April', 'May', 'June'],
      datasets: [{
        label: 'Gross Profit Monthly Trend ($)',
        data: [1800, 3100, 4800, 5950],
        borderColor: '#328cc1',
        backgroundColor: 'rgba(50, 140, 193, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // Create NPS Chart
  npsChart = new Chart(ctxNps, {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Current'],
      datasets: [{
        label: 'Net Promoter Score (Target: >85)',
        data: [82, 88, 92],
        backgroundColor: ['#0b3c5d', '#328cc1', '#7db93c'],
        borderRadius: 6
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // Create Staff speed KPI Chart
  kpiChart = new Chart(ctxKpis, {
    type: 'radar',
    data: {
      labels: ['Punctuality', 'Speed efficiency', 'Detail quality', 'Customer review avg', 'SOP Compliance'],
      datasets: [
        {
          label: 'Sarah Connor (Sarah)',
          data: [95, 90, 98, 98, 100],
          borderColor: '#7db93c',
          backgroundColor: 'rgba(125, 185, 60, 0.2)'
        },
        {
          label: 'Marcus Wright (Marcus)',
          data: [90, 95, 88, 94, 90],
          borderColor: '#328cc1',
          backgroundColor: 'rgba(50, 140, 193, 0.2)'
        }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// Global page initialization
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in and has valid role
  const role = localStorage.getItem('sparkmate_role');
  if (!role || role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  loadDashboard();
  
  // Real-time synchronization callback across tabs
  db.onSync(() => {
    console.log('Synchronizing Admin portal state...');
    loadDashboard();
    if (document.getElementById('view-dispatch').classList.contains('active')) loadDispatchBoard();
    if (document.getElementById('view-staff').classList.contains('active')) loadStaffRoster();
    if (document.getElementById('view-billing').classList.contains('active')) loadBillingLedger();
    if (document.getElementById('view-inventory').classList.contains('active')) loadInventory();
    if (document.getElementById('view-analytics').classList.contains('active')) initAnalyticsCharts();
  });
});

// Expose module functions globally
window.switchAdminView = switchAdminView;
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.loadDashboard = loadDashboard;
window.dismissAlert = dismissAlert;
window.clearAllAlerts = clearAllAlerts;
window.renderLiveMapPins = renderLiveMapPins;
window.dispatchUrgentClean = dispatchUrgentClean;
window.loadDispatchBoard = loadDispatchBoard;
window.reassignDispatchJob = reassignDispatchJob;
window.loadStaffRoster = loadStaffRoster;
window.approveStaff = approveStaff;
window.rejectStaff = rejectStaff;
window.onboardStaffMember = onboardStaffMember;
window.loadBillingLedger = loadBillingLedger;
window.compileCorporateQuote = compileCorporateQuote;
window.loadInventory = loadInventory;
window.orderStockItem = orderStockItem;
window.triggerAutoRestock = triggerAutoRestock;
window.initAnalyticsCharts = initAnalyticsCharts;
