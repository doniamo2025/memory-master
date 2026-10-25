function getUsers() {
  const data = localStorage.getItem("users");
  if (data === null) {
    return [];
  }
  return JSON.parse(data);
}


function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}


function findUserByEmail(email) {
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      return users[i];
    }
  }
  return null;
}


function saveCurrentUser(user) {
  const data = { name: user.name, firstName: user.firstName, email: user.email };
  localStorage.setItem("currentUser", JSON.stringify(data));
}


function getCurrentUser() {
  const data = localStorage.getItem("currentUser");
  if (data === null) {
    return null;
  }
  return JSON.parse(data);
}


function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}


function getScores() {
  const data = localStorage.getItem("scores");
  if (data === null) {
    return [];
  }
  return JSON.parse(data);
}


function saveScore(result) {
  const scores = getScores();
  scores.push(result);
  localStorage.setItem("scores", JSON.stringify(scores));
}


function getMyScores() {
  const user = getCurrentUser();
  const all = getScores();
  const mine = [];
  for (let i = 0; i < all.length; i++) {
    if (user !== null && all[i].email === user.email) {
      mine.push(all[i]);
    }
  }
  return mine;
}