const STORAGE_KEY = "ipt_demo_v1";
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
        {
          firstName: "Admin",
          lastName: "User",
          email: "admin@example.com",
          password: "Password123!",
          role: "Admin",
          verified: true,
        },
      ],
      departments: [
        { name: "Engineering", description: "Software team" },
        { name: "HR", description: "Human Resources" },
      ],
      employees: [],
      requests: [],
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

    if (window.db.accounts.find((acc) => acc.email === email)) {
      alert("Email already registered.");
      return;
    }

    window.db.accounts.push({
      firstName,
      lastName,
      email,
      password,
      role: "User",
      verified: false,
    });
    saveToStorage();
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

    const account = window.db.accounts.find((acc) => acc.email === email);
    if (account) {
      account.verified = true;
      saveToStorage();
    }

    localStorage.removeItem("unverified_email");
    alert("Email verified successfully!");
    navigateTo("#/login");
  });
}

function setupAdminForms() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((c) => (c.style.display = "none"));

  const empBtn = document.getElementById("employee-btn");
  const empCard = document.querySelector("#employees-admin .card");
  if (empBtn && empCard) {
    empBtn.addEventListener("click", () => {
      empCard.style.display =
        empCard.style.display === "block" ? "none" : "block";
      empCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const deptBtn = document.querySelector("#departments-admin .btn-success");
  const deptCard = document.querySelector("#departments-admin .card");
  if (deptBtn && deptCard) {
    deptBtn.addEventListener("click", () => {
      deptCard.style.display =
        deptCard.style.display === "block" ? "none" : "block";
      deptCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const accBtn = document.querySelector("#accounts-admin .btn-success");
  const accCard = document.querySelector("#accounts-admin .card");
  if (accBtn && accCard) {
    accBtn.addEventListener("click", () => {
      accCard.style.display =
        accCard.style.display === "block" ? "none" : "block";
      accCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function renderProfile() {
  if (!currentUser) return;

  const profileSection = document.getElementById("profile");
  const profileBox = profileSection.querySelector(".profile-box");

  profileBox.innerHTML = `
        <h3>${currentUser.firstName} ${currentUser.lastName}</h3>
        <p>
            <strong>Email:</strong> ${currentUser.email}<br>
            <strong>Role:</strong> ${currentUser.role}
        </p>
        <button type="button" class="btn btn-outline-primary" id="edit-profile-btn">Edit Profile</button>
    `;

  const editBtn = document.getElementById("edit-profile-btn");
  editBtn.addEventListener("click", () => {
    alert("Edit Profile clicked! (Functionality coming soon)");
  });
}

function handleRouting() {
  let hash = window.location.hash;
  if (!hash || hash === "#") hash = "#/";
  const route = hash.replace("#/", "");

  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));

  const protectedRoutes = ["profile", "requests-user"];
  const adminRoutes = [
    "employees-admin",
    "departments-admin",
    "accounts-admin",
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

  const pageId = route === "" ? "home" : route;
  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");
  else document.getElementById("home").classList.add("active");

  if (route === "profile") renderProfile();
  if (route === "requests-user") renderUserRequests();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderAccountsList() {
  const tbody = document.querySelector("#accounts-admin table tbody");
  tbody.innerHTML = "";
  window.db.accounts.forEach((acc, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${acc.firstName} ${acc.lastName}</td>
            <td>${acc.email}</td>
            <td>${acc.role}</td>
            <td>${acc.verified ? '<span class="badge bg-success">✔</span>' : ""}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-acc" data-idx="${idx}">Edit</button>
                <button class="btn btn-sm btn-outline-warning reset-pw" data-idx="${idx}">Reset Password</button>
                <button class="btn btn-sm btn-outline-danger delete-acc" data-idx="${idx}">Delete</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
  document.querySelectorAll(".edit-acc").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.idx;
      const acc = window.db.accounts[idx];
      const form = document.getElementById("account-form");
      form.querySelector("input[placeholder='First Name']").value =
        acc.firstName;
      form.querySelector("input[placeholder='Last Name']").value = acc.lastName;
      form.querySelector("input[placeholder='Email']").value = acc.email;
      form.querySelector("input[placeholder='Password']").value = acc.password;
      form.querySelector("select").value = acc.role;
      form.querySelector("#verified").checked = acc.verified;
      form.dataset.editIdx = idx;
    });
  });
  document.querySelectorAll(".reset-pw").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.idx;
      if (window.db.accounts[idx].email === currentUser.email) {
        alert("Cannot reset your own password here.");
        return;
      }
      let pw = prompt("Enter new password (min 6 chars):");
      if (pw && pw.length >= 6) {
        window.db.accounts[idx].password = pw;
        saveToStorage();
        renderAccountsList();
        alert("Password updated.");
      } else alert("Invalid password.");
    });
  });
  document.querySelectorAll(".delete-acc").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.idx;
      if (window.db.accounts[idx].email === currentUser.email) {
        alert("Cannot delete yourself.");
        return;
      }
      if (confirm("Are you sure you want to delete this account?")) {
        window.db.accounts.splice(idx, 1);
        saveToStorage();
        renderAccountsList();
      }
    });
  });
}

function setupAccountForm() {
  const form = document.getElementById("account-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const firstName = form
      .querySelector("input[placeholder='First Name']")
      .value.trim();
    const lastName = form
      .querySelector("input[placeholder='Last Name']")
      .value.trim();
    const email = form.querySelector("input[placeholder='Email']").value.trim();
    const password = form
      .querySelector("input[placeholder='Password']")
      .value.trim();
    const role = form.querySelector("select").value;
    const verified = form.querySelector("#verified").checked;
    if (!firstName || !lastName || !email || password.length < 6) {
      alert("Fill all fields and ensure password ≥6 chars.");
      return;
    }
    const editIdx = form.dataset.editIdx;
    if (editIdx !== undefined) {
      window.db.accounts[editIdx] = {
        firstName,
        lastName,
        email,
        password,
        role,
        verified,
      };
      delete form.dataset.editIdx;
    } else {
      window.db.accounts.push({
        firstName,
        lastName,
        email,
        password,
        role,
        verified,
      });
    }
    saveToStorage();
    renderAccountsList();
    form.reset();
  });
}

function renderDepartmentsTable() {
  const tbody = document.querySelector("#departments-admin table tbody");
  tbody.innerHTML = "";
  window.db.departments.forEach((dept, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${dept.name}</td>
            <td>${dept.description}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary">Edit</button>
                <button class="btn btn-sm btn-outline-danger">Delete</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function setupDepartmentAdd() {
  const btn = document.querySelector("#departments-admin .btn-success");
  btn.addEventListener("click", () => {
    alert("Add Department not implemented.");
  });
}

function renderEmployeesTable() {
  const tbody = document.querySelector("#employees-admin table tbody");
  tbody.innerHTML = "";
  if (!window.db.employees.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" class="text-center">No employees.</td>`;
    tbody.appendChild(tr);
    return;
  }
  window.db.employees.forEach((emp, idx) => {
    const user =
      window.db.accounts.find((a) => a.email === emp.userEmail) || {};
    const dept =
      window.db.departments.find((d) => d.name === emp.department) || {};
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${emp.id}</td>
            <td>${user.firstName ? user.firstName + " " + user.lastName : emp.userEmail}</td>
            <td>${emp.position}</td>
            <td>${dept.name || emp.department}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-emp" data-idx="${idx}">Edit</button>
                <button class="btn btn-sm btn-outline-danger delete-emp" data-idx="${idx}">Delete</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
  document.querySelectorAll(".edit-emp").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.idx;
      const emp = window.db.employees[idx];
      const form = document.getElementById("employee-form");
      form.querySelector("#employee-id").value = emp.id;
      form.querySelector("#user-email").value = emp.userEmail;
      form.querySelector("#position").value = emp.position;
      form.querySelector("#department").value = emp.department;
      form.querySelector("#hire-date").value = emp.hireDate;
      form.dataset.editIdx = idx;
    });
  });
  document.querySelectorAll(".delete-emp").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.idx;
      if (confirm("Delete this employee?")) {
        window.db.employees.splice(idx, 1);
        saveToStorage();
        renderEmployeesTable();
      }
    });
  });
}

function setupEmployeeForm() {
  const form = document.getElementById("employee-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = form.querySelector("#employee-id").value.trim();
    const userEmail = form.querySelector("#user-email").value.trim();
    const position = form.querySelector("#position").value.trim();
    const department = form.querySelector("#department").value.trim();
    const hireDate = form.querySelector("#hire-date").value;

    if (!id || !userEmail || !position || !department || !hireDate) {
      alert("Fill all fields.");
      return;
    }
    const userExists = window.db.accounts.find((a) => a.email === userEmail);
    if (!userExists) {
      alert("User email does not exist.");
      return;
    }

    const editIdx = form.dataset.editIdx;
    if (editIdx !== undefined) {
      window.db.employees[editIdx] = {
        id,
        userEmail,
        position,
        department,
        hireDate,
      };
      delete form.dataset.editIdx;
    } else {
      window.db.employees.push({
        id,
        userEmail,
        position,
        department,
        hireDate,
      });
    }
    saveToStorage();
    renderEmployeesTable();
    form.reset();
  });
}

window.addEventListener("load", () => {
  loadFromStorage();

  setupRegistration();
  setupVerification();
  setupLogin();
  setupLogout();
  autoLogin();

  window.addEventListener("hashchange", handleRouting);
  handleRouting();

  renderAccountsList();
  setupAccountForm();
  renderDepartmentsTable();
  setupDepartmentAdd();
  renderEmployeesTable();
  setupEmployeeForm();

  setupRequests();
});

function updateNavbarUser() {
  const usernameSpan = document.getElementById("nav-username");
  if (!currentUser || !usernameSpan) return;

  if (currentUser.role === "Admin") {
    usernameSpan.textContent = "Admin";
    document.body.classList.add("is-admin");
  } else {
    usernameSpan.textContent = currentUser.firstName;
    document.body.classList.remove("is-admin");
  }

  document.querySelectorAll(".role-admin").forEach((el) => {
    el.style.display = currentUser?.role === "Admin" ? "block" : "none";
  });
}

function setupLogout() {
  const logoutLink = document.getElementById("dropdown-logout");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("auth_token");
    setAuthState(false);
    updateNavbarUser();
    navigateTo("#/");
  });
}

function setupLogin() {
  const loginBtn = document.querySelector("#login .btn-primary");
  loginBtn.addEventListener("click", () => {
    const section = document.getElementById("login");
    const email = section.querySelector("#email").value.trim();
    const password = section.querySelector("#password").value.trim();

    const user = window.db.accounts.find(
      (acc) =>
        acc.email === email &&
        acc.password === password &&
        acc.verified === true,
    );

    if (!user) {
      alert("Invalid credentials or email not verified.");
      return;
    }

    localStorage.setItem("auth_token", user.email);
    setAuthState(true, user);
    updateNavbarUser();
    navigateTo("#/profile");
  });
}

function autoLogin() {
  const token = localStorage.getItem("auth_token");
  if (!token) return;
  const user = window.db.accounts.find((acc) => acc.email === token);
  if (user) {
    setAuthState(true, user);
    updateNavbarUser();
  }
}

function renderUserRequests() {
  if (!currentUser) return;

  const tbody = document.getElementById("requests-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const myRequests = window.db.requests.filter(
    (r) => r.employeeEmail === currentUser.email,
  );

  if (!myRequests.length) {
    tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">No requests yet.</td>
            </tr>
        `;
    return;
  }

  myRequests.forEach((req) => {
    const tr = document.createElement("tr");

    const itemsText = req.items.map((i) => `${i.name} (x${i.qty})`).join(", ");

    let badgeClass = "bg-warning";
    if (req.status === "Approved") badgeClass = "bg-success";
    if (req.status === "Rejected") badgeClass = "bg-danger";

    tr.innerHTML = `
            <td>${req.date}</td>
            <td>${req.type}</td>
            <td>${itemsText}</td>
            <td><span class="badge ${badgeClass}">${req.status}</span></td>
        `;

    tbody.appendChild(tr);
  });
}

function createItemRow(name = "", qty = 1) {
  const div = document.createElement("div");
  div.className = "input-group mb-2";

  div.innerHTML = `
        <input type="text" class="form-control item-name" placeholder="Item name" value="${name}">
        <input type="number" class="form-control item-qty" value="${qty}" min="1" style="max-width:80px;">
        <button class="btn btn-outline-danger remove-item" type="button">×</button>
    `;

  div.querySelector(".remove-item").addEventListener("click", () => {
    div.remove();
  });

  return div;
}

function setupRequests() {
  const itemsContainer = document.getElementById("items-container");
  const addItemBtn = document.getElementById("add-item-btn");
  const submitBtn = document.getElementById("submit-request");

  if (!itemsContainer) return;

  function resetItems() {
    itemsContainer.innerHTML = "";
    itemsContainer.appendChild(createItemRow());
  }

  resetItems();

  addItemBtn.addEventListener("click", () => {
    itemsContainer.appendChild(createItemRow());
  });

  submitBtn.addEventListener("click", () => {
    const type = document.getElementById("request-type").value;

    const itemNames = document.querySelectorAll(".item-name");
    const itemQtys = document.querySelectorAll(".item-qty");

    let items = [];

    for (let i = 0; i < itemNames.length; i++) {
      const name = itemNames[i].value.trim();
      const qty = parseInt(itemQtys[i].value);

      if (name && qty > 0) {
        items.push({ name, qty });
      }
    }

    if (!items.length) {
      alert("Please add at least one valid item.");
      return;
    }

    const newRequest = {
      type,
      items,
      status: "Pending",
      date: new Date().toLocaleDateString(),
      employeeEmail: currentUser.email,
    };

    window.db.requests.push(newRequest);
    saveToStorage();

    renderUserRequests();

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("newRequestModal"),
    );
    modal.hide();

    resetItems();
  });
}
