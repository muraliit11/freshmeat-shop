// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoi4C6XNRMgyNNd4Ht3O33_EySe1Ked08",
  authDomain: "freshmeat-96c63.firebaseapp.com",
  projectId: "freshmeat-96c63",
  storageBucket: "freshmeat-96c63.firebasestorage.app",
  messagingSenderId: "1051584393564",
  appId: "1:1051584393564:web:22c2d620b33cbdeb225199",
  measurementId: "G-80KFY9B5BT
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
const app = initializeApp(firebaseConfig);
// ---- Trial & Paywall Logic ----
const TRIAL_HOURS = 1;
const SUBSCRIPTION_HOURS = 24;
const SUBSCRIPTION_PRICE = 20;
const UPI_ID = "muraliit11@okhdfcbank";
const UPI_NAME = "Murali S";

function getPaywallState() {
  let firstVisit = localStorage.getItem("fm_firstVisit");
  if (!firstVisit) {
    firstVisit = Date.now();
    localStorage.setItem("fm_firstVisit", firstVisit);
  }
  const unlockUntil = Number(localStorage.getItem("fm_unlockUntil") || 0);
  return { firstVisit: Number(firstVisit), unlockUntil };
}

function isAccessAllowed() {
  const { firstVisit, unlockUntil } = getPaywallState();
  const now = Date.now();
  const trialExpiry = firstVisit + TRIAL_HOURS * 60 * 60 * 1000;
  if (now < trialExpiry) return true;
  if (now < unlockUntil) return true;
  return false;
}

function showPaywall() {
  const overlay = document.createElement("div");
  overlay.id = "fm-paywall-overlay";
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center; z-index: 9999;
  `;

  const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${SUBSCRIPTION_PRICE}&cu=INR&tn=${encodeURIComponent("FreshMeat 24hr access")}`;

  overlay.innerHTML = `
    <div style="background:#F7F1EA; border-radius:16px; padding:28px; max-width:340px; text-align:center; font-family:'Inter',sans-serif;">
      <h2 style="margin:0 0 8px;">Free trial ended</h2>
      <p style="color:#8A6F5C; margin:0 0 16px;">Pay ₹${SUBSCRIPTION_PRICE} for 24 hours of access</p>
      <div id="fm-qr" style="display:flex; justify-content:center; margin-bottom:12px;"></div>
      <p style="font-size:13px; color:#8A6F5C; margin:0 0 16px;">${UPI_ID}</p>
      <button id="fm-paid-btn" style="width:100%; padding:12px; background:#7A2323; color:white; border:none; border-radius:8px; font-size:16px; margin-bottom:10px;">I've paid</button>
    </div>
  `;
  document.body.appendChild(overlay);

  new QRCode(document.getElementById("fm-qr"), {
    text: upiUrl,
    width: 180,
    height: 180
  });

  document.getElementById("fm-paid-btn").addEventListener("click", () => {
    const unlockUntil = Date.now() + SUBSCRIPTION_HOURS * 60 * 60 * 1000;
    localStorage.setItem("fm_unlockUntil", unlockUntil);
    overlay.remove();
  });
}

function initPaywall() {
  if (!isAccessAllowed()) {
    showPaywall();
  }
}

initPaywall();
