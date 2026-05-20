const API_BASE = "https://he-mart-arehouse-mario-nasser4692-43apxqpf.leapcell.dev"; // Relative to root since we serve static files from express

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Ensure credentials are sent for cookies
  options.credentials = "include";

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      // Auto logout on unauthorized
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
      // if (!window.location.pathname.includes("login.html") && !window.location.pathname.includes("register.html")) {
      //   window.location.href = "login.html";
      // }
    }
    throw data;
  }

  return data;
}

const api = {
  auth: {
    login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    register: (user) => request("/auth/register", { method: "POST", body: JSON.stringify(user) }),
    logout: () => request("/auth/logout", { method: "POST" }),
  },
  transactions: {
    getAll: () => request("/transactions"),
    create: (data) => request("/transactions", { method: "POST", body: JSON.stringify(data) }),
    categories: {
      getAll: () => request("/transactions/categories"),
      create: (data) => request("/transactions/categories", { method: "POST", body: JSON.stringify(data) }),
      delete: (id) => request(`/transactions/categories/${id}`, { method: "DELETE" }),
    },
    clearAll: () => request("/transactions/clear/all", { method: "DELETE" }),
  },
  goals: {
    getAll: () => request("/goals"),
    create: (data) => request("/goals", { method: "POST", body: JSON.stringify(data) }),
    updateProgress: (id, amount) => request(`/goals/${id}/progress`, { method: "PATCH", body: JSON.stringify({ amount }) }),
    delete: (id) => request(`/goals/${id}`, { method: "DELETE" }),
  },
  budgets: {
    getAll: () => request("/budgets"),
    create: (data) => request("/budgets", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/budgets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) => request(`/budgets/${id}`, { method: "DELETE" }),
  },
  reports: {
    get: (params) => request(`/reports?${new URLSearchParams(params)}`),
  }
};

// UI Helpers
function updateNav() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const loginLinks = document.querySelectorAll(".auth-guest");
  const userLinks = document.querySelectorAll(".auth-user");
  const userNameEl = document.querySelector("#nav-user-name");

  if (token) {
    loginLinks.forEach(el => el.style.display = "none");
    userLinks.forEach(el => el.style.display = "flex");
    if (userNameEl && user) userNameEl.textContent = user.name;
  } else {
    loginLinks.forEach(el => el.style.display = "flex");
    userLinks.forEach(el => el.style.display = "none");
  }
}

document.addEventListener("DOMContentLoaded", updateNav);

async function handleLogout() {
  try {
    await api.auth.logout();
  } catch (e) { }
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}
