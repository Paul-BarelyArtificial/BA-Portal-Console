const APP_VERSION = "v0.2.8e – Simplify Storage Quota Rule";

const pageTitles = {
  dashboard: "Dashboard",
  customers: "Customers",
  projects: "Projects",
  library: "Library",
  bookings: "Bookings",
  reports: "Reports",
  settings: "Settings"
};

let customers = [];
let unsubscribeCustomers = null;
let projects = [];
let unsubscribeProjects = null;


let libraryItems = [];
let unsubscribeLibrary = null;

let bookings = [];
let unsubscribeBookings = null;
let editingBookingId = null;

let currentCustomerFilter = "all";
let currentCustomerSearch = "";
let currentProjectFilter = "all";
let currentProjectSearch = "";
let currentLibraryFilter = "all";
let currentLibrarySearch = "";
let currentBookingFilter = "all";
let currentBookingSearch = "";
let selectedCustomerId = null;
let editingCustomerId = null;
let selectedProjectId = null;
let editingProjectId = null;
let selectedLibraryItemId = null;
let editingLibraryItemId = null;
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

function getStatusClass(status = "") {
  return String(status).toLowerCase().replace(/\s+/g, "-");
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function formatFirestoreDate(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") return "Just now";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(timestamp.toDate());
}

function formatBookingDateDisplay(isoDate) {
  if (!isoDate) return "No date set";
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
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
    contactName: data.contactName || "",
    contactEmail: data.contactEmail || "",
    portalAccountCreated: Boolean(data.portalAccountCreated),
    portalInviteSentAt: data.portalInviteSentAt ? formatFirestoreDate(data.portalInviteSentAt) : "",
    uploadStorageUsedBytes: Number(data.uploadStorageUsedBytes || 0)
  };
}

const UPLOAD_QUOTA_BYTES = 500 * 1024 * 1024;

function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


async function syncCustomerAccessMappings(customerList) {
  const database = firebase.firestore();
  const writes = customerList
    .filter((customer) => customer.contactEmail)
    .map((customer) => {
      const email = customer.contactEmail.trim().toLowerCase();
      const ref = database.collection("customerAccess").doc(email);
      if (customer.status === "Archived") {
        // Archived customers keep their Portal login but lose Library access:
        // removing this mapping makes the Portal treat them as unlinked.
        return ref.delete();
      }
      return ref.set({
        customerId: customer.id,
        customerName: customer.company,
        email,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
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

async function sendPortalInvite(customer) {
  const email = (customer.contactEmail || "").trim().toLowerCase();
  if (!email) return;

  const statusEl = document.querySelector(`[data-invite-status="${customer.id}"]`);
  const button = document.querySelector(`[data-send-invite="${customer.id}"]`);
  if (button) button.disabled = true;
  if (statusEl) statusEl.textContent = "Sending invite…";

  try {
    if (!customer.portalAccountCreated) {
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

    await firebase.firestore().collection("customers").doc(customer.id).set({
      portalAccountCreated: true,
      portalInviteSentAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    if (statusEl) statusEl.textContent = `Invite sent to ${email}.`;
  } catch (error) {
    console.error("Could not send Portal invite", error);
    if (statusEl) statusEl.textContent = friendlyInviteError(error);
  } finally {
    if (button) button.disabled = false;
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
    populateBookingCustomerOptions();
    updateDashboardMetrics();
  }, (error) => {
    console.error("Could not load customers", error);
    customers = [];
    renderCustomerTable();
    if (summary) summary.textContent = "Customers could not be loaded. Check Firestore access.";
  });
}

function resetCustomerDialogToCreateMode() {
  editingCustomerId = null;
  document.getElementById("customer-form")?.reset();
  const title = document.getElementById("customer-dialog-title");
  const saveButton = document.getElementById("save-customer-button");
  if (title) title.textContent = "New Customer";
  if (saveButton) saveButton.textContent = "Create Customer";
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
  form.elements.namedItem("contactName").value = customer.contactName;
  form.elements.namedItem("contactEmail").value = customer.contactEmail;
  form.elements.namedItem("notes").value = customer.notes === "No notes added." ? "" : customer.notes;
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

  saveButton.disabled = true;
  message.textContent = editingCustomerId ? "Saving changes…" : "Saving customer…";
  try {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const record = {
      company,
      status: formData.get("status") || "Trial",
      contactName: String(formData.get("contactName") || "").trim(),
      contactEmail: String(formData.get("contactEmail") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
      updatedAt: now
    };

    if (editingCustomerId) {
      await firebase.firestore().collection("customers").doc(editingCustomerId).set(record, { merge: true });
      message.textContent = "Changes saved.";
    } else {
      await firebase.firestore().collection("customers").add({
        ...record,
        owner: document.getElementById("admin-profile")?.textContent || "Paul O’Brien",
        projects: 0,
        users: 0,
        uploadStorageUsedBytes: 0,
        createdAt: now
      });
      message.textContent = "Customer created.";
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
  } catch (error) {
    console.error("Could not update customer status", error);
    alert("This customer's status could not be updated. Please try again.");
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
    description: data.description || "No description added."
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
    
    updateDashboardMetrics();
  }, (error) => {
    console.error("Could not load projects", error);
    projects = [];
    renderProjectTable();
    if (summary) summary.textContent = "Projects could not be loaded. Check Firestore access.";
  });
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
        description: String(formData.get("description") || "").trim(),
        updatedAt: now
      }, { merge: true });
      message.textContent = "Changes saved.";
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
          description: String(formData.get("description") || "").trim(),
          owner: document.getElementById("admin-profile")?.textContent || "Paul O’Brien",
          resources: 0,
          createdAt: now,
          updatedAt: now
        });
        transaction.update(customerRef, { projects: currentProjects + 1, updatedAt: now });
      });
      message.textContent = "Project created.";
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
        owner: document.getElementById("admin-profile")?.textContent || "Paul O’Brien",
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
      owner: document.getElementById("admin-profile")?.textContent || "Paul O’Brien",
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
    const searchTarget = `${escapeHtml(project.name)} ${escapeHtml(project.customer)} ${escapeHtml(project.status)} ${escapeHtml(project.type)} ${escapeHtml(project.owner)} ${escapeHtml(project.description)}`.toLowerCase();
    const matchesSearch = searchTarget.includes(currentProjectSearch.toLowerCase());
    return matchesFilter && matchesSearch;
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

function populateBookingCustomerOptions() {
  const select = document.getElementById("booking-customer");
  if (!select) return;
  const selected = select.value;
  select.innerHTML = '<option value="">Select a customer</option>' + customers
    .map((customer) => `<option value="${escapeHtml(customer.id)}">${escapeHtml(customer.company)}</option>`)
    .join("");
  if (customers.some((customer) => customer.id === selected)) select.value = selected;
}

function loadLiveBookings() {
  if (unsubscribeBookings) unsubscribeBookings();
  const summary = document.getElementById("booking-summary");
  if (summary) summary.textContent = "Loading bookings…";

  unsubscribeBookings = firebase.firestore().collection("bookings").orderBy("date").onSnapshot((snapshot) => {
    bookings = snapshot.docs.map(normaliseBooking);
    selectedBookingId = bookings.some((booking) => booking.id === selectedBookingId) ? selectedBookingId : null;
    renderBookingTable();
    updateDashboardMetrics();
  }, (error) => {
    console.error("Could not load bookings", error);
    bookings = [];
    renderBookingTable();
    if (summary) summary.textContent = "Bookings could not be loaded. Check Firestore access.";
  });
}

function resetBookingDialogToCreateMode() {
  editingBookingId = null;
  document.getElementById("booking-form")?.reset();
  const title = document.getElementById("booking-dialog-title");
  const saveButton = document.getElementById("save-booking-button");
  const customerSelect = document.getElementById("booking-customer");
  if (title) title.textContent = "New Booking";
  if (saveButton) saveButton.textContent = "Create Booking";
  if (customerSelect) customerSelect.disabled = false;
}

function openBookingDialogForEdit(booking) {
  const form = document.getElementById("booking-form");
  const dialog = document.getElementById("booking-dialog");
  const title = document.getElementById("booking-dialog-title");
  const saveButton = document.getElementById("save-booking-button");
  const customerSelect = document.getElementById("booking-customer");
  if (!form || !dialog) return;

  editingBookingId = booking.id;
  form.elements.namedItem("title").value = booking.title;
  form.elements.namedItem("type").value = booking.type;
  form.elements.namedItem("status").value = booking.status;
  form.elements.namedItem("date").value = booking.date;
  form.elements.namedItem("time").value = booking.time;
  form.elements.namedItem("duration").value = booking.duration;
  form.elements.namedItem("notes").value = booking.notes;
  if (customerSelect) {
    customerSelect.value = booking.customerId;
    customerSelect.disabled = true;
  }
  if (title) title.textContent = "Edit Booking";
  if (saveButton) saveButton.textContent = "Save Changes";
  dialog.showModal();
}

async function createBooking(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const saveButton = document.getElementById("save-booking-button");
  const message = document.getElementById("booking-form-message");
  const formData = new FormData(form);
  const title = String(formData.get("title") || "").trim();

  if (!title) {
    message.textContent = "Enter a booking title.";
    return;
  }

  const sharedFields = {
    title,
    type: formData.get("type") || "Training",
    status: formData.get("status") || "Upcoming",
    date: String(formData.get("date") || "").trim(),
    time: String(formData.get("time") || "").trim(),
    duration: String(formData.get("duration") || "").trim(),
    notes: String(formData.get("notes") || "").trim()
  };

  saveButton.disabled = true;

  try {
    const now = firebase.firestore.FieldValue.serverTimestamp();

    if (editingBookingId) {
      message.textContent = "Saving changes…";
      await firebase.firestore().collection("bookings").doc(editingBookingId).set({
        ...sharedFields,
        updatedAt: now
      }, { merge: true });
      message.textContent = "Changes saved.";
    } else {
      const customerId = String(formData.get("customerId") || "").trim();
      const customer = customers.find((item) => item.id === customerId);
      if (!customer) {
        message.textContent = "Select a customer.";
        saveButton.disabled = false;
        return;
      }

      message.textContent = "Saving booking…";
      await firebase.firestore().collection("bookings").add({
        ...sharedFields,
        customerId,
        customerName: customer.company,
        owner: document.getElementById("admin-profile")?.textContent || "Paul O’Brien",
        source: "Manual",
        customerNotes: "",
        createdAt: now,
        updatedAt: now
      });
      message.textContent = "Booking created.";
    }

    form.reset();
    setTimeout(() => {
      document.getElementById("booking-dialog")?.close();
      resetBookingDialogToCreateMode();
      message.textContent = "";
    }, 500);
  } catch (error) {
    console.error("Could not save booking", error);
    message.textContent = "Booking could not be saved. Please try again.";
  } finally {
    saveButton.disabled = false;
  }
}

async function deleteBooking(booking) {
  if (!confirm(`Delete the booking "${booking.title}" for ${booking.customer}? This cannot be undone.`)) return;
  try {
    await firebase.firestore().collection("bookings").doc(booking.id).delete();
    if (selectedBookingId === booking.id) selectedBookingId = null;
  } catch (error) {
    console.error("Could not delete booking", error);
    alert("This booking could not be deleted. Please try again.");
  }
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
        <td><strong>${escapeHtml(customer.company)}</strong><span class="table-subtext">${escapeHtml(customer.notes)}</span></td>
        <td><span class="status ${getStatusClass(customer.status)}">${escapeHtml(customer.status)}</span></td>
        <td>${customer.projects}</td>
        <td>${customer.users}</td>
        <td>${escapeHtml(customer.owner)}</td>
        <td>${escapeHtml(customer.lastUpdated)}</td>
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

  summary.textContent = `Showing ${filteredCustomers.length} of ${customers.length} live customers`;

  document.querySelectorAll("[data-customer-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCustomerId = selectedCustomerId === button.dataset.customerId ? null : button.dataset.customerId;
      renderCustomerTable();
    });
  });

  document.querySelectorAll("[data-send-invite]").forEach((button) => {
    button.addEventListener("click", () => {
      const customer = customers.find((item) => item.id === button.dataset.sendInvite);
      if (customer) sendPortalInvite(customer);
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
        <td><strong>${escapeHtml(project.name)}</strong><span class="table-subtext">${escapeHtml(project.description)}</span></td>
        <td>${escapeHtml(project.customer)}</td>
        <td><span class="status ${getStatusClass(project.status)}">${escapeHtml(project.status)}</span></td>
        <td>${escapeHtml(project.type)}</td>
        <td>${project.resources}</td>
        <td>${escapeHtml(project.lastUpdated)}</td>
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

  summary.textContent = `Showing ${filteredProjects.length} of ${projects.length} live projects`;

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
    tableBody.innerHTML = `<tr><td colspan="7" class="empty-table">No library items match your search.</td></tr>`;
  } else {
    filteredItems.forEach((item) => {
      const audience = item.visibility === "Selected Customers"
        ? (item.customerNames.join(", ") || "No customers selected")
        : item.visibility;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${escapeHtml(item.title)}</strong>${item.collection ? `<span class="collection-pill">📚 ${escapeHtml(item.collection)}</span>` : ""}<span class="table-subtext">${escapeHtml(item.description)}</span></td>
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(item.source)}</td>
        <td>${escapeHtml(audience)}</td>
        <td><span class="status ${getStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>${escapeHtml(item.lastUpdated)}</td>
        <td><button class="secondary-button compact" data-library-id="${item.id}">View</button></td>
      `;
      tableBody.appendChild(row);

      if (selectedLibraryItemId === item.id) {
        const detailRow = document.createElement("tr");
        detailRow.className = "inline-detail-row";
        detailRow.innerHTML = `<td colspan="7">${getLibraryDetailMarkup(item)}</td>`;
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
        <td><strong>${escapeHtml(booking.title)}</strong><span class="table-subtext">${escapeHtml(booking.notes)}</span></td>
        <td>${escapeHtml(booking.customer)}</td>
        <td>${escapeHtml(booking.type)}</td>
        <td><span class="status ${getStatusClass(booking.status)}">${escapeHtml(booking.status)}</span></td>
        <td>${escapeHtml(formatBookingDateDisplay(booking.date))}</td>
        <td>${escapeHtml(booking.time)}</td>
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

  summary.textContent = `Showing ${filteredBookings.length} of ${bookings.length} live bookings`;

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

  document.querySelectorAll("[data-edit-booking]").forEach((button) => {
    button.addEventListener("click", () => {
      const booking = bookings.find((item) => item.id === button.dataset.editBooking);
      if (booking) openBookingDialogForEdit(booking);
    });
  });

  document.querySelectorAll("[data-delete-booking]").forEach((button) => {
    button.addEventListener("click", () => {
      const booking = bookings.find((item) => item.id === button.dataset.deleteBooking);
      if (booking) deleteBooking(booking);
    });
  });
}

function getCustomerDetailMarkup(customer) {
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Customer record</p>
          <h3>${escapeHtml(customer.company)}</h3>
        </div>
        <div class="detail-header-actions">
          <span class="status ${getStatusClass(customer.status)}">${escapeHtml(customer.status)}</span>
          <button class="icon-button" data-close-customer-detail aria-label="Close customer detail">×</button>
        </div>
      </div>
      <div class="detail-grid">
        <div><span>Projects</span><strong>${customer.projects}</strong></div>
        <div><span>Users</span><strong>${customer.users}</strong></div>
        <div><span>Owner</span><strong>${escapeHtml(customer.owner)}</strong></div>
        <div><span>Last updated</span><strong>${escapeHtml(customer.lastUpdated)}</strong></div>
        <div><span>Contact name</span><strong>${escapeHtml(customer.contactName || "Not set")}</strong></div>
        <div><span>Contact email</span><strong>${escapeHtml(customer.contactEmail || "Not set")}</strong></div>
        <div><span>Portal login</span><strong>${customer.portalAccountCreated ? "Invite sent" : "Not set up"}</strong></div>
        <div><span>Uploads used</span><strong>${formatBytes(customer.uploadStorageUsedBytes)} of ${formatBytes(UPLOAD_QUOTA_BYTES)}</strong></div>
      </div>
      ${customer.status === "Archived" ? `<p class="muted">This customer is archived. They can still sign in to the Portal, but their Library will show no items until reactivated.</p>` : ""}
      <p>${escapeHtml(customer.notes)}</p>
      <div class="detail-actions">
        <button class="secondary-button" data-edit-customer="${customer.id}">Edit customer</button>
        <button class="secondary-button" data-page-link="projects">Open projects</button>
        <button class="secondary-button" data-send-invite="${customer.id}" ${customer.contactEmail ? "" : "disabled"}>
          ${customer.portalAccountCreated ? "Resend Portal invite" : "Send Portal invite"}
        </button>
        <button class="secondary-button" data-archive-customer="${customer.id}">
          ${customer.status === "Archived" ? "Reactivate customer" : "Archive customer"}
        </button>
      </div>
      <p class="muted" data-invite-status="${customer.id}">${
        customer.contactEmail
          ? (customer.portalInviteSentAt ? `Last invite sent ${escapeHtml(customer.portalInviteSentAt)}.` : "No invite sent yet.")
          : "Add a contact email to this customer to send a Portal invite."
      }</p>
    </div>
  `;
}

function getProjectDetailMarkup(project) {
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
      <div class="detail-grid">
        <div><span>Customer</span><strong>${escapeHtml(project.customer)}</strong></div>
        <div><span>Type</span><strong>${escapeHtml(project.type)}</strong></div>
        <div><span>Resources</span><strong>${project.resources}</strong></div>
        <div><span>Owner</span><strong>${escapeHtml(project.owner)}</strong></div>
        <div><span>Created</span><strong>${escapeHtml(project.created)}</strong></div>
        <div><span>Last updated</span><strong>${escapeHtml(project.lastUpdated)}</strong></div>
      </div>
      <p>${escapeHtml(project.description)}</p>
      <div class="detail-actions">
        <button class="secondary-button" data-edit-project="${project.id}">Edit project</button>
        <button class="secondary-button" data-page-link="library">Open Library</button>
        <button class="secondary-button" data-archive-project="${project.id}">
          ${project.status === "Archived" ? "Reactivate project" : "Archive project"}
        </button>
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
    <div class="inline-detail">
      <div class="detail-heading">
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

function getBookingDetailMarkup(booking) {
  return `
    <div class="detail-panel inline-detail-panel" aria-live="polite">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Booking record</p>
          <h3>${escapeHtml(booking.title)}</h3>
        </div>
        <div class="detail-header-actions">
          <span class="status ${getStatusClass(booking.status)}">${escapeHtml(booking.status)}</span>
          <button class="icon-button" data-close-booking-detail aria-label="Close booking detail">×</button>
        </div>
      </div>
      <div class="detail-grid">
        <div><span>Customer</span><strong>${escapeHtml(booking.customer)}</strong></div>
        <div><span>Type</span><strong>${escapeHtml(booking.type)}</strong></div>
        <div><span>Date</span><strong>${escapeHtml(formatBookingDateDisplay(booking.date))}</strong></div>
        <div><span>Time</span><strong>${escapeHtml(booking.time)}</strong></div>
        <div><span>Duration</span><strong>${escapeHtml(booking.duration)}</strong></div>
        <div><span>Source</span><strong>${escapeHtml(booking.source)}</strong></div>
        <div><span>Owner</span><strong>${escapeHtml(booking.owner)}</strong></div>
      </div>
      <p>${escapeHtml(booking.notes || "No notes added.")}</p>
      ${booking.customerNotes ? `<p class="muted"><strong>Customer's notes:</strong> ${escapeHtml(booking.customerNotes)}</p>` : ""}
      <div class="detail-actions">
        <button class="secondary-button" data-edit-booking="${booking.id}">Edit booking</button>
        <button class="secondary-button danger-button" data-delete-booking="${booking.id}">Delete booking</button>
      </div>
    </div>
  `;
}

function updateDashboardMetrics() {
  const customerMetric = document.getElementById("metric-customers");
  const customerNote = document.getElementById("metric-customers-note");
  const projectsMetric = document.getElementById("metric-projects");
  const libraryMetric = document.getElementById("metric-library");
  const bookingsMetric = document.getElementById("metric-bookings");
  const bookingsNote = document.getElementById("metric-bookings-note");
  if (!customerMetric || !customerNote || !projectsMetric || !libraryMetric || !bookingsMetric || !bookingsNote) return;

  const activeCount = customers.filter((customer) => customer.status === "Active").length;
  const trialCount = customers.filter((customer) => customer.status === "Trial").length;

  customerMetric.textContent = customers.length;
  customerNote.textContent = `${activeCount} active, ${trialCount} trial`;
  projectsMetric.textContent = projects.length;
  libraryMetric.textContent = libraryItems.length;
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

function setupSettingsControls() {
  const saveButton = document.getElementById("save-settings-button");
  if (!saveButton) return;

  saveButton.addEventListener("click", () => {
    alert("Settings are placeholders in this release. Firebase-backed saving will be added later.");
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
  setupLibraryControls();
  setupBookingControls();
  setupSettingsControls();
  setupDialog("customer-dialog", "new-customer-button", "close-dialog-button", "cancel-dialog-button");
  document.getElementById("new-customer-button")?.addEventListener("click", resetCustomerDialogToCreateMode);
  document.getElementById("cancel-dialog-button")?.addEventListener("click", resetCustomerDialogToCreateMode);
  document.getElementById("close-dialog-button")?.addEventListener("click", resetCustomerDialogToCreateMode);
  document.getElementById("customer-form")?.addEventListener("submit", createCustomer);
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
  setupDialog("booking-dialog", "new-booking-button", "close-booking-dialog-button", "cancel-booking-dialog-button");
  document.getElementById("new-booking-button")?.addEventListener("click", resetBookingDialogToCreateMode);
  document.getElementById("cancel-booking-dialog-button")?.addEventListener("click", resetBookingDialogToCreateMode);
  document.getElementById("close-booking-dialog-button")?.addEventListener("click", resetBookingDialogToCreateMode);
  document.getElementById("booking-form")?.addEventListener("submit", createBooking);
  renderCustomerTable();
  renderProjectTable();
  renderLibraryTable();
  renderBookingTable();
  updateDashboardMetrics();
}

initialiseApp();


document.addEventListener("ba:admin-authorised", () => {
  loadLiveCustomers();
  loadLiveProjects();
  loadLiveLibrary();
  loadLiveBookings();
});
