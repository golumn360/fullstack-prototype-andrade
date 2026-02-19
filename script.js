const STORAGE_KEY = 'ipt_demo_v1';
let currentUser = null;

function loadFromStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            window.db = JSON.parse(data);
            if (!window.db.accounts || !window.db.departments) throw new Error();
        } else throw new Error();
    } catch {
        window.db = {
            accounts: [
                { firstName: "Admin", lastName: "User", email: "admin@example.com", password: "Password123!", role: "Admin", verified: true }
            ],
            departments: [
                { name: "Engineering", description: "Software team" },
                { name: "HR", description: "Human Resources" }
            ],
            employees: [],
            requests: []
        };
        saveToStorage();
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

function navigateTo(hash) {
    window.location.hash = hash;
}

function handleRouting() {
    let hash = window.location.hash;
    if (!hash || hash === "#") hash = "#/";
    const route = hash.replace("#/", "");

    const adminCards = document.querySelectorAll(
        "#employees-admin .card, #departments-admin .card, #accounts-admin .card"
    );
    adminCards.forEach(c => c.style.display = "none");

    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));

    const protectedRoutes = ["profile", "requests-user"];
    const adminRoutes = ["employees-admin", "departments-admin", "accounts-admin"];

    if (protectedRoutes.includes(route) && !currentUser) {
        navigateTo("#/login");
        return;
    }
    if (adminRoutes.includes(route)) {
        if (!currentUser) { navigateTo("#/login"); return; }
        if (currentUser.role !== "Admin") { navigateTo("#/"); return; }
    }

    const pageId = route === "" ? "home" : route;
    const page = document.getElementById(pageId);
    if (page) page.classList.add("active");
    else document.getElementById("home").classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
}


function setAuthState(isAuth, user = null) {
    if (isAuth && user) {
        currentUser = user;
        document.body.classList.remove("not-authenticated");
        document.body.classList.add("authenticated");
        if (user.role === "Admin") document.body.classList.add("is-admin");
    } else {
        currentUser = null;
        document.body.classList.remove("authenticated", "is-admin");
        document.body.classList.add("not-authenticated");
    }
    handleRouting();
}

function setupRegistration() {
    const registerBtn = document.querySelector("#register .btn-success");
    registerBtn.addEventListener("click", () => {
        const section = document.getElementById("register");
        const firstName = section.querySelector("#first-name").value.trim();
        const lastName = section.querySelector("#last-name").value.trim();
        const email = section.querySelector("#email").value.trim();
        const password = section.querySelector("#password").value.trim();

        if (!firstName || !lastName || !email || password.length < 6) {
            alert("Please fill all fields. Password must be at least 6 characters.");
            return;
        }

        if (window.db.accounts.find(acc => acc.email === email)) {
            alert("Email already registered.");
            return;
        }

        window.db.accounts.push({ firstName, lastName, email, password, role: "User", verified: false });
        saveToStorage();
        localStorage.setItem("unverified_email", email);
        navigateTo("#/verify-email");
    });
}

function setupVerification() {
    const verifyBtn = document.getElementById("verify-btn");
    verifyBtn.addEventListener("click", () => {
        const email = localStorage.getItem("unverified_email");
        if (!email) { navigateTo("#/login"); return; }

        const account = window.db.accounts.find(acc => acc.email === email);
        if (account) {
            account.verified = true;
            saveToStorage();
        }

        localStorage.removeItem("unverified_email");
        alert("Email verified successfully!");
        navigateTo("#/login");
    });
}

function setupLogin() {
    const loginBtn = document.querySelector("#login .btn-primary");
    loginBtn.addEventListener("click", () => {
        const section = document.getElementById("login");
        const email = section.querySelector("#email").value.trim();
        const password = section.querySelector("#password").value.trim();

        const user = window.db.accounts.find(acc => acc.email === email && acc.password === password && acc.verified === true);

        if (!user) { alert("Invalid credentials or email not verified."); return; }

        localStorage.setItem("auth_token", user.email);
        setAuthState(true, user);
        navigateTo("#/profile");
    });
}

function setupLogout() {
    const logoutLink = document.getElementById("logout-link");
    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("auth_token");
        setAuthState(false);
        navigateTo("#/");
    });
}

function autoLogin() {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    const user = window.db.accounts.find(acc => acc.email === token);
    if (user) setAuthState(true, user);
}

function setupAdminForms() {
    const cards = document.querySelectorAll(".card");
    cards.forEach(c => c.style.display = "none");

    const empBtn = document.getElementById("employee-btn");
    const empCard = document.querySelector("#employees-admin .card");
    if (empBtn && empCard) {
        empBtn.addEventListener("click", () => {
            empCard.style.display = empCard.style.display === "block" ? "none" : "block";
            empCard.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    const deptBtn = document.querySelector("#departments-admin .btn-success");
    const deptCard = document.querySelector("#departments-admin .card");
    if (deptBtn && deptCard) {
        deptBtn.addEventListener("click", () => {
            deptCard.style.display = deptCard.style.display === "block" ? "none" : "block";
            deptCard.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    const accBtn = document.querySelector("#accounts-admin .btn-success");
    const accCard = document.querySelector("#accounts-admin .card");
    if (accBtn && accCard) {
        accBtn.addEventListener("click", () => {
            accCard.style.display = accCard.style.display === "block" ? "none" : "block";
            accCard.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }
}

window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", () => {
    loadFromStorage();
    if (!window.location.hash) window.location.hash = "#/";
    setupRegistration();
    setupVerification();
    setupLogin();
    setupLogout();
    autoLogin();
    setupAdminForms();
    handleRouting();
});
