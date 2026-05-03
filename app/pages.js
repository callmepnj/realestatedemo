import { blogPosts } from "../data/blogs.js";
import { brandData } from "../data/brand.js";
import { galleryImages } from "../data/gallery.js";
import { budgetOptions, leadIntentOptions, projectInterestOptions } from "../data/leads.js";
import { featuredProjects, soldOutProjects } from "../data/projects.js";
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

function soldOutCard(project) {
  return `
    <article class="collection-card reveal">
      <p class="card-label">Sold Out</p>
      <h3>${project.name}</h3>
      <strong class="price-line">Legacy Acreages Story</strong>
      <ul>
        <li>Included to support the Acreages sold-out track record.</li>
        <li>Useful for trust-building in the client demo.</li>
        <li>Final archived project details can be expanded later if needed.</li>
      </ul>
    </article>
  `;
}

function galleryCard(image, large = false, delay = "") {
  return `
    <figure class="gallery-card${large ? " gallery-card-large" : ""} ${delay}">
      <img src="/${image.src}" alt="${escapeHtml(image.alt)}" loading="lazy">
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
            <span>Acreages now sits inside the same premium UI language you already had.</span>
          </figcaption>
        </figure>

        <div class="hero-floating-card price-card">
          <p>Trust Positioning</p>
          <strong>12+ Years</strong>
          <span>Public experience story already visible on the Acreages site.</span>
        </div>

        <div class="hero-floating-card landmark-card">
          <p>Buyer Hook</p>
          <strong>Clear-title weekend-home story</strong>
          <span>Organized for project discovery, site visits, and structured follow-up.</span>
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
        <p>Instead of forcing every opportunity into one static grid, the homepage now spotlights Acreages projects in a calmer, more premium sequence.</p>
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
        <h2>Keep the homepage short, but keep the story premium.</h2>
        <p>This version keeps the original UI style while giving Acreages a cleaner overview, stronger proof points, and route-based navigation.</p>
      </div>

      <div class="feature-grid reveal-delay">
        <article class="feature-card">
          <span class="feature-index">01</span>
          <h3>Legally focused</h3>
          <p>Clear-title positioning, documentation support, and a more trustworthy first impression.</p>
        </article>
        <article class="feature-card">
          <span class="feature-index">02</span>
          <h3>Nature-led projects</h3>
          <p>Riverfront, forest-facing, hill-station, and highway-front opportunities across multiple buyer types.</p>
        </article>
        <article class="feature-card">
          <span class="feature-index">03</span>
          <h3>Better lead flow</h3>
          <p>Every brochure request, callback, and site-visit enquiry still flows into the dashboard.</p>
        </article>
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Project Preview</p>
        <h2>Featured Acreages opportunities</h2>
        <p>The full inventory now lives on the Projects page, but the homepage still previews the most important communities.</p>
      </div>
      <div class="collection-grid">
        ${featuredProjects.slice(0, 3).map(projectCard).join("")}
      </div>
      <div class="hero-actions" style="margin-top:28px;">
        <a class="btn btn-solid" href="${pageHref("projects")}">Explore All Projects</a>
      </div>
    </section>

    <section class="section-shell gallery-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Visual Tour</p>
        <h2>Use the landscape to do the selling.</h2>
        <p>The gallery keeps the same visual energy while using your Acreages photo library instead of placeholders.</p>
      </div>
      <div class="gallery-grid">
        ${galleryCard(galleryImages[0], true, "reveal")}
        ${galleryCard(galleryImages[1], false, "reveal-delay")}
        ${galleryCard(galleryImages[2], false, "reveal-delay-2")}
        ${galleryCard(galleryImages[3], false, "reveal")}
        ${galleryCard(galleryImages[4], false, "reveal-delay")}
      </div>
    </section>

    <section class="section-shell contact-layout">
      <div class="contact-copy reveal">
        <p class="eyebrow">Next Step</p>
        <h2>Book a site visit or move straight into a project enquiry.</h2>
        <p>The homepage stays concise. The detailed pages, contact flow, and dashboard now handle the deeper journey.</p>
        <div class="contact-badges">
          <span>Projects page</span>
          <span>Gallery page</span>
          <span>Contact page</span>
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
        <h2>Explore Acreages Developers' ongoing and upcoming opportunities.</h2>
        <p>All project references are grouped here so the homepage stays focused and premium.</p>
      </div>
      <div class="collection-grid">
        ${featuredProjects.map(projectCard).join("")}
      </div>
    </section>

    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Sold-Out References</p>
        <h2>Legacy communities that strengthen the Acreages story.</h2>
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
        <p>Where Acreages publicly shows villa concepts, this page presents them honestly without inventing inventory details.</p>
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
              <li>Project-specific details are available on request.</li>
              <li>Use the contact page to start a villa enquiry.</li>
            </ul>
            <a class="text-link" href="${contactHref("Villa Enquiry")}">Request Villa Details</a>
          </article>
        `).join("")}
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
        <p>Acreages already has an investor story. This page simply gives it a cleaner route, better structure, and a more useful CTA path.</p>
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
        <p>This calculator is illustrative only. Actual appreciation depends on market conditions, location, documentation, demand, and holding period.</p>
      </div>
      <div class="feature-grid reveal-delay">
        <article class="feature-card"><span class="feature-index">01</span><h3>Clear-title focus</h3><p>Ownership clarity matters more than hype-led promises.</p></article>
        <article class="feature-card"><span class="feature-index">02</span><h3>Location-led logic</h3><p>Corridor quality and accessibility shape the long-term investor story.</p></article>
        <article class="feature-card"><span class="feature-index">03</span><h3>Structured follow-up</h3><p>Use the contact flow to record investor intent, project preference, and budget range.</p></article>
      </div>
    </section>
  `;
}

function nriPage() {
  return `
    <section class="section-shell story-grid">
      <div class="section-copy reveal">
        <p class="eyebrow">NRI Enquiries</p>
        <h2>A cleaner starting point for NRI buyers.</h2>
        <p>This route gives overseas buyers a dedicated path for documentation-led questions, remote follow-up, and project shortlisting.</p>
      </div>
      <div class="feature-grid reveal-delay">
        <article class="feature-card"><span class="feature-index">01</span><h3>Remote-first</h3><p>NRI buyers can send a structured enquiry before any detailed project discussion begins.</p></article>
        <article class="feature-card"><span class="feature-index">02</span><h3>Documentation support</h3><p>Acreages publicly emphasizes legal, ethical, and ownership guidance.</p></article>
        <article class="feature-card"><span class="feature-index">03</span><h3>Organized lead flow</h3><p>Project, budget, city, and visit preference can be recorded in one form submission.</p></article>
      </div>
    </section>

    <section class="section-shell location-layout">
      <div class="location-photo reveal">
        <img src="/photos/Avyay-Park-Web.png" alt="Acreages lifestyle visual for NRI page" loading="lazy">
      </div>
      <div class="location-copy reveal-delay">
        <p class="eyebrow">Route-Based UX</p>
        <h2>No more forcing the full story into one long homepage.</h2>
        <div class="location-points">
          <article><strong>Project-led enquiry</strong><p>NRIs can move directly from interest to a structured callback request.</p></article>
          <article><strong>Buyer clarity</strong><p>Separate pages make the demo feel more like a real website and less like a long pitch deck.</p></article>
          <article><strong>Contact next</strong><p>Use the contact page to request an NRI callback or project details.</p></article>
        </div>
      </div>
    </section>
  `;
}

function galleryPage() {
  const items = galleryImages.slice(0, 12);
  return `
    <section class="section-shell gallery-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Gallery</p>
        <h2>Acreages visuals matched to your local image library.</h2>
        <p>This page keeps the original gallery feel while using Acreages-specific project and lifestyle imagery.</p>
      </div>
      <div class="gallery-grid">
        ${items.map((image, index) => galleryCard(image, index === 0, index % 3 === 1 ? "reveal-delay" : index % 3 === 2 ? "reveal-delay-2" : "reveal")).join("")}
      </div>
    </section>
  `;
}

function blogsPage() {
  return `
    <section class="section-shell collection-section">
      <div class="section-heading reveal">
        <p class="eyebrow">Blogs</p>
        <h2>Public Acreages articles that support buyer education.</h2>
        <p>This demo shows real visible blog titles, dates, and snippets without inventing full articles.</p>
      </div>
      <div class="collection-grid">
        ${blogPosts.map((post) => `
          <article class="collection-card reveal">
            <p class="card-label">${post.date} &bull; ${post.category}</p>
            <h3>${post.title}</h3>
            <strong class="price-line">Buyer Education</strong>
            <ul>
              <li>${post.snippet}</li>
              <li>Use this content to support SEO and higher-trust project discovery.</li>
              <li>Public source remains linked below.</li>
            </ul>
            <a class="text-link" href="${post.link}" target="_blank" rel="noopener noreferrer">Read Public Source</a>
          </article>
        `).join("")}
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
        <p>The lead form keeps the original UI style while capturing better Acreages-specific information for the dashboard.</p>
        <div class="contact-badges">
          <span>${brandData.contact.salesPhone}</span>
          <span>${brandData.contact.email}</span>
          <span>Nerul, Navi Mumbai</span>
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
        <p>This keeps the original dashboard feel while using the Acreages enquiry structure and localStorage-based records.</p>
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
                  <td colspan="7">No records yet. Submit the enquiry form or use the action buttons to create your first lead.</td>
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
    dashboard: dashboardPage
  };

  const template = pages[page] || homePage;
  main.innerHTML = template();
}



