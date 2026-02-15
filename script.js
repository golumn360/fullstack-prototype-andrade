// Initialize database
window.db = JSON.parse(localStorage.getItem("db")) || {
  accounts: []
};

function saveToStorage() {
  localStorage.setItem("db", JSON.stringify(window.db));
}


const pages = document.querySelectorAll('.page');

function handleRouting() {
  let hash = window.location.hash;

  if (!hash) {
    hash = "#/";
  }

  const route = hash.replace("#/", "");

  pages.forEach(page => page.classList.remove("active"));

  if (route === "") {
    document.getElementById("home").classList.add("active");
  } else {
    const target = document.getElementById(route);
    if (target) {
      target.classList.add("active");
    } else {
      document.getElementById("home").classList.add("active");
    }
  }
}

window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", handleRouting);

document.querySelector(".btn-success").addEventListener("click", function () {

  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!firstName || !lastName || !email || password.length < 6) {
    alert("Please fill all fields. Password must be at least 6 characters.");
    return;
  }

  // Check if email already exists
  const emailExists = window.db.accounts.find(acc => acc.email === email);

  if (emailExists) {
    alert("Email already registered.");
    return;
  }

  // Create account
  const newAccount = {
    id: Date.now(),
    firstName,
    lastName,
    email,
    password,
    verified: false,
    role: "user"
  };

  window.db.accounts.push(newAccount);
  saveToStorage();

  // Store unverified email
  localStorage.setItem("unverified_email", email);

  // Redirect
  location.hash = "#/verify-email";
});

document.addEventListener("click", function (e) {

  if (e.target.id === "verify-btn") {

    const email = localStorage.getItem("unverified_email");

    const targetAccount = window.db.accounts.find(acc => acc.email === email);

    if (!targetAccount) {
      alert("No account found.");
      return;
    }

    targetAccount.verified = true;

    saveToStorage();

    localStorage.removeItem("unverified_email");

    alert("Email Verified! Please Login.");

    location.hash = "#/login";
  }

});
