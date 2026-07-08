const APP_VERSION = "v0.1.5 – Reports";

const pageTitles = {
  dashboard: "Dashboard",
  customers: "Customers",
  projects: "Projects",
  resources: "Resources",
  bookings: "Bookings",
  reports: "Reports",
  settings: "Settings"
};

const customers = [
  {
    id: "curzon",
    company: "Curzon Outsourcing",
    status: "Active",
    projects: 2,
    users: 3,
    owner: "Paul O’Brien",
    lastUpdated: "Today",
    notes: "SEO consultation and customer portal resources."
  },
  {
    id: "hospitality-group",
    company: "Hospitality Group",
    status: "Trial",
    projects: 1,
    users: 1,
    owner: "Paul O’Brien",
    lastUpdated: "Yesterday",
    notes: "Early-stage AI training and practical guidance."
  },
  {
    id: "restaurant-demo",
    company: "Restaurant Demo Co",
    status: "Active",
    projects: 1,
    users: 2,
    owner: "Paul O’Brien",
    lastUpdated: "This week",
    notes: "Sample hospitality customer for portal testing."
  },
  {
    id: "example-customer",
    company: "Example Customer",
    status: "Paused",
    projects: 2,
    users: 2,
    owner: "Paul O’Brien",
    lastUpdated: "Last week",
    notes: "Paused sample account used for status filtering."
  }
];

const projects = [
  {
    id: "curzon-seo",
    name: "SEO Consultation",
    customer: "Curzon Outsourcing",
    status: "Active",
    type: "Consulting",
    resources: 8,
    owner: "Paul O’Brien",
    created: "2 July 2026",
    lastUpdated: "Today",
    description: "Practical SEO review, recommendations and customer-facing guidance."
  },
  {
    id: "curzon-portal",
    name: "Customer Resource Portal",
    customer: "Curzon Outsourcing",
    status: "Planning",
    type: "Portal",
    resources: 4,
    owner: "Paul O’Brien",
    created: "3 July 2026",
    lastUpdated: "Yesterday",
    description: "Example customer portal setup for training material and project documents."
  },
  {
    id: "ba-console",
    name: "Barely Artificial Console",
    customer: "Barely Artificial",
    status: "Active",
    type: "Internal Product",
    resources: 12,
    owner: "Paul O’Brien",
    created: "8 July 2026",
    lastUpdated: "Today",
    description: "Internal management console for customers, projects, resources and bookings."
  },
  {
    id: "hospitality-ai",
    name: "AI Quick Start",
    customer: "Hospitality Group",
    status: "Active",
    type: "Training",
    resources: 6,
    owner: "Paul O’Brien",
    created: "28 June 2026",
    lastUpdated: "This week",
    description: "Introductory AI training and practical adoption plan for hospitality teams."
  },
  {
    id: "restaurant-demo",
    name: "Restaurant Demo Portal",
    customer: "Restaurant Demo Co",
    status: "Completed",
    type: "Demo",
    resources: 5,
    owner: "Paul O’Brien",
    created: "20 June 2026",
    lastUpdated: "Last week",
    description: "Completed sample project used to test portal structure and content flow."
  },
  {
    id: "archive-test",
    name: "Legacy Training Pack",
    customer: "Example Customer",
    status: "Archived",
    type: "Training",
    resources: 3,
    owner: "Paul O’Brien",
    created: "10 June 2026",
    lastUpdated: "Last month",
    description: "Archived sample project used for status filtering and table behaviour."
  }
];

const resources = [
  {
    id: "ai-basics-guide",
    name: "AI Basics Guide",
    customer: "Curzon Outsourcing",
    project: "SEO Consultation",
    type: "Training Guide",
    status: "Published",
    visibility: "Customer Portal",
    owner: "Paul O’Brien",
    lastUpdated: "Today",
    description: "Introductory guide explaining AI in simple business terms."
  },
  {
    id: "prompt-writing",
    name: "Prompt Writing Quick Start",
    customer: "Hospitality Group",
    project: "AI Quick Start",
    type: "Training Guide",
    status: "Draft",
    visibility: "Internal Only",
    owner: "Paul O’Brien",
    lastUpdated: "Yesterday",
    description: "Short practical guide for writing better prompts."
  },
  {
    id: "project-proposal",
    name: "Project Proposal",
    customer: "Curzon Outsourcing",
    project: "Customer Resource Portal",
    type: "Document",
    status: "Published",
    visibility: "Customer Portal",
    owner: "Paul O’Brien",
    lastUpdated: "This week",
    description: "Customer-facing proposal and agreed direction."
  },
  {
    id: "statement-of-work",
    name: "Statement of Work",
    customer: "Restaurant Demo Co",
    project: "Restaurant Demo Portal",
    type: "Document",
    status: "Archived",
    visibility: "Internal Only",
    owner: "Paul O’Brien",
    lastUpdated: "Last week",
    description: "Archived sample SOW used for resource status testing."
  },
  {
    id: "chatgpt-link",
    name: "ChatGPT",
    customer: "Hospitality Group",
    project: "AI Quick Start",
    type: "Useful Link",
    status: "Published",
    visibility: "Customer Portal",
    owner: "Paul O’Brien",
    lastUpdated: "Today",
    description: "External link used in customer AI training sessions."
  },
  {
    id: "console-readme",
    name: "Console README",
    customer: "Barely Artificial",
    project: "Barely Artificial Console",
    type: "Document",
    status: "Draft",
    visibility: "Internal Only",
    owner: "Paul O’Brien",
    lastUpdated: "Today",
    description: "Internal notes for the Console application."
  }
];

const bookings = [
  {
    id: "curzon-training",
    title: "Training Session",
    customer: "Curzon Outsourcing",
    type: "Training",
    status: "Upcoming",
    date: "Tomorrow",
    time: "10:00",
    duration: "30 minutes",
    owner: "Paul O’Brien",
    source: "Calendly",
    notes: "Portal walkthrough and resource library review."
  },
  {
    id: "hospitality-ai-advice",
    title: "AI Advice Call",
    customer: "Hospitality Group",
    type: "AI Advice",
    status: "Upcoming",
    date: "This week",
    time: "14:30",
    duration: "30 minutes",
    owner: "Paul O’Brien",
    source: "Calendly",
    notes: "Discuss practical AI use cases for hospitality teams."
  },
  {
    id: "restaurant-demo-review",
    title: "Project Review",
    customer: "Restaurant Demo Co",
    type: "Project",
    status: "Completed",
    date: "Last week",
    time: "11:00",
    duration: "45 minutes",
    owner: "Paul O’Brien",
    source: "Manual",
    notes: "Review completed demo portal and resource structure."
  },
  {
    id: "example-cancelled",
    title: "Strategy Session",
    customer: "Example Customer",
    type: "Strategy",
    status: "Cancelled",
    date: "Last month",
    time: "16:00",
    duration: "30 minutes",
    owner: "Paul O’Brien",
    source: "Manual",
    notes: "Cancelled sample booking used for status filtering."
  }
];

let currentCustomerFilter = "all";
let currentCustomerSearch = "";
let currentProjectFilter = "all";
let currentProjectSearch = "";
let currentResourceFilter = "all";
let currentResourceSearch = "";
let currentBookingFilter = "all";
let currentBookingSearch = "";
let selectedCustomerId = null;
let selectedProjectId = null;
let selectedResourceId = null;
let selectedBookingId = null;

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active-page", page.id === pageId);
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageId);
  });

  document.getElementById("page-title").textContent = pageTitles[pageId] || "Dashboard";
}

function getStatusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function getFilteredCustomers() {
  return customers.filter((customer) => {
    const matchesFilter = currentCustomerFilter === "all" || customer.status === currentCustomerFilter;
    const searchTarget = `${customer.company} ${customer.status} ${customer.owner} ${customer.notes}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentCustomerSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

function getFilteredProjects() {
  return projects.filter((project) => {
    const matchesFilter = currentProjectFilter === "all" || project.status === currentProjectFilter;
    const searchTarget = `${project.name} ${project.customer} ${project.status} ${project.type} ${project.owner} ${project.description}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentProjectSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

function getFilteredResources() {
  return resources.filter((resource) => {
    const matchesFilter = currentResourceFilter === "all" || resource.type === currentResourceFilter;
    const searchTarget = `${resource.name} ${resource.customer} ${resource.project} ${resource.type} ${resource.status} ${resource.visibility} ${resource.owner} ${resource.description}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentResourceSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

function getFilteredBookings() {
  return bookings.filter((booking) => {
    const matchesFilter = currentBookingFilter === "all" || booking.status === currentBookingFilter;
    const searchTarget = `${booking.title} ${booking.customer} ${booking.type} ${booking.status} ${booking.date} ${booking.time} ${booking.owner} ${booking.source} ${booking.notes}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentBookingSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

function renderCustomerTable() {
  const tableBody = document.getElementById("customers-table");
  const summary = document.getElementById("customer-summary");
  if (!tableBody || !summary) return;

  const filteredCustomers = getFilteredCustomers();
  tableBody.innerHTML = "";

  if (filteredCustomers.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="empty-table">No customers match your search.</td></tr>`;
  } else {
    filteredCustomers.forEach((customer) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${customer.company}</strong><span class="table-subtext">${customer.notes}</span></td>
        <td><span class="status ${getStatusClass(customer.status)}">${customer.status}</span></td>
        <td>${customer.projects}</td>
        <td>${customer.users}</td>
        <td>${customer.owner}</td>
        <td>${customer.lastUpdated}</td>
        <td><button class="secondary-button compact" data-customer-id="${customer.id}">View</button></td>
      `;
      tableBody.appendChild(row);

      if (selectedCustomerId === customer.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="7">${getCustomerDetailMarkup(customer)}</td>`;
        tableBody.appendChild(detailRow);
      }
    });
  }

  summary.textContent = `Showing ${filteredCustomers.length} of ${customers.length} sample customers`;

  document.querySelectorAll("[data-customer-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCustomerId = selectedCustomerId === button.dataset.customerId ? null : button.dataset.customerId;
      renderCustomerTable();
    });
  });

  document.querySelectorAll("[data-close-customer-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCustomerId = null;
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
    tableBody.innerHTML = `<tr><td colspan="7" class="empty-table">No projects match your search.</td></tr>`;
  } else {
    filteredProjects.forEach((project) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${project.name}</strong><span class="table-subtext">${project.description}</span></td>
        <td>${project.customer}</td>
        <td><span class="status ${getStatusClass(project.status)}">${project.status}</span></td>
        <td>${project.type}</td>
        <td>${project.resources}</td>
        <td>${project.lastUpdated}</td>
        <td><button class="secondary-button compact" data-project-id="${project.id}">View</button></td>
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

  summary.textContent = `Showing ${filteredProjects.length} of ${projects.length} sample projects`;

  document.querySelectorAll("[data-project-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedProjectId = selectedProjectId === button.dataset.projectId ? null : button.dataset.projectId;
      renderProjectTable();
    });
  });

  document.querySelectorAll("[data-close-project-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedProjectId = null;
      renderProjectTable();
    });
  });

  document.querySelectorAll("[data-page-link]").forEach((item) => {
    item.addEventListener("click", () => showPage(item.dataset.pageLink));
  });
}

function renderResourceTable() {
  const tableBody = document.getElementById("resources-table");
  const summary = document.getElementById("resource-summary");
  if (!tableBody || !summary) return;

  const filteredResources = getFilteredResources();
  tableBody.innerHTML = "";

  if (filteredResources.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="empty-table">No resources match your search.</td></tr>`;
  } else {
    filteredResources.forEach((resource) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${resource.name}</strong><span class="table-subtext">${resource.description}</span></td>
        <td>${resource.customer}</td>
        <td>${resource.project}</td>
        <td>${resource.type}</td>
        <td><span class="status ${getStatusClass(resource.status)}">${resource.status}</span></td>
        <td>${resource.lastUpdated}</td>
        <td><button class="secondary-button compact" data-resource-id="${resource.id}">View</button></td>
      `;
      tableBody.appendChild(row);

      if (selectedResourceId === resource.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="7">${getResourceDetailMarkup(resource)}</td>`;
        tableBody.appendChild(detailRow);
      }
    });
  }

  summary.textContent = `Showing ${filteredResources.length} of ${resources.length} sample resources`;

  document.querySelectorAll("[data-resource-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedResourceId = selectedResourceId === button.dataset.resourceId ? null : button.dataset.resourceId;
      renderResourceTable();
    });
  });

  document.querySelectorAll("[data-close-resource-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedResourceId = null;
      renderResourceTable();
    });
  });
}

function renderBookingTable() {
  const tableBody = document.getElementById("bookings-table");
  const summary = document.getElementById("booking-summary");
  if (!tableBody || !summary) return;

  const filteredBookings = getFilteredBookings();
  tableBody.innerHTML = "";

  if (filteredBookings.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="empty-table">No bookings match your search.</td></tr>`;
  } else {
    filteredBookings.forEach((booking) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${booking.title}</strong><span class="table-subtext">${booking.notes}</span></td>
        <td>${booking.customer}</td>
        <td>${booking.type}</td>
        <td><span class="status ${getStatusClass(booking.status)}">${booking.status}</span></td>
        <td>${booking.date}</td>
        <td>${booking.time}</td>
        <td><button class="secondary-button compact" data-booking-id="${booking.id}">View</button></td>
      `;
      tableBody.appendChild(row);

      if (selectedBookingId === booking.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="7">${getBookingDetailMarkup(booking)}</td>`;
        tableBody.appendChild(detailRow);
      }
    });
  }

  summary.textContent = `Showing ${filteredBookings.length} of ${bookings.length} sample bookings`;

  document.querySelectorAll("[data-booking-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedBookingId = selectedBookingId === button.dataset.bookingId ? null : button.dataset.bookingId;
      renderBookingTable();
    });
  });

  document.querySelectorAll("[data-close-booking-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedBookingId = null;
      renderBookingTable();
    });
  });
}

function getCustomerDetailMarkup(customer) {
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Customer record</p>
          <h3>${customer.company}</h3>
        </div>
        <div class="detail-header-actions">
          <span class="status ${getStatusClass(customer.status)}">${customer.status}</span>
          <button class="icon-button" data-close-customer-detail aria-label="Close customer detail">×</button>
        </div>
      </div>
      <div class="detail-grid">
        <div><span>Projects</span><strong>${customer.projects}</strong></div>
        <div><span>Users</span><strong>${customer.users}</strong></div>
        <div><span>Owner</span><strong>${customer.owner}</strong></div>
        <div><span>Last updated</span><strong>${customer.lastUpdated}</strong></div>
      </div>
      <p>${customer.notes}</p>
      <div class="detail-actions">
        <button class="secondary-button">Edit later</button>
        <button class="secondary-button" data-page-link="projects">Open projects</button>
      </div>
    </div>
  `;
}

function getProjectDetailMarkup(project) {
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Project record</p>
          <h3>${project.name}</h3>
        </div>
        <div class="detail-header-actions">
          <span class="status ${getStatusClass(project.status)}">${project.status}</span>
          <button class="icon-button" data-close-project-detail aria-label="Close project detail">×</button>
        </div>
      </div>
      <div class="detail-grid">
        <div><span>Customer</span><strong>${project.customer}</strong></div>
        <div><span>Type</span><strong>${project.type}</strong></div>
        <div><span>Resources</span><strong>${project.resources}</strong></div>
        <div><span>Owner</span><strong>${project.owner}</strong></div>
        <div><span>Created</span><strong>${project.created}</strong></div>
        <div><span>Last updated</span><strong>${project.lastUpdated}</strong></div>
      </div>
      <p>${project.description}</p>
      <div class="detail-actions">
        <button class="secondary-button">Edit later</button>
        <button class="secondary-button" data-page-link="resources">Open resources later</button>
      </div>
    </div>
  `;
}

function getResourceDetailMarkup(resource) {
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Resource record</p>
          <h3>${resource.name}</h3>
        </div>
        <div class="detail-header-actions">
          <span class="status ${getStatusClass(resource.status)}">${resource.status}</span>
          <button class="icon-button" data-close-resource-detail aria-label="Close resource detail">×</button>
        </div>
      </div>
      <div class="detail-grid">
        <div><span>Customer</span><strong>${resource.customer}</strong></div>
        <div><span>Project</span><strong>${resource.project}</strong></div>
        <div><span>Type</span><strong>${resource.type}</strong></div>
        <div><span>Visibility</span><strong>${resource.visibility}</strong></div>
        <div><span>Owner</span><strong>${resource.owner}</strong></div>
        <div><span>Last updated</span><strong>${resource.lastUpdated}</strong></div>
      </div>
      <p>${resource.description}</p>
      <div class="detail-actions">
        <button class="secondary-button">Edit later</button>
        <button class="secondary-button">Assign later</button>
      </div>
    </div>
  `;
}

function getBookingDetailMarkup(booking) {
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Booking record</p>
          <h3>${booking.title}</h3>
        </div>
        <div class="detail-header-actions">
          <span class="status ${getStatusClass(booking.status)}">${booking.status}</span>
          <button class="icon-button" data-close-booking-detail aria-label="Close booking detail">×</button>
        </div>
      </div>
      <div class="detail-grid">
        <div><span>Customer</span><strong>${booking.customer}</strong></div>
        <div><span>Type</span><strong>${booking.type}</strong></div>
        <div><span>Date</span><strong>${booking.date}</strong></div>
        <div><span>Time</span><strong>${booking.time}</strong></div>
        <div><span>Duration</span><strong>${booking.duration}</strong></div>
        <div><span>Source</span><strong>${booking.source}</strong></div>
        <div><span>Owner</span><strong>${booking.owner}</strong></div>
      </div>
      <p>${booking.notes}</p>
      <div class="detail-actions">
        <button class="secondary-button">Edit later</button>
        <button class="secondary-button">Open calendar later</button>
      </div>
    </div>
  `;
}

function updateDashboardMetrics() {
  const customerMetric = document.getElementById("metric-customers");
  const customerNote = document.getElementById("metric-customers-note");
  const projectsMetric = document.getElementById("metric-projects");
  const resourcesMetric = document.getElementById("metric-resources");
  const bookingsMetric = document.getElementById("metric-bookings");
  const bookingsNote = document.getElementById("metric-bookings-note");
  if (!customerMetric || !customerNote || !projectsMetric || !resourcesMetric || !bookingsMetric || !bookingsNote) return;

  const activeCount = customers.filter((customer) => customer.status === "Active").length;
  const trialCount = customers.filter((customer) => customer.status === "Trial").length;

  customerMetric.textContent = customers.length;
  customerNote.textContent = `${activeCount} active, ${trialCount} trial`;
  projectsMetric.textContent = projects.length;
  resourcesMetric.textContent = resources.length;
  bookingsMetric.textContent = bookings.length;
  bookingsNote.textContent = `${bookings.filter((booking) => booking.status === "Upcoming").length} upcoming`;
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

function setupResourceControls() {
  const searchInput = document.getElementById("resource-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentResourceSearch = event.target.value;
      renderResourceTable();
    });
  }

  document.querySelectorAll(".resource-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentResourceFilter = button.dataset.resourceFilter;
      document.querySelectorAll(".resource-filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderResourceTable();
    });
  });
}

function setupBookingControls() {
  const searchInput = document.getElementById("booking-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentBookingSearch = event.target.value;
      renderBookingTable();
    });
  }

  document.querySelectorAll(".booking-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentBookingFilter = button.dataset.bookingFilter;
      document.querySelectorAll(".booking-filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderBookingTable();
    });
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
    item.addEventListener("click", () => showPage(item.dataset.page));
  });

  document.querySelectorAll("[data-page-link]").forEach((item) => {
    item.addEventListener("click", () => showPage(item.dataset.pageLink));
  });
}

function initialiseApp() {
  document.getElementById("version-label").textContent = APP_VERSION;
  setupNavigation();
  setupCustomerControls();
  setupProjectControls();
  setupResourceControls();
  setupBookingControls();
  setupDialog("customer-dialog", "new-customer-button", "close-dialog-button", "cancel-dialog-button");
  setupDialog("project-dialog", "new-project-button", "close-project-dialog-button", "cancel-project-dialog-button");
  setupDialog("resource-dialog", "new-resource-button", "close-resource-dialog-button", "cancel-resource-dialog-button");
  setupDialog("booking-dialog", "new-booking-button", "close-booking-dialog-button", "cancel-booking-dialog-button");
  renderCustomerTable();
  renderProjectTable();
  renderResourceTable();
  renderBookingTable();
  updateDashboardMetrics();
}

initialiseApp();
