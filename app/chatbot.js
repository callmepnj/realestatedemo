
import { addRecord } from "./lead-store.js";
import { pageHref, showToast } from "./site.js";

const CHATBOT_STORAGE_KEY = "acreages-chatbot-session";
const CHATBOT_PANEL_ID = "acreagesChatbotPanel";
const CHATBOT_LAUNCHER_ID = "acreagesChatbotLauncher";
const INTERNAL_PROJECT_IDS = new Set([
  "rivlyn-estate",
  "serenity-park",
  "diviana-park",
  "elarise-park",
  "avyay-park"
]);

let knowledgePromise;
let respondTimer;
const state = {
  isOpen: false,
  isReady: false,
  isTyping: false,
  awaitingComparison: false,
  leadFlow: null,
  context: {
    lastProjectIds: [],
    lastIntent: ""
  },
  messages: []
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function titleCaseWords(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function extractPhone(value) {
  const match = String(value || "").match(/(\+?\d[\d\s()-]{8,}\d)/);
  if (!match) return "";
  return match[1].replace(/\s+/g, " ").trim();
}

function extractNameAndPhone(value) {
  const phone = extractPhone(value);
  if (!phone) return { name: "", phone: "" };
  const name = String(value || "")
    .replace(phone, " ")
    .replace(/name\s*[:\-]?/gi, " ")
    .replace(/phone\s*[:\-]?/gi, " ")
    .replace(/[|,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    name: titleCaseWords(name),
    phone
  };
}

function saveSession() {
  const payload = {
    isOpen: state.isOpen,
    isReady: state.isReady,
    awaitingComparison: state.awaitingComparison,
    leadFlow: state.leadFlow,
    context: state.context,
    messages: state.messages
  };
  sessionStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(payload));
}

function restoreSession() {
  try {
    const raw = sessionStorage.getItem(CHATBOT_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    state.isOpen = Boolean(saved.isOpen);
    state.isReady = Boolean(saved.isReady);
    state.awaitingComparison = Boolean(saved.awaitingComparison);
    state.leadFlow = saved.leadFlow || null;
    state.context = saved.context || state.context;
    state.messages = Array.isArray(saved.messages) ? saved.messages : [];
  } catch {
    state.messages = [];
  }
}

function getChatbotNodes() {
  return {
    launcher: document.getElementById(CHATBOT_LAUNCHER_ID),
    panel: document.getElementById(CHATBOT_PANEL_ID),
    messages: document.getElementById("acreagesChatbotMessages"),
    form: document.getElementById("acreagesChatbotForm"),
    input: document.getElementById("acreagesChatbotInput"),
    close: document.getElementById("acreagesChatbotClose")
  };
}

function renderChatbotShell() {
  if (document.getElementById("acreagesChatbot")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <section class="chatbot-shell" id="acreagesChatbot" aria-label="Acreages Assistant">
      <button class="chatbot-launcher" id="${CHATBOT_LAUNCHER_ID}" type="button" aria-expanded="false" aria-controls="${CHATBOT_PANEL_ID}">
        <span class="chatbot-launcher__icon" aria-hidden="true">A</span>
        <span class="chatbot-launcher__copy">
          <strong>Ask Acreges AI</strong>
          <span>Projects, pricing, visits</span>
        </span>
      </button>

      <div class="chatbot-panel" id="${CHATBOT_PANEL_ID}" aria-hidden="true">
        <div class="chatbot-panel__glass">
          <header class="chatbot-header">
            <div class="chatbot-header__brand">
              <span class="chatbot-header__mark">AC</span>
              <div>
                <strong>Acreages Assistant</strong>
                <p>Find your weekend home, farmhouse, villa, or land investment.</p>
                <span>Usually replies instantly</span>
              </div>
            </div>
            <button class="chatbot-close" id="acreagesChatbotClose" type="button" aria-label="Close Acreages Assistant">×</button>
          </header>

          <div class="chatbot-body">
            <div class="chatbot-messages" id="acreagesChatbotMessages"></div>
          </div>

          <form class="chatbot-composer" id="acreagesChatbotForm">
            <label class="sr-only" for="acreagesChatbotInput">Ask Acreages Assistant</label>
            <input id="acreagesChatbotInput" type="text" autocomplete="off" placeholder="Ask about projects, site visits, pricing, NRI support, or legal guidance.">
            <button class="chatbot-send" type="submit">Send</button>
          </form>
        </div>
      </div>
    </section>
  `);
}

async function loadKnowledgeBase() {
  if (!knowledgePromise) {
    knowledgePromise = fetch("/chatbot/knowledge-base.json")
      .then((response) => {
        if (!response.ok) throw new Error("Knowledge base failed to load.");
        return response.json();
      });
  }
  return knowledgePromise;
}

function getExploreHref(project) {
  if (INTERNAL_PROJECT_IDS.has(project.id)) {
    return `${pageHref("projects")}#${project.id}`;
  }
  return project.sourceUrl;
}

function matchProjects(query, knowledgeBase) {
  const normalizedQuery = normalizeText(query);
  return knowledgeBase.projects
    .map((project) => {
      const aliasScore = project.aliases.reduce((score, alias) => {
        if (normalizedQuery.includes(normalizeText(alias))) {
          return Math.max(score, alias.length);
        }
        return score;
      }, 0);
      return { project, aliasScore };
    })
    .filter((entry) => entry.aliasScore > 0)
    .sort((left, right) => right.aliasScore - left.aliasScore)
    .map((entry) => entry.project);
}

function retrieveKnowledge(query, knowledgeBase, options = {}) {
  const queryTokens = tokenize(query);
  const queryProjects = options.projectIds || [];
  const topicBoost = options.topic || "";

  return knowledgeBase.chunks
    .map((chunk) => {
      const text = `${chunk.title} ${chunk.text}`;
      const normalized = normalizeText(text);
      const chunkTokens = new Set(tokenize(text));
      let score = 0;

      for (const token of queryTokens) {
        if (chunkTokens.has(token)) score += 2;
        if (normalized.includes(token)) score += 1;
      }

      for (const projectId of queryProjects) {
        if (chunk.tags.includes(projectId)) score += 26;
      }

      if (topicBoost && chunk.tags.includes(topicBoost)) score += 18;
      if (normalized.includes(normalizeText(query))) score += 14;
      if (chunk.title && normalizeText(query).includes(normalizeText(chunk.title))) score += 10;

      return { ...chunk, score };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);
}

function excerptChunk(text, maxSentences = 2) {
  const parts = String(text || "")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, maxSentences);
  return parts.join(" ");
}

function detectIntent(query, projects) {
  const text = normalizeText(query);
  if (!text) return "greeting";
  if (/\b(hi|hello|hey|namaste|start)\b/.test(text)) return "greeting";
  if (text.includes("tell me about acreages") || text.includes("about acreages") || text.includes("what is acreages")) return "about";
  if (text.includes("compare") || text.includes(" vs ") || text.includes("versus")) return "compare";
  if (text.includes("which project") || text.includes("best project") || text.includes("which is best")) return "best-project";
  if (/\b(price|pricing|cost|rate|budget|payment plan|booking amount)\b/.test(text)) return "price";
  if (/\b(availability|available|inventory|remaining plots|plots left)\b/.test(text)) return "availability";
  if (/\b(book site visit|site visit|visit)\b/.test(text)) return "site-visit";
  if (/\b(brochure|download brochure|catalogue|catalog)\b/.test(text)) return "brochure";
  if (/\b(callback|call me|call back|talk to sales)\b/.test(text)) return "callback";
  if (/\b(nri|abroad|overseas)\b/.test(text)) return "nri";
  if (/\b(investor|investment|promoter|returns)\b/.test(text)) return "investor";
  if (/\b(legal|clear title|clear-title|7 12|7\/12|document|documents|zoning|approval)\b/.test(text)) return "legal";
  if (/\b(channel partner|broker|agent|commission)\b/.test(text)) return "channel-partner";
  if (/\b(referral|refer)\b/.test(text)) return "referral";
  if (/\b(career|job|hiring|internship|apply)\b/.test(text)) return "careers";
  if (/\b(contact|phone|email|office|address)\b/.test(text)) return "contact";
  if (/\b(offer|offers|campaign|discount)\b/.test(text)) return "offers";
  if (/\b(villa|construction|bungalow|a frame|container home|laterite)\b/.test(text)) return "villas";
  if (/\b(advisory|farmer certificate|land acquisition)\b/.test(text)) return "advisory";
  if (/\b(blog|blogs|article|articles|insight|insights)\b/.test(text)) return "blogs";
  if (/\b(rental income guaranteed|guaranteed income|guaranteed roi|guaranteed return)\b/.test(text)) return "income-disclaimer";
  if (projects.length) return "project";
  return "general";
}
function findProjectById(knowledgeBase, projectId) {
  return knowledgeBase.projects.find((project) => project.id === projectId);
}

function buildActionObjects(labels, projectName = "") {
  return labels.map((label) => ({ label, projectName }));
}

function buildProjectCards(projects) {
  return projects.map((project) => ({
    type: "project",
    projectId: project.id,
    title: project.name,
    status: project.status,
    category: project.category,
    location: project.location,
    bestFor: project.bestFor,
    plotOptions: project.plotOptions,
    highlights: project.highlights,
    image: project.image,
    exploreHref: getExploreHref(project),
    sourceUrl: project.sourceUrl
  }));
}

function recommendProjectIds(query) {
  const text = normalizeText(query);
  if (/river|riverfront|privacy|premium farmhouse/.test(text)) return ["rivlyn-estate"];
  if (/mountain|malshej|peaceful|nature|farmstead|forest/.test(text)) return ["serenity-park"];
  if (/family|villa style|villa\s*\+|community|plot villa/.test(text)) return ["diviana-park"];
  if (/ready murbad|limited inventory|almost sold out|ready possession/.test(text)) return ["violet-park-ii"];
  if (/commercial|warehouse|warehousing|logistics|highway|industrial/.test(text)) return ["elarise-park"];
  if (/kamshet|lonavala|hill station|hill-station/.test(text)) return ["avyay-park"];
  if (/upcoming|coming soon|pre booking|pre-booking/.test(text)) {
    return [
      "leafwood-park",
      "orchard-park",
      "shrivardhan-seawinds-park",
      "shahapur-nest-park",
      "new-mahabaleshwar-sky-park-phase-ii"
    ];
  }
  return ["rivlyn-estate", "serenity-park", "diviana-park", "elarise-park"];
}

function buildGreeting(knowledgeBase) {
  return {
    role: "assistant",
    text: "Hi, welcome to Acreages. I can help you explore weekend homes, farmhouse plots, villas, riverfront land, highway investment land, NRI support, offers, or site visits. What are you looking for?",
    actions: buildActionObjects(knowledgeBase.quickActions.greeting)
  };
}

function buildAboutReply() {
  return {
    role: "assistant",
    text: "Acreages Developers focuses on premium weekend homes, farmhouse plots, villa-ready land, and land investment opportunities near Mumbai and Pune. The brand is built around clear-title projects, nature-centric living, family weekends, legal clarity, and long-term legacy ownership.",
    actions: buildActionObjects(["Explore Projects", "Book Site Visit", "Talk to Sales"])
  };
}

function buildProjectReply(project) {
  const note = /legacy|team confirmation|upcoming|pre-bookings|coming soon/i.test(project.status)
    ? "Current availability and pricing can change. I can arrange a callback from the Acreages team so you get the latest details."
    : "If you want the latest availability, pricing, or a brochure, I can route that request to the Acreages team.";

  return {
    role: "assistant",
    text: `${project.name} would be a strong match if you want ${project.bestFor.toLowerCase()}\n\nBest for: ${project.bestFor}\nLocation: ${project.location}\nPlot options: ${project.plotOptions}\nWhy it fits: ${project.highlights[0]}. ${note}`,
    cards: buildProjectCards([project]),
    actions: buildActionObjects(["Get Price", "Book Site Visit", "Download Brochure", "Compare Projects", "Talk to Sales"], project.name)
  };
}

function buildBestProjectReply(knowledgeBase, query) {
  const projectIds = recommendProjectIds(query);
  const projects = projectIds
    .map((id) => findProjectById(knowledgeBase, id))
    .filter(Boolean)
    .slice(0, 4);

  const text = projects.length === 1
    ? `${projects[0].name} is the strongest match for what you described. ${projects[0].bestFor}`
    : "That depends on what matters most to you. If you want riverfront privacy, Rivlyn Estate is the strongest match. For mountain-view farmstead living, Serenity Park works well. For villa-style family weekends, Diviana Park is ideal. For highway-front commercial investment, Elarise Park is the better fit.";

  return {
    role: "assistant",
    text,
    cards: buildProjectCards(projects),
    actions: buildActionObjects(["Compare Projects", "Get Price", "Book Site Visit", "Talk to Sales"])
  };
}

function buildCompareReply(projects) {
  if (projects.length < 2) {
    return {
      role: "assistant",
      text: "I can help compare projects. Please tell me the two projects you want to compare, for example Rivlyn Estate and Serenity Park.",
      actions: buildActionObjects(["Compare Projects", "Explore Projects"])
    };
  }

  const [first, second] = projects;
  return {
    role: "assistant",
    text: `${first.name} vs ${second.name}\n\n${first.name}: best if you want ${first.bestFor.toLowerCase()}\n${second.name}: best if you want ${second.bestFor.toLowerCase()}\n\nIf you tell me whether you care more about riverfront privacy, mountain views, villa-style family weekends, or investment logic, I can narrow it down further.`,
    cards: buildProjectCards([first, second]),
    actions: buildActionObjects(["Get Price", "Book Site Visit", "Talk to Sales"])
  };
}

function buildServiceReply(summary, items, actionLabels) {
  const bullets = items.slice(0, 4).map((item) => `• ${item}`).join("\n");
  return {
    role: "assistant",
    text: `${summary}\n\n${bullets}`,
    actions: buildActionObjects(actionLabels)
  };
}

function buildContactReply(knowledgeBase) {
  const { contacts } = knowledgeBase;
  return {
    role: "assistant",
    text: `You can reach Acreages through these routes:\n\nSales: ${contacts.salesPhone}\nOffice: ${contacts.officePhone}\nEmail: ${contacts.generalEmail}\nChannel Partners: ${contacts.channelPartnerPhone}\nCorporate Office: ${contacts.address}`,
    actions: [
      { label: "Call Sales", href: `tel:${contacts.salesPhone.replace(/\s+/g, "")}` },
      { label: "Email Team", href: `mailto:${contacts.generalEmail}` },
      { label: "Book Site Visit" }
    ]
  };
}

function buildPriceReply(projectName = "") {
  const prefix = projectName ? `${projectName} pricing can change depending on plot size, availability, and current offers.` : "Pricing can change depending on project, plot size, availability, and current offers.";
  return {
    role: "assistant",
    text: `${prefix} I can arrange a callback from the Acreages team with the latest price details. ${projectName ? "Please share your name and phone number, and I’ll route it for you." : "If you already have a project in mind, I can route that request for you right away."}`
  };
}

function buildAvailabilityReply(projectName = "") {
  return {
    role: "assistant",
    text: `${projectName || "Current project"} availability can change. I can arrange a callback from the Acreages team so you get the latest inventory, pricing, and site-visit options.`
  };
}

function buildIncomeDisclaimerReply() {
  return {
    role: "assistant",
    text: "Acreages explains possible income routes like OTA rentals, farm stays, agro-tourism, plantation planning, and organic farming, but income is not guaranteed. It depends on location, design, operations, pricing, demand, and regulations.",
    actions: buildActionObjects(["Investor Options", "Legal Advice", "Talk to Sales"])
  };
}

function buildFallbackReply(query, knowledgeBase, projects) {
  const topChunks = retrieveKnowledge(query, knowledgeBase, {
    projectIds: projects.map((project) => project.id)
  });

  if (topChunks.length) {
    const snippets = topChunks.slice(0, 2).map((chunk) => `${chunk.title}: ${excerptChunk(chunk.text, 1)}`);
    return {
      role: "assistant",
      text: `Here’s the clearest way to look at that right now:\n\n${snippets.join("\n\n")}\n\nIf you want, I can also narrow this down into the best project, support route, or next step for you.`,
      actions: buildActionObjects(["Explore Projects", "Book Site Visit", "Talk to Sales"])
    };
  }

  return {
    role: "assistant",
    text: "I can help with projects, pricing routes, NRI support, legal guidance, investor options, villas, or site visits. Tell me what you want to compare or where you want to invest, and I’ll guide you from there.",
    actions: buildActionObjects(["Explore Projects", "Book Site Visit", "Talk to Sales"])
  };
}

function startLeadFlow(intent, projectName = "") {
  state.leadFlow = {
    intent,
    stage: projectName ? "contact" : "project",
    data: {
      projectName,
      callbackTime: "",
      name: "",
      phone: ""
    }
  };
  saveSession();

  if (!projectName) {
    return {
      role: "assistant",
      text: "Sure, I can help with that. Which project are you interested in?"
    };
  }

  return {
    role: "assistant",
    text: "Sure, I can arrange that. Please share your name and phone number, and I’ll help route your request to the Acreages team."
  };
}
function getLeadStatus(intent) {
  if (intent === "Site Visit") return "Visit Planned";
  if (intent === "Brochure Request") return "Deck Pending";
  if (intent === "Callback") return "Call Back";
  if (intent === "NRI Enquiry") return "NRI Follow-Up";
  if (intent === "Investor Enquiry") return "Investor Follow-Up";
  return "Warm Lead";
}

function persistLead(leadFlow) {
  const record = {
    id: crypto?.randomUUID?.() || `chat-${Date.now()}`,
    createdAt: new Date().toISOString(),
    name: leadFlow.data.name,
    phone: leadFlow.data.phone,
    email: "",
    intent: leadFlow.intent,
    project: leadFlow.data.projectName || "Not specified",
    budget: "",
    city: leadFlow.data.country || "",
    visitDate: "",
    source: "Website Chatbot",
    notes: leadFlow.data.callbackTime ? `Preferred callback time: ${leadFlow.data.callbackTime}` : "Captured via Acreages Assistant",
    status: getLeadStatus(leadFlow.intent)
  };
  addRecord(record);
  showToast("Chat lead saved to the Acreages agent record.");
}

function handleLeadFlowInput(input, knowledgeBase) {
  const flow = state.leadFlow;
  if (!flow) return null;

  if (flow.stage === "project") {
    const matchedProjects = matchProjects(input, knowledgeBase);
    if (!matchedProjects.length) {
      return {
        role: "assistant",
        text: "Please tell me the project name you want help with, such as Rivlyn Estate, Serenity Park, Diviana Park, or Elarise Park."
      };
    }
    flow.data.projectName = matchedProjects[0].name;
    flow.stage = "contact";
    saveSession();
    return {
      role: "assistant",
      text: `Perfect. I’ll tag this for ${flow.data.projectName}. Please share your name and phone number, and I’ll route it to the Acreages team.`
    };
  }

  if (flow.stage === "contact") {
    const { name, phone } = extractNameAndPhone(input);
    if (!name || !phone) {
      return {
        role: "assistant",
        text: "Please share both your name and phone number so I can route this correctly."
      };
    }
    flow.data.name = name;
    flow.data.phone = phone;
    flow.stage = "callback-time";
    saveSession();
    return {
      role: "assistant",
      text: "Thank you. What callback time works best for you today?"
    };
  }

  if (flow.stage === "callback-time") {
    flow.data.callbackTime = input.trim() || "As soon as possible";
    persistLead(flow);
    const projectName = flow.data.projectName ? ` for ${flow.data.projectName}` : "";
    state.leadFlow = null;
    saveSession();
    return {
      role: "assistant",
      text: `Thank you. The Acreages team can contact you${projectName} with the latest availability, pricing, and next-step options.`,
      actions: [
        { label: "WhatsApp Sales", href: `https://wa.me/${flow.data.phone.replace(/[^\d]/g, "")}?text=Hi%20Acreages%2C%20I%20would%20like%20the%20latest%20details${flow.data.projectName ? `%20for%20${encodeURIComponent(flow.data.projectName)}` : ""}.` },
        { label: "Talk to Sales" },
        { label: "Explore Projects" }
      ]
    };
  }

  return null;
}

function buildReply(query, knowledgeBase) {
  const projects = matchProjects(query, knowledgeBase);
  const intent = detectIntent(query, projects);
  state.context.lastProjectIds = projects.map((project) => project.id);
  state.context.lastIntent = intent;
  state.awaitingComparison = intent === "compare" && projects.length < 2;

  if (intent === "greeting") return buildGreeting(knowledgeBase);
  if (intent === "about") return buildAboutReply();
  if (intent === "compare") return buildCompareReply(projects);
  if (intent === "best-project") return buildBestProjectReply(knowledgeBase, query);
  if (intent === "project" && projects[0]) return buildProjectReply(projects[0]);

  if (intent === "price") {
    const projectName = projects[0]?.name || "";
    state.leadFlow = {
      intent: "Price Enquiry",
      stage: projectName ? "contact" : "project",
      data: { projectName, callbackTime: "", name: "", phone: "" }
    };
    saveSession();
    return buildPriceReply(projectName);
  }

  if (intent === "availability") {
    const projectName = projects[0]?.name || "";
    state.leadFlow = {
      intent: "Availability Enquiry",
      stage: projectName ? "contact" : "project",
      data: { projectName, callbackTime: "", name: "", phone: "" }
    };
    saveSession();
    return buildAvailabilityReply(projectName);
  }

  if (intent === "site-visit") return startLeadFlow("Site Visit", projects[0]?.name || "");
  if (intent === "brochure") return startLeadFlow("Brochure Request", projects[0]?.name || "");
  if (intent === "callback") return startLeadFlow("Callback", projects[0]?.name || "");

  if (intent === "nri") {
    return {
      role: "assistant",
      text: "Acreages has dedicated NRI support for project selection, documentation guidance, legal clarity, and communication from abroad. Which country are you currently based in, and are you looking for a farmhouse, villa, or land investment?",
      actions: buildActionObjects(["Talk to Sales", "Explore Projects", "Book Site Visit"])
    };
  }

  if (intent === "investor") {
    return buildServiceReply(
      "Acreages offers structured investor and promoter opportunities around verified projects, transparent processes, and team support. Returns are never guaranteed, and specific terms should come directly from Investor Relations.",
      knowledgeBase.services.investor.items,
      knowledgeBase.quickActions.investor
    );
  }

  if (intent === "legal") {
    return buildServiceReply(
      "Several Acreages projects are positioned as clear-title projects, and some mention separate 7/12 or immediate registration. For final legal verification, the Acreages team can guide you through the latest project documents and process.",
      knowledgeBase.services.legal.items,
      ["Legal Advice", "Talk to Sales", "Book Site Visit"]
    );
  }

  if (intent === "channel-partner") {
    return buildServiceReply(
      "Acreages has a Channel Partner Program for brokers, agents, and real-estate sellers, with commissions, incentives, rewards, and sales support built into the positioning.",
      knowledgeBase.services["channel-partner"].items,
      knowledgeBase.quickActions.partners
    );
  }

  if (intent === "referral") {
    return buildServiceReply(
      "Acreages also supports referrals for friends, family, and network introductions. If the deal closes, the reward route can be explained by the team.",
      knowledgeBase.services.referral.items,
      ["Talk to Sales", "Explore Projects"]
    );
  }

  if (intent === "careers") {
    return buildServiceReply(
      "Acreages accepts career enquiries across sales, pre-sales, HR/admin, civil site engineering, and internships. If you want, I can also guide you to the contact route for applications.",
      knowledgeBase.services.careers.items,
      ["Talk to Sales", "Contact Team"]
    );
  }

  if (intent === "offers") {
    return buildServiceReply(
      "Acreages has publicly listed campaign-style offers and support benefits. Current validity can change, so the safest next step is to confirm live terms with the team.",
      knowledgeBase.services.offers.items,
      ["Get Price", "Book Site Visit", "Talk to Sales"]
    );
  }

  if (intent === "villas") {
    return buildServiceReply(
      "Acreages offers villa and construction routes for buyers who want more than a raw plot. These options range from masonry builds to modern prefab ideas depending on the project and buyer plan.",
      knowledgeBase.services.villas.items,
      ["Talk to Sales", "Book Site Visit", "Explore Projects"]
    );
  }

  if (intent === "advisory") {
    return buildServiceReply(
      "Acreages supports buyers with land acquisition, farmer certificate guidance, legal due diligence, weekend-home planning, and local market knowledge.",
      knowledgeBase.services.advisory.items,
      ["Legal Advice", "Talk to Sales", "Explore Projects"]
    );
  }

  if (intent === "contact") return buildContactReply(knowledgeBase);
  if (intent === "blogs") return buildFallbackReply("blog seo buyer education", knowledgeBase, projects);
  if (intent === "income-disclaimer") return buildIncomeDisclaimerReply();

  return buildFallbackReply(query, knowledgeBase, projects);
}
function addMessage(message) {
  state.messages.push(message);
  saveSession();
  renderMessages();
}

function queueAssistantMessage(message) {
  state.isTyping = true;
  renderMessages();
  clearTimeout(respondTimer);
  respondTimer = window.setTimeout(() => {
    state.isTyping = false;
    addMessage(message);
  }, 260);
}

function renderActions(actions = []) {
  if (!actions.length) return "";
  return `
    <div class="chatbot-actions">
      ${actions.map((action) => {
        if (action.href) {
          return `<a class="chatbot-action" href="${escapeHtml(action.href)}"${action.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(action.label)}</a>`;
        }
        return `<button class="chatbot-action" type="button" data-chatbot-action="${escapeHtml(action.label)}" data-chatbot-project="${escapeHtml(action.projectName || "")}">${escapeHtml(action.label)}</button>`;
      }).join("")}
    </div>
  `;
}

function renderProjectCards(cards = []) {
  if (!cards.length) return "";
  return `
    <div class="chatbot-projects">
      ${cards.map((card) => `
        <article class="chatbot-project-card">
          <div class="chatbot-project-card__media">
            <img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.title)}" loading="lazy">
            <span class="chatbot-project-card__status">${escapeHtml(card.status)}</span>
          </div>
          <div class="chatbot-project-card__body">
            <p class="chatbot-project-card__eyebrow">${escapeHtml(card.category)}</p>
            <h4>${escapeHtml(card.title)}</h4>
            <p class="chatbot-project-card__location">${escapeHtml(card.location)}</p>
            <p class="chatbot-project-card__fit">Best for: ${escapeHtml(card.bestFor)}</p>
            <ul>
              ${card.highlights.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
            <div class="chatbot-project-card__actions">
              <a class="chatbot-project-card__primary" href="${escapeHtml(card.exploreHref)}"${card.exploreHref.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>Explore Project</a>
              <button class="chatbot-project-card__secondary" type="button" data-chatbot-action="Get Price" data-chatbot-project="${escapeHtml(card.title)}">Get Price</button>
              <button class="chatbot-project-card__secondary" type="button" data-chatbot-action="Book Site Visit" data-chatbot-project="${escapeHtml(card.title)}">Book Site Visit</button>
            </div>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderMessages() {
  const { messages } = getChatbotNodes();
  if (!messages) return;

  messages.innerHTML = state.messages.map((message) => {
    const paragraphs = String(message.text || "")
      .split(/\n\n|\n/)
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");

    return `
      <article class="chatbot-message chatbot-message--${message.role}">
        <div class="chatbot-bubble">
          ${paragraphs}
        </div>
        ${renderProjectCards(message.cards)}
        ${renderActions(message.actions)}
      </article>
    `;
  }).join("") + (state.isTyping ? `
    <article class="chatbot-message chatbot-message--assistant chatbot-message--typing">
      <div class="chatbot-bubble chatbot-bubble--typing">
        <span></span><span></span><span></span>
      </div>
    </article>
  ` : "");

  messages.scrollTop = messages.scrollHeight;
  updateInputPlaceholder();
}

function updateInputPlaceholder() {
  const { input } = getChatbotNodes();
  if (!input) return;
  if (!state.leadFlow) {
    input.placeholder = "Ask about projects, pricing, site visits, NRI support, or legal guidance.";
    return;
  }
  if (state.leadFlow.stage === "project") input.placeholder = "Type the project name you are interested in";
  if (state.leadFlow.stage === "contact") input.placeholder = "Share your name and phone number";
  if (state.leadFlow.stage === "callback-time") input.placeholder = "Preferred callback time";
}

function setOpenState(isOpen) {
  state.isOpen = isOpen;
  const { launcher, panel } = getChatbotNodes();
  launcher?.setAttribute("aria-expanded", String(isOpen));
  panel?.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("chatbot-open", isOpen);
  saveSession();
  if (isOpen) {
    renderMessages();
    getChatbotNodes().input?.focus();
  }
}

async function ensureGreeting() {
  if (state.messages.length) return;
  const knowledgeBase = await loadKnowledgeBase();
  state.isReady = true;
  addMessage(buildGreeting(knowledgeBase));
}

async function handleAction(label, projectName = "") {
  const normalized = normalizeText(label);
  if (normalized === "explore projects") {
    const knowledgeBase = await loadKnowledgeBase();
    queueAssistantMessage(buildBestProjectReply(knowledgeBase, "best projects"));
    return;
  }
  if (normalized === "compare projects") {
    queueAssistantMessage({
      role: "assistant",
      text: "Sure. Tell me the two projects you want to compare, for example Rivlyn Estate and Serenity Park."
    });
    state.awaitingComparison = true;
    saveSession();
    return;
  }
  if (normalized === "book site visit") {
    queueAssistantMessage(startLeadFlow("Site Visit", projectName));
    return;
  }
  if (normalized === "get brochure" || normalized === "download brochure") {
    queueAssistantMessage(startLeadFlow("Brochure Request", projectName));
    return;
  }
  if (normalized === "get price") {
    const reply = buildPriceReply(projectName);
    state.leadFlow = {
      intent: "Price Enquiry",
      stage: projectName ? "contact" : "project",
      data: { projectName, callbackTime: "", name: "", phone: "" }
    };
    saveSession();
    queueAssistantMessage(reply);
    return;
  }
  if (normalized === "talk to sales") {
    const knowledgeBase = await loadKnowledgeBase();
    queueAssistantMessage(buildContactReply(knowledgeBase));
    return;
  }
  if (normalized === "nri support") {
    queueAssistantMessage({
      role: "assistant",
      text: "Acreages has dedicated NRI support for project selection, documentation guidance, and legal clarity. Which country are you based in, and are you looking for a farmhouse, villa, or land investment?"
    });
    return;
  }
  if (normalized === "legal advice") {
    const knowledgeBase = await loadKnowledgeBase();
    queueAssistantMessage(buildServiceReply(
      "Acreages helps buyers understand document verification, land usage, zoning, conversion, acquisition, and process guidance. For final legal advice, the expert team should review the live documents.",
      knowledgeBase.services.legal.items,
      ["Talk to Sales", "Book Site Visit"]
    ));
    return;
  }
  if (normalized === "investor options" || normalized === "see investment options" || normalized === "become promoter" || normalized === "speak to investor relations") {
    const knowledgeBase = await loadKnowledgeBase();
    queueAssistantMessage(buildServiceReply(
      "Acreages offers structured investor and promoter opportunities backed by verified projects, transparent processes, and team support. Specific terms, risks, and current opportunities should come directly from Investor Relations.",
      knowledgeBase.services.investor.items,
      knowledgeBase.quickActions.investor
    ));
    return;
  }
  if (normalized === "join as channel partner" || normalized === "talk to channel sales") {
    const knowledgeBase = await loadKnowledgeBase();
    queueAssistantMessage(buildServiceReply(
      "Acreages has a Channel Partner Program for brokers, agents, and real-estate sellers. The team can explain commissions, incentives, rewards, and support in detail.",
      knowledgeBase.services["channel-partner"].items,
      knowledgeBase.quickActions.partners
    ));
    return;
  }

  const nodes = getChatbotNodes();
  if (nodes.input) {
    nodes.input.value = label;
    nodes.form?.requestSubmit();
  }
}
async function handleSubmit(event) {
  event.preventDefault();
  const { input } = getChatbotNodes();
  if (!input) return;

  const value = input.value.trim();
  if (!value) return;

  input.value = "";
  addMessage({ role: "user", text: value });

  const knowledgeBase = await loadKnowledgeBase();
  state.isReady = true;

  const leadReply = handleLeadFlowInput(value, knowledgeBase);
  if (leadReply) {
    queueAssistantMessage(leadReply);
    return;
  }

  const reply = buildReply(value, knowledgeBase);
  queueAssistantMessage(reply);
}

function bindEvents() {
  const nodes = getChatbotNodes();
  nodes.launcher?.addEventListener("click", async () => {
    const next = !state.isOpen;
    setOpenState(next);
    if (next) await ensureGreeting();
  });
  nodes.close?.addEventListener("click", () => setOpenState(false));
  nodes.form?.addEventListener("submit", handleSubmit);

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-chatbot-action]");
    if (!action) return;
    handleAction(action.getAttribute("data-chatbot-action") || "", action.getAttribute("data-chatbot-project") || "");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.isOpen) setOpenState(false);
  });
}

export function initChatbot() {
  renderChatbotShell();
  restoreSession();
  bindEvents();
  renderMessages();
  setOpenState(state.isOpen);
}




