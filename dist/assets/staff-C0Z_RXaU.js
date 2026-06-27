import"./app-DaXCS0Su.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";let d="staff-1",r=null,f=0,y=null,g=!1,m=[],p=[];function w(o){document.querySelectorAll(".mobile-body").forEach(a=>a.style.display="none"),document.querySelectorAll(".nav-tab-btn").forEach(a=>a.classList.remove("active"));const e=document.getElementById(`staff-view-${o}`);e&&(e.style.display="block");const t=document.querySelector(`.nav-tab-btn[onclick="switchStaffTab('${o}')"]`);t&&t.classList.add("active"),o==="jobs"&&c(),o==="earnings"&&u(),o==="profile"&&b()}document.getElementById("staff-cleaner-selector").addEventListener("change",o=>{d=o.target.value,r&&(clearInterval(y),r=null),c(),u(),b()});function b(){const e=(db.get("staff")||[]).find(t=>t.id===d);e&&(document.getElementById("profile-avatar").textContent=e.avatar,document.getElementById("profile-name-display").textContent=e.name,document.getElementById("profile-rating").innerHTML=`<i class="fa-solid fa-star"></i> ${e.rating} (${e.jobsCompleted} completed)`)}function S(){g=!g,alert(g?"GPS Geofencing Proximity Bypass: ENABLED. You can clock in from any simulated coordinates.":"GPS Geofencing: LOCKED. Proximity check will execute.")}function c(){const e=(db.get("jobs")||[]).filter(n=>n.cleanerId===d),t=document.getElementById("staff-jobs-list-container"),a=document.getElementById("staff-active-job-detail");a.style.display="none",t.style.display="block";const s=e.filter(n=>n.status!=="completed"&&n.status!=="cancelled");if(s.length===0){t.innerHTML='<p style="text-align:center; padding:3rem 0; color:var(--text-secondary);">No scheduled jobs remaining for today.</p>';return}t.innerHTML=s.map(n=>{let i="";return n.status==="assigned"&&(i='<span style="background:var(--spark-blue); color:white; font-size:0.7rem; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700;">ASSIGNED</span>'),(n.status==="in-progress"||n.status==="active")&&(i='<span style="background:var(--spark-green); color:white; font-size:0.7rem; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700; animation:pulse 1.5s infinite;">ACTIVE</span>'),`
      <div class="job-card" onclick="openStaffJobDetails('${n.id}')">
        <div class="flex-between">
          <strong>${n.type}</strong>
          ${i}
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
          <i class="fa-solid fa-location-dot"></i> ${n.address.split(",")[0]}
        </div>
        <div class="flex-between" style="font-size: 0.8rem; color: var(--text-light); margin-top: 0.5rem;">
          <span>Schedule: ${n.date}</span>
          <span>Time: <strong>${n.time}</strong></span>
        </div>
      </div>
    `}).join("")}function h(o){const t=(db.get("jobs")||[]).find(i=>i.id===o);if(!t)return;const a=document.getElementById("staff-jobs-list-container"),s=document.getElementById("staff-active-job-detail");a.style.display="none",s.style.display="block";const n=r===o;s.innerHTML=`
    <button onclick="closeStaffJobDetails()" class="btn btn-secondary" style="padding:0.4rem 0.75rem; font-size:0.8rem; margin-bottom: 1rem;"><i class="fa-solid fa-chevron-left"></i> Back to Schedule</button>
    
    <div class="card" style="padding: 1.25rem; margin-bottom: 1rem;">
      <h3 style="font-size: 1.25rem;">${t.type}</h3>
      <p style="color:var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem;"><i class="fa-solid fa-location-dot"></i> ${t.address}</p>
      
      <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--border-color); font-size:0.85rem;">
        <div style="margin-bottom:0.4rem;"><strong>Access Info:</strong> <code>${t.accessCode}</code></div>
        <div><strong>Notes:</strong> <span style="color:var(--text-secondary); font-style:italic;">"${t.notes||"No custom guidelines provided."}"</span></div>
      </div>
      
      <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <button onclick="notifyClientOnWay('${t.id}')" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem;"><i class="fa-solid fa-bell"></i> Notify "On the Way"</button>
        <button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(t.address)}')" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem;"><i class="fa-solid fa-compass"></i> Navigate Map</button>
      </div>
    </div>

    <!-- Clock Widget -->
    <div class="card" style="text-align: center; margin-bottom: 1rem;">
      ${n?`
        <h4 style="color:var(--spark-green);"><i class="fa-solid fa-spinner fa-spin"></i> Clean in Progress</h4>
        <div class="timer-badge" id="clock-in-timer" style="display:block;">00:00:00</div>
        
        <!-- Checklist section inside active clean -->
        <div style="text-align:left; border-top:1px solid var(--border-color); padding-top:1rem; margin-top: 1rem;">
          <h4 style="font-size:0.95rem; margin-bottom: 0.5rem;">Cleaning checklist:</h4>
          <div id="staff-checklist-inputs">
            ${t.checklist.map((i,l)=>`
              <div class="checklist-row">
                <label for="task-${l}">
                  <input type="checkbox" id="task-${l}" ${i.done?"checked":""} onchange="toggleStaffTask('${t.id}', ${l}, this.checked)">
                  <span>${i.item}</span>
                </label>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Before After Upload simulator -->
        <div style="text-align:left; margin-top: 1.25rem;">
          <h4 style="font-size:0.95rem; margin-bottom: 0.5rem;">Visual Proof (Before / After Photos):</h4>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
            <button onclick="simulatePhotoSnap('before')" class="btn btn-secondary" style="font-size:0.8rem; padding:0.5rem; justify-content:center;" id="btn-snap-before">
              ${m.length>0?'<i class="fa-solid fa-check" style="color:var(--spark-green);"></i> Before Snap':'<i class="fa-solid fa-camera"></i> Before Photo'}
            </button>
            <button onclick="simulatePhotoSnap('after')" class="btn btn-secondary" style="font-size:0.8rem; padding:0.5rem; justify-content:center;" id="btn-snap-after">
              ${p.length>0?'<i class="fa-solid fa-check" style="color:var(--spark-green);"></i> After Snap':'<i class="fa-solid fa-camera"></i> After Photo'}
            </button>
          </div>
        </div>

        <!-- Issue reporting -->
        <button onclick="reportActiveIssue('${t.id}')" class="btn btn-secondary" style="width: 100%; font-size: 0.8rem; margin-top: 1.25rem; color:#ef4444; border-color:rgba(239, 68, 68, 0.3);"><i class="fa-solid fa-circle-exclamation"></i> Flag Issue / Low Supply</button>

        <button onclick="completeClockOut('${t.id}')" class="btn btn-accent" style="width: 100%; justify-content: center; margin-top: 1.25rem; font-size: 1.1rem;"><i class="fa-solid fa-right-from-bracket"></i> Clock Out & Submit Clean</button>
      `:`
        <h4>Arrived on Premises?</h4>
        <p style="font-size:0.8rem; color:var(--text-light); margin-bottom: 0.75rem;">GPS coordinate lock and QR scanner verification required to clock-in.</p>
        <button onclick="initiateClockIn('${t.id}')" class="btn btn-primary" style="width: 100%; justify-content: center;"><i class="fa-solid fa-right-to-bracket"></i> Clock In & Start Clean</button>
      `}
    </div>
  `,n&&k()}function x(){document.getElementById("staff-jobs-list-container").style.display="block",document.getElementById("staff-active-job-detail").style.display="none"}function I(o){const e=db.get("notifications")||[],a=(db.get("staff")||[]).find(n=>n.id===d),s=a?a.name:"Your cleaner";e.push({id:"notif-"+(e.length+1),recipient:"client",type:"alert",text:`${s} is on the way to New York HQ Office. ETA: 12 minutes.`,time:"Just now"}),db.set("notifications",e),alert('Notification sent to client: "On the way!"')}function $(o){if(!g&&!confirm(`Validating GPS Geofence...
Simulated location found: 123 Broadway, NY. Proximity match 100%. Proceed to QR scanner?`))return;const e=document.getElementById("staff-qr-overlay");e.style.display="flex",setTimeout(()=>{e.style.display==="flex"&&(e.style.display="none",alert("QR Code Scanned successfully! Building check-in timestamp validated."),v(o))},1600)}function C(){document.getElementById("staff-qr-overlay").style.display="none"}function v(o){r=o,f=0;const e=db.get("jobs")||[],t=e.findIndex(s=>s.id===o);t!==-1&&(e[t].status="in-progress",db.set("jobs",e)),y=setInterval(()=>{f++,k()},1e3);const a=db.get("notifications")||[];a.push({id:"notif-"+(a.length+1),recipient:"admin",type:"clockin",text:"Sarah Connor clocked in at New York HQ Office. Clean active.",time:"Just now"}),db.set("notifications",a),m=[],p=[],h(o)}function k(){const o=document.getElementById("clock-in-timer");if(!o)return;const e=Math.floor(f/3600),t=Math.floor(f%3600/60),a=f%60,s=n=>n.toString().padStart(2,"0");o.textContent=`${s(e)}:${s(t)}:${s(a)}`}function B(o,e,t){const a=db.get("jobs")||[],s=a.findIndex(n=>n.id===o);s!==-1&&(a[s].checklist[e].done=t,db.set("jobs",a))}function E(o){const e=document.getElementById(`input-photo-${o}`);e&&(e.onchange=async t=>{const a=t.target.files[0];if(!a)return;const s=document.getElementById("upload-loading-overlay"),n=document.getElementById("upload-progress-text");s&&(s.style.display="flex",n&&(n.textContent=`Uploading ${o} photo to cloud...`));try{const i=await db.uploadPhoto(r||"job-102",o,a);if(o==="before"){m=[i];const l=document.getElementById("btn-snap-before");l&&(l.innerHTML='<i class="fa-solid fa-check" style="color:var(--spark-green);"></i> Before Snap')}else{p=[i];const l=document.getElementById("btn-snap-after");l&&(l.innerHTML='<i class="fa-solid fa-check" style="color:var(--spark-green);"></i> After Snap')}alert(`${o.charAt(0).toUpperCase()+o.slice(1)} photo uploaded and synchronized successfully.`)}catch(i){console.error(i),alert("Cloud upload failed. Bypassing with simulated upload.")}finally{s&&(s.style.display="none"),e.value=""}},e.click())}function j(o){const e=prompt("Describe supply alert or cleaning obstacle:");if(e){const t=db.get("notifications")||[];t.push({id:"notif-"+(t.length+1),recipient:"admin",type:"late",text:`Sarah Connor logged anomaly at job ${o}: "${e}"`,time:"Just now"}),db.set("notifications",t),alert("Issue flagged to Admin desk. Keep working if safe.")}}function P(o){const e=db.get("jobs")||[],t=e.findIndex(l=>l.id===o);if(t===-1)return;const a=e[t].checklist.filter(l=>!l.done);if(a.length>0&&!confirm(`You have ${a.length} checklist items unchecked. Are you sure you want to clock out?`))return;if(m.length===0||p.length===0){alert("Warning: Before and After photo proofs are required to log compliance reports.");return}clearInterval(y),r=null,e[t].status="completed",e[t].photos={before:m,after:p},e[t].checklist.forEach(l=>l.done=!0),db.set("jobs",e);const s=db.get("staff")||[],n=s.findIndex(l=>l.id===d);n!==-1&&(s[n].jobsCompleted=(s[n].jobsCompleted||0)+1,db.set("staff",s));const i=db.get("notifications")||[];i.push({id:"notif-"+(i.length+1),recipient:"client",type:"invoice",text:"Job completed! Sarah Connor uploaded 2 photos and checked checklist. Invoice INV-099 is ready.",time:"Just now"}),i.push({id:"notif-"+(i.length+2),recipient:"admin",type:"clockout",text:"Sarah Connor clocked out of New York HQ Office. Time clocked: 2.5 hours.",time:"Just now"}),db.set("notifications",i),alert("Clean completed! Job reports compiled and sent to client database. Great job!"),c()}function u(){const e=(db.get("jobs")||[]).filter(i=>i.cleanerId===d&&i.status==="completed");let t=e.reduce((i,l)=>i+l.price*.65,0),a=e.length*2.5;document.getElementById("earnings-weekly-total").textContent=`$${t.toFixed(2)}`,document.getElementById("earnings-hours-worked").textContent=`${a} hrs logged from ${e.length} completions`;const s=e.filter(i=>i.review&&i.review.stars===5).length;document.getElementById("earnings-bonus-count").textContent=`${s} cleans (+$${(s*10).toFixed(2)})`;const n=document.getElementById("completed-jobs-ledger");if(e.length===0){n.innerHTML='<p style="text-align:center; font-size:0.85rem; padding: 2rem 0; color:var(--text-light);">No completed jobs registered this week.</p>';return}n.innerHTML=e.map(i=>`
    <div style="border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding:0.75rem 1rem; display:flex; justify-content:space-between; align-items:center; background:var(--bg-secondary);">
      <div>
        <strong style="font-size:0.9rem;">${i.type}</strong>
        <span style="font-size:0.75rem; color:var(--text-light); display:block;">${i.date}</span>
      </div>
      <div style="text-align:right;">
        <strong style="color:var(--spark-green); font-size:1.05rem;">+$${(i.price*.65).toFixed(2)}</strong>
        <span style="font-size:0.7rem; color:var(--text-light); display:block;">(Base: $${i.price})</span>
      </div>
    </div>
  `).join("")}function T(){alert(`SOS BROADCAST SENT!
Distress alert, GPS coordinates, and safety protocol dispatched to all area supervisors.`)}document.addEventListener("DOMContentLoaded",()=>{c(),db.onSync(()=>{console.log("Synchronizing Staff portal state..."),r||c(),document.getElementById("staff-view-earnings").style.display==="block"&&u(),document.getElementById("staff-view-profile").style.display==="block"&&b()})});window.switchStaffTab=w;window.simulateGPSLocation=S;window.loadStaffJobs=c;window.openStaffJobDetails=h;window.closeStaffJobDetails=x;window.notifyClientOnWay=I;window.initiateClockIn=$;window.cancelQRScan=C;window.triggerClockInSuccess=v;window.toggleStaffTask=B;window.simulatePhotoSnap=E;window.reportActiveIssue=j;window.completeClockOut=P;window.loadStaffEarnings=u;window.triggerSOS=T;
