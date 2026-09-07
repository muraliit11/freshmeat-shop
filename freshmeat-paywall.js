// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoi4C6XNRMgyNNd4Ht3O33_EySe1Ked08",
  authDomain: "freshmeat-96c63.firebaseapp.com",
  projectId: "freshmeat-96c63",
  storageBucket: "freshmeat-96c63.firebasestorage.app",
  messagingSenderId: "1051584393564",
  appId: "1:1051584393564:web:22c2d620b33cbdeb225199",
  measurementId: "G-80KFY9B5BT"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
const app = initializeApp(firebaseConfig);

// ---- Trial & Paywall Logic (Razorpay) ----
const TRIAL_HOURS = 1;
const SUBSCRIPTION_HOURS = 24;
const SUBSCRIPTION_PRICE = 20; // in rupees
const RAZORPAY_KEY_ID = "rzp_test_TZFbd4BQVev0in"; // TEST key for now

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

  overlay.innerHTML = `
    <div style="background:#F7F1EA; border-radius:16px; padding:28px; max-width:340px; text-align:center; font-family:'Inter',sans-serif;">
      <h2 style="margin:0 0 8px;">Free trial ended</h2>
      <p style="color:#8A6F5C; margin:0 0 20px;">Pay ₹${SUBSCRIPTION_PRICE} for 24 hours of access</p>
      <button id="fm-pay-btn" style="width:100%; padding:12px; background:#7A2323; color:white; border:none; border-radius:8px; font-size:16px;">Pay ₹${SUBSCRIPTION_PRICE} with Razorpay</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("fm-pay-btn").addEventListener("click", () => {
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: SUBSCRIPTION_PRICE * 100,
      currency: "INR",
      name: "FreshMeat",
      description: "24-hour access pass",
      handler: function (response) {
        const unlockUntil = Date.now() + SUBSCRIPTION_HOURS * 60 * 60 * 1000;
        localStorage.setItem("fm_unlockUntil", unlockUntil);
        localStorage.setItem("fm_lastPaymentId", response.razorpay_payment_id);
        overlay.remove();
      },
      theme: { color: "#7A2323" }
    };
    const rzp = new Razorpay(options);
    rzp.open();
  });
}

function initPaywall() {
  if (!isAccessAllowed()) {
    showPaywall();
  }
}

initPaywall();
