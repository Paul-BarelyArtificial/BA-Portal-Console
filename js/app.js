const APP_VERSION = "v1.2.0 – Marketing Cost & Rating";

const THEME_STORAGE_KEY = "ba-console-theme";

function resolveTheme(choice) {
  if (choice === "light") return "light";
  if (choice === "dark") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(choice) {
  const resolved = resolveTheme(choice);
  if (resolved === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  document.querySelectorAll(".theme-toggle button").forEach((button) => {
    button.classList.toggle("active", button.dataset.themeChoice === choice);
  });
}

applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || "auto");

function setupThemeToggle() {
  applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || "auto");
  document.querySelectorAll(".theme-toggle button").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.themeChoice;
      localStorage.setItem(THEME_STORAGE_KEY, choice);
      applyTheme(choice);
    });
  });
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    const current = localStorage.getItem(THEME_STORAGE_KEY) || "auto";
    if (current === "auto") applyTheme("auto");
  });
}

const pageTitles = {
  dashboard: "Dashboard",
  leads: "Leads",
  opportunities: "Opportunities",
  marketing: "Marketing",
  social: "Social Media",
  customers: "Customers",
  projects: "Projects",
  library: "Library",
  events: "Events",
  calendar: "Calendar",
  reports: "Reports",
  company: "Company Dashboard",
  settings: "Settings"
};

let customers = [];
let unsubscribeCustomers = null;
let projects = [];
let unsubscribeProjects = null;


let libraryItems = [];
let unsubscribeLibrary = null;

let timeSessions = [];
let unsubscribeTimeSessions = null;
let hoursPerDay = 8;
let unsubscribeTimeTrackerSettings = null;

let admins = [];
let unsubscribeAdmins = null;

let marketingOpportunities = [];
let unsubscribeMarketingOpportunities = null;
let selectedMarketingOpportunityId = null;
let editingMarketingOpportunityId = null;

let companyLinks = [];
let unsubscribeCompanyLinks = null;
let editingCompanyLinkId = null;
let currentCompanyLinkSearch = "";
let currentMarketingFilter = "all";
let currentMarketingSearch = "";

let socialPosts = [];
let unsubscribeSocialPosts = null;
let selectedSocialPostId = null;
let editingSocialPostId = null;
let currentSocialFilter = "all";
let currentSocialSearch = "";

let leads = [];
let unsubscribeLeads = null;
let selectedLeadId = null;
let editingLeadId = null;
let currentLeadFilter = "all";
let currentLeadSearch = "";
let currentLeadCustomerFilter = "";
let currentLeadMineOnly = false;

let opportunities = [];
let unsubscribeOpportunities = null;
let selectedOpportunityId = null;
let editingOpportunityId = null;
let currentOpportunityStageFilter = "all";
let currentOpportunitySearch = "";
let currentOpportunityCustomerFilter = "";
let currentOpportunityShowArchived = false;
let currentOpportunityMineOnly = false;
let editingOpportunityCommentId = null;
let stagedNewOpportunityAttachments = [];
let opportunityViewMode = "table";
try { opportunityViewMode = localStorage.getItem("ba-console-opportunity-view") || "table"; } catch (error) { console.error("Could not read view preference", error); }
let pipelineConfig = {
  salesStages: ["Prospect", "Qualify", "Technical Evaluation", "Proposal", "Selection", "Negotiation"],
  forecastCategories: ["Commit", "Top Forecast", "Forecast", "Upside", "Pipeline"]
};
let unsubscribePipelineConfig = null;

let events = [];
let unsubscribeEvents = null;
let selectedEventId = null;
let editingEventId = null;
let currentEventFilter = "all";
let currentEventSearch = "";
let currentEventCustomerFilter = "";

let currentCustomerFilter = "all";
let currentCustomerSearch = "";
let currentCustomerMineOnly = false;
let currentProjectFilter = "all";
let currentProjectSearch = "";
let currentProjectCustomerFilter = "";
let currentLibraryFilter = "all";
let currentLibrarySearch = "";
let selectedCustomerId = null;
let editingRelationshipCommentId = null;
let showingRegretFormFor = null;
const bulkSelectedCustomerIds = new Set();
const bulkSelectedLeadIds = new Set();
let expandedCustomerEventsId = null;
let expandedCustomerLibraryId = null;
let customerMessages = [];
let unsubscribeCustomerMessages = null;
let comingSoonItems = [];
let unsubscribeComingSoon = null;
let featureRequests = [];
let unsubscribeFeatureRequests = null;
let editingCustomerId = null;
let selectedProjectId = null;
let editingProjectId = null;
let selectedLibraryItemId = null;
let editingLibraryItemId = null;

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active-page", page.id === pageId);
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageId);
  });

  const label = pageTitles[pageId] || "Dashboard";
  document.getElementById("page-title").textContent = label;
}

const RECENTLY_VIEWED_KEY = "ba-console-recently-viewed";
const RECENTLY_VIEWED_MAX = 8;
const RECENTLY_VIEWED_LABELS = { customer: "Customer", lead: "Lead", opportunity: "Opportunity", project: "Project", contact: "Contact" };

function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]"); }
  catch (error) { return []; }
}

function recordRecentlyViewed(type, id, label) {
  try {
    let items = getRecentlyViewed().filter((item) => !(item.type === type && item.id === id));
    items.unshift({ type, id, label });
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items.slice(0, RECENTLY_VIEWED_MAX)));
  } catch (error) { console.error("Could not save recently viewed", error); }
  renderRecentlyViewed();
}

function openRecentlyViewedItem(type, id) {
  const targets = {
    customer: { list: customers, page: "customers", set: (v) => { selectedCustomerId = v; }, render: renderCustomerTable },
    lead: { list: leads, page: "leads", set: (v) => { selectedLeadId = v; }, render: renderLeadsTable },
    opportunity: { list: opportunities, page: "opportunities", set: (v) => { selectedOpportunityId = v; }, render: renderOpportunitiesTable },
    project: { list: projects, page: "projects", set: (v) => { selectedProjectId = v; }, render: renderProjectTable }
  };
  const target = targets[type];
  if (!target) return;
  if (!target.list.some((item) => item.id === id)) {
    alert("That record no longer exists.");
    return;
  }
  showPage(target.page);
  target.set(id);
  target.render();
}

function renderRecentlyViewed() {
  const container = document.getElementById("recently-viewed-list");
  if (!container) return;
  const items = getRecentlyViewed();
  container.innerHTML = items.length
    ? items.map((item) => `
        <li><button class="row-link" data-recently-viewed-type="${item.type}" data-recently-viewed-id="${item.id}"><strong>${escapeHtml(item.label)}</strong> <span class="table-subtext">${escapeHtml(RECENTLY_VIEWED_LABELS[item.type] || item.type)}</span></button></li>
      `).join("")
    : `<li><span class="muted">Nothing viewed yet</span></li>`;

  container.querySelectorAll("[data-recently-viewed-type]").forEach((button) => {
    button.addEventListener("click", () => {
      openRecentlyViewedItem(button.dataset.recentlyViewedType, button.dataset.recentlyViewedId);
    });
  });
}

function getStatusClass(status = "") {
  return String(status).toLowerCase().replace(/\s+/g, "-");
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function levenshteinDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[rows - 1][cols - 1];
}

function stripCompanySuffix(name) {
  return name
    .replace(/\b(ltd|limited|inc|incorporated|llc|plc|corp|corporation|co|company)\b\.?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findSimilarName(name, existingNames) {
  const normalised = name.trim().toLowerCase();
  if (!normalised) return null;
  const stripped = stripCompanySuffix(normalised);
  for (const existing of existingNames) {
    const existingNormalised = String(existing || "").trim().toLowerCase();
    if (!existingNormalised) continue;
    if (existingNormalised === normalised) return existing;
    const existingStripped = stripCompanySuffix(existingNormalised);
    if (stripped && existingStripped && stripped === existingStripped) return existing;
    const distance = levenshteinDistance(stripped || normalised, existingStripped || existingNormalised);
    const threshold = Math.max(2, Math.floor(Math.min(normalised.length, existingNormalised.length) * 0.2));
    if (distance <= threshold) return existing;
  }
  return null;
}

function getKnownProspectNames() {
  return [
    ...customers.map((customer) => customer.company),
    ...leads.map((lead) => lead.name),
    ...opportunities.map((opportunity) => opportunity.name)
  ];
}

function confirmIfSimilarNameExists(name, existingNames, entityLabel) {
  const match = findSimilarName(name, existingNames);
  if (!match) return true;
  return confirm(`A similar record already exists: "${match}". Create ${entityLabel} "${name}" anyway?`);
}

function formatFirestoreDate(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") return "Just now";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(timestamp.toDate());
}

function formatFirestoreDateTime(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") return "Just now";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(timestamp.toDate());
}

function formatBookingDateDisplay(isoDate) {
  if (!isoDate) return "No date set";
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function normaliseRelationshipHistory(data) {
  if (Array.isArray(data.relationshipHistory)) {
    return data.relationshipHistory.map((entry) => ({
      id: entry.id || "",
      text: entry.text || "",
      author: entry.author || "Unknown",
      createdAt: entry.createdAt || null,
      createdAtDisplay: formatFirestoreDateTime(entry.createdAt),
      updatedAt: entry.updatedAt || null
    }));
  }
  if (typeof data.relationshipHistory === "string" && data.relationshipHistory.trim()) {
    return [{
      id: "legacy",
      text: data.relationshipHistory.trim(),
      author: "Historical note",
      createdAt: data.createdAt || null,
      createdAtDisplay: formatFirestoreDate(data.createdAt),
      updatedAt: null
    }];
  }
  return [];
}

function normaliseCustomerContacts(data) {
  let contacts = Array.isArray(data.contacts) ? data.contacts : null;
  if (!contacts) {
    contacts = (data.contactName || data.contactEmail) ? [{
      name: data.contactName || "",
      email: data.contactEmail || "",
      portalAccountCreated: Boolean(data.portalAccountCreated),
      portalInviteSentAt: data.portalInviteSentAt || null
    }] : [];
  }
  return contacts.map((contact) => ({
    name: contact.name || "",
    role: contact.role || "",
    phone: contact.phone || "",
    email: contact.email || "",
    requiresPortalAccess: Boolean(contact.requiresPortalAccess),
    portalAccountCreated: Boolean(contact.portalAccountCreated),
    portalInviteSentAt: contact.portalInviteSentAt ? formatFirestoreDate(contact.portalInviteSentAt) : "",
    portalInviteSentAtRaw: contact.portalInviteSentAt || null
  }));
}

function normaliseCustomer(document) {
  const data = document.data() || {};
  return {
    id: document.id,
    company: data.company || "Unnamed customer",
    status: data.status || "Trial",
    projects: Number(data.projects || 0),
    users: Number(data.users || 0),
    owner: data.owner || "Paul O’Brien",
    lastUpdated: formatFirestoreDate(data.updatedAt || data.createdAt),
    notes: data.notes || "No notes added.",
    relationshipHistory: normaliseRelationshipHistory(data),
    customerMemory: data.customerMemory || "",
    website: data.website || "",
    phone: data.phone || "",
    industry: data.industry || "",
    companySize: data.companySize || "",
    address: data.address || "",
    contacts: normaliseCustomerContacts(data),
    uploadStorageUsedBytes: Number(data.uploadStorageUsedBytes || 0),
    internalPreview: Boolean(data.internalPreview),
    tags: Array.isArray(data.tags) ? data.tags : []
  };
}

const UPLOAD_QUOTA_BYTES = 500 * 1024 * 1024;

function normaliseWebsiteUrl(rawValue) {
  const trimmed = String(rawValue || "").trim();
  if (!trimmed) return "";
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


async function syncCustomerAccessMappings(customerList) {
  const database = firebase.firestore();
  const writes = [];
  customerList.forEach((customer) => {
    customer.contacts.forEach((contact) => {
      if (!contact.email) return;
      const email = contact.email.trim().toLowerCase();
      const ref = database.collection("customerAccess").doc(email);
      if (customer.status === "Archived") {
        // Archived customers keep their Portal login but lose Library access:
        // removing this mapping makes the Portal treat them as unlinked.
        writes.push(ref.delete());
      } else {
        writes.push(ref.set({
          customerId: customer.id,
          customerName: customer.company,
          email,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }));
      }
    });
  });
  try { await Promise.all(writes); }
  catch (error) { console.warn("Customer access mappings could not be synchronised", error); }
}

async function backfillUploadQuotaField(customerDocs) {
  const database = firebase.firestore();
  const writes = customerDocs
    .filter((doc) => typeof (doc.data() || {}).uploadStorageUsedBytes !== "number")
    .map((doc) => database.collection("customers").doc(doc.id).set({ uploadStorageUsedBytes: 0 }, { merge: true }));
  if (!writes.length) return;
  try { await Promise.all(writes); }
  catch (error) { console.warn("Could not backfill upload quota field", error); }
}

function getCurrentAdminName() {
  const nameSpan = document.querySelector("#admin-profile span:not(.profile-avatar)");
  if (nameSpan) return nameSpan.textContent.trim();
  return document.getElementById("admin-profile")?.textContent.trim() || "Admin";
}

function generateTempPassword() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return `${Array.from(bytes, (byte) => byte.toString(36)).join("").slice(0, 20)}Aa1!`;
}

function friendlyInviteError(error) {
  const messages = {
    "auth/invalid-email": "That contact email address is not valid.",
    "auth/network-request-failed": "Could not reach Firebase. Check your connection and try again."
  };
  return messages[error?.code] || "Could not send the Portal invite. Try again.";
}

async function sendPortalInvite(customer, contactIndex) {
  const contact = customer.contacts[contactIndex];
  const email = (contact?.email || "").trim().toLowerCase();
  if (!email) return;

  const statusEl = document.querySelector(`[data-invite-status="${customer.id}-${contactIndex}"]`);
  const button = document.querySelector(`[data-send-invite="${customer.id}-${contactIndex}"]`);
  if (button) button.disabled = true;
  if (statusEl) statusEl.textContent = "Sending invite…";

  try {
    if (!contact.portalAccountCreated) {
      let secondaryApp;
      try { secondaryApp = firebase.app("PortalInvite"); }
      catch (error) { secondaryApp = firebase.initializeApp(firebaseConfig, "PortalInvite"); }

      try {
        await secondaryApp.auth().createUserWithEmailAndPassword(email, generateTempPassword());
      } catch (error) {
        if (error.code !== "auth/email-already-in-use") throw error;
      } finally {
        await secondaryApp.auth().signOut().catch(() => {});
        await secondaryApp.delete();
      }
    }

    await auth.sendPasswordResetEmail(email);

    const updatedContacts = customer.contacts.map((entry, index) => index === contactIndex
      ? { ...entry, portalAccountCreated: true, portalInviteSentAt: firebase.firestore.Timestamp.now() }
      : entry);
    await firebase.firestore().collection("customers").doc(customer.id).set({
      contacts: updatedContacts
    }, { merge: true });

    if (statusEl) statusEl.textContent = `Invite sent to ${email}.`;
  } catch (error) {
    console.error("Could not send Portal invite", error);
    if (statusEl) statusEl.textContent = friendlyInviteError(error);
  } finally {
    if (button) button.disabled = false;
  }
}

function friendlyAdminInviteError(error) {
  const messages = {
    "auth/invalid-email": "Enter a valid email address.",
    "auth/network-request-failed": "Could not reach Firebase. Check your connection and try again."
  };
  return messages[error?.code] || "Could not add this admin. Try again.";
}

function getTeamMemberLabel(admin) {
  return admin.name || admin.email || admin.id;
}

function populateOwnerSelect(selectId, currentValue) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const names = Array.from(new Set(admins.map(getTeamMemberLabel).filter(Boolean)));
  if (currentValue && !names.includes(currentValue)) names.push(currentValue);
  select.innerHTML = names.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");
  const defaultOwner = getCurrentAdminName();
  select.value = currentValue || (defaultOwner && names.includes(defaultOwner) ? defaultOwner : (names[0] || ""));
}

function renderAdminList() {
  const container = document.getElementById("admin-list");
  if (!container) return;

  if (!admins.length) {
    container.innerHTML = "<div><strong>No admins found</strong></div>";
    return;
  }

  container.innerHTML = admins
    .map((admin) => `
      <div>
        <strong>${escapeHtml(admin.name || admin.email || admin.id)}${admin.role ? ` · ${escapeHtml(admin.role)}` : ""}</strong>
        <span>${escapeHtml(admin.email || "")} · ${admin.active === false ? "Inactive" : "Active"} · ${admin.addedAt ? `added ${formatFirestoreDate(admin.addedAt)}` : "added before this feature existed"}</span>
      </div>
    `)
    .join("");
}

function loadLiveAdmins() {
  if (unsubscribeAdmins) unsubscribeAdmins();
  const database = firebase.firestore();

  unsubscribeAdmins = database.collection("admins").onSnapshot((snapshot) => {
    admins = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderAdminList();
  }, (error) => {
    console.error("Could not load admins", error);
    const container = document.getElementById("admin-list");
    if (container) container.innerHTML = "<div><strong>Could not load admins</strong></div>";
  });
}

let featureFlags = { socialMedia: true, marketing: true, reports: true };

function applyFeatureFlags() {
  const navMap = { socialMedia: "social", marketing: "marketing", reports: "reports" };
  Object.entries(navMap).forEach(([flagKey, pageId]) => {
    const enabled = featureFlags[flagKey] !== false;
    document.querySelector(`.nav-item[data-page="${pageId}"]`)?.toggleAttribute("hidden", !enabled);
    document.getElementById(pageId)?.classList.toggle("feature-disabled", !enabled);
  });

  const socialWidget = document.getElementById("dashboard-social-list")?.closest(".upcoming-panel");
  if (socialWidget) socialWidget.hidden = featureFlags.socialMedia === false;

  const activePage = document.querySelector(".page.active-page");
  if (activePage && activePage.classList.contains("feature-disabled")) {
    showPage("dashboard");
  }
}

function loadLiveFeatureFlags() {
  firebase.firestore().collection("settings").doc("featureFlags").onSnapshot((doc) => {
    const data = doc.data() || {};
    featureFlags = {
      socialMedia: data.socialMedia !== false,
      marketing: data.marketing !== false,
      reports: data.reports !== false
    };
    const form = document.getElementById("feature-flags-form");
    if (form) {
      form.elements.namedItem("socialMedia").checked = featureFlags.socialMedia;
      form.elements.namedItem("marketing").checked = featureFlags.marketing;
      form.elements.namedItem("reports").checked = featureFlags.reports;
    }
    applyFeatureFlags();
  }, (error) => {
    console.error("Could not load feature flags", error);
  });
}

async function saveFeatureFlags(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.getElementById("feature-flags-message");
  const formData = new FormData(form);

  const updated = {
    socialMedia: formData.get("socialMedia") === "on",
    marketing: formData.get("marketing") === "on",
    reports: formData.get("reports") === "on"
  };

  if (message) message.textContent = "Saving…";
  try {
    await firebase.firestore().collection("settings").doc("featureFlags").set(updated, { merge: true });
    if (message) message.textContent = "Saved.";
    logAuditEvent("updated", "settings", "Enabled Features");
  } catch (error) {
    console.error("Could not save feature flags", error);
    if (message) message.textContent = "Could not save. Please try again.";
  }
}

let unsubscribeAuditLog = null;

function loadLiveAuditLog() {
  if (unsubscribeAuditLog) unsubscribeAuditLog();
  const container = document.getElementById("audit-log-list");

  unsubscribeAuditLog = firebase.firestore().collection("auditLog").orderBy("createdAt", "desc").limit(100).onSnapshot((snapshot) => {
    if (!container) return;
    if (snapshot.empty) {
      container.innerHTML = "<div><strong>No activity logged yet</strong></div>";
      return;
    }
    container.innerHTML = snapshot.docs.map((doc) => {
      const data = doc.data();
      return `<div><strong>${escapeHtml(data.adminName || "Admin")} ${escapeHtml(data.action || "changed")} ${escapeHtml(data.entityType || "record")}</strong><span>"${escapeHtml(data.entityLabel || "")}" · ${escapeHtml(formatFirestoreDate(data.createdAt))}</span></div>`;
    }).join("");
  }, (error) => {
    console.error("Could not load audit log", error);
    if (container) container.innerHTML = "<div><strong>Could not load activity log</strong></div>";
  });
}

async function addAdmin(email, name, role) {
  const normalisedEmail = (email || "").trim().toLowerCase();
  const statusEl = document.getElementById("add-admin-status");
  const button = document.getElementById("add-admin-button");
  if (!normalisedEmail) {
    if (statusEl) statusEl.textContent = "Enter an email address first.";
    return;
  }

  if (button) button.disabled = true;
  if (statusEl) statusEl.textContent = "Adding to team…";

  let secondaryApp;
  try {
    try { secondaryApp = firebase.app("AdminInvite"); }
    catch (error) { secondaryApp = firebase.initializeApp(firebaseConfig, "AdminInvite"); }

    let uid;
    try {
      const credential = await secondaryApp.auth().createUserWithEmailAndPassword(normalisedEmail, generateTempPassword());
      uid = credential.user.uid;
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        if (statusEl) statusEl.textContent = "That email already has a Firebase account (e.g. an existing customer). This tool can only add brand-new accounts — add them manually in Firebase Console using their existing UID.";
        return;
      }
      throw error;
    } finally {
      await secondaryApp.auth().signOut().catch(() => {});
    }

    await firebase.firestore().collection("admins").doc(uid).set({
      email: normalisedEmail,
      name: (name || "").trim(),
      role: (role || "").trim(),
      active: true,
      addedAt: firebase.firestore.FieldValue.serverTimestamp(),
      addedBy: auth.currentUser?.email || null
    });

    await auth.sendPasswordResetEmail(normalisedEmail);

    if (statusEl) statusEl.textContent = `Added to team — invite sent to ${normalisedEmail}.`;
    ["new-admin-email", "new-admin-name", "new-admin-role"].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = "";
    });
  } catch (error) {
    console.error("Could not add admin", error);
    if (statusEl) statusEl.textContent = friendlyAdminInviteError(error);
  } finally {
    if (secondaryApp) await secondaryApp.delete().catch(() => {});
    if (button) button.disabled = false;
  }
}

const BACKUP_COLLECTIONS = ["customers", "projects", "leads", "opportunities", "bookings", "library", "timeSessions", "events", "admins", "settings", "marketingOpportunities", "customerMessages", "comingSoon", "featureRequests", "socialPosts", "auditLog"];

function serialiseForBackup(value) {
  if (value && typeof value.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialiseForBackup);
  if (value && typeof value === "object") {
    const result = {};
    Object.keys(value).forEach((key) => { result[key] = serialiseForBackup(value[key]); });
    return result;
  }
  return value;
}

async function exportAllData() {
  const button = document.getElementById("export-data-button");
  const statusEl = document.getElementById("export-data-status");
  if (button) button.disabled = true;
  if (statusEl) statusEl.textContent = "Preparing export…";

  try {
    const database = firebase.firestore();
    const backup = {
      exportedAt: new Date().toISOString(),
      exportedBy: auth.currentUser?.email || null,
      collections: {}
    };

    for (const collectionName of BACKUP_COLLECTIONS) {
      const snapshot = await database.collection(collectionName).get();
      backup.collections[collectionName] = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: serialiseForBackup(doc.data())
      }));
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `barely-artificial-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    if (statusEl) statusEl.textContent = `Export complete — downloaded barely-artificial-backup-${timestamp}.json`;
  } catch (error) {
    console.error("Could not export data", error);
    if (statusEl) statusEl.textContent = "Could not export data. Check your connection and try again.";
  } finally {
    if (button) button.disabled = false;
  }
}

document.getElementById("export-data-button")?.addEventListener("click", exportAllData);

function deserialiseForRestore(value, key) {
  if (typeof value === "string" && /At$/.test(key || "") && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return firebase.firestore.Timestamp.fromDate(parsed);
  }
  if (Array.isArray(value)) return value.map((item) => deserialiseForRestore(item, ""));
  if (value && typeof value === "object") {
    const result = {};
    Object.keys(value).forEach((childKey) => { result[childKey] = deserialiseForRestore(value[childKey], childKey); });
    return result;
  }
  return value;
}

async function restoreFromBackupFile(file) {
  const statusEl = document.getElementById("restore-data-status");
  const button = document.getElementById("restore-data-button");
  if (button) button.disabled = true;

  try {
    if (statusEl) statusEl.textContent = "Reading backup file…";
    const text = await file.text();
    const backup = JSON.parse(text);
    if (!backup || typeof backup !== "object" || !backup.collections) {
      throw new Error("This doesn't look like a Barely Artificial backup file.");
    }

    const collectionNames = Object.keys(backup.collections).filter((name) => BACKUP_COLLECTIONS.includes(name) && name !== "auditLog");
    const totalDocs = collectionNames.reduce((sum, name) => sum + (backup.collections[name]?.length || 0), 0);
    if (!confirm(`This will overwrite ${totalDocs} record(s) across ${collectionNames.length} collection(s) with the versions in this file. Records not in the file are left untouched. Continue?`)) {
      if (statusEl) statusEl.textContent = "";
      return;
    }

    const database = firebase.firestore();
    let restored = 0;
    for (const collectionName of collectionNames) {
      const docs = backup.collections[collectionName] || [];
      for (const entry of docs) {
        if (!entry || !entry.id) continue;
        statusEl && (statusEl.textContent = `Restoring ${collectionName}… (${restored + 1} of ${totalDocs})`);
        await database.collection(collectionName).doc(entry.id).set(deserialiseForRestore(entry.data, ""));
        restored += 1;
      }
    }

    logAuditEvent("restored", "backup", `${restored} record(s) from ${file.name}`);
    if (statusEl) statusEl.textContent = `Restore complete — ${restored} record(s) restored from ${file.name}.`;
  } catch (error) {
    console.error("Could not restore backup", error);
    if (statusEl) statusEl.textContent = `Could not restore this file: ${error.message || "please check it's a valid backup."}`;
  } finally {
    if (button) button.disabled = false;
  }
}

document.getElementById("restore-data-button")?.addEventListener("click", () => {
  document.getElementById("restore-data-input")?.click();
});
document.getElementById("restore-data-input")?.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) restoreFromBackupFile(file);
  event.target.value = "";
});

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORDINAL_NAMES = { "1": "First", "2": "Second", "3": "Third", "4": "Fourth", "-1": "Last" };

function normaliseMarketingOpportunity(documentSnapshot) {
  const data = documentSnapshot.data() || {};
  return {
    id: documentSnapshot.id,
    name: data.name || "Unnamed opportunity",
    type: data.type || "Other",
    recurrence: data.recurrence || { frequency: "once", date: "" },
    url: data.url || "",
    cost: Number(data.cost) || 0,
    costFrequency: data.costFrequency || "month",
    rating: data.rating ? Number(data.rating) : null,
    notes: data.notes || "",
    active: data.active !== false
  };
}

function formatMarketingCost(item) {
  if (!item.cost) return "—";
  const frequencyLabel = { once: "one-off", month: "/month", year: "/year" }[item.costFrequency] || "";
  return frequencyLabel === "one-off" ? `${formatCurrency(item.cost)} one-off` : `${formatCurrency(item.cost)}${frequencyLabel}`;
}

function formatMarketingRating(item) {
  if (!item.rating) return "Not rated";
  return `${"★".repeat(item.rating)}${"☆".repeat(5 - item.rating)} (${item.rating}/5)`;
}

function describeRecurrence(recurrence) {
  if (!recurrence) return "Not set";
  if (recurrence.frequency === "once") {
    return recurrence.date ? `Once — ${formatBookingDateDisplay(recurrence.date)}` : "Once — no date set";
  }
  if (recurrence.frequency === "weekly") {
    return `Weekly — every ${WEEKDAY_NAMES[recurrence.weekday]}`;
  }
  if (recurrence.frequency === "monthly") {
    return `Monthly — ${ORDINAL_NAMES[String(recurrence.ordinal)]} ${WEEKDAY_NAMES[recurrence.weekday]}`;
  }
  return "Not set";
}

function getNthWeekdayOfMonth(year, month, weekday, ordinal) {
  if (ordinal === -1) {
    const lastDay = new Date(year, month + 1, 0);
    const diff = (lastDay.getDay() - weekday + 7) % 7;
    return new Date(year, month, lastDay.getDate() - diff);
  }
  const firstDay = new Date(year, month, 1);
  const diff = (weekday - firstDay.getDay() + 7) % 7;
  const day = 1 + diff + (ordinal - 1) * 7;
  const candidate = new Date(year, month, day);
  return candidate.getMonth() === month ? candidate : null;
}

function getNextOccurrence(recurrence, fromDate = new Date()) {
  if (!recurrence) return null;
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());

  if (recurrence.frequency === "once") {
    if (!recurrence.date) return null;
    const parsed = new Date(`${recurrence.date}T00:00:00`);
    return parsed >= today ? parsed : null;
  }

  if (recurrence.frequency === "weekly") {
    const weekday = Number(recurrence.weekday);
    const diff = (weekday - today.getDay() + 7) % 7;
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
  }

  if (recurrence.frequency === "monthly") {
    const weekday = Number(recurrence.weekday);
    const ordinal = Number(recurrence.ordinal);
    let year = today.getFullYear();
    let month = today.getMonth();
    for (let i = 0; i < 12; i++) {
      const candidate = getNthWeekdayOfMonth(year, month, weekday, ordinal);
      if (candidate && candidate >= today) return candidate;
      month += 1;
      if (month > 11) { month = 0; year += 1; }
    }
  }

  return null;
}

function formatOccurrenceDate(date) {
  if (!date) return "Not scheduled";
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(date);
}

function formatOccurrenceRelative(date) {
  if (!date) return "";
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((date - startOfToday) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function loadLiveMarketingOpportunities() {
  if (unsubscribeMarketingOpportunities) unsubscribeMarketingOpportunities();
  const summary = document.getElementById("marketing-summary");
  if (summary) summary.textContent = "Loading marketing opportunities…";

  unsubscribeMarketingOpportunities = firebase.firestore().collection("marketingOpportunities").onSnapshot((snapshot) => {
    marketingOpportunities = snapshot.docs.map(normaliseMarketingOpportunity);
    selectedMarketingOpportunityId = marketingOpportunities.some((item) => item.id === selectedMarketingOpportunityId) ? selectedMarketingOpportunityId : null;
    renderMarketingTable();
    renderUpcomingMarketingOpportunities();
  }, (error) => {
    console.error("Could not load marketing opportunities", error);
    marketingOpportunities = [];
    renderMarketingTable();
    renderUpcomingMarketingOpportunities();
    if (summary) summary.textContent = "Marketing opportunities could not be loaded. Check Firestore access.";
  });
}

function renderUpcomingMarketingOpportunities() {
  const list = document.getElementById("marketing-upcoming-list");
  if (!list) return;

  const upcoming = marketingOpportunities
    .filter((item) => item.active)
    .map((item) => ({ item, next: getNextOccurrence(item.recurrence) }))
    .filter(({ next }) => next && Math.round((next - new Date()) / (1000 * 60 * 60 * 24)) <= 14)
    .sort((a, b) => a.next - b.next);

  if (upcoming.length === 0) {
    list.innerHTML = `<li><span>Nothing coming up in the next 14 days.</span></li>`;
    return;
  }

  list.innerHTML = upcoming
    .map(({ item, next }) => `<li><span>${escapeHtml(item.name)} <span class="table-subtext">${escapeHtml(item.type)}</span></span><time>${formatOccurrenceRelative(next)}</time></li>`)
    .join("");
}

function resetMarketingDialogToCreateMode() {
  editingMarketingOpportunityId = null;
  document.getElementById("marketing-form")?.reset();
  const title = document.getElementById("marketing-dialog-title");
  const saveButton = document.getElementById("save-marketing-button");
  if (title) title.textContent = "New Opportunity";
  if (saveButton) saveButton.textContent = "Create Opportunity";
  updateMarketingFrequencyFields();
}

function updateMarketingFrequencyFields() {
  const frequency = document.getElementById("marketing-frequency")?.value;
  const ordinalGroup = document.getElementById("marketing-ordinal-group");
  const weekdayGroup = document.getElementById("marketing-weekday-group");
  const onceDateGroup = document.getElementById("marketing-once-date-group");
  if (ordinalGroup) ordinalGroup.hidden = frequency !== "monthly";
  if (weekdayGroup) weekdayGroup.hidden = frequency === "once";
  if (onceDateGroup) onceDateGroup.hidden = frequency !== "once";
}

function openMarketingDialogForEdit(item) {
  const form = document.getElementById("marketing-form");
  const dialog = document.getElementById("marketing-dialog");
  const title = document.getElementById("marketing-dialog-title");
  const saveButton = document.getElementById("save-marketing-button");
  if (!form || !dialog) return;

  editingMarketingOpportunityId = item.id;
  form.elements.namedItem("name").value = item.name;
  form.elements.namedItem("type").value = item.type;
  form.elements.namedItem("frequency").value = item.recurrence.frequency || "monthly";
  form.elements.namedItem("ordinal").value = String(item.recurrence.ordinal ?? "1");
  form.elements.namedItem("weekday").value = String(item.recurrence.weekday ?? "3");
  form.elements.namedItem("date").value = item.recurrence.date || "";
  form.elements.namedItem("url").value = item.url;
  form.elements.namedItem("cost").value = item.cost || "";
  form.elements.namedItem("costFrequency").value = item.costFrequency || "month";
  form.elements.namedItem("rating").value = item.rating || "";
  form.elements.namedItem("notes").value = item.notes;
  updateMarketingFrequencyFields();
  if (title) title.textContent = "Edit Opportunity";
  if (saveButton) saveButton.textContent = "Save Changes";
  dialog.showModal();
}

async function createMarketingOpportunity(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const saveButton = document.getElementById("save-marketing-button");
  const message = document.getElementById("marketing-form-message");
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    message.textContent = "Enter a name for this opportunity.";
    return;
  }

  const frequency = formData.get("frequency") || "monthly";
  const recurrence = { frequency };
  if (frequency === "once") {
    recurrence.date = String(formData.get("date") || "").trim();
  } else {
    recurrence.weekday = Number(formData.get("weekday"));
    if (frequency === "monthly") recurrence.ordinal = Number(formData.get("ordinal"));
  }

  const rating = formData.get("rating");

  const record = {
    name,
    type: formData.get("type") || "Other",
    recurrence,
    url: String(formData.get("url") || "").trim(),
    cost: Number(formData.get("cost")) || 0,
    costFrequency: formData.get("costFrequency") || "month",
    rating: rating ? Number(rating) : null,
    notes: String(formData.get("notes") || "").trim()
  };

  saveButton.disabled = true;
  try {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    if (editingMarketingOpportunityId) {
      message.textContent = "Saving changes…";
      await firebase.firestore().collection("marketingOpportunities").doc(editingMarketingOpportunityId).set({
        ...record,
        updatedAt: now
      }, { merge: true });
      message.textContent = "Changes saved.";
    } else {
      message.textContent = "Saving opportunity…";
      await firebase.firestore().collection("marketingOpportunities").add({
        ...record,
        active: true,
        createdAt: now,
        updatedAt: now
      });
      message.textContent = "Opportunity created.";
    }

    form.reset();
    setTimeout(() => {
      document.getElementById("marketing-dialog")?.close();
      resetMarketingDialogToCreateMode();
      message.textContent = "";
    }, 500);
  } catch (error) {
    console.error("Could not save marketing opportunity", error);
    message.textContent = "This could not be saved. Please try again.";
  } finally {
    saveButton.disabled = false;
  }
}

async function setMarketingOpportunityActive(item, active) {
  try {
    await firebase.firestore().collection("marketingOpportunities").doc(item.id).set({
      active,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Could not update marketing opportunity", error);
    alert("This could not be updated. Please try again.");
  }
}

async function deleteMarketingOpportunity(item) {
  if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
  try {
    await firebase.firestore().collection("marketingOpportunities").doc(item.id).delete();
    if (selectedMarketingOpportunityId === item.id) selectedMarketingOpportunityId = null;
  } catch (error) {
    console.error("Could not delete marketing opportunity", error);
    alert("This could not be deleted. Please try again.");
  }
}

function getFilteredMarketingOpportunities() {
  return marketingOpportunities.filter((item) => {
    const matchesFilter = currentMarketingFilter === "all"
      || (currentMarketingFilter === "Active" && item.active)
      || (currentMarketingFilter === "Archived" && !item.active);
    const searchTarget = `${item.name} ${item.type} ${item.notes}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentMarketingSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

function getMarketingDetailMarkup(item) {
  const next = getNextOccurrence(item.recurrence);
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Marketing opportunity</p>
          <h3>${escapeHtml(item.name)}</h3>
        </div>
        <div class="detail-header-actions">
          <span class="status ${item.active ? "active" : "archived"}">${item.active ? "Active" : "Archived"}</span>
          <button class="icon-button" data-close-marketing-detail aria-label="Close detail">×</button>
        </div>
      </div>
      <div class="detail-grid">
        <div><span>Type</span><strong>${escapeHtml(item.type)}</strong></div>
        <div><span>Recurrence</span><strong>${escapeHtml(describeRecurrence(item.recurrence))}</strong></div>
        <div><span>Next occurrence</span><strong>${escapeHtml(formatOccurrenceDate(next))}</strong></div>
        <div><span>Cost</span><strong>${escapeHtml(formatMarketingCost(item))}</strong></div>
        <div><span>Usefulness rating</span><strong>${escapeHtml(formatMarketingRating(item))}</strong></div>
      </div>
      ${item.url ? `<p><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Open link ↗</a></p>` : ""}
      <p>${escapeHtml(item.notes || "No notes added.")}</p>
      <div class="detail-actions">
        <button class="secondary-button" data-edit-marketing="${item.id}">Edit</button>
        <button class="secondary-button" data-toggle-marketing-active="${item.id}">${item.active ? "Archive" : "Reactivate"}</button>
        <button class="secondary-button danger-button" data-delete-marketing="${item.id}">Delete</button>
      </div>
    </div>
  `;
}

function renderMarketingTable() {
  const tableBody = document.getElementById("marketing-table");
  const summary = document.getElementById("marketing-summary");
  if (!tableBody || !summary) return;

  const filteredItems = getFilteredMarketingOpportunities()
    .slice()
    .sort((a, b) => {
      const nextA = getNextOccurrence(a.recurrence);
      const nextB = getNextOccurrence(b.recurrence);
      if (!nextA && !nextB) return 0;
      if (!nextA) return 1;
      if (!nextB) return -1;
      return nextA - nextB;
    });
  tableBody.innerHTML = "";

  if (filteredItems.length === 0) {
    tableBody.innerHTML = marketingOpportunities.length === 0
      ? `<tr><td colspan="6" class="empty-table">No marketing opportunities yet — click "+ New Opportunity" above to add your first one.</td></tr>`
      : `<tr><td colspan="6" class="empty-table">No opportunities match your search.</td></tr>`;
  } else {
    filteredItems.forEach((item) => {
      const next = getNextOccurrence(item.recurrence);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><button class="row-link" data-marketing-id="${item.id}"><strong>${escapeHtml(item.name)}</strong>${item.active ? "" : ` <span class="badge inline-badge">Archived</span>`}</button></td>
        <td>${escapeHtml(item.type)}</td>
        <td>${escapeHtml(describeRecurrence(item.recurrence))}</td>
        <td>${escapeHtml(formatOccurrenceDate(next))}</td>
        <td>${escapeHtml(formatMarketingRating(item))}</td>
        <td>${escapeHtml(formatMarketingCost(item))}</td>
      `;
      tableBody.appendChild(row);

      if (selectedMarketingOpportunityId === item.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="6">${getMarketingDetailMarkup(item)}</td>`;
        tableBody.appendChild(detailRow);
      }
    });
  }

  summary.textContent = `Showing ${filteredItems.length} of ${marketingOpportunities.length} marketing opportunities`;

  document.querySelectorAll("[data-marketing-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedMarketingOpportunityId = selectedMarketingOpportunityId === button.dataset.marketingId ? null : button.dataset.marketingId;
      renderMarketingTable();
    });
  });

  document.querySelectorAll("[data-close-marketing-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedMarketingOpportunityId = null;
      renderMarketingTable();
    });
  });

  document.querySelectorAll("[data-edit-marketing]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = marketingOpportunities.find((entry) => entry.id === button.dataset.editMarketing);
      if (item) openMarketingDialogForEdit(item);
    });
  });

  document.querySelectorAll("[data-toggle-marketing-active]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = marketingOpportunities.find((entry) => entry.id === button.dataset.toggleMarketingActive);
      if (item) setMarketingOpportunityActive(item, !item.active);
    });
  });

  document.querySelectorAll("[data-delete-marketing]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = marketingOpportunities.find((entry) => entry.id === button.dataset.deleteMarketing);
      if (item) deleteMarketingOpportunity(item);
    });
  });
}

function setupMarketingControls() {
  const searchInput = document.getElementById("marketing-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentMarketingSearch = event.target.value;
      renderMarketingTable();
    });
  }

  document.querySelectorAll(".marketing-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentMarketingFilter = button.dataset.marketingFilter;
      document.querySelectorAll(".marketing-filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderMarketingTable();
    });
  });

  document.getElementById("marketing-frequency")?.addEventListener("change", updateMarketingFrequencyFields);
}

function normaliseCompanyLink(documentSnapshot) {
  const data = documentSnapshot.data() || {};
  return {
    id: documentSnapshot.id,
    name: data.name || "Untitled link",
    url: data.url || "",
    category: data.category || "General"
  };
}

function getFaviconUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(hostname)}`;
  } catch (error) {
    return "";
  }
}

function loadLiveCompanyLinks() {
  if (unsubscribeCompanyLinks) unsubscribeCompanyLinks();
  const summary = document.getElementById("company-link-summary");
  if (summary) summary.textContent = "Loading company links…";

  unsubscribeCompanyLinks = firebase.firestore().collection("companyLinks").onSnapshot((snapshot) => {
    companyLinks = snapshot.docs.map(normaliseCompanyLink);
    updateCompanyLinkCategoryOptions();
    renderCompanyLinks();
  }, (error) => {
    console.error("Could not load company links", error);
    companyLinks = [];
    renderCompanyLinks();
    if (summary) summary.textContent = "Company links could not be loaded. Check Firestore access.";
  });
}

function updateCompanyLinkCategoryOptions() {
  const datalist = document.getElementById("company-link-category-options");
  if (!datalist) return;
  const names = [...new Set(companyLinks.map((item) => item.category).filter(Boolean))].sort();
  datalist.innerHTML = names.map((name) => `<option value="${escapeHtml(name)}"></option>`).join("");
}

function resetCompanyLinkDialogToCreateMode() {
  editingCompanyLinkId = null;
  document.getElementById("company-link-form")?.reset();
  const title = document.getElementById("company-link-dialog-title");
  const saveButton = document.getElementById("save-company-link-button");
  if (title) title.textContent = "Add Link";
  if (saveButton) saveButton.textContent = "Add Link";
}

function openCompanyLinkDialogForEdit(item) {
  const form = document.getElementById("company-link-form");
  const dialog = document.getElementById("company-link-dialog");
  const title = document.getElementById("company-link-dialog-title");
  const saveButton = document.getElementById("save-company-link-button");
  if (!form || !dialog) return;

  editingCompanyLinkId = item.id;
  form.elements.namedItem("name").value = item.name;
  form.elements.namedItem("url").value = item.url;
  form.elements.namedItem("category").value = item.category;
  if (title) title.textContent = "Edit Link";
  if (saveButton) saveButton.textContent = "Save Changes";
  dialog.showModal();
}

async function createCompanyLink(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const saveButton = document.getElementById("save-company-link-button");
  const message = document.getElementById("company-link-form-message");
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const url = normaliseWebsiteUrl(String(formData.get("url") || "").trim());
  const category = String(formData.get("category") || "").trim() || "General";

  if (!name || !url) {
    message.textContent = "Enter a name and URL for this link.";
    return;
  }

  saveButton.disabled = true;
  try {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    if (editingCompanyLinkId) {
      message.textContent = "Saving changes…";
      await firebase.firestore().collection("companyLinks").doc(editingCompanyLinkId).set({
        name, url, category, updatedAt: now
      }, { merge: true });
      message.textContent = "Changes saved.";
    } else {
      message.textContent = "Saving link…";
      await firebase.firestore().collection("companyLinks").add({
        name, url, category, createdAt: now, updatedAt: now
      });
      message.textContent = "Link added.";
    }

    form.reset();
    setTimeout(() => {
      document.getElementById("company-link-dialog")?.close();
      resetCompanyLinkDialogToCreateMode();
      message.textContent = "";
    }, 500);
  } catch (error) {
    console.error("Could not save company link", error);
    message.textContent = "This could not be saved. Please try again.";
  } finally {
    saveButton.disabled = false;
  }
}

async function deleteCompanyLink(item) {
  if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
  try {
    await firebase.firestore().collection("companyLinks").doc(item.id).delete();
  } catch (error) {
    console.error("Could not delete company link", error);
    alert("This could not be deleted. Please try again.");
  }
}

function getFilteredCompanyLinks() {
  const search = currentCompanyLinkSearch.toLowerCase();
  return companyLinks.filter((item) => `${item.name} ${item.category} ${item.url}`.toLowerCase().includes(search));
}

function renderCompanyLinks() {
  const container = document.getElementById("company-link-groups");
  const summary = document.getElementById("company-link-summary");
  if (!container || !summary) return;

  const filteredItems = getFilteredCompanyLinks();
  summary.textContent = `Showing ${filteredItems.length} of ${companyLinks.length} company links`;

  if (filteredItems.length === 0) {
    container.innerHTML = `<div class="empty-state">${companyLinks.length === 0
      ? 'No company links yet — click "+ Add Link" above to add your first one.'
      : "No links match your search."}</div>`;
    return;
  }

  const groups = new Map();
  filteredItems.forEach((item) => {
    if (!groups.has(item.category)) groups.set(item.category, []);
    groups.get(item.category).push(item);
  });
  const sortedCategories = [...groups.keys()].sort((a, b) => a.localeCompare(b));

  container.innerHTML = sortedCategories.map((category) => {
    const items = groups.get(category).slice().sort((a, b) => a.name.localeCompare(b.name));
    return `
      <div class="company-link-category">
        <h3>${escapeHtml(category)}</h3>
        <div class="company-link-grid">
          ${items.map((item) => {
            const favicon = getFaviconUrl(item.url);
            return `
              <a class="company-link-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                ${favicon ? `<img class="company-link-favicon" src="${escapeHtml(favicon)}" alt="" loading="lazy" />` : ""}
                <span class="company-link-name">${escapeHtml(item.name)}</span>
                <span class="company-link-actions">
                  <button class="icon-button" type="button" data-edit-company-link="${item.id}" aria-label="Edit ${escapeHtml(item.name)}">✎</button>
                  <button class="icon-button" type="button" data-delete-company-link="${item.id}" aria-label="Delete ${escapeHtml(item.name)}">×</button>
                </span>
              </a>`;
          }).join("")}
        </div>
      </div>`;
  }).join("");

  container.querySelectorAll("[data-edit-company-link]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const item = companyLinks.find((entry) => entry.id === button.dataset.editCompanyLink);
      if (item) openCompanyLinkDialogForEdit(item);
    });
  });

  container.querySelectorAll("[data-delete-company-link]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const item = companyLinks.find((entry) => entry.id === button.dataset.deleteCompanyLink);
      if (item) deleteCompanyLink(item);
    });
  });
}

function setupCompanyLinkControls() {
  const searchInput = document.getElementById("company-link-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentCompanyLinkSearch = event.target.value;
      renderCompanyLinks();
    });
  }
}

function normaliseSocialPost(documentSnapshot) {
  const data = documentSnapshot.data() || {};
  return {
    id: documentSnapshot.id,
    title: data.title || "Untitled post",
    status: data.status || "Planning",
    postDate: data.postDate || "",
    campaign: data.campaign || "",
    platforms: Array.isArray(data.platforms) ? data.platforms : [],
    why: data.why || "",
    contentCreator: data.contentCreator || "",
    poster: data.poster || "",
    mediaType: data.mediaType || "Image/Graphic",
    mediaUrl: data.mediaUrl || "",
    hashtags: data.hashtags || "",
    goal: data.goal || "Awareness",
    liveUrl: data.liveUrl || "",
    engagementLevel: data.engagementLevel || "Not yet posted",
    performanceNotes: data.performanceNotes || ""
  };
}

function getSocialCreationWindow(postDate) {
  if (!postDate) return null;
  const post = new Date(`${postDate}T00:00:00`);
  if (Number.isNaN(post.getTime())) return null;
  const start = new Date(post);
  start.setDate(start.getDate() - 7);
  return { start, end: post };
}

function formatSocialCreationWindow(postDate) {
  const window = getSocialCreationWindow(postDate);
  if (!window) return "No post date set";
  return `${formatOccurrenceDate(window.start)} – ${formatOccurrenceDate(window.end)}`;
}

function updateSocialCampaignOptions() {
  const datalist = document.getElementById("social-campaign-options");
  if (!datalist) return;
  const names = [...new Set(socialPosts.map((post) => post.campaign).filter(Boolean))].sort();
  datalist.innerHTML = names.map((name) => `<option value="${escapeHtml(name)}"></option>`).join("");
}

function renderSocialUpcomingInto(elementId) {
  const list = document.getElementById(elementId);
  if (!list) return;

  const today = new Date();
  const upcoming = socialPosts
    .filter((post) => post.postDate && !["Posted", "Cancelled"].includes(post.status))
    .map((post) => ({ post, window: getSocialCreationWindow(post.postDate) }))
    .filter(({ window }) => window && Math.round((window.end - today) / (1000 * 60 * 60 * 24)) <= 14 && Math.round((window.end - today) / (1000 * 60 * 60 * 24)) >= -1)
    .sort((a, b) => a.window.end - b.window.end);

  if (upcoming.length === 0) {
    list.innerHTML = `<li><span>Nothing needs attention in the next 14 days.</span></li>`;
    return;
  }

  list.innerHTML = upcoming
    .map(({ post, window }) => {
      const daysToCreate = Math.round((window.start - today) / (1000 * 60 * 60 * 24));
      const relative = (date) => {
        const text = formatOccurrenceRelative(date);
        return text.startsWith("In ") ? `in ${text.slice(3)}` : text.toLowerCase();
      };
      const label = daysToCreate >= 0 ? `Start creating ${relative(window.start)}` : `Post ${relative(window.end)}`;
      return `<li><span>${escapeHtml(post.title)} <span class="table-subtext">${escapeHtml(post.status)} · ${post.platforms.length ? escapeHtml(post.platforms.join(", ")) : "No platform set"}</span></span><time>${label}</time></li>`;
    })
    .join("");
}

function renderSocialUpcoming() {
  renderSocialUpcomingInto("social-upcoming-list");
  renderSocialUpcomingInto("dashboard-social-list");
}

function loadLiveSocialPosts() {
  if (unsubscribeSocialPosts) unsubscribeSocialPosts();
  const summary = document.getElementById("social-summary");
  if (summary) summary.textContent = "Loading social posts…";

  unsubscribeSocialPosts = firebase.firestore().collection("socialPosts").orderBy("postDate").onSnapshot((snapshot) => {
    socialPosts = snapshot.docs.map(normaliseSocialPost);
    selectedSocialPostId = socialPosts.some((post) => post.id === selectedSocialPostId) ? selectedSocialPostId : null;
    renderSocialTable();
    renderSocialUpcoming();
    updateSocialCampaignOptions();
  }, (error) => {
    console.error("Could not load social posts", error);
    socialPosts = [];
    renderSocialTable();
    renderSocialUpcoming();
    if (summary) summary.textContent = "Social posts could not be loaded. Check Firestore access.";
  });
}

function resetSocialDialogToCreateMode() {
  editingSocialPostId = null;
  document.getElementById("social-form")?.reset();
  const title = document.getElementById("social-dialog-title");
  const saveButton = document.getElementById("save-social-button");
  if (title) title.textContent = "New Post";
  if (saveButton) saveButton.textContent = "Create Post";
}

function openSocialDialogForEdit(post) {
  const form = document.getElementById("social-form");
  const dialog = document.getElementById("social-dialog");
  const title = document.getElementById("social-dialog-title");
  const saveButton = document.getElementById("save-social-button");
  if (!form || !dialog) return;

  editingSocialPostId = post.id;
  form.elements.namedItem("title").value = post.title;
  form.elements.namedItem("status").value = post.status;
  form.elements.namedItem("postDate").value = post.postDate;
  form.elements.namedItem("campaign").value = post.campaign;
  form.querySelectorAll('input[name="platforms"]').forEach((input) => {
    input.checked = post.platforms.includes(input.value);
  });
  form.elements.namedItem("why").value = post.why;
  form.elements.namedItem("contentCreator").value = post.contentCreator;
  form.elements.namedItem("poster").value = post.poster;
  form.elements.namedItem("mediaType").value = post.mediaType;
  form.elements.namedItem("mediaUrl").value = post.mediaUrl;
  form.elements.namedItem("hashtags").value = post.hashtags;
  form.elements.namedItem("goal").value = post.goal;
  form.elements.namedItem("liveUrl").value = post.liveUrl;
  form.elements.namedItem("engagementLevel").value = post.engagementLevel;
  form.elements.namedItem("performanceNotes").value = post.performanceNotes;
  if (title) title.textContent = "Edit Post";
  if (saveButton) saveButton.textContent = "Save Changes";
  dialog.showModal();
}

async function createSocialPost(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const saveButton = document.getElementById("save-social-button");
  const message = document.getElementById("social-form-message");
  const formData = new FormData(form);
  const title = String(formData.get("title") || "").trim();

  if (!title) {
    message.textContent = "Enter a post title.";
    return;
  }

  const record = {
    title,
    status: formData.get("status") || "Planning",
    postDate: String(formData.get("postDate") || "").trim(),
    campaign: String(formData.get("campaign") || "").trim(),
    platforms: formData.getAll("platforms"),
    why: String(formData.get("why") || "").trim(),
    contentCreator: String(formData.get("contentCreator") || "").trim(),
    poster: String(formData.get("poster") || "").trim(),
    mediaType: formData.get("mediaType") || "Image/Graphic",
    mediaUrl: String(formData.get("mediaUrl") || "").trim(),
    hashtags: String(formData.get("hashtags") || "").trim(),
    goal: formData.get("goal") || "Awareness",
    liveUrl: String(formData.get("liveUrl") || "").trim(),
    engagementLevel: formData.get("engagementLevel") || "Not yet posted",
    performanceNotes: String(formData.get("performanceNotes") || "").trim()
  };

  saveButton.disabled = true;
  try {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    if (editingSocialPostId) {
      message.textContent = "Saving changes…";
      await firebase.firestore().collection("socialPosts").doc(editingSocialPostId).set({ ...record, updatedAt: now }, { merge: true });
      message.textContent = "Changes saved.";
    } else {
      message.textContent = "Saving post…";
      await firebase.firestore().collection("socialPosts").add({ ...record, createdAt: now, updatedAt: now });
      message.textContent = "Post created.";
    }

    form.reset();
    setTimeout(() => {
      document.getElementById("social-dialog")?.close();
      resetSocialDialogToCreateMode();
      message.textContent = "";
    }, 500);
  } catch (error) {
    console.error("Could not save social post", error);
    message.textContent = "Could not save this post. Please try again.";
  } finally {
    saveButton.disabled = false;
  }
}

async function deleteSocialPost(post) {
  if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
  try {
    await firebase.firestore().collection("socialPosts").doc(post.id).delete();
    if (selectedSocialPostId === post.id) selectedSocialPostId = null;
  } catch (error) {
    console.error("Could not delete social post", error);
    alert("This post could not be deleted. Please try again.");
  }
}

function getFilteredSocialPosts() {
  return socialPosts.filter((post) => {
    const matchesFilter = currentSocialFilter === "all" || post.status === currentSocialFilter;
    const searchTarget = `${post.title} ${post.campaign} ${post.platforms.join(" ")} ${post.contentCreator} ${post.poster} ${post.hashtags} ${post.why}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentSocialSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

function getSocialDetailMarkup(post) {
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Social post</p>
          <h3>${escapeHtml(post.title)}</h3>
        </div>
        <div class="detail-header-actions">
          <span class="status ${getStatusClass(post.status)}">${escapeHtml(post.status)}</span>
          <button class="icon-button" data-close-social-detail aria-label="Close detail">×</button>
        </div>
      </div>
      <div class="detail-grid">
        <div><span>Post date</span><strong>${escapeHtml(formatBookingDateDisplay(post.postDate))}</strong></div>
        <div><span>Creation window</span><strong>${escapeHtml(formatSocialCreationWindow(post.postDate))}</strong></div>
        <div><span>Campaign</span><strong>${escapeHtml(post.campaign || "None")}</strong></div>
        <div><span>Goal</span><strong>${escapeHtml(post.goal)}</strong></div>
        <div><span>Content creator</span><strong>${escapeHtml(post.contentCreator || "Not set")}</strong></div>
        <div><span>Posted by</span><strong>${escapeHtml(post.poster || "Not set")}</strong></div>
        <div><span>Media type</span><strong>${escapeHtml(post.mediaType)}</strong></div>
        <div><span>Engagement</span><strong>${escapeHtml(post.engagementLevel)}</strong></div>
      </div>
      <p><strong>Platforms:</strong> ${post.platforms.length ? escapeHtml(post.platforms.join(", ")) : "None selected"}</p>
      ${post.why ? `<p><strong>Why:</strong> ${escapeHtml(post.why)}</p>` : ""}
      ${post.hashtags ? `<p><strong>Hashtags:</strong> ${escapeHtml(post.hashtags)}</p>` : ""}
      ${post.mediaUrl ? `<p><a href="${escapeHtml(post.mediaUrl)}" target="_blank" rel="noopener noreferrer">Open media file ↗</a></p>` : ""}
      ${post.liveUrl ? `<p><a href="${escapeHtml(post.liveUrl)}" target="_blank" rel="noopener noreferrer">Open live post ↗</a></p>` : ""}
      ${post.performanceNotes ? `<p><strong>How it went:</strong> ${escapeHtml(post.performanceNotes)}</p>` : ""}
      <div class="detail-actions">
        <button class="secondary-button" data-edit-social="${post.id}">Edit post</button>
        <button class="secondary-button danger-button" data-delete-social="${post.id}">Delete post</button>
      </div>
    </div>
  `;
}

function renderSocialTable() {
  const tableBody = document.getElementById("social-table");
  const summary = document.getElementById("social-summary");
  if (!tableBody || !summary) return;

  const filteredPosts = getFilteredSocialPosts();
  tableBody.innerHTML = "";

  if (filteredPosts.length === 0) {
    tableBody.innerHTML = socialPosts.length === 0
      ? `<tr><td colspan="5" class="empty-table">No social posts yet — click "+ New Post" above to plan your first one.</td></tr>`
      : `<tr><td colspan="5" class="empty-table">No posts match your search.</td></tr>`;
  } else {
    filteredPosts.forEach((post) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><button class="row-link" data-social-id="${post.id}"><strong>${escapeHtml(post.title)}</strong>${post.campaign ? `<span class="table-subtext">${escapeHtml(post.campaign)}</span>` : ""}</button></td>
        <td>${post.platforms.length ? escapeHtml(post.platforms.join(", ")) : "—"}</td>
        <td><span class="status ${getStatusClass(post.status)}">${escapeHtml(post.status)}</span></td>
        <td>${escapeHtml(formatBookingDateDisplay(post.postDate))}</td>
        <td>${escapeHtml(formatSocialCreationWindow(post.postDate))}</td>
      `;
      tableBody.appendChild(row);

      if (selectedSocialPostId === post.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="5">${getSocialDetailMarkup(post)}</td>`;
        tableBody.appendChild(detailRow);
      }
    });
  }

  summary.textContent = `Showing ${filteredPosts.length} of ${socialPosts.length} social posts`;

  document.querySelectorAll("[data-social-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSocialPostId = selectedSocialPostId === button.dataset.socialId ? null : button.dataset.socialId;
      renderSocialTable();
    });
  });

  document.querySelectorAll("[data-close-social-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSocialPostId = null;
      renderSocialTable();
    });
  });

  document.querySelectorAll("[data-edit-social]").forEach((button) => {
    button.addEventListener("click", () => {
      const post = socialPosts.find((item) => item.id === button.dataset.editSocial);
      if (post) openSocialDialogForEdit(post);
    });
  });

  document.querySelectorAll("[data-delete-social]").forEach((button) => {
    button.addEventListener("click", () => {
      const post = socialPosts.find((item) => item.id === button.dataset.deleteSocial);
      if (post) deleteSocialPost(post);
    });
  });
}

function setupSocialControls() {
  const searchInput = document.getElementById("social-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentSocialSearch = event.target.value;
      renderSocialTable();
    });
  }

  document.querySelectorAll(".social-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentSocialFilter = button.dataset.socialFilter;
      document.querySelectorAll(".social-filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderSocialTable();
    });
  });
}

function loadLiveCustomerMessages() {
  if (unsubscribeCustomerMessages) unsubscribeCustomerMessages();
  unsubscribeCustomerMessages = firebase.firestore().collection("customerMessages").onSnapshot((snapshot) => {
    customerMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderCustomerTable();
  }, (error) => {
    console.error("Could not load customer welcome messages", error);
  });
}

function getCustomerMessage(customerId) {
  return customerMessages.find((entry) => entry.id === customerId)?.message || "";
}

async function saveCustomerMessage(customerId) {
  const textarea = document.getElementById(`welcome-message-${customerId}`);
  const statusEl = document.querySelector(`[data-welcome-message-status="${customerId}"]`);
  const button = document.querySelector(`[data-save-welcome-message="${customerId}"]`);
  if (!textarea) return;

  const message = textarea.value.trim();
  if (button) button.disabled = true;
  if (statusEl) statusEl.textContent = "Saving…";

  try {
    await firebase.firestore().collection("customerMessages").doc(customerId).set({
      message,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: auth.currentUser?.email || null
    });
    if (statusEl) statusEl.textContent = message ? "Saved — the customer will see this next time they visit their Dashboard." : "Saved — no message will be shown.";
  } catch (error) {
    console.error("Could not save welcome message", error);
    if (statusEl) statusEl.textContent = "Could not save this message. Please try again.";
  } finally {
    if (button) button.disabled = false;
  }
}

function loadLiveComingSoon() {
  if (unsubscribeComingSoon) unsubscribeComingSoon();
  unsubscribeComingSoon = firebase.firestore().collection("comingSoon").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
    comingSoonItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderComingSoonList();
  }, (error) => {
    console.error("Could not load Coming Soon items", error);
    const list = document.getElementById("coming-soon-list");
    if (list) list.innerHTML = "<li><span>Could not load Coming Soon items.</span></li>";
  });
}

function renderComingSoonList() {
  const list = document.getElementById("coming-soon-list");
  if (!list) return;

  if (!comingSoonItems.length) {
    list.innerHTML = `<li><span>Nothing posted yet — add something above to let customers know what's coming.</span></li>`;
    return;
  }

  list.innerHTML = comingSoonItems.map((item) => `
    <li>
      <div><strong>${escapeHtml(item.title)}</strong>${item.description ? `<div class="table-subtext">${escapeHtml(item.description)}</div>` : ""}</div>
      <button class="icon-button" data-delete-coming-soon="${item.id}" aria-label="Remove">×</button>
    </li>
  `).join("");

  document.querySelectorAll("[data-delete-coming-soon]").forEach((button) => {
    button.addEventListener("click", () => deleteComingSoonItem(button.dataset.deleteComingSoon));
  });
}

async function createComingSoonItem(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.getElementById("coming-soon-message");
  const formData = new FormData(form);
  const title = String(formData.get("title") || "").trim();

  if (!title) {
    if (message) message.textContent = "Enter a title first.";
    return;
  }

  try {
    await firebase.firestore().collection("comingSoon").add({
      title,
      description: String(formData.get("description") || "").trim(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser?.email || null
    });
    form.reset();
    if (message) {
      message.textContent = "Posted — customers will see this on their Dashboard.";
      setTimeout(() => { message.textContent = ""; }, 3000);
    }
  } catch (error) {
    console.error("Could not post Coming Soon item", error);
    if (message) message.textContent = "Could not post this. Please try again.";
  }
}

async function deleteComingSoonItem(id) {
  if (!confirm("Remove this Coming Soon item? Customers will no longer see it.")) return;
  try {
    await firebase.firestore().collection("comingSoon").doc(id).delete();
  } catch (error) {
    console.error("Could not delete Coming Soon item", error);
    alert("Could not remove this item. Please try again.");
  }
}

function loadLiveFeatureRequests() {
  if (unsubscribeFeatureRequests) unsubscribeFeatureRequests();
  unsubscribeFeatureRequests = firebase.firestore().collection("featureRequests").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
    featureRequests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderFeatureRequestsList();
  }, (error) => {
    console.error("Could not load customer suggestions", error);
    const list = document.getElementById("feature-requests-list");
    if (list) list.innerHTML = "<li><span>Could not load customer suggestions.</span></li>";
  });
}

function renderFeatureRequestsList() {
  const list = document.getElementById("feature-requests-list");
  if (!list) return;

  if (!featureRequests.length) {
    list.innerHTML = `<li><span>No suggestions from customers yet.</span></li>`;
    return;
  }

  list.innerHTML = featureRequests.map((item) => `
    <li>
      <div><strong>${escapeHtml(item.customerName || "A customer")}</strong><div class="table-subtext">${escapeHtml(item.message)}</div></div>
      <button class="icon-button" data-dismiss-feature-request="${item.id}" aria-label="Dismiss">×</button>
    </li>
  `).join("");

  document.querySelectorAll("[data-dismiss-feature-request]").forEach((button) => {
    button.addEventListener("click", () => dismissFeatureRequest(button.dataset.dismissFeatureRequest));
  });
}

async function dismissFeatureRequest(id) {
  if (!confirm("Dismiss this suggestion? This can't be undone.")) return;
  try {
    await firebase.firestore().collection("featureRequests").doc(id).delete();
  } catch (error) {
    console.error("Could not dismiss suggestion", error);
    alert("Could not dismiss this. Please try again.");
  }
}

function loadLiveCustomers() {
  if (unsubscribeCustomers) unsubscribeCustomers();
  const database = firebase.firestore();
  const summary = document.getElementById("customer-summary");
  if (summary) summary.textContent = "Loading customers…";

  unsubscribeCustomers = database.collection("customers").orderBy("company").onSnapshot((snapshot) => {
    customers = snapshot.docs.map(normaliseCustomer);
    syncCustomerAccessMappings(customers);
    backfillUploadQuotaField(snapshot.docs);
    selectedCustomerId = customers.some((customer) => customer.id === selectedCustomerId) ? selectedCustomerId : null;
    renderCustomerTable();
    populateProjectCustomerOptions();
    populateLibraryCustomerOptions();
    populateBulkCustomerOptions();
    populateEventCustomerOptions();
    populateLeadCustomerOptions();
    populateAllCustomerFilterSelects();
    renderLeadsTable();
    updateDashboardMetrics();
  }, (error) => {
    console.error("Could not load customers", error);
    customers = [];
    renderCustomerTable();
    if (summary) summary.textContent = "Customers could not be loaded. Check Firestore access.";
  });
}

function renderCustomerContactFields(contacts) {
  const container = document.getElementById("customer-contacts-fields");
  if (!container) return;
  const rows = contacts.length ? contacts : [{ name: "", role: "", phone: "", email: "", requiresPortalAccess: false, portalAccountCreated: false }];

  container.innerHTML = rows.map((contact, index) => `
    <div class="contact-form-row" data-contact-row="${index}">
      <button type="button" class="icon-button" data-remove-contact-row="${index}" aria-label="Remove contact">×</button>
      <label>Name<input type="text" data-contact-field="name" value="${escapeHtml(contact.name || "")}" placeholder="Contact name" /></label>
      <label>Role<input type="text" data-contact-field="role" value="${escapeHtml(contact.role || "")}" placeholder="e.g. Owner" /></label>
      <label>Phone<input type="tel" data-contact-field="phone" value="${escapeHtml(contact.phone || "")}" placeholder="Phone number" /></label>
      <label>Email<input type="email" data-contact-field="email" value="${escapeHtml(contact.email || "")}" placeholder="name@example.com" /></label>
      <label class="checkbox-label full-width"><input type="checkbox" data-contact-field="requiresPortalAccess" ${contact.requiresPortalAccess ? "checked" : ""} /> Requires portal access</label>
      ${contact.requiresPortalAccess && !contact.portalAccountCreated ? `<label class="checkbox-label full-width"><input type="checkbox" data-contact-field="inviteNow" /> Invite to portal now</label>` : ""}
    </div>
  `).join("");

  container.querySelectorAll("[data-remove-contact-row]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentContacts = collectRawContactRows();
      currentContacts.splice(Number(button.dataset.removeContactRow), 1);
      renderCustomerContactFields(currentContacts);
    });
  });

  container.querySelectorAll('[data-contact-field="requiresPortalAccess"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => renderCustomerContactFields(collectRawContactRows()));
  });
}

function collectRawContactRows() {
  return Array.from(document.querySelectorAll("#customer-contacts-fields [data-contact-row]")).map((row) => ({
    name: row.querySelector('[data-contact-field="name"]').value.trim(),
    role: row.querySelector('[data-contact-field="role"]').value.trim(),
    phone: row.querySelector('[data-contact-field="phone"]').value.trim(),
    email: row.querySelector('[data-contact-field="email"]').value.trim(),
    requiresPortalAccess: row.querySelector('[data-contact-field="requiresPortalAccess"]').checked,
    inviteNow: Boolean(row.querySelector('[data-contact-field="inviteNow"]')?.checked)
  }));
}

function collectContactsFromForm() {
  return collectRawContactRows().filter((contact) => contact.name || contact.email);
}

function addCustomerContactRow() {
  const currentContacts = collectRawContactRows();
  currentContacts.push({ name: "", role: "", phone: "", email: "", requiresPortalAccess: false });
  renderCustomerContactFields(currentContacts);
}

function resetCustomerDialogToCreateMode() {
  editingCustomerId = null;
  document.getElementById("customer-form")?.reset();
  const title = document.getElementById("customer-dialog-title");
  const saveButton = document.getElementById("save-customer-button");
  if (title) title.textContent = "New Customer";
  if (saveButton) saveButton.textContent = "Create Customer";
  renderCustomerContactFields([]);
  populateOwnerSelect("customer-owner");
}

function openCustomerDialogForEdit(customer) {
  const form = document.getElementById("customer-form");
  const dialog = document.getElementById("customer-dialog");
  const title = document.getElementById("customer-dialog-title");
  const saveButton = document.getElementById("save-customer-button");
  if (!form || !dialog) return;

  editingCustomerId = customer.id;
  form.elements.namedItem("company").value = customer.company;
  form.elements.namedItem("status").value = customer.status;
  form.elements.namedItem("tags").value = customer.tags.join(", ");
  renderCustomerContactFields(customer.contacts);
  form.elements.namedItem("notes").value = customer.notes === "No notes added." ? "" : customer.notes;
  form.elements.namedItem("customerMemory").value = customer.customerMemory || "";
  form.elements.namedItem("website").value = customer.website || "";
  form.elements.namedItem("phone").value = customer.phone || "";
  form.elements.namedItem("industry").value = customer.industry || "";
  form.elements.namedItem("companySize").value = customer.companySize || "";
  form.elements.namedItem("address").value = customer.address || "";
  form.elements.namedItem("internalPreview").checked = Boolean(customer.internalPreview);
  populateOwnerSelect("customer-owner", customer.owner);
  if (title) title.textContent = "Edit Customer";
  if (saveButton) saveButton.textContent = "Save Changes";
  dialog.showModal();
}

async function createCustomer(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const saveButton = document.getElementById("save-customer-button");
  const message = document.getElementById("customer-form-message");
  const formData = new FormData(form);
  const company = String(formData.get("company") || "").trim();
  if (!company) return;

  if (!editingCustomerId && !confirmIfSimilarNameExists(company, getKnownProspectNames(), "this customer")) return;

  saveButton.disabled = true;
  message.textContent = editingCustomerId ? "Saving changes…" : "Saving customer…";
  try {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const existingCustomer = editingCustomerId ? customers.find((item) => item.id === editingCustomerId) : null;
    const formContacts = collectContactsFromForm();
    const inviteIndexes = [];
    const contacts = formContacts.map((formContact, index) => {
      const existingContact = existingCustomer?.contacts.find((entry) => entry.email && entry.email.toLowerCase() === formContact.email.toLowerCase());
      if (formContact.inviteNow && formContact.email) inviteIndexes.push(index);
      return {
        name: formContact.name,
        role: formContact.role,
        phone: formContact.phone,
        email: formContact.email,
        requiresPortalAccess: formContact.requiresPortalAccess,
        portalAccountCreated: existingContact ? existingContact.portalAccountCreated : false,
        portalInviteSentAt: existingContact ? (existingContact.portalInviteSentAtRaw || null) : null
      };
    });
    const tags = String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .filter((tag, index, all) => all.indexOf(tag) === index);

    const record = {
      company,
      status: formData.get("status") || "Trial",
      contacts,
      tags,
      notes: String(formData.get("notes") || "").trim(),
      customerMemory: String(formData.get("customerMemory") || "").trim(),
      website: normaliseWebsiteUrl(formData.get("website")),
      phone: String(formData.get("phone") || "").trim(),
      industry: formData.get("industry") || "",
      companySize: formData.get("companySize") || "",
      address: String(formData.get("address") || "").trim(),
      owner: String(formData.get("owner") || "").trim() || getCurrentAdminName(),
      internalPreview: formData.get("internalPreview") === "on",
      updatedAt: now
    };

    let customerId = editingCustomerId;
    if (editingCustomerId) {
      await firebase.firestore().collection("customers").doc(editingCustomerId).set(record, { merge: true });
      message.textContent = "Changes saved.";
      logAuditEvent("updated", "customer", company);
    } else {
      const customerRef = await firebase.firestore().collection("customers").add({
        ...record,
        projects: 0,
        users: 0,
        uploadStorageUsedBytes: 0,
        createdAt: now
      });
      customerId = customerRef.id;
      message.textContent = "Customer created.";
      logAuditEvent("created", "customer", company);
    }

    for (const index of inviteIndexes) {
      await sendPortalInvite({ id: customerId, contacts }, index);
    }

    setTimeout(() => {
      document.getElementById("customer-dialog")?.close();
      resetCustomerDialogToCreateMode();
      message.textContent = "";
    }, 500);
  } catch (error) {
    console.error("Could not save customer", error);
    message.textContent = "Customer could not be saved. Please try again.";
  } finally {
    saveButton.disabled = false;
  }
}

async function setCustomerStatus(customer, status) {
  try {
    await firebase.firestore().collection("customers").doc(customer.id).set({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    logAuditEvent(status === "Archived" ? "archived" : "reactivated", "customer", customer.company);
  } catch (error) {
    console.error("Could not update customer status", error);
    alert("This customer's status could not be updated. Please try again.");
  }
}

function generateCommentId() {
  return `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function addCustomerComment(customerId, text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const customer = customers.find((item) => item.id === customerId);
  if (!customer) return;
  const author = getCurrentAdminName();
  const newEntry = {
    id: generateCommentId(),
    text: trimmed,
    author,
    createdAt: firebase.firestore.Timestamp.now(),
    updatedAt: null
  };
  const rawHistory = customer.relationshipHistory.map((entry) => ({
    id: entry.id, text: entry.text, author: entry.author, createdAt: entry.createdAt, updatedAt: entry.updatedAt
  }));
  const updatedHistory = [...rawHistory, newEntry];
  try {
    await firebase.firestore().collection("customers").doc(customerId).set({
      relationshipHistory: updatedHistory,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    logAuditEvent("commented", "customer", customer.company);
  } catch (error) {
    console.error("Could not add comment", error);
    alert("Could not add this comment. Please try again.");
  }
}

async function saveCustomerCommentEdit(customerId, commentId, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return;
  const customer = customers.find((item) => item.id === customerId);
  if (!customer) return;
  const updatedHistory = customer.relationshipHistory.map((entry) => entry.id === commentId
    ? { id: entry.id, text: trimmed, author: entry.author, createdAt: entry.createdAt, updatedAt: firebase.firestore.Timestamp.now() }
    : { id: entry.id, text: entry.text, author: entry.author, createdAt: entry.createdAt, updatedAt: entry.updatedAt });
  try {
    await firebase.firestore().collection("customers").doc(customerId).set({
      relationshipHistory: updatedHistory,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    editingRelationshipCommentId = null;
    logAuditEvent("updated", "customer", `${customer.company} (comment)`);
  } catch (error) {
    console.error("Could not save comment edit", error);
    alert("Could not save this edit. Please try again.");
  }
}

async function deleteCustomer(customer) {
  const linkedProjects = projects.filter((project) => project.customerId === customer.id).length;
  if (linkedProjects > 0) {
    alert(`"${customer.company}" still has ${linkedProjects} project${linkedProjects === 1 ? "" : "s"} linked. Delete those first (Projects page), then delete the customer.`);
    return;
  }

  const linkedLeads = leads.filter((lead) => lead.customerId === customer.id);
  const linkedOpportunities = opportunities.filter((opportunity) => opportunity.customerId === customer.id);
  const linkedEvents = events.filter((evt) => evt.customerId === customer.id);
  const linkedLibraryItems = libraryItems.filter((item) => item.customerIds.includes(customer.id));

  const cascadeParts = [];
  if (linkedLeads.length) cascadeParts.push(`${linkedLeads.length} lead${linkedLeads.length === 1 ? "" : "s"}`);
  if (linkedOpportunities.length) cascadeParts.push(`${linkedOpportunities.length} opportunit${linkedOpportunities.length === 1 ? "y" : "ies"}`);
  if (linkedEvents.length) cascadeParts.push(`${linkedEvents.length} event${linkedEvents.length === 1 ? "" : "s"}`);
  const cascadeSummary = cascadeParts.length
    ? `\n\nThis will also delete all Customer Information tied to them: ${cascadeParts.join(", ")}.`
    : "";

  if (!confirm(`Permanently delete "${customer.company}"? This cannot be undone.${cascadeSummary}\n\nNote: if they have a Portal login, it stays active in Firebase Authentication — this only removes their Console/Portal data, not their sign-in.`)) return;

  try {
    const database = firebase.firestore();
    const batch = database.batch();
    batch.delete(database.collection("customers").doc(customer.id));
    batch.delete(database.collection("customerMessages").doc(customer.id));
    customer.contacts.forEach((contact) => {
      if (contact.email) {
        batch.delete(database.collection("customerAccess").doc(contact.email.trim().toLowerCase()));
      }
    });
    linkedLeads.forEach((lead) => batch.delete(database.collection("leads").doc(lead.id)));
    linkedOpportunities.forEach((opportunity) => batch.delete(database.collection("opportunities").doc(opportunity.id)));
    linkedEvents.forEach((evt) => batch.delete(database.collection("events").doc(evt.id)));
    linkedLibraryItems.forEach((item) => {
      const remainingCustomerIds = item.customerIds.filter((id) => id !== customer.id);
      batch.update(database.collection("library").doc(item.id), { customerIds: remainingCustomerIds });
    });
    await batch.commit();
    if (selectedCustomerId === customer.id) selectedCustomerId = null;
    logAuditEvent("deleted", "customer", customer.company);
  } catch (error) {
    console.error("Could not delete customer", error);
    alert("This customer could not be deleted. Please try again.");
  }
}


function normaliseProject(documentSnapshot) {
  const data = documentSnapshot.data() || {};
  return {
    id: documentSnapshot.id,
    name: data.name || "Unnamed project",
    customerId: data.customerId || "",
    customer: data.customerName || "Unassigned customer",
    status: data.status || "Planning",
    type: data.type || "Consulting",
    resources: Number(data.resources || 0),
    owner: data.owner || "Paul O’Brien",
    created: formatFirestoreDate(data.createdAt),
    lastUpdated: formatFirestoreDate(data.updatedAt || data.createdAt),
    description: data.description || "No description added.",
    budgetHours: data.budgetHours === undefined || data.budgetHours === null ? null : Number(data.budgetHours),
    actionItems: Array.isArray(data.actionItems) ? data.actionItems.map((item) => ({ id: item.id || generateActionItemId(), text: item.text || "", done: Boolean(item.done), assignee: item.assignee || "" })) : []
  };
}

function populateProjectCustomerOptions() {
  const select = document.getElementById("project-customer");
  if (!select) return;
  const selected = select.value;
  select.innerHTML = '<option value="">Select a customer</option>' + customers
    .map((customer) => `<option value="${escapeHtml(customer.id)}">${escapeHtml(customer.company)}</option>`)
    .join("");
  if (customers.some((customer) => customer.id === selected)) select.value = selected;
}

function loadLiveProjects() {
  if (unsubscribeProjects) unsubscribeProjects();
  const summary = document.getElementById("project-summary");
  if (summary) summary.textContent = "Loading projects…";

  unsubscribeProjects = firebase.firestore().collection("projects").orderBy("name").onSnapshot((snapshot) => {
    projects = snapshot.docs.map(normaliseProject);
    selectedProjectId = projects.some((project) => project.id === selectedProjectId) ? selectedProjectId : null;
    renderProjectTable();
    renderEventTable();
    renderLeadsTable();
    updateDashboardMetrics();
  }, (error) => {
    console.error("Could not load projects", error);
    projects = [];
    renderProjectTable();
    renderEventTable();
    if (summary) summary.textContent = "Projects could not be loaded. Check Firestore access.";
  });
}

function loadLiveTimeSessions() {
  if (unsubscribeTimeSessions) unsubscribeTimeSessions();

  unsubscribeTimeSessions = firebase.firestore().collection("timeSessions").onSnapshot((snapshot) => {
    timeSessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderProjectTable();
  }, (error) => {
    console.error("Could not load time sessions", error);
    timeSessions = [];
  });
}

function loadTimeTrackerSettings() {
  if (unsubscribeTimeTrackerSettings) unsubscribeTimeTrackerSettings();

  unsubscribeTimeTrackerSettings = firebase.firestore().collection("settings").doc("timeTracker").onSnapshot((doc) => {
    hoursPerDay = Number((doc.data() || {}).hoursPerDay) || 8;
    const input = document.getElementById("hours-per-day-input");
    if (input && document.activeElement !== input) input.value = hoursPerDay;
    renderProjectTable();
  }, (error) => {
    console.error("Could not load Time Tracker settings", error);
  });
}

async function saveTimeTrackerSettings(event) {
  event.preventDefault();
  const input = document.getElementById("hours-per-day-input");
  const message = document.getElementById("time-tracker-settings-message");
  const value = Number(input.value);

  if (!value || value <= 0) {
    message.textContent = "Enter a value greater than 0.";
    return;
  }

  message.textContent = "Saving…";
  try {
    await firebase.firestore().collection("settings").doc("timeTracker").set({
      hoursPerDay: value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    message.textContent = "Saved.";
    setTimeout(() => { message.textContent = ""; }, 2000);
  } catch (error) {
    console.error("Could not save Time Tracker settings", error);
    message.textContent = "Could not save. Please try again.";
  }
}

function getProjectHoursUsed(projectId) {
  const legacyHours = timeSessions
    .filter((session) => session.projectId === projectId)
    .reduce((total, session) => total + (Number(session.hours) || 0), 0);
  const eventHours = events
    .filter((evt) => evt.projectId === projectId && evt.status === "Logged")
    .reduce((total, evt) => total + (Number(evt.duration) || 0), 0);
  return legacyHours + eventHours;
}

function formatHoursAndDays(hours) {
  const days = hours / (hoursPerDay || 8);
  return `${hours.toFixed(2)}h (${days.toFixed(2)}d)`;
}

function getProjectTimeSummary(project) {
  const used = getProjectHoursUsed(project.id);
  if (project.budgetHours === null) {
    return { used, budget: null, remaining: null };
  }
  return { used, budget: project.budgetHours, remaining: project.budgetHours - used };
}

function getProjectTimeCellMarkup(project) {
  const summary = getProjectTimeSummary(project);
  if (summary.budget === null) {
    return `<span class="table-subtext">${formatHoursAndDays(summary.used)} logged</span><span class="table-subtext">No budget set</span>`;
  }
  const overBudget = summary.remaining < 0;
  const remainingLabel = overBudget
    ? `${formatHoursAndDays(Math.abs(summary.remaining))} over budget`
    : `${formatHoursAndDays(summary.remaining)} remaining`;
  return `
    <span class="table-subtext">${formatHoursAndDays(summary.used)} of ${formatHoursAndDays(summary.budget)}</span>
    <span class="table-subtext ${overBudget ? "over-budget-text" : ""}">${remainingLabel}</span>
  `;
}

function resetProjectDialogToCreateMode() {
  editingProjectId = null;
  document.getElementById("project-form")?.reset();
  const title = document.getElementById("project-dialog-title");
  const saveButton = document.getElementById("save-project-button");
  const customerSelect = document.getElementById("project-customer");
  if (title) title.textContent = "New Project";
  if (saveButton) saveButton.textContent = "Create Project";
  if (customerSelect) customerSelect.disabled = false;
}

function openProjectDialogForEdit(project) {
  const form = document.getElementById("project-form");
  const dialog = document.getElementById("project-dialog");
  const title = document.getElementById("project-dialog-title");
  const saveButton = document.getElementById("save-project-button");
  const customerSelect = document.getElementById("project-customer");
  if (!form || !dialog) return;

  editingProjectId = project.id;
  form.elements.namedItem("name").value = project.name;
  form.elements.namedItem("status").value = project.status;
  form.elements.namedItem("type").value = project.type;
  form.elements.namedItem("budgetHours").value = project.budgetHours === null ? "" : project.budgetHours;
  form.elements.namedItem("description").value = project.description === "No description added." ? "" : project.description;
  if (customerSelect) {
    customerSelect.value = project.customerId;
    customerSelect.disabled = true;
  }
  if (title) title.textContent = "Edit Project";
  if (saveButton) saveButton.textContent = "Save Changes";
  dialog.showModal();
}

async function createProject(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const saveButton = document.getElementById("save-project-button");
  const message = document.getElementById("project-form-message");
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    message.textContent = "Enter a project name.";
    return;
  }

  const budgetHoursRaw = String(formData.get("budgetHours") || "").trim();
  const budgetHours = budgetHoursRaw === "" ? null : Number(budgetHoursRaw);
  if (budgetHours !== null && (Number.isNaN(budgetHours) || budgetHours < 0)) {
    message.textContent = "Enter a valid budgeted hours value, or leave it blank.";
    return;
  }

  saveButton.disabled = true;

  try {
    const database = firebase.firestore();
    const now = firebase.firestore.FieldValue.serverTimestamp();

    if (editingProjectId) {
      message.textContent = "Saving changes…";
      await database.collection("projects").doc(editingProjectId).set({
        name,
        status: formData.get("status") || "Planning",
        type: formData.get("type") || "Consulting",
        budgetHours,
        description: String(formData.get("description") || "").trim(),
        updatedAt: now
      }, { merge: true });
      message.textContent = "Changes saved.";
      logAuditEvent("updated", "project", name);
    } else {
      const customerId = String(formData.get("customerId") || "").trim();
      const customer = customers.find((item) => item.id === customerId);
      if (!customer) {
        message.textContent = "Enter a project name and select a customer.";
        saveButton.disabled = false;
        return;
      }

      message.textContent = "Saving project…";
      const projectRef = database.collection("projects").doc();
      const customerRef = database.collection("customers").doc(customerId);

      await database.runTransaction(async (transaction) => {
        const customerSnapshot = await transaction.get(customerRef);
        if (!customerSnapshot.exists) throw new Error("Customer no longer exists");
        const currentProjects = Number(customerSnapshot.data().projects || 0);
        transaction.set(projectRef, {
          name,
          customerId,
          customerName: customer.company,
          status: formData.get("status") || "Planning",
          type: formData.get("type") || "Consulting",
          budgetHours,
          description: String(formData.get("description") || "").trim(),
          owner: getCurrentAdminName(),
          resources: 0,
          createdAt: now,
          updatedAt: now
        });
        transaction.update(customerRef, { projects: currentProjects + 1, updatedAt: now });
      });
      message.textContent = "Project created.";
      logAuditEvent("created", "project", name);
    }

    form.reset();
    setTimeout(() => {
      document.getElementById("project-dialog")?.close();
      resetProjectDialogToCreateMode();
      message.textContent = "";
    }, 500);
  } catch (error) {
    console.error("Could not save project", error);
    message.textContent = "Project could not be saved. Please try again.";
  } finally {
    saveButton.disabled = false;
  }
}

async function setProjectStatus(project, status) {
  try {
    await firebase.firestore().collection("projects").doc(project.id).set({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Could not update project status", error);
    alert("This project's status could not be updated. Please try again.");
  }
}

async function deleteProject(project) {
  const linkedSessions = timeSessions.filter((session) => session.projectId === project.id).length;
  const linkedEvents = events.filter((evt) => evt.projectId === project.id).length;
  if (linkedSessions > 0 || linkedEvents > 0) {
    const parts = [];
    if (linkedSessions > 0) parts.push(`${linkedSessions} logged time session${linkedSessions === 1 ? "" : "s"}`);
    if (linkedEvents > 0) parts.push(`${linkedEvents} event${linkedEvents === 1 ? "" : "s"}`);
    alert(`"${project.name}" still has ${parts.join(" and ")}. Delete or unlink those first (Events page), then delete the project.`);
    return;
  }

  if (!confirm(`Permanently delete "${project.name}"? This cannot be undone.`)) return;

  try {
    const database = firebase.firestore();
    const projectRef = database.collection("projects").doc(project.id);
    const customerRef = database.collection("customers").doc(project.customerId);

    await database.runTransaction(async (transaction) => {
      const customerSnapshot = await transaction.get(customerRef);
      transaction.delete(projectRef);
      if (customerSnapshot.exists) {
        const currentProjects = Number(customerSnapshot.data().projects || 0);
        transaction.update(customerRef, { projects: Math.max(0, currentProjects - 1), updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      }
    });

    if (selectedProjectId === project.id) selectedProjectId = null;
    logAuditEvent("deleted", "project", project.name);
  } catch (error) {
    console.error("Could not delete project", error);
    alert("This project could not be deleted. Please try again.");
  }
}


function normaliseLibraryItem(documentSnapshot) {
  const data = documentSnapshot.data() || {};
  return {
    id: documentSnapshot.id,
    title: data.title || data.name || "Untitled library item",
    description: data.description || "No description added.",
    source: data.source || "Barely Artificial",
    visibility: data.visibility || "Internal",
    customerIds: Array.isArray(data.customerIds) ? data.customerIds : (data.customerId ? [data.customerId] : []),
    customerNames: Array.isArray(data.customerNames) ? data.customerNames : (data.customerName ? [data.customerName] : []),
    category: data.category || data.type || "Document",
    version: data.version || "1.0",
    collection: data.collection || "",
    status: data.status || "Draft",
    itemType: data.itemType || (data.externalUrl ? "Link" : "File"),
    owner: data.owner || "Paul O’Brien",
    lastUpdated: formatFirestoreDate(data.updatedAt || data.createdAt),
    fileName: data.fileName || "",
    filePath: data.filePath || "",
    downloadUrl: data.downloadUrl || "",
    externalUrl: data.externalUrl || "",
    size: Number(data.size || 0),
    contentType: data.contentType || "",
    uploadedByCustomerId: data.uploadedByCustomerId || ""
  };
}

function populateLibraryCustomerOptions() {
  const container = document.getElementById("library-customers");
  if (!container) return;
  container.innerHTML = customers.length
    ? customers.map((customer) => `
      <label class="checkbox-option">
        <input type="checkbox" name="customerIds" value="${escapeHtml(customer.id)}">
        <span>${escapeHtml(customer.company)}</span>
      </label>`).join("")
    : '<p class="muted">Create a customer before assigning selected-customer access.</p>';
  updateLibraryVisibilityMode();
}

function updateLibraryVisibilityMode() {
  const visibility = document.getElementById("library-visibility");
  const customerGroup = document.getElementById("library-customer-group");
  if (!visibility || !customerGroup) return;
  customerGroup.hidden = visibility.value !== "Selected Customers";
  customerGroup.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.disabled = customerGroup.hidden;
  });
}

function updateCollectionOptions() {
  const datalist = document.getElementById("collection-options");
  if (!datalist) return;
  const names = [...new Set(libraryItems.map((item) => item.collection).filter(Boolean))].sort();
  datalist.innerHTML = names.map((name) => `<option value="${escapeHtml(name)}"></option>`).join("");
}

function updateLibraryInputMode() {
  const itemType = document.getElementById("library-item-type");
  const fileGroup = document.getElementById("library-file-group");
  const linkGroup = document.getElementById("library-link-group");
  const fileInput = document.getElementById("library-file");
  const linkInput = document.getElementById("library-link");
  if (!itemType || !fileGroup || !linkGroup || !fileInput || !linkInput) return;
  const isLink = itemType.value === "Link";
  fileGroup.hidden = isLink;
  linkGroup.hidden = !isLink;
  fileInput.required = !isLink;
  linkInput.required = isLink;
}

function loadLiveLibrary() {
  if (unsubscribeLibrary) unsubscribeLibrary();
  const summary = document.getElementById("library-summary");
  if (summary) summary.textContent = "Loading library…";

  unsubscribeLibrary = firebase.firestore().collection("library").orderBy("title").onSnapshot((snapshot) => {
    libraryItems = snapshot.docs.map(normaliseLibraryItem);
    selectedLibraryItemId = libraryItems.some((item) => item.id === selectedLibraryItemId) ? selectedLibraryItemId : null;
    renderLibraryTable();
    updateCollectionOptions();
    updateDashboardMetrics();
  }, (error) => {
    console.error("Could not load library", error);
    libraryItems = [];
    renderLibraryTable();
    if (summary) summary.textContent = "Library could not be loaded. Check Firestore access.";
  });
}

function safeStorageName(fileName) {
  const clean = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
  return `${Date.now()}-${clean || "library-file"}`;
}

function validateLibraryFile(file) {
  const maxBytes = 50 * 1024 * 1024;
  const allowedExtensions = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "png", "jpg", "jpeg", "webp", "txt", "zip"];
  const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
  if (file.size > maxBytes) return "Files must be 50 MB or smaller.";
  if (!allowedExtensions.includes(extension)) return "That file type is not supported yet.";
  return "";
}

function populateBulkCustomerOptions() {
  const container = document.getElementById("bulk-customers");
  if (!container) return;
  container.innerHTML = customers.length
    ? customers.map((customer) => `
      <label class="checkbox-option">
        <input type="checkbox" name="customerIds" value="${escapeHtml(customer.id)}">
        <span>${escapeHtml(customer.company)}</span>
      </label>`).join("")
    : '<p class="muted">Create a customer before assigning selected-customer access.</p>';
  updateBulkVisibilityMode();
}

function updateBulkVisibilityMode() {
  const visibility = document.getElementById("bulk-visibility");
  const customerGroup = document.getElementById("bulk-customer-group");
  if (!visibility || !customerGroup) return;
  customerGroup.hidden = visibility.value !== "Selected Customers";
  customerGroup.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.disabled = customerGroup.hidden;
  });
}

function titleFromFileName(fileName) {
  const withoutExtension = fileName.includes(".") ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName;
  return withoutExtension.replace(/[_-]+/g, " ").trim() || fileName;
}

function updateBulkFileList() {
  const fileInput = document.getElementById("bulk-files");
  const fileList = document.getElementById("bulk-file-list");
  if (!fileInput || !fileList) return;
  const files = Array.from(fileInput.files || []);
  fileList.textContent = files.length
    ? `${files.length} file${files.length === 1 ? "" : "s"} selected: ${files.map((file) => file.name).join(", ")}`
    : "";
}

function resetBulkUploadDialog() {
  document.getElementById("bulk-upload-form")?.reset();
  const message = document.getElementById("bulk-upload-message");
  const progress = document.getElementById("bulk-upload-progress");
  if (message) message.textContent = "";
  if (progress) { progress.hidden = true; progress.value = 0; }
  updateBulkFileList();
  updateBulkVisibilityMode();
}

async function createBulkLibraryItems(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const saveButton = document.getElementById("save-bulk-upload-button");
  const message = document.getElementById("bulk-upload-message");
  const progress = document.getElementById("bulk-upload-progress");
  const formData = new FormData(form);
  const fileInput = document.getElementById("bulk-files");
  const files = Array.from(fileInput?.files || []);
  const visibility = String(formData.get("visibility") || "Internal");
  const customerIds = formData.getAll("customerIds").map(String);
  const selectedCustomers = customers.filter((customer) => customerIds.includes(customer.id));

  if (!files.length) {
    message.textContent = "Choose at least one file.";
    return;
  }
  if (visibility === "Selected Customers" && customerIds.length === 0) {
    message.textContent = "Select at least one customer, or choose a different visibility option.";
    return;
  }

  const sharedFields = {
    description: "",
    source: formData.get("source") || "Barely Artificial",
    visibility,
    customerIds: visibility === "Selected Customers" ? customerIds : [],
    customerNames: visibility === "Selected Customers" ? selectedCustomers.map((customer) => customer.company) : [],
    category: formData.get("category") || "Document",
    version: String(formData.get("version") || "1.0").trim() || "1.0",
    collection: String(formData.get("collection") || "").trim(),
    status: formData.get("status") || "Draft"
  };

  saveButton.disabled = true;
  progress.hidden = false;
  progress.value = 0;

  const succeeded = [];
  const failed = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    message.textContent = `Uploading ${index + 1} of ${files.length}: ${file.name}`;
    const validationMessage = validateLibraryFile(file);
    if (validationMessage) {
      failed.push(`${file.name} (${validationMessage})`);
      progress.value = Math.round(((index + 1) / files.length) * 100);
      continue;
    }

    let uploadedRef = null;
    try {
      const libraryId = firebase.firestore().collection("library").doc().id;
      const filePath = `library/${libraryId}/${safeStorageName(file.name)}`;
      uploadedRef = firebase.storage().ref(filePath);
      await new Promise((resolve, reject) => {
        const uploadTask = uploadedRef.put(file, { contentType: file.type || "application/octet-stream" });
        uploadTask.on("state_changed", () => {}, reject, resolve);
      });
      const downloadUrl = await uploadedRef.getDownloadURL();
      const now = firebase.firestore.FieldValue.serverTimestamp();
      await firebase.firestore().collection("library").doc(libraryId).set({
        title: titleFromFileName(file.name),
        ...sharedFields,
        itemType: "File",
        owner: getCurrentAdminName(),
        fileName: file.name,
        filePath,
        downloadUrl,
        externalUrl: "",
        size: file.size,
        contentType: file.type || "application/octet-stream",
        createdAt: now,
        updatedAt: now
      });
      succeeded.push(file.name);
    } catch (error) {
      console.error("Could not upload file", file.name, error);
      if (uploadedRef) {
        try { await uploadedRef.delete(); } catch (cleanupError) { console.warn("Could not remove incomplete upload", cleanupError); }
      }
      failed.push(`${file.name} (upload failed)`);
    }

    progress.value = Math.round(((index + 1) / files.length) * 100);
  }

  saveButton.disabled = false;

  if (failed.length === 0) {
    message.textContent = `${succeeded.length} file${succeeded.length === 1 ? "" : "s"} uploaded.`;
    setTimeout(() => {
      document.getElementById("bulk-upload-dialog")?.close();
      resetBulkUploadDialog();
    }, 800);
  } else {
    message.textContent = `${succeeded.length} uploaded, ${failed.length} failed: ${failed.join(", ")}`;
  }
}

function resetLibraryDialogToCreateMode() {
  editingLibraryItemId = null;
  document.getElementById("library-form")?.reset();
  const title = document.getElementById("library-dialog-title");
  const saveButton = document.getElementById("save-library-button");
  const itemType = document.getElementById("library-item-type");
  const note = document.getElementById("library-current-file-note");
  if (title) title.textContent = "New Library Item";
  if (saveButton) saveButton.textContent = "Create Library Item";
  if (itemType) itemType.disabled = false;
  if (note) note.hidden = true;
  document.getElementById("library-form")?.elements.namedItem("category")
    ?.querySelectorAll("option[data-legacy-option]").forEach((option) => option.remove());
  updateLibraryVisibilityMode();
  updateLibraryInputMode();
}

function openLibraryDialogForEdit(item) {
  const form = document.getElementById("library-form");
  const dialog = document.getElementById("library-dialog");
  const title = document.getElementById("library-dialog-title");
  const saveButton = document.getElementById("save-library-button");
  const itemType = document.getElementById("library-item-type");
  const fileGroup = document.getElementById("library-file-group");
  const linkGroup = document.getElementById("library-link-group");
  const note = document.getElementById("library-current-file-note");
  if (!form || !dialog) return;

  editingLibraryItemId = item.id;
  form.elements.namedItem("title").value = item.title;
  const categorySelect = form.elements.namedItem("category");
  categorySelect.querySelectorAll("option[data-legacy-option]").forEach((option) => option.remove());
  categorySelect.value = item.category;
  if (categorySelect.value !== item.category) {
    // Preserve an older category value (e.g. "Link", retired in v0.2.6h) that's no longer offered as a new choice.
    const legacyOption = document.createElement("option");
    legacyOption.value = item.category;
    legacyOption.textContent = `${item.category} (retired category)`;
    legacyOption.dataset.legacyOption = "true";
    categorySelect.appendChild(legacyOption);
    categorySelect.value = item.category;
  }
  form.elements.namedItem("source").value = item.source;
  form.elements.namedItem("itemType").value = item.itemType;
  form.elements.namedItem("visibility").value = item.visibility;
  form.elements.namedItem("status").value = item.status;
  form.elements.namedItem("version").value = item.version;
  form.elements.namedItem("collection").value = item.collection || "";
  form.elements.namedItem("description").value = item.description === "No description added." ? "" : item.description;

  updateLibraryVisibilityMode();
  form.querySelectorAll('input[name="customerIds"]').forEach((checkbox) => {
    checkbox.checked = item.customerIds.includes(checkbox.value);
  });

  // The uploaded file or link cannot be changed here — delete and re-create to replace it.
  if (itemType) itemType.disabled = true;
  if (fileGroup) fileGroup.hidden = true;
  if (linkGroup) linkGroup.hidden = true;
  const fileInput = document.getElementById("library-file");
  const linkInput = document.getElementById("library-link");
  if (fileInput) fileInput.required = false;
  if (linkInput) linkInput.required = false;
  if (note) {
    note.hidden = false;
    note.textContent = item.itemType === "Link"
      ? `Current link: ${item.externalUrl}. Delete and re-create this item to change it.`
      : `Current file: ${item.fileName || "uploaded file"}. Delete and re-create this item to replace it.`;
  }

  if (title) title.textContent = "Edit Library Item";
  if (saveButton) saveButton.textContent = "Save Changes";
  dialog.showModal();
}

async function createLibraryItem(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const saveButton = document.getElementById("save-library-button");
  const message = document.getElementById("library-form-message");
  const progress = document.getElementById("library-upload-progress");
  const formData = new FormData(form);
  const title = String(formData.get("title") || "").trim();
  const visibility = String(formData.get("visibility") || "Internal");
  const customerIds = formData.getAll("customerIds").map(String);
  const selectedCustomers = customers.filter((customer) => customerIds.includes(customer.id));

  if (!title) {
    message.textContent = "Enter a title.";
    return;
  }
  if (visibility === "Selected Customers" && customerIds.length === 0) {
    message.textContent = "Select at least one customer, or choose a different visibility option.";
    return;
  }

  const sharedFields = {
    title,
    description: String(formData.get("description") || "").trim(),
    source: formData.get("source") || "Barely Artificial",
    visibility,
    customerIds: visibility === "Selected Customers" ? customerIds : [],
    customerNames: visibility === "Selected Customers" ? selectedCustomers.map((customer) => customer.company) : [],
    category: formData.get("category") || "Document",
    version: String(formData.get("version") || "1.0").trim() || "1.0",
    collection: String(formData.get("collection") || "").trim(),
    status: formData.get("status") || "Draft"
  };

  if (editingLibraryItemId) {
    saveButton.disabled = true;
    message.textContent = "Saving changes…";
    try {
      await firebase.firestore().collection("library").doc(editingLibraryItemId).set({
        ...sharedFields,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      message.textContent = "Changes saved.";
      setTimeout(() => {
        document.getElementById("library-dialog")?.close();
        resetLibraryDialogToCreateMode();
        message.textContent = "";
      }, 500);
    } catch (error) {
      console.error("Could not save library item", error);
      message.textContent = "Library item could not be saved. Please try again.";
    } finally {
      saveButton.disabled = false;
    }
    return;
  }

  const itemType = String(formData.get("itemType") || "File");
  const file = formData.get("file");
  const externalUrl = String(formData.get("externalUrl") || "").trim();
  if (itemType === "Link") {
    try { new URL(externalUrl); } catch { message.textContent = "Enter a complete website address, including https://"; return; }
  } else {
    if (!(file instanceof File) || !file.name) { message.textContent = "Choose a file to upload."; return; }
    const validationMessage = validateLibraryFile(file);
    if (validationMessage) { message.textContent = validationMessage; return; }
  }

  saveButton.disabled = true;
  message.textContent = itemType === "Link" ? "Saving library item…" : "Preparing upload…";
  progress.hidden = itemType === "Link";
  progress.value = 0;
  let uploadedRef = null;

  try {
    let fileDetails = { fileName: "", filePath: "", downloadUrl: "", size: 0, contentType: "", externalUrl };
    const libraryId = firebase.firestore().collection("library").doc().id;

    if (itemType === "File") {
      const filePath = `library/${libraryId}/${safeStorageName(file.name)}`;
      uploadedRef = firebase.storage().ref(filePath);
      const uploadTask = uploadedRef.put(file, { contentType: file.type || "application/octet-stream" });
      await new Promise((resolve, reject) => {
        uploadTask.on("state_changed", (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          progress.value = percent;
          message.textContent = `Uploading… ${percent}%`;
        }, reject, resolve);
      });
      const downloadUrl = await uploadedRef.getDownloadURL();
      fileDetails = { fileName: file.name, filePath, downloadUrl, size: file.size, contentType: file.type || "application/octet-stream", externalUrl: "" };
    }

    const now = firebase.firestore.FieldValue.serverTimestamp();
    await firebase.firestore().collection("library").doc(libraryId).set({
      ...sharedFields,
      itemType,
      owner: getCurrentAdminName(),
      ...fileDetails,
      createdAt: now,
      updatedAt: now
    });

    form.reset();
    updateLibraryVisibilityMode();
    updateLibraryInputMode();
    message.textContent = "Library item created.";
    progress.hidden = true;
    setTimeout(() => {
      document.getElementById("library-dialog")?.close();
      message.textContent = "";
    }, 600);
  } catch (error) {
    console.error("Could not create library item", error);
    if (uploadedRef) {
      try { await uploadedRef.delete(); } catch (cleanupError) { console.warn("Could not remove incomplete upload", cleanupError); }
    }
    message.textContent = "Library item could not be saved. Please try again.";
  } finally {
    saveButton.disabled = false;
    progress.hidden = true;
  }
}

async function setLibraryStatus(item, status) {
  try {
    await firebase.firestore().collection("library").doc(item.id).set({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Could not update library item status", error);
    alert("This item's status could not be updated. Please try again.");
  }
}

async function deleteLibraryItem(item) {
  const warning = item.itemType === "File"
    ? `Delete "${item.title}" permanently? This removes the uploaded file and cannot be undone.`
    : `Delete "${item.title}" permanently? This cannot be undone.`;
  if (!confirm(warning)) return;

  try {
    if (item.itemType === "File" && item.filePath) {
      try { await firebase.storage().ref(item.filePath).delete(); }
      catch (error) { if (error.code !== "storage/object-not-found") throw error; }
    }

    const database = firebase.firestore();
    if (item.source === "Customer" && item.uploadedByCustomerId && item.size) {
      const customerRef = database.collection("customers").doc(item.uploadedByCustomerId);
      try {
        await database.runTransaction(async (transaction) => {
          const customerSnapshot = await transaction.get(customerRef);
          if (!customerSnapshot.exists) return;
          const current = Number(customerSnapshot.data().uploadStorageUsedBytes || 0);
          transaction.update(customerRef, { uploadStorageUsedBytes: Math.max(0, current - item.size) });
        });
      } catch (error) {
        console.warn("Could not refund customer upload quota", error);
      }
    }

    await database.collection("library").doc(item.id).delete();
    if (selectedLibraryItemId === item.id) selectedLibraryItemId = null;
  } catch (error) {
    console.error("Could not delete library item", error);
    alert("This item could not be deleted. Please try again.");
  }
}

let currentCustomerTagFilter = "";

function getFilteredCustomers() {
  return customers.filter((customer) => {
    const matchesFilter = currentCustomerFilter === "all" || customer.status === currentCustomerFilter;
    const matchesTag = !currentCustomerTagFilter || customer.tags.includes(currentCustomerTagFilter);
    const matchesMine = !currentCustomerMineOnly || customer.owner === getCurrentAdminName();
    const searchTarget = `${customer.company} ${customer.status} ${customer.owner} ${customer.notes} ${customer.tags.join(" ")}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentCustomerSearch.toLowerCase());
    return matchesFilter && matchesTag && matchesMine && matchesSearch;
  });
}

function getFilteredProjects() {
  return projects.filter((project) => {
    const matchesFilter = currentProjectFilter === "all" || project.status === currentProjectFilter;
    const matchesCustomer = !currentProjectCustomerFilter || project.customerId === currentProjectCustomerFilter;
    const searchTarget = `${escapeHtml(project.name)} ${escapeHtml(project.customer)} ${escapeHtml(project.status)} ${escapeHtml(project.type)} ${escapeHtml(project.owner)} ${escapeHtml(project.description)}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentProjectSearch.toLowerCase());
    return matchesFilter && matchesCustomer && matchesSearch;
  });
}

function getFilteredLibraryItems() {
  return libraryItems.filter((item) => {
    const matchesFilter = currentLibraryFilter === "all"
      || (currentLibraryFilter === "Link" ? item.itemType === "Link" : item.category === currentLibraryFilter);
    const searchTarget = `${item.title} ${item.category} ${item.status} ${item.visibility} ${item.source} ${item.customerNames.join(" ")} ${item.owner} ${item.description} ${item.collection}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentLibrarySearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

function normaliseBooking(documentSnapshot) {
  const data = documentSnapshot.data() || {};
  return {
    id: documentSnapshot.id,
    title: data.title || "Untitled booking",
    customerId: data.customerId || "",
    customer: data.customerName || "Unassigned customer",
    type: data.type || "Training",
    status: data.status || "Upcoming",
    date: data.date || "",
    time: data.time || "",
    duration: data.duration || "",
    owner: data.owner || "Paul O’Brien",
    source: data.source || "Manual",
    notes: data.notes || "",
    customerNotes: data.customerNotes || ""
  };
}

function populateEventCustomerOptions() {
  const select = document.getElementById("event-customer");
  if (!select) return;
  const selected = select.value;
  select.innerHTML = '<option value="">Select a customer</option>' + customers
    .map((customer) => `<option value="${escapeHtml(customer.id)}">${escapeHtml(customer.company)}</option>`)
    .join("");
  if (customers.some((customer) => customer.id === selected)) select.value = selected;
}

function populateEventProjectOptions(customerId) {
  const select = document.getElementById("event-project");
  if (!select) return;
  const selected = select.value;

  if (!customerId) {
    select.innerHTML = '<option value="">Select a customer first</option>';
    select.disabled = true;
    return;
  }

  const customerProjects = projects.filter((project) => project.customerId === customerId);
  select.innerHTML = '<option value="">No specific project</option>' + customerProjects
    .map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`)
    .join("");
  select.disabled = false;
  if (customerProjects.some((project) => project.id === selected)) select.value = selected;
}

function normaliseEvent(document) {
  const data = document.data() || {};
  const duration = data.duration === undefined || data.duration === null || data.duration === "" ? null : Number(data.duration);
  return {
    id: document.id,
    title: data.title || "Untitled event",
    customerId: data.customerId || "",
    customerName: data.customerName || "Unassigned customer",
    projectId: data.projectId || "",
    projectName: data.projectName || "",
    type: data.type || "Catch-up",
    format: data.format || "Video call",
    date: data.date || "",
    startTime: data.startTime || "",
    status: data.status || "Scheduled",
    attendees: data.attendees || "",
    duration: Number.isNaN(duration) ? null : duration,
    keyItems: data.keyItems || "",
    actions: data.actions || "",
    actionItems: Array.isArray(data.actionItems)
      ? data.actionItems.map((item, index) => ({
          id: item.id || `legacy-${index}`,
          text: item.text || "",
          done: Boolean(item.done)
        }))
      : (data.actions ? [{ id: "legacy-0", text: data.actions, done: false }] : []),
    internalOnly: Boolean(data.internalOnly),
    owner: data.owner || "Admin",
    customerNotes: data.customerNotes || "",
    migratedFromBookingId: data.migratedFromBookingId || ""
  };
}

function loadLiveEvents() {
  if (unsubscribeEvents) unsubscribeEvents();
  const summary = document.getElementById("event-summary");
  if (summary) summary.textContent = "Loading events…";

  unsubscribeEvents = firebase.firestore().collection("events").onSnapshot((snapshot) => {
    events = snapshot.docs.map(normaliseEvent);
    selectedEventId = events.some((evt) => evt.id === selectedEventId) ? selectedEventId : null;
    renderEventTable();
    renderProjectTable();
    renderCustomerTable();
    updateDashboardMetrics();
    renderDashboardOpenActions();
    renderCalendar();
  }, (error) => {
    console.error("Could not load events", error);
    events = [];
    renderEventTable();
    if (summary) summary.textContent = "Events could not be loaded. Check Firestore access.";
  });
}

function renderDashboardOpenActions() {
  const list = document.getElementById("dashboard-actions-list");
  if (!list) return;

  const openActions = [];
  events.forEach((evt) => {
    evt.actionItems.forEach((item) => {
      if (!item.done) openActions.push({ evt, item });
    });
  });
  openActions.sort((a, b) => eventSortKey(b.evt).localeCompare(eventSortKey(a.evt)));

  if (openActions.length === 0) {
    list.innerHTML = `<li><span class="muted">No open actions — nice and clear.</span></li>`;
    return;
  }

  list.innerHTML = openActions.slice(0, 8).map(({ evt, item }) => `
    <li class="action-list-item">
      <label>
        <input type="checkbox" data-toggle-action-item="${evt.id}" data-action-item-id="${escapeHtml(item.id)}" />
        <span>${escapeHtml(item.text)}<span class="table-subtext">${escapeHtml(evt.customerName)} · ${escapeHtml(evt.title)}</span></span>
      </label>
    </li>
  `).join("");

  list.querySelectorAll("[data-toggle-action-item]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      toggleActionItem(checkbox.dataset.toggleActionItem, checkbox.dataset.actionItemId, checkbox.checked);
    });
  });
}

function resetEventDialogToCreateMode() {
  editingEventId = null;
  document.getElementById("event-form")?.reset();
  const message = document.getElementById("event-form-message");
  const title = document.getElementById("event-dialog-title");
  const saveButton = document.getElementById("save-event-button");
  const customerSelect = document.getElementById("event-customer");
  if (message) message.textContent = "";
  if (title) title.textContent = "New Event";
  if (saveButton) saveButton.textContent = "Create Event";
  if (customerSelect) customerSelect.disabled = false;
  populateEventProjectOptions("");
  const dateInput = document.querySelector('#event-form [name="date"]');
  if (dateInput) dateInput.valueAsDate = new Date();
}

function openEventDialogForEdit(evt) {
  const dialog = document.getElementById("event-dialog");
  const form = document.getElementById("event-form");
  const title = document.getElementById("event-dialog-title");
  const saveButton = document.getElementById("save-event-button");
  const customerSelect = document.getElementById("event-customer");
  if (!dialog || !form) return;

  editingEventId = evt.id;
  customerSelect.value = evt.customerId;
  customerSelect.disabled = true;
  populateEventProjectOptions(evt.customerId);
  document.getElementById("event-project").value = evt.projectId;
  form.elements.namedItem("title").value = evt.title;
  form.elements.namedItem("type").value = evt.type;
  form.elements.namedItem("format").value = evt.format;
  form.elements.namedItem("date").value = evt.date;
  form.elements.namedItem("startTime").value = evt.startTime;
  form.elements.namedItem("status").value = evt.status;
  form.elements.namedItem("attendees").value = evt.attendees;
  form.elements.namedItem("duration").value = evt.duration === null ? "" : evt.duration;
  form.elements.namedItem("keyItems").value = evt.keyItems;
  form.elements.namedItem("actions").value = evt.actionItems.map((item) => item.text).join("\n");
  form.elements.namedItem("internalOnly").checked = evt.internalOnly;

  if (title) title.textContent = "Edit Event";
  if (saveButton) saveButton.textContent = "Save Changes";
  dialog.showModal();
}

function openEventDialogForCustomer(customer) {
  const dialog = document.getElementById("event-dialog");
  if (!dialog) return;
  resetEventDialogToCreateMode();
  const customerSelect = document.getElementById("event-customer");
  customerSelect.value = customer.id;
  populateEventProjectOptions(customer.id);
  dialog.showModal();
}

async function createEvent(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const saveButton = document.getElementById("save-event-button");
  const message = document.getElementById("event-form-message");
  const formData = new FormData(form);

  const title = String(formData.get("title") || "").trim();
  const date = String(formData.get("date") || "").trim();
  if (!title || !date) {
    message.textContent = "Enter a title and date.";
    return;
  }

  const durationRaw = String(formData.get("duration") || "").trim();
  const duration = durationRaw === "" ? null : Number(durationRaw);
  if (duration !== null && (Number.isNaN(duration) || duration < 0)) {
    message.textContent = "Enter a valid number of hours, or leave it blank.";
    return;
  }

  const projectId = String(formData.get("projectId") || "").trim();
  const project = projects.find((item) => item.id === projectId);

  const actionLines = String(formData.get("actions") || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const existingEvent = editingEventId ? events.find((item) => item.id === editingEventId) : null;
  const existingActionItems = existingEvent ? existingEvent.actionItems : [];
  let nextActionSuffix = 0;
  const actionItems = actionLines.map((text) => {
    const existing = existingActionItems.find((item) => item.text === text);
    return existing || { id: `a${Date.now()}-${nextActionSuffix++}`, text, done: false };
  });

  const sharedFields = {
    title,
    type: formData.get("type") || "Catch-up",
    format: formData.get("format") || "Video call",
    date,
    startTime: String(formData.get("startTime") || "").trim(),
    status: formData.get("status") || "Scheduled",
    attendees: String(formData.get("attendees") || "").trim(),
    duration,
    keyItems: String(formData.get("keyItems") || "").trim(),
    actionItems,
    internalOnly: formData.get("internalOnly") === "on",
    projectId,
    projectName: project ? project.name : ""
  };

  saveButton.disabled = true;

  try {
    const now = firebase.firestore.FieldValue.serverTimestamp();

    if (editingEventId) {
      message.textContent = "Saving changes…";
      await firebase.firestore().collection("events").doc(editingEventId).set({
        ...sharedFields,
        updatedAt: now
      }, { merge: true });
      message.textContent = "Changes saved.";
      logAuditEvent("updated", "event", title);
    } else {
      const customerId = String(formData.get("customerId") || "").trim();
      const customer = customers.find((item) => item.id === customerId);

      if (!customer) {
        message.textContent = "Select a customer.";
        saveButton.disabled = false;
        return;
      }

      message.textContent = "Saving event…";
      await firebase.firestore().collection("events").add({
        ...sharedFields,
        customerId,
        customerName: customer.company,
        owner: getCurrentAdminName(),
        createdAt: now,
        updatedAt: now
      });
      message.textContent = "Event saved.";
      logAuditEvent("created", "event", title);
    }

    setTimeout(() => {
      document.getElementById("event-dialog")?.close();
      resetEventDialogToCreateMode();
      message.textContent = "";
    }, 500);
  } catch (error) {
    console.error("Could not save event", error);
    message.textContent = "Could not save the event. Please try again.";
  } finally {
    saveButton.disabled = false;
  }
}

async function deleteEvent(evt) {
  if (!confirm(`Delete "${evt.title}"? This cannot be undone.`)) return;
  try {
    await firebase.firestore().collection("events").doc(evt.id).delete();
    if (selectedEventId === evt.id) selectedEventId = null;
    logAuditEvent("deleted", "event", evt.title);
  } catch (error) {
    console.error("Could not delete event", error);
    alert("This event could not be deleted. Please try again.");
  }
}

function formatEventDateTime(evt) {
  const dateLabel = formatBookingDateDisplay(evt.date);
  return evt.startTime ? `${dateLabel}, ${evt.startTime}` : dateLabel;
}

function eventSortKey(evt) {
  return `${evt.date || ""} ${evt.startTime || "00:00"}`;
}

function getFilteredEvents() {
  return events.filter((evt) => {
    const matchesFilter = currentEventFilter === "all" || evt.status === currentEventFilter;
    const matchesCustomer = !currentEventCustomerFilter || evt.customerId === currentEventCustomerFilter;
    const actionsText = evt.actionItems.map((item) => item.text).join(" ");
    const searchTarget = `${evt.title} ${evt.customerName} ${evt.projectName} ${evt.type} ${evt.attendees} ${evt.keyItems} ${actionsText}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentEventSearch.toLowerCase());
    return matchesFilter && matchesCustomer && matchesSearch;
  });
}

function getEventDetailMarkup(evt) {
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div><p class="eyebrow">Event</p><h3>${escapeHtml(evt.title)}</h3></div>
        <button class="icon-button" data-close-event-detail aria-label="Close detail">×</button>
      </div>
      <div class="detail-grid">
        <div><span>Customer</span><strong>${escapeHtml(evt.customerName)}</strong></div>
        <div><span>Project</span><strong>${escapeHtml(evt.projectName || "None")}</strong></div>
        <div><span>Type</span><strong>${escapeHtml(evt.type)}</strong></div>
        <div><span>Format</span><strong>${escapeHtml(evt.format)}</strong></div>
        <div><span>Date</span><strong>${escapeHtml(formatEventDateTime(evt))}</strong></div>
        <div><span>Time spent</span><strong>${evt.duration === null ? "Not logged" : formatHoursAndDays(evt.duration)}</strong></div>
        <div><span>Attendees</span><strong>${escapeHtml(evt.attendees || "Not set")}</strong></div>
        <div><span>Visible to customer</span><strong>${evt.internalOnly ? "No — internal only" : "Yes"}</strong></div>
      </div>
      ${evt.keyItems ? `<p><strong>Key items:</strong> ${escapeHtml(evt.keyItems)}</p>` : ""}
      ${evt.customerNotes ? `<p class="muted"><strong>Customer's notes:</strong> ${escapeHtml(evt.customerNotes)}</p>` : ""}
      ${evt.actionItems.length ? `
        <p><strong>Actions</strong></p>
        <ul class="action-checklist">
          ${evt.actionItems.map((item) => `
            <li class="${item.done ? "done" : ""}">
              <label>
                <input type="checkbox" data-toggle-action-item="${evt.id}" data-action-item-id="${escapeHtml(item.id)}" ${item.done ? "checked" : ""} />
                <span>${escapeHtml(item.text)}</span>
              </label>
            </li>
          `).join("")}
        </ul>
      ` : ""}
      ${evt.status === "Scheduled" ? `<p class="muted">This event hasn't happened yet, or hasn't been filled in yet. Edit it once it's done to add key items, actions and time spent, and mark it Logged.</p>` : ""}
      <div class="detail-actions">
        <button class="secondary-button" data-edit-event="${evt.id}">Edit event</button>
        <button class="secondary-button danger-button" data-delete-event="${evt.id}">Delete event</button>
      </div>
    </div>
  `;
}

function renderEventTable() {
  const tableBody = document.getElementById("event-table");
  const summary = document.getElementById("event-summary");
  if (!tableBody || !summary) return;

  const filteredEvents = getFilteredEvents()
    .slice()
    .sort((a, b) => eventSortKey(b).localeCompare(eventSortKey(a)));
  tableBody.innerHTML = "";

  if (filteredEvents.length === 0) {
    tableBody.innerHTML = events.length === 0
      ? `<tr><td colspan="5" class="empty-table">No events yet — click "+ New Event" above to log or schedule your first one.</td></tr>`
      : `<tr><td colspan="5" class="empty-table">No events match your search.</td></tr>`;
  } else {
    filteredEvents.forEach((evt) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><button class="row-link" data-event-id="${evt.id}"><strong>${escapeHtml(evt.title)}</strong><span class="table-subtext">${escapeHtml(evt.customerName)}</span></button></td>
        <td>${escapeHtml(evt.type)}</td>
        <td>${escapeHtml(evt.projectName || "—")}</td>
        <td>${escapeHtml(formatEventDateTime(evt))}</td>
        <td><span class="status ${getStatusClass(evt.status)}">${escapeHtml(evt.status)}</span></td>
      `;
      tableBody.appendChild(row);

      if (selectedEventId === evt.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="5">${getEventDetailMarkup(evt)}</td>`;
        tableBody.appendChild(detailRow);
      }
    });
  }

  summary.textContent = `Showing ${filteredEvents.length} of ${events.length} events`;

  document.querySelectorAll("[data-event-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedEventId = selectedEventId === button.dataset.eventId ? null : button.dataset.eventId;
      renderEventTable();
    });
  });

  document.querySelectorAll("[data-close-event-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedEventId = null;
      renderEventTable();
    });
  });

  document.querySelectorAll("[data-edit-event]").forEach((button) => {
    button.addEventListener("click", () => {
      const evt = events.find((item) => item.id === button.dataset.editEvent);
      if (evt) openEventDialogForEdit(evt);
    });
  });

  document.querySelectorAll("[data-delete-event]").forEach((button) => {
    button.addEventListener("click", () => {
      const evt = events.find((item) => item.id === button.dataset.deleteEvent);
      if (evt) deleteEvent(evt);
    });
  });

  document.querySelectorAll("[data-toggle-action-item]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      toggleActionItem(checkbox.dataset.toggleActionItem, checkbox.dataset.actionItemId, checkbox.checked);
    });
  });
}

async function toggleActionItem(eventId, actionItemId, done) {
  const evt = events.find((item) => item.id === eventId);
  if (!evt) return;
  const updatedActionItems = evt.actionItems.map((item) => item.id === actionItemId ? { ...item, done } : item);
  try {
    await firebase.firestore().collection("events").doc(eventId).update({
      actionItems: updatedActionItems,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Could not update action item", error);
    alert("Could not save that change. Please try again.");
    renderEventTable();
  }
}

function setupEventControls() {
  const searchInput = document.getElementById("event-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentEventSearch = event.target.value;
      renderEventTable();
    });
  }

  document.querySelectorAll(".event-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentEventFilter = button.dataset.eventFilter;
      document.querySelectorAll(".event-filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderEventTable();
    });
  });

  document.getElementById("event-customer")?.addEventListener("change", (event) => {
    populateEventProjectOptions(event.target.value);
  });
}

// ---------- Calendar ----------

let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function parseIsoDate(isoDate) {
  if (!isoDate) return null;
  const parsed = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateUK(isoDate) {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return "";
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${parsed.getFullYear()}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const label = document.getElementById("calendar-month-label");
  if (!grid || !label) return;

  label.textContent = calendarMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const firstOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday-first
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - startWeekday);

  const today = new Date();
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  let html = dayNames.map((name) => `<div class="calendar-day-header">${name}</div>`).join("");

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart);
    cellDate.setDate(cellDate.getDate() + i);
    const isOutside = cellDate.getMonth() !== calendarMonth.getMonth();
    const isToday = isSameDay(cellDate, today);

    const dayEvents = events.filter((evt) => {
      const evtDate = parseIsoDate(evt.date);
      return evtDate && isSameDay(evtDate, cellDate);
    });
    const items = dayEvents.map((evt) => `<button class="calendar-item calendar-item-event" data-calendar-event="${evt.id}" title="${escapeHtml(evt.title)}">${escapeHtml(evt.title)}</button>`).join("");

    html += `
      <div class="calendar-day-cell ${isOutside ? "outside-month" : ""} ${isToday ? "is-today" : ""}">
        <span class="calendar-day-number">${cellDate.getDate()}</span>
        ${items}
      </div>
    `;
  }

  grid.innerHTML = html;

  grid.querySelectorAll("[data-calendar-event]").forEach((button) => {
    button.addEventListener("click", () => {
      showPage("events");
      selectedEventId = button.dataset.calendarEvent;
      renderEventTable();
    });
  });
}

function setupCalendarControls() {
  document.getElementById("calendar-prev-month")?.addEventListener("click", () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  document.getElementById("calendar-next-month")?.addEventListener("click", () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    renderCalendar();
  });
  document.getElementById("calendar-today-button")?.addEventListener("click", () => {
    calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    renderCalendar();
  });
}

function setupSettingsSubnav() {
  document.querySelectorAll(".settings-subnav-item").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.settingsSection;
      document.querySelectorAll(".settings-subnav-item").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      document.querySelectorAll(".settings-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.settingsPanel === section);
      });
    });
  });
}

// ---------- Global search ----------

function getGlobalSearchResults(query) {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const groups = [];

  const matchedCustomers = customers.filter((c) => c.company.toLowerCase().includes(term)).slice(0, 5);
  if (matchedCustomers.length) {
    groups.push({
      label: "Customers",
      items: matchedCustomers.map((c) => ({ title: c.company, subtitle: c.status, type: "customer", id: c.id }))
    });
  }

  const matchedProjects = projects.filter((p) => p.name.toLowerCase().includes(term) || p.customer.toLowerCase().includes(term)).slice(0, 5);
  if (matchedProjects.length) {
    groups.push({
      label: "Projects",
      items: matchedProjects.map((p) => ({ title: p.name, subtitle: p.customer, type: "project", id: p.id }))
    });
  }

  const matchedEvents = events.filter((e) => e.title.toLowerCase().includes(term) || e.customerName.toLowerCase().includes(term)).slice(0, 5);
  if (matchedEvents.length) {
    groups.push({
      label: "Events",
      items: matchedEvents.map((e) => ({ title: e.title, subtitle: `${e.customerName} · ${e.status}`, type: "event", id: e.id }))
    });
  }

  const matchedLeads = leads.filter((l) => l.name.toLowerCase().includes(term)).slice(0, 5);
  if (matchedLeads.length) {
    groups.push({
      label: "Leads",
      items: matchedLeads.map((l) => ({ title: l.name, subtitle: l.status, type: "lead", id: l.id }))
    });
  }

  const matchedLibrary = libraryItems.filter((item) => item.title.toLowerCase().includes(term)).slice(0, 5);
  if (matchedLibrary.length) {
    groups.push({
      label: "Library",
      items: matchedLibrary.map((item) => ({ title: item.title, subtitle: item.category, type: "library", id: item.id }))
    });
  }

  return groups;
}

function openGlobalSearchResult(type, id) {
  if (type === "customer") {
    showPage("customers");
    selectedCustomerId = id;
    renderCustomerTable();
  } else if (type === "project") {
    showPage("projects");
    selectedProjectId = id;
    renderProjectTable();
  } else if (type === "event") {
    showPage("events");
    selectedEventId = id;
    renderEventTable();
  } else if (type === "lead") {
    showPage("leads");
    selectedLeadId = id;
    renderLeadsTable();
  } else if (type === "library") {
    showPage("library");
    selectedLibraryItemId = id;
    renderLibraryTable();
  }
}

function renderGlobalSearchResults(query) {
  const resultsBox = document.getElementById("global-search-results");
  if (!resultsBox) return;

  const groups = getGlobalSearchResults(query);

  if (!query.trim()) {
    resultsBox.hidden = true;
    resultsBox.innerHTML = "";
    return;
  }

  if (groups.length === 0) {
    resultsBox.innerHTML = `<div class="global-search-empty">No matches for "${escapeHtml(query)}".</div>`;
    resultsBox.hidden = false;
    return;
  }

  resultsBox.innerHTML = groups.map((group) => `
    <div class="global-search-group-label">${escapeHtml(group.label)}</div>
    ${group.items.map((item) => `
      <button class="global-search-result" type="button" data-search-type="${item.type}" data-search-id="${escapeHtml(item.id)}">
        ${escapeHtml(item.title)}
        <span>${escapeHtml(item.subtitle)}</span>
      </button>
    `).join("")}
  `).join("");
  resultsBox.hidden = false;

  resultsBox.querySelectorAll(".global-search-result").forEach((button) => {
    button.addEventListener("click", () => {
      openGlobalSearchResult(button.dataset.searchType, button.dataset.searchId);
      document.getElementById("global-search-input").value = "";
      resultsBox.hidden = true;
      resultsBox.innerHTML = "";
    });
  });
}

function setupGlobalSearch() {
  const input = document.getElementById("global-search-input");
  const resultsBox = document.getElementById("global-search-results");
  if (!input || !resultsBox) return;

  input.addEventListener("input", (event) => {
    renderGlobalSearchResults(event.target.value);
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) renderGlobalSearchResults(input.value);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".global-search")) {
      resultsBox.hidden = true;
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.value = "";
      resultsBox.hidden = true;
      resultsBox.innerHTML = "";
      input.blur();
    }
  });
}

// ---------- Leads ----------

function formatCurrency(value) {
  const number = Number(value) || 0;
  return `£${number.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

function normaliseLead(documentSnapshot) {
  const data = documentSnapshot.data() || {};
  return {
    id: documentSnapshot.id,
    name: data.name || "Unnamed lead",
    status: data.status || "Open",
    projectedIncome: Number(data.projectedIncome || 0),
    notes: data.notes || "",
    source: data.source || "",
    owner: data.owner || "Paul O’Brien",
    isNewCustomer: Boolean(data.isNewCustomer),
    customerId: data.customerId || "",
    customerName: data.customerName || "",
    isNewProject: Boolean(data.isNewProject),
    projectId: data.projectId || "",
    projectName: data.projectName || "",
    convertedCustomerId: data.convertedCustomerId || "",
    convertedProjectId: data.convertedProjectId || "",
    convertedOpportunityId: data.convertedOpportunityId || "",
    lastUpdated: formatFirestoreDate(data.updatedAt || data.createdAt),
    updatedAtRaw: data.updatedAt || data.createdAt || null,
    actionItems: Array.isArray(data.actionItems) ? data.actionItems.map((item) => ({ id: item.id || generateActionItemId(), text: item.text || "", done: Boolean(item.done), assignee: item.assignee || "" })) : []
  };
}

function loadLiveLeads() {
  if (unsubscribeLeads) unsubscribeLeads();
  const summary = document.getElementById("lead-summary");
  if (summary) summary.textContent = "Loading leads…";

  unsubscribeLeads = firebase.firestore().collection("leads").orderBy("name").onSnapshot((snapshot) => {
    leads = snapshot.docs.map(normaliseLead);
    selectedLeadId = leads.some((lead) => lead.id === selectedLeadId) ? selectedLeadId : null;
    renderLeadsTable();
    updateDashboardMetrics();
  }, (error) => {
    console.error("Could not load leads", error);
    leads = [];
    renderLeadsTable();
    if (summary) summary.textContent = "Leads could not be loaded. Check Firestore access.";
  });
}

function populateLeadCustomerOptions() {
  const select = document.getElementById("lead-existing-customer");
  if (!select) return;
  const selected = select.value;
  select.innerHTML = '<option value="">Select a customer</option>' + customers
    .map((customer) => `<option value="${escapeHtml(customer.id)}">${escapeHtml(customer.company)}</option>`)
    .join("");
  if (customers.some((customer) => customer.id === selected)) select.value = selected;
}

function populateLeadProjectOptions(customerId) {
  const select = document.getElementById("lead-existing-project");
  if (!select) return;

  if (!customerId) {
    select.innerHTML = '<option value="">Select a customer first</option>';
    select.disabled = true;
    return;
  }

  const customerProjects = projects.filter((project) => project.customerId === customerId);
  if (customerProjects.length === 0) {
    select.innerHTML = '<option value="">No projects for this customer yet</option>';
    select.disabled = true;
    return;
  }

  select.innerHTML = '<option value="">Select a project</option>' + customerProjects
    .map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`)
    .join("");
  select.disabled = false;
}

function updateLeadCustomerMode() {
  const mode = document.getElementById("lead-customer-mode")?.value;
  const existingGroup = document.getElementById("lead-customer-existing-group");
  const newGroup = document.getElementById("lead-customer-new-group");
  const projectMode = document.getElementById("lead-project-mode");
  if (!mode || !existingGroup || !newGroup) return;

  const isNew = mode === "new";
  existingGroup.hidden = isNew;
  newGroup.hidden = !isNew;

  // A prospective (not-yet-real) customer can't already have a real project,
  // so force the project side to "new" too and lock it while customer is "new".
  if (projectMode) {
    if (isNew) {
      projectMode.value = "new";
      projectMode.disabled = true;
    } else {
      projectMode.disabled = false;
    }
    updateLeadProjectMode();
  }
}

function updateLeadProjectMode() {
  const mode = document.getElementById("lead-project-mode")?.value;
  const existingGroup = document.getElementById("lead-project-existing-group");
  const newGroup = document.getElementById("lead-project-new-group");
  if (!mode || !existingGroup || !newGroup) return;

  const isNew = mode === "new";
  existingGroup.hidden = isNew;
  newGroup.hidden = !isNew;
  if (!isNew) populateLeadProjectOptions(document.getElementById("lead-existing-customer")?.value || "");
}

function resetLeadDialogToCreateMode() {
  editingLeadId = null;
  document.getElementById("lead-form")?.reset();
  const title = document.getElementById("lead-dialog-title");
  const saveButton = document.getElementById("save-lead-button");
  if (title) title.textContent = "New Lead";
  if (saveButton) saveButton.textContent = "Create Lead";

  ["lead-customer-mode", "lead-existing-customer", "lead-new-customer-name", "lead-project-mode", "lead-existing-project", "lead-new-project-name"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.disabled = false;
  });

  populateLeadCustomerOptions();
  populateOwnerSelect("lead-owner");
  updateLeadCustomerMode();

  const actionsSection = document.getElementById("lead-dialog-actions-section");
  if (actionsSection) {
    actionsSection.hidden = true;
    actionsSection.innerHTML = "";
  }
}

function openLeadDialogForEdit(lead) {
  const dialog = document.getElementById("lead-dialog");
  const form = document.getElementById("lead-form");
  const title = document.getElementById("lead-dialog-title");
  const saveButton = document.getElementById("save-lead-button");
  if (!dialog || !form) return;

  editingLeadId = lead.id;
  form.elements.namedItem("name").value = lead.name;
  form.elements.namedItem("status").value = lead.status;
  form.elements.namedItem("projectedIncome").value = lead.projectedIncome || "";
  form.elements.namedItem("notes").value = lead.notes;
  if (lead.source) form.elements.namedItem("source").value = lead.source;
  populateOwnerSelect("lead-owner", lead.owner);

  document.getElementById("lead-customer-mode").value = lead.isNewCustomer ? "new" : "existing";
  populateLeadCustomerOptions();
  if (!lead.isNewCustomer) document.getElementById("lead-existing-customer").value = lead.customerId;
  document.getElementById("lead-new-customer-name").value = lead.isNewCustomer ? lead.customerName : "";
  updateLeadCustomerMode();

  document.getElementById("lead-project-mode").value = lead.isNewProject ? "new" : "existing";
  if (!lead.isNewProject) {
    populateLeadProjectOptions(lead.customerId);
    document.getElementById("lead-existing-project").value = lead.projectId;
  }
  document.getElementById("lead-new-project-name").value = lead.isNewProject ? lead.projectName : "";
  updateLeadProjectMode();

  // The customer/project a lead points to is locked once created — reassigning
  // would need the same kind of extra bookkeeping Projects/Bookings already avoid.
  // Exception: a prospective (not-yet-real) customer name has no linked record to
  // protect, so it stays editable to allow fixing a typo.
  ["lead-customer-mode", "lead-existing-customer", "lead-project-mode", "lead-existing-project", "lead-new-project-name"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.disabled = true;
  });

  if (title) title.textContent = "Edit Lead";
  if (saveButton) saveButton.textContent = "Save Changes";

  const actionsSection = document.getElementById("lead-dialog-actions-section");
  if (actionsSection) {
    actionsSection.hidden = false;
    actionsSection.innerHTML = getActionItemsMarkup("lead", lead.id, lead.actionItems || []);
    wireActionItemControls(actionsSection);
  }

  dialog.showModal();
}

async function createLead(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const saveButton = document.getElementById("save-lead-button");
  const message = document.getElementById("lead-form-message");
  const formData = new FormData(form);

  const name = String(formData.get("name") || "").trim();
  const status = formData.get("status") || "Open";
  const projectedIncome = Number(formData.get("projectedIncome")) || 0;
  const notes = String(formData.get("notes") || "").trim();
  const source = formData.get("source") || "";
  const owner = String(formData.get("owner") || "").trim() || getCurrentAdminName();

  if (!name) {
    message.textContent = "Enter a lead name.";
    return;
  }

  if (!editingLeadId && !confirmIfSimilarNameExists(name, getKnownProspectNames(), "this lead")) return;

  saveButton.disabled = true;

  try {
    const now = firebase.firestore.FieldValue.serverTimestamp();

    if (editingLeadId) {
      message.textContent = "Saving changes…";
      const previousLead = leads.find((item) => item.id === editingLeadId);
      const customerNameUpdate = previousLead && previousLead.isNewCustomer
        ? { customerName: String(formData.get("newCustomerName") || "").trim() || previousLead.customerName }
        : {};
      await firebase.firestore().collection("leads").doc(editingLeadId).set({
        name,
        status,
        projectedIncome,
        notes,
        source,
        owner,
        ...customerNameUpdate,
        updatedAt: now
      }, { merge: true });
      message.textContent = "Changes saved.";
      logAuditEvent("updated", "lead", name);
    } else {
      const customerMode = formData.get("customerMode");
      const isNewCustomer = customerMode === "new";
      const projectMode = formData.get("projectMode");
      const isNewProject = isNewCustomer || projectMode === "new";

      let customerId = "";
      let customerName = "";
      if (isNewCustomer) {
        customerName = String(formData.get("newCustomerName") || "").trim();
        if (!customerName) {
          message.textContent = "Enter the prospective customer's name.";
          saveButton.disabled = false;
          return;
        }
      } else {
        customerId = String(formData.get("existingCustomerId") || "").trim();
        const customer = customers.find((item) => item.id === customerId);
        if (!customer) {
          message.textContent = "Select a customer, or switch to “New (prospective) customer”.";
          saveButton.disabled = false;
          return;
        }
        customerName = customer.company;
      }

      let projectId = "";
      let projectName = "";
      if (isNewProject) {
        projectName = String(formData.get("newProjectName") || "").trim();
        if (!projectName) {
          message.textContent = "Enter the prospective project's name.";
          saveButton.disabled = false;
          return;
        }
      } else {
        projectId = String(formData.get("existingProjectId") || "").trim();
        const project = projects.find((item) => item.id === projectId);
        if (!project) {
          message.textContent = "Select a project, or switch to “New (prospective) project”.";
          saveButton.disabled = false;
          return;
        }
        projectName = project.name;
      }

      message.textContent = "Saving lead…";
      await firebase.firestore().collection("leads").add({
        name,
        status,
        projectedIncome,
        notes,
        source,
        isNewCustomer,
        customerId,
        customerName,
        isNewProject,
        projectId,
        projectName,
        convertedCustomerId: "",
        convertedProjectId: "",
        owner,
        createdAt: now,
        updatedAt: now
      });
      message.textContent = "Lead created.";
      logAuditEvent("created", "lead", name);
    }

    setTimeout(() => {
      document.getElementById("lead-dialog")?.close();
      resetLeadDialogToCreateMode();
      message.textContent = "";
    }, 500);
  } catch (error) {
    console.error("Could not save lead", error);
    message.textContent = "Could not save the lead. Please try again.";
  } finally {
    saveButton.disabled = false;
  }
}

let promotingLeadId = null;

function promoteLeadToOpportunity(lead) {
  if (lead.status !== "Qualified") {
    alert("Only a lead marked Qualified can be promoted to an Opportunity.");
    return;
  }
  if (lead.convertedOpportunityId) {
    alert("This lead has already been promoted.");
    return;
  }
  if (!lead.projectedIncome) {
    alert("Enter a projected income on this lead before promoting — an Opportunity needs a deal value.");
    return;
  }
  promotingLeadId = lead.id;
  const dialog = document.getElementById("promote-lead-dialog");
  const dateInput = document.getElementById("promote-lead-close-date");
  const message = document.getElementById("promote-lead-form-message");
  if (dateInput) dateInput.value = "";
  if (message) message.textContent = "";
  dialog?.showModal();
}

async function confirmPromoteLeadToOpportunity(event) {
  event.preventDefault();
  const message = document.getElementById("promote-lead-form-message");
  const dateInput = document.getElementById("promote-lead-close-date");
  const expectedCloseDate = dateInput ? dateInput.value : "";
  const lead = leads.find((item) => item.id === promotingLeadId);
  if (!lead) return;
  if (!expectedCloseDate) {
    if (message) message.textContent = "Enter an expected close date.";
    return;
  }

  try {
    const database = firebase.firestore();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    let customerId = lead.customerId;
    let customerName = lead.customerName;

    if (lead.isNewCustomer) {
      const customerRef = await database.collection("customers").add({
        company: lead.customerName,
        status: "Trial",
        notes: `Promoted from lead: ${lead.name}`,
        owner: getCurrentAdminName(),
        projects: 0,
        users: 0,
        uploadStorageUsedBytes: 0,
        createdAt: now,
        updatedAt: now
      });
      customerId = customerRef.id;
    }

    const opportunityRef = await database.collection("opportunities").add({
      name: lead.name,
      dealValue: lead.projectedIncome,
      expectedCloseDate,
      salesStage: pipelineConfig.salesStages[0] || "",
      forecastCategory: pipelineConfig.forecastCategories[pipelineConfig.forecastCategories.length - 1] || "",
      status: "Open",
      notes: lead.notes,
      source: lead.source,
      customerId,
      customerName,
      isNewProject: lead.isNewProject,
      projectId: lead.projectId,
      projectName: lead.projectName,
      sourceLeadId: lead.id,
      convertedProjectId: "",
      owner: lead.owner,
      createdAt: now,
      updatedAt: now
    });

    await database.collection("leads").doc(lead.id).set({
      convertedCustomerId: customerId,
      convertedOpportunityId: opportunityRef.id,
      updatedAt: now
    }, { merge: true });

    document.getElementById("promote-lead-dialog")?.close();
    promotingLeadId = null;
    logAuditEvent("promoted", "lead", lead.name);
  } catch (error) {
    console.error("Could not promote lead", error);
    if (message) message.textContent = "This lead could not be promoted. Please try again.";
  }
}

async function updateLeadStatusInline(leadId, status) {
  const lead = leads.find((item) => item.id === leadId);
  if (!lead || lead.status === status) return;
  try {
    await firebase.firestore().collection("leads").doc(leadId).set({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    logAuditEvent("updated", "lead", `${lead.name} → ${status}`);
  } catch (error) {
    console.error("Could not update lead status", error);
    alert("Could not update this lead's status. Please try again.");
    renderLeadsTable();
  }
}

async function deleteLead(lead) {
  if (!confirm(`Delete the lead "${lead.name}"? This cannot be undone. Any Customer/Project already promoted from it will not be affected.`)) return;
  try {
    await firebase.firestore().collection("leads").doc(lead.id).delete();
    if (selectedLeadId === lead.id) selectedLeadId = null;
    logAuditEvent("deleted", "lead", lead.name);
  } catch (error) {
    console.error("Could not delete lead", error);
    alert("This lead could not be deleted. Please try again.");
  }
}

function getFilteredLeads() {
  return leads.filter((lead) => {
    const matchesFilter = currentLeadFilter === "all" || lead.status === currentLeadFilter;
    const matchesCustomer = !currentLeadCustomerFilter || lead.customerId === currentLeadCustomerFilter;
    const matchesMine = !currentLeadMineOnly || lead.owner === getCurrentAdminName();
    const searchTarget = `${lead.name} ${lead.status} ${lead.customerName} ${lead.projectName} ${lead.notes}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentLeadSearch.toLowerCase());
    return matchesFilter && matchesCustomer && matchesMine && matchesSearch;
  });
}

function getWhereDidWeLeaveThisSummary(type, item) {
  if (type === "lead") {
    return `This is an ${item.status.toLowerCase()} lead${item.source ? ` from ${item.source}` : ""}, owned by ${item.owner}. Projected income is ${formatCurrency(item.projectedIncome)}. Last touched ${item.lastUpdated}.`;
  }
  if (type === "opportunity") {
    const stalled = getOpportunityStalledFlag(item);
    const stageLabel = getOpportunityStageLabel(item);
    const forecastLabel = getOpportunityForecastLabel(item);
    let statusLine;
    if (item.status === "Won") statusLine = item.convertedProjectId ? "This deal is Won and already promoted to a Project." : "This deal is Won — promote it to a Project when ready.";
    else if (item.status === "Lost") statusLine = `This deal was Lost${item.winLossReason.length ? ` (${item.winLossReason.join(", ")})` : ""}.`;
    else statusLine = stalled ? `⚠ ${stalled} — worth a follow-up.` : "Active and moving through the pipeline.";
    return `Currently in ${stageLabel} (${forecastLabel}), worth ${formatCurrency(item.dealValue)}, expected to close ${item.expectedCloseDate ? formatDateUK(item.expectedCloseDate) : "an unset date"}. Owned by ${item.owner}. ${statusLine}`;
  }
  if (type === "customer") {
    const health = getCustomerHealthFlag(item);
    return `${item.status} customer owned by ${item.owner}, with ${item.projects} project${item.projects === 1 ? "" : "s"}. ${health ? `⚠ ${health}.` : "No concerns currently flagged."}`;
  }
  if (type === "project") {
    return `${item.status} project for ${item.customer}, owned by ${item.owner}.`;
  }
  return "";
}

// ---------- Actions (Leads, Opportunities, Projects) ----------

const ACTION_ITEM_COLLECTIONS = { lead: "leads", opportunity: "opportunities", project: "projects" };
const ACTION_ITEM_STORES = { lead: () => leads, opportunity: () => opportunities, project: () => projects };
const ACTION_ITEM_RERENDER = {
  lead: renderLeadsTable,
  opportunity: () => { renderOpportunitiesTable(); renderOpportunityKanban(); },
  project: renderProjectTable
};

function generateActionItemId() {
  return `action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseActionItemKey(key) {
  const firstDash = key.indexOf("-");
  const entityType = key.slice(0, firstDash);
  const rest = key.slice(firstDash + 1);
  const secondDash = rest.indexOf("-");
  if (secondDash === -1) return { entityType, entityId: rest, itemId: "" };
  return { entityType, entityId: rest.slice(0, secondDash), itemId: rest.slice(secondDash + 1) };
}

async function addActionItemTo(entityType, entityId, text, assignee) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const entity = ACTION_ITEM_STORES[entityType]().find((item) => item.id === entityId);
  if (!entity) return;
  const newItem = { id: generateActionItemId(), text: trimmed, done: false, assignee: assignee || "" };
  try {
    await firebase.firestore().collection(ACTION_ITEM_COLLECTIONS[entityType]).doc(entityId).set({
      actionItems: [...entity.actionItems, newItem],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    logAuditEvent("updated", entityType, `${entity.name} (action added)`);
  } catch (error) {
    console.error("Could not add action", error);
    alert("Could not add this action. Please try again.");
  }
}

async function toggleActionItemOn(entityType, entityId, itemId, done) {
  const entity = ACTION_ITEM_STORES[entityType]().find((item) => item.id === entityId);
  if (!entity) return;
  const updated = entity.actionItems.map((item) => item.id === itemId ? { ...item, done } : item);
  try {
    await firebase.firestore().collection(ACTION_ITEM_COLLECTIONS[entityType]).doc(entityId).set({
      actionItems: updated,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Could not update action", error);
    alert("Could not update this action. Please try again.");
  }
}

async function reassignActionItem(entityType, entityId, itemId, assignee) {
  const entity = ACTION_ITEM_STORES[entityType]().find((item) => item.id === entityId);
  if (!entity) return;
  const updated = entity.actionItems.map((item) => item.id === itemId ? { ...item, assignee: assignee || "" } : item);
  try {
    await firebase.firestore().collection(ACTION_ITEM_COLLECTIONS[entityType]).doc(entityId).set({
      actionItems: updated,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Could not reassign action", error);
    alert("Could not reassign this action. Please try again.");
  }
}

async function deleteActionItemFrom(entityType, entityId, itemId) {
  const entity = ACTION_ITEM_STORES[entityType]().find((item) => item.id === entityId);
  if (!entity) return;
  try {
    await firebase.firestore().collection(ACTION_ITEM_COLLECTIONS[entityType]).doc(entityId).set({
      actionItems: entity.actionItems.filter((item) => item.id !== itemId),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Could not remove action", error);
    alert("Could not remove this action. Please try again.");
  }
}

function buildAdminOptions(selected) {
  return admins.map((admin) => getTeamMemberLabel(admin)).filter(Boolean)
    .map((n) => `<option value="${escapeHtml(n)}" ${n === selected ? "selected" : ""}>${escapeHtml(n)}</option>`).join("");
}

function getActionItemsMarkup(entityType, entityId, actionItems) {
  return `
    <p class="eyebrow">Actions (${actionItems.length})</p>
    <div class="action-add-form">
      <input type="text" class="full-width" data-action-text-input="${entityType}-${entityId}" placeholder="Add an action..." />
      <select data-action-assignee-input="${entityType}-${entityId}"><option value="">Unassigned</option>${buildAdminOptions("")}</select>
      <button class="secondary-button compact" type="button" data-add-action-item="${entityType}-${entityId}">Add</button>
    </div>
    <ul class="action-list-checklist">
      ${actionItems.length ? actionItems.map((item) => `
        <li class="action-list-item">
          <label>
            <input type="checkbox" ${item.done ? "checked" : ""} data-toggle-action-item2="${entityType}-${entityId}-${item.id}" />
            <span>${escapeHtml(item.text)}</span>
          </label>
          <select class="compact" data-action-reassign="${entityType}-${entityId}-${item.id}">
            <option value="" ${item.assignee ? "" : "selected"}>Unassigned</option>${buildAdminOptions(item.assignee)}
          </select>
          <button class="icon-button compact" type="button" data-delete-action-item="${entityType}-${entityId}-${item.id}" aria-label="Remove action">×</button>
        </li>
      `).join("") : `<li><span class="muted">No actions yet.</span></li>`}
    </ul>
  `;
}

function wireActionItemControls(container) {
  container.querySelectorAll("[data-add-action-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const { entityType, entityId } = parseActionItemKey(button.dataset.addActionItem);
      const textInput = container.querySelector(`[data-action-text-input="${entityType}-${entityId}"]`);
      const assigneeInput = container.querySelector(`[data-action-assignee-input="${entityType}-${entityId}"]`);
      if (textInput && textInput.value.trim()) {
        addActionItemTo(entityType, entityId, textInput.value, assigneeInput ? assigneeInput.value : "").then(ACTION_ITEM_RERENDER[entityType]);
      }
    });
  });
  container.querySelectorAll("[data-toggle-action-item2]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const { entityType, entityId, itemId } = parseActionItemKey(checkbox.dataset.toggleActionItem2);
      toggleActionItemOn(entityType, entityId, itemId, checkbox.checked).then(ACTION_ITEM_RERENDER[entityType]);
    });
  });
  container.querySelectorAll("[data-delete-action-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const { entityType, entityId, itemId } = parseActionItemKey(button.dataset.deleteActionItem);
      deleteActionItemFrom(entityType, entityId, itemId).then(ACTION_ITEM_RERENDER[entityType]);
    });
  });
  container.querySelectorAll("[data-action-reassign]").forEach((select) => {
    select.addEventListener("change", () => {
      const { entityType, entityId, itemId } = parseActionItemKey(select.dataset.actionReassign);
      reassignActionItem(entityType, entityId, itemId, select.value).then(ACTION_ITEM_RERENDER[entityType]);
    });
  });
}

function getLeadDetailMarkup(lead) {
  const canPromote = lead.status === "Qualified" && !lead.convertedOpportunityId;
  const alreadyPromoted = Boolean(lead.convertedOpportunityId);
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Lead record</p>
          <h3>${escapeHtml(lead.name)}</h3>
        </div>
        <div class="detail-header-actions">
          <button class="secondary-button compact" data-edit-lead="${lead.id}">Edit lead</button>
          <span class="status ${getStatusClass(lead.status)}">${escapeHtml(lead.status)}</span>
          <button class="icon-button" data-close-lead-detail aria-label="Close lead detail">×</button>
        </div>
      </div>
      <p class="where-left-note">🧭 ${escapeHtml(getWhereDidWeLeaveThisSummary("lead", lead))}</p>
      <div class="detail-grid">
        <div><span>Customer</span><strong>${escapeHtml(lead.customerName)}${lead.isNewCustomer ? " (prospective)" : ""}</strong></div>
        <div><span>Project</span><strong>${escapeHtml(lead.projectName)}${lead.isNewProject ? " (prospective)" : ""}</strong></div>
        <div><span>Projected income</span><strong>${formatCurrency(lead.projectedIncome)}</strong></div>
        <div><span>Source</span><strong>${escapeHtml(lead.source || "Not set")}</strong></div>
        <div><span>Owner</span><strong>${escapeHtml(lead.owner)}</strong></div>
        <div><span>Last updated</span><strong>${escapeHtml(lead.lastUpdated)}</strong></div>
        <div><span>Promoted</span><strong>${alreadyPromoted ? "Yes" : "Not yet"}</strong></div>
      </div>
      <p>${escapeHtml(lead.notes || "No notes added.")}</p>
      ${getActionItemsMarkup("lead", lead.id, lead.actionItems)}
      <div class="detail-actions">
        <button class="secondary-button" data-edit-lead="${lead.id}">Edit lead</button>
        <button class="secondary-button" data-promote-lead="${lead.id}" ${canPromote ? "" : "disabled"}>
          ${alreadyPromoted ? "Already promoted" : "Promote to Opportunity"}
        </button>
        <button class="secondary-button danger-button" data-delete-lead="${lead.id}">Delete lead</button>
      </div>
    </div>
  `;
}

function renderLeadsTable() {
  const tableBody = document.getElementById("leads-table");
  const summary = document.getElementById("lead-summary");
  if (!tableBody || !summary) return;

  const filteredLeads = getFilteredLeads();
  tableBody.innerHTML = "";

  if (filteredLeads.length === 0) {
    tableBody.innerHTML = leads.length === 0
      ? `<tr><td colspan="6" class="empty-table">No leads yet — click "+ New Lead" above to track your first prospect.</td></tr>`
      : `<tr><td colspan="6" class="empty-table">No leads match your search.</td></tr>`;
  } else {
    filteredLeads.forEach((lead) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="checkbox-col"><input type="checkbox" class="lead-bulk-checkbox" data-lead-bulk-id="${lead.id}" ${bulkSelectedLeadIds.has(lead.id) ? "checked" : ""} aria-label="Select ${escapeHtml(lead.name)}" /></td>
        <td><button class="row-link" data-lead-id="${lead.id}"><strong>${escapeHtml(lead.name)}</strong></button></td>
        <td>${escapeHtml(lead.customerName)}${lead.isNewCustomer ? ' <span class="table-subtext">(prospective)</span>' : ""}</td>
        <td>${escapeHtml(lead.projectName)}${lead.isNewProject ? ' <span class="table-subtext">(prospective)</span>' : ""}</td>
        <td><select class="status-select ${getStatusClass(lead.status)}" data-lead-status-select="${lead.id}">${LEAD_VALID_STATUSES.map((s) => `<option value="${escapeHtml(s)}" ${s === lead.status ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}</select></td>
        <td>${formatCurrency(lead.projectedIncome)}</td>
      `;
      tableBody.appendChild(row);

      if (selectedLeadId === lead.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="6">${getLeadDetailMarkup(lead)}</td>`;
        tableBody.appendChild(detailRow);
      }
    });
  }

  summary.textContent = `Showing ${filteredLeads.length} of ${leads.length} leads`;
  wireActionItemControls(tableBody);

  document.querySelectorAll("[data-lead-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const opening = selectedLeadId !== button.dataset.leadId;
      selectedLeadId = opening ? button.dataset.leadId : null;
      renderLeadsTable();
      if (opening) {
        const lead = leads.find((item) => item.id === button.dataset.leadId);
        if (lead) recordRecentlyViewed("lead", lead.id, lead.name);
      }
    });
  });

  document.querySelectorAll("[data-close-lead-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedLeadId = null;
      renderLeadsTable();
    });
  });

  document.querySelectorAll("[data-edit-lead]").forEach((button) => {
    button.addEventListener("click", () => {
      const lead = leads.find((item) => item.id === button.dataset.editLead);
      if (lead) openLeadDialogForEdit(lead);
    });
  });

  document.querySelectorAll("[data-promote-lead]").forEach((button) => {
    button.addEventListener("click", () => {
      const lead = leads.find((item) => item.id === button.dataset.promoteLead);
      if (lead) promoteLeadToOpportunity(lead);
    });
  });

  document.querySelectorAll("[data-delete-lead]").forEach((button) => {
    button.addEventListener("click", () => {
      const lead = leads.find((item) => item.id === button.dataset.deleteLead);
      if (lead) deleteLead(lead);
    });
  });

  document.querySelectorAll("[data-lead-status-select]").forEach((select) => {
    select.addEventListener("click", (event) => event.stopPropagation());
    select.addEventListener("change", () => {
      updateLeadStatusInline(select.dataset.leadStatusSelect, select.value);
    });
  });

  document.querySelectorAll("[data-lead-bulk-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) bulkSelectedLeadIds.add(checkbox.dataset.leadBulkId);
      else bulkSelectedLeadIds.delete(checkbox.dataset.leadBulkId);
      updateLeadBulkBar();
    });
  });
  const leadSelectAll = document.getElementById("lead-select-all");
  if (leadSelectAll) {
    leadSelectAll.checked = filteredLeads.length > 0 && filteredLeads.every((l) => bulkSelectedLeadIds.has(l.id));
  }
  updateLeadBulkBar();
}

// ---------- Opportunities ----------

function loadLivePipelineConfig() {
  if (unsubscribePipelineConfig) unsubscribePipelineConfig();
  unsubscribePipelineConfig = firebase.firestore().collection("settings").doc("pipelineConfig").onSnapshot((doc) => {
    const data = doc.data() || {};
    if (Array.isArray(data.salesStages) && data.salesStages.length) pipelineConfig.salesStages = data.salesStages;
    if (Array.isArray(data.forecastCategories) && data.forecastCategories.length) pipelineConfig.forecastCategories = data.forecastCategories;
    renderPipelineConfigForm();
    populateOpportunityStageSelect();
    populateOpportunityForecastSelect();
    setupOpportunityStageFilter();
    renderOpportunitiesTable();
  }, (error) => console.error("Could not load pipeline config", error));
}

function renderPipelineConfigForm() {
  const stagesList = document.getElementById("sales-stage-list");
  const forecastList = document.getElementById("forecast-category-list");
  if (stagesList) {
    stagesList.innerHTML = pipelineConfig.salesStages
      .map((stage, index) => `
        <div class="pipeline-config-row" data-stage-row="${index}">
          <input type="text" value="${escapeHtml(stage)}" data-stage-input="${index}" />
          <button type="button" class="icon-button" data-remove-stage="${index}" aria-label="Remove stage">×</button>
        </div>
      `).join("");
  }
  if (forecastList) {
    forecastList.innerHTML = pipelineConfig.forecastCategories
      .map((category, index) => `
        <div class="pipeline-config-row" data-forecast-row="${index}">
          <input type="text" value="${escapeHtml(category)}" data-forecast-input="${index}" />
          <button type="button" class="icon-button" data-remove-forecast="${index}" aria-label="Remove category">×</button>
        </div>
      `).join("");
  }

  document.querySelectorAll("[data-remove-stage]").forEach((button) => {
    button.addEventListener("click", () => {
      pipelineConfig.salesStages.splice(Number(button.dataset.removeStage), 1);
      renderPipelineConfigForm();
    });
  });
  document.querySelectorAll("[data-remove-forecast]").forEach((button) => {
    button.addEventListener("click", () => {
      pipelineConfig.forecastCategories.splice(Number(button.dataset.removeForecast), 1);
      renderPipelineConfigForm();
    });
  });
}

async function savePipelineConfig(event) {
  event.preventDefault();
  const message = document.getElementById("pipeline-config-message");

  const salesStages = Array.from(document.querySelectorAll("[data-stage-input]"))
    .map((input) => input.value.trim())
    .filter(Boolean);
  const forecastCategories = Array.from(document.querySelectorAll("[data-forecast-input]"))
    .map((input) => input.value.trim())
    .filter(Boolean);

  if (!salesStages.length || !forecastCategories.length) {
    if (message) message.textContent = "Keep at least one Sales Stage and one Forecast Category.";
    return;
  }

  try {
    await firebase.firestore().collection("settings").doc("pipelineConfig").set({
      salesStages,
      forecastCategories,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    if (message) message.textContent = "Pipeline settings saved.";
    logAuditEvent("updated", "settings", "Sales Pipeline");
  } catch (error) {
    console.error("Could not save pipeline config", error);
    if (message) message.textContent = "Could not save pipeline settings. Please try again.";
  }
}

function addPipelineStageField() {
  pipelineConfig.salesStages.push("");
  renderPipelineConfigForm();
}

function addPipelineForecastField() {
  pipelineConfig.forecastCategories.push("");
  renderPipelineConfigForm();
}

function getOpportunityStageLabel(opportunity) {
  return opportunity.salesStage && pipelineConfig.salesStages.includes(opportunity.salesStage) ? opportunity.salesStage : "N/A";
}

function getOpportunityForecastLabel(opportunity) {
  return opportunity.forecastCategory && pipelineConfig.forecastCategories.includes(opportunity.forecastCategory) ? opportunity.forecastCategory : "N/A";
}

const WIN_LOSS_REASONS = ["Price", "Timing", "Competitor", "No budget", "Went quiet", "Other"];
const OPPORTUNITY_STALLED_DAYS = 14;
const OPPORTUNITY_AUTO_ARCHIVE_DAYS = 30;

function isOpportunityArchived(opportunity) {
  if (opportunity.archivedAtRaw) return true;
  // Only Lost deals auto-archive by time — nothing further happens to them.
  // Won deals archive only when explicitly promoted to a Project (or manually), never on a timer.
  if (opportunity.status === "Lost" && opportunity.closedAtRaw && typeof opportunity.closedAtRaw.toDate === "function") {
    const daysSinceClosed = Math.floor((Date.now() - opportunity.closedAtRaw.toDate().getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceClosed >= OPPORTUNITY_AUTO_ARCHIVE_DAYS;
  }
  return false;
}

async function toggleOpportunityArchive(opportunity) {
  const archiving = !isOpportunityArchived(opportunity);
  try {
    await firebase.firestore().collection("opportunities").doc(opportunity.id).set({
      archivedAt: archiving ? firebase.firestore.FieldValue.serverTimestamp() : null,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    logAuditEvent(archiving ? "archived" : "reactivated", "opportunity", opportunity.name);
  } catch (error) {
    console.error("Could not update opportunity archive state", error);
    alert("Could not update this opportunity. Please try again.");
  }
}

function getOpportunityStalledFlag(opportunity) {
  if (opportunity.status !== "Open") return null;
  if (!opportunity.updatedAtRaw || typeof opportunity.updatedAtRaw.toDate !== "function") return null;
  const daysSince = Math.floor((Date.now() - opportunity.updatedAtRaw.toDate().getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince >= OPPORTUNITY_STALLED_DAYS) return `No activity in ${daysSince} days`;
  return null;
}

function populateOpportunityStageSelect() {
  const select = document.getElementById("deal-sales-stage");
  if (!select) return;
  const selected = select.value;
  select.innerHTML = pipelineConfig.salesStages.map((stage) => `<option value="${escapeHtml(stage)}">${escapeHtml(stage)}</option>`).join("");
  if (pipelineConfig.salesStages.includes(selected)) select.value = selected;
}

function populateOpportunityForecastSelect() {
  const select = document.getElementById("deal-forecast-category");
  if (!select) return;
  const selected = select.value;
  select.innerHTML = pipelineConfig.forecastCategories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
  if (pipelineConfig.forecastCategories.includes(selected)) select.value = selected;
}

function normaliseOpportunity(documentSnapshot) {
  const data = documentSnapshot.data() || {};
  return {
    id: documentSnapshot.id,
    name: data.name || "Unnamed opportunity",
    status: data.status || "Open",
    salesStage: data.salesStage || "",
    forecastCategory: data.forecastCategory || "",
    dealValue: Number(data.dealValue || 0),
    expectedCloseDate: data.expectedCloseDate || "",
    notes: data.notes || "",
    owner: data.owner || "Paul O’Brien",
    isNewCustomer: Boolean(data.isNewCustomer),
    customerId: data.customerId || "",
    customerName: data.customerName || "",
    isNewProject: Boolean(data.isNewProject),
    projectId: data.projectId || "",
    projectName: data.projectName || "",
    sourceLeadId: data.sourceLeadId || "",
    source: data.source || "",
    convertedProjectId: data.convertedProjectId || "",
    winLossReason: Array.isArray(data.winLossReason) ? data.winLossReason : (data.winLossReason ? [data.winLossReason] : []),
    winLossReasonNotes: data.winLossReasonNotes || "",
    regretWhatWentWrong: data.regretWhatWentWrong || "",
    regretNextTime: data.regretNextTime || "",
    lastUpdated: formatFirestoreDate(data.updatedAt || data.createdAt),
    updatedAtRaw: data.updatedAt || data.createdAt || null,
    closedAtRaw: data.closedAt || null,
    archivedAtRaw: data.archivedAt || null,
    commentsLog: normaliseRelationshipHistory({ relationshipHistory: data.commentsLog }),
    attachments: Array.isArray(data.attachments) ? data.attachments : [],
    actionItems: Array.isArray(data.actionItems) ? data.actionItems.map((item) => ({ id: item.id || generateActionItemId(), text: item.text || "", done: Boolean(item.done), assignee: item.assignee || "" })) : []
  };
}

function generateAttachmentId() {
  return `attach-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function addOpportunityLinkAttachment(opportunityId, label, url) {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return;
  const opportunity = opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) return;
  const entry = {
    id: generateAttachmentId(),
    type: "link",
    label: label.trim() || trimmedUrl,
    url: trimmedUrl,
    fileName: "",
    filePath: "",
    size: 0,
    contentType: "",
    addedBy: getCurrentAdminName(),
    addedAt: firebase.firestore.Timestamp.now()
  };
  try {
    await firebase.firestore().collection("opportunities").doc(opportunityId).set({
      attachments: [...opportunity.attachments, entry],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    logAuditEvent("updated", "opportunity", `${opportunity.name} (attachment added)`);
  } catch (error) {
    console.error("Could not add attachment", error);
    alert("Could not add this link. Please try again.");
  }
}

async function uploadOpportunityFileAttachment(opportunityId, file) {
  const opportunity = opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) return;
  const validationMessage = validateLibraryFile(file);
  if (validationMessage) {
    alert(validationMessage);
    return;
  }
  try {
    const filePath = `opportunities/${opportunityId}/${safeStorageName(file.name)}`;
    const fileRef = firebase.storage().ref(filePath);
    await new Promise((resolve, reject) => {
      const uploadTask = fileRef.put(file, { contentType: file.type || "application/octet-stream" });
      uploadTask.on("state_changed", () => {}, reject, resolve);
    });
    const downloadUrl = await fileRef.getDownloadURL();
    const entry = {
      id: generateAttachmentId(),
      type: "file",
      label: file.name,
      url: downloadUrl,
      fileName: file.name,
      filePath,
      size: file.size,
      contentType: file.type || "application/octet-stream",
      addedBy: getCurrentAdminName(),
      addedAt: firebase.firestore.Timestamp.now()
    };
    await firebase.firestore().collection("opportunities").doc(opportunityId).set({
      attachments: [...opportunity.attachments, entry],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    logAuditEvent("updated", "opportunity", `${opportunity.name} (attachment added)`);
  } catch (error) {
    console.error("Could not upload attachment", error);
    alert("Could not upload this file. Please try again.");
  }
}

async function deleteOpportunityAttachment(opportunityId, attachmentId) {
  const opportunity = opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) return;
  const attachment = opportunity.attachments.find((item) => item.id === attachmentId);
  if (!attachment) return;
  if (!confirm(`Remove "${attachment.label}"?`)) return;
  try {
    if (attachment.type === "file" && attachment.filePath) {
      try { await firebase.storage().ref(attachment.filePath).delete(); } catch (error) { console.error("Could not delete stored file", error); }
    }
    await firebase.firestore().collection("opportunities").doc(opportunityId).set({
      attachments: opportunity.attachments.filter((item) => item.id !== attachmentId),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    logAuditEvent("updated", "opportunity", `${opportunity.name} (attachment removed)`);
  } catch (error) {
    console.error("Could not remove attachment", error);
    alert("Could not remove this attachment. Please try again.");
  }
}

function renderDealAttachmentsList() {
  const list = document.getElementById("deal-attachments-list");
  if (!list) return;

  if (editingOpportunityId) {
    const opportunity = opportunities.find((item) => item.id === editingOpportunityId);
    const attachments = opportunity ? opportunity.attachments : [];
    list.innerHTML = attachments.length
      ? attachments.slice().reverse().map((entry) => `
        <div class="attachment-item">
          <span class="attachment-icon">${entry.type === "file" ? "📎" : "🔗"}</span>
          <div class="attachment-body">
            <a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(entry.label)}</a>
            <span class="table-subtext">${entry.type === "file" ? `${formatBytes(entry.size)} · ` : ""}Added by ${escapeHtml(entry.addedBy)}${entry.addedAt ? ` · ${escapeHtml(formatFirestoreDateTime(entry.addedAt))}` : ""}</span>
          </div>
          <button class="icon-button compact" type="button" data-deal-remove-attachment="${entry.id}" aria-label="Remove attachment">×</button>
        </div>
      `).join("")
      : `<p class="muted">No attachments yet.</p>`;

    list.querySelectorAll("[data-deal-remove-attachment]").forEach((button) => {
      button.addEventListener("click", () => {
        deleteOpportunityAttachment(editingOpportunityId, button.dataset.dealRemoveAttachment).then(renderDealAttachmentsList);
      });
    });
  } else {
    list.innerHTML = stagedNewOpportunityAttachments.length
      ? stagedNewOpportunityAttachments.map((entry, index) => `
        <div class="attachment-item">
          <span class="attachment-icon">${entry.type === "file" ? "📎" : "🔗"}</span>
          <div class="attachment-body">
            <span>${escapeHtml(entry.label)}</span>
            <span class="table-subtext">${entry.type === "file" ? `${formatBytes(entry.file.size)} · will upload on save` : "will save with this opportunity"}</span>
          </div>
          <button class="icon-button compact" type="button" data-deal-remove-staged-attachment="${index}" aria-label="Remove attachment">×</button>
        </div>
      `).join("")
      : `<p class="muted">No attachments yet.</p>`;

    list.querySelectorAll("[data-deal-remove-staged-attachment]").forEach((button) => {
      button.addEventListener("click", () => {
        stagedNewOpportunityAttachments.splice(Number(button.dataset.dealRemoveStagedAttachment), 1);
        renderDealAttachmentsList();
      });
    });
  }
}

function setupDealAttachmentControls() {
  document.getElementById("deal-add-attachment-link")?.addEventListener("click", () => {
    const labelInput = document.getElementById("deal-attachment-label-input");
    const urlInput = document.getElementById("deal-attachment-url-input");
    const url = urlInput ? urlInput.value.trim() : "";
    if (!url) return;
    const label = (labelInput ? labelInput.value.trim() : "") || url;
    if (editingOpportunityId) {
      addOpportunityLinkAttachment(editingOpportunityId, label, url).then(renderDealAttachmentsList);
    } else {
      stagedNewOpportunityAttachments.push({ type: "link", label, url });
      renderDealAttachmentsList();
    }
    if (labelInput) labelInput.value = "";
    if (urlInput) urlInput.value = "";
  });

  document.getElementById("deal-attachment-file-input")?.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (editingOpportunityId) {
      uploadOpportunityFileAttachment(editingOpportunityId, file).then(renderDealAttachmentsList);
    } else {
      const validationMessage = validateLibraryFile(file);
      if (validationMessage) {
        alert(validationMessage);
      } else {
        stagedNewOpportunityAttachments.push({ type: "file", label: file.name, file });
        renderDealAttachmentsList();
      }
    }
    event.target.value = "";
  });
}

async function addOpportunityComment(opportunityId, text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const opportunity = opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) return;
  const author = getCurrentAdminName();
  const newEntry = {
    id: generateCommentId(),
    text: trimmed,
    author,
    createdAt: firebase.firestore.Timestamp.now(),
    updatedAt: null
  };
  const rawLog = opportunity.commentsLog.map((entry) => ({
    id: entry.id, text: entry.text, author: entry.author, createdAt: entry.createdAt, updatedAt: entry.updatedAt
  }));
  const updatedLog = [...rawLog, newEntry];
  try {
    await firebase.firestore().collection("opportunities").doc(opportunityId).set({
      commentsLog: updatedLog,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    logAuditEvent("commented", "opportunity", opportunity.name);
  } catch (error) {
    console.error("Could not add comment", error);
    alert("Could not add this comment. Please try again.");
  }
}

async function saveOpportunityCommentEdit(opportunityId, commentId, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return;
  const opportunity = opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) return;
  const updatedLog = opportunity.commentsLog.map((entry) => entry.id === commentId
    ? { id: entry.id, text: trimmed, author: entry.author, createdAt: entry.createdAt, updatedAt: firebase.firestore.Timestamp.now() }
    : { id: entry.id, text: entry.text, author: entry.author, createdAt: entry.createdAt, updatedAt: entry.updatedAt });
  try {
    await firebase.firestore().collection("opportunities").doc(opportunityId).set({
      commentsLog: updatedLog,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    editingOpportunityCommentId = null;
    logAuditEvent("updated", "opportunity", `${opportunity.name} (comment)`);
  } catch (error) {
    console.error("Could not save comment edit", error);
    alert("Could not save this edit. Please try again.");
  }
}

function loadLiveOpportunities() {
  if (unsubscribeOpportunities) unsubscribeOpportunities();
  const summary = document.getElementById("opportunity-summary");
  if (summary) summary.textContent = "Loading opportunities…";

  unsubscribeOpportunities = firebase.firestore().collection("opportunities").orderBy("name").onSnapshot((snapshot) => {
    opportunities = snapshot.docs.map(normaliseOpportunity);
    selectedOpportunityId = opportunities.some((o) => o.id === selectedOpportunityId) ? selectedOpportunityId : null;
    renderOpportunitiesTable();
    updateDashboardMetrics();
  }, (error) => {
    console.error("Could not load opportunities", error);
    opportunities = [];
    renderOpportunitiesTable();
    if (summary) summary.textContent = "Opportunities could not be loaded. Check Firestore access.";
  });
}

function populateOpportunityCustomerOptions() {
  const select = document.getElementById("deal-existing-customer");
  if (!select) return;
  const selected = select.value;
  select.innerHTML = '<option value="">Select a customer</option>' + customers
    .map((customer) => `<option value="${escapeHtml(customer.id)}">${escapeHtml(customer.company)}</option>`)
    .join("");
  if (customers.some((customer) => customer.id === selected)) select.value = selected;
}

function populateOpportunityProjectOptions(customerId) {
  const select = document.getElementById("deal-existing-project");
  if (!select) return;

  if (!customerId) {
    select.innerHTML = '<option value="">Select a customer first</option>';
    select.disabled = true;
    return;
  }

  const customerProjects = projects.filter((project) => project.customerId === customerId);
  if (customerProjects.length === 0) {
    select.innerHTML = '<option value="">No projects for this customer yet</option>';
    select.disabled = true;
    return;
  }

  select.innerHTML = '<option value="">Select a project</option>' + customerProjects
    .map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`)
    .join("");
  select.disabled = false;
}

function updateOpportunityCustomerMode() {
  const mode = document.getElementById("deal-customer-mode")?.value;
  const existingGroup = document.getElementById("deal-customer-existing-group");
  const newGroup = document.getElementById("deal-customer-new-group");
  const projectMode = document.getElementById("deal-project-mode");
  if (!mode || !existingGroup || !newGroup) return;

  const isNew = mode === "new";
  existingGroup.hidden = isNew;
  newGroup.hidden = !isNew;

  if (projectMode) {
    if (isNew) {
      projectMode.value = "new";
      projectMode.disabled = true;
    } else {
      projectMode.disabled = false;
    }
    updateOpportunityProjectMode();
  }
}

function updateOpportunityProjectMode() {
  const mode = document.getElementById("deal-project-mode")?.value;
  const existingGroup = document.getElementById("deal-project-existing-group");
  const newGroup = document.getElementById("deal-project-new-group");
  if (!mode || !existingGroup || !newGroup) return;
  const isNew = mode === "new";
  existingGroup.hidden = isNew;
  newGroup.hidden = !isNew;
}

const WON_REASONS = ["Best Fit", "Features", "Previous History", "Price", "Timing", "Reputation"];
const LOST_REASONS = ["Price", "Timing", "Competitor", "No budget", "Went quiet", "Other"];

function populateWinLossReasonOptions(status, selectedReasons) {
  const container = document.getElementById("deal-winloss-reason-options");
  if (!container) return;
  const options = status === "Won" ? WON_REASONS : LOST_REASONS;
  const selected = Array.isArray(selectedReasons) ? selectedReasons : [];
  container.innerHTML = options.map((reason) => `
    <label class="checkbox-option">
      <input type="checkbox" name="winLossReason" value="${escapeHtml(reason)}" ${selected.includes(reason) ? "checked" : ""}>
      <span>${escapeHtml(reason)}</span>
    </label>
  `).join("");
}

function updateOpportunityWinLossVisibility() {
  const status = document.getElementById("deal-status")?.value;
  const reasonGroup = document.getElementById("deal-winloss-reason-group");
  const notesGroup = document.getElementById("deal-winloss-notes-group");
  const isClosed = status === "Won" || status === "Lost";
  if (reasonGroup) reasonGroup.hidden = !isClosed;
  if (notesGroup) notesGroup.hidden = !isClosed;
  if (isClosed) populateWinLossReasonOptions(status, []);
}

function resetOpportunityDialogToCreateMode() {
  editingOpportunityId = null;
  document.getElementById("deal-form")?.reset();
  const title = document.getElementById("deal-dialog-title");
  const saveButton = document.getElementById("save-deal-button");
  if (title) title.textContent = "New Opportunity";
  if (saveButton) saveButton.textContent = "Create Opportunity";

  ["deal-customer-mode", "deal-existing-customer", "deal-new-customer-name", "deal-project-mode", "deal-existing-project", "deal-new-project-name"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.disabled = false;
  });

  populateOpportunityCustomerOptions();
  populateOpportunityStageSelect();
  populateOpportunityForecastSelect();
  populateOwnerSelect("deal-owner");
  updateOpportunityCustomerMode();
  updateOpportunityWinLossVisibility();
  stagedNewOpportunityAttachments = [];
  renderDealAttachmentsList();

  const actionsSection = document.getElementById("deal-dialog-actions-section");
  if (actionsSection) {
    actionsSection.hidden = true;
    actionsSection.innerHTML = "";
  }
}

function openOpportunityDialogForEdit(opportunity) {
  const dialog = document.getElementById("deal-dialog");
  const form = document.getElementById("deal-form");
  const title = document.getElementById("deal-dialog-title");
  const saveButton = document.getElementById("save-deal-button");
  if (!dialog || !form) return;

  editingOpportunityId = opportunity.id;
  form.elements.namedItem("name").value = opportunity.name;
  form.elements.namedItem("dealValue").value = opportunity.dealValue || "";
  form.elements.namedItem("expectedCloseDate").value = opportunity.expectedCloseDate || "";
  form.elements.namedItem("status").value = opportunity.status;
  form.elements.namedItem("notes").value = opportunity.notes;
  if (opportunity.source) form.elements.namedItem("source").value = opportunity.source;
  populateOwnerSelect("deal-owner", opportunity.owner);
  form.elements.namedItem("winLossReasonNotes").value = opportunity.winLossReasonNotes || "";
  updateOpportunityWinLossVisibility();
  if (opportunity.status === "Won" || opportunity.status === "Lost") {
    populateWinLossReasonOptions(opportunity.status, opportunity.winLossReason);
  }

  populateOpportunityStageSelect();
  populateOpportunityForecastSelect();
  form.elements.namedItem("salesStage").value = opportunity.salesStage;
  form.elements.namedItem("forecastCategory").value = opportunity.forecastCategory;

  document.getElementById("deal-customer-mode").value = opportunity.isNewCustomer ? "new" : "existing";
  populateOpportunityCustomerOptions();
  if (!opportunity.isNewCustomer) document.getElementById("deal-existing-customer").value = opportunity.customerId;
  document.getElementById("deal-new-customer-name").value = opportunity.isNewCustomer ? opportunity.customerName : "";
  updateOpportunityCustomerMode();

  document.getElementById("deal-project-mode").value = opportunity.isNewProject ? "new" : "existing";
  if (!opportunity.isNewProject) {
    populateOpportunityProjectOptions(opportunity.customerId);
    document.getElementById("deal-existing-project").value = opportunity.projectId;
  }
  document.getElementById("deal-new-project-name").value = opportunity.isNewProject ? opportunity.projectName : "";
  updateOpportunityProjectMode();

  // The customer/project an opportunity points to is locked once created, same rationale as Leads.
  ["deal-customer-mode", "deal-existing-customer", "deal-new-customer-name", "deal-project-mode", "deal-existing-project", "deal-new-project-name"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.disabled = true;
  });

  if (title) title.textContent = "Edit Opportunity";
  if (saveButton) saveButton.textContent = "Save Changes";
  renderDealAttachmentsList();

  const actionsSection = document.getElementById("deal-dialog-actions-section");
  if (actionsSection) {
    actionsSection.hidden = false;
    actionsSection.innerHTML = getActionItemsMarkup("opportunity", opportunity.id, opportunity.actionItems || []);
    wireActionItemControls(actionsSection);
  }

  dialog.showModal();
}

async function createOpportunity(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const saveButton = document.getElementById("save-deal-button");
  const message = document.getElementById("deal-form-message");
  const formData = new FormData(form);

  const name = String(formData.get("name") || "").trim();
  const dealValue = Number(formData.get("dealValue")) || 0;
  const expectedCloseDate = String(formData.get("expectedCloseDate") || "").trim();
  const salesStage = formData.get("salesStage") || pipelineConfig.salesStages[0] || "";
  const forecastCategory = formData.get("forecastCategory") || pipelineConfig.forecastCategories[0] || "";
  const status = formData.get("status") || "Open";
  const notes = String(formData.get("notes") || "").trim();
  const source = formData.get("source") || "";
  const owner = String(formData.get("owner") || "").trim() || getCurrentAdminName();
  const isClosed = status === "Won" || status === "Lost";
  const winLossReason = isClosed ? formData.getAll("winLossReason") : [];
  const winLossReasonNotes = isClosed ? String(formData.get("winLossReasonNotes") || "").trim() : "";

  if (!name) { message.textContent = "Enter an opportunity name."; return; }
  if (!dealValue) { message.textContent = "Enter a deal value."; return; }
  if (!expectedCloseDate) { message.textContent = "Enter an expected close date."; return; }

  if (!editingOpportunityId && !confirmIfSimilarNameExists(name, getKnownProspectNames(), "this opportunity")) return;

  saveButton.disabled = true;

  try {
    const now = firebase.firestore.FieldValue.serverTimestamp();

    if (editingOpportunityId) {
      message.textContent = "Saving changes…";
      const previousOpportunity = opportunities.find((item) => item.id === editingOpportunityId);
      const wasClosed = previousOpportunity && (previousOpportunity.status === "Won" || previousOpportunity.status === "Lost");
      const closedAtUpdate = isClosed && !wasClosed ? { closedAt: now } : (!isClosed && wasClosed ? { closedAt: null, archivedAt: null } : {});
      await firebase.firestore().collection("opportunities").doc(editingOpportunityId).set({
        name, dealValue, expectedCloseDate, salesStage, forecastCategory, status, notes, source, owner, winLossReason, winLossReasonNotes,
        ...closedAtUpdate,
        updatedAt: now
      }, { merge: true });
      message.textContent = "Changes saved.";
      logAuditEvent("updated", "opportunity", name);
    } else {
      const customerMode = formData.get("customerMode");
      const isNewCustomer = customerMode === "new";
      const projectMode = formData.get("projectMode");
      const isNewProject = isNewCustomer || projectMode === "new";

      let customerId = "";
      let customerName = "";
      if (isNewCustomer) {
        customerName = String(formData.get("newCustomerName") || "").trim();
        if (!customerName) {
          message.textContent = "Enter the prospective customer's name.";
          saveButton.disabled = false;
          return;
        }
      } else {
        customerId = String(formData.get("existingCustomerId") || "").trim();
        const customer = customers.find((item) => item.id === customerId);
        if (!customer) {
          message.textContent = "Select a customer, or switch to “New (prospective) customer”.";
          saveButton.disabled = false;
          return;
        }
        customerName = customer.company;
      }

      let projectId = "";
      let projectName = "";
      if (isNewProject) {
        projectName = String(formData.get("newProjectName") || "").trim();
        if (!projectName) {
          message.textContent = "Enter the prospective project/deal name.";
          saveButton.disabled = false;
          return;
        }
      } else {
        projectId = String(formData.get("existingProjectId") || "").trim();
        const project = projects.find((item) => item.id === projectId);
        if (!project) {
          message.textContent = "Select a project, or switch to “New (prospective) project”.";
          saveButton.disabled = false;
          return;
        }
        projectName = project.name;
      }

      // A standalone Opportunity has no originating Lead, so this is where its Customer record gets created.
      if (isNewCustomer) {
        message.textContent = "Creating customer record…";
        const customerRef = await firebase.firestore().collection("customers").add({
          company: customerName,
          status: "Trial",
          notes: `Created from opportunity: ${name}`,
          owner,
          projects: 0,
          users: 0,
          uploadStorageUsedBytes: 0,
          createdAt: now,
          updatedAt: now
        });
        customerId = customerRef.id;
      }

      const opportunityRef = firebase.firestore().collection("opportunities").doc();
      const finalizedAttachments = [];
      for (const staged of stagedNewOpportunityAttachments) {
        if (staged.type === "link") {
          finalizedAttachments.push({
            id: generateAttachmentId(), type: "link", label: staged.label, url: staged.url,
            fileName: "", filePath: "", size: 0, contentType: "",
            addedBy: owner, addedAt: firebase.firestore.Timestamp.now()
          });
        } else {
          message.textContent = `Uploading ${staged.file.name}…`;
          const filePath = `opportunities/${opportunityRef.id}/${safeStorageName(staged.file.name)}`;
          const fileRef = firebase.storage().ref(filePath);
          await new Promise((resolve, reject) => {
            const uploadTask = fileRef.put(staged.file, { contentType: staged.file.type || "application/octet-stream" });
            uploadTask.on("state_changed", () => {}, reject, resolve);
          });
          const downloadUrl = await fileRef.getDownloadURL();
          finalizedAttachments.push({
            id: generateAttachmentId(), type: "file", label: staged.file.name, url: downloadUrl,
            fileName: staged.file.name, filePath, size: staged.file.size, contentType: staged.file.type || "application/octet-stream",
            addedBy: owner, addedAt: firebase.firestore.Timestamp.now()
          });
        }
      }

      message.textContent = "Saving opportunity…";
      await opportunityRef.set({
        name, dealValue, expectedCloseDate, salesStage, forecastCategory, status, notes, source, winLossReason, winLossReasonNotes,
        isNewCustomer, customerId, customerName,
        isNewProject, projectId, projectName,
        sourceLeadId: "",
        convertedProjectId: "",
        owner,
        closedAt: isClosed ? now : null,
        attachments: finalizedAttachments,
        createdAt: now,
        updatedAt: now
      });
      stagedNewOpportunityAttachments = [];
      message.textContent = "Opportunity created.";
      logAuditEvent("created", "opportunity", name);
    }

    setTimeout(() => {
      document.getElementById("deal-dialog")?.close();
      resetOpportunityDialogToCreateMode();
      message.textContent = "";
    }, 500);
  } catch (error) {
    console.error("Could not save opportunity", error);
    message.textContent = "Could not save the opportunity. Please try again.";
  } finally {
    saveButton.disabled = false;
  }
}

async function promoteOpportunity(opportunity) {
  if (opportunity.status !== "Won") {
    alert("Only an opportunity marked Won can be promoted to a Project.");
    return;
  }
  if (opportunity.convertedProjectId) {
    alert("This opportunity has already been promoted.");
    return;
  }
  if (!confirm(`Promote "${opportunity.name}"? This creates a real Project record.`)) return;

  try {
    const database = firebase.firestore();
    const now = firebase.firestore.FieldValue.serverTimestamp();
    let projectId = opportunity.projectId;

    if (opportunity.isNewProject) {
      const projectRef = database.collection("projects").doc();
      const customerRef = database.collection("customers").doc(opportunity.customerId);
      await database.runTransaction(async (transaction) => {
        const customerSnapshot = await transaction.get(customerRef);
        const currentProjects = Number((customerSnapshot.data() || {}).projects || 0);
        transaction.set(projectRef, {
          name: opportunity.projectName || opportunity.name,
          customerId: opportunity.customerId,
          customerName: opportunity.customerName,
          status: "Planning",
          type: "Consulting",
          budgetHours: null,
          description: `Promoted from opportunity: ${opportunity.name}`,
          owner: opportunity.owner,
          resources: 0,
          createdAt: now,
          updatedAt: now
        });
        transaction.update(customerRef, { projects: currentProjects + 1, updatedAt: now });
      });
      projectId = projectRef.id;
    }

    await database.collection("opportunities").doc(opportunity.id).set({
      convertedProjectId: projectId,
      archivedAt: now,
      updatedAt: now
    }, { merge: true });

    alert("Opportunity promoted. The Project is now live, and the opportunity has been archived.");
    logAuditEvent("promoted", "opportunity", opportunity.name);
  } catch (error) {
    console.error("Could not promote opportunity", error);
    alert("This opportunity could not be promoted. Please try again.");
  }
}

async function saveOpportunityRegret(opportunityId, whatWentWrong, nextTime) {
  try {
    await firebase.firestore().collection("opportunities").doc(opportunityId).set({
      regretWhatWentWrong: whatWentWrong.trim(),
      regretNextTime: nextTime.trim(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    showingRegretFormFor = null;
    const opportunity = opportunities.find((item) => item.id === opportunityId);
    if (opportunity) logAuditEvent("updated", "opportunity", `${opportunity.name} (regret)`);
  } catch (error) {
    console.error("Could not save regret notes", error);
    alert("Could not save this. Please try again.");
  }
}

async function deleteOpportunity(opportunity) {
  if (!confirm(`Delete the opportunity "${opportunity.name}"? This cannot be undone. Any Project already promoted from it will not be affected.`)) return;
  try {
    await firebase.firestore().collection("opportunities").doc(opportunity.id).delete();
    if (selectedOpportunityId === opportunity.id) selectedOpportunityId = null;
    logAuditEvent("deleted", "opportunity", opportunity.name);
  } catch (error) {
    console.error("Could not delete opportunity", error);
    alert("This opportunity could not be deleted. Please try again.");
  }
}

function getFilteredOpportunities() {
  return opportunities.filter((opportunity) => {
    const matchesFilter = currentOpportunityStageFilter === "all" || getOpportunityStageLabel(opportunity) === currentOpportunityStageFilter;
    const matchesCustomer = !currentOpportunityCustomerFilter || opportunity.customerId === currentOpportunityCustomerFilter;
    const matchesArchived = currentOpportunityShowArchived || !isOpportunityArchived(opportunity);
    const matchesMine = !currentOpportunityMineOnly || opportunity.owner === getCurrentAdminName();
    const searchTarget = `${opportunity.name} ${opportunity.customerName} ${opportunity.projectName} ${opportunity.notes}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentOpportunitySearch.toLowerCase());
    return matchesFilter && matchesCustomer && matchesArchived && matchesMine && matchesSearch;
  });
}

function getOpportunityRegretMarkup(opportunity) {
  const hasRegret = opportunity.regretWhatWentWrong || opportunity.regretNextTime;
  if (showingRegretFormFor === opportunity.id) {
    return `
      <div class="regret-form">
        <p class="eyebrow">Regret</p>
        <label class="full-width">What do you regret about how this went?
          <textarea class="full-width" rows="2" data-regret-field="whatWentWrong">${escapeHtml(opportunity.regretWhatWentWrong)}</textarea>
        </label>
        <label class="full-width">What would you do differently next time?
          <textarea class="full-width" rows="2" data-regret-field="nextTime">${escapeHtml(opportunity.regretNextTime)}</textarea>
        </label>
        <div class="comment-edit-actions">
          <button class="secondary-button compact" data-save-regret="${opportunity.id}">Save</button>
          <button class="secondary-button compact" data-cancel-regret>Cancel</button>
        </div>
      </div>
    `;
  }
  if (hasRegret) {
    return `
      <div class="regret-form">
        <p class="eyebrow">Regret</p>
        <p><strong>What went wrong:</strong> ${escapeHtml(opportunity.regretWhatWentWrong || "Not recorded.")}</p>
        <p><strong>Next time:</strong> ${escapeHtml(opportunity.regretNextTime || "Not recorded.")}</p>
        <button class="secondary-button compact" data-open-regret="${opportunity.id}">Edit</button>
      </div>
    `;
  }
  return `<button class="secondary-button" data-open-regret="${opportunity.id}">📝 Add Regret</button>`;
}

function getOpportunityDetailMarkup(opportunity) {
  const canPromote = opportunity.status === "Won" && !opportunity.convertedProjectId;
  const alreadyPromoted = Boolean(opportunity.convertedProjectId);
  const stalledFlag = getOpportunityStalledFlag(opportunity);
  const isClosed = opportunity.status === "Won" || opportunity.status === "Lost";
  const archived = isOpportunityArchived(opportunity);
  const currentAdminName = getCurrentAdminName();
  return `
    <div class="detail-panel inline-detail-panel opportunity-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Opportunity record</p>
          <h3>${escapeHtml(opportunity.name)}</h3>
        </div>
        <div class="detail-header-actions">
          <button class="secondary-button compact" data-edit-opportunity="${opportunity.id}">Edit opportunity</button>
          ${archived ? `<span class="badge inline-badge">Archived</span>` : ""}
          <span class="status ${getStatusClass(opportunity.status)}">${escapeHtml(opportunity.status)}</span>
          <button class="icon-button" data-close-opportunity-detail aria-label="Close opportunity detail">×</button>
        </div>
      </div>
      <p class="where-left-note">🧭 ${escapeHtml(getWhereDidWeLeaveThisSummary("opportunity", opportunity))}</p>
      <div class="detail-grid">
        <div><span>Customer</span><strong>${escapeHtml(opportunity.customerName)}${opportunity.isNewCustomer ? " (prospective)" : ""}</strong></div>
        <div><span>Project/Deal</span><strong>${escapeHtml(opportunity.projectName)}${opportunity.isNewProject ? " (prospective)" : ""}</strong></div>
        <div><span>Deal value</span><strong>${formatCurrency(opportunity.dealValue)}</strong></div>
        <div><span>Expected close date</span><strong>${escapeHtml(opportunity.expectedCloseDate ? formatDateUK(opportunity.expectedCloseDate) : "N/A")}</strong></div>
        <div><span>Sales stage</span><strong>${escapeHtml(getOpportunityStageLabel(opportunity))}</strong></div>
        <div><span>Forecast category</span><strong>${escapeHtml(getOpportunityForecastLabel(opportunity))}</strong></div>
        <div><span>Source</span><strong>${escapeHtml(opportunity.source || "Not set")}</strong></div>
        <div><span>Owner</span><strong>${escapeHtml(opportunity.owner)}</strong></div>
        <div><span>Last updated</span><strong>${escapeHtml(opportunity.lastUpdated)}</strong></div>
        <div><span>Promoted</span><strong>${alreadyPromoted ? "Yes" : "Not yet"}</strong></div>
      </div>
      ${stalledFlag ? `<p class="health-flag-note">⚠ ${escapeHtml(stalledFlag)}</p>` : ""}
      ${opportunity.status !== "Open" && opportunity.winLossReason.length ? `<div class="opportunity-notes-section"><p class="eyebrow">${escapeHtml(opportunity.status)} reason</p><p>${escapeHtml(opportunity.winLossReason.join(", "))}${opportunity.winLossReasonNotes ? ` — ${escapeHtml(opportunity.winLossReasonNotes)}` : ""}</p></div>` : ""}
      ${opportunity.status === "Lost" ? getOpportunityRegretMarkup(opportunity) : ""}
      <div class="opportunity-notes-section">
        <p class="eyebrow">Notes</p>
        <p>${escapeHtml(opportunity.notes || "No notes added.")}</p>
      </div>
      <p class="eyebrow">Attachments (${opportunity.attachments.length})</p>
      <div class="attachment-form">
        <input type="text" class="full-width" data-attachment-label-input="${opportunity.id}" placeholder="Label (optional)" />
        <input type="url" class="full-width" data-attachment-url-input="${opportunity.id}" placeholder="https://..." />
        <button class="secondary-button compact" data-add-opportunity-link="${opportunity.id}">Add link</button>
        <label class="secondary-button compact attachment-upload-label">
          Upload file
          <input type="file" hidden data-attachment-file-input="${opportunity.id}" />
        </label>
      </div>
      <div class="attachment-list">
        ${opportunity.attachments.length
          ? opportunity.attachments.slice().reverse().map((entry) => `
            <div class="attachment-item">
              <span class="attachment-icon">${entry.type === "file" ? "📎" : "🔗"}</span>
              <div class="attachment-body">
                <a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(entry.label)}</a>
                <span class="table-subtext">${entry.type === "file" ? `${formatBytes(entry.size)} · ` : ""}Added by ${escapeHtml(entry.addedBy)}${entry.addedAt ? ` · ${escapeHtml(formatFirestoreDateTime(entry.addedAt))}` : ""}</span>
              </div>
              <button class="icon-button compact" data-delete-opportunity-attachment="${opportunity.id}-${entry.id}" aria-label="Remove attachment">×</button>
            </div>
          `).join("")
          : `<p class="muted">No attachments yet.</p>`}
      </div>
      <p class="eyebrow">Working Notes (${opportunity.commentsLog.length})</p>
      <div class="comment-form">
        <textarea class="full-width" rows="2" data-opportunity-comment-input="${opportunity.id}" placeholder="Add an update as you work this deal..."></textarea>
        <button class="secondary-button compact" data-add-opportunity-comment="${opportunity.id}">Add working note</button>
      </div>
      <div class="comment-list">
        ${opportunity.commentsLog.length
          ? opportunity.commentsLog.slice().reverse().map((entry) => `
            <div class="comment-item">
              <div class="comment-meta">
                <strong>${escapeHtml(entry.author)}</strong>
                <span class="table-subtext">${escapeHtml(entry.createdAtDisplay)}${entry.updatedAt ? " (edited)" : ""}</span>
                ${entry.author === currentAdminName ? `<button class="icon-button compact" data-edit-opportunity-comment="${opportunity.id}-${entry.id}" aria-label="Edit comment">✎</button>` : ""}
              </div>
              ${entry.id === editingOpportunityCommentId ? `
                <textarea class="full-width" rows="2" data-edit-opportunity-comment-input="${entry.id}">${escapeHtml(entry.text)}</textarea>
                <div class="comment-edit-actions">
                  <button class="secondary-button compact" data-save-opportunity-comment-edit="${opportunity.id}-${entry.id}">Save</button>
                  <button class="secondary-button compact" data-cancel-opportunity-comment-edit>Cancel</button>
                </div>
              ` : `<p class="comment-text">${escapeHtml(entry.text)}</p>`}
            </div>
          `).join("")
          : `<p class="muted">No working notes yet.</p>`}
      </div>
      ${getActionItemsMarkup("opportunity", opportunity.id, opportunity.actionItems)}
      <div class="detail-actions">
        <button class="secondary-button" data-edit-opportunity="${opportunity.id}">Edit opportunity</button>
        <button class="secondary-button" data-promote-opportunity="${opportunity.id}" ${canPromote ? "" : "disabled"}>
          ${alreadyPromoted ? "Already promoted" : "Promote to Project"}
        </button>
        ${isClosed ? `<button class="secondary-button" data-toggle-opportunity-archive="${opportunity.id}">${archived ? "Reactivate opportunity" : "Archive opportunity"}</button>` : ""}
        <button class="secondary-button danger-button" data-delete-opportunity="${opportunity.id}">Delete opportunity</button>
      </div>
    </div>
  `;
}

function renderOpportunitiesTable() {
  const tableBody = document.getElementById("opportunities-table");
  const summary = document.getElementById("opportunity-summary");
  if (!tableBody || !summary) return;

  const filtered = getFilteredOpportunities();
  tableBody.innerHTML = "";

  if (filtered.length === 0) {
    tableBody.innerHTML = opportunities.length === 0
      ? `<tr><td colspan="7" class="empty-table">No opportunities yet — click "+ New Opportunity" above, or promote a Qualified lead.</td></tr>`
      : `<tr><td colspan="7" class="empty-table">No opportunities match your search.</td></tr>`;
  } else {
    filtered.forEach((opportunity) => {
      const row = document.createElement("tr");
      const stalledFlag = getOpportunityStalledFlag(opportunity);
      row.innerHTML = `
        <td><button class="row-link" data-opportunity-id="${opportunity.id}"><strong>${escapeHtml(opportunity.name)}</strong>${stalledFlag ? ` <span class="badge inline-badge health-flag" title="${escapeHtml(stalledFlag)}">Stalled</span>` : ""}</button></td>
        <td>${escapeHtml(opportunity.customerName)}${opportunity.isNewCustomer ? ' <span class="table-subtext">(prospective)</span>' : ""}</td>
        <td><select class="status-select" data-opportunity-stage-select="${opportunity.id}">${getOpportunityStageLabel(opportunity) === "N/A" ? `<option value="" disabled selected>N/A</option>` : ""}${pipelineConfig.salesStages.map((stage) => `<option value="${escapeHtml(stage)}" ${stage === opportunity.salesStage ? "selected" : ""}>${escapeHtml(stage)}</option>`).join("")}</select></td>
        <td>${escapeHtml(getOpportunityForecastLabel(opportunity))}</td>
        <td><span class="status ${getStatusClass(opportunity.status)}">${escapeHtml(opportunity.status)}</span></td>
        <td>${formatCurrency(opportunity.dealValue)}</td>
        <td>${escapeHtml(opportunity.expectedCloseDate ? formatDateUK(opportunity.expectedCloseDate) : "N/A")}</td>
      `;
      tableBody.appendChild(row);

      if (selectedOpportunityId === opportunity.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="7">${getOpportunityDetailMarkup(opportunity)}</td>`;
        tableBody.appendChild(detailRow);
      }
    });
  }

  summary.textContent = `Showing ${filtered.length} of ${opportunities.length} opportunities`;
  wireActionItemControls(tableBody);

  document.querySelectorAll("[data-opportunity-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const opening = selectedOpportunityId !== button.dataset.opportunityId;
      selectedOpportunityId = opening ? button.dataset.opportunityId : null;
      renderOpportunitiesTable();
      if (opening) {
        const opportunity = opportunities.find((item) => item.id === button.dataset.opportunityId);
        if (opportunity) recordRecentlyViewed("opportunity", opportunity.id, opportunity.name);
      }
    });
  });

  document.querySelectorAll("[data-close-opportunity-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedOpportunityId = null;
      renderOpportunitiesTable();
    });
  });

  document.querySelectorAll("[data-edit-opportunity]").forEach((button) => {
    button.addEventListener("click", () => {
      const opportunity = opportunities.find((item) => item.id === button.dataset.editOpportunity);
      if (opportunity) openOpportunityDialogForEdit(opportunity);
    });
  });

  document.querySelectorAll("[data-promote-opportunity]").forEach((button) => {
    button.addEventListener("click", () => {
      const opportunity = opportunities.find((item) => item.id === button.dataset.promoteOpportunity);
      if (opportunity) promoteOpportunity(opportunity);
    });
  });

  document.querySelectorAll("[data-delete-opportunity]").forEach((button) => {
    button.addEventListener("click", () => {
      const opportunity = opportunities.find((item) => item.id === button.dataset.deleteOpportunity);
      if (opportunity) deleteOpportunity(opportunity);
    });
  });

  document.querySelectorAll("[data-toggle-opportunity-archive]").forEach((button) => {
    button.addEventListener("click", () => {
      const opportunity = opportunities.find((item) => item.id === button.dataset.toggleOpportunityArchive);
      if (opportunity) toggleOpportunityArchive(opportunity);
    });
  });

  document.querySelectorAll("[data-add-opportunity-comment]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(`[data-opportunity-comment-input="${button.dataset.addOpportunityComment}"]`);
      if (input && input.value.trim()) addOpportunityComment(button.dataset.addOpportunityComment, input.value);
    });
  });

  document.querySelectorAll("[data-edit-opportunity-comment]").forEach((button) => {
    button.addEventListener("click", () => {
      const dashIndex = button.dataset.editOpportunityComment.indexOf("-");
      const commentId = button.dataset.editOpportunityComment.slice(dashIndex + 1);
      editingOpportunityCommentId = commentId;
      renderOpportunitiesTable();
    });
  });

  document.querySelectorAll("[data-save-opportunity-comment-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const dashIndex = button.dataset.saveOpportunityCommentEdit.indexOf("-");
      const opportunityId = button.dataset.saveOpportunityCommentEdit.slice(0, dashIndex);
      const commentId = button.dataset.saveOpportunityCommentEdit.slice(dashIndex + 1);
      const input = document.querySelector(`[data-edit-opportunity-comment-input="${commentId}"]`);
      if (input && input.value.trim()) saveOpportunityCommentEdit(opportunityId, commentId, input.value);
    });
  });

  document.querySelectorAll("[data-cancel-opportunity-comment-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      editingOpportunityCommentId = null;
      renderOpportunitiesTable();
    });
  });

  document.querySelectorAll("[data-add-opportunity-link]").forEach((button) => {
    button.addEventListener("click", () => {
      const opportunityId = button.dataset.addOpportunityLink;
      const labelInput = document.querySelector(`[data-attachment-label-input="${opportunityId}"]`);
      const urlInput = document.querySelector(`[data-attachment-url-input="${opportunityId}"]`);
      if (urlInput && urlInput.value.trim()) addOpportunityLinkAttachment(opportunityId, labelInput ? labelInput.value : "", urlInput.value);
    });
  });

  document.querySelectorAll("[data-attachment-file-input]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (file) uploadOpportunityFileAttachment(input.dataset.attachmentFileInput, file);
    });
  });

  document.querySelectorAll("[data-delete-opportunity-attachment]").forEach((button) => {
    button.addEventListener("click", () => {
      const dashIndex = button.dataset.deleteOpportunityAttachment.indexOf("-");
      const opportunityId = button.dataset.deleteOpportunityAttachment.slice(0, dashIndex);
      const attachmentId = button.dataset.deleteOpportunityAttachment.slice(dashIndex + 1);
      deleteOpportunityAttachment(opportunityId, attachmentId);
    });
  });

  document.querySelectorAll("[data-open-regret]").forEach((button) => {
    button.addEventListener("click", () => {
      showingRegretFormFor = button.dataset.openRegret;
      renderOpportunitiesTable();
    });
  });

  document.querySelectorAll("[data-cancel-regret]").forEach((button) => {
    button.addEventListener("click", () => {
      showingRegretFormFor = null;
      renderOpportunitiesTable();
    });
  });

  document.querySelectorAll("[data-save-regret]").forEach((button) => {
    button.addEventListener("click", () => {
      const opportunityId = button.dataset.saveRegret;
      const whatWentWrong = document.querySelector('[data-regret-field="whatWentWrong"]')?.value || "";
      const nextTime = document.querySelector('[data-regret-field="nextTime"]')?.value || "";
      saveOpportunityRegret(opportunityId, whatWentWrong, nextTime).then(() => renderOpportunitiesTable());
    });
  });

  document.querySelectorAll("[data-opportunity-stage-select]").forEach((select) => {
    select.addEventListener("click", (event) => event.stopPropagation());
    select.addEventListener("change", () => {
      updateOpportunityStageFromDrag(select.dataset.opportunityStageSelect, select.value);
    });
  });

  renderOpportunityKanban();
  updatePipelineValueWidget();
}

function setupOpportunityStageFilter() {
  const container = document.getElementById("opportunity-stage-filters");
  if (!container) return;
  container.innerHTML = '<button class="opportunity-filter-button filter-button active" data-opportunity-filter="all">All</button>' +
    pipelineConfig.salesStages.map((stage) => `<button class="opportunity-filter-button filter-button" data-opportunity-filter="${escapeHtml(stage)}">${escapeHtml(stage)}</button>`).join("");

  container.querySelectorAll(".opportunity-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      container.querySelectorAll(".opportunity-filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      currentOpportunityStageFilter = button.dataset.opportunityFilter;
      renderOpportunitiesTable();
      renderOpportunityKanban();
    });
  });
}

function getOpportunitiesForKanban() {
  return opportunities.filter((opportunity) => {
    const matchesFilter = currentOpportunityStageFilter === "all" || getOpportunityStageLabel(opportunity) === currentOpportunityStageFilter;
    const matchesCustomer = !currentOpportunityCustomerFilter || opportunity.customerId === currentOpportunityCustomerFilter;
    const matchesArchived = currentOpportunityShowArchived || !isOpportunityArchived(opportunity);
    const matchesMine = !currentOpportunityMineOnly || opportunity.owner === getCurrentAdminName();
    const searchTarget = `${opportunity.name} ${opportunity.customerName} ${opportunity.projectName} ${opportunity.notes}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentOpportunitySearch.toLowerCase());
    return matchesFilter && matchesCustomer && matchesArchived && matchesMine && matchesSearch;
  });
}

function applyOpportunityViewMode() {
  const tableCard = document.getElementById("opportunity-table-card");
  const kanban = document.getElementById("opportunity-kanban");
  const isKanban = opportunityViewMode === "kanban";
  if (tableCard) tableCard.hidden = isKanban;
  if (kanban) kanban.hidden = !isKanban;
  document.querySelectorAll(".opportunity-view-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.opportunityView === opportunityViewMode);
  });
}

function setupOpportunityViewToggle() {
  document.querySelectorAll(".opportunity-view-button").forEach((button) => {
    button.addEventListener("click", () => {
      opportunityViewMode = button.dataset.opportunityView;
      applyOpportunityViewMode();
      renderOpportunityKanban();
      try { localStorage.setItem("ba-console-opportunity-view", opportunityViewMode); } catch (error) { console.error("Could not save view preference", error); }
    });
  });
  applyOpportunityViewMode();
}

async function updateOpportunityStageFromDrag(opportunityId, newStage) {
  const opportunity = opportunities.find((item) => item.id === opportunityId);
  if (!opportunity || opportunity.salesStage === newStage) return;
  try {
    await firebase.firestore().collection("opportunities").doc(opportunityId).set({
      salesStage: newStage,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    logAuditEvent("updated", "opportunity", `${opportunity.name} → ${newStage}`);
  } catch (error) {
    console.error("Could not update opportunity stage", error);
    alert("Could not move this opportunity. Please try again.");
    renderOpportunityKanban();
  }
}

function renderOpportunityKanban() {
  const board = document.getElementById("opportunity-kanban");
  if (!board) return;

  const kanbanOpportunities = getOpportunitiesForKanban();

  board.innerHTML = pipelineConfig.salesStages.map((stage) => {
    const stageOpportunities = kanbanOpportunities.filter((opportunity) => getOpportunityStageLabel(opportunity) === stage);
    const stageValue = stageOpportunities.reduce((sum, opportunity) => sum + (opportunity.dealValue || 0), 0);
    return `
      <div class="kanban-column" data-kanban-stage="${escapeHtml(stage)}">
        <div class="kanban-column-header">
          <strong>${escapeHtml(stage)}</strong>
          <span class="table-subtext">${stageOpportunities.length} · ${formatCurrency(stageValue)}</span>
        </div>
        <div class="kanban-column-body" data-kanban-drop="${escapeHtml(stage)}">
          ${stageOpportunities.map((opportunity) => `
            <div class="kanban-card" draggable="true" data-kanban-card="${opportunity.id}">
              <strong>${escapeHtml(opportunity.name)}${getOpportunityStalledFlag(opportunity) ? ` <span class="badge inline-badge health-flag" title="${escapeHtml(getOpportunityStalledFlag(opportunity))}">Stalled</span>` : ""}${isOpportunityArchived(opportunity) ? ` <span class="badge inline-badge">Archived</span>` : ""}</strong>
              <span class="table-subtext">${escapeHtml(opportunity.customerName)}</span>
              <span class="status ${getStatusClass(opportunity.status)}">${escapeHtml(opportunity.status)}</span>
              <span>${formatCurrency(opportunity.dealValue)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");

  board.querySelectorAll("[data-kanban-card]").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", card.dataset.kanbanCard);
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    card.addEventListener("click", () => {
      const opportunity = opportunities.find((item) => item.id === card.dataset.kanbanCard);
      if (opportunity) openOpportunityDialogForEdit(opportunity);
    });
  });

  board.querySelectorAll("[data-kanban-drop]").forEach((column) => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      column.classList.add("drag-over");
    });
    column.addEventListener("dragleave", () => column.classList.remove("drag-over"));
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      column.classList.remove("drag-over");
      const opportunityId = event.dataTransfer.getData("text/plain");
      updateOpportunityStageFromDrag(opportunityId, column.dataset.kanbanDrop);
    });
  });
}

async function migrateBookingsToEvents() {
  const statusEl = document.getElementById("migrate-bookings-status");
  const button = document.getElementById("migrate-bookings-button");
  if (button) button.disabled = true;

  try {
    if (statusEl) statusEl.textContent = "Reading existing bookings…";
    const database = firebase.firestore();
    const bookingsSnapshot = await database.collection("bookings").get();
    const bookingDocs = bookingsSnapshot.docs.map(normaliseBooking);

    if (bookingDocs.length === 0) {
      if (statusEl) statusEl.textContent = "No bookings found to migrate.";
      return;
    }

    const allEventsSnapshot = await database.collection("events").get();
    const alreadyMigratedIds = new Set();
    allEventsSnapshot.docs.forEach((doc) => {
      const migratedId = doc.data().migratedFromBookingId;
      if (migratedId) alreadyMigratedIds.add(migratedId);
    });

    const bookingStatusToEventStatus = { Upcoming: "Scheduled", Completed: "Logged", Cancelled: "Cancelled" };
    const now = firebase.firestore.FieldValue.serverTimestamp();
    let migrated = 0;
    let skipped = 0;

    for (const booking of bookingDocs) {
      if (alreadyMigratedIds.has(booking.id)) { skipped += 1; continue; }
      statusEl && (statusEl.textContent = `Migrating… (${migrated + 1} of ${bookingDocs.length - skipped})`);
      await database.collection("events").add({
        title: booking.title,
        customerId: booking.customerId,
        customerName: booking.customer,
        projectId: "",
        projectName: "",
        type: booking.type,
        format: "Other",
        date: booking.date,
        startTime: booking.time,
        status: bookingStatusToEventStatus[booking.status] || "Scheduled",
        attendees: "",
        duration: null,
        keyItems: booking.notes,
        actionItems: [],
        internalOnly: false,
        owner: booking.owner,
        customerNotes: booking.customerNotes,
        migratedFromBookingId: booking.id,
        createdAt: now,
        updatedAt: now
      });
      migrated += 1;
    }

    logAuditEvent("migrated", "booking", `${migrated} booking(s) to Events`);
    if (statusEl) statusEl.textContent = `Done — ${migrated} booking(s) migrated to Events${skipped ? `, ${skipped} already migrated (skipped)` : ""}.`;
  } catch (error) {
    console.error("Could not migrate bookings", error);
    if (statusEl) statusEl.textContent = "Could not migrate bookings. Please try again.";
  } finally {
    if (button) button.disabled = false;
  }
}

function populateCustomerFilterSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const selected = select.value;
  select.innerHTML = '<option value="">All customers</option>' + customers
    .map((customer) => `<option value="${escapeHtml(customer.id)}">${escapeHtml(customer.company)}</option>`)
    .join("");
  if (customers.some((customer) => customer.id === selected)) select.value = selected;
}

function populateAllCustomerFilterSelects() {
  ["project-customer-filter", "event-customer-filter", "lead-customer-filter", "opportunity-customer-filter"].forEach(populateCustomerFilterSelect);
}

function setupCustomerFilterSelects() {
  document.getElementById("project-customer-filter")?.addEventListener("change", (event) => {
    currentProjectCustomerFilter = event.target.value;
    renderProjectTable();
  });
  document.getElementById("event-customer-filter")?.addEventListener("change", (event) => {
    currentEventCustomerFilter = event.target.value;
    renderEventTable();
  });
  document.getElementById("lead-customer-filter")?.addEventListener("change", (event) => {
    currentLeadCustomerFilter = event.target.value;
    renderLeadsTable();
  });
  document.getElementById("opportunity-customer-filter")?.addEventListener("change", (event) => {
    currentOpportunityCustomerFilter = event.target.value;
    renderOpportunitiesTable();
  });
}

function logAuditEvent(action, entityType, entityLabel) {
  firebase.firestore().collection("auditLog").add({
    action,
    entityType,
    entityLabel,
    adminName: getCurrentAdminName(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch((error) => console.error("Could not write audit log entry", error));
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsvField(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename, headers, rows) {
  const lines = [headers.map(escapeCsvField).join(",")]
    .concat(rows.map((row) => row.map(escapeCsvField).join(",")));
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportCustomersCsv() {
  const headers = ["Company", "Status", "Owner", "Website", "Phone", "Industry", "Company size", "Address", "Tags", "Notes"];
  const rows = getFilteredCustomers().map((customer) => [
    customer.company, customer.status, customer.owner, customer.website, customer.phone,
    customer.industry, customer.companySize, customer.address, customer.tags.join("; "), customer.notes
  ]);
  downloadCsv(`customers-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

function exportLeadsCsv() {
  const headers = ["Name", "Status", "Projected income", "Source", "Owner", "Customer", "Notes"];
  const rows = getFilteredLeads().map((lead) => [
    lead.name, lead.status, lead.projectedIncome, lead.source, lead.owner, lead.customerName, lead.notes
  ]);
  downloadCsv(`leads-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

function exportOpportunitiesCsv() {
  const headers = ["Name", "Customer", "Sales stage", "Forecast category", "Status", "Deal value", "Expected close", "Source", "Owner", "Notes"];
  const rows = getFilteredOpportunities().map((opportunity) => [
    opportunity.name, opportunity.customerName, getOpportunityStageLabel(opportunity), getOpportunityForecastLabel(opportunity),
    opportunity.status, opportunity.dealValue, opportunity.expectedCloseDate, opportunity.source, opportunity.owner, opportunity.notes
  ]);
  downloadCsv(`opportunities-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

function updateCustomerBulkBar() {
  const bar = document.getElementById("customer-bulk-bar");
  const count = document.getElementById("customer-bulk-count");
  if (!bar || !count) return;
  bar.hidden = bulkSelectedCustomerIds.size === 0;
  count.textContent = `${bulkSelectedCustomerIds.size} selected`;
}

function updateLeadBulkBar() {
  const bar = document.getElementById("lead-bulk-bar");
  const count = document.getElementById("lead-bulk-count");
  if (!bar || !count) return;
  bar.hidden = bulkSelectedLeadIds.size === 0;
  count.textContent = `${bulkSelectedLeadIds.size} selected`;
}

function setupBulkActionControls() {
  document.getElementById("customer-select-all")?.addEventListener("change", (event) => {
    const filtered = getFilteredCustomers();
    if (event.target.checked) filtered.forEach((c) => bulkSelectedCustomerIds.add(c.id));
    else filtered.forEach((c) => bulkSelectedCustomerIds.delete(c.id));
    renderCustomerTable();
  });

  document.getElementById("customer-bulk-clear")?.addEventListener("click", () => {
    bulkSelectedCustomerIds.clear();
    renderCustomerTable();
  });

  document.getElementById("customer-bulk-export")?.addEventListener("click", () => {
    const selected = customers.filter((c) => bulkSelectedCustomerIds.has(c.id));
    downloadJson(`customers-export-${new Date().toISOString().slice(0, 10)}.json`, selected);
  });

  document.getElementById("customer-bulk-archive")?.addEventListener("click", async () => {
    const selected = customers.filter((c) => bulkSelectedCustomerIds.has(c.id));
    if (!selected.length) return;
    if (!confirm(`Archive ${selected.length} customer${selected.length === 1 ? "" : "s"}?`)) return;
    try {
      const database = firebase.firestore();
      const batch = database.batch();
      selected.forEach((c) => {
        batch.set(database.collection("customers").doc(c.id), {
          status: "Archived",
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });
      await batch.commit();
      bulkSelectedCustomerIds.clear();
    } catch (error) {
      console.error("Could not archive selected customers", error);
      alert("Could not archive the selected customers. Please try again.");
    }
  });

  document.getElementById("lead-select-all")?.addEventListener("change", (event) => {
    const filtered = getFilteredLeads();
    if (event.target.checked) filtered.forEach((l) => bulkSelectedLeadIds.add(l.id));
    else filtered.forEach((l) => bulkSelectedLeadIds.delete(l.id));
    renderLeadsTable();
  });

  document.getElementById("lead-bulk-clear")?.addEventListener("click", () => {
    bulkSelectedLeadIds.clear();
    renderLeadsTable();
  });

  document.getElementById("lead-bulk-export")?.addEventListener("click", () => {
    const selected = leads.filter((l) => bulkSelectedLeadIds.has(l.id));
    downloadJson(`leads-export-${new Date().toISOString().slice(0, 10)}.json`, selected);
  });

  document.getElementById("lead-bulk-delete")?.addEventListener("click", async () => {
    const selected = leads.filter((l) => bulkSelectedLeadIds.has(l.id));
    if (!selected.length) return;
    if (!confirm(`Permanently delete ${selected.length} lead${selected.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    try {
      const database = firebase.firestore();
      const batch = database.batch();
      selected.forEach((l) => batch.delete(database.collection("leads").doc(l.id)));
      await batch.commit();
      bulkSelectedLeadIds.clear();
    } catch (error) {
      console.error("Could not delete selected leads", error);
      alert("Could not delete the selected leads. Please try again.");
    }
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

const LEAD_VALID_STATUSES = ["Open", "Qualified", "Disqualified"];

async function importLeadsFromCsv(file) {
  const status = document.getElementById("import-leads-csv-status");
  if (status) status.textContent = "Reading file…";

  try {
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length < 2) {
      if (status) status.textContent = "That CSV has no data rows to import.";
      return;
    }

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const nameIndex = headers.findIndex((h) => h === "name" || h === "lead" || h === "company");
    const statusIndex = headers.findIndex((h) => h === "status");
    const incomeIndex = headers.findIndex((h) => h === "projectedincome" || h === "projected income" || h === "income");
    const notesIndex = headers.findIndex((h) => h === "notes");

    if (nameIndex === -1) {
      if (status) status.textContent = `Couldn't find a "Name" column. Expected headers: Name, Status, Projected Income, Notes.`;
      return;
    }

    const dataRows = rows.slice(1);
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const database = firebase.firestore();
    const batch = database.batch();
    let imported = 0;

    dataRows.forEach((row) => {
      const name = (row[nameIndex] || "").trim();
      if (!name) return;
      const rawStatus = statusIndex !== -1 ? (row[statusIndex] || "").trim() : "";
      const matchedStatus = LEAD_VALID_STATUSES.find((s) => s.toLowerCase() === rawStatus.toLowerCase()) || "Open";
      const projectedIncome = incomeIndex !== -1 ? Number(String(row[incomeIndex] || "0").replace(/[^0-9.-]/g, "")) || 0 : 0;
      const notes = notesIndex !== -1 ? (row[notesIndex] || "").trim() : "";

      const docRef = database.collection("leads").doc();
      batch.set(docRef, {
        name,
        status: matchedStatus,
        projectedIncome,
        notes,
        owner: getCurrentAdminName(),
        isNewCustomer: true,
        customerId: "",
        customerName: "",
        isNewProject: true,
        projectId: "",
        projectName: "",
        convertedCustomerId: "",
        convertedProjectId: "",
        createdAt: now,
        updatedAt: now
      });
      imported++;
    });

    if (imported === 0) {
      if (status) status.textContent = "No valid rows found — check the Name column has values.";
      return;
    }

    if (status) status.textContent = `Importing ${imported} lead${imported === 1 ? "" : "s"}…`;
    await batch.commit();
    if (status) status.textContent = `Imported ${imported} lead${imported === 1 ? "" : "s"}.`;
  } catch (error) {
    console.error("Could not import leads CSV", error);
    if (status) status.textContent = "Could not import that file. Please check it's a valid CSV.";
  }
}

function setupLeadsCsvImport() {
  const button = document.getElementById("import-leads-csv-button");
  const input = document.getElementById("import-leads-csv-input");
  if (!button || !input) return;

  button.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (file) importLeadsFromCsv(file);
    input.value = "";
  });
}

function wrapSvgLabel(text, maxCharsPerLine, maxLines = 2) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) { current = ""; break; }
    } else {
      current = candidate;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);

  const wordsUsed = lines.join(" ").split(/\s+/).length;
  if (wordsUsed < words.length && lines.length) {
    const lastIndex = lines.length - 1;
    const last = lines[lastIndex];
    lines[lastIndex] = last.length >= maxCharsPerLine ? `${last.slice(0, maxCharsPerLine - 1)}…` : `${last}…`;
  }
  return lines;
}

function getConstellationNodeColor(type, item) {
  if (type === "contact") return "#c9a8ff";
  if (type === "lead") {
    if (item.status === "Qualified") return "#8fe388";
    if (item.status === "Disqualified") return "#6b7280";
    return "#7dd3fc";
  }
  if (type === "opportunity") {
    if (item.status === "Won") return "#8fe388";
    if (item.status === "Lost") return "#f87171";
    return "#7dd3fc";
  }
  if (type === "project") {
    if (item.status === "Active" || item.status === "Completed") return "#8fe388";
    if (item.status === "Archived") return "#6b7280";
    return "#fbbf6a";
  }
  return "#6b7280";
}

function getConstellationNodes(customer) {
  const nodes = [];
  customer.contacts.forEach((contact, index) => {
    nodes.push({ type: "contact", id: `contact-${index}`, label: contact.name || "Unnamed contact", color: getConstellationNodeColor("contact", contact) });
  });
  leads.filter((lead) => lead.customerId === customer.id).forEach((lead) => {
    nodes.push({ type: "lead", id: lead.id, label: lead.name, color: getConstellationNodeColor("lead", lead) });
  });
  opportunities.filter((opportunity) => opportunity.customerId === customer.id).forEach((opportunity) => {
    nodes.push({ type: "opportunity", id: opportunity.id, label: opportunity.name, color: getConstellationNodeColor("opportunity", opportunity) });
  });
  projects.filter((project) => project.customerId === customer.id).forEach((project) => {
    nodes.push({ type: "project", id: project.id, label: project.name, color: getConstellationNodeColor("project", project) });
  });
  return nodes;
}

const CONSTELLATION_MAX_NODES = 14;

function openConstellationMap(customer) {
  const dialog = document.getElementById("constellation-dialog");
  const container = document.getElementById("constellation-svg-container");
  const title = document.getElementById("constellation-dialog-title");
  if (!dialog || !container) return;

  if (title) title.textContent = `${customer.company} — Constellation`;

  const allNodes = getConstellationNodes(customer);
  const overflow = Math.max(0, allNodes.length - CONSTELLATION_MAX_NODES);
  const nodes = allNodes.slice(0, CONSTELLATION_MAX_NODES);

  const size = 720;
  const center = size / 2;
  const radius = 260;
  const nodeRadius = 26;

  // The sun grows slightly and its label shrinks for a longer company name, so it never overflows.
  const sunRadius = customer.company.length > 20 ? 62 : customer.company.length > 12 ? 56 : 50;
  const sunFontSize = customer.company.length > 20 ? 13 : customer.company.length > 12 ? 14 : 16;
  const sunLines = wrapSvgLabel(customer.company, customer.company.length > 20 ? 14 : 12, 2);
  const sunLineHeight = sunFontSize + 3;
  const sunTextStartY = center - ((sunLines.length - 1) * sunLineHeight) / 2 + sunFontSize / 3;

  const nodeSvgParts = nodes.map((node, index) => {
    const angle = (index / Math.max(nodes.length, 1)) * 2 * Math.PI - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const labelStartY = y + nodeRadius + 20;
    const nameLines = wrapSvgLabel(node.label, 13, 2);
    const nameSvg = nameLines.map((line, lineIndex) => `<tspan x="${x}" dy="${lineIndex === 0 ? 0 : 14}">${escapeHtml(line)}</tspan>`).join("");
    const typeLabelY = labelStartY + nameLines.length * 14 + 4;
    return `
      <g class="constellation-node" data-constellation-node-type="${node.type}" data-constellation-node-id="${escapeHtml(node.id)}" tabindex="0">
        <line x1="${center}" y1="${center}" x2="${x}" y2="${y}" class="constellation-line"></line>
        <circle cx="${x}" cy="${y}" r="${nodeRadius}" fill="${node.color}" class="constellation-node-circle" filter="url(#constellation-glow)"></circle>
        <circle cx="${x}" cy="${y}" r="${nodeRadius}" fill="${node.color}" class="constellation-node-core"></circle>
        <text x="${x}" y="${labelStartY}" text-anchor="middle" class="constellation-label">${nameSvg}</text>
        <text x="${x}" y="${typeLabelY}" text-anchor="middle" class="constellation-label constellation-type-label">${escapeHtml(RECENTLY_VIEWED_LABELS[node.type] || node.type)}</text>
      </g>
    `;
  }).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" class="constellation-canvas">
      <defs>
        <filter id="constellation-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur"></feGaussianBlur>
          <feMerge>
            <feMergeNode in="blur"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
        <radialGradient id="constellation-bg" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#1c2333"></stop>
          <stop offset="100%" stop-color="#0c0f18"></stop>
        </radialGradient>
        <radialGradient id="constellation-sun-fill" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#ffe28a"></stop>
          <stop offset="100%" stop-color="#f5a742"></stop>
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="${size}" height="${size}" fill="url(#constellation-bg)" rx="24"></rect>
      ${nodeSvgParts}
      <circle cx="${center}" cy="${center}" r="${sunRadius}" fill="url(#constellation-sun-fill)" filter="url(#constellation-glow)"></circle>
      <circle cx="${center}" cy="${center}" r="${sunRadius}" fill="url(#constellation-sun-fill)"></circle>
      <text x="${center}" y="${sunTextStartY}" text-anchor="middle" class="constellation-sun-label" font-size="${sunFontSize}">
        ${sunLines.map((line, lineIndex) => `<tspan x="${center}" dy="${lineIndex === 0 ? 0 : sunLineHeight}">${escapeHtml(line)}</tspan>`).join("")}
      </text>
    </svg>
    ${overflow ? `<p class="muted constellation-overflow">+${overflow} more not shown</p>` : ""}
    ${nodes.length === 0 ? `<p class="muted constellation-overflow">Nothing connected to this customer yet.</p>` : ""}
  `;

  container.querySelectorAll("[data-constellation-node-type]").forEach((node) => {
    if (node.dataset.constellationNodeType === "contact") return;
    node.addEventListener("click", () => {
      dialog.close();
      openRecentlyViewedItem(node.dataset.constellationNodeType, node.dataset.constellationNodeId);
    });
  });

  dialog.showModal();
}

function getCustomerHealthFlag(customer) {
  if (customer.status !== "Active") return null;

  const loggedEvents = events.filter((evt) => evt.customerId === customer.id && evt.status === "Logged");
  if (loggedEvents.length === 0) {
    const portalRequiredContacts = customer.contacts.filter((contact) => contact.requiresPortalAccess);
    const noInviteSent = portalRequiredContacts.length > 0 && portalRequiredContacts.every((contact) => !contact.portalInviteSentAtRaw);
    return noInviteSent ? "No events logged and no Portal invite sent yet" : "No events logged yet";
  }

  const mostRecentDate = loggedEvents.reduce((latest, evt) => {
    const parsed = parseIsoDate(evt.date);
    return parsed && (!latest || parsed > latest) ? parsed : latest;
  }, null);
  if (mostRecentDate) {
    const daysSince = Math.floor((Date.now() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince >= 60) return `No event logged in ${daysSince} days`;
  }

  const portalRequiredContacts = customer.contacts.filter((contact) => contact.requiresPortalAccess);
  const noInviteSent = portalRequiredContacts.length > 0 && portalRequiredContacts.every((contact) => !contact.portalInviteSentAtRaw);
  if (noInviteSent) return "No Portal invite sent yet";

  return null;
}

function renderCustomerTable() {
  const tableBody = document.getElementById("customers-table");
  const summary = document.getElementById("customer-summary");
  if (!tableBody || !summary) return;

  const filteredCustomers = getFilteredCustomers();
  tableBody.innerHTML = "";

  if (filteredCustomers.length === 0) {
    tableBody.innerHTML = customers.length === 0
      ? `<tr><td colspan="8" class="empty-table">No customers yet — click "+ New Customer" above to add your first one.</td></tr>`
      : `<tr><td colspan="8" class="empty-table">No customers match your search.</td></tr>`;
  } else {
    filteredCustomers.forEach((customer) => {
      const row = document.createElement("tr");
      const healthFlag = getCustomerHealthFlag(customer);
      row.innerHTML = `
        <td class="checkbox-col"><input type="checkbox" class="customer-bulk-checkbox" data-customer-bulk-id="${customer.id}" ${bulkSelectedCustomerIds.has(customer.id) ? "checked" : ""} aria-label="Select ${escapeHtml(customer.company)}" /></td>
        <td>
          <button class="row-link" data-customer-id="${customer.id}"><strong>${escapeHtml(customer.company)}</strong>${customer.internalPreview ? ` <span class="badge inline-badge">Internal Preview</span>` : ""}${healthFlag ? ` <span class="badge inline-badge health-flag" title="${escapeHtml(healthFlag)}">Needs attention</span>` : ""}<span class="table-subtext">${escapeHtml(customer.notes)}</span></button>
          ${customer.tags.length ? `<div class="tag-row">${customer.tags.map((tag) => `<button class="tag-chip" data-tag-filter="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`).join("")}</div>` : ""}
        </td>
        <td><span class="status ${getStatusClass(customer.status)}">${escapeHtml(customer.status)}</span></td>
        <td>${customer.projects}</td>
        <td>${customer.users}</td>
        <td>${escapeHtml(customer.owner)}</td>
        <td>${escapeHtml(customer.lastUpdated)}</td>
        <td>
          <button class="secondary-button compact" data-new-event-for-customer="${customer.id}">+ Event</button>
        </td>
      `;
      tableBody.appendChild(row);

      if (selectedCustomerId === customer.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="8">${getCustomerDetailMarkup(customer)}</td>`;
        tableBody.appendChild(detailRow);
      }
    });
  }

  summary.textContent = currentCustomerTagFilter
    ? `Showing ${filteredCustomers.length} of ${customers.length} live customers tagged "${currentCustomerTagFilter}"`
    : `Showing ${filteredCustomers.length} of ${customers.length} live customers`;

  document.querySelectorAll("[data-tag-filter]").forEach((chip) => {
    chip.addEventListener("click", (event) => {
      event.stopPropagation();
      currentCustomerTagFilter = currentCustomerTagFilter === chip.dataset.tagFilter ? "" : chip.dataset.tagFilter;
      renderCustomerTable();
    });
  });

  document.querySelectorAll("[data-customer-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const opening = selectedCustomerId !== button.dataset.customerId;
      selectedCustomerId = opening ? button.dataset.customerId : null;
      expandedCustomerEventsId = null;
      expandedCustomerLibraryId = null;
      renderCustomerTable();
      if (opening) {
        const customer = customers.find((item) => item.id === button.dataset.customerId);
        if (customer) recordRecentlyViewed("customer", customer.id, customer.company);
      }
    });
  });

  document.querySelectorAll("[data-new-event-for-customer]").forEach((button) => {
    button.addEventListener("click", () => {
      const customer = customers.find((item) => item.id === button.dataset.newEventForCustomer);
      if (customer) openEventDialogForCustomer(customer);
    });
  });

  document.querySelectorAll("[data-customer-bulk-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) bulkSelectedCustomerIds.add(checkbox.dataset.customerBulkId);
      else bulkSelectedCustomerIds.delete(checkbox.dataset.customerBulkId);
      updateCustomerBulkBar();
    });
  });
  const customerSelectAll = document.getElementById("customer-select-all");
  if (customerSelectAll) {
    customerSelectAll.checked = filteredCustomers.length > 0 && filteredCustomers.every((c) => bulkSelectedCustomerIds.has(c.id));
  }
  updateCustomerBulkBar();

  document.querySelectorAll("[data-send-invite]").forEach((button) => {
    button.addEventListener("click", () => {
      const [customerId, contactIndex] = button.dataset.sendInvite.split("-");
      const customer = customers.find((item) => item.id === customerId);
      if (customer) sendPortalInvite(customer, Number(contactIndex));
    });
  });

  document.querySelectorAll("[data-add-comment]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(`[data-comment-input="${button.dataset.addComment}"]`);
      if (input && input.value.trim()) addCustomerComment(button.dataset.addComment, input.value);
    });
  });

  document.querySelectorAll("[data-edit-comment]").forEach((button) => {
    button.addEventListener("click", () => {
      const dashIndex = button.dataset.editComment.indexOf("-");
      const commentId = button.dataset.editComment.slice(dashIndex + 1);
      editingRelationshipCommentId = commentId;
      renderCustomerTable();
    });
  });

  document.querySelectorAll("[data-save-comment-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const dashIndex = button.dataset.saveCommentEdit.indexOf("-");
      const customerId = button.dataset.saveCommentEdit.slice(0, dashIndex);
      const commentId = button.dataset.saveCommentEdit.slice(dashIndex + 1);
      const input = document.querySelector(`[data-edit-comment-input="${commentId}"]`);
      if (input && input.value.trim()) saveCustomerCommentEdit(customerId, commentId, input.value);
    });
  });

  document.querySelectorAll("[data-cancel-comment-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      editingRelationshipCommentId = null;
      renderCustomerTable();
    });
  });

  document.querySelectorAll("[data-view-constellation]").forEach((button) => {
    button.addEventListener("click", () => {
      const customer = customers.find((item) => item.id === button.dataset.viewConstellation);
      if (customer) openConstellationMap(customer);
    });
  });

  document.querySelectorAll("[data-edit-customer]").forEach((button) => {
    button.addEventListener("click", () => {
      const customer = customers.find((item) => item.id === button.dataset.editCustomer);
      if (customer) openCustomerDialogForEdit(customer);
    });
  });

  document.querySelectorAll("[data-archive-customer]").forEach((button) => {
    button.addEventListener("click", () => {
      const customer = customers.find((item) => item.id === button.dataset.archiveCustomer);
      if (!customer) return;
      const archiving = customer.status !== "Archived";
      const verb = archiving ? "archive" : "reactivate";
      if (!confirm(`Are you sure you want to ${verb} ${customer.company}?`)) return;
      setCustomerStatus(customer, archiving ? "Archived" : "Active");
    });
  });

  document.querySelectorAll("[data-delete-customer]").forEach((button) => {
    button.addEventListener("click", () => {
      const customer = customers.find((item) => item.id === button.dataset.deleteCustomer);
      if (customer) deleteCustomer(customer);
    });
  });

  document.querySelectorAll("[data-toggle-customer-events]").forEach((button) => {
    button.addEventListener("click", () => {
      const customerId = button.dataset.toggleCustomerEvents;
      expandedCustomerEventsId = expandedCustomerEventsId === customerId ? null : customerId;
      renderCustomerTable();
    });
  });

  document.querySelectorAll("[data-toggle-customer-library]").forEach((button) => {
    button.addEventListener("click", () => {
      const customerId = button.dataset.toggleCustomerLibrary;
      expandedCustomerLibraryId = expandedCustomerLibraryId === customerId ? null : customerId;
      renderCustomerTable();
    });
  });

  document.querySelectorAll("[data-view-customer-event]").forEach((button) => {
    button.addEventListener("click", () => {
      showPage("events");
      currentEventSearch = "";
      const searchInput = document.getElementById("event-search");
      if (searchInput) searchInput.value = "";
      currentEventFilter = "all";
      document.querySelectorAll(".event-filter-button").forEach((item) => item.classList.toggle("active", item.dataset.eventFilter === "all"));
      selectedEventId = button.dataset.viewCustomerEvent;
      renderEventTable();
    });
  });

  document.querySelectorAll("[data-save-welcome-message]").forEach((button) => {
    button.addEventListener("click", () => {
      saveCustomerMessage(button.dataset.saveWelcomeMessage);
    });
  });

  document.querySelectorAll("[data-close-customer-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCustomerId = null;
      expandedCustomerEventsId = null;
      expandedCustomerLibraryId = null;
      renderCustomerTable();
    });
  });

  document.querySelectorAll("[data-page-link]").forEach((item) => {
    item.addEventListener("click", () => showPage(item.dataset.pageLink));
  });
}

function renderProjectTable() {
  const tableBody = document.getElementById("projects-table");
  const summary = document.getElementById("project-summary");
  if (!tableBody || !summary) return;

  const filteredProjects = getFilteredProjects();
  tableBody.innerHTML = "";

  if (filteredProjects.length === 0) {
    tableBody.innerHTML = projects.length === 0
      ? `<tr><td colspan="7" class="empty-table">No projects yet — click "+ New Project" above to add your first one.</td></tr>`
      : `<tr><td colspan="7" class="empty-table">No projects match your search.</td></tr>`;
  } else {
    filteredProjects.forEach((project) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><button class="row-link" data-project-id="${project.id}"><strong>${escapeHtml(project.name)}</strong><span class="table-subtext">${escapeHtml(project.description)}</span></button></td>
        <td>${escapeHtml(project.customer)}</td>
        <td><span class="status ${getStatusClass(project.status)}">${escapeHtml(project.status)}</span></td>
        <td>${escapeHtml(project.type)}</td>
        <td>${project.resources}</td>
        <td>${getProjectTimeCellMarkup(project)}</td>
        <td>${escapeHtml(project.lastUpdated)}</td>
      `;
      tableBody.appendChild(row);

      if (selectedProjectId === project.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="7">${getProjectDetailMarkup(project)}</td>`;
        tableBody.appendChild(detailRow);
      }
    });
  }

  summary.textContent = `Showing ${filteredProjects.length} of ${projects.length} live projects`;
  wireActionItemControls(tableBody);

  document.querySelectorAll("[data-project-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const opening = selectedProjectId !== button.dataset.projectId;
      selectedProjectId = opening ? button.dataset.projectId : null;
      renderProjectTable();
      if (opening) {
        const project = projects.find((item) => item.id === button.dataset.projectId);
        if (project) recordRecentlyViewed("project", project.id, project.name);
      }
    });
  });

  document.querySelectorAll("[data-close-project-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedProjectId = null;
      renderProjectTable();
    });
  });

  document.querySelectorAll("[data-edit-project]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = projects.find((item) => item.id === button.dataset.editProject);
      if (project) openProjectDialogForEdit(project);
    });
  });

  document.querySelectorAll("[data-archive-project]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = projects.find((item) => item.id === button.dataset.archiveProject);
      if (!project) return;
      const archiving = project.status !== "Archived";
      const verb = archiving ? "archive" : "reactivate";
      if (!confirm(`Are you sure you want to ${verb} ${project.name}?`)) return;
      setProjectStatus(project, archiving ? "Archived" : "Planning");
    });
  });

  document.querySelectorAll("[data-delete-project]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = projects.find((item) => item.id === button.dataset.deleteProject);
      if (project) deleteProject(project);
    });
  });

  document.querySelectorAll("[data-page-link]").forEach((item) => {
    item.addEventListener("click", () => showPage(item.dataset.pageLink));
  });
}

function renderLibraryTable() {
  const tableBody = document.getElementById("library-table");
  const summary = document.getElementById("library-summary");
  if (!tableBody || !summary) return;

  const filteredItems = getFilteredLibraryItems();
  tableBody.innerHTML = "";

  if (filteredItems.length === 0) {
    tableBody.innerHTML = libraryItems.length === 0
      ? `<tr><td colspan="6" class="empty-table">No library items yet — click "+ New Library Item" above to add your first one.</td></tr>`
      : `<tr><td colspan="6" class="empty-table">No library items match your search.</td></tr>`;
  } else {
    filteredItems.forEach((item) => {
      const audience = item.visibility === "Selected Customers"
        ? (item.customerNames.join(", ") || "No customers selected")
        : item.visibility;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><button class="row-link" data-library-id="${item.id}"><strong>${escapeHtml(item.title)}</strong>${item.collection ? `<span class="collection-pill">📚 ${escapeHtml(item.collection)}</span>` : ""}<span class="table-subtext">${escapeHtml(item.description)}</span></button></td>
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(item.source)}</td>
        <td>${escapeHtml(audience)}</td>
        <td><span class="status ${getStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>${escapeHtml(item.lastUpdated)}</td>
      `;
      tableBody.appendChild(row);

      if (selectedLibraryItemId === item.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="6">${getLibraryDetailMarkup(item)}</td>`;
        tableBody.appendChild(detailRow);
      }
    });
  }

  summary.textContent = `Showing ${filteredItems.length} of ${libraryItems.length} live library items`;

  document.querySelectorAll("[data-library-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedLibraryItemId = selectedLibraryItemId === button.dataset.libraryId ? null : button.dataset.libraryId;
      renderLibraryTable();
    });
  });

  document.querySelectorAll("[data-close-library-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedLibraryItemId = null;
      renderLibraryTable();
    });
  });

  document.querySelectorAll("[data-edit-library]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = libraryItems.find((entry) => entry.id === button.dataset.editLibrary);
      if (item) openLibraryDialogForEdit(item);
    });
  });

  document.querySelectorAll("[data-archive-library]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = libraryItems.find((entry) => entry.id === button.dataset.archiveLibrary);
      if (!item) return;
      const archiving = item.status !== "Archived";
      const verb = archiving ? "archive" : "reactivate";
      if (!confirm(`Are you sure you want to ${verb} "${item.title}"?`)) return;
      setLibraryStatus(item, archiving ? "Archived" : "Draft");
    });
  });

  document.querySelectorAll("[data-delete-library]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = libraryItems.find((entry) => entry.id === button.dataset.deleteLibrary);
      if (item) deleteLibraryItem(item);
    });
  });
}

function getAccessibleLibraryItems(customer) {
  return libraryItems.filter((item) =>
    item.status === "Published"
    && (item.visibility === "All Customers" || (item.visibility === "Selected Customers" && item.customerIds.includes(customer.id)))
  );
}

function getCustomerDetailMarkup(customer) {
  const accessibleItems = getAccessibleLibraryItems(customer);
  const customerEvents = events
    .filter((evt) => evt.customerId === customer.id)
    .sort((a, b) => eventSortKey(b).localeCompare(eventSortKey(a)));
  const healthFlagReason = getCustomerHealthFlag(customer);
  const currentAdminName = getCurrentAdminName();
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Customer record</p>
          <h3>${escapeHtml(customer.company)}</h3>
        </div>
        <div class="detail-header-actions">
          <button class="secondary-button compact" data-edit-customer="${customer.id}">Edit customer</button>
          <span class="status ${getStatusClass(customer.status)}">${escapeHtml(customer.status)}</span>
          <button class="icon-button" data-close-customer-detail aria-label="Close customer detail">×</button>
        </div>
      </div>
      <p class="where-left-note">🧭 ${escapeHtml(getWhereDidWeLeaveThisSummary("customer", customer))}</p>
      <div class="detail-grid">
        <button class="constellation-card" data-view-constellation="${customer.id}">
          <span>✨ Constellation</span>
          <strong>View map</strong>
        </button>
        <div><span>Projects</span><strong>${customer.projects}</strong></div>
        <div><span>Users</span><strong>${customer.users}</strong></div>
        <div><span>Owner</span><strong>${escapeHtml(customer.owner)}</strong></div>
        <div><span>Last updated</span><strong>${escapeHtml(customer.lastUpdated)}</strong></div>
        <div><span>Uploads used</span><strong>${formatBytes(customer.uploadStorageUsedBytes)} of ${formatBytes(UPLOAD_QUOTA_BYTES)}</strong></div>
        <div><span>Website</span><strong>${customer.website ? `<a href="${escapeHtml(customer.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(customer.website)}</a>` : "Not set"}</strong></div>
        <div><span>Main phone</span><strong>${escapeHtml(customer.phone || "Not set")}</strong></div>
        <div><span>Industry</span><strong>${escapeHtml(customer.industry || "Not set")}</strong></div>
        <div><span>Company size</span><strong>${escapeHtml(customer.companySize || "Not set")}</strong></div>
      </div>
      ${customer.address ? `<div class="note-card"><p class="eyebrow">Address</p><p>${escapeHtml(customer.address)}</p></div>` : ""}
      ${customer.status === "Archived" ? `<p class="muted">This customer is archived. They can still sign in to the Portal, but their Library will show no items until reactivated.</p>` : ""}
      ${healthFlagReason ? `<p class="health-flag-note">⚠ Needs attention: ${escapeHtml(healthFlagReason)}</p>` : ""}
      ${customer.customerMemory ? `<p class="customer-memory-note">💡 ${escapeHtml(customer.customerMemory)}</p>` : ""}
      <div class="note-card">
        <p class="eyebrow">About</p>
        <p>${escapeHtml(customer.notes)}</p>
      </div>
      <p class="eyebrow">Relationship History</p>
      <div class="comment-form">
        <textarea class="full-width" rows="2" data-comment-input="${customer.id}" placeholder="Add a note about a recent conversation..."></textarea>
        <button class="secondary-button compact" data-add-comment="${customer.id}">Add comment</button>
      </div>
      <div class="comment-list">
        ${customer.relationshipHistory.length
          ? customer.relationshipHistory.slice().reverse().map((entry) => `
            <div class="comment-item">
              <div class="comment-meta">
                <strong>${escapeHtml(entry.author)}</strong>
                <span class="table-subtext">${escapeHtml(entry.createdAtDisplay)}${entry.updatedAt ? " (edited)" : ""}</span>
                ${entry.id !== "legacy" && entry.author === currentAdminName ? `<button class="icon-button compact" data-edit-comment="${customer.id}-${entry.id}" aria-label="Edit comment">✎</button>` : ""}
              </div>
              ${entry.id === editingRelationshipCommentId ? `
                <textarea class="full-width" rows="2" data-edit-comment-input="${entry.id}">${escapeHtml(entry.text)}</textarea>
                <div class="comment-edit-actions">
                  <button class="secondary-button compact" data-save-comment-edit="${customer.id}-${entry.id}">Save</button>
                  <button class="secondary-button compact" data-cancel-comment-edit>Cancel</button>
                </div>
              ` : `<p class="comment-text">${escapeHtml(entry.text)}</p>`}
            </div>
          `).join("")
          : `<p class="muted">No history recorded yet.</p>`}
      </div>
      <p class="eyebrow">Contacts (${customer.contacts.length})</p>
      <div class="detail-grid contacts-grid">
        ${customer.contacts.length
          ? customer.contacts.map((contact, index) => `
            <div class="contact-card">
              <span>${escapeHtml(contact.name || "Unnamed contact")}${contact.role ? ` · ${escapeHtml(contact.role)}` : ""}</span>
              <strong>${escapeHtml(contact.email || "No email set")}</strong>
              ${contact.phone ? `<span class="table-subtext">${escapeHtml(contact.phone)}</span>` : ""}
              ${contact.requiresPortalAccess ? `
                <div class="contact-card-actions">
                  <button class="secondary-button compact" data-send-invite="${customer.id}-${index}" ${contact.email ? "" : "disabled"}>
                    ${contact.portalAccountCreated ? "Resend invite" : "Send invite"}
                  </button>
                </div>
                <p class="muted invite-status" data-invite-status="${customer.id}-${index}">${
                  contact.email
                    ? (contact.portalInviteSentAt ? `Last sent ${escapeHtml(contact.portalInviteSentAt)}.` : "Not sent yet.")
                    : "Add an email to send an invite."
                }</p>
              ` : `<p class="muted">Doesn't require portal access.</p>`}
            </div>
          `).join("")
          : `<div class="contact-card"><span>No contacts added yet</span></div>`}
      </div>
      <div class="detail-subheading">
        <p class="eyebrow">Activity (${customerEvents.length} event${customerEvents.length === 1 ? "" : "s"})</p>
        ${customerEvents.length ? `<button class="secondary-button compact" data-toggle-customer-events="${customer.id}">${expandedCustomerEventsId === customer.id ? "Hide activity" : "Show activity"}</button>` : ""}
      </div>
      ${expandedCustomerEventsId === customer.id ? `
        <div class="settings-list compact-list scrollable-list">
          ${customerEvents.length === 0
            ? `<div><strong>No events logged for this customer yet</strong></div>`
            : customerEvents.map((evt) => `
                <div>
                  <strong>${escapeHtml(evt.title)}</strong>
                  <span>${escapeHtml(formatEventDateTime(evt))} · ${escapeHtml(evt.type)} · <span class="status ${getStatusClass(evt.status)}">${escapeHtml(evt.status)}</span></span>
                  <button class="secondary-button compact" data-view-customer-event="${evt.id}">View</button>
                </div>
              `).join("")}
        </div>
      ` : `<p class="muted">${customerEvents.length ? `Click "Show activity" to see their event history.` : "No events logged yet."}</p>`}

      <div class="detail-subheading">
        <p class="eyebrow">Library (${accessibleItems.length} item${accessibleItems.length === 1 ? "" : "s"})</p>
        ${accessibleItems.length ? `<button class="secondary-button compact" data-toggle-customer-library="${customer.id}">${expandedCustomerLibraryId === customer.id ? "Hide library" : "Show library"}</button>` : ""}
      </div>
      ${expandedCustomerLibraryId === customer.id ? `
        <div class="settings-list compact-list scrollable-list">
          ${accessibleItems.length === 0
            ? `<div><strong>No published library items shared with them yet</strong></div>`
            : accessibleItems.map((item) => `<div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.category)} · ${item.visibility === "All Customers" ? "All customers" : "Selected customers"}</span></div>`).join("")}
        </div>
      ` : `<p class="muted">${accessibleItems.length ? `Click "Show library" to see what they can access.` : "No published library items shared with them yet."}</p>`}
      <div class="detail-actions">
        <button class="secondary-button" data-edit-customer="${customer.id}">Edit customer</button>
        <button class="secondary-button" data-page-link="projects">Open projects</button>
        <button class="secondary-button" data-archive-customer="${customer.id}">
          ${customer.status === "Archived" ? "Reactivate customer" : "Archive customer"}
        </button>
        <button class="secondary-button danger-button" data-delete-customer="${customer.id}">Delete customer</button>
      </div>
      <p class="eyebrow">Welcome message (shown on their Portal Dashboard)</p>
      <textarea class="detail-textarea" id="welcome-message-${customer.id}" rows="3" placeholder="e.g. Hi Paul, welcome to the portal — great catching up yesterday!">${escapeHtml(getCustomerMessage(customer.id))}</textarea>
      <div class="detail-actions">
        <button class="secondary-button compact" data-save-welcome-message="${customer.id}">Save message</button>
      </div>
      <p class="muted" data-welcome-message-status="${customer.id}"></p>
    </div>
  `;
}

function getProjectDetailMarkup(project) {
  const timeSummary = getProjectTimeSummary(project);
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Project record</p>
          <h3>${escapeHtml(project.name)}</h3>
        </div>
        <div class="detail-header-actions">
          <span class="status ${getStatusClass(project.status)}">${escapeHtml(project.status)}</span>
          <button class="icon-button" data-close-project-detail aria-label="Close project detail">×</button>
        </div>
      </div>
      <p class="where-left-note">🧭 ${escapeHtml(getWhereDidWeLeaveThisSummary("project", project))}</p>
      <div class="detail-grid">
        <div><span>Customer</span><strong>${escapeHtml(project.customer)}</strong></div>
        <div><span>Type</span><strong>${escapeHtml(project.type)}</strong></div>
        <div><span>Resources</span><strong>${project.resources}</strong></div>
        <div><span>Owner</span><strong>${escapeHtml(project.owner)}</strong></div>
        <div><span>Created</span><strong>${escapeHtml(project.created)}</strong></div>
        <div><span>Last updated</span><strong>${escapeHtml(project.lastUpdated)}</strong></div>
        <div><span>Time logged</span><strong>${formatHoursAndDays(timeSummary.used)}</strong></div>
        <div><span>Budgeted hours</span><strong>${timeSummary.budget === null ? "Not set" : formatHoursAndDays(timeSummary.budget)}</strong></div>
        ${timeSummary.budget !== null ? `<div><span>${timeSummary.remaining < 0 ? "Over budget by" : "Remaining"}</span><strong class="${timeSummary.remaining < 0 ? "over-budget-text" : ""}">${formatHoursAndDays(Math.abs(timeSummary.remaining))}</strong></div>` : ""}
      </div>
      <div class="note-card">
        <p class="eyebrow">About</p>
        <p>${escapeHtml(project.description)}</p>
      </div>
      ${getActionItemsMarkup("project", project.id, project.actionItems)}
      <div class="detail-actions">
        <button class="secondary-button" data-edit-project="${project.id}">Edit project</button>
        <button class="secondary-button" data-page-link="library">Open Library</button>
        <button class="secondary-button" data-archive-project="${project.id}">
          ${project.status === "Archived" ? "Reactivate project" : "Archive project"}
        </button>
        <button class="secondary-button danger-button" data-delete-project="${project.id}">Delete project</button>
      </div>
    </div>
  `;
}

function getLibraryDetailMarkup(item) {
  const audience = item.visibility === "Selected Customers"
    ? (item.customerNames.join(", ") || "No customers selected")
    : item.visibility;
  const destination = item.itemType === "Link" ? item.externalUrl : item.downloadUrl;
  const actionLabel = item.itemType === "Link" ? "Open link" : "Download file";
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div><p class="eyebrow">Library item</p><h3>${escapeHtml(item.title)}</h3></div>
        <button class="icon-button" data-close-library-detail aria-label="Close detail">×</button>
      </div>
      <div class="detail-grid">
        <div><span>Category</span><strong>${escapeHtml(item.category)}</strong></div>
        <div><span>Source</span><strong>${escapeHtml(item.source)}</strong></div>
        <div><span>Visibility</span><strong>${escapeHtml(audience)}</strong></div>
        <div><span>Status</span><strong>${escapeHtml(item.status)}</strong></div>
        <div><span>Version</span><strong>${escapeHtml(item.version)}</strong></div>
        <div><span>Collection</span><strong>${item.collection ? escapeHtml(item.collection) : "Not set"}</strong></div>
        <div><span>Type</span><strong>${escapeHtml(item.itemType)}</strong></div>
        <div><span>Owner</span><strong>${escapeHtml(item.owner)}</strong></div>
        <div><span>Last updated</span><strong>${escapeHtml(item.lastUpdated)}</strong></div>
      </div>
      <p>${escapeHtml(item.description)}</p>
      <div class="detail-actions">
        ${destination ? `<a class="secondary-button button-link" href="${escapeHtml(destination)}" target="_blank" rel="noopener">${actionLabel}</a>` : ""}
        <button class="secondary-button" data-edit-library="${item.id}">Edit item</button>
        <button class="secondary-button" data-archive-library="${item.id}">
          ${item.status === "Archived" ? "Reactivate item" : "Archive item"}
        </button>
        <button class="secondary-button danger-button" data-delete-library="${item.id}">Delete permanently</button>
      </div>
    </div>
  `;
}

function getForecastCategoryWeight(category) {
  const list = pipelineConfig.forecastCategories;
  const index = list.indexOf(category);
  if (index === -1 || list.length <= 1) return 0.5;
  return 0.9 - (index / (list.length - 1)) * 0.85;
}

function updatePipelineValueWidget() {
  const openEl = document.getElementById("pipeline-value-open");
  const weightedEl = document.getElementById("pipeline-value-weighted");
  if (!openEl || !weightedEl) return;

  const openOpportunities = opportunities.filter((opportunity) => opportunity.status === "Open");
  const totalOpen = openOpportunities.reduce((sum, opportunity) => sum + (opportunity.dealValue || 0), 0);
  const weighted = openOpportunities.reduce((sum, opportunity) => {
    const category = getOpportunityForecastLabel(opportunity);
    const weight = category === "N/A" ? 0.1 : getForecastCategoryWeight(category);
    return sum + (opportunity.dealValue || 0) * weight;
  }, 0);

  openEl.textContent = formatCurrency(totalOpen);
  weightedEl.textContent = formatCurrency(Math.round(weighted));
}

const LEAD_STALE_DAYS = 14;
const DIGEST_CLOSE_DATE_SOON_DAYS = 7;

function updateDailyDigestWidget() {
  const list = document.getElementById("daily-digest-list");
  if (!list) return;

  const items = [];

  opportunities.forEach((opportunity) => {
    const stalledFlag = getOpportunityStalledFlag(opportunity);
    if (stalledFlag) {
      items.push({ type: "opportunity", id: opportunity.id, text: `${opportunity.name} — ${stalledFlag.toLowerCase()}`, subtext: opportunity.customerName });
    }
  });

  customers.forEach((customer) => {
    const healthFlag = getCustomerHealthFlag(customer);
    if (healthFlag) {
      items.push({ type: "customer", id: customer.id, text: `${customer.company} needs attention — ${healthFlag.toLowerCase()}`, subtext: "Customer" });
    }
  });

  opportunities.forEach((opportunity) => {
    if (opportunity.status !== "Open" || !opportunity.expectedCloseDate) return;
    const closeDate = parseIsoDate(opportunity.expectedCloseDate);
    if (!closeDate) return;
    const daysUntilClose = Math.ceil((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilClose >= 0 && daysUntilClose <= DIGEST_CLOSE_DATE_SOON_DAYS) {
      items.push({ type: "opportunity", id: opportunity.id, text: `${opportunity.name} is due to close ${daysUntilClose === 0 ? "today" : `in ${daysUntilClose} day${daysUntilClose === 1 ? "" : "s"}`}`, subtext: opportunity.customerName });
    }
  });

  leads.forEach((lead) => {
    if (lead.status !== "Open" || !lead.updatedAtRaw || typeof lead.updatedAtRaw.toDate !== "function") return;
    const daysSince = Math.floor((Date.now() - lead.updatedAtRaw.toDate().getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince >= LEAD_STALE_DAYS) {
      items.push({ type: "lead", id: lead.id, text: `${lead.name} has been open ${daysSince} days without being qualified`, subtext: "Lead" });
    }
  });

  if (items.length === 0) {
    list.innerHTML = `<li><span class="muted">Nothing urgent today — nice and clear.</span></li>`;
    return;
  }

  list.innerHTML = items.slice(0, 8).map((item) => `
    <li><button class="row-link" data-digest-type="${item.type}" data-digest-id="${item.id}"><strong>${escapeHtml(item.text)}</strong> <span class="table-subtext">${escapeHtml(item.subtext)}</span></button></li>
  `).join("");

  list.querySelectorAll("[data-digest-type]").forEach((button) => {
    button.addEventListener("click", () => {
      openRecentlyViewedItem(button.dataset.digestType, button.dataset.digestId);
    });
  });
}

function updateDashboardMetrics() {
  const customerMetric = document.getElementById("metric-customers");
  const customerNote = document.getElementById("metric-customers-note");
  const leadsMetric = document.getElementById("metric-leads");
  const leadsNote = document.getElementById("metric-leads-note");
  const opportunitiesMetric = document.getElementById("metric-opportunities");
  const opportunitiesNote = document.getElementById("metric-opportunities-note");
  const projectsMetric = document.getElementById("metric-projects");
  const eventsMetric = document.getElementById("metric-events");
  const eventsNote = document.getElementById("metric-events-note");
  const libraryMetric = document.getElementById("metric-library");
  if (!customerMetric || !customerNote || !leadsMetric || !leadsNote || !opportunitiesMetric || !opportunitiesNote || !projectsMetric || !eventsMetric || !eventsNote || !libraryMetric) return;

  const activeCount = customers.filter((customer) => customer.status === "Active").length;
  const trialCount = customers.filter((customer) => customer.status === "Trial").length;

  customerMetric.textContent = customers.length;
  customerNote.textContent = `${activeCount} active, ${trialCount} trial`;

  const openLeads = leads.filter((lead) => lead.status === "Open");
  leadsMetric.textContent = leads.length;
  leadsNote.textContent = `${openLeads.length} open`;

  const openOpportunities = opportunities.filter((opportunity) => opportunity.status === "Open");
  const openOpportunityValue = openOpportunities.reduce((sum, opportunity) => sum + (opportunity.dealValue || 0), 0);
  opportunitiesMetric.textContent = opportunities.length;
  opportunitiesNote.textContent = `${openOpportunities.length} open · ${formatCurrency(openOpportunityValue)}`;

  projectsMetric.textContent = projects.length;

  const upcomingEvents = events.filter((event) => event.status === "Scheduled");
  eventsMetric.textContent = events.length;
  eventsNote.textContent = `${upcomingEvents.length} upcoming`;

  libraryMetric.textContent = libraryItems.length;

  updateDailyDigestWidget();
}

function setupCustomerControls() {
  const searchInput = document.getElementById("customer-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentCustomerSearch = event.target.value;
      renderCustomerTable();
    });
  }

  document.querySelectorAll(".filter-button[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentCustomerFilter = button.dataset.filter;
      document.querySelectorAll(".filter-button[data-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderCustomerTable();
    });
  });

  const customerMineCheckbox = document.getElementById("customer-my-records");
  if (customerMineCheckbox) {
    customerMineCheckbox.addEventListener("change", (event) => {
      currentCustomerMineOnly = event.target.checked;
      renderCustomerTable();
    });
  }
}

function setupProjectControls() {
  const searchInput = document.getElementById("project-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentProjectSearch = event.target.value;
      renderProjectTable();
    });
  }

  document.querySelectorAll(".project-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentProjectFilter = button.dataset.projectFilter;
      document.querySelectorAll(".project-filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderProjectTable();
    });
  });
}

function setupLibraryControls() {
  document.getElementById("library-visibility")?.addEventListener("change", updateLibraryVisibilityMode);
  document.getElementById("library-item-type")?.addEventListener("change", updateLibraryInputMode);

  const searchInput = document.getElementById("library-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentLibrarySearch = event.target.value;
      renderLibraryTable();
    });
  }

  document.querySelectorAll(".library-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentLibraryFilter = button.dataset.libraryFilter;
      document.querySelectorAll(".library-filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderLibraryTable();
    });
  });
}

function setupLeadControls() {
  const searchInput = document.getElementById("lead-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentLeadSearch = event.target.value;
      renderLeadsTable();
    });
  }

  document.querySelectorAll(".lead-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentLeadFilter = button.dataset.leadFilter;
      document.querySelectorAll(".lead-filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderLeadsTable();
    });
  });

  const leadMineCheckbox = document.getElementById("lead-my-records");
  if (leadMineCheckbox) {
    leadMineCheckbox.addEventListener("change", (event) => {
      currentLeadMineOnly = event.target.checked;
      renderLeadsTable();
    });
  }
}

function setupOpportunityControls() {
  const searchInput = document.getElementById("opportunity-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentOpportunitySearch = event.target.value;
      renderOpportunitiesTable();
    });
  }
  setupOpportunityStageFilter();
  setupOpportunityViewToggle();
  const showArchivedCheckbox = document.getElementById("opportunity-show-archived");
  if (showArchivedCheckbox) {
    showArchivedCheckbox.addEventListener("change", (event) => {
      currentOpportunityShowArchived = event.target.checked;
      renderOpportunitiesTable();
      renderOpportunityKanban();
    });
  }
  const opportunityMineCheckbox = document.getElementById("opportunity-my-records");
  if (opportunityMineCheckbox) {
    opportunityMineCheckbox.addEventListener("change", (event) => {
      currentOpportunityMineOnly = event.target.checked;
      renderOpportunitiesTable();
      renderOpportunityKanban();
    });
  }
}

function setupSettingsControls() {
  const saveButton = document.getElementById("save-settings-button");
  if (!saveButton) return;

  saveButton.addEventListener("click", () => {
    alert("Settings are placeholders in this release. Firebase-backed saving will be added later.");
  });
}

function setupModalTopActions() {
  document.querySelectorAll(".modal").forEach((dialog) => {
    const header = dialog.querySelector(".modal-header");
    const actions = dialog.querySelector(".modal-actions");
    const closeButton = header?.querySelector(".icon-button");
    const cancelButton = actions?.querySelector(".secondary-button");
    const saveButton = actions?.querySelector(".primary-button");
    if (!header || !closeButton || !cancelButton || !saveButton) return;

    const topActions = document.createElement("div");
    topActions.className = "modal-top-actions";

    const topCancel = document.createElement("button");
    topCancel.type = "button";
    topCancel.className = "secondary-button compact";
    topCancel.textContent = "Cancel";
    topCancel.addEventListener("click", () => cancelButton.click());

    const topSave = document.createElement("button");
    topSave.type = "submit";
    topSave.className = "primary-button compact";
    topSave.textContent = "Save";

    topActions.appendChild(topCancel);
    topActions.appendChild(topSave);
    header.insertBefore(topActions, closeButton);
  });
}

function setupDialog(dialogId, openButtonId, closeButtonId, cancelButtonId) {
  const dialog = document.getElementById(dialogId);
  const openButton = document.getElementById(openButtonId);
  const closeButton = document.getElementById(closeButtonId);
  const cancelButton = document.getElementById(cancelButtonId);

  if (!dialog || !openButton || !closeButton || !cancelButton) return;

  openButton.addEventListener("click", () => dialog.showModal());
  closeButton.addEventListener("click", () => dialog.close());
  cancelButton.addEventListener("click", () => dialog.close());
}

function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      showPage(item.dataset.page);
      closeMobileNav();
    });
  });

  document.querySelectorAll("[data-page-link]").forEach((item) => {
    item.addEventListener("click", () => showPage(item.dataset.pageLink));
  });

  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

function closeMobileNav() {
  document.getElementById("nav-menu")?.classList.remove("nav-open");
  document.getElementById("nav-toggle")?.setAttribute("aria-expanded", "false");
}

function initialiseApp() {
  const aboutVersionEl = document.getElementById("about-console-version");
  if (aboutVersionEl) aboutVersionEl.textContent = APP_VERSION;
  setupNavigation();
  setupCustomerControls();
  setupProjectControls();
  setupLibraryControls();
  setupLeadControls();
  setupOpportunityControls();
  setupMarketingControls();
  setupCompanyLinkControls();
  setupSocialControls();
  setupSettingsControls();
  setupDialog("marketing-dialog", "new-marketing-button", "close-marketing-dialog-button", "cancel-marketing-dialog-button");
  document.getElementById("new-marketing-button")?.addEventListener("click", resetMarketingDialogToCreateMode);
  document.getElementById("cancel-marketing-dialog-button")?.addEventListener("click", resetMarketingDialogToCreateMode);
  document.getElementById("close-marketing-dialog-button")?.addEventListener("click", resetMarketingDialogToCreateMode);
  document.getElementById("marketing-form")?.addEventListener("submit", createMarketingOpportunity);
  setupDialog("company-link-dialog", "new-company-link-button", "close-company-link-dialog-button", "cancel-company-link-dialog-button");
  document.getElementById("new-company-link-button")?.addEventListener("click", resetCompanyLinkDialogToCreateMode);
  document.getElementById("cancel-company-link-dialog-button")?.addEventListener("click", resetCompanyLinkDialogToCreateMode);
  document.getElementById("close-company-link-dialog-button")?.addEventListener("click", resetCompanyLinkDialogToCreateMode);
  document.getElementById("company-link-form")?.addEventListener("submit", createCompanyLink);
  setupDialog("social-dialog", "new-social-post-button", "close-social-dialog-button", "cancel-social-dialog-button");
  document.getElementById("new-social-post-button")?.addEventListener("click", resetSocialDialogToCreateMode);
  document.getElementById("cancel-social-dialog-button")?.addEventListener("click", resetSocialDialogToCreateMode);
  document.getElementById("close-social-dialog-button")?.addEventListener("click", resetSocialDialogToCreateMode);
  document.getElementById("social-form")?.addEventListener("submit", createSocialPost);
  setupDialog("lead-dialog", "new-lead-button", "close-lead-dialog-button", "cancel-lead-dialog-button");
  document.getElementById("new-lead-button")?.addEventListener("click", resetLeadDialogToCreateMode);
  document.getElementById("cancel-lead-dialog-button")?.addEventListener("click", resetLeadDialogToCreateMode);
  document.getElementById("close-lead-dialog-button")?.addEventListener("click", resetLeadDialogToCreateMode);
  document.getElementById("lead-form")?.addEventListener("submit", createLead);
  document.getElementById("promote-lead-form")?.addEventListener("submit", confirmPromoteLeadToOpportunity);
  document.getElementById("cancel-promote-lead-dialog-button")?.addEventListener("click", () => {
    promotingLeadId = null;
    document.getElementById("promote-lead-dialog")?.close();
  });
  document.getElementById("close-promote-lead-dialog-button")?.addEventListener("click", () => {
    promotingLeadId = null;
    document.getElementById("promote-lead-dialog")?.close();
  });
  document.getElementById("lead-customer-mode")?.addEventListener("change", updateLeadCustomerMode);
  document.getElementById("lead-project-mode")?.addEventListener("change", updateLeadProjectMode);
  document.getElementById("lead-existing-customer")?.addEventListener("change", (event) => {
    if (document.getElementById("lead-project-mode").value !== "new") populateLeadProjectOptions(event.target.value);
  });
  setupDialog("deal-dialog", "new-deal-button", "close-deal-dialog-button", "cancel-deal-dialog-button");
  document.getElementById("new-deal-button")?.addEventListener("click", resetOpportunityDialogToCreateMode);
  document.getElementById("cancel-deal-dialog-button")?.addEventListener("click", resetOpportunityDialogToCreateMode);
  document.getElementById("close-deal-dialog-button")?.addEventListener("click", resetOpportunityDialogToCreateMode);
  document.getElementById("deal-form")?.addEventListener("submit", createOpportunity);
  setupDealAttachmentControls();
  document.getElementById("deal-customer-mode")?.addEventListener("change", updateOpportunityCustomerMode);
  document.getElementById("deal-project-mode")?.addEventListener("change", updateOpportunityProjectMode);
  document.getElementById("deal-status")?.addEventListener("change", updateOpportunityWinLossVisibility);
  document.getElementById("deal-existing-customer")?.addEventListener("change", (event) => {
    if (document.getElementById("deal-project-mode").value !== "new") populateOpportunityProjectOptions(event.target.value);
  });
  document.getElementById("pipeline-config-form")?.addEventListener("submit", savePipelineConfig);
  document.getElementById("add-sales-stage-button")?.addEventListener("click", addPipelineStageField);
  document.getElementById("add-forecast-category-button")?.addEventListener("click", addPipelineForecastField);
  renderPipelineConfigForm();
  setupDialog("customer-dialog", "new-customer-button", "close-dialog-button", "cancel-dialog-button");
  document.getElementById("new-customer-button")?.addEventListener("click", resetCustomerDialogToCreateMode);
  document.getElementById("cancel-dialog-button")?.addEventListener("click", resetCustomerDialogToCreateMode);
  document.getElementById("close-dialog-button")?.addEventListener("click", resetCustomerDialogToCreateMode);
  document.getElementById("customer-form")?.addEventListener("submit", createCustomer);
  document.getElementById("add-contact-row-button")?.addEventListener("click", addCustomerContactRow);
  renderCustomerContactFields([]);
  setupDialog("project-dialog", "new-project-button", "close-project-dialog-button", "cancel-project-dialog-button");
  document.getElementById("new-project-button")?.addEventListener("click", resetProjectDialogToCreateMode);
  document.getElementById("cancel-project-dialog-button")?.addEventListener("click", resetProjectDialogToCreateMode);
  document.getElementById("close-project-dialog-button")?.addEventListener("click", resetProjectDialogToCreateMode);
  document.getElementById("project-form")?.addEventListener("submit", createProject);
  setupDialog("library-dialog", "new-library-button", "close-library-dialog-button", "cancel-library-dialog-button");
  document.getElementById("new-library-button")?.addEventListener("click", resetLibraryDialogToCreateMode);
  document.getElementById("cancel-library-dialog-button")?.addEventListener("click", resetLibraryDialogToCreateMode);
  document.getElementById("close-library-dialog-button")?.addEventListener("click", resetLibraryDialogToCreateMode);
  document.getElementById("library-form")?.addEventListener("submit", createLibraryItem);
  updateLibraryInputMode();
  setupDialog("bulk-upload-dialog", "bulk-upload-button", "close-bulk-upload-dialog-button", "cancel-bulk-upload-dialog-button");
  document.getElementById("bulk-upload-button")?.addEventListener("click", resetBulkUploadDialog);
  document.getElementById("cancel-bulk-upload-dialog-button")?.addEventListener("click", resetBulkUploadDialog);
  document.getElementById("close-bulk-upload-dialog-button")?.addEventListener("click", resetBulkUploadDialog);
  document.getElementById("bulk-upload-form")?.addEventListener("submit", createBulkLibraryItems);
  document.getElementById("bulk-visibility")?.addEventListener("change", updateBulkVisibilityMode);
  document.getElementById("bulk-files")?.addEventListener("change", updateBulkFileList);
  document.getElementById("migrate-bookings-button")?.addEventListener("click", migrateBookingsToEvents);
  setupDialog("event-dialog", "new-event-button", "close-event-dialog-button", "cancel-event-dialog-button");
  document.getElementById("new-event-button")?.addEventListener("click", resetEventDialogToCreateMode);
  document.getElementById("cancel-event-dialog-button")?.addEventListener("click", resetEventDialogToCreateMode);
  document.getElementById("close-event-dialog-button")?.addEventListener("click", resetEventDialogToCreateMode);
  document.getElementById("event-form")?.addEventListener("submit", createEvent);
  setupEventControls();
  setupSettingsSubnav();
  setupThemeToggle();
  setupGlobalSearch();
  setupCalendarControls();
  renderCalendar();
  setupBulkActionControls();
  setupLeadsCsvImport();
  document.getElementById("feature-flags-form")?.addEventListener("submit", saveFeatureFlags);
  setupCustomerFilterSelects();
  document.getElementById("time-tracker-settings-form")?.addEventListener("submit", saveTimeTrackerSettings);
  const hoursPerDayInput = document.getElementById("hours-per-day-input");
  if (hoursPerDayInput) hoursPerDayInput.value = hoursPerDay;
  renderCustomerTable();
  renderProjectTable();
  renderLibraryTable();
  renderEventTable();
  renderLeadsTable();
  updateLeadCustomerMode();
  renderOpportunitiesTable();
  updateOpportunityCustomerMode();
  updateDashboardMetrics();
  renderRecentlyViewed();
  setupModalTopActions();
  document.getElementById("close-constellation-dialog-button")?.addEventListener("click", () => {
    document.getElementById("constellation-dialog")?.close();
  });
  document.getElementById("export-customers-csv-button")?.addEventListener("click", exportCustomersCsv);
  document.getElementById("export-leads-csv-button")?.addEventListener("click", exportLeadsCsv);
  document.getElementById("export-opportunities-csv-button")?.addEventListener("click", exportOpportunitiesCsv);
}

initialiseApp();


document.addEventListener("ba:admin-authorised", () => {
  loadLiveCustomers();
  loadLiveProjects();
  loadLiveLibrary();
  loadLiveTimeSessions();
  loadTimeTrackerSettings();
  loadLiveEvents();
  loadLiveLeads();
  loadLivePipelineConfig();
  loadLiveOpportunities();
  loadLiveAdmins();
  loadLiveMarketingOpportunities();
  loadLiveCompanyLinks();
  loadLiveCustomerMessages();
  loadLiveComingSoon();
  loadLiveFeatureRequests();
  loadLiveSocialPosts();
  loadLiveAuditLog();
  loadLiveFeatureFlags();
});

document.getElementById("coming-soon-form")?.addEventListener("submit", createComingSoonItem);

document.getElementById("add-admin-button")?.addEventListener("click", () => {
  addAdmin(
    document.getElementById("new-admin-email")?.value,
    document.getElementById("new-admin-name")?.value,
    document.getElementById("new-admin-role")?.value
  );
});
