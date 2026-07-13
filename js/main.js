/*
==================================================
BA Portal
Version : v0.2.1
Release : Firebase Authentication
Date    : 13 July 2026
==================================================
*/

const buttons = document.querySelectorAll(".nav-button");
const pages = document.querySelectorAll(".page");

// ---------- Firebase Authentication ----------

const auth = firebase.auth();

const customerProfile = {
    customerName: "Barely Artificial",
    projectName: "AI Customer Portal",
    contactName: "Paul O’Brien",
    accessStatus: "Active",
    accessLevel: "Administrator testing access",
    accessExpiry: "No expiry set",
    projectSummary: "Resources, training and booking are available."
};

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function applyCustomerProfile(user) {
    setText("dashboard-customer-name", customerProfile.customerName);
    setText("dashboard-project-name", customerProfile.projectName);
    setText("dashboard-project-summary", customerProfile.projectSummary);
    setText("account-customer-name", customerProfile.customerName);
    setText("account-project-name", customerProfile.projectName);
    setText("account-contact-name", customerProfile.contactName);
    setText("account-access-status", customerProfile.accessStatus);
    setText("account-access-level", customerProfile.accessLevel);
    setText("account-access-expiry", customerProfile.accessExpiry);
    setText("account-email", user?.email || "—");
}

function unlockPortal(user) {
    document.body.classList.remove("access-locked");
    document.body.classList.add("access-unlocked");
    applyCustomerProfile(user);
    showPage("dashboard");
}

function lockPortal() {
    document.body.classList.add("access-locked");
    document.body.classList.remove("access-unlocked");
}

function friendlyAuthError(error) {
    const messages = {
        "auth/invalid-email": "Enter a valid email address.",
        "auth/invalid-credential": "The email address or password is incorrect.",
        "auth/user-disabled": "This account has been disabled. Please contact Barely Artificial.",
        "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
        "auth/network-request-failed": "The portal could not reach Firebase. Check your internet connection and try again."
    };
    return messages[error?.code] || "Sign-in failed. Please check your details and try again.";
}

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginError = document.getElementById("login-error");
const loginStatus = document.getElementById("login-status");
const logoutButton = document.getElementById("logout-button");

loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.hidden = true;
    loginStatus.textContent = "Signing in…";
    loginButton.disabled = true;

    try {
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        await auth.signInWithEmailAndPassword(loginEmail.value.trim(), loginPassword.value);
        loginForm.reset();
    } catch (error) {
        loginError.textContent = friendlyAuthError(error);
        loginError.hidden = false;
        loginStatus.textContent = "";
    } finally {
        loginButton.disabled = false;
    }
});

logoutButton?.addEventListener("click", async () => {
    logoutButton.disabled = true;
    try {
        await auth.signOut();
    } finally {
        logoutButton.disabled = false;
    }
});

auth.onAuthStateChanged((user) => {
    if (user) {
        loginError.hidden = true;
        loginStatus.textContent = "";
        unlockPortal(user);
    } else {
        lockPortal();
        loginStatus.textContent = "Enter your email address and password.";
        loginEmail?.focus();
    }
});

function showPage(target) {
    buttons.forEach((button) => button.classList.remove("active"));
    pages.forEach((page) => page.classList.remove("active"));

    document
        .querySelector(`[data-page="${target}"]`)
        ?.classList.add("active");

    document
        .getElementById(target)
        ?.classList.add("active");
}

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

// ---------- Dashboard Card Navigation ----------

const dashboardCards = document.querySelectorAll("[data-page-link]");

dashboardCards.forEach((card) => {
    card.style.cursor = "pointer";

    card.addEventListener("click", () => {
        showPage(card.dataset.pageLink);
    });
});

// ---------- Page Buttons ----------

const pageButtons = document.querySelectorAll("[data-target-page]");

pageButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        showPage(button.dataset.targetPage);
    });
});


// ---------- Resources ----------

const resources = [
    {
        icon: "📘",
        title: "AI Basics for SMEs",
        description: "A plain-English introduction to what AI is and where it can help.",
        category: "Training Guides",
        type: "Guide",
        updated: "Added this week",
        action: "Open",
        url: "#",
        isNew: true
    },
    {
        icon: "💬",
        title: "Getting Started with ChatGPT",
        description: "A simple guide to using ChatGPT safely and usefully.",
        category: "Training Guides",
        type: "Guide",
        updated: "Updated 8 July",
        action: "Open",
        url: "#",
        isNew: true
    },
    {
        icon: "✍️",
        title: "Prompt Writing Basics",
        description: "How to ask clearer questions and get better answers from AI tools.",
        category: "Training Guides",
        type: "Guide",
        updated: "Updated 8 July",
        action: "Open",
        url: "#",
        isNew: false
    },
    {
        icon: "📄",
        title: "Project Proposal",
        description: "The agreed project approach, scope and objectives.",
        category: "Project Documents",
        type: "PDF",
        updated: "Updated 3 July",
        action: "Open",
        url: "#",
        isNew: true
    },
    {
        icon: "📄",
        title: "Statement of Work",
        description: "What is included, what is not included, and how delivery will work.",
        category: "Project Documents",
        type: "Document",
        updated: "Updated 3 July",
        action: "Open",
        url: "#",
        isNew: false
    },
    {
        icon: "✅",
        title: "Customer Readiness Checklist",
        description: "A simple checklist showing what we need from you and when.",
        category: "Project Documents",
        type: "Checklist",
        updated: "Updated 4 July",
        action: "Open",
        url: "#",
        isNew: false
    },
    {
        icon: "🌐",
        title: "ChatGPT",
        description: "Open ChatGPT in a new browser tab.",
        category: "Useful Links",
        type: "Website",
        updated: "Useful link",
        action: "Visit",
        url: "https://chatgpt.com/",
        isNew: false
    },
    {
        icon: "🌐",
        title: "Claude",
        description: "Open Claude in a new browser tab.",
        category: "Useful Links",
        type: "Website",
        updated: "Useful link",
        action: "Visit",
        url: "https://claude.ai/",
        isNew: false
    },
    {
        icon: "🌐",
        title: "Barely Artificial",
        description: "Visit the Barely Artificial website.",
        category: "Useful Links",
        type: "Website",
        updated: "Useful link",
        action: "Visit",
        url: "https://www.barelyartificial.com/",
        isNew: false
    }
];

const resourceContainers = {
    "Training Guides": document.getElementById("training-guide-resources"),
    "Project Documents": document.getElementById("project-document-resources"),
    "Useful Links": document.getElementById("useful-link-resources")
};

function createResourceCard(resource) {
    const card = document.createElement("article");
    card.className = "card resource-card";
    card.dataset.searchText = `${resource.title} ${resource.description} ${resource.category} ${resource.type}`.toLowerCase();

    const newBadge = resource.isNew ? '<span class="badge new-badge">New</span>' : "";

    card.innerHTML = `
        <div class="resource-card-header">
            <div class="resource-icon">${resource.icon}</div>
            <div>
                <h3>${resource.title}</h3>
                <div class="resource-type">${resource.type}</div>
            </div>
            ${newBadge}
        </div>
        <p>${resource.description}</p>
        <div class="resource-footer">
            <span>${resource.updated}</span>
            <button type="button">${resource.action}</button>
        </div>
    `;

    card.querySelector("button").addEventListener("click", () => {
        if (resource.url === "#") {
            return;
        }
        window.open(resource.url, "_blank", "noopener,noreferrer");
    });

    return card;
}

function renderResources(filterText = "") {
    const normalisedFilter = filterText.trim().toLowerCase();
    const recentContainer = document.getElementById("recent-resources");
    const emptyState = document.getElementById("resource-empty");

    Object.values(resourceContainers).forEach((container) => {
        if (container) container.innerHTML = "";
    });

    if (recentContainer) {
        recentContainer.innerHTML = "";
    }

    let visibleCount = 0;

    resources.forEach((resource) => {
        const searchText = `${resource.title} ${resource.description} ${resource.category} ${resource.type}`.toLowerCase();

        if (normalisedFilter && !searchText.includes(normalisedFilter)) {
            return;
        }

        visibleCount += 1;

        const mainContainer = resourceContainers[resource.category];
        if (mainContainer) {
            mainContainer.appendChild(createResourceCard(resource));
        }

        if (resource.isNew && recentContainer) {
            recentContainer.appendChild(createResourceCard(resource));
        }
    });

    document.querySelectorAll(".resource-section").forEach((section) => {
        const grid = section.querySelector(".resource-grid");
        section.hidden = !grid || grid.children.length === 0;
    });

    if (emptyState) {
        emptyState.hidden = visibleCount > 0;
    }
}

const resourceSearch = document.getElementById("resource-search");

if (resourceSearch) {
    resourceSearch.addEventListener("input", () => {
        renderResources(resourceSearch.value);
    });
}

renderResources();

// ---------- Book a Session ----------

const calendlyUrl = "https://calendly.com/paul-barelyartificial/new-meeting";

const sessions = [
    {
        icon: "🎓",
        title: "Training Session",
        description: "Book time to go through the portal, documents, or AI tools.",
        duration: "30 minutes",
        location: "Online",
        calendlyUrl,
        enabled: true
    },
    {
        icon: "💡",
        title: "AI Advice",
        description: "Talk through a practical business problem or AI idea.",
        duration: "30 minutes",
        location: "Online",
        calendlyUrl,
        enabled: true
    },
    {
        icon: "🚀",
        title: "Project / Strategy Session",
        description: "Discuss a new project, improvement, or next step.",
        duration: "30 minutes",
        location: "Online",
        calendlyUrl,
        enabled: true
    }
];

function openCalendly(url) {
    if (window.Calendly && typeof window.Calendly.initPopupWidget === "function") {
        window.Calendly.initPopupWidget({ url });
    } else {
        window.open(url, "_blank", "noopener,noreferrer");
    }
}

function renderSessions() {
    const sessionList = document.getElementById("session-list");

    if (!sessionList) {
        return;
    }

    sessionList.innerHTML = "";

    sessions.forEach((session) => {
        const card = document.createElement("div");
        card.className = session.enabled ? "card session-card" : "card session-card muted";

        const buttonHtml = session.enabled
            ? '<button type="button" class="session-button">Book Session</button>'
            : '<span class="badge">Coming Soon</span>';

        card.innerHTML = `
            <h3>${session.icon} ${session.title}</h3>
            <p>${session.description}</p>
            <div class="session-meta">
                <span>${session.duration}</span>
                <span>${session.location}</span>
            </div>
            ${buttonHtml}
        `;

        if (session.enabled) {
            card.querySelector("button").addEventListener("click", () => {
                openCalendly(session.calendlyUrl);
            });
        }

        sessionList.appendChild(card);
    });
}

renderSessions();

// ---------- Version Display ----------

const versionElement = document.querySelector(".app-version");

if (versionElement) {
    versionElement.textContent = `${APP_VERSION} – ${RELEASE_NAME}`;
}
