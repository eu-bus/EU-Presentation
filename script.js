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

    // Reset step for new slide
    currentStep = 0;
    // But slide starts with step 0 (base content), we wait for next click to show step 1

    handleSlideSpecifics(currentSlide, false);
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
