// ---------------- Awareness Tips ----------------
const tips = [
  "Never share OTPs, CVV, or ATM PIN with anyone — banks never ask for them.",
  "Manually type website addresses instead of clicking links in SMS/emails.",
  "Check email domains carefully; fraudsters use lookalikes.",
  "Pause and verify urgent messages via official channels.",
  "Avoid paying any 'processing / application / convenience' fee to claim prizes.",
  "Do not install screen-sharing apps for strangers.",
  "Verify UPI receiver before paying; requests asking for UPI PIN are scams.",
  "Delivery-reschedule links from unknown senders are risky.",
  "Set transaction limits and real-time alerts on banking apps.",
  "Report cybercrime at cybercrime.gov.in and block scam numbers."
];

const translations = {
  hi: ["कभी भी OTP, CVV, या UPI PIN किसी के साथ साझा न करें।","लिंक पर क्लिक न करें, खुद वेबसाइट टाइप करें।","ईमेल एड्रेस ध्यान से जांचें।","तुरंत करने के लिए कहने वाले मैसेज से सावधान रहें।","कोई भी असली नौकरी या इनाम फीस नहीं मांगता।"],
  kn: ["OTP, CVV ಅಥವಾ UPI PIN ಅನ್ನು ಯಾರ ಜೊತೆಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.","ವೆಬ್‌ಸೈಟ್ ವಿಳಾಸವನ್ನು ನೀವು ಸ್ವತಃ ಟೈಪ್ ಮಾಡಿ.","ಇಮೇಲ್ ಕಳುಹಿಸಿದವರ ವಿಳಾಸವನ್ನು ಚೆಕ್ ಮಾಡಿ.","ತುರ್ತು ಎಂದು ಹೇಳುವ ಸಂದೇಶಗಳಿಗೆ ಮೋಸ ಹೋಗಬೇಡಿ.","ನಿಜವಾದ ಕೆಲಸ ಅಥವಾ ಬಹುಮಾನ ಶುಲ್ಕ ಕೇಳುವುದಿಲ್ಲ."]
};

// ---------------- Quiz ----------------
const quiz = [
  { text: "You receive an SMS: 'Congrats! You won ₹5,00,000. Pay ₹500 as processing fee to claim.'", isScam:true, why:"Prizes that ask for an upfront fee are classic advance-fee scams."},
  { text: "Email: 'Your bank KYC is expiring today. Click here to avoid account suspension.' Link looks unfamiliar.", isScam:true, why:"Urgency + unknown link + KYC scare tactic = phishing."},
  { text: "Friend texts from a new number asking for OTP to verify your identity.", isScam:true, why:"No legitimate reason to share OTP."},
  { text: "Courier SMS asks to reschedule via shortened link.", isScam:true, why:"Phishing via fake delivery links is common."},
  { text: "You type bank URL manually; site never asks for OTP unless transacting.", isScam:false, why:"Manually entering URL and no OTP requests = good practice."}
];

// ---------------- Scam Detector ----------------
const riskyKeywords = ["otp","cvv","urgent","lottery","gift","prize","kyc","payment link","verify account","suspend","refund","upi","click here","limited time","pay fee","application fee","processing fee","account blocked"];
function analyzeMessage(txt){
  const text=(txt||"").toLowerCase(); let score=0; let reasons=[];
  riskyKeywords.forEach(k=>{ if(text.includes(k)){ score+= (["otp","cvv","kyc","payment link"].includes(k)?2:1); reasons.push(`Contains risky term: "${k}"`); }});
  if(/(https?:\/\/|www\.|bit\.ly|tinyurl\.com)/i.test(text)){ score+=2; reasons.push("Contains a link/URL."); }
  if(/(₹|\b(inr)\b|rs\.?)\s?\d{2,6}/i.test(text) && /fee|processing|pay|send|transfer/i.test(text)){ score+=2; reasons.push("Asks for money/fee upfront."); }
  if(/(immediately|now|within 24|expire|blocked|suspend)/i.test(text)){ score+=1; reasons.push("Creates urgency."); }
  if(/password|pin|cvv|otp/i.test(text)){ score+=2; reasons.push("Requests sensitive info."); }
  let verdict="", cssClass=""; 
  if(score>=4){ verdict="⚠️ High Risk: This looks suspicious."; cssClass="bad"; }
  else if(score>=2){ verdict="⚠️ Medium Risk: Be cautious."; cssClass="bad"; }
  else{ verdict="✅ Low Risk: No obvious scam signals."; cssClass="good"; }
  return {score,reasons,verdict,cssClass};
}

// ---------------- Daily Updates ----------------
const dailyUpdates = [
  { region:"Delhi", type:"UPI Scam", message:"Fake UPI requests targeting students."},
  { region:"Mumbai", type:"Phishing Email", message:"Fake bank emails asking OTP."},
  { region:"Bangalore", type:"Job Fraud", message:"Internship application fees scam reported."},
  { region:"Hyderabad", type:"OTP Fraud", message:"Fraudsters asking for OTP via phone calls."}
];

// ---------------- DOM Elements ----------------
const tipsList=document.getElementById("tipsList");
const updatesList=document.getElementById("updatesList");
const qText=document.getElementById("qText");
const startBtn=document.getElementById("startBtn");
const safeBtn=document.getElementById("safeBtn");
const scamBtn=document.getElementById("scamBtn");
const feedback=document.getElementById("feedback");
const scoreBox=document.getElementById("score");
const msg=document.getElementById("msg");
const analyzeBtn=document.getElementById("analyzeBtn");
const clearBtn=document.getElementById("clearBtn");
const result=document.getElementById("result");
const voiceBtn=document.getElementById("voiceBtn");
const randomTipBtn=document.getElementById("randomTipBtn");
const randomTip=document.getElementById("randomTip");
const quizProgress=document.getElementById("quizProgress");
const langSelect=document.getElementById("languageSelect");
const themeToggle=document.getElementById("themeToggle");

// ---------------- Initialize ----------------
tips.forEach(t=>{ const li=document.createElement("li"); li.textContent=t; tipsList.appendChild(li); });
dailyUpdates.forEach(u=>{ const li=document.createElement("li"); li.textContent=`${u.region} - ${u.type}: ${u.message}`; updatesList.appendChild(li); });

// ---------------- Quiz ----------------
let idx=-1, scoreQ=0;
function showQuestion(){
  idx++;
  if(idx>=quiz.length){ qText.textContent=`Quiz finished! Your score: ${scoreQ}/${quiz.length}`; feedback.textContent=""; startBtn.textContent="Restart"; safeBtn.disabled=true; scamBtn.disabled=true; startBtn.disabled=false; quizProgress.style.width="100%"; return;}
  qText.textContent=quiz[idx].text; feedback.textContent="";
  safeBtn.disabled=false; scamBtn.disabled=false; startBtn.disabled=true;
  scoreBox.textContent=`Q ${idx+1} of ${quiz.length}`;
  quizProgress.style.width=`${((idx)/quiz.length)*100}%`;
}
startBtn.addEventListener("click",()=>{ idx=-1; scoreQ=0; showQuestion();});
safeBtn.addEventListener("click",()=>{
  const correct=!quiz[idx].isScam;
  if(correct){ scoreQ++; feedback.textContent="Correct! "+quiz[idx].why; feedback.className="feedback good"; }
  else{ feedback.textContent="Not quite. "+quiz[idx].why; feedback.className="feedback bad"; }
  safeBtn.disabled=true; scamBtn.disabled=true;
  setTimeout(showQuestion,800);
});
scamBtn.addEventListener("click",()=>{
  const correct=quiz[idx].isScam;
  if(correct){ scoreQ++; feedback.textContent="Correct! "+quiz[idx].why; feedback.className="feedback good"; }
  else{ feedback.textContent="Not quite. "+quiz[idx].why; feedback.className="feedback bad"; }
  safeBtn.disabled=true; scamBtn.disabled=true;
  setTimeout(showQuestion,800);
});

// ---------------- Scam Detector ----------------
analyzeBtn.addEventListener("click",()=>{
  const res=analyzeMessage(msg.value);
  result.innerHTML=`<p class="${res.cssClass}">${res.verdict}</p>`+
  (res.reasons.length? "<ul>"+res.reasons.map(r=>`<li>${r}</li>`).join("")+"</ul>":"<p>No signals found.</p>")+
  `<p class="muted">Tip: Verify via official numbers/apps only.</p>`;
  if(res.score>=4){ msg.style.border="3px solid red"; msg.value="⚠️ Suspicious content detected. Message blocked!"; }
  else{ msg.style.border="1px solid #ccc"; }
});
clearBtn.addEventListener("click",()=>{ msg.value=""; result.innerHTML=""; msg.style.border="1px solid #ccc"; });

// ---------------- Voice Guidance ----------------
voiceBtn.addEventListener("click",()=>{
  const instructions="Welcome to CyberSafe! Navigate to Awareness for tips, Quiz to test knowledge, Detector to analyze messages, and Daily Updates for latest scams.";
  const utterance=new SpeechSynthesisUtterance(instructions);
  utterance.lang=langSelect.value==="hi"?"hi-IN":(langSelect.value==="kn"?"kn-IN":"en-US");
  speechSynthesis.speak(utterance);
});

// ---------------- Random Tip ----------------
randomTipBtn.addEventListener("click",()=>{
  const allTips = langSelect.value==="en"?tips:translations[langSelect.value];
  const t=allTips[Math.floor(Math.random()*allTips.length)];
  randomTip.textContent=t;
});

// ---------------- Language Change ----------------
langSelect.addEventListener("change",()=>{
  const lang=langSelect.value;
  const list=lang==="en"?tips:translations[lang];
  tipsList.innerHTML="";
  list.forEach(t=>{ const li=document.createElement("li"); li.textContent=t; tipsList.appendChild(li); });
});

// ---------------- Theme Toggle ----------------
themeToggle.addEventListener("click",()=>{
  document.body.classList.toggle("dark");
});