/*
==================================================
BA Console
Version : v0.2.0
Release : Firebase Authentication
==================================================
*/

const auth = firebase.auth();
const db = firebase.firestore();

const authScreen = document.getElementById("auth-screen");
const consoleShell = document.querySelector(".console-shell");
const loginForm = document.getElementById("admin-login-form");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const loginButton = document.getElementById("admin-login-button");
const authStatus = document.getElementById("auth-status");
const authError = document.getElementById("auth-error");
const accessDenied = document.getElementById("access-denied");
const signoutButton = document.getElementById("admin-signout-button");
const deniedSignoutButton = document.getElementById("denied-signout-button");
const adminProfile = document.getElementById("admin-profile");

function showLogin(message = "Enter your administrator email address and password.") {
  document.body.className = "auth-locked";
  authScreen.hidden = false;
  consoleShell.setAttribute("aria-hidden", "true");
  loginForm.hidden = false;
  accessDenied.hidden = true;
  authStatus.textContent = message;
  authError.hidden = true;
  passwordInput.value = "";
  emailInput.focus();
}

function showAccessDenied(user) {
  document.body.className = "auth-locked";
  authScreen.hidden = false;
  consoleShell.setAttribute("aria-hidden", "true");
  loginForm.hidden = true;
  accessDenied.hidden = false;
  const intro = document.getElementById("auth-intro");
  if (intro) intro.textContent = user?.email || "This account is not authorised.";
}

function unlockConsole(user, adminData = {}) {
  document.body.className = "auth-unlocked";
  authScreen.hidden = true;
  consoleShell.setAttribute("aria-hidden", "false");
  const displayName = adminData.name || user.displayName || user.email || "Administrator";
  adminProfile.textContent = displayName;
}

function friendlyAuthError(error) {
  const messages = {
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-credential": "The email address or password is incorrect.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "auth/network-request-failed": "The Console could not reach Firebase. Check your connection and try again."
  };
  return messages[error?.code] || "Sign-in failed. Check your details and try again.";
}

async function isAuthorisedAdmin(user) {
  const adminDocument = await db.collection("admins").doc(user.uid).get();
  if (!adminDocument.exists) return { authorised: false };

  const adminData = adminDocument.data() || {};
  return {
    authorised: adminData.active !== false && adminData.role === "admin",
    adminData
  };
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authError.hidden = true;
  authStatus.textContent = "Signing in…";
  loginButton.disabled = true;

  try {
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    await auth.signInWithEmailAndPassword(emailInput.value.trim(), passwordInput.value);
  } catch (error) {
    authError.textContent = friendlyAuthError(error);
    authError.hidden = false;
    authStatus.textContent = "";
  } finally {
    loginButton.disabled = false;
  }
});

async function signOut() {
  signoutButton.disabled = true;
  deniedSignoutButton.disabled = true;
  try {
    await auth.signOut();
  } finally {
    signoutButton.disabled = false;
    deniedSignoutButton.disabled = false;
  }
}

signoutButton.addEventListener("click", signOut);
deniedSignoutButton.addEventListener("click", signOut);

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    showLogin();
    return;
  }

  document.body.className = "auth-checking";
  authStatus.textContent = "Checking administrator access…";

  try {
    const result = await isAuthorisedAdmin(user);
    if (result.authorised) {
      unlockConsole(user, result.adminData);
    } else {
      showAccessDenied(user);
    }
  } catch (error) {
    console.error("Admin access check failed", error);
    await auth.signOut();
    showLogin("We could not verify administrator access. Please try again.");
  }
});
