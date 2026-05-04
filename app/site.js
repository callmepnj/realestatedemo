import { brandData } from "../data/brand.js";
import { legalLinks, mobileNavigationGroups, moreNavigation, primaryNavigation, quickLinks } from "../data/navigation.js";

const routeMap = {
  home: "/",
  projects: "/projects/",
  villas: "/villas/",
  investor: "/investor/",
  nri: "/nri/",
  gallery: "/gallery/",
  blogs: "/blogs/",
  contact: "/contact/",
  dashboard: "/dashboard/"
};

const themeKey = "acreages-theme";

export function pageHref(key) {
  return routeMap[key] || "/";
}

export function contactHref(intent = "", project = "") {
  const params = new URLSearchParams();
  if (intent) params.set("intent", intent);
  if (project) params.set("project", project);
  const query = params.toString();
  return query ? `${pageHref("contact")}?${query}` : pageHref("contact");
}

export function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function navLink(link, currentPage, className = "") {
  const isActive = link.key === currentPage;
  const activeClass = isActive ? "is-active" : "";
  const current = isActive ? ' aria-current="page"' : "";
  const classes = [className, activeClass].filter(Boolean).join(" ");
  return `<a class="${classes}" href="${link.href || pageHref(link.key)}"${current}>${link.label}</a>`;
}

function renderDesktopNav(currentPage) {
  const moreActive = moreNavigation.some((link) => link.key === currentPage);
  return `
    <nav class="main-nav" id="mainNav" aria-label="Primary">
      <div class="main-nav__group">
        ${primaryNavigation.map((link) => navLink(link, currentPage, "main-nav__link")).join("")}
        <div class="nav-more ${moreActive ? "is-active" : ""}" id="navMoreWrap">
          <button class="nav-more__toggle ${moreActive ? "is-active" : ""}" id="navMoreToggle" type="button" aria-expanded="false" aria-controls="navMoreMenu">
            <span>More</span>
            <span class="nav-more__caret" aria-hidden="true"></span>
          </button>
          <div class="nav-more__menu" id="navMoreMenu" role="menu" aria-label="More navigation">
            ${moreNavigation.map((link) => navLink(link, currentPage, "nav-more__link")).join("")}
          </div>
        </div>
      </div>
    </nav>
  `;
}

function renderMobileGroups(currentPage) {
  return mobileNavigationGroups.map((group) => `
    <section class="mobile-nav-section">
      <p class="mobile-nav-section__title">${group.title}</p>
      <div class="mobile-nav-links">
        ${group.links.map((link) => navLink(link, currentPage, "mobile-nav__link")).join("")}
      </div>
    </section>
  `).join("");
}

export function renderHeader(currentPage) {
  const node = document.getElementById("siteHeader");
  if (!node) return;

  node.innerHTML = `
    <div class="site-header__bar">
      <a class="brand" href="${pageHref("home")}" aria-label="Acreages Developers home">
        <span class="brand-mark">AC</span>
        <span class="brand-copy">
          <strong>Acreages Developers</strong>
          <small>Premium farmhouse and weekend-home projects</small>
        </span>
      </a>

      ${renderDesktopNav(currentPage)}

      <div class="header-actions">
        <a class="btn btn-outline header-actions__secondary" href="${brandData.social.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle light and dark theme" title="Toggle theme">
          <span class="theme-toggle__icon" aria-hidden="true">?</span>
          <span class="sr-only theme-toggle__label">Toggle theme</span>
        </button>
        <a class="header-cta" href="${contactHref("Site Visit")}">Book Site Visit</a>
      </div>

      <button class="mobile-menu-btn" id="mobileMenuBtn" type="button" aria-expanded="false" aria-controls="mobileNavPanel" aria-label="Toggle navigation menu">
        <span></span>
        <span></span>
        <span></span>
        <span class="sr-only">Toggle navigation</span>
      </button>
    </div>

    <div class="mobile-nav-panel" id="mobileNavPanel" aria-label="Mobile navigation">
      <div class="mobile-nav-panel__inner">
        ${renderMobileGroups(currentPage)}
        <section class="mobile-nav-section mobile-nav-section--actions">
          <p class="mobile-nav-section__title">Actions</p>
          <div class="mobile-nav-actions">
            <a class="btn btn-solid" href="${contactHref("Site Visit")}">Book Site Visit</a>
            <a class="btn btn-outline" href="${brandData.social.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a class="btn btn-outline" href="${pageHref("contact")}">Contact Team</a>
            <button class="btn btn-outline mobile-theme-toggle" id="mobileThemeToggle" type="button">Switch Theme</button>
          </div>
        </section>
      </div>
    </div>
  `;
}

export function renderFooter() {
  const node = document.getElementById("siteFooter");
  if (!node) return;

  node.innerHTML = `
    <div>
      <strong>Acreages Developers</strong>
      <p>${brandData.footerDescription}</p>
    </div>
    <div>
      <a href="tel:${brandData.contact.salesPhone.replaceAll(" ", "")}">${brandData.contact.salesPhone}</a>
      <a href="mailto:${brandData.contact.email}">${brandData.contact.email}</a>
      <a href="${brandData.social.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a href="${brandData.social.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
      <a href="${brandData.social.youtube}" target="_blank" rel="noopener noreferrer">YouTube</a>
    </div>
    <div>
      ${quickLinks.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")}
      ${legalLinks.slice(0, 2).map((link) => `<a href="${link.href}" target="_blank" rel="noopener noreferrer">${link.label}</a>`).join("")}
      <span>${new Date().getFullYear()} Acreages Developers. All rights reserved.</span>
    </div>
  `;
}

export function initReveal() {
  const nodes = document.querySelectorAll(".reveal, .reveal-delay, .reveal-delay-2");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.18 });

  nodes.forEach((node) => observer.observe(node));
}

function applyTheme(theme) {
  const isLight = theme === "light";
  const toggleLabel = isLight ? "Switch to dark mode" : "Switch to light mode";
  const toggleIcon = isLight ? "☾" : "☀";

  document.body.dataset.theme = theme;

  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle?.querySelector(".theme-toggle__icon");
  themeToggle?.setAttribute("title", toggleLabel);
  themeToggle?.setAttribute("aria-label", toggleLabel);
  if (themeIcon) {
    themeIcon.textContent = toggleIcon;
  }

  const mobileButton = document.getElementById("mobileThemeToggle");
  if (mobileButton) {
    mobileButton.textContent = isLight ? "Switch To Night" : "Switch To Day";
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(themeKey) || "dark";
  applyTheme(savedTheme);

  const toggleTheme = () => {
    const next = document.body.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem(themeKey, next);
    applyTheme(next);
  };

  document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
  document.getElementById("mobileThemeToggle")?.addEventListener("click", toggleTheme);
}

function initHeaderState() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  const apply = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  apply();
  window.addEventListener("scroll", apply, { passive: true });
}

function setMenuState(isOpen) {
  const header = document.getElementById("siteHeader");
  const button = document.getElementById("mobileMenuBtn");
  if (!header || !button) return;

  header.classList.toggle("menu-open", isOpen);
  button.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}

function setMoreState(isOpen) {
  const wrap = document.getElementById("navMoreWrap");
  const toggle = document.getElementById("navMoreToggle");
  if (!wrap || !toggle) return;

  wrap.classList.toggle("is-open", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
}

function initMoreMenu() {
  const wrap = document.getElementById("navMoreWrap");
  const toggle = document.getElementById("navMoreToggle");
  if (!wrap || !toggle) return;

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    const next = !wrap.classList.contains("is-open");
    setMoreState(next);
  });

  document.querySelectorAll(".nav-more__link").forEach((link) => {
    link.addEventListener("click", () => setMoreState(false));
  });
}

function initMobileMenu() {
  document.getElementById("mobileMenuBtn")?.addEventListener("click", () => {
    const header = document.getElementById("siteHeader");
    setMenuState(!header?.classList.contains("menu-open"));
  });

  document.querySelectorAll(".mobile-nav__link, .mobile-nav-actions a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1320) setMenuState(false);
  });
}

function initOutsideClose() {
  document.addEventListener("click", (event) => {
    const header = document.getElementById("siteHeader");
    const moreWrap = document.getElementById("navMoreWrap");
    if (header?.classList.contains("menu-open") && !header.contains(event.target)) {
      setMenuState(false);
    }
    if (moreWrap?.classList.contains("is-open") && !moreWrap.contains(event.target)) {
      setMoreState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
      setMoreState(false);
    }
  });
}

function initFloatingWhatsApp() {
  const button = document.getElementById("floatingWhatsapp");
  if (button) button.href = brandData.social.whatsapp;
}

export function initializeChrome(currentPage) {
  renderHeader(currentPage);
  renderFooter();
  initTheme();
  initHeaderState();
  initMoreMenu();
  initMobileMenu();
  initOutsideClose();
  initFloatingWhatsApp();
}


