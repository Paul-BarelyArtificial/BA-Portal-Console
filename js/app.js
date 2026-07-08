const APP_VERSION = "v0.1.0 – Foundation";

const pageTitles = {
  dashboard: "Dashboard",
  customers: "Customers",
  projects: "Projects",
  resources: "Resources",
  bookings: "Bookings",
  reports: "Reports",
  settings: "Settings"
};

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active-page", page.id === pageId);
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageId);
  });

  document.getElementById("page-title").textContent = pageTitles[pageId] || "Dashboard";
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => showPage(item.dataset.page));
});

document.querySelectorAll("[data-page-link]").forEach((item) => {
  item.addEventListener("click", () => showPage(item.dataset.pageLink));
});

document.getElementById("version-label").textContent = APP_VERSION;
