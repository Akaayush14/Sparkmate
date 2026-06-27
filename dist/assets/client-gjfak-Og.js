import"./app-DaXCS0Su.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";let m=5,p=null;function I(e){document.querySelectorAll(".portal-view").forEach(o=>o.classList.remove("active")),document.querySelectorAll(".portal-btn").forEach(o=>o.classList.remove("active"));const n=document.getElementById(`view-${e}`);n&&n.classList.add("active");const t=document.querySelector(`.portal-btn[onclick="switchView('${e}')"]`);t&&t.classList.add("active"),e==="overview"&&r(),e==="bookings"&&g(),e==="invoices"&&y(),e==="reports"&&v(),e==="chat"&&u(),e==="settings"&&h(),document.getElementById("sidebar").classList.remove("open")}function $(){document.getElementById("sidebar").classList.toggle("open")}function E(){localStorage.removeItem("sparkmate_role"),window.location.href="index.html"}function r(){const e=db.get("jobs")||[],n=db.get("client")||{},t=e.filter(a=>a.status==="completed");document.getElementById("stat-total-cleans").textContent=t.length,document.getElementById("stat-points").textContent=n.loyaltyPoints||0,document.getElementById("stat-referrals").textContent=n.referralsCount||0,document.getElementById("stat-sites").textContent=n.sites?n.sites.length:0,document.getElementById("client-greeting").textContent=n.name||"Client";const o=e.filter(a=>a.status!=="completed"&&a.status!=="cancelled");o.sort((a,d)=>new Date(a.date)-new Date(d.date));const s=document.getElementById("next-job-details");if(o.length>0){const a=o[0];let d="btn-secondary";a.status==="assigned"&&(d="btn-primary"),(a.status==="in-progress"||a.status==="active")&&(d="btn-accent"),s.innerHTML=`
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
        <div>
          <span class="btn ${d}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 4px; pointer-events: none; margin-bottom: 0.5rem; text-transform: uppercase;">
            ${a.status}
          </span>
          <h4 style="font-size: 1.25rem; margin-top: 0.25rem;">${a.type}</h4>
          <p style="color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem;"><i class="fa-solid fa-location-dot"></i> ${a.address}</p>
        </div>
        <div style="text-align: right;">
          <strong style="font-size: 1.25rem; color: var(--spark-blue); display: block;">${a.time}</strong>
          <span style="font-size: 0.875rem; color: var(--text-light);">${a.date}</span>
        </div>
      </div>
      
      <div class="card" style="background: var(--bg-tertiary); display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem;">
        <div style="width: 42px; height: 42px; background: var(--spark-blue); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
          ${a.cleanerName.charAt(0)}
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-light); display: block;">Assigned Cleaner</span>
          <strong style="color: var(--text-primary);">${a.cleanerName}</strong>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button onclick="rescheduleJob('${a.id}')" class="btn btn-secondary"><i class="fa-solid fa-clock-rotate-left"></i> Reschedule</button>
        <button onclick="cancelJob('${a.id}')" class="btn btn-secondary" style="color: #ef4444;"><i class="fa-solid fa-trash-can"></i> Cancel Clean</button>
      </div>
    `}else s.innerHTML=`
      <p style="color: var(--text-secondary); text-align: center; padding: 2rem 0;">No upcoming cleanings scheduled.</p>
      <button onclick="window.location.href='index.html?openBooking=true'" class="btn btn-primary" style="width: 100%;"><i class="fa-solid fa-calendar-plus"></i> Book a Cleaner</button>
    `;let i=t.reduce((a,d)=>a+d.price,0);document.getElementById("spend-analytics-val").textContent=`$${i.toFixed(2)}`}function B(e){const n=prompt("Enter new date (YYYY-MM-DD):",new Date().toISOString().split("T")[0]);if(!n)return;const t=prompt("Enter preferred time (e.g. 10:00 AM, 02:00 PM):","10:00 AM");if(!t)return;const o=db.get("jobs")||[],s=o.findIndex(i=>i.id===e);if(s!==-1){o[s].date=n,o[s].time=t;const i=db.get("notifications")||[];i.push({id:"notif-"+(i.length+1),recipient:"admin",type:"reschedule",text:`Client Aayush Kharel rescheduled job ${e} to ${n} @ ${t}.`,time:"Just now"}),db.set("notifications",i),db.set("jobs",o),alert("Cleaning rescheduled successfully! No fees applied."),r()}}function S(e){if(!confirm("Are you sure you want to cancel this booking? If you cancel within 24 hours of the scheduled time, a $30 late fee may apply."))return;const n=db.get("jobs")||[],t=n.findIndex(o=>o.id===e);if(t!==-1){n[t].status="cancelled";const o=db.get("notifications")||[];o.push({id:"notif-"+(o.length+1),recipient:"admin",type:"cancel",text:`Client cancelled clean ${e}. Refund workflow initialized.`,time:"Just now"}),db.set("notifications",o),db.set("jobs",n),alert("Booking cancelled. Any pre-authorized payment has been refunded to your card."),r()}}function g(){const e=db.get("jobs")||[],n=document.getElementById("booking-site-filter").value,t=document.getElementById("bookings-list-container");let o=e;if(n!=="all"&&(o=e.filter(s=>s.siteId===n)),o.sort((s,i)=>new Date(i.date)-new Date(s.date)),o.length===0){t.innerHTML='<p style="color: var(--text-secondary); text-align: center; padding: 2rem 0;">No bookings found for this filter.</p>';return}t.innerHTML=o.map(s=>{let i="#94a3b8";return s.status==="completed"&&(i="var(--spark-green)"),s.status==="assigned"&&(i="var(--spark-blue)"),s.status==="pending"&&(i="#e2b13c"),s.status==="cancelled"&&(i="#ef4444"),`
      <div style="border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1.25rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <strong style="font-size: 1.1rem;">${s.type}</strong>
            <span style="font-size: 0.75rem; font-weight: 700; color: white; background: ${i}; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase;">
              ${s.status}
            </span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;"><i class="fa-solid fa-location-dot"></i> ${s.address}</p>
          <span style="font-size: 0.85rem; color: var(--text-light); display: block; margin-top: 0.25rem;">Cleaner: ${s.cleanerName}</span>
        </div>
        <div style="text-align: right; display: flex; flex-direction: column; gap: 0.25rem;">
          <span style="font-weight: 600;">${s.date} @ ${s.time}</span>
          <span style="font-weight: 800; color: var(--spark-blue);">$${s.price.toFixed(2)}</span>
          ${s.status!=="completed"&&s.status!=="cancelled"?`
            <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
              <button onclick="rescheduleJob('${s.id}')" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;"><i class="fa-solid fa-edit"></i> Edit</button>
              <button onclick="cancelJob('${s.id}')" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color:#ef4444;"><i class="fa-solid fa-trash"></i> Cancel</button>
            </div>
          `:""}
        </div>
      </div>
    `}).join("")}document.getElementById("booking-site-filter").addEventListener("change",g);function y(){const e=db.get("invoices")||[],n=db.get("jobs")||[],t=document.getElementById("invoices-list-tbody");if(e.length===0){t.innerHTML='<tr><td colspan="6" style="text-align:center; padding: 2rem 0; color: var(--text-secondary);">No invoices logged.</td></tr>';return}t.innerHTML=e.map(i=>{const a=n.find(l=>l.id===i.jobId),d=a?a.date:i.date,c=i.status==="paid";return`
      <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.95rem;">
        <td style="padding: 1rem 0.5rem;"><strong>${i.id}</strong></td>
        <td>${d}</td>
        <td>$${i.amount.toFixed(2)}</td>
        <td>
          <span style="font-size: 0.75rem; font-weight:700; color:white; background:${c?"var(--spark-green)":"#ef4444"}; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform:uppercase;">
            ${i.status}
          </span>
        </td>
        <td>${i.paymentMethod||"—"}</td>
        <td>
          ${c?`
            <button onclick="alert('Downloading PDF for invoice ${i.id}...');" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;"><i class="fa-solid fa-download"></i> Receipt</button>
          `:`
            <button onclick="openPayModal('${i.id}', ${i.amount})" class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;"><i class="fa-solid fa-credit-card"></i> Pay Now</button>
          `}
        </td>
      </tr>
    `}).join("");const o=document.getElementById("dispute-job-select"),s=n.filter(i=>i.status==="completed");o.innerHTML=s.map(i=>`<option value="${i.id}">${i.type} - ${i.date}</option>`).join("")}function C(e,n){p=e,document.getElementById("pay-inv-id").textContent=e,document.getElementById("pay-inv-amount").textContent=`$${n.toFixed(2)}`,document.getElementById("pay-modal-overlay").style.display="flex"}function w(){document.getElementById("pay-modal-overlay").style.display="none",p=null}function L(){if(!p)return;const e=db.get("invoices")||[],n=e.findIndex(t=>t.id===p);if(n!==-1){e[n].status="paid",e[n].paymentMethod="Card (•••• 4242)",db.set("invoices",e);const t=db.get("client")||{};t.loyaltyPoints=(t.loyaltyPoints||0)+Math.round(e[n].amount/10),db.set("client",t);const o=db.get("jobs")||[],s=o.findIndex(a=>a.id===e[n].jobId);s!==-1&&(o[s].invoiceStatus="paid",db.set("jobs",o));const i=db.get("notifications")||[];i.push({id:"notif-"+(i.length+1),recipient:"admin",type:"payment",text:`Invoice ${p} paid online by Aayush Kharel.`,time:"Just now"}),db.set("notifications",i),alert("Payment Successful! $100 security hold released. Receipt emailed."),w(),y()}}function v(){const n=(db.get("jobs")||[]).filter(o=>o.status==="completed"),t=document.getElementById("report-job-select");if(n.length===0){document.getElementById("report-details-container").style.display="none",t.innerHTML="<option>No completed cleanings found.</option>";return}document.getElementById("report-details-container").style.display="block",t.innerHTML=n.map(o=>`<option value="${o.id}">${o.type} - ${o.date}</option>`).join(""),b(t.value)}function b(e){const t=(db.get("jobs")||[]).find(i=>i.id===e);if(!t)return;const o=document.getElementById("report-checklist");o.innerHTML=t.checklist.map(i=>`
    <div class="check-item ${i.done?"done":"pending"}">
      <i class="fa-solid ${i.done?"fa-circle-check":"fa-circle"}"></i>
      <div>
        <span style="font-size: 0.75rem; color: var(--text-light); display:block; text-transform:uppercase;">${i.room}</span>
        <strong>${i.item}</strong>
      </div>
    </div>
  `).join("");const s=document.getElementById("rating-widget-box");t.review?s.innerHTML=`
      <h4 style="margin-bottom:0.5rem;"><i class="fa-solid fa-circle-check" style="color:var(--spark-green);"></i> Rating Submitted</h4>
      <div style="font-size:1.1rem; color:#f59e0b; margin-bottom: 0.5rem;">
        ${"★".repeat(t.review.stars)}${"☆".repeat(5-t.review.stars)}
      </div>
      <p style="font-style:italic; color:var(--text-secondary); font-size:0.9rem;">"${t.review.comment}"</p>
    `:(s.innerHTML=`
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
    `,j())}document.getElementById("report-job-select").addEventListener("change",e=>{b(e.target.value)});const M=document.getElementById("ba-range"),z=document.querySelector(".ba-after"),P=document.getElementById("ba-divider");M.addEventListener("input",e=>{const n=e.target.value;z.style.clipPath=`polygon(0 0, ${n}% 0, ${n}% 100%, 0 100%)`,P.style.left=`${n}%`});function j(){const e=document.querySelectorAll("#feedback-stars i");e.forEach(n=>{n.addEventListener("mouseover",()=>{const t=parseInt(n.dataset.star);e.forEach(o=>{parseInt(o.dataset.star)<=t?o.style.color="#f59e0b":o.style.color="#cbd5e1"})}),n.addEventListener("mouseleave",()=>{e.forEach(t=>{parseInt(t.dataset.star)<=m?t.style.color="#f59e0b":t.style.color="#cbd5e1"})}),n.addEventListener("click",()=>{m=parseInt(n.dataset.star),e.forEach(t=>{parseInt(t.dataset.star)<=m?t.classList.add("active"):t.classList.remove("active")})})})}function J(){const e=document.getElementById("report-job-select").value,n=document.getElementById("feedback-comment").value,t=parseInt(document.getElementById("feedback-nps").value),o=db.get("jobs")||[],s=o.findIndex(i=>i.id===e);if(s!==-1){o[s].review={stars:m,comment:n||"Awesome clean!",nps:t,date:new Date().toISOString().split("T")[0]},db.set("jobs",o);const i=o[s].cleanerId;if(i){const d=db.get("staff")||[],c=d.findIndex(l=>l.id===i);if(c!==-1){const l=o.filter(f=>f.cleanerId===i&&f.review),x=l.reduce((f,k)=>f+k.review.stars,0);d[c].rating=parseFloat((x/l.length).toFixed(1)),db.set("staff",d)}}const a=db.get("notifications")||[];a.push({id:"notif-"+(a.length+1),recipient:"admin",type:"rating",text:`Client rated job ${e} with ${m} stars. NPS: ${t}.`,time:"Just now"}),db.set("notifications",a),alert("Feedback submitted. Thank you for your response!"),b(e)}}function T(){alert("PDF summary compiled! Receipt PDF downloading (simulated in-browser print format).")}function u(){const e=db.get("support_chat")||[],n=document.getElementById("chat-messages-container");n.innerHTML=e.map(t=>`
    <div class="chat-bubble ${t.sender}">
      ${t.text}
      <span style="font-size: 0.65rem; display: block; text-align: right; opacity: 0.7; margin-top: 0.2rem;">${t.time}</span>
    </div>
  `).join(""),n.scrollTop=n.scrollHeight}function H(){const e=document.getElementById("chat-user-input"),n=e.value.trim();if(!n)return;const t=db.get("support_chat")||[];t.push({sender:"client",text:n,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}),db.set("support_chat",t),e.value="",u(),setTimeout(()=>{const o=["Hi Aayush, thanks for reaching out. I've flagged this message to Sarah Connor. She'll get back to you shortly.","Hello! I am Sparky, your automated support supervisor. An agent will be available in 3 minutes to handle your query.","I have updated your request notes for tomorrow's booking. Let us know if you need anything else!"],s=o[Math.floor(Math.random()*o.length)],i=db.get("support_chat")||[];i.push({sender:"admin",text:s,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}),db.set("support_chat",i);const a=document.getElementById("chat-badge");a&&document.getElementById("view-chat").style.display!=="block"&&(a.style.display="inline-block"),u()},1200)}function h(){const e=db.get("client")||{};document.getElementById("profile-name").value=e.name||"",document.getElementById("profile-email").value=e.email||"",document.getElementById("profile-phone").value=e.phone||"";const n=document.getElementById("settings-sites-list");e.sites&&(n.innerHTML=e.sites.map(t=>`
      <div class="card" style="margin-bottom: 1rem; background: var(--bg-tertiary); padding: 1rem;">
        <div class="flex-between">
          <strong>${t.nickname}</strong>
          <button onclick="editSiteCode('${t.id}')" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;"><i class="fa-solid fa-key"></i> Edit Access Code</button>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">Address: ${t.address}</p>
        <span style="font-size: 0.8rem; background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 0.2rem 0.5rem; border-radius: 4px; display: inline-block; margin-top: 0.5rem;">
          <i class="fa-solid fa-lock" style="color: var(--spark-blue);"></i> Entry code: <code>${t.accessCode}</code>
        </span>
      </div>
    `).join(""))}function A(){const e=db.get("client")||{};e.name=document.getElementById("profile-name").value,e.email=document.getElementById("profile-email").value,e.phone=document.getElementById("profile-phone").value,db.set("client",e),alert("Profile updated successfully!"),r()}function D(e){const n=db.get("client")||{},t=n.sites.findIndex(o=>o.id===e);if(t!==-1){const o=n.sites[t].accessCode,s=prompt("Enter new door access code / key location details:",o);s&&(n.sites[t].accessCode=s,db.set("client",n),alert("Access details updated securely! Synced to staff portal."),h())}}document.addEventListener("DOMContentLoaded",()=>{r(),db.onSync(()=>{console.log("Synchronizing Client portal state..."),r(),document.getElementById("view-bookings").classList.contains("active")&&g(),document.getElementById("view-invoices").classList.contains("active")&&y(),document.getElementById("view-reports").classList.contains("active")&&v(),document.getElementById("view-chat").classList.contains("active")&&u()})});window.switchView=I;window.toggleSidebar=$;window.logout=E;window.loadOverview=r;window.rescheduleJob=B;window.cancelJob=S;window.loadBookings=g;window.loadInvoices=y;window.openPayModal=C;window.closePayModal=w;window.submitStripePayment=L;window.loadReports=v;window.renderSelectedReport=b;window.submitJobFeedback=J;window.downloadMockPDF=T;window.loadChat=u;window.sendChatMessage=H;window.loadSettings=h;window.updateClientProfile=A;window.editSiteCode=D;
