let currentUser = null;

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

    const protectedRoutes = [
        "profile",
        "requests-user"
    ];

    const adminRoutes = [
        "employees-admin",
        "departments-admin",
        "accounts-admin"
    ];

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

window.addEventListener("hashchange", handleRouting);

window.addEventListener("load", () => {

    if (!window.location.hash) {
        window.location.hash = "#/";
    }

    handleRouting();
});
