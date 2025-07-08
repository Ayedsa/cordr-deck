let currentLang = localStorage.getItem("language") || "en";

function setLanguageContent(lang) {
  document.querySelectorAll("[data-lang-en], [data-lang-ar]").forEach(element => {
    if (element.tagName === "INPUT" || element.tagName === "SELECT") {
      if (lang === "en" && element.dataset.langEnPlaceholder) {
        element.placeholder = element.dataset.langEnPlaceholder;
      } else if (lang === "ar" && element.dataset.langArPlaceholder) {
        element.placeholder = element.dataset.langArPlaceholder;
      }
      if (element.tagName === "SELECT") {
        Array.from(element.options).forEach(option => {
          if (lang === "en" && option.dataset.langEn) {
            option.textContent = option.dataset.langEn;
          } else if (lang === "ar" && option.dataset.langAr) {
            option.textContent = option.dataset.langAr;
          }
        });
      }
    } else if (lang === "en" && element.dataset.langEn) {
      element.textContent = element.dataset.langEn;
    } else if (lang === "ar" && element.dataset.langAr) {
      element.textContent = element.dataset.langAr;
    }
  });
  document.body.classList.toggle("ar", lang === "ar");
  document.body.classList.toggle("en", lang === "en");
  document.documentElement.lang = lang;
}

window.switchLanguage = function(lang) {
  currentLang = lang;
  localStorage.setItem("language", lang);
  setLanguageContent(lang);
  // Call any page-specific update functions if they exist
  if (typeof window.updatePageContent === 'function') {
    window.updatePageContent(lang);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setLanguageContent(currentLang);
  // Set up language toggle button listener if it exists
  const langToggleButton = document.querySelector(".language-toggle");
  if (langToggleButton) {
    langToggleButton.textContent = currentLang === "en" ? "العربية" : "English";
    langToggleButton.addEventListener("click", () => {
      window.switchLanguage(currentLang === "en" ? "ar" : "en");
      langToggleButton.textContent = currentLang === "en" ? "العربية" : "English";
    });
  }
});


