const API = "/goals";

// Show/hide nav links based on token
const token = localStorage.getItem("token");
if (token) {
  document.getElementById("loginLink").style.display = "none";
  document.getElementById("registerLink").style.display = "none";
  document.getElementById("logoutLink").style.display = "inline";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// CREATE

async function createGoal() {
  const name = document.getElementById("name").value;
  const target = document.getElementById("target").value;
  const deadline = document.getElementById("deadline").value;

  const nameError = document.getElementById("nameError");
  const targetError = document.getElementById("targetError");
  const deadlineError = document.getElementById("deadlineError");

  nameError.textContent = "";
  targetError.textContent = "";
  deadlineError.textContent = "";

  let isValid = true;

  if (!name || name.trim() === "") {
    nameError.textContent = "Goal name is required";
    isValid = false;
  }

  if (!target) {
    targetError.textContent = "Target amount is required";
    isValid = false;
  }else if (Number(target) <= 0) {
    targetError.textContent = "Target amount must be greater than 0";
    isValid = false;
  }

  if (!deadline) {
    deadlineError.textContent = "Deadline is required";
    isValid = false;
  }

  if (!isValid) return;

  const data = {
    goalName: document.getElementById("name").value,
    targetAmount: Number(document.getElementById("target").value),
    deadline: document.getElementById("deadline").value,
  };

  const token = localStorage.getItem("token");

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "Error creating goal");
    return;
  }

  const result = await res.json();
  alert("Goal created! ID: " + result.goalId);

  getAllGoals();
}

// GET ALL
async function getAllGoals() {
  const token = localStorage.getItem("token");

  const res = await fetch(API, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "Error loading goals");
    return;
  }

  const goals = await res.json();
  displayGoals(goals);
}

// DISPLAY
function displayGoals(goals) {
  const container = document.getElementById("goals");
  container.innerHTML = "";

  goals.forEach((goal) => {
    container.innerHTML += `
      <div class="goal-card">
        <h3>${goal.goalName}</h3>
        <p>Target: ${goal.targetAmount}</p>
        <p>Current: ${goal.currentAmount}</p>
        <p>Progress: ${(goal.progress || 0).toFixed(2)}%</p>
        <p>Status: ${goal.isAchieved ? "✅ Done" : "⏳ In Progress"}</p>
        <p>Deadline: ${new Date(goal.deadline).toDateString()}</p>

        <input type="number" placeholder="Add amount" id="amount-${goal.goalId}">
        <button onclick="updateProgress('${goal.goalId}')">Update</button>
      </div>
    `;
  });
}

// UPDATE
async function updateProgress(goalId) {
  const amount = Number(document.getElementById(`amount-${goalId}`).value);
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/${goalId}/progress`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Error updating progress");
    return;
  }

  getAllGoals();
}