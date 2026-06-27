// Client Portal Functionality Controller

let selectedStars = 5;
let activePayInvoiceId = null;

// Tab View Switcher
function switchView(viewName) {
  document.querySelectorAll('.portal-view').forEach(view => view.classList.remove('active'));
  document.querySelectorAll('.portal-btn').forEach(btn => btn.classList.remove('active'));
  
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) targetView.classList.add('active');
  
  // Activate sidebar button
  const matchingBtn = document.querySelector(`.portal-btn[onclick="switchView('${viewName}')"]`);
  if (matchingBtn) matchingBtn.classList.add('active');

  // Trigger page-specific loads
  if (viewName === 'overview') loadOverview();
  if (viewName === 'bookings') loadBookings();
  if (viewName === 'invoices') loadInvoices();
  if (viewName === 'reports') loadReports();
  if (viewName === 'chat') loadChat();
  if (viewName === 'settings') loadSettings();

  // Close mobile sidebar drawer if open
  document.getElementById('sidebar').classList.remove('open');
}

// Mobile sidebar toggle helper
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function logout() {
  localStorage.removeItem('sparkmate_role');
  window.location.href = 'index.html';
}

// Load Overview Statistics & Next Clean Widget
function loadOverview() {
  const jobs = db.get('jobs') || [];
  const client = db.get('client') || {};
  
  // Metrics
  const completedJobs = jobs.filter(j => j.status === 'completed');
  document.getElementById('stat-total-cleans').textContent = completedJobs.length;
  document.getElementById('stat-points').textContent = client.loyaltyPoints || 0;
  document.getElementById('stat-referrals').textContent = client.referralsCount || 0;
  document.getElementById('stat-sites').textContent = client.sites ? client.sites.length : 0;
  document.getElementById('client-greeting').textContent = client.name || 'Client';

  // Next Job widget
  const upcomingJobs = jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled');
  // Sort upcoming by date ascending
  upcomingJobs.sort((a,b) => new Date(a.date) - new Date(b.date));
  
  const container = document.getElementById('next-job-details');
  if (upcomingJobs.length > 0) {
    const nextJob = upcomingJobs[0];
    
    // Status badges
    let badgeClass = 'btn-secondary';
    if (nextJob.status === 'assigned') badgeClass = 'btn-primary';
    if (nextJob.status === 'in-progress' || nextJob.status === 'active') badgeClass = 'btn-accent';
    
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
        <div>
          <span class="btn ${badgeClass}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 4px; pointer-events: none; margin-bottom: 0.5rem; text-transform: uppercase;">
            ${nextJob.status}
          </span>
          <h4 style="font-size: 1.25rem; margin-top: 0.25rem;">${nextJob.type}</h4>
          <p style="color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem;"><i class="fa-solid fa-location-dot"></i> ${nextJob.address}</p>
        </div>
        <div style="text-align: right;">
          <strong style="font-size: 1.25rem; color: var(--spark-blue); display: block;">${nextJob.time}</strong>
          <span style="font-size: 0.875rem; color: var(--text-light);">${nextJob.date}</span>
        </div>
      </div>
      
      <div class="card" style="background: var(--bg-tertiary); display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem;">
        <div style="width: 42px; height: 42px; background: var(--spark-blue); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
          ${nextJob.cleanerName.charAt(0)}
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-light); display: block;">Assigned Cleaner</span>
          <strong style="color: var(--text-primary);">${nextJob.cleanerName}</strong>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button onclick="rescheduleJob('${nextJob.id}')" class="btn btn-secondary"><i class="fa-solid fa-clock-rotate-left"></i> Reschedule</button>
        <button onclick="cancelJob('${nextJob.id}')" class="btn btn-secondary" style="color: #ef4444;"><i class="fa-solid fa-trash-can"></i> Cancel Clean</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <p style="color: var(--text-secondary); text-align: center; padding: 2rem 0;">No upcoming cleanings scheduled.</p>
      <button onclick="window.location.href='index.html?openBooking=true'" class="btn btn-primary" style="width: 100%;"><i class="fa-solid fa-calendar-plus"></i> Book a Cleaner</button>
    `;
  }

  // Spend analytics total
  let totalSpend = completedJobs.reduce((acc, job) => acc + job.price, 0);
  document.getElementById('spend-analytics-val').textContent = `$${totalSpend.toFixed(2)}`;
}

// Reschedule job wrapper
function rescheduleJob(jobId) {
  const newDate = prompt("Enter new date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
  if (!newDate) return;
  const newTime = prompt("Enter preferred time (e.g. 10:00 AM, 02:00 PM):", "10:00 AM");
  if (!newTime) return;

  const jobs = db.get('jobs') || [];
  const idx = jobs.findIndex(j => j.id === jobId);
  if (idx !== -1) {
    jobs[idx].date = newDate;
    jobs[idx].time = newTime;
    // Broadcast notification
    const notifs = db.get('notifications') || [];
    notifs.push({
      id: 'notif-' + (notifs.length + 1),
      recipient: 'admin',
      type: 'reschedule',
      text: `Client Aayush Kharel rescheduled job ${jobId} to ${newDate} @ ${newTime}.`,
      time: 'Just now'
    });
    db.set('notifications', notifs);
    db.set('jobs', jobs);
    alert('Cleaning rescheduled successfully! No fees applied.');
    loadOverview();
  }
}

// Cancel job wrapper
function cancelJob(jobId) {
  if (!confirm("Are you sure you want to cancel this booking? If you cancel within 24 hours of the scheduled time, a $30 late fee may apply.")) {
    return;
  }
  const jobs = db.get('jobs') || [];
  const idx = jobs.findIndex(j => j.id === jobId);
  if (idx !== -1) {
    jobs[idx].status = 'cancelled';
    
    // Broadcast notification
    const notifs = db.get('notifications') || [];
    notifs.push({
      id: 'notif-' + (notifs.length + 1),
      recipient: 'admin',
      type: 'cancel',
      text: `Client cancelled clean ${jobId}. Refund workflow initialized.`,
      time: 'Just now'
    });
    db.set('notifications', notifs);
    db.set('jobs', jobs);
    alert('Booking cancelled. Any pre-authorized payment has been refunded to your card.');
    loadOverview();
  }
}

// Load Bookings Tab
function loadBookings() {
  const jobs = db.get('jobs') || [];
  const filter = document.getElementById('booking-site-filter').value;
  const container = document.getElementById('bookings-list-container');
  
  // Filter jobs
  let filteredJobs = jobs;
  if (filter !== 'all') {
    filteredJobs = jobs.filter(j => j.siteId === filter);
  }

  // Sort by date descending
  filteredJobs.sort((a,b) => new Date(b.date) - new Date(a.date));

  if (filteredJobs.length === 0) {
    container.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 2rem 0;">No bookings found for this filter.</p>`;
    return;
  }

  container.innerHTML = filteredJobs.map(job => {
    let statusColor = '#94a3b8';
    if (job.status === 'completed') statusColor = 'var(--spark-green)';
    if (job.status === 'assigned') statusColor = 'var(--spark-blue)';
    if (job.status === 'pending') statusColor = '#e2b13c';
    if (job.status === 'cancelled') statusColor = '#ef4444';

    return `
      <div style="border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1.25rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <strong style="font-size: 1.1rem;">${job.type}</strong>
            <span style="font-size: 0.75rem; font-weight: 700; color: white; background: ${statusColor}; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase;">
              ${job.status}
            </span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;"><i class="fa-solid fa-location-dot"></i> ${job.address}</p>
          <span style="font-size: 0.85rem; color: var(--text-light); display: block; margin-top: 0.25rem;">Cleaner: ${job.cleanerName}</span>
        </div>
        <div style="text-align: right; display: flex; flex-direction: column; gap: 0.25rem;">
          <span style="font-weight: 600;">${job.date} @ ${job.time}</span>
          <span style="font-weight: 800; color: var(--spark-blue);">$${job.price.toFixed(2)}</span>
          ${job.status !== 'completed' && job.status !== 'cancelled' ? `
            <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
              <button onclick="rescheduleJob('${job.id}')" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;"><i class="fa-solid fa-edit"></i> Edit</button>
              <button onclick="cancelJob('${job.id}')" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color:#ef4444;"><i class="fa-solid fa-trash"></i> Cancel</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('booking-site-filter').addEventListener('change', loadBookings);

// Load Invoices Tab
function loadInvoices() {
  const invoices = db.get('invoices') || [];
  const jobs = db.get('jobs') || [];
  const tbody = document.getElementById('invoices-list-tbody');
  
  if (invoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem 0; color: var(--text-secondary);">No invoices logged.</td></tr>`;
    return;
  }

  tbody.innerHTML = invoices.map(inv => {
    const matchingJob = jobs.find(j => j.id === inv.jobId);
    const dateStr = matchingJob ? matchingJob.date : inv.date;
    const isPaid = inv.status === 'paid';
    
    return `
      <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.95rem;">
        <td style="padding: 1rem 0.5rem;"><strong>${inv.id}</strong></td>
        <td>${dateStr}</td>
        <td>$${inv.amount.toFixed(2)}</td>
        <td>
          <span style="font-size: 0.75rem; font-weight:700; color:white; background:${isPaid ? 'var(--spark-green)' : '#ef4444'}; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform:uppercase;">
            ${inv.status}
          </span>
        </td>
        <td>${inv.paymentMethod || '—'}</td>
        <td>
          ${isPaid ? `
            <button onclick="alert('Downloading PDF for invoice ${inv.id}...');" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;"><i class="fa-solid fa-download"></i> Receipt</button>
          ` : `
            <button onclick="openPayModal('${inv.id}', ${inv.amount})" class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;"><i class="fa-solid fa-credit-card"></i> Pay Now</button>
          `}
        </td>
      </tr>
    `;
  }).join('');

  // Populate dispute job list selector
  const disputeSelect = document.getElementById('dispute-job-select');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  disputeSelect.innerHTML = completedJobs.map(j => `<option value="${j.id}">${j.type} - ${j.date}</option>`).join('');
}

// Payment Modal Controller
function openPayModal(invId, amount) {
  activePayInvoiceId = invId;
  document.getElementById('pay-inv-id').textContent = invId;
  document.getElementById('pay-inv-amount').textContent = `$${amount.toFixed(2)}`;
  document.getElementById('pay-modal-overlay').style.display = 'flex';
}
function closePayModal() {
  document.getElementById('pay-modal-overlay').style.display = 'none';
  activePayInvoiceId = null;
}
function submitStripePayment() {
  if (!activePayInvoiceId) return;

  const invoices = db.get('invoices') || [];
  const idx = invoices.findIndex(i => i.id === activePayInvoiceId);
  if (idx !== -1) {
    invoices[idx].status = 'paid';
    invoices[idx].paymentMethod = 'Card (•••• 4242)';
    db.set('invoices', invoices);

    // Add loyalty points
    const client = db.get('client') || {};
    client.loyaltyPoints = (client.loyaltyPoints || 0) + Math.round(invoices[idx].amount / 10);
    db.set('client', client);

    // Sync job invoice status
    const jobs = db.get('jobs') || [];
    const jobIdx = jobs.findIndex(j => j.id === invoices[idx].jobId);
    if (jobIdx !== -1) {
      jobs[jobIdx].invoiceStatus = 'paid';
      db.set('jobs', jobs);
    }

    // Add Notification
    const notifs = db.get('notifications') || [];
    notifs.push({
      id: 'notif-' + (notifs.length + 1),
      recipient: 'admin',
      type: 'payment',
      text: `Invoice ${activePayInvoiceId} paid online by Aayush Kharel.`,
      time: 'Just now'
    });
    db.set('notifications', notifs);

    alert('Payment Successful! $100 security hold released. Receipt emailed.');
    closePayModal();
    loadInvoices();
  }
}

// Load Cleaning Reports Tab
function loadReports() {
  const jobs = db.get('jobs') || [];
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const select = document.getElementById('report-job-select');

  if (completedJobs.length === 0) {
    document.getElementById('report-details-container').style.display = 'none';
    select.innerHTML = '<option>No completed cleanings found.</option>';
    return;
  }

  document.getElementById('report-details-container').style.display = 'block';
  select.innerHTML = completedJobs.map(j => `<option value="${j.id}">${j.type} - ${j.date}</option>`).join('');
  
  // Render details for the selected job
  renderSelectedReport(select.value);
}

function renderSelectedReport(jobId) {
  const jobs = db.get('jobs') || [];
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;

  // Render checklist
  const checkContainer = document.getElementById('report-checklist');
  checkContainer.innerHTML = job.checklist.map(item => `
    <div class="check-item ${item.done ? 'done' : 'pending'}">
      <i class="fa-solid ${item.done ? 'fa-circle-check' : 'fa-circle'}"></i>
      <div>
        <span style="font-size: 0.75rem; color: var(--text-light); display:block; text-transform:uppercase;">${item.room}</span>
        <strong>${item.item}</strong>
      </div>
    </div>
  `).join('');

  // Handle rating feedback rendering
  const ratingBox = document.getElementById('rating-widget-box');
  if (job.review) {
    ratingBox.innerHTML = `
      <h4 style="margin-bottom:0.5rem;"><i class="fa-solid fa-circle-check" style="color:var(--spark-green);"></i> Rating Submitted</h4>
      <div style="font-size:1.1rem; color:#f59e0b; margin-bottom: 0.5rem;">
        ${'★'.repeat(job.review.stars)}${'☆'.repeat(5 - job.review.stars)}
      </div>
      <p style="font-style:italic; color:var(--text-secondary); font-size:0.9rem;">"${job.review.comment}"</p>
    `;
  } else {
    // Re-initialize interactive rating selector
    ratingBox.innerHTML = `
      <h4>Leave Rating & Feedback</h4>
      <div class="star-select" id="feedback-stars">
        <i class="fa-solid fa-star" data-star="1"></i>
        <i class="fa-solid fa-star" data-star="2"></i>
        <i class="fa-solid fa-star" data-star="3"></i>
        <i class="fa-solid fa-star" data-star="4"></i>
        <i class="fa-solid fa-star" data-star="5"></i>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="font-size:0.85rem; font-weight:600; display:block; margin-bottom:0.25rem;">Would you recommend SparkMate to others? (NPS Score: 0-10)</label>
        <select id="feedback-nps" style="width: auto;">
          <option value="10">10 - Extremely likely</option>
          <option value="9">9</option>
          <option value="8">8</option>
          <option value="7">7</option>
          <option value="6">6</option>
          <option value="5">5 or lower</option>
        </select>
      </div>
      <div style="margin-bottom: 1rem;">
        <textarea id="feedback-comment" placeholder="Write any specific feedback on Sarah Connor's cleaning..." rows="2"></textarea>
      </div>
      <button onclick="submitJobFeedback()" class="btn btn-accent"><i class="fa-solid fa-check"></i> Submit Feedback</button>
    `;
    initStarsSelector();
  }
}

document.getElementById('report-job-select').addEventListener('change', (e) => {
  renderSelectedReport(e.target.value);
});

// Before-After photo comparison slide effect
const baRange = document.getElementById('ba-range');
const baAfter = document.querySelector('.ba-after');
const baDivider = document.getElementById('ba-divider');

baRange.addEventListener('input', (e) => {
  const percentage = e.target.value;
  baAfter.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
  baDivider.style.left = `${percentage}%`;
});

// Interactive Stars Selector logic
function initStarsSelector() {
  const stars = document.querySelectorAll('#feedback-stars i');
  stars.forEach(star => {
    // hover visual feedback
    star.addEventListener('mouseover', () => {
      const val = parseInt(star.dataset.star);
      stars.forEach(s => {
        if (parseInt(s.dataset.star) <= val) {
          s.style.color = '#f59e0b';
        } else {
          s.style.color = '#cbd5e1';
        }
      });
    });
    // restore on mouse leave
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => {
        if (parseInt(s.dataset.star) <= selectedStars) {
          s.style.color = '#f59e0b';
        } else {
          s.style.color = '#cbd5e1';
        }
      });
    });
    // click trigger
    star.addEventListener('click', () => {
      selectedStars = parseInt(star.dataset.star);
      stars.forEach(s => {
        if (parseInt(s.dataset.star) <= selectedStars) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });
}

function submitJobFeedback() {
  const jobId = document.getElementById('report-job-select').value;
  const comment = document.getElementById('feedback-comment').value;
  const nps = parseInt(document.getElementById('feedback-nps').value);

  const jobs = db.get('jobs') || [];
  const idx = jobs.findIndex(j => j.id === jobId);
  if (idx !== -1) {
    jobs[idx].review = {
      stars: selectedStars,
      comment: comment || 'Awesome clean!',
      nps: nps,
      date: new Date().toISOString().split('T')[0]
    };
    db.set('jobs', jobs);

    // Update staff rating average
    const cleanerId = jobs[idx].cleanerId;
    if (cleanerId) {
      const staffList = db.get('staff') || [];
      const staffIdx = staffList.findIndex(s => s.id === cleanerId);
      if (staffIdx !== -1) {
        // Calculate new rating average
        const cleanerJobs = jobs.filter(j => j.cleanerId === cleanerId && j.review);
        const totalStars = cleanerJobs.reduce((sum, j) => sum + j.review.stars, 0);
        staffList[staffIdx].rating = parseFloat((totalStars / cleanerJobs.length).toFixed(1));
        db.set('staff', staffList);
      }
    }

    // Add notification for Admin
    const notifs = db.get('notifications') || [];
    notifs.push({
      id: 'notif-' + (notifs.length + 1),
      recipient: 'admin',
      type: 'rating',
      text: `Client rated job ${jobId} with ${selectedStars} stars. NPS: ${nps}.`,
      time: 'Just now'
    });
    db.set('notifications', notifs);

    alert('Feedback submitted. Thank you for your response!');
    renderSelectedReport(jobId);
  }
}

function downloadMockPDF() {
  alert('PDF summary compiled! Receipt PDF downloading (simulated in-browser print format).');
}

// Load Chat Tab
function loadChat() {
  const chatHistory = db.get('support_chat') || [];
  const container = document.getElementById('chat-messages-container');
  
  container.innerHTML = chatHistory.map(msg => `
    <div class="chat-bubble ${msg.sender}">
      ${msg.text}
      <span style="font-size: 0.65rem; display: block; text-align: right; opacity: 0.7; margin-top: 0.2rem;">${msg.time}</span>
    </div>
  `).join('');

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
  const input = document.getElementById('chat-user-input');
  const val = input.value.trim();
  if (!val) return;

  const chatHistory = db.get('support_chat') || [];
  chatHistory.push({
    sender: 'client',
    text: val,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  db.set('support_chat', chatHistory);
  input.value = '';
  loadChat();

  // Simulate automated supervisor support response
  setTimeout(() => {
    const replies = [
      "Hi Aayush, thanks for reaching out. I've flagged this message to Sarah Connor. She'll get back to you shortly.",
      "Hello! I am Sparky, your automated support supervisor. An agent will be available in 3 minutes to handle your query.",
      "I have updated your request notes for tomorrow's booking. Let us know if you need anything else!"
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    
    const chatHistoryAsync = db.get('support_chat') || [];
    chatHistoryAsync.push({
      sender: 'admin',
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    db.set('support_chat', chatHistoryAsync);
    
    // Play alert sound/badge
    const chatBadge = document.getElementById('chat-badge');
    if (chatBadge && document.getElementById('view-chat').style.display !== 'block') {
      chatBadge.style.display = 'inline-block';
    }
    
    loadChat();
  }, 1200);
}

// Load Settings Tab
function loadSettings() {
  const client = db.get('client') || {};
  document.getElementById('profile-name').value = client.name || '';
  document.getElementById('profile-email').value = client.email || '';
  document.getElementById('profile-phone').value = client.phone || '';

  // Render registered sites list
  const sitesContainer = document.getElementById('settings-sites-list');
  if (client.sites) {
    sitesContainer.innerHTML = client.sites.map(site => `
      <div class="card" style="margin-bottom: 1rem; background: var(--bg-tertiary); padding: 1rem;">
        <div class="flex-between">
          <strong>${site.nickname}</strong>
          <button onclick="editSiteCode('${site.id}')" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;"><i class="fa-solid fa-key"></i> Edit Access Code</button>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">Address: ${site.address}</p>
        <span style="font-size: 0.8rem; background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 0.2rem 0.5rem; border-radius: 4px; display: inline-block; margin-top: 0.5rem;">
          <i class="fa-solid fa-lock" style="color: var(--spark-blue);"></i> Entry code: <code>${site.accessCode}</code>
        </span>
      </div>
    `).join('');
  }
}

function updateClientProfile() {
  const client = db.get('client') || {};
  client.name = document.getElementById('profile-name').value;
  client.email = document.getElementById('profile-email').value;
  client.phone = document.getElementById('profile-phone').value;
  
  db.set('client', client);
  alert('Profile updated successfully!');
  loadOverview();
}

function editSiteCode(siteId) {
  const client = db.get('client') || {};
  const siteIdx = client.sites.findIndex(s => s.id === siteId);
  if (siteIdx !== -1) {
    const currentCode = client.sites[siteIdx].accessCode;
    const newCode = prompt("Enter new door access code / key location details:", currentCode);
    if (newCode) {
      client.sites[siteIdx].accessCode = newCode;
      db.set('client', client);
      alert('Access details updated securely! Synced to staff portal.');
      loadSettings();
    }
  }
}

// Global page initialization
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in and has valid role
  const role = localStorage.getItem('sparkmate_role');
  if (!role || role !== 'client') {
    window.location.href = 'login.html';
    return;
  }

  // Sync tab view initially
  loadOverview();
  
  // Real-time synchronization callback across tabs
  db.onSync(() => {
    console.log('Synchronizing Client portal state...');
    loadOverview();
    if (document.getElementById('view-bookings').classList.contains('active')) loadBookings();
    if (document.getElementById('view-invoices').classList.contains('active')) loadInvoices();
    if (document.getElementById('view-reports').classList.contains('active')) loadReports();
    if (document.getElementById('view-chat').classList.contains('active')) loadChat();
  });
});

// Expose module functions globally
window.switchView = switchView;
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.loadOverview = loadOverview;
window.rescheduleJob = rescheduleJob;
window.cancelJob = cancelJob;
window.loadBookings = loadBookings;
window.loadInvoices = loadInvoices;
window.openPayModal = openPayModal;
window.closePayModal = closePayModal;
window.submitStripePayment = submitStripePayment;
window.loadReports = loadReports;
window.renderSelectedReport = renderSelectedReport;
window.submitJobFeedback = submitJobFeedback;
window.downloadMockPDF = downloadMockPDF;
window.loadChat = loadChat;
window.sendChatMessage = sendChatMessage;
window.loadSettings = loadSettings;
window.updateClientProfile = updateClientProfile;
window.editSiteCode = editSiteCode;
