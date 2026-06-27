import"./app-DaXCS0Su.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";let f=null,b=null,y=null;function $(e){document.querySelectorAll(".portal-view").forEach(a=>a.classList.remove("active")),document.querySelectorAll(".portal-btn").forEach(a=>a.classList.remove("active"));const o=document.getElementById(`view-${e}`);o&&o.classList.add("active");const n=document.querySelector(`.portal-btn[onclick="switchAdminView('${e}')"]`);n&&n.classList.add("active"),e==="dashboard"&&m(),e==="dispatch"&&p(),e==="staff"&&u(),e==="billing"&&h(),e==="inventory"&&g(),e==="analytics"&&v(),document.getElementById("sidebar").classList.remove("open")}function I(){document.getElementById("sidebar").classList.toggle("open")}function k(){localStorage.removeItem("sparkmate_role"),window.location.href="index.html"}function m(){const e=db.get("jobs")||[],o=db.get("staff")||[],n=db.get("notifications")||[],a=e.filter(t=>t.status==="in-progress"||t.status==="active").length,s=e.filter(t=>t.status==="completed").reduce((t,l)=>t+l.price,0),i=e.filter(t=>t.status==="completed"&&t.review);let r=4.8;i.length>0&&(r=parseFloat((i.reduce((t,l)=>t+l.review.stars,0)/i.length).toFixed(1)));const d=n.filter(t=>t.recipient==="admin");document.getElementById("stat-active-jobs").textContent=a,document.getElementById("stat-revenue").textContent=`$${s.toFixed(2)}`,document.getElementById("stat-rating").textContent=`${r}⭐`,document.getElementById("stat-alerts").textContent=d.length;const c=document.getElementById("alerts-list-container");d.length===0?c.innerHTML='<p style="text-align:center; padding: 2rem 0; font-size:0.85rem; color:var(--text-light);">No warnings in inbox.</p>':c.innerHTML=d.map(t=>`
      <div class="alert-item ${t.type==="late"?"late":""}">
        <div>
          <strong style="font-size:0.85rem; display:block;">${t.text}</strong>
          <span style="font-size:0.75rem; color:var(--text-light);">${t.time}</span>
        </div>
        <button onclick="dismissAlert('${t.id}')" style="background:none; border:none; cursor:pointer; color:var(--text-light);"><i class="fa-solid fa-circle-check" style="font-size:1.15rem;"></i></button>
      </div>
    `).join(""),w(o)}function x(e){let o=db.get("notifications")||[];o=o.filter(n=>n.id!==e),db.set("notifications",o),m()}function C(){let e=db.get("notifications")||[];e=e.filter(o=>o.recipient!=="admin"),db.set("notifications",e),m()}function w(e,o){const n=document.getElementById("ops-map");n.querySelectorAll(".map-pin").forEach(s=>s.remove()),e.forEach(s=>{const i=(s.coords.lat-40.7)/.03*100,r=(s.coords.lng+74.015)/.025*100,d=Math.max(5,Math.min(95,100-i)),c=Math.max(5,Math.min(95,r)),t=document.createElement("div");t.className="map-pin",t.style.top=`${d}%`,t.style.left=`${c}%`;const l=s.status==="active";t.innerHTML=`
      <div class="pin-head ${l?"active":""}">
        <i class="fa-solid fa-broom"></i>
      </div>
      <div class="pin-label">${s.name} (${s.status})</div>
    `,t.addEventListener("click",()=>{alert(`Staff: ${s.name}
Speed: Fast
Completing Rating: ${s.rating}⭐
Phone: ${s.phone}`)}),n.appendChild(t)})}function E(){const e=prompt("Enter Emergency Clean Address:","789 Corporate Plaza, New York, NY 10019");if(!e)return;const o=db.get("jobs")||[],a={id:"job-"+(o.length+101),clientId:"client-1",clientName:"Aayush Kharel",siteId:"site-1",address:e,accessCode:"KEY-BOX-901",date:new Date().toISOString().split("T")[0],time:"ASAP Urgent",duration:"2 hours",type:"Deep Clean",price:240,status:"pending",cleanerId:null,cleanerName:"Auto Assigning",checklist:[{id:"t1",room:"All Zones",item:"Deep sanitization and sweeping",done:!1}],photos:{before:[],after:[]},review:null,invoiceStatus:"unpaid"};o.push(a),db.set("jobs",o),alert("Emergency cleanup logged. Job dispatched to scheduler."),m()}function p(){const e=db.get("jobs")||[],o=db.get("staff")||[],n=document.getElementById("lane-unassigned"),a=document.getElementById("lane-assigned"),s=document.getElementById("lane-active"),i=e.filter(t=>t.status==="pending"||!t.cleanerId),r=e.filter(t=>t.status==="assigned"&&t.cleanerId),d=e.filter(t=>t.status==="in-progress"||t.status==="completed"),c=t=>`
    <div class="dispatch-card">
      <strong style="display:block; font-size: 0.95rem;">${t.type}</strong>
      <span style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-bottom: 0.5rem;"><i class="fa-solid fa-location-dot"></i> ${t.address.split(",")[0]}</span>
      
      <div style="font-size:0.8rem; background:var(--bg-tertiary); padding: 0.4rem; border-radius:4px; margin-bottom: 0.5rem;">
        <div>Date: <strong>${t.date}</strong></div>
        <div>Time: <strong>${t.time}</strong></div>
      </div>
      
      <div style="margin-top:0.5rem;">
        <label style="font-size:0.75rem; font-weight:600; display:block; margin-bottom:0.25rem;">Assign Cleaner:</label>
        <select onchange="reassignDispatchJob('${t.id}', this.value)" style="padding:0.25rem 0.5rem; font-size:0.8rem;">
          <option value="">Choose Staff...</option>
          ${o.map(l=>`<option value="${l.id}" ${t.cleanerId===l.id?"selected":""}>${l.name} (${l.rating}⭐)</option>`).join("")}
        </select>
      </div>
    </div>
  `;n.innerHTML=i.length===0?'<p style="font-size:0.8rem; color:var(--text-light); text-align:center;">No unassigned cleans.</p>':i.map(c).join(""),a.innerHTML=r.length===0?'<p style="font-size:0.8rem; color:var(--text-light); text-align:center;">No pending scheduled cleans.</p>':r.map(c).join(""),s.innerHTML=d.length===0?'<p style="font-size:0.8rem; color:var(--text-light); text-align:center;">No active cleans.</p>':d.map(t=>`
      <div class="dispatch-card" style="border-left:4px solid ${t.status==="completed"?"var(--spark-green)":"#328cc1"}">
        <div class="flex-between">
          <strong style="font-size: 0.95rem;">${t.type}</strong>
          <span style="font-size:0.7rem; font-weight:700; color:white; background:${t.status==="completed"?"var(--spark-green)":"var(--spark-blue)"}; padding:0.15rem 0.35rem; border-radius:3px; text-transform:uppercase;">
            ${t.status}
          </span>
        </div>
        <span style="font-size:0.75rem; color:var(--text-secondary); display:block; margin: 0.25rem 0 0.5rem;"><i class="fa-solid fa-location-dot"></i> ${t.address.split(",")[0]}</span>
        <span style="font-size:0.8rem; font-weight:600; display:block;">Cleaner: ${t.cleanerName}</span>
      </div>
    `).join("")}function B(e,o){const n=db.get("jobs")||[],a=db.get("staff")||[],s=n.findIndex(i=>i.id===e);if(s!==-1){if(!o)n[s].cleanerId=null,n[s].cleanerName="Auto Assigning",n[s].status="pending";else{const r=a.find(d=>d.id===o);n[s].cleanerId=o,n[s].cleanerName=r?r.name:"Cleaner",n[s].status="assigned"}db.set("jobs",n);const i=db.get("notifications")||[];i.push({id:"notif-"+(i.length+1),recipient:"client",type:"info",text:`Your upcoming clean has been assigned to ${n[s].cleanerName}.`,time:"Just now"}),db.set("notifications",i),alert("Cleaner assigned successfully!"),p()}}function u(){const e=db.get("staff")||[],o=document.getElementById("staff-crm-tbody");o.innerHTML=e.map(s=>`
    <tr>
      <td><strong>${s.name}</strong></td>
      <td><i class="fa-solid fa-star" style="color:#f59e0b;"></i> ${s.rating}</td>
      <td>${s.jobsCompleted} completed</td>
      <td>
        <span style="font-size:0.75rem; font-weight:700; color:white; background:${s.status==="active"?"var(--spark-green)":"var(--spark-blue)"}; padding:0.2rem 0.5rem; border-radius:4px; text-transform:uppercase;">
          ${s.status}
        </span>
      </td>
      <td>
        <button onclick="alert('Viewing onboarding document folder for DBS check...');" class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;"><i class="fa-solid fa-folder-open"></i> Docs</button>
      </td>
    </tr>
  `).join("");const n=document.getElementById("payroll-tbody"),a=db.get("jobs")||[];n.innerHTML=e.map(s=>{const i=a.filter(t=>t.cleanerId===s.id&&t.status==="completed"),r=i.reduce((t,l)=>t+l.price*.65,0),d=i.filter(t=>t.review&&t.review.stars===5).length*10,c=r+d;return`
      <tr>
        <td><strong>${s.name}</strong></td>
        <td>${i.length*2.5} hours</td>
        <td>$${r.toFixed(2)}</td>
        <td>+$${d.toFixed(2)}</td>
        <td><strong style="color:var(--spark-green);">$${c.toFixed(2)}</strong></td>
        <td>
          <button onclick="alert('Payout transfer of $${c.toFixed(2)} initialized to bank account on file.');" class="btn btn-primary" style="padding:0.3rem 0.6rem; font-size:0.75rem;"><i class="fa-solid fa-paper-plane"></i> Release Pay</button>
        </td>
      </tr>
    `}).join("")}function A(){const e=document.getElementById("ob-name").value,o=document.getElementById("ob-phone").value,n=document.getElementById("ob-dbs").checked,a=document.getElementById("ob-id").checked;if(document.getElementById("ob-training").checked,!n||!a){alert("Warning: Staff compliance documents (ID Verification & DBS Background check) must be flagged valid before onboarding cleaner.");return}const s=db.get("staff")||[],i="staff-"+(s.length+1);s.push({id:i,name:e,rating:5,jobsCompleted:0,phone:o,status:"available",coords:{lat:40.71+Math.random()*.02,lng:-74.005+Math.random()*.02},avatar:e.split(" ").map(r=>r.charAt(0)).join(""),bio:"Newly onboarded SparkMate compliance professional."}),db.set("staff",s),alert(`Onboarded successfully! Cleaner ${e} registered on portal dispatcher.`),document.getElementById("ob-name").value="",document.getElementById("ob-phone").value="",u()}function h(){const e=db.get("invoices")||[],o=document.getElementById("admin-billing-tbody");if(e.length===0){o.innerHTML='<tr><td colspan="6" style="text-align:center; padding:2rem 0; color:var(--text-secondary);">No invoice histories.</td></tr>';return}o.innerHTML=e.map(n=>{const a=n.status==="paid";return`
      <tr>
        <td><strong>${n.id}</strong></td>
        <td>Aayush Kharel</td>
        <td>$${n.amount.toFixed(2)}</td>
        <td>${n.date}</td>
        <td>
          <span style="font-size:0.75rem; font-weight:700; color:white; background:${a?"var(--spark-green)":"#ef4444"}; padding:0.2rem 0.5rem; border-radius:4px; text-transform:uppercase;">
            ${n.status}
          </span>
        </td>
        <td>
          <button onclick="alert('Sending invoice reminder email to client...');" class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;"><i class="fa-solid fa-envelope"></i> Send Reminder</button>
        </td>
      </tr>
    `}).join("")}function S(){const e=document.getElementById("quote-client").value,o=parseInt(document.getElementById("quote-size").value),n=parseInt(document.getElementById("quote-freq").value),a=o*.04*n;alert(`Corporate Proposal Built!
Client: ${e}
Estimated monthly rate: $${a.toFixed(2)}/mo.
Contract PDF drafted successfully.`),document.getElementById("quote-client").value=""}function g(){const e=db.get("inventory")||[],o=document.getElementById("inventory-tbody");o.innerHTML=e.map(n=>{const a=n.qty<n.minQty;return`
      <tr>
        <td><strong>${n.name}</strong></td>
        <td>${n.qty} units</td>
        <td>${n.minQty} units</td>
        <td>${n.supplier}</td>
        <td>
          <span style="font-size:0.75rem; font-weight:700; color:white; background:${a?"#ef4444":"var(--spark-green)"}; padding:0.2rem 0.5rem; border-radius:4px; text-transform:uppercase;">
            ${n.status}
          </span>
        </td>
        <td>
          <button onclick="orderStockItem('${n.id}')" class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;"><i class="fa-solid fa-truck-pickup"></i> Order Restock</button>
        </td>
      </tr>
    `}).join("")}function L(e){const o=db.get("inventory")||[],n=o.findIndex(a=>a.id===e);n!==-1&&(o[n].qty+=25,o[n].status="good",db.set("inventory",o),alert("Stock ordered successfully! Replenished 25 units."),g())}function z(){const e=db.get("inventory")||[];e.forEach(o=>{o.qty<o.minQty&&(o.qty+=20,o.status="good")}),db.set("inventory",e),alert("Auto-restock process triggered. All low stock suppliers notified."),g()}function v(){const e=document.getElementById("chart-revenue").getContext("2d"),o=document.getElementById("chart-nps").getContext("2d"),n=document.getElementById("chart-kpis").getContext("2d");f&&f.destroy(),b&&b.destroy(),y&&y.destroy(),f=new Chart(e,{type:"line",data:{labels:["March","April","May","June"],datasets:[{label:"Gross Profit Monthly Trend ($)",data:[1800,3100,4800,5950],borderColor:"#328cc1",backgroundColor:"rgba(50, 140, 193, 0.1)",tension:.3,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1}}),b=new Chart(o,{type:"bar",data:{labels:["Q1","Q2","Current"],datasets:[{label:"Net Promoter Score (Target: >85)",data:[82,88,92],backgroundColor:["#0b3c5d","#328cc1","#7db93c"],borderRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1}}),y=new Chart(n,{type:"radar",data:{labels:["Punctuality","Speed efficiency","Detail quality","Customer review avg","SOP Compliance"],datasets:[{label:"Sarah Connor (Sarah)",data:[95,90,98,98,100],borderColor:"#7db93c",backgroundColor:"rgba(125, 185, 60, 0.2)"},{label:"Marcus Wright (Marcus)",data:[90,95,88,94,90],borderColor:"#328cc1",backgroundColor:"rgba(50, 140, 193, 0.2)"}]},options:{responsive:!0,maintainAspectRatio:!1}})}document.addEventListener("DOMContentLoaded",()=>{m(),db.onSync(()=>{console.log("Synchronizing Admin portal state..."),m(),document.getElementById("view-dispatch").classList.contains("active")&&p(),document.getElementById("view-staff").classList.contains("active")&&u(),document.getElementById("view-billing").classList.contains("active")&&h(),document.getElementById("view-inventory").classList.contains("active")&&g(),document.getElementById("view-analytics").classList.contains("active")&&v()})});window.switchAdminView=$;window.toggleSidebar=I;window.logout=k;window.loadDashboard=m;window.dismissAlert=x;window.clearAllAlerts=C;window.renderLiveMapPins=w;window.dispatchUrgentClean=E;window.loadDispatchBoard=p;window.reassignDispatchJob=B;window.loadStaffRoster=u;window.onboardStaffMember=A;window.loadBillingLedger=h;window.compileCorporateQuote=S;window.loadInventory=g;window.orderStockItem=L;window.triggerAutoRestock=z;window.initAnalyticsCharts=v;
