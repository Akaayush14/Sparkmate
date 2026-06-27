import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, getDoc, collection, getDocs, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzzN10NimmUjpHPCKwOcDpBjf6ezAE-Ls",
  authDomain: "sparkmate-69b59.firebaseapp.com",
  projectId: "sparkmate-69b59",
  storageBucket: "sparkmate-69b59.firebasestorage.app",
  messagingSenderId: "156528528094",
  appId: "1:156528528094:web:7bce1a8d197b0e5398904f",
  measurementId: "G-69G76WW12K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

const dbInterface = {
  cache: {},
  listeners: [],
  initialized: false,
  
  // Get data from Firestore or localStorage
  get: async (key) => {
    if (dbInterface.cache[key] !== undefined) {
      return dbInterface.cache[key];
    }
    
    try {
      if (key === 'users') {
        // Get all users from users collection
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        usersSnapshot.forEach((docSnap) => {
          users.push({ uid: docSnap.id, ...docSnap.data() });
        });
        dbInterface.cache[key] = users;
        return users;
      } else {
        // Get other data from sparkmate_store
        const docRef = doc(db, "sparkmate_store", key);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data().data;
          dbInterface.cache[key] = data;
          return data;
        } else {
          // Fallback to localStorage
          const localVal = localStorage.getItem(`sparkmate_${key}`);
          return localVal ? JSON.parse(localVal) : null;
        }
      }
    } catch (e) {
      console.error(`Firebase get error for ${key}:`, e);
      // Fallback to localStorage
      const localVal = localStorage.getItem(`sparkmate_${key}`);
      return localVal ? JSON.parse(localVal) : null;
    }
  },
  
  // Save data to Firestore and localStorage
  set: async (key, value) => {
    dbInterface.cache[key] = value;
    
    try {
      if (key === 'users') {
        // Update all users (for backward compatibility)
        const batch = db.batch();
        for (const user of value) {
          const userRef = doc(db, 'users', user.uid);
          batch.set(userRef, user, { merge: true });
        }
        await batch.commit();
        
        // Also keep the old format for backward compatibility
        await setDoc(doc(db, "sparkmate_store", key), { data: value });
      } else {
        // Save other data to sparkmate_store
        await setDoc(doc(db, "sparkmate_store", key), { data: value });
      }
      
      // Also save to localStorage as backup
      localStorage.setItem(`sparkmate_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(`Firebase set error for ${key}:`, e);
      // Fallback to localStorage
      localStorage.setItem(`sparkmate_${key}`, JSON.stringify(value));
    }
    
    dbInterface.notifySync();
  },
  
  // Update a single user (create if doesn't exist)
  updateUser: async (uid, data) => {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, data, { merge: true });
      
      // Update cache
      if (dbInterface.cache['users']) {
        const userIndex = dbInterface.cache['users'].findIndex(u => u.uid === uid);
        if (userIndex !== -1) {
          dbInterface.cache['users'][userIndex] = { ...dbInterface.cache['users'][userIndex], ...data };
        } else {
          dbInterface.cache['users'].push({ uid, ...data });
        }
      }
      
      dbInterface.notifySync();
    } catch (e) {
      console.error(`Error updating user ${uid}:`, e);
    }
  },
  
  notifySync: () => {
    dbInterface.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error("Error in sync callback:", e); }
    });
    // Dispatch standard storage event for cross-tab local updates
    window.dispatchEvent(new Event('storage'));
  },
  
  onSync: (callback) => {
    dbInterface.listeners.push(callback);
  },
  
  // Real-time listener for Firestore changes
  initSync: () => {
    // Listen for changes to users collection
    const usersColRef = collection(db, 'users');
    onSnapshot(usersColRef, (snapshot) => {
      const users = [];
      snapshot.forEach((docSnap) => {
        users.push({ uid: docSnap.id, ...docSnap.data() });
      });
      dbInterface.cache['users'] = users;
      dbInterface.notifySync();
    }, (err) => {
      console.error("Users collection snapshot error:", err);
    });
    
    // Listen for changes to other documents in sparkmate_store
    const colRef = collection(db, 'sparkmate_store');
    onSnapshot(colRef, (snapshot) => {
      let changed = false;
      snapshot.docs.forEach(docSnap => {
        const key = docSnap.id;
        const val = docSnap.data().data;
        if (JSON.stringify(dbInterface.cache[key]) !== JSON.stringify(val)) {
          dbInterface.cache[key] = val;
          changed = true;
        }
      });
      
      // If we received docs, mark initialized
      if (snapshot.size > 0) {
        dbInterface.initialized = true;
      }
      
      if (changed || !dbInterface.initialized) {
        dbInterface.notifySync();
      }
    }, (err) => {
      console.error("Sparkmate store snapshot error:", err);
    });
  },
  
  // Seed Database if empty
  init: async () => {
    try {
      const initDoc = await getDoc(doc(db, "sparkmate_store", "initialized"));
      if (initDoc.exists() && initDoc.data().data === true) {
        console.log("SparkMate Firestore already initialized.");
        dbInterface.initialized = true;
        return;
      }
      
      console.log("Seeding SparkMate Firestore collections...");
      
      // Seed other data
      const staff = [
        { id: 'staff-1', name: 'Sarah Connor', jobsCompleted: 142, phone: '+1 (555) 019-2831', status: 'available', coords: { lat: 40.7128, lng: -74.0060 }, avatar: 'SC', bio: 'Expert in deep cleaning and disinfection. 3+ years experience.' },
        { id: 'staff-2', name: 'Marcus Wright', jobsCompleted: 89, phone: '+1 (555) 014-9821', status: 'active', coords: { lat: 40.7250, lng: -74.0100 }, avatar: 'MW', bio: 'Specialist in window washing and carpet treatment. Fast and reliable.' },
        { id: 'staff-3', name: 'Elena Rostova', jobsCompleted: 112, phone: '+1 (555) 016-4392', status: 'available', coords: { lat: 40.7050, lng: -73.9960 }, avatar: 'ER', bio: 'Passionate about eco-friendly cleaning. Meticulous organizer.' }
      ];
      await setDoc(doc(db, "sparkmate_store", "staff"), { data: staff });

      const client = {
        name: 'Aayush Kharel',
        email: 'client@sparkmate.com',
        phone: '+1 (555) 017-3849',
        sites: [
          { id: 'site-1', nickname: 'New York HQ Office', address: '123 Broadway, Floor 4, New York, NY 10006', accessCode: 'KEY-4921', specialRequests: 'Clean conference room whiteboard. Empty shredder bin.' },
          { id: 'site-2', nickname: 'Brooklyn Lab Room', address: '456 Flatbush Ave, Brooklyn, NY 11201', accessCode: 'CODE-8032', specialRequests: 'Do not touch electronic bench setups. Vacuum floor only.' }
        ],
        loyaltyPoints: 340,
        referralCode: 'SPARK-AAYUSH',
        referralsCount: 0
      };
      await setDoc(doc(db, "sparkmate_store", "client"), { data: client });

      const jobs = [
        {
          id: 'job-101',
          clientId: 'client-1',
          clientName: 'Aayush Kharel',
          siteId: 'site-1',
          address: '123 Broadway, Floor 4, New York, NY 10006',
          accessCode: 'KEY-4921',
          date: '2026-06-05',
          time: '09:00 AM',
          duration: '3 hours',
          type: 'Deep Clean',
          price: 180,
          status: 'completed',
          cleanerId: 'staff-1',
          cleanerName: 'Sarah Connor',
          checklist: [
            { id: 't1', room: 'Office / Desks', item: 'Dust monitor screens & keyboards', done: true },
            { id: 't2', room: 'Office / Desks', item: 'Wipe desk surfaces', done: true },
            { id: 't3', room: 'Kitchenette', item: 'Sanitize microwave and counter', done: true },
            { id: 't4', room: 'Bathrooms', item: 'Scrub toilets & sinks', done: true },
            { id: 't5', room: 'Floors', item: 'Vacuum carpets and mop tiles', done: true }
          ],
          photos: {
            before: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300'],
            after: ['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=300']
          },
          review: { stars: 5, comment: 'Exceptional attention to detail. Whiteboard is pristine!', nps: 10, date: '2026-06-05' },
          invoiceStatus: 'paid'
        },
        {
          id: 'job-102',
          clientId: 'client-1',
          clientName: 'Aayush Kharel',
          siteId: 'site-1',
          address: '123 Broadway, Floor 4, New York, NY 10006',
          accessCode: 'KEY-4921',
          date: '2026-06-08',
          time: '10:00 AM',
          duration: '2.5 hours',
          type: 'Standard Clean',
          price: 120,
          status: 'assigned',
          cleanerId: 'staff-1',
          cleanerName: 'Sarah Connor',
          checklist: [
            { id: 't1', room: 'Office / Desks', item: 'Dust surfaces & empty bins', done: false },
            { id: 't2', room: 'Kitchenette', item: 'Clean sink and counter', done: false },
            { id: 't3', room: 'Bathrooms', item: 'Clean mirrors and wipe down surfaces', done: false },
            { id: 't4', room: 'Floors', item: 'Mop floor and vacuum rugs', done: false }
          ],
          photos: { before: [], after: [] },
          review: null,
          invoiceStatus: 'unpaid'
        },
        {
          id: 'job-103',
          clientId: 'client-1',
          clientName: 'Aayush Kharel',
          siteId: 'site-2',
          address: '456 Flatbush Ave, Brooklyn, NY 11201',
          accessCode: 'CODE-8032',
          date: '2026-06-12',
          time: '02:00 PM',
          duration: '2 hours',
          type: 'Standard Clean',
          price: 95,
          status: 'pending',
          cleanerId: null,
          cleanerName: 'Auto Assigning',
          checklist: [
            { id: 't1', room: 'Lab Area', item: 'Vacuum floor around workspaces (Do not touch benches)', done: false },
            { id: 't2', room: 'Restroom', item: 'Clean toilet and refill soaps', done: false },
            { id: 't3', room: 'Floors', item: 'Mop entry corridor', done: false }
          ],
          photos: { before: [], after: [] },
          review: null,
          invoiceStatus: 'unpaid'
        }
      ];
      await setDoc(doc(db, "sparkmate_store", "jobs"), { data: jobs });

      const invoices = [
        { id: 'INV-098', jobId: 'job-101', amount: 180.00, date: '2026-06-05', status: 'paid', paymentMethod: 'Card (•••• 4242)' },
        { id: 'INV-099', jobId: 'job-102', amount: 120.00, date: '2026-06-07', status: 'unpaid', paymentMethod: null },
        { id: 'INV-100', jobId: 'job-103', amount: 95.00, date: '2026-06-07', status: 'unpaid', paymentMethod: null }
      ];
      await setDoc(doc(db, "sparkmate_store", "invoices"), { data: invoices });

      const inventory = [
        { id: 'inv-1', name: 'Eco-Clean Spray (1L)', qty: 8, minQty: 10, supplier: 'Green supplies Corp', status: 'low' },
        { id: 'inv-2', name: 'Microfiber Towels (pack of 20)', qty: 45, minQty: 15, supplier: 'Textiles Direct', status: 'good' },
        { id: 'inv-3', name: 'Mop Replacement Heads', qty: 3, minQty: 5, supplier: 'Hygiene & Co', status: 'low' },
        { id: 'inv-4', name: 'Heavy Duty Bin Liners (roll)', qty: 12, minQty: 10, supplier: 'Green supplies Corp', status: 'good' }
      ];
      await setDoc(doc(db, "sparkmate_store", "inventory"), { data: inventory });

      const notifications = [
        { id: 'notif-1', recipient: 'admin', type: 'late', text: 'Sarah Connor is 10 minutes away from New York HQ Office.', time: 'Just now' },
        { id: 'notif-2', recipient: 'client', type: 'info', text: 'Sarah Connor has been assigned to your booking tomorrow.', time: '1 hour ago' },
        { id: 'notif-3', recipient: 'staff', type: 'job', text: 'New Job: tomorrow 10:00 AM at New York HQ.', time: '2 hours ago' }
      ];
      await setDoc(doc(db, "sparkmate_store", "notifications"), { data: notifications });

      const chats = [
        { sender: 'client', text: 'Hi, can I add window cleaning to my booking tomorrow?', time: '09:15 AM' },
        { sender: 'admin', text: 'Sure thing, Aayush! I can add it to your order. It will be an extra $35. Should I update the card on file?', time: '09:20 AM' },
        { sender: 'client', text: 'Yes, please do. Thank you!', time: '09:22 AM' }
      ];
      await setDoc(doc(db, "sparkmate_store", "support_chat"), { data: chats });

      // Mark initialized
      await setDoc(doc(db, "sparkmate_store", "initialized"), { data: true });
      dbInterface.initialized = true;
      console.log("SparkMate Firestore seeded successfully!");
      dbInterface.notifySync();
    } catch (e) {
      console.error("Firestore initialization/seeding failed:", e);
      dbInterface.initialized = true;
      dbInterface.notifySync();
    }
  },

  // Login with Firebase Auth
  loginWithEmail: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (e) {
      console.warn("Firebase Auth login failed, falling back to local check:", e.message);
      // Fallback to local check for demo purposes
      const users = await dbInterface.get('users') || [];
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        return { email: user.email, uid: user.uid, ...user };
      }
      throw e;
    }
  },

  // Login with Google
  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (e) {
      console.error("Google login failed:", e);
      throw e;
    }
  },

  // Register user with Firebase Auth
  registerWithEmail: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      return userCredential.user;
    } catch (e) {
      console.error("Registration failed:", e);
      throw e;
    }
  }
};

// Start Syncing and Initialization
dbInterface.initSync();
dbInterface.init();

// Export globally
window.db = dbInterface;
window.auth = auth;

// Helper to switch theme
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    toggle.checked = currentTheme === 'dark';

    toggle.addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });
  }
}

// Global responsive hamburger menu toggle
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      const isFlex = navMenu.style.display === 'flex';
      navMenu.style.display = isFlex ? 'none' : 'flex';
      if (!isFlex) {
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '80px';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.background = 'var(--bg-secondary)';
        navMenu.style.padding = '2rem';
        navMenu.style.borderBottom = '1px solid var(--border-color)';
        navMenu.style.gap = '1.5rem';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
});
