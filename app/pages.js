import { blogPosts, insightPanels } from "../data/blogs.js";
import { brandData } from "../data/brand.js";
import { galleryImages } from "../data/gallery.js";
import { budgetOptions, leadIntentOptions, projectInterestOptions } from "../data/leads.js";
import {
  featuredProjects,
  ongoingProjects,
  signatureProjects,
  soldOutProjects,
  upcomingProjects
} from "../data/projects.js";
import {
  advisoryServices,
  blogTopicClusters,
  brandPillars,
  careersHighlights,
  channelPartnerHighlights,
  contactPoints,
  faqHighlights,
  investorHighlights,
  investorSteps,
  landTermHighlights,
  nriHighlights,
  privacyHighlights,
  projectSelectionGuides,
  publicOffers,
  termsHighlights,
  referralHighlights,
  returnRoutes
} from "../data/support.js";
import { villaOptions } from "../data/villas.js";
import { contactHref, pageHref } from "./site.js";
import { formatRecordDate, getStoredRecords } from "./lead-store.js";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function projectCard(project) {
  return `
    <article class="collection-card reveal" id="${project.id}">
      <p class="card-label">${project.status} &bull; ${project.category}</p>
      <h3>${project.name}</h3>
      <strong class="price-line">${project.location}</strong>
      <ul>
        <li>${project.headline}</li>
        <li>${project.highlights[0]}</li>
        <li>${project.priceNote}</li>
      </ul>
      <a class="text-link" href="${contactHref("Brochure Request", project.name)}">${project.cta}</a>
    </article>
  `;
}

function detailedProjectCard(project) {
  return `
    <article class="collection-card reveal" id="${project.id}">
      <p class="card-label">${project.status} &bull; ${project.category}</p>
      <h3>${project.name}</h3>
      <strong class="price-line">${project.location}</strong>
      <ul>
        <li>${project.description}</li>
        <li>${project.highlights[0]}</li>
        <li>${project.highlights[1]}</li>
        <li>${project.locationAdvantage}</li>
      </ul>
      <a class="text-link" href="${contactHref("Brochure Request", project.name)}">${project.cta}</a>
    </article>
  `;
}

function simpleProjectCard(project) {
  return `
    <article class="collection-card reveal" id="${project.id}">
      <p class="card-label">${project.status} &bull; ${project.category}</p>
      <h3>${project.name}</h3>
      <strong class="price-line">${project.location}</strong>
      <ul>
        <li>${project.headline}</li>
        ${project.highlights.slice(0, 2).map((highlight) => `<li>${highlight}</li>`).join("")}
      </ul>
      <a class="text-link" href="${contactHref("Callback", project.name)}">${project.cta}</a>
    </article>
  `;
}

function soldOutCard(project) {
  return `
    <article class="collection-card reveal">
      <p class="card-label">Sold Out &bull; Legacy</p>
      <h3>${project.name}</h3>
      <strong class="price-line">${project.location}</strong>
      <ul>
        <li>${project.summary}</li>
        ${project.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}
      </ul>
    </article>
  `;
}

function formatGalleryMeta(value) {
  return String(value || "General")
    .replaceAll("-", " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function galleryCard(image, large = false, delay = "", index = 0) {
  const project = formatGalleryMeta(image.project);
  const type = formatGalleryMeta(image.type);
  const description = escapeHtml(image.alt);
  return `
    <figure class="gallery-card${large ? " gallery-card-large" : ""} ${delay}" data-gallery-figure>
      <button
        class="gallery-card__button"
        type="button"
        data-gallery-item
        data-index="${index}"
        data-project="${escapeHtml(project)}"
        data-type="${escapeHtml(type)}"
        aria-label="Open ${escapeHtml(project)} image"
      >
        <img src="/${image.src}" alt="${description}" loading="lazy">
        <figcaption class="gallery-card__meta">
          <span class="gallery-card__type">${type}</span>
          <strong>${project}</strong>
          <small>${description}</small>
        </figcaption>
      </button>
    </figure>
  `;
}

function statCard(stat) {
  return `
    <div class="trust-stat">
      <strong>${stat.value}${stat.suffix}</strong>
      <span>${stat.label}</span>
    </div>
  `;
}

function showcaseTab(project, index) {
  return `
    <button
      class="featured-showcase__tab${index === 0 ? " is-active" : ""}"
      type="button"
      role="tab"
      data-showcase-tab
      data-index="${index}"
      aria-selected="${index === 0 ? "true" : "false"}"
      aria-controls="featured-project-panel-${project.id}"
    >
      <span class="featured-showcase__tab-count">${String(index + 1).padStart(2, "0")}</span>
      <span class="featured-showcase__tab-copy">
        <strong>${project.name}</strong>
        <span>${project.location}</span>
      </span>
      <span class="featured-showcase__tab-status">${project.status}</span>
    </button>
  `;
}

function showcaseSlide(project, index, total) {
  return `
    <article
      class="featured-showcase__slide${index === 0 ? " is-active" : ""}"
      id="featured-project-panel-${project.id}"
      role="tabpanel"
      data-showcase-slide
      data-index="${index}"
      aria-hidden="${index === 0 ? "false" : "true"}"
    >
      <div class="featured-showcase__media">
        <img src="/${project.image}" alt="${escapeHtml(project.alt)}" loading="${index === 0 ? "eager" : "lazy"}">
        <div class="featured-showcase__badge-row">
          <span class="featured-showcase__status">${project.status}</span>
          <span class="featured-showcase__category">${project.category}</span>
        </div>
      </div>

      <div class="featured-showcase__content">
        <p class="eyebrow">Featured Project ${index + 1} / ${total}</p>
        <h3>${project.name}</h3>
        <p class="featured-showcase__location">${project.location}</p>
        <p class="featured-showcase__headline">${project.headline}</p>
        <p class="featured-showcase__description">${project.description}</p>

        <ul class="featured-showcase__highlights">
          ${project.highlights.slice(0, 4).map((highlight) => `<li>${highlight}</li>`).join("")}
        </ul>

        <div class="hero-actions featured-showcase__actions">
          <a class="btn btn-solid" href="${pageHref("projects")}#${project.id}">Explore Project</a>
          <a class="btn btn-outline" href="${contactHref("Site Visit", project.name)}">Book Site Visit</a>
        </div>

        <div class="featured-showcase__meta">
          <span>${project.priceNote}</span>
          <a class="text-link" href="${contactHref("Brochure Request", project.name)}">Request Details</a>
        </div>
      </div>
    </article>
  `;
}

function featureCards(items) {
  return items.map((item, index) => `
    <article class="feature-card reveal${index % 3 === 1 ? "-delay" : index % 3 === 2 ? "-delay-2" : ""}">
      <span class="feature-index">${String(index + 1).padStart(2, "0")}</span>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join("");
}

function faqCards(items) {
  return items.map((item) => `
    <article class="collection-card reveal">
      <p class="card-label">FAQ</p>
      <h3>${item.question}</h3>
      <ul>
        <li>${item.answer}</li>
      </ul>
    </article>
  `).join("");
}

function homePage() {
  const showcaseProjects = featuredProjects.slice(0, 7);
  return `
    <section class="hero section-shell" id="home">
      <div class="hero-copy reveal">
        <p class="eyebrow">${brandData.eyebrow}</p>
        <h1>${brandData.heroTitle}</h1>
        <p class="hero-text">${brandData.heroDescription}</p>

        <div class="hero-actions">
          <a class="btn btn-solid" href="${pageHref("projects")}">View All Projects</a>
          <a class="btn btn-outline" href="${contactHref("Site Visit")}">Book Site Visit</a>
        </div>

        <div class="hero-microproof">
          ${brandData.trustChips.map((chip) => `<span>${chip}</span>`).join("")}
        </div>
      </div>

      <div class="hero-visual reveal-delay">
        <figure class="hero-main-card">
          <img src="/${brandData.heroMedia.primary.src}" alt="${escapeHtml(brandData.heroMedia.primary.alt)}">
          <figcaption>
            <strong>Nature-first living with better sales clarity.</strong>
            <span>Acreages now carries richer project, support, and buyer-education content inside the same approved premium UI.</span>
          </figcaption>
        </figure>

        <div class="hero-floating-card price-card">
          <p>Trust Positioning</p>
          <strong>12+ Years</strong>
          <span>Used consistently as the safest common public experience claim across the brand.</span>
        </div>

        <div class="hero-floating-card landmark-card">
          <p>Buyer Hook</p>
          <strong>Clear-title weekend-home story</strong>
          <span>Supported by legal guidance, gated-community references, and organized follow-up routes.</span>
        </div>

        <div class="hero-stack">
          ${brandData.heroMedia.secondary.map((item) => `<img src="/${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy">`).join("")}
        </div>
      </div>
    </section>

    <section class="trust-band">
      ${brandData.stats.map(statCard).join("")}
      <div class="trust-stat"><strong>7+</strong><span>Sold-out project references</span></div>
    </section>

    <section class="section-shell featured-showcase reveal" data-featured-showcase>
      <div class="section-heading featured-showcase__header">
        <p class="eyebrow">Featured Projects Showcase</p>
        <h2>Let the project story unfold one community at a time.</h2>
        <p>The homepage still stays concise, but the showcase now reflects richer public Acreages project detail instead of thin previews.</p>
      </div>

      <div class="featured-showcase__layout">
        <div class="featured-showcase__tabs" role="tablist" aria-label="Featured Acreages projects">
          ${showcaseProjects.map(showcaseTab).join("")}
        </div>

        <div class="featured-showcase__stage">
          <div class="featured-showcase__slides">
            ${showcaseProjects.map((project, index) => showcaseSlide(project, index, showcaseProjects.length)).join("")}
          </div>

          <div class="featured-showcase__footer">
            <div class="featured-showcase__progress" aria-hidden="true">
              <span class="featured-showcase__progress-bar" data-showcase-progress></span>
            </div>

            <div class="featured-showcase__controls">
              <button class="featured-showcase__control" type="button" data-showcase-prev aria-label="Show previous project">Prev</button>
              <div class="featured-showcase__dots">
                ${showcaseProjects.map((project, index) => `
                  <button
                    class="featured-showcase__dot${index === 0 ? " is-active" : ""}"
                    type="button"
                    data-showcase-dot
                    data-index="${index}"
                    aria-label="View ${project.name}"
                    aria-pressed="${index === 0 ? "true" : "false"}"
                  ></button>
                `).join("")}
              </div>
              <button class="featured-showcase__control" type="button" data-showcase-next aria-label="Show next project">Next</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">Why Acreages</p>
        <h2>Keep the homepage short, but let the core brand pillars still come through.</h2>
        <p>${brandData.aboutSummary}</p>
      </div>

      <div class="feature-grid reveal-delay">
        ${featureCards(brandPillars.slice(0, 3))}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Project Preview</p>
        <h2>Featured Acreages opportunities</h2>
        <p>The full inventory now lives on the Projects page, while the homepage still previews the strongest current communities.</p>
      </div>
      <div class="collection-grid">
        ${ongoingProjects.slice(0, 4).map(projectCard).join("")}
      </div>
      <div class="hero-actions" style="margin-top:28px;">
        <a class="btn btn-solid" href="${pageHref("projects")}">Explore All Projects</a>
      </div>
    </section>

    <section class="section-shell gallery-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Visual Tour</p>
        <h2>Use the landscape to do the selling.</h2>
        <p>The gallery keeps the same visual energy while using Acreages-specific project and lifestyle imagery.</p>
      </div>
      <div class="gallery-grid">
        ${galleryCard(galleryImages[0], true, "reveal", 0)}
        ${galleryCard(galleryImages[1], false, "reveal-delay", 1)}
        ${galleryCard(galleryImages[2], false, "reveal-delay-2", 2)}
        ${galleryCard(galleryImages[3], false, "reveal", 3)}
        ${galleryCard(galleryImages[4], false, "reveal-delay", 4)}
      </div>
    </section>

    <section class="section-shell contact-layout">
      <div class="contact-copy reveal">
        <p class="eyebrow">Next Step</p>
        <h2>Book a site visit or move straight into a project enquiry.</h2>
        <p>The homepage stays concise. The detailed routes now hold the deeper project, investor, NRI, legal, and support content from the Acreages data file.</p>
        <div class="contact-badges">
          <span>Projects page</span>
          <span>Investor and NRI support</span>
          <span>Contact and legal routes</span>
        </div>
      </div>
      <div class="roi-card reveal-delay">
        <label>Quick Routes</label>
        <div class="hero-actions">
          <a class="btn btn-solid" href="${pageHref("investor")}">Investor Details</a>
          <a class="btn btn-outline" href="${pageHref("contact")}">Contact Team</a>
        </div>
      </div>
    </section>
  `;
}

function projectsPage() {
  return `
    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Projects</p>
        <h2>Explore Acreages Developers' ongoing, signature, and upcoming opportunities.</h2>
        <p>The Word file now fills in the missing public project details while keeping the same clean card-based project browsing flow.</p>
      </div>
      <div class="collection-grid">
        ${ongoingProjects.map(detailedProjectCard).join("")}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Signature and Advisory</p>
        <h2>Projects with strong positioning but lighter or more specialized public detail.</h2>
        <p>These references are useful for highway-investment buyers, early launch interest, hill-station seekers, or advisory-led conversations.</p>
      </div>
      <div class="collection-grid">
        ${signatureProjects.map(detailedProjectCard).join("")}
      </div>
    </section>

    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">Project Selection Guide</p>
        <h2>A quicker way to match buyer intent with the right Acreages story.</h2>
        <p>The project-selection logic below comes directly from the public Acreages FAQ and project summaries in the uploaded document.</p>
      </div>
      <div class="feature-grid reveal-delay">
        ${featureCards(projectSelectionGuides)}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Upcoming References</p>
        <h2>Early-launch and pre-booking routes that need team confirmation for live detail.</h2>
        <p>These projects stay intentionally light because the public document does not confirm full sizes, pricing, amenities, or approvals yet.</p>
      </div>
      <div class="collection-grid">
        ${upcomingProjects.map(simpleProjectCard).join("")}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Sold-Out References</p>
        <h2>Legacy communities that strengthen the Acreages story.</h2>
        <p>The sold-out inventory now carries more useful context instead of just names, but stays honest where archived details are limited.</p>
      </div>
      <div class="collection-grid">
        ${soldOutProjects.map(soldOutCard).join("")}
      </div>
    </section>
  `;
}

function villasPage() {
  return `
    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">Villas</p>
        <h2>Villa concepts for buyers who want a more finished weekend-home expression.</h2>
        <p>Acreages publicly shows multiple construction directions, from RCC bungalows to red-laterite villas and prefab formats. This page now carries that detail without pretending every option is live inventory in every project.</p>
      </div>
      <div class="location-photo reveal-delay">
        <img src="/photos/free-photo-of-scenic-view-of-house-with-misty-mountains-in-background.jpeg" alt="Villa inspiration for Acreages">
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="collection-grid">
        ${villaOptions.map((villa) => `
          <article class="collection-card reveal">
            <p class="card-label">Villa Option</p>
            <h3>${villa.title}</h3>
            <strong class="price-line">${villa.price}</strong>
            <ul>
              <li>${villa.note}</li>
              <li>${villa.bestFor}</li>
              <li>All starting prices should be treated as indicative only and confirmed with the Acreages team.</li>
            </ul>
            <a class="text-link" href="${contactHref("Villa Enquiry")}">Request Villa Details</a>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">Beyond Construction</p>
        <h2>Weekend-home ownership can be planned for use, hosting, or long-hold lifestyle value.</h2>
        <p>The public Acreages service pages connect villa construction with lifestyle planning, rental thinking, and plantation-led land use.</p>
      </div>
      <div class="feature-grid reveal-delay">
        ${featureCards(returnRoutes.slice(0, 3))}
      </div>
    </section>
  `;
}

function investorPage() {
  return `
    <section class="section-shell roi-layout">
      <div class="section-copy reveal">
        <p class="eyebrow">Investor</p>
        <h2>Land as a long-term asset, without the noise.</h2>
        <p>Acreages publicly targets investors and promoters, but this page keeps the message balanced: verified projects, transparent process, and team guidance matter more than aggressive promise-led copy.</p>
      </div>

      <div class="roi-card reveal-delay">
        <label for="investmentRange">Illustrative investment</label>
        <input id="investmentRange" type="range" min="1500000" max="8000000" step="100000" value="2500000">
        <strong id="investmentValue">Rs. 25.0 L</strong>

        <label for="growthRange">Illustrative annual appreciation</label>
        <input id="growthRange" type="range" min="4" max="18" step="1" value="10">
        <strong id="growthValue">10%</strong>

        <label for="yearsRange">Illustrative holding period</label>
        <input id="yearsRange" type="range" min="3" max="12" step="1" value="5">
        <strong id="yearsValue">5 years</strong>

        <div class="roi-results">
          <div><span>Projected value</span><strong id="futureValue">Rs. 40.3 L</strong></div>
          <div><span>Estimated gain</span><strong id="gainValue">Rs. 15.3 L</strong></div>
          <div><span>Total return</span><strong id="returnValue">61%</strong></div>
        </div>
      </div>
    </section>

    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">Important Note</p>
        <h2>No guaranteed returns.</h2>
        <p>This calculator is illustrative only. Actual appreciation depends on market conditions, location, documentation, demand, holding period, and project fit.</p>
      </div>
      <div class="feature-grid reveal-delay">
        ${featureCards(investorHighlights)}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Promoter Flow</p>
        <h2>The investor route on the public site follows a simple three-step structure.</h2>
        <p>This keeps the sales language useful while routing final commercial, legal, and risk detail to Investor Relations.</p>
      </div>
      <div class="collection-grid">
        ${investorSteps.map((step, index) => `
          <article class="collection-card reveal">
            <p class="card-label">Step ${index + 1}</p>
            <h3>${step.title}</h3>
            <ul>
              <li>${step.text}</li>
              <li>Exact terms, payouts, and structure should come from the Acreages investor team.</li>
            </ul>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section-shell contact-layout">
      <div class="contact-copy reveal">
        <p class="eyebrow">Investor Relations</p>
        <h2>Use the dedicated investor route for live commercial detail.</h2>
        <p>Public investor messaging should stay measured. For promoter participation, project terms, and risk details, move the buyer into a direct follow-up with Investor Relations.</p>
        <div class="contact-badges">
          <span>${brandData.contact.investorName}</span>
          <span>${brandData.contact.salesPhone}</span>
          <span>${brandData.contact.investorEmail}</span>
        </div>
      </div>
      <div class="roi-card reveal-delay">
        <label>Direct next step</label>
        <div class="hero-actions">
          <a class="btn btn-solid" href="${contactHref("Investor Enquiry", "Investor / Promoter")}">Request Investor Callback</a>
          <a class="btn btn-outline" href="mailto:${brandData.contact.investorEmail}">Email Investor Relations</a>
        </div>
      </div>
    </section>
  `;
}

function nriPage() {
  return `
    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">NRI Enquiries</p>
        <h2>Wherever you roam, the Acreages journey should still feel guided and clear.</h2>
        <p>The uploaded Acreages document adds stronger NRI detail here: overseas communication channels, trust pillars, family-root messaging, and a cleaner callback flow for buyers abroad.</p>
      </div>
      <div class="feature-grid reveal-delay">
        ${featureCards(nriHighlights)}
      </div>
    </section>

    <section class="section-shell location-layout">
      <div class="location-photo reveal">
        <img src="/photos/Avyay-Park-Web.png" alt="Acreages lifestyle visual for NRI page" loading="lazy">
      </div>
      <div class="location-copy reveal-delay">
        <p class="eyebrow">NRI Support Route</p>
        <h2>Project selection, legal clarity, and remote communication in one path.</h2>
        <div class="location-points">
          <article><strong>Start with country and preferred location</strong><p>The cleanest first step is to share your country, preferred project or location, and contact details so the Acreages team can shortlist properly.</p></article>
          <article><strong>Use familiar communication channels</strong><p>WhatsApp, Signal, Botim, phone, and email are all referenced publicly for smoother international follow-up.</p></article>
          <article><strong>Ask for team-confirmed details</strong><p>Pricing, documentation, current project availability, and legal process details should come directly from Acreages after the first callback.</p></article>
        </div>
      </div>
    </section>

    <section class="section-shell contact-layout">
      <div class="contact-copy reveal">
        <p class="eyebrow">Dedicated Follow-Up</p>
        <h2>Share your country, project preference, and callback preference.</h2>
        <p>Acreages' public NRI story leans on legal and ethical practices, expertise, and customer-centric support rather than a generic overseas sales pitch.</p>
        <div class="contact-badges">
          <span>12 Years</span>
          <span>167+ NRI Families Guided</span>
          <span>WhatsApp, Signal, Botim</span>
        </div>
      </div>
      <div class="roi-card reveal-delay">
        <label>NRI action</label>
        <div class="hero-actions">
          <a class="btn btn-solid" href="${contactHref("NRI Enquiry")}">Request NRI Callback</a>
          <a class="btn btn-outline" href="${brandData.social.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp Acreages</a>
        </div>
      </div>
    </section>
  `;
}

function galleryPage() {
  const items = galleryImages.slice(0, 12);
  const galleryFilters = ["All", ...new Set(items.map((image) => formatGalleryMeta(image.type)))];
  return `
    <section class="section-shell gallery-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Gallery</p>
        <h2>Acreages visuals matched to your local image library.</h2>
        <p>This page keeps the original gallery feel while adding richer project detail, movement, and swipe-friendly viewing.</p>
      </div>

      <div class="gallery-toolbar reveal-delay">
        <div class="gallery-filters" role="tablist" aria-label="Gallery categories">
          ${galleryFilters.map((filter, index) => `
            <button
              class="gallery-filter${index === 0 ? " is-active" : ""}"
              type="button"
              data-gallery-filter
              data-filter="${filter === "All" ? "all" : filter.toLowerCase().replaceAll(" ", "-")}"
              aria-pressed="${index === 0 ? "true" : "false"}"
            >${filter}</button>
          `).join("")}
        </div>
        <p class="gallery-toolbar__hint">Hover for project detail, tap to open, and swipe through the collection.</p>
      </div>

      <div class="gallery-grid" data-gallery-grid>
        ${items.map((image, index) => galleryCard(image, index === 0, index % 3 === 1 ? "reveal-delay" : index % 3 === 2 ? "reveal-delay-2" : "reveal", index)).join("")}
      </div>
    </section>
  `;
}

function getSelectedBlogPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("post");
  if (!slug) return null;
  return blogPosts.find((post) => post.slug === slug) || null;
}

function blogDetailPage(post) {
  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  return `
    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <a class="text-link" href="${pageHref("blogs")}">Back to all insights</a>
        <p class="eyebrow">Acreages Insight Brief</p>
        <h2>${post.title}</h2>
        <p>${post.overview}</p>
        <div class="contact-badges">
          <span>${post.date}</span>
          <span>${post.category}</span>
          <span>Internal demo view</span>
        </div>
        <div class="hero-actions">
          <a class="btn btn-solid" href="${contactHref("Brochure Request")}">Talk to Acreages</a>
          <a class="btn btn-outline" href="${pageHref("projects")}">Explore Projects</a>
        </div>
      </div>
      <div class="location-photo reveal-delay">
        <img src="/${post.image}" alt="${escapeHtml(post.alt)}" loading="lazy">
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">What This Topic Helps Explain</p>
        <h2>Useful buyer education, kept inside the Acreages experience.</h2>
        <p>${post.snippet}</p>
      </div>
      <div class="collection-grid">
        ${post.learnings.map((learning, index) => `
          <article class="collection-card reveal">
            <p class="card-label">Insight ${index + 1}</p>
            <h3>${post.category}</h3>
            <ul>
              <li>${learning}</li>
            </ul>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">Why It Matters</p>
        <h2>These content pieces help serious buyers think before they enquire.</h2>
        <p>Acreages' blog strategy supports trust, buyer education, and early-stage clarity across lifestyle, investment, agriculture, legal, family, and location-growth themes.</p>
      </div>
      <div class="feature-grid reveal-delay">
        ${featureCards(blogTopicClusters.slice(0, 3))}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Related Insights</p>
        <h2>Continue exploring Acreages learning content without leaving the site.</h2>
      </div>
      <div class="collection-grid">
        ${relatedPosts.map((item) => `
          <article class="collection-card reveal">
            <p class="card-label">${item.date} &bull; ${item.category}</p>
            <h3>${item.title}</h3>
            <ul>
              <li>${item.snippet}</li>
            </ul>
            <a class="text-link" href="${pageHref("blogs")}?post=${item.slug}">Open Insight</a>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function blogsPage() {
  const selectedPost = getSelectedBlogPost();
  if (selectedPost) {
    return blogDetailPage(selectedPost);
  }

  return `
    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Blogs</p>
        <h2>Public Acreages articles that now stay inside your own premium UI.</h2>
        <p>The cards below open internal insight views built from the real public article topics, dates, and summaries already extracted for the demo.</p>
      </div>
      <div class="collection-grid">
        ${blogPosts.map((post) => `
          <article class="collection-card reveal">
            <p class="card-label">${post.date} &bull; ${post.category}</p>
            <h3>${post.title}</h3>
            <strong class="price-line">Acreages Insight Brief</strong>
            <ul>
              <li>${post.snippet}</li>
              <li>${post.overview}</li>
            </ul>
            <a class="text-link" href="${pageHref("blogs")}?post=${post.slug}">Open Insight</a>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">Content Strategy</p>
        <h2>The Acreages content funnel is broader than just project launches.</h2>
        <p>It educates buyers through investment, legal, lifestyle, agriculture, retirement, NRI, and location-growth topics that keep the journey warm before a direct enquiry.</p>
      </div>
      <div class="feature-grid reveal-delay">
        ${featureCards(blogTopicClusters)}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="collection-grid">
        ${insightPanels.map((panel) => `
          <article class="collection-card reveal">
            <p class="card-label">Insight</p>
            <h3>${panel.title}</h3>
            <ul>
              <li>${panel.text}</li>
              <li>Route the next step through the matching Acreages enquiry path.</li>
            </ul>
            <a class="text-link" href="${contactHref(panel.cta)}">${panel.cta}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function faqPage() {
  return `
    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">FAQ</p>
        <h2>Helpful Acreages answers, now kept fully inside your own website.</h2>
        <p>The FAQ page brings together the most useful public Acreages buyer questions around projects, financing, relationship support, rental thinking, land transfer, and practical ownership clarity.</p>
      </div>
      <div class="feature-grid reveal-delay">
        ${featureCards(projectSelectionGuides)}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">General Buyer Questions</p>
        <h2>Start with the questions most serious buyers usually ask first.</h2>
      </div>
      <div class="collection-grid">
        ${faqCards(faqHighlights)}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Land Terms</p>
        <h2>Useful land-language clarity without overpromising legal interpretation.</h2>
        <p>Acreages publicly uses terms like clear title, 7/12, guntha, and Category 1 land. This page keeps the wording cautious and routes final interpretation to the Acreages team where needed.</p>
      </div>
      <div class="collection-grid">
        ${faqCards(landTermHighlights)}
      </div>
    </section>

    <section class="section-shell contact-layout">
      <div class="contact-copy reveal">
        <p class="eyebrow">Need A Specific Answer?</p>
        <h2>Use the contact route for project-specific pricing, inventory, legal, or site-visit questions.</h2>
        <p>Some answers depend on live availability, project documents, lender eligibility, or current offers, so the cleanest next step is to request a callback from the Acreages team.</p>
        <div class="contact-badges">
          <span>Pricing</span>
          <span>Availability</span>
          <span>Legal and Documentation</span>
        </div>
      </div>
      <div class="roi-card reveal-delay">
        <label>Next step</label>
        <div class="hero-actions">
          <a class="btn btn-solid" href="${contactHref("Callback")}">Request Callback</a>
          <a class="btn btn-outline" href="${contactHref("Legal Advice")}">Ask Legal Route</a>
        </div>
      </div>
    </section>
  `;
}

function privacyPage() {
  return `
    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">Privacy Policy</p>
        <h2>A cleaner, internal privacy summary for the Acreages demo.</h2>
        <p>This page reflects the public Acreages privacy and terms summaries from the main data document, while keeping the experience inside your own approved UI instead of redirecting visitors away.</p>
        <div class="contact-badges">
          <span>Minimum lead data</span>
          <span>Opt-out aware</span>
          <span>Contact: ${brandData.contact.email}</span>
        </div>
      </div>
      <div class="feature-grid reveal-delay">
        ${featureCards(privacyHighlights)}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Terms Summary</p>
        <h2>What the public Acreages terms and privacy wording is broadly communicating.</h2>
      </div>
      <div class="collection-grid">
        ${termsHighlights.map((item) => `
          <article class="collection-card reveal">
            <p class="card-label">Terms and Privacy</p>
            <h3>${item.title}</h3>
            <ul>
              <li>${item.text}</li>
            </ul>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section-shell contact-layout">
      <div class="contact-copy reveal">
        <p class="eyebrow">Lead Privacy</p>
        <h2>Only the minimum information should be collected to arrange a callback, brochure, or visit.</h2>
        <p>The safest public demo approach is to avoid collecting sensitive documents in open flows and instead route serious buyers to the Acreages team for the official next step.</p>
        <div class="contact-badges">
          <span>Name</span>
          <span>Phone</span>
          <span>Project interest</span>
        </div>
      </div>
      <div class="roi-card reveal-delay">
        <label>Privacy contact</label>
        <div class="hero-actions">
          <a class="btn btn-solid" href="mailto:${brandData.contact.email}">Email Support</a>
          <a class="btn btn-outline" href="${contactHref("Callback")}">Request Callback</a>
        </div>
      </div>
    </section>
  `;
}

function contactPage() {
  return `
    <section class="section-shell contact-layout">
      <div class="contact-copy reveal">
        <p class="eyebrow">Contact</p>
        <h2>Book a site visit or route a serious enquiry.</h2>
        <p>The lead form keeps the original UI style while now reflecting more of the Acreages buyer-support structure from the uploaded document.</p>
        <div class="contact-badges">
          <span>${brandData.contact.salesPhone}</span>
          <span>${brandData.contact.email}</span>
          <span>Nerul West, Navi Mumbai</span>
        </div>
      </div>

      <form class="lead-form reveal-delay" id="leadForm">
        <input type="hidden" id="leadSource" value="Website Demo">

        <label>Full name<input id="leadName" type="text" placeholder="Buyer name" required></label>
        <label>Phone<input id="leadPhone" type="tel" placeholder="+91 98765 43210" required></label>
        <label>Email<input id="leadEmail" type="email" placeholder="buyer@domain.com"></label>
        <label>Buyer intent<select id="leadIntent" required>${leadIntentOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}</select></label>
        <label>Interested project<select id="leadProject" required>${projectInterestOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}</select></label>
        <label>Budget range<select id="leadBudget" required>${budgetOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}</select></label>
        <label>City<input id="leadCity" type="text" placeholder="Mumbai / Navi Mumbai / Pune / Thane"></label>
        <label>Preferred visit date<input id="leadVisitDate" type="date"></label>
        <label>Notes<textarea id="leadNotes" rows="5" placeholder="Project angle, family use, investment lens, legal questions, or visit notes."></textarea></label>

        <div class="hero-actions">
          <button class="btn btn-solid" type="submit">Save Lead to Agent Record</button>
          <a class="btn btn-outline" href="${brandData.social.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp Acreages</a>
        </div>
      </form>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Direct Routes</p>
        <h2>Sales, investor, legal, partner, and office contacts in one place.</h2>
        <p>The contact page now holds the missing official public contact paths from the document instead of leaving them hidden across separate source pages.</p>
      </div>
      <div class="collection-grid">
        ${contactPoints.map((item) => `
          <article class="collection-card reveal">
            <p class="card-label">Support Route</p>
            <h3>${item.title}</h3>
            <strong class="price-line">${item.value}</strong>
            <ul>
              <li>${item.text}</li>
            </ul>
            <a class="text-link" href="${item.href}" target="_blank" rel="noopener noreferrer">Use This Route</a>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">Advisory and Offers</p>
        <h2>Useful support routes for cautious buyers, larger land buyers, and referral-led enquiries.</h2>
        <p>These are public Acreages support themes. Final eligibility, timing, and live commercial terms should always be team-confirmed.</p>
      </div>
      <div class="feature-grid reveal-delay">
        ${featureCards([...advisoryServices.slice(0, 2), ...publicOffers.slice(0, 2)])}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Buyer Questions</p>
        <h2>Helpful FAQ answers to support the first enquiry.</h2>
      </div>
      <div class="collection-grid">
        ${faqCards([...faqHighlights.slice(0, 3), ...landTermHighlights.slice(0, 3)])}
      </div>
    </section>

    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">Other Support Routes</p>
        <h2>Channel partner, referral, careers, and privacy notes are now easier to find.</h2>
        <p>The Word document added several business-support funnels that were useful but underrepresented in the demo. They are now surfaced here without adding more navbar clutter.</p>
      </div>
      <div class="feature-grid reveal-delay">
        ${featureCards([
          channelPartnerHighlights[0],
          referralHighlights[0],
          careersHighlights[0],
          privacyHighlights[0]
        ])}
      </div>
    </section>
  `;
}

function dashboardPage() {
  const records = getStoredRecords().sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const total = records.length;
  const siteVisits = records.filter((record) => record.intent === "Site Visit").length;
  const brochures = records.filter((record) => record.intent === "Brochure Request").length;
  const callbacks = records.filter((record) => record.intent === "Callback").length;

  return `
    <section class="section-shell agent-section">
      <div class="agent-heading reveal">
        <p class="eyebrow">Agent Record</p>
        <h2>Lead records, export, and follow-up visibility.</h2>
        <p>This keeps the original dashboard feel while now tracking richer Acreages-specific project and support intents from the updated site and chatbot flows.</p>
      </div>

      <div class="agent-summary reveal-delay">
        <article class="summary-card"><span>Total Records</span><strong id="totalRecords">${total}</strong></article>
        <article class="summary-card"><span>Site Visit Leads</span><strong id="visitRecords">${siteVisits}</strong></article>
        <article class="summary-card"><span>Brochure Leads</span><strong id="brochureRecords">${brochures}</strong></article>
        <article class="summary-card"><span>Callback Leads</span><strong id="callbackRecords">${callbacks}</strong></article>
      </div>

      <div class="agent-desk reveal">
        <div class="agent-toolbar">
          <p>Live agent console</p>
          <div>
            <button class="btn btn-small btn-outline" id="exportRecordsBtn" type="button">Export CSV</button>
            <button class="btn btn-small btn-ghost" id="clearRecordsBtn" type="button">Clear Records</button>
          </div>
        </div>

        <div class="agent-table-wrap">
          <table class="agent-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Lead</th>
                <th>Interest</th>
                <th>Project</th>
                <th>Budget</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="agentRecordBody">
              ${records.length ? records.map((record) => `
                <tr>
                  <td data-label="Date">${formatRecordDate(record.createdAt)}</td>
                  <td data-label="Lead"><strong>${escapeHtml(record.name)}</strong><br>${escapeHtml(record.phone)}<br>${escapeHtml(record.email || "No email")}</td>
                  <td data-label="Interest">${escapeHtml(record.intent)}</td>
                  <td data-label="Project">${escapeHtml(record.project || "Not set")}</td>
                  <td data-label="Budget">${escapeHtml(record.budget)}</td>
                  <td data-label="Source">${escapeHtml(record.source)}</td>
                  <td data-label="Status">${escapeHtml(record.status)}</td>
                </tr>
              `).join("") : `
                <tr class="empty-row">
                  <td colspan="7">No records yet. Submit the enquiry form, use the Acreages Assistant, or trigger a CTA to create the first lead.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

export function renderPage(page) {
  const main = document.getElementById("pageMain");
  if (!main) return;

  const pages = {
    home: homePage,
    projects: projectsPage,
    villas: villasPage,
    investor: investorPage,
    nri: nriPage,
    gallery: galleryPage,
    blogs: blogsPage,
    contact: contactPage,
    dashboard: dashboardPage,
    faq: faqPage,
    privacy: privacyPage
  };

  const template = pages[page] || homePage;
  main.innerHTML = template();
}









