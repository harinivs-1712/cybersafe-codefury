
// ---------------- Awareness Tips ----------------
const tips = [
  "Never share OTPs, CVV, or ATM PIN with anyone — banks never ask for them.",
  "Manually type website addresses (e.g., your bank) instead of clicking links in SMS/emails.",
  "Check email domains carefully. Fraudsters use lookalikes like support@gmai1.com.",
  "If a message creates urgency (\"account will be blocked in 24 hrs\"), pause and verify via official channels.",
  "Avoid paying any \"processing / application / convenience\" fee to claim prizes, jobs, or refunds.",
  "Do not install screen-sharing apps when asked by a stranger to \"help\" fix an issue.",
  "On UPI, verify the receiver name and phone number before paying. Requests asking you to \"enter your UPI PIN to receive money\" are scams.",
  "Delivery-reschedule links in SMS from unknown senders are risky. Use the courier’s official app/website.",
  "Set transaction limits and real-time alerts on your bank/UPI apps.",
  "Report cybercrime at cybercrime.gov.in and block numbers/IDs that attempt scams."
];

// ---------------- Quiz Data ----------------
const quiz = [
  {
    text: "You receive an SMS: \"Congrats! You won ₹5,00,000. Pay ₹500 as processing fee to claim.\"",
    isScam: true,
    why: "Prizes that ask for an upfront fee are classic advance-fee scams."
  },
  {
    text: "An email says: \"Your bank KYC is expiring today. Click here to avoid account suspension.\" Link looks unfamiliar.",
    isScam: true,
    why: "Urgency + unknown link + KYC scare tactic = phishing."
  },
  {
    text: "A friend texts from a new number claiming an emergency and asks you to share an OTP to verify your identity.",
    isScam: true,
    why: "No legitimate reason to share OTP. Likely account takeover attempt."
  },
  {
    text: "You get an internship email from careers@gmai1.com asking you to pay an application fee of ₹999.",
    isScam: true,
    why: "Lookalike domain + upfront fee for job = scam."
  },
  {
    text: "A courier SMS asks you to reschedule delivery via a shortened link. You weren't expecting any package.",
    isScam: true,
    why: "Phishing via fake delivery links is common."
  },
  {
    text: "You type your bank URL manually into the browser (https) and log in. The site never asks for OTP unless you transact.",
    isScam: false,
    why: "Manually entering URL and no OTP requests for viewing = good practice."
  },
  {
    text: "Your college IT support calls and asks for your password to \"reset\" your portal access.",
    isScam: true,
    why: "No genuine support should ask for passwords."
  }
];

// ---------------- Detector Logic ----------------
const riskyKeywords = [
  "otp", "one time password", "cvv", "urgent", "lottery", "gift", "prize", "free",
  "kyc", "update kyc", "payment link", "verify account", "suspend", "refund", "reschedule",
  "upi", "click here", "limited time", "pan", "aadhaar", "pay fee", "application fee",
  "processing fee", "account blocked", "bank locker", "lucky draw"
];

const translations = {
  hi: [
    "कभी भी OTP, CVV, या UPI PIN किसी के साथ साझा न करें।",
    "लिंक पर क्लिक न करें, खुद वेबसाइट टाइप करें।",
    "ईमेल एड्रेस ध्यान से जांचें।",
    "तुरंत करने के लिए कहने वाले मैसेज से सावधान रहें।",
    "कोई भी असली नौकरी या इनाम फीस नहीं मांगता।"
  ],
  kn: [
    "OTP, CVV ಅಥವಾ UPI PIN ಅನ್ನು ಯಾರ ಜೊತೆಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
    "ವೆಬ್‌ಸೈಟ್ ವಿಳಾಸವನ್ನು ನೀವು ಸ್ವತಃ ಟೈಪ್ ಮಾಡಿ.",
    "ಇಮೇಲ್ ಕಳುಹಿಸಿದವರ ವಿಳಾಸವನ್ನು ಚೆಕ್ ಮಾಡಿ.",
    "ತುರ್ತು ಎಂದು ಹೇಳುವ ಸಂದೇಶಗಳಿಗೆ ಮೋಸ ಹೋಗಬೇಡಿ.",
    "ನಿಜವಾದ ಕೆಲಸ ಅಥವಾ ಬಹುಮಾನ ಶುಲ್ಕ ಕೇಳುವುದಿಲ್ಲ."
  ]
};

function analyzeMessage(txt) {

  const text = (txt || "").toLowerCase();
  let score = 0;
  let reasons = [];

  // keyword hits
  riskyKeywords.forEach(k => {
    if (text.includes(k)) {
      score += (["otp", "cvv", "kyc", "payment link", "verify account"].includes(k) ? 2 : 1);
      reasons.push(`Contains risky term: "${k}"`);

      if (text.includes("lottery") || text.includes("prize")) {
        reasons.push("🎰 Lottery/Prize Scam");
      }
      if (text.includes("kyc") || text.includes("account suspended")) {
        reasons.push("🏦 KYC/Banking Scam");
      }
      if (text.includes("job") || text.includes("application fee")) {
        reasons.push("💼 Fake Job/Internship Scam");
      }
      if (text.includes("otp") || text.includes("upi pin")) {
        reasons.push("📱 OTP/UPI Scam");
      }
    }
  });

  // url detection
  const urlRegex = /(https?:\/\/|www\.|bit\.ly|tinyurl\.com|t\.co|goo\.gl)/i;
  if (urlRegex.test(text)) {
    score += 2;
    reasons.push("Contains a link/URL (verify source).");
  }

  // money / fee patterns
  const feeRegex = /(₹|\b(inr)\b|rs\.?)\s?\d{2,6}/i;
  if (feeRegex.test(text) && /fee|processing|pay|send|transfer/i.test(text)) {
    score += 2;
    reasons.push("Asks for money/fee upfront.");
  }

  // urgency pattern
  if (/(immediately|now|within 24|expire|blocked|suspend)/i.test(text)) {
    score += 1;
    reasons.push("Creates a sense of urgency.");
  }

  // ask for sensitive info
  if (/password|pin|cvv|otp/i.test(text)) {
    score += 2;
    reasons.push("Requests sensitive information.");
  }

  // simple score thresholds
  let verdict, cssClass;
  if (score >= 4) { verdict = "⚠️ High Risk: This looks suspicious."; cssClass = "bad"; }
  else if (score >= 2) { verdict = "⚠️ Medium Risk: Be cautious."; cssClass = "bad"; }
  else { verdict = "✅ Low Risk: No obvious scam signals."; cssClass = "good"; }

  return { score, reasons, verdict, cssClass };
}

// ---------------- DOM Wiring ----------------
const tipsList = document.getElementById("tipsList");
tips.forEach(t => {
  const li = document.createElement("li"); li.textContent = t; tipsList.appendChild(li);
});

// Quiz state
let idx = -1, score = 0;
const qText = document.getElementById("qText");
const startBtn = document.getElementById("startBtn");
const safeBtn = document.getElementById("safeBtn");
const scamBtn = document.getElementById("scamBtn");
const feedback = document.getElementById("feedback");
const scoreBox = document.getElementById("score");

function showQuestion() {
  idx++;
  if (idx >= quiz.length) {
    qText.textContent = `Quiz finished! Your score: ${score}/${quiz.length}`;
    feedback.textContent = "";
    startBtn.textContent = "Restart";
    safeBtn.disabled = true; scamBtn.disabled = true; startBtn.disabled = false;
    return;
  }
  qText.textContent = quiz[idx].text;
  feedback.textContent = "";
  safeBtn.disabled = false; scamBtn.disabled = false; startBtn.disabled = true;
  scoreBox.textContent = `Q ${idx + 1} of ${quiz.length}`;
}

startBtn.addEventListener("click", () => {
  idx = -1; score = 0; showQuestion();
});

safeBtn.addEventListener("click", () => {
  const correct = !quiz[idx].isScam;
  if (correct) { score++; feedback.textContent = "Correct! " + quiz[idx].why; feedback.className = "feedback good"; }
  else { feedback.textContent = "Not quite. " + quiz[idx].why; feedback.className = "feedback bad"; }
  safeBtn.disabled = true; scamBtn.disabled = true;
  setTimeout(showQuestion, 800);
});
scamBtn.addEventListener("click", () => {
  const correct = quiz[idx].isScam;
  if (correct) { score++; feedback.textContent = "Correct! " + quiz[idx].why; feedback.className = "feedback good"; }
  else { feedback.textContent = "Not quite. " + quiz[idx].why; feedback.className = "feedback bad"; }
  safeBtn.disabled = true; scamBtn.disabled = true;
  setTimeout(showQuestion, 800);
});

// Detector
const msg = document.getElementById("msg");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const result = document.getElementById("result");

analyzeBtn.addEventListener("click", () => {
  const res = analyzeMessage(msg.value);
  result.innerHTML = `<p class="${res.cssClass}">${res.verdict}</p>` +
    (res.reasons.length ? "<ul>" + res.reasons.map(r => `<li>${r}</li>`).join("") + "</ul>" : "<p>No signals found.</p>") +
    `<p class="muted">Tip: When in doubt, verify via official numbers/apps only.</p>`;
});

clearBtn.addEventListener("click", () => { msg.value = ""; result.innerHTML = ""; });


document.getElementById("languageSelect").addEventListener("change", (e) => {
  const lang = e.target.value;
  if (lang !== "en") {
    tipsList.innerHTML = "";
    translations[lang].forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      tipsList.appendChild(li);
    });
  } else {
    tipsList.innerHTML = "";
    tips.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      tipsList.appendChild(li);
    });
  }
});