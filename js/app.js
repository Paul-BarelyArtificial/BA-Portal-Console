const APP_VERSION = "v0.1.1 – Customers";

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

let currentCustomerFilter = "all";
let currentCustomerSearch = "";

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
  return status.toLowerCase();
}

function getFilteredCustomers() {
  return customers.filter((customer) => {
    const matchesFilter = currentCustomerFilter === "all" || customer.status === currentCustomerFilter;
    const searchTarget = `${customer.company} ${customer.status} ${customer.owner} ${customer.notes}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentCustomerSearch.toLowerCase());
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
    });
  }

  summary.textContent = `Showing ${filteredCustomers.length} of ${customers.length} sample customers`;

  document.querySelectorAll("[data-customer-id]").forEach((button) => {
    button.addEventListener("click", () => renderCustomerDetail(button.dataset.customerId));
  });
}

function renderCustomerDetail(customerId) {
  const customer = customers.find((item) => item.id === customerId);
  const detailPanel = document.getElementById("customer-detail");
  if (!customer || !detailPanel) return;

  detailPanel.classList.remove("hidden");
  detailPanel.innerHTML = `
    <div class="detail-header">
      <div>
        <p class="eyebrow">Customer record</p>
        <h3>${customer.company}</h3>
      </div>
      <span class="status ${getStatusClass(customer.status)}">${customer.status}</span>
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
      <button class="secondary-button">Open projects later</button>
    </div>
  `;
}

function updateDashboardMetrics() {
  const customerMetric = document.getElementById("metric-customers");
  const customerNote = document.getElementById("metric-customers-note");
  const projectsMetric = document.getElementById("metric-projects");
  if (!customerMetric || !customerNote || !projectsMetric) return;

  const activeCount = customers.filter((customer) => customer.status === "Active").length;
  const trialCount = customers.filter((customer) => customer.status === "Trial").length;
  const projectCount = customers.reduce((total, customer) => total + customer.projects, 0);

  customerMetric.textContent = customers.length;
  customerNote.textContent = `${activeCount} active, ${trialCount} trial`;
  projectsMetric.textContent = projectCount;
}

function setupCustomerControls() {
  const searchInput = document.getElementById("customer-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      currentCustomerSearch = event.target.value;
      renderCustomerTable();
    });
  }

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentCustomerFilter = button.dataset.filter;
      document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderCustomerTable();
    });
  });
}

function setupDialog() {
  const dialog = document.getElementById("customer-dialog");
  const openButton = document.getElementById("new-customer-button");
  const closeButton = document.getElementById("close-dialog-button");
  const cancelButton = document.getElementById("cancel-dialog-button");

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
  setupDialog();
  renderCustomerTable();
  updateDashboardMetrics();
}

initialiseApp();
