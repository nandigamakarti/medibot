document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- 1. SPA ROUTING & MOBILE NAV ---
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.page-section');
  const logoLink = document.getElementById('nav-logo');
  const burgerBtn = document.getElementById('burger-btn');
  const navMenu = document.getElementById('nav-menu');

  function navigateTo(targetId) {
    // Hide all sections
    sections.forEach(sec => {
      sec.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(`${targetId}-page`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update nav links active class
    navLinks.forEach(link => {
      if (link.getAttribute('data-target') === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile menu if open
    navMenu.classList.remove('mobile-open');

    // Update URL hash without triggering double events
    if (window.location.hash !== `#${targetId}`) {
      window.location.hash = targetId;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Listen to menu clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      navigateTo(target);
    });
  });

  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('home');
  });

  // Handle URL hashes on load
  function handleHashChange() {
    const hash = window.location.hash.substring(1);
    if (['home', 'privacy', 'about'].includes(hash)) {
      navigateTo(hash);
    } else {
      navigateTo('home');
    }
  }

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange(); // Run on initial load

  // Mobile menu burger toggle
  burgerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('mobile-open');
  });


  // --- 2. DARK/LIGHT THEME SWITCHER ---
  const themeBtn = document.getElementById('theme-btn');
  const htmlEl = document.documentElement;

  // Retrieve existing selection or default to light
  const storedTheme = localStorage.getItem('theme') || 'light';
  htmlEl.setAttribute('data-theme', storedTheme);
  updateThemeIcon(storedTheme);

  themeBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      themeBtn.innerHTML = '<i data-lucide="sun"></i>';
    } else {
      themeBtn.innerHTML = '<i data-lucide="moon"></i>';
    }
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }


  // --- 3. MEDIBOT AI CHATBOT SYSTEM ---
  const chatMessages = document.getElementById('chat-messages');
  const chatUserInput = document.getElementById('chat-user-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const quickPromptBtns = document.querySelectorAll('.quick-prompt-btn');

  if (chatMessages && chatUserInput && chatSendBtn) {
    // Diagnostic Response Dictionary
    const responseDb = {
      metformin: {
        answer: "<strong>Metformin</strong> is an oral medication primarily used to manage type 2 diabetes. It works by improving insulin sensitivity, increasing glucose uptake in cells, and reducing glucose production by the liver. <br><br><strong>Common Instructions:</strong> Usually taken with meals to reduce gastrointestinal side effects.<br><strong>Potential Side Effects:</strong> Nausea, mild diarrhea, metallic taste.",
        tags: ["diabetes", "sugar", "metformin", "glucophage"]
      },
      ibuprofen: {
        answer: "<strong>Ibuprofen</strong> is a Nonsteroidal Anti-inflammatory Drug (NSAID) used to relieve pain, reduce fever, and decrease inflammation. <br><br><strong>Contraindications:</strong> Avoid taking it alongside other NSAIDs (such as Aspirin, Naproxen) without consulting a physician, as this significantly increases the risk of gastrointestinal ulcers or bleeding.<br><strong>Guideline:</strong> Take with food or milk to protect stomach lining.",
        tags: ["pain", "ibuprofen", "advil", "motrin", "aspirin", "nsaid"]
      },
      sleep: {
        answer: "Establishing good sleep hygiene is crucial for biological recovery. Here are some clinician-backed suggestions:<br><br>1. <strong>Consistency:</strong> Go to bed and wake up at the exact same time daily, even on weekends.<br>2. <strong>Limit blue light:</strong> Turn off displays 1 hour before sleep.<br>3. <strong>Environment:</strong> Keep the room cool (65°F / 18°C) and dark.<br>4. <strong>Avoid Stimulants:</strong> Cease caffeine intake at least 6-8 hours before bed.",
        tags: ["sleep", "insomnia", "tired", "wellness", "fatigue", "night"]
      },
      bid: {
        answer: "In medical prescriptions, the abbreviation <strong>B.I.D.</strong> stands for the Latin term <em>'bis in die'</em>, which translates directly to <strong>twice a day</strong> (typically spaced 12 hours apart, e.g., 8:00 AM and 8:00 PM). <br><br><strong>Common related codes:</strong><br>- <strong>QD:</strong> Once daily<br>- <strong>TID:</strong> Three times daily<br>- <strong>QID:</strong> Four times daily",
        tags: ["bid", "prescription", "abbreviation", "latin", "code", "frequency"]
      },
      bloodpressure: {
        answer: "<strong>Hypertension (High Blood Pressure)</strong> is often known as a silent symptom. Maintain blood pressure logs below 120/80 mmHg. <br><br><strong>Wellness guidance:</strong> Focus on a low-sodium diet (DASH diet), engage in 30 minutes of moderate aerobic exercise daily, and monitor stress levels. Do not discontinue blood pressure prescriptions without physician consensus.",
        tags: ["hypertension", "blood pressure", "bp", "cardio", "heart"]
      },
      hello: {
        answer: "Hello! I am Medipocket, your AI health companion. I can help clarify prescription terminology, discuss medication guidelines, check basic interactions, and supply general wellness tips. How can I help you today?",
        tags: ["hello", "hi", "hey", "greetings"]
      }
    };

    // Pre-load Bot Greeting
    addChatMessage("bot", "Hello! I'm Medipocket, your smart health companion. Ask me about prescription abbreviations, medication functions, or wellness tips. (e.g. <em>'What is Metformin?'</em> or <em>'How do I improve sleep?'</em>)");

    function addChatMessage(sender, text) {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('message', sender);

      const avatarHtml = sender === 'bot' 
        ? '<div class="bot-avatar" style="width:34px;height:34px;font-size:0.95rem;"><i data-lucide="bot" style="width:16px;height:16px;"></i></div>' 
        : '';

      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      msgDiv.innerHTML = `
        ${avatarHtml}
        <div class="msg-bubble">
          <p>${text}</p>
          <span class="msg-time">${timeString}</span>
        </div>
      `;

      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }

    function showTypingIndicator() {
      const indicator = document.createElement('div');
      indicator.classList.add('message', 'bot', 'typing-container-msg');
      indicator.innerHTML = `
        <div class="bot-avatar" style="width:34px;height:34px;font-size:0.95rem;"><i data-lucide="bot" style="width:16px;height:16px;"></i></div>
        <div class="typing-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      `;
      chatMessages.appendChild(indicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
      return indicator;
    }

    function handleBotResponse(query) {
      const typingIndicator = showTypingIndicator();
      
      // Simulate natural intelligence thinking delay
      setTimeout(() => {
        // Remove typing indicator
        typingIndicator.remove();

        const cleanedQuery = query.toLowerCase().trim();
        let matchedResponse = null;

        // Scan DB keys
        for (const key in responseDb) {
          if (cleanedQuery.includes(key)) {
            matchedResponse = responseDb[key].answer;
            break;
          }
          // Scan tags
          const tags = responseDb[key].tags;
          if (tags.some(tag => cleanedQuery.includes(tag))) {
            matchedResponse = responseDb[key].answer;
            break;
          }
        }

        if (!matchedResponse) {
          matchedResponse = "I have recorded your query about <em>\"" + escapeHtml(query) + "\"</em>. While I cannot find an exact match in my local fast-reference catalog, general guidelines recommend consulting your prescribing doctor. <br><br>Try asking about <strong>Metformin</strong>, <strong>Ibuprofen</strong>, or <strong>prescription abbreviations</strong> like <strong>BID</strong>.";
        }

        addChatMessage("bot", matchedResponse);
      }, 1200);
    }

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function submitUserMessage() {
      const query = chatUserInput.value.trim();
      if (!query) return;

      addChatMessage("user", query);
      chatUserInput.value = '';
      handleBotResponse(query);
    }

    // Event Listeners for Chat
    chatSendBtn.addEventListener('click', submitUserMessage);
    chatUserInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitUserMessage();
      }
    });

    // Quick prompt button handlers
    quickPromptBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const query = e.currentTarget.getAttribute('data-query');
        addChatMessage("user", query);
        handleBotResponse(query);
      });
    });
  }


  // --- 4. MOCK REPORT ANALYZER ---
  const dropzone = document.getElementById('upload-dropzone');
  const fileSelector = document.getElementById('file-selector');
  const analyzerResults = document.getElementById('analyzer-results');
  
  const reportTitleEl = document.getElementById('report-title');
  const reportSafetyEl = document.getElementById('report-safety');
  const reportTermsEl = document.getElementById('report-terms');
  const reportRecsEl = document.getElementById('report-recommendations');
  const reportWarnsEl = document.getElementById('report-warnings');

  // Trigger file dialog
  if (dropzone) {
    dropzone.addEventListener('click', () => {
      fileSelector.click();
    });

    fileSelector.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        processMockFile(e.target.files[0]);
      }
    });

    // Drag & drop handlers
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        processMockFile(e.dataTransfer.files[0]);
      }
    });

    // Simulated Report Database based on extensions or filename
    function processMockFile(file) {
      // Show uploading/scanning status
      const originalText = dropzone.innerHTML;
      dropzone.innerHTML = `
        <i data-lucide="loader-2" class="dropzone-icon" style="animation: spin 2s linear infinite;"></i>
        <h4 class="dropzone-title">Analyzing ${file.name}...</h4>
        <p class="dropzone-text">Optical character recognition & safety review in progress...</p>
      `;
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      setTimeout(() => {
        // Reset dropzone UI
        dropzone.innerHTML = originalText;
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }

        // Generate simulated analysis data
        const fileNameLower = file.name.toLowerCase();
        let mockReport = {
          title: "Standard Lab Diagnostics Scan",
          safety: "General Reference",
          terms: "<strong>Glucolytic Metrics:</strong> Fasting blood glucose measures 94 mg/dL. <br><strong>Kidney Index:</strong> Serum Creatinine is at 0.85 mg/dL.",
          recs: "All metrics are within standard physiological boundaries. Fasting glucose indicates normal metabolic balance. Maintain balanced nutritional habits.",
          warnings: "Ensure compliance with scheduled physical examinations. These values represent static measurements and should be reviewed by your clinic."
        };

        if (fileNameLower.includes('prescrip') || fileNameLower.includes('rx') || fileNameLower.includes('med')) {
          mockReport = {
            title: "Prescription Formulation Scan",
            safety: "Active Treatment Plan",
            terms: "<strong>Rx: Amoxicillin 500mg:</strong> Labeled with instruction '1 Capsule TID' (Three times daily). Total duration: 10 days.",
            recs: "Amoxicillin is a penicillin-class antibiotic. Complete the full course of treatment as prescribed by your doctor, even if symptoms subside early, to prevent antibiotic resistance.",
            warnings: "Avoid consuming heavy dairy or alcohol alongside antibiotics. If you experience unexpected rashes, cease taking and consult urgent services immediately."
          };
        } else if (fileNameLower.includes('blood') || fileNameLower.includes('cbc') || fileNameLower.includes('report')) {
          mockReport = {
            title: "Complete Blood Count (CBC) Analysis",
            safety: "Clinical Metrics Panel",
            terms: "<strong>Hemoglobin:</strong> 13.8 g/dL (Normal). <br><strong>White Blood Cells (WBC):</strong> 6,200 cells/mcL (Standard range).",
            recs: "Hemoglobin levels indicate optimal oxygen transport capacity. WBC count shows stable immune activation parameters.",
            warnings: "If this scan was requested due to active infections or chronic fatigue, compare results with previous blood test records under doctor direction."
          };
        }

        // Populate & Display Results
        if (reportTitleEl) reportTitleEl.innerHTML = mockReport.title;
        if (reportSafetyEl) reportSafetyEl.innerHTML = mockReport.safety;
        if (reportTermsEl) reportTermsEl.innerHTML = mockReport.terms;
        if (reportRecsEl) reportRecsEl.innerHTML = mockReport.recs;
        if (reportWarnsEl) reportWarnsEl.innerHTML = mockReport.warnings;

        if (analyzerResults) {
          analyzerResults.style.display = 'block';
          analyzerResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Add a status notification
        showToast("Medical document successfully analyzed!");
      }, 1500);
    }
  }


  // --- 5. DYNAMIC WELLNESS TIPS SYSTEM ---
  const wellnessTips = [
    {
      text: "Drinking 8 ounces of water immediately after waking up helps jumpstart metabolism, rehydrates the body, and filters out cell toxins.",
      cat: "Hydration"
    },
    {
      text: "The 20-20-20 rule helps reduce digital eye strain: Every 20 minutes, look at something at least 20 feet away for 20 seconds.",
      cat: "Eye Health"
    },
    {
      text: "Consuming processed sugar within 3 hours of sleeping spikes cortisol levels, disrupting the production of melatonin and lowering sleep depth.",
      cat: "Sleep Wellness"
    },
    {
      text: "Taking a brisk 10-minute walk after meals improves insulin response, assists gastrointestinal flow, and supports heart health.",
      cat: "Cardio Fitness"
    },
    {
      text: "Proper desk ergonomics: Your eyes should align with the top third of your computer display, and your elbows should rest at a 90-degree angle.",
      cat: "Posture"
    }
  ];

  let currentTipIndex = 0;
  const tipTextEl = document.getElementById('tip-text');
  const tipCatEl = document.getElementById('tip-cat');
  const nextTipBtn = document.getElementById('next-tip-btn');

  if (tipTextEl && nextTipBtn) {
    function renderTip(index) {
      tipTextEl.style.opacity = 0;
      setTimeout(() => {
        tipTextEl.innerHTML = `"${wellnessTips[index].text}"`;
        if (tipCatEl) tipCatEl.innerHTML = wellnessTips[index].cat;
        tipTextEl.style.opacity = 1;
      }, 200);
    }

    // Load first tip
    renderTip(currentTipIndex);

    nextTipBtn.addEventListener('click', () => {
      currentTipIndex = (currentTipIndex + 1) % wellnessTips.length;
      renderTip(currentTipIndex);
    });
  }


  // --- 6. PRIVACY POLICY PAGE CONTROLLERS ---
  const privacySearch = document.getElementById('privacy-search');
  const policySections = document.querySelectorAll('.policy-section');

  // Privacy Term Search Filter
  privacySearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    policySections.forEach(item => {
      const keys = item.getAttribute('data-search-keys').toLowerCase();
      const contentText = item.querySelector('.policy-section-content').textContent.toLowerCase();
      const titleText = item.querySelector('.policy-section-title').textContent.toLowerCase();

      if (keys.includes(query) || contentText.includes(query) || titleText.includes(query)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });




  // --- 7. CONTACT FORM VALIDATION & SUBMISSION ---
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');

  const errorName = document.getElementById('error-name');
  const errorEmail = document.getElementById('error-email');
  const errorSubject = document.getElementById('error-subject');
  const errorMessage = document.getElementById('error-message');

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset error states
    const inputs = [nameInput, emailInput, subjectInput, messageInput];
    const errors = [errorName, errorEmail, errorSubject, errorMessage];
    
    inputs.forEach(input => input.classList.remove('invalid'));
    errors.forEach(err => err.style.display = 'none');

    // Name Validate
    if (!nameInput.value.trim()) {
      nameInput.classList.add('invalid');
      errorName.style.display = 'block';
      isValid = false;
    }

    // Email Validate
    if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
      emailInput.classList.add('invalid');
      errorEmail.style.display = 'block';
      isValid = false;
    }

    // Subject Validate
    if (!subjectInput.value.trim()) {
      subjectInput.classList.add('invalid');
      errorSubject.style.display = 'block';
      isValid = false;
    }

    // Message Validate
    if (!messageInput.value.trim()) {
      messageInput.classList.add('invalid');
      errorMessage.style.display = 'block';
      isValid = false;
    }

    if (isValid) {
      // Simulate Successful Submission
      showToast("Inquiry submitted successfully!");
      contactForm.reset();
    }
  });


  // --- TOAST NOTIFICATION UTILITY ---
  const toastNotification = document.getElementById('toast-notification');
  const toastText = document.getElementById('toast-text');
  let toastTimeout = null;

  function showToast(message) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastText.textContent = message;
    toastNotification.classList.add('show');

    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3000);
  }

});
