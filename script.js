function loginAsAdmin() {
    document.getElementById("guest-links").style.display = "none";
    document.getElementById("admin-dropdown").style.display = "block";
}

function logout() {
    document.getElementById("admin-dropdown").style.display = "none";
    document.getElementById("guest-links").style.display = "flex";
}
