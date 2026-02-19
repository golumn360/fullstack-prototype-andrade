let currentUser = null;

window.db = JSON.parse(localStorage.getItem("db")) || {
    accounts: [
        {
            firstName: "Admin",
            lastName: "User",
            email: "admin@example.com",
            password: "admin123",
            role: "Admin",
            verified: true
        }
    ]
};

function saveDB() {
    localStorage.setItem("db", JSON.stringify(window.db));
}

function navigateTo(hash) {
    window.location.hash = hash;
}

function handleRouting() {

    let hash = window.location.hash;

    if (!hash || hash === "#") {
        hash = "#/";
        window.location.hash = hash;
    }

    const route = hash.replace("#/", "");

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const protectedRoutes = ["profile", "requests-user"];
    const adminRoutes = ["employees-admin", "departments-admin", "accounts-admin"];

    if (protectedRoutes.includes(route) && !currentUser) {
        navigateTo("#/login");
        return;
    }

    if (adminRoutes.includes(route)) {
        if (!currentUser) {
            navigateTo("#/login");
            return;
        }
        if (currentUser.role !== "Admin") {
            navigateTo("#/");
            return;
        }
    }

    let pageId = route === "" ? "home" : route;
    const page = document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    } else {
        document.getElementById("home").classList.add("active");
    }
}

function setAuthState(isAuth, user = null) {

    if (isAuth && user) {
        currentUser = user;

        document.body.classList.remove("not-authenticated");
        document.body.classList.add("authenticated");

        if (user.role === "Admin") {
            document.body.classList.add("is-admin");
        }

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

        const firstName = document.getElementById("first-name").value.trim();
        const lastName = document.getElementById("last-name").value.trim();
        const email = document.querySelector("#register #email").value.trim();
        const password = document.querySelector("#register #password").value.trim();

        if (!firstName || !lastName || !email || password.length < 6) {
            alert("Please fill all fields. Password must be at least 6 characters.");
            return;
        }

        const existing = window.db.accounts.find(acc => acc.email === email);

        if (existing) {
            alert("Email already registered.");
            return;
        }

        const newAccount = {
            firstName,
            lastName,
            email,
            password,
            role: "User",
            verified: false
        };

        window.db.accounts.push(newAccount);
        saveDB();

        localStorage.setItem("unverified_email", email);

        navigateTo("#/verify-email");
    });
}

function setupVerification() {

    const verifyBtn = document.getElementById("verify-btn");

    verifyBtn.addEventListener("click", () => {

        const email = localStorage.getItem("unverified_email");

        if (!email) {
            navigateTo("#/login");
            return;
        }

        const account = window.db.accounts.find(acc => acc.email === email);

        if (account) {
            account.verified = true;
            saveDB();
        }

        localStorage.removeItem("unverified_email");

        alert("Email verified successfully!");
        navigateTo("#/login");
    });
}

function setupLogin() {

    const loginBtn = document.querySelector("#login .btn-primary");

    loginBtn.addEventListener("click", () => {

        const email = document.querySelector("#login #email").value.trim();
        const password = document.querySelector("#login #password").value.trim();

        const user = window.db.accounts.find(acc =>
            acc.email === email &&
            acc.password === password &&
            acc.verified === true
        );

        if (!user) {
            alert("Invalid credentials or email not verified.");
            return;
        }

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

    if (user) {
        setAuthState(true, user);
    }
}

window.addEventListener("hashchange", handleRouting);

window.addEventListener("load", () => {

    if (!window.location.hash) {
        window.location.hash = "#/";
    }

    setupRegistration();
    setupVerification();
    setupLogin();
    setupLogout();
    autoLogin();

    handleRouting();
});
