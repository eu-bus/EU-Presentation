let currentSlide = 0;
let currentStep = 0;
const slides = document.querySelectorAll(".slide");
const progressBar = document.getElementById("progress");
const totalSlides = slides.length;

// Data for typing animation
const typingTextAr = `🚌 رحلات مباشرة للجامعات
تقليل عدد المواصلات → لا مشي → لا انتظار طويل

⏱️ التزام بالمواعيد
مسارات ثابتة + مواعيد محددة
⟶ تقليل التأخير والغياب عن المحاضرات

🧠 تقليل الإرهاق وزيادة التركيز
رحلة مريحة ومنظمة تساعد الطالب يبدأ يومه الدراسي بطاقة أفضل

🔒 أمان أعلى للطلاب والطالبات
سيارات معتمدة
سائقون موثوقون
رقابة وتتبع للرحلات

📱 نظام ذكي وسهل الاستخدام
حجز – متابعة – اشتراك شهري
كل ده من خلال تطبيق واحد

🎓 حل قابل للتوسع
يخدم:
الجامعات الحكومية – الخاصة – المعاهد
مع إمكانية التوسع مع زيادة أعداد الطلاب سنويًا`;

const typingTextEn = `🚌 Direct University Trips
Fewer transfers → No walking → No long waiting

⏱️ Punctuality
Fixed routes + Scheduled timings
⟶ Reducing lateness and absence

🧠 Less Fatigue, More Focus
Comfortable and organized trip helps students start their day with better energy

🔒 Higher Safety
Verified vehicles
Trusted drivers
Trip monitoring and tracking

📱 Smart & Easy System
Booking – Tracking – Monthly Subscription
All in one app

🎓 Scalable Solution
Serving:
Public & Private Universities – Institutes
Scalable with growing student numbers`;

let typingIndex = 0;
let typingTimeout;
const typingSpeed = 20; // ms per char

function getTypingText() {
  return document.body.classList.contains("en-mode")
    ? typingTextEn
    : typingTextAr;
}

function initSlides() {
  slides.forEach((slide, idx) => {
    if (idx === 0) {
      slide.classList.add("active");
    } else {
      slide.classList.remove("active");
      // Hide all steps initially
      const steps = slide.querySelectorAll(".step-content");
      steps.forEach((step) => step.classList.add("step-hidden"));
    }
  });
  updateProgressBar();
}

function updateProgressBar() {
  const progressPercentage = ((currentSlide + 1) / totalSlides) * 100;
  progressBar.style.width = `${progressPercentage}%`;
}

function typeWriter() {
  const container = document.getElementById("typing-container");
  if (!container) return;

  const text = getTypingText();
  if (typingIndex < text.length) {
    const char = text.charAt(typingIndex);
    if (char === "\n") {
      container.innerHTML += "<br>";
    } else {
      container.innerText += char;
    }

    // Let's optimize:
    container.innerHTML = text
      .substring(0, typingIndex + 1)
      .replace(/\n/g, "<br>");

    typingIndex++;
    typingTimeout = setTimeout(typeWriter, typingSpeed);
  }

  function readCurrentSlide(forceLang){
    const active = slides[currentSlide];
    if(!active) return;
    const text = active.innerText || active.textContent || '';
    if(!text) return;
    try{ stopListening(); }catch(e){}
    const utter = new SpeechSynthesisUtterance(text);
    // allow forcing language (voice command should force English)
    utter.lang = forceLang || (document.documentElement.lang === 'en' ? 'en-US' : 'ar-EG');
    lastReaderActive = true;
    lastReaderLang = utter.lang;
    utter.rate = 1;
    utter.onend = ()=>{ lastReaderActive = false; lastReaderLang = null; if(!voiceCommandCooldown){ try{ if(persistentMic){ setRecognizedText(''); lastExecutedCommand = null; startListening(); } }catch(e){} } };
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }
}

function resetTyping() {
  clearTimeout(typingTimeout);
  typingIndex = 0;
  const container = document.getElementById("typing-container");
  if (container) container.innerHTML = "";
}

function navigate(direction) {
  const activeSlide = slides[currentSlide];
  const maxSteps = parseInt(activeSlide.getAttribute("data-steps") || "0");

  if (direction === 1) {
    // Going Forward
    if (currentStep < maxSteps) {
      currentStep++;
      revealStep(activeSlide, currentStep);
    } else {
      nextSlide();
    }
  } else {
    // Going Backward
    if (currentStep > 0) {
      hideStep(activeSlide, currentStep);
      currentStep--;
    } else {
      prevSlide();
    }
  }
}

function revealStep(slide, stepNum) {
  const steps = slide.querySelectorAll(`.step-content.step-${stepNum}`);
  steps.forEach((el) => {
    el.classList.remove("step-hidden");
    el.classList.add("step-visible");
  });
}

function hideStep(slide, stepNum) {
  const steps = slide.querySelectorAll(`.step-content.step-${stepNum}`);
  steps.forEach((el) => {
    el.classList.remove("step-visible");
    el.classList.add("step-hidden");
  });
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    slides[currentSlide].classList.remove("active");
    currentSlide++;
    slides[currentSlide].classList.add("active");

    // Show all steps on the new slide (present full page)
    const activeSlide = slides[currentSlide];
    const maxSteps = parseInt(activeSlide.getAttribute('data-steps') || '0');
    currentStep = maxSteps;
    const steps = activeSlide.querySelectorAll('.step-content');
    steps.forEach((step) => { step.classList.remove('step-hidden'); step.classList.add('step-visible'); });

    handleSlideSpecifics(currentSlide, true);
    updateProgressBar();
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    slides[currentSlide].classList.remove("active");
    currentSlide--;
    const activeSlide = slides[currentSlide];
    activeSlide.classList.add("active");

    // Show all steps when going back
    const maxSteps = parseInt(activeSlide.getAttribute("data-steps") || "0");
    currentStep = maxSteps;

    const steps = activeSlide.querySelectorAll(".step-content");
    steps.forEach((step) => {
      step.classList.remove("step-hidden");
      step.classList.add("step-visible");
    });

    handleSlideSpecifics(currentSlide, true);
    updateProgressBar();
  }
}

function handleSlideSpecifics(slideIndex, skipAnimation) {
  // Slide 3 is index 2
  if (slideIndex === 2) {
    resetTyping();
    if (skipAnimation) {
      const container = document.getElementById("typing-container");
      const text = getTypingText();
      // Replace newlines with BR and display immediately
      if (container) container.innerHTML = text.replace(/\n/g, "<br>");
      typingIndex = text.length;
    } else {
      setTimeout(typeWriter, 500);
    }
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initSlides();
  startAutoSlide();
});

// Keyboard Navigation
document.addEventListener("keydown", (e) => {
  // Lightbox Navigation Logic
  const lightbox = document.getElementById("lightbox");
  if (lightbox && lightbox.classList.contains("active")) {
    if (e.key === "ArrowRight") {
      moveLightbox(1);
    } else if (e.key === "ArrowLeft") {
      moveLightbox(-1);
    } else if (e.key === "Escape") {
      closeLightbox();
    }
    return; // Stop normal slide navigation
  }

  // Normal Slide Navigation
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    navigate(1);
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    navigate(-1);
  }
});

// Touch Swipe
let touchstartX = 0;
let touchendX = 0;
document.addEventListener(
  "touchstart",
  (e) => (touchstartX = e.changedTouches[0].screenX),
);
document.addEventListener("touchend", (e) => {
  touchendX = e.changedTouches[0].screenX;
  if (touchendX < touchstartX - 50) navigate(1);
  if (touchendX > touchstartX + 50) navigate(-1);
});

// Prototype Slider Logic
let currentProtoIndex = 0;
let autoSlideInterval;

function startAutoSlide() {
  // Prevent auto-slide if lightbox is open
  const lightbox = document.getElementById("lightbox");
  if (lightbox && lightbox.classList.contains("active")) return;

  cancelAutoSlide();
  autoSlideInterval = setInterval(() => {
    moveProto(1);
  }, 3000);
}

function cancelAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
}

function moveProto(dir) {
  const images = document.querySelectorAll(".proto-img");
  if (!images.length) return;

  // Remove active class
  images[currentProtoIndex].classList.remove("active");

  // Calculate new index
  currentProtoIndex += dir;
  if (currentProtoIndex >= images.length) currentProtoIndex = 0;
  if (currentProtoIndex < 0) currentProtoIndex = images.length - 1;

  // Add active class
  images[currentProtoIndex].classList.add("active");

  // Sync Lightbox if Open
  const lightbox = document.getElementById("lightbox");
  if (lightbox.classList.contains("active")) {
    updateLightboxContent();
  }
}

function updateLightboxContent() {
  const images = document.querySelectorAll(".proto-img");
  const activeImg = images[currentProtoIndex];
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");

  if (activeImg) {
    lightboxImg.src = activeImg.src;
    // Get caption based on language
    const isEn = document.body.classList.contains("en-mode");
    const caption = isEn
      ? activeImg.getAttribute("data-en")
      : activeImg.getAttribute("data-ar");
    lightboxCaption.textContent = caption || activeImg.getAttribute("alt"); // Fallback to alt
  }
}

function openLightbox() {
  cancelAutoSlide(); // Stop auto rotation while viewing details
  const lightbox = document.getElementById("lightbox");
  updateLightboxContent();
  lightbox.classList.add("active");
}

function moveLightbox(dir, event) {
  if (event) event.stopPropagation();
  moveProto(dir);
}

function closeLightbox(e) {
  // If e.target is the lightbox container or the close button or implicit call
  const lightbox = document.getElementById("lightbox");
  if (!e || e.target === lightbox || e.target.closest(".lightbox-close")) {
    lightbox.classList.remove("active");
    startAutoSlide(); // Resume rotation
  }
}

function toggleLanguage() {
  document.body.classList.toggle("en-mode");
  const isEn = document.body.classList.contains("en-mode");
  document.documentElement.lang = isEn ? "en" : "ar";
  document.documentElement.dir = isEn ? "ltr" : "rtl";

  // Fix navigation icons
  const nextIcon = document.querySelector(".next-btn i");
  const prevIcon = document.querySelector(".prev-btn i");

  // Fix phone navigation icons (flip them too?)
  const phoneNext = document.querySelector(".phone-next i");
  const phonePrev = document.querySelector(".phone-prev i");

  // Fix lightbox navigation icons
  const lbNext = document.querySelector(".lightbox-next i");
  const lbPrev = document.querySelector(".lightbox-prev i");

  if (isEn) {
    nextIcon.className = "fas fa-chevron-right text-xl";
    prevIcon.className = "fas fa-chevron-left text-xl";

    if (phoneNext) phoneNext.className = "fas fa-chevron-right text-xl";
    if (phonePrev) phonePrev.className = "fas fa-chevron-left text-xl";

    if (lbNext) lbNext.className = "fas fa-chevron-right";
    if (lbPrev) lbPrev.className = "fas fa-chevron-left";
  } else {
    nextIcon.className = "fas fa-chevron-left text-xl";
    prevIcon.className = "fas fa-chevron-right text-xl";

    if (phoneNext) phoneNext.className = "fas fa-chevron-left text-xl";
    if (phonePrev) phonePrev.className = "fas fa-chevron-right text-xl";

    if (lbNext) lbNext.className = "fas fa-chevron-left";
    if (lbPrev) lbPrev.className = "fas fa-chevron-right";
  }

  // Retrigger typing animation if on Slide 3 (Solution)
  if (currentSlide === 2) {
    resetTyping();
    setTimeout(typeWriter, 100);
  }
}

// --- Voice control (SpeechRecognition) + UI notifications ---
(function(){
  const micBtn = document.getElementById('voice-toggle');
  const micIcon = document.getElementById('voice-icon');
  const voiceNotice = document.getElementById('voice-notice');
  const voiceRecognized = document.getElementById('voice-recognized');
  const voiceReply = document.getElementById('voice-reply');
  const voiceDot = document.getElementById('voice-dot');
  const autoCounter = document.getElementById('auto-counter');

  let recognition = null;
  let listening = false;

  // Presentation autoplay (show full slide then move) state
  let presentationAutoPlayId = null;
  let presentationAutoPlayIntervalSec = 25; // default 25s per full slide (user requested)
  let presentationAutoPlayRunning = false;
  let presentationRemainingSec = 0;
  let presentationCounterInterval = null;
  let awaitingDuration = false; // when true, next speech recognized is treated as duration reply
  let voiceActionExecuted = false; // set true by handleVoiceCommand when an action ran
  let voiceCommandCooldown = false; // avoid repeated pause/restarts
  let lastExecutedCommand = null;
  let lastReaderActive = false;
  let lastReaderLang = null;
  let persistentMic = false; // if true, mic stays on until user says 'off'

  function pauseAfterVoiceCommand(seconds = 5){
    if(voiceCommandCooldown) return;
    voiceCommandCooldown = true;
    // stop listening and show temporary reply
    try{ stopListening(false); }catch(e){}
    const msg = document.documentElement.lang === 'en' ? `Pausing for ${seconds}s` : `انتظار ${seconds} ثانية`; 
    setReplyText(msg);
    setTimeout(()=>{
      // restart listening only if mic button still indicates listening allowed
        try{ 
          if(persistentMic){
            setRecognizedText('');
            lastExecutedCommand = null;
            startListening();
          }
        }catch(e){}
      voiceCommandCooldown = false;
      const readyMsg = document.documentElement.lang === 'en' ? 'Ready' : 'جاهز';
      setReplyText(readyMsg);
    }, seconds * 1000);
  }

  function supportsSpeech() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function showVoiceNotice(show){
    if(!voiceNotice) return;
    voiceNotice.style.display = show ? 'block' : 'none';
  }

  function setRecognizedText(t){ if(voiceRecognized) voiceRecognized.textContent = t; }
  function setReplyText(t){ if(voiceReply) voiceReply.textContent = t; }
  function setVoiceDot(active){ if(voiceDot) voiceDot.style.background = active ? '#10b981' : '#ef4444'; if(voiceDot) voiceDot.style.boxShadow = active ? '0 0 10px rgba(16,185,129,0.6)' : '0 0 8px rgba(239,68,68,0.6)'; }
  function showAutoCounter(show){ if(autoCounter) autoCounter.style.display = show ? 'flex' : 'none'; }
  function updateAutoCounterText(sec){ if(autoCounter) autoCounter.textContent = `${sec}s`; }

  function startCounterClock(){
    stopCounterClock();
    presentationRemainingSec = presentationAutoPlayIntervalSec;
    updateAutoCounterText(presentationRemainingSec);
    showAutoCounter(true);
    presentationCounterInterval = setInterval(()=>{
      presentationRemainingSec--;
      if(presentationRemainingSec < 0) presentationRemainingSec = 0;
      updateAutoCounterText(presentationRemainingSec);
    },1000);
  }

  function stopCounterClock(){ if(presentationCounterInterval){ clearInterval(presentationCounterInterval); presentationCounterInterval = null; } showAutoCounter(false); }

  function startListening() {
    if (!supportsSpeech()) { alert('Speech Recognition not supported in this browser'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = document.documentElement.lang === 'en' ? 'en-US' : 'ar-EG';
      // enable interim results so we can display live transcript while speaking
      recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = ()=>{ listening = true; setVoiceDot(true); setReplyText('Listening...'); showVoiceNotice(true); if(micIcon) micIcon.className='fas fa-microphone text-lg text-green-600' }
    recognition.onend = ()=>{ listening = false; setVoiceDot(false); setReplyText('Stopped'); showVoiceNotice(false); if(micIcon) micIcon.className='fas fa-microphone text-lg text-red-600' }
    recognition.onerror = (e)=>{ console.warn('Speech error',e); setReplyText('Error: ' + (e.error||'unknown')) }
    recognition.onresult = (ev)=>{
      // accumulate interim and final transcripts
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++){
        const res = ev.results[i];
        if(res.isFinal) finalTranscript += res[0].transcript;
        else interimTranscript += res[0].transcript;
      }

      // If awaiting duration reply, parse numbers from speech first
      if(awaitingDuration){
        const liveText = interimTranscript || finalTranscript || '';
        if(liveText) setRecognizedText(liveText);
        // try to extract number (digits, english/ar words, fuzzy)
        const num = extractNumberFromText((interimTranscript || finalTranscript).toLowerCase());
        if(num !== null){
          // accepted duration (>=75% confidence or digits)
          awaitingDuration = false;
          presentationAutoPlayIntervalSec = Number(num);
          const ack = document.documentElement.lang === 'en' ? `Starting auto presentation, ${presentationAutoPlayIntervalSec} seconds per slide` : `أبدأ العرض التلقائي، ${presentationAutoPlayIntervalSec} ثانية لكل شريحة`;
          setReplyText(ack);
            // start autoplay with chosen seconds, start from current slide (unless user asked explicitly for start-from-begin)
              startPresentationAutoPlay(presentationAutoPlayIntervalSec);
          return;
        } else {
          // compute best fuzzy candidate for suggestion (70-75%)
          const lower = (interimTranscript || finalTranscript).toLowerCase();
          let best = {k:null,score:0};
          for(const k in EN_NUM_WORDS){
            const key = k;
            const score = 1 - (levenshtein(lower.replace(/[^a-z ]/g,''), key) / Math.max(lower.length, key.length));
            if(score > best.score){ best = {k: key, score}; }
          }
          if(best.score >= 0.7 && best.score < 0.75){
            setRecognizedText(`${best.k} (suggested)`);
          }
          // otherwise keep waiting
          return;
        }
      }

      // show interim live for general commands
      if(interimTranscript){
        setRecognizedText(interimTranscript);
        // try fuzzy matching on interim to suggest or auto-run commands
        const suggestion = fuzzyMatchCommand(interimTranscript.toLowerCase());
        if(suggestion){
          if(suggestion.score >= 0.75){
            // confident: execute immediately and show canonical label
            setRecognizedText(suggestion.cmdLabel);
            const r = handleVoiceCommand(suggestion.cmdLabel);
            lastExecutedCommand = suggestion.cmdLabel;
            if(r) setReplyText(r);
            if(voiceActionExecuted){ voiceActionExecuted = false; pauseAfterVoiceCommand(5); }
          } else if(suggestion.score >= 0.7){
            // borderline: show suggested command but don't execute
            setRecognizedText(suggestion.cmdLabel + ' (suggested)');
          }
        }
      }

      if(finalTranscript){
        setRecognizedText(finalTranscript);
        const finalLower = finalTranscript.toLowerCase();
        // avoid re-executing a command that was already executed from interim
        if(lastExecutedCommand && finalLower.includes(lastExecutedCommand)){
          // just show reply/status but don't run again
          setTimeout(()=>{ setReplyText(document.documentElement.lang === 'en' ? 'Okay.' : 'حاضر'); }, 120);
        } else {
          const reply = handleVoiceCommand(finalLower);
          setTimeout(()=>{ if(reply) setReplyText(reply); else setReplyText(document.documentElement.lang === 'en' ? 'Okay.' : 'حاضر'); }, 120);
          if(voiceActionExecuted){ voiceActionExecuted = false; pauseAfterVoiceCommand(5); }
        }
      }
    }
    recognition.start();
    persistentMic = true;
  }

  function stopListening(permanent = true){
    if(recognition){ try{ recognition.stop(); }catch(e){} recognition = null; }
    listening = false;
    if(micIcon) micIcon.className='fas fa-microphone text-lg text-red-600';
    showVoiceNotice(false);
    if(permanent) persistentMic = false;
  }

  // Reveal all step contents on current slide
  function revealAllCurrentSlide(){
    const activeSlide = slides[currentSlide];
    if(!activeSlide) return;
    const maxSteps = parseInt(activeSlide.getAttribute('data-steps') || '0');
    currentStep = maxSteps;
    const steps = activeSlide.querySelectorAll('.step-content');
    steps.forEach(s => { s.classList.remove('step-hidden'); s.classList.add('step-visible'); });
  }

  // Presentation autoplay: show full slide, wait interval, then advance
  function startPresentationAutoPlay(sec){
    stopPresentationAutoPlay();
    // coerce seconds to a safe integer >= 1
    const secNum = Number(sec);
    const secInt = Number.isFinite(secNum) && secNum >= 1 ? Math.max(1, Math.round(secNum)) : Math.max(1, Math.round(presentationAutoPlayIntervalSec));
    presentationAutoPlayIntervalSec = secInt;
    // optional explicit fromStart flag (not used by voice unless requested)
    const fromStart = (arguments.length > 1 && arguments[1]) ? true : false;
    if(fromStart){
      slides[currentSlide].classList.remove('active');
      currentSlide = 0;
      slides[currentSlide].classList.add('active');
    }
    // show current slide fully immediately and start counter
    revealAllCurrentSlide();
    presentationAutoPlayRunning = true;
    startCounterClock();
    const intervalMs = secInt * 1000;
    console.debug('startPresentationAutoPlay: intervalSec=', secInt, 'fromStart=', fromStart);
    presentationAutoPlayId = setInterval(()=>{
      if(currentSlide >= totalSlides - 1){ stopPresentationAutoPlay(); return; }
      nextSlide();
      // reset counter for next slide
      presentationRemainingSec = presentationAutoPlayIntervalSec;
      // ensure new slide is fully revealed
      setTimeout(revealAllCurrentSlide, 50);
    }, intervalMs);
  }

  function stopPresentationAutoPlay(){
    if(presentationAutoPlayId){ clearInterval(presentationAutoPlayId); presentationAutoPlayId = null; }
    presentationAutoPlayRunning = false;
    stopCounterClock();
  }

  function continuePresentationAutoPlay(){
    if(!presentationAutoPlayRunning) startPresentationAutoPlay(presentationAutoPlayIntervalSec);
  }

  function goToSlideNumber(n){
    const target = Number(n);
    if(Number.isNaN(target)) return 'Invalid number';
    const idx = Math.max(0, Math.min(totalSlides - 1, target - 1));
    if(idx === currentSlide) return 'Already on that slide';
    // move instantly
    slides[currentSlide].classList.remove('active');
    currentSlide = idx;
    slides[currentSlide].classList.add('active');
    currentStep = 0;
    // hide steps initially
    const steps = slides[currentSlide].querySelectorAll('.step-content');
    steps.forEach((step) => { step.classList.remove('step-visible'); step.classList.add('step-hidden'); });
    handleSlideSpecifics(currentSlide, false);
    updateProgressBar();
    return document.documentElement.lang === 'en' ? `Going to slide ${target}` : `الانتقال للشريحة ${target}`;
  }

  // Smoothly move slide-by-slide to target, revealing each slide fully
  function goToSlideSmooth(n, delayMs = 700){
    const target = Number(n);
    if(Number.isNaN(target)) return 'Invalid number';
    const idx = Math.max(0, Math.min(totalSlides - 1, target - 1));
    if(idx === currentSlide) return document.documentElement.lang === 'en' ? `Already on slide ${target}` : `أنت بالفعل على الشريحة ${target}`;

    const stepsToMove = Math.abs(idx - currentSlide);
    const dir = idx > currentSlide ? 1 : -1;
    let moved = 0;

    function stepOnce(){
      if(moved >= stepsToMove) return;
      if(dir === 1) nextSlide(); else prevSlide();
      // ensure full content visible
      revealAllCurrentSlide();
      moved++;
      if(moved < stepsToMove) setTimeout(stepOnce, delayMs);
    }

    stepOnce();
    // pause recognition for the duration of the movement plus a buffer
    try{ pauseAfterVoiceCommand(Math.ceil((stepsToMove * delayMs) / 1000) + 1); }catch(e){}
    return document.documentElement.lang === 'en' ? `Going to slide ${target}` : `الانتقال للشريحة ${target}`;
  }

  // attempt to parse Arabic number words (basic)
  function parseArabicNumberWord(text){
    const map = { 'صفر':0,'واحد':1,'واحدة':1,'اتنين':2,'اثنين':2,'اثنتين':2,'تلاتة':3,'ثلاثة':3,'اربعة':4,'أربعة':4,'خمسة':5,'ستة':6,'سبعة':7,'ثمانية':8,'تسعة':9,'عشرة':10 };
    for(const k in map){ if(text.includes(k)) return map[k]; }
    return null;
  }

  // Levenshtein distance for fuzzy matching
  function levenshtein(a, b){
    if(a === b) return 0;
    const al = a.length, bl = b.length;
    if(al === 0) return bl;
    if(bl === 0) return al;
    const matrix = Array.from({length: al+1}, () => new Array(bl+1).fill(0));
    for(let i=0;i<=al;i++) matrix[i][0] = i;
    for(let j=0;j<=bl;j++) matrix[0][j] = j;
    for(let i=1;i<=al;i++){
      for(let j=1;j<=bl;j++){
        const cost = a[i-1] === b[j-1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1,
          matrix[i][j-1] + 1,
          matrix[i-1][j-1] + cost
        );
      }
    }
    return matrix[al][bl];
  }

  // fuzzy match input against known command variants, return best match and score
  function fuzzyMatchCommand(input){
    if(!input || input.trim().length === 0) return null;
    const variants = [
      {cmdLabel: 'next', forms:['next','next slide','الشريحة التالية','التالي','قدام']},
      {cmdLabel: 'previous', forms:['previous','previous slide','الشريحة السابقة','السابق','رجع','وراء']},
      // 'start' command removed — handled via UI/settings instead
      {cmdLabel: 'stop', forms:['stop','stop auto','أوقف','قف','اوقف','ايقاف']},
      {cmdLabel: 'read', forms:['read','read slide','اقرأ','اقرا','read this']},
      {cmdLabel: 'mic-off', forms:['off','turn off microphone','stop listening','mic off','turn off mic','اطفي الميكروفون','اطفي الميكروفون','اطف الميكروفون']},
      {cmdLabel: 'mic-on', forms:['on','turn on microphone','start listening','mic on','turn on mic','شغل الميكروفون']},
      {cmdLabel: 'continue', forms:['continue','resume','كمل','استمر','واصل']},
      // 'next all' removed; 'next' will reveal full slide now
      // 'go to' removed — numbers are recognized directly (digits, words, spoken sequences)
      {cmdLabel: 'command', forms:['command','commands','show commands','help','help me','قائمة الاوامر','اوامر','عرض الاوامر']}
    ];

    let best = null;
    for(const v of variants){
      for(const form of v.forms){
        const a = input.toLowerCase().replace(/[^\p{L}\p{N} ]/gu,'').trim();
        const b = form.toLowerCase().replace(/[^\p{L}\p{N} ]/gu,'').trim();
        if(!b) continue;
        const dist = levenshtein(a,b);
        const maxLen = Math.max(a.length, b.length);
        const score = maxLen === 0 ? 0 : (1 - dist / maxLen);
        if(!best || score > best.score){ best = {cmdLabel: v.cmdLabel, form, score}; }
      }
    }
    return best;
  }

  // English number words mapping (1-60)
  const EN_NUM_WORDS = {
    'one':1,'two':2,'three':3,'four':4,'five':5,'six':6,'seven':7,'eight':8,'nine':9,'ten':10,
    'eleven':11,'twelve':12,'thirteen':13,'fourteen':14,'fifteen':15,'sixteen':16,'seventeen':17,'eighteen':18,'nineteen':19,'twenty':20,
    'twenty one':21,'twenty two':22,'twenty three':23,'twenty four':24,'twenty five':25,'twenty six':26,'twenty seven':27,'twenty eight':28,'twenty nine':29,'thirty':30,
    'thirty one':31,'thirty two':32,'thirty three':33,'thirty four':34,'thirty five':35,'thirty six':36,'thirty seven':37,'thirty eight':38,'thirty nine':39,'forty':40,
    'forty five':45,'fifty':50,'sixty':60
  };

  // single digit words mapping for spoken-digit sequences
  const DIGIT_WORDS = {
    'zero':'0','one':'1','two':'2','three':'3','four':'4','five':'5','six':'6','seven':'7','eight':'8','nine':'9',
    'صفر':'0','واحد':'1','واحدة':'1','اثنين':'2','اتنين':'2','اتنين':'2','اتنين':'2','اثنتين':'2','اثنا':'2','تلاتة':'3','ثلاثة':'3','اربعة':'4','أربعة':'4','خمسة':'5','ستة':'6','سبعة':'7','ثمانية':'8','تسعة':'9'
  };

  // Parse spoken digit sequences like "one two three" -> 123, or Arabic 'واحد اتنين' -> 12
  function parseSpokenDigitSequence(text){
    if(!text) return null;
    const tokens = text.toLowerCase().replace(/[^\p{L} ]/gu,'').split(/\s+/).filter(Boolean);
    let digits = '';
    for(const t of tokens){
      if(DIGIT_WORDS[t] !== undefined){ digits += DIGIT_WORDS[t]; }
      else {
        // try simple english strip (e.g., 'twenty' shouldn't match here)
        const cleaned = t.replace(/[^a-z0-9]/g,'');
        if(cleaned.length === 1 && /[0-9]/.test(cleaned)) digits += cleaned;
        else return null;
      }
    }
    if(digits.length === 0) return null;
    // avoid single-digit ambiguous here (we only convert sequences of 2+ tokens)
    if(digits.length === 1 && tokens.length === 1) return null;
    return Number(digits);
  }

  function extractNumberFromText(text){
    if(!text) return null;
    // digits
    const d = text.match(/(\d{1,3})/);
    if(d) return Number(d[1]);
    // spoken-digit sequences (one two -> 12)
    const seq = parseSpokenDigitSequence(text);
    if(seq !== null) return seq;
    // english exact contains
    const lower = text.toLowerCase();
    for(const k in EN_NUM_WORDS){ if(lower.includes(k)) return EN_NUM_WORDS[k]; }
    // arabic word number
    const ar = parseArabicNumberWord(lower);
    if(ar !== null) return ar;
    // fuzzy match against english words
    let best = {k:null,score:0};
    for(const k in EN_NUM_WORDS){
      const score = 1 - (levenshtein(lower.replace(/[^a-z ]/g,''), k) / Math.max(lower.length, k.length));
      if(score > best.score){ best = {k,score}; }
    }
    if(best.score >= 0.75) return EN_NUM_WORDS[best.k];
    return null;
  }

  // show popup with list of commands and descriptions
  function showCommandsPopup(){
    // remove existing if any
    const existing = document.getElementById('commands-popup-overlay');
    if(existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'commands-popup-overlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.45)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 99999;

    const card = document.createElement('div');
    card.style.width = 'min(720px, 90%)';
    card.style.maxHeight = '80%';
    card.style.overflow = 'auto';
    card.style.background = '#fff';
    card.style.borderRadius = '8px';
    card.style.padding = '18px';
    card.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)';
    card.style.fontFamily = 'sans-serif';

    const title = document.createElement('h3');
    title.textContent = document.documentElement.lang === 'en' ? 'Voice Commands' : 'قائمة الأوامر الصوتية';
    title.style.marginTop = '0';
    card.appendChild(title);

    const list = document.createElement('ul');
    const cmds = [
      {k: document.documentElement.lang === 'en' ? 'next' : 'التالي', d: document.documentElement.lang === 'en' ? 'Go to next full slide (shows all content)' : 'الانتقال للشريحة التالية مع عرض كل المحتوى'},
      {k: document.documentElement.lang === 'en' ? 'previous' : 'السابق', d: document.documentElement.lang === 'en' ? 'Go to previous full slide' : 'العودة للشريحة السابقة بالكامل'},
      // start command removed from voice help
      {k: document.documentElement.lang === 'en' ? 'continue' : 'كمل', d: document.documentElement.lang === 'en' ? 'Continue auto-play (can change seconds)' : 'استكمال العرض التلقائي (ممكن تغير الثواني)'},
      {k: document.documentElement.lang === 'en' ? 'stop' : 'اوقف', d: document.documentElement.lang === 'en' ? 'Stop reading (if reading in English) or stop autoplay' : 'إيقاف القراءة (لو القارئ شغال بالإنجليزية) أو إيقاف العرض التلقائي'},
      {k: document.documentElement.lang === 'en' ? 'read' : 'اقرأ', d: document.documentElement.lang === 'en' ? 'Read current slide aloud (English TTS)' : 'قراءة محتوى الشريحة (بالإنجليزية فقط عند الأمر الصوتي)'},
      {k: document.documentElement.lang === 'en' ? 'Numbers' : 'الأرقام', d: document.documentElement.lang === 'en' ? 'Say a number (digits or words, e.g., "1" or "one", or spoken sequence "one two" → 12) to go to that slide' : 'قل رقم (أرقام أو كلمات، مثلاً "1" أو "one"، أو تسلسل منطوق "one two" → 12) للذهاب للشريحة'},
      {k: document.documentElement.lang === 'en' ? 'command / help' : 'قائمة الاوامر', d: document.documentElement.lang === 'en' ? 'Open this commands list' : 'افتح قائمة الأوامر هذه'},
      {k: document.documentElement.lang === 'en' ? 'close' : 'اغلاق', d: document.documentElement.lang === 'en' ? 'Close this popup (does not stop reader)' : 'اغلاق النافذة منبثقة (لا يوقف القارئ)'},
      {k: document.documentElement.lang === 'en' ? 'Examples' : 'أمثلة', d: document.documentElement.lang === 'en' ? 'Say "one two" → goes to slide 12. Say "set 10 seconds" or answer when asked.' : 'مثال: قول "one two" → يذهب للشريحة 12. قول "10" عندما يُسألك عن الثواني.'}
    ];
    cmds.forEach(c => { const li = document.createElement('li'); li.style.margin='8px 0'; li.innerHTML = `<strong>${c.k}</strong>: ${c.d}`; list.appendChild(li); });
    card.appendChild(list);

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '8px';
    btnRow.style.marginTop = '12px';

    const readBtn = document.createElement('button');
    readBtn.textContent = document.documentElement.lang === 'en' ? 'Read' : 'اقرأ الشريحة';
    readBtn.style.padding = '8px 12px';
    readBtn.style.border = 'none';
    readBtn.style.background = '#065f46';
    readBtn.style.color = '#fff';
    readBtn.style.borderRadius = '6px';
    readBtn.onclick = ()=>{ readCurrentSlide(); };
    btnRow.appendChild(readBtn);

    const close = document.createElement('button');
    close.textContent = document.documentElement.lang === 'en' ? 'Close' : 'اغلاق';
    close.style.padding = '8px 12px';
    close.style.border = 'none';
    close.style.background = '#111827';
    close.style.color = '#fff';
    close.style.borderRadius = '6px';
    close.onclick = ()=> overlay.remove();
    btnRow.appendChild(close);
    card.appendChild(btnRow);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }

  function handleVoiceCommand(text){
    // normalized text
    const t = text.toLowerCase();
    // if popup overlay exists and user said close, close popup and return
    const overlay = document.getElementById('commands-popup-overlay');
    if(overlay && (t.includes('close') || t.includes('اغلاق') || t.includes('اغل'))){ overlay.remove(); return document.documentElement.lang === 'en' ? 'Closed' : 'تم الاغلاق'; }
    // check for any numeric intent (digits, spoken-digit sequences, english words, arabic words)
    const parsedNum = extractNumberFromText(t);
    if(parsedNum !== null){
      voiceActionExecuted = true;
      lastExecutedCommand = 'go-to-' + String(parsedNum);
      return goToSlideSmooth(parsedNum);
    }

    // ensure next reveals full slide content

    // Arabic commands
    if(t.includes('التالي') || t.includes('الشريحة التالية') || t.includes('قدّام') || t.includes('إلى الأمام') || t.includes('قدم') || t.includes('next')){
      // move to next full slide (ignore incremental steps)
      voiceActionExecuted = true;
      lastExecutedCommand = 'next';
      nextSlide();
      return document.documentElement.lang === 'en' ? 'Okay, next slide' : 'حاضر، التالي';
    }
    if(t.includes('السابق') || t.includes('الشريحة السابقة') || t.includes('وراء') || t.includes('الى الخلف') || t.includes('رجع') || t.includes('previous') || t.includes('previous slide')){
      // move to previous full slide
      voiceActionExecuted = true;
      lastExecutedCommand = 'previous';
      prevSlide();
      return document.documentElement.lang === 'en' ? 'Okay, previous slide' : 'حاضر، السابق';
    }
    if(t.includes('command') || t.includes('commands') || t.includes('قائمة الاوامر') || t.includes('اوامر') || t.includes('عرض الاوامر') || t.includes('help')){
      voiceActionExecuted = true;
      lastExecutedCommand = 'commands';
      showCommandsPopup();
      return document.documentElement.lang === 'en' ? 'Showing commands list' : 'أعرض قائمة الأوامر';
    }
    if(t.includes('read') || t.includes('اقرأ') || t.includes('اقرا') || t.includes('read slide')){
      // read current slide content via TTS (voice command forces English)
      voiceActionExecuted = true;
      lastExecutedCommand = 'read';
      readCurrentSlide('en-US');
      return 'Reading current slide';
    }
    // 'start' voice command removed — use UI/settings to start autoplay
    if(t.includes('أوقف') || t.includes('قف') || t.includes('اوقف') || t.includes('stop')){
      // if reader is active and using English, stop the reader
      if(window.speechSynthesis && speechSynthesis.speaking && lastReaderActive && lastReaderLang === 'en-US'){
        speechSynthesis.cancel();
        lastReaderActive = false;
        lastReaderLang = null;
        // if mic should be on, restart listening
        if(persistentMic) try{ startListening(); }catch(e){}
        return 'Stopped reading';
      }
      // otherwise stop autoplay
      stopPresentationAutoPlay();
      return document.documentElement.lang === 'en' ? 'Stopped auto presentation' : 'أوقفت العرض التلقائي';
    }
    // microphone control
    if(t.includes('off') || t.includes('mic off') || t.includes('turn off microphone') || t.includes('اطفي')){
      stopListening(true);
      return document.documentElement.lang === 'en' ? 'Microphone turned off' : 'تم إيقاف الميكروفون';
    }
    if(t.includes('on') || t.includes('mic on') || t.includes('turn on microphone') || t.includes('شغل الميكروفون')){
      if(!listening) startListening();
      persistentMic = true;
      return document.documentElement.lang === 'en' ? 'Microphone turned on' : 'تم تشغيل الميكروفون';
    }
    if(t.includes('كمل') || t.includes('استمر') || t.includes('واصل') || t.includes('continue')){
      // ask for duration to continue (allow user to change interval)
      awaitingDuration = true;
      const q2 = document.documentElement.lang === 'en' ? 'How many seconds per slide to continue?' : 'عايز تكمل كل صفحة بكام ثانية؟';
      setReplyText(q2);
      showVoiceNotice(true);
      return q2;
    }

    // fallback
    return document.documentElement.lang === 'en' ? 'Command not recognized, please repeat' : 'لم أفهم الأمر، حاول تاني';
  }

  if (micBtn){
    micBtn.addEventListener('click', ()=>{
      if(!listening) startListening(); else stopListening();
    })
  }
})();
