const user = getCurrentUser();
if (!user) {
  window.location.replace("login.html");
} else {
  initHome(user);
}

function initHome(user) {
  const firstName = user.firstName || user.name || "Player";

  document.getElementById("playerName").textContent = firstName;
  document.getElementById("welcomeName").textContent = firstName;

  const dialog = document.getElementById("resultsDialog");
  const title = document.getElementById("resultsTitle");
  const body = document.getElementById("resultsBody");

  
  document.getElementById("profileBtn").addEventListener("click", function () {
    showLastResult(title, body);
    dialog.showModal();
  });

  document.getElementById("closeBtn").addEventListener("click", function () { dialog.close(); });
  document.getElementById("logoutBtn").addEventListener("click", logout);   // من storage.js
}


function showLastResult(title, body) {
  const mine = getMyScores();
  const last = mine.length > 0 ? mine[mine.length - 1] : null;

  title.textContent = "Last game";
  body.innerHTML = "";

  if (last === null) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "You haven't played yet. Press START GAME to begin!";
    body.appendChild(p);
    return;
  }

  
  const result = document.createElement("p");
  result.className = "empty";
  result.textContent = last.won ? "🎉 You won!" : "⏰ Time's up";
  body.appendChild(result);

  
  const stats = document.createElement("div");
  stats.className = "stats";
  stats.appendChild(statBox(last.score, "Score"));
  stats.appendChild(statBox(last.moves, "Moves"));
  stats.appendChild(statBox(last.time + "s", "Time"));
  body.appendChild(stats);

  
  const details = document.createElement("p");
  details.className = "empty";
  const stars = last.won && last.stars ? "  " + "⭐".repeat(last.stars) : "";
  details.textContent = "Level: " + last.difficulty + stars;
  body.appendChild(details);

  if (last.date) {
    const when = document.createElement("p");
    when.className = "empty";
    when.textContent = new Date(last.date).toLocaleString();
    body.appendChild(when);
  }
}

function statBox(value, label) {
  const box = document.createElement("div");
  box.className = "stat";
  const b = document.createElement("b");
  b.textContent = value;
  const span = document.createElement("span");
  span.textContent = label;
  box.appendChild(b);
  box.appendChild(span);
  return box;
}