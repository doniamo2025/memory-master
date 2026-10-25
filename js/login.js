if (getCurrentUser() !== null) {
  window.location.href = "home.html";
}

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailField = document.getElementById("emailField");
const passwordField = document.getElementById("passwordField");
const message = document.getElementById("message");
const eyeBtn = document.getElementById("eyeBtn");


eyeBtn.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeBtn.classList.add("visible");
  } else {
    passwordInput.type = "password";
    eyeBtn.classList.remove("visible");
  }
});


function showError(text, field) {
  emailField.classList.remove("error");
  passwordField.classList.remove("error");
  if (field !== null) {
    field.classList.add("error");
  }
  message.innerHTML = text;
}


form.addEventListener("submit", function (event) {
  event.preventDefault();   
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

 
  if (email === "" || password === "") {
    showError("Please fill in all fields", null);
    if (email === "") emailField.classList.add("error");
    if (password === "") passwordField.classList.add("error");
    return;
  }

 
  const user = findUserByEmail(email);
  if (user === null) {
    showError('No account found with this email. <a href="register.html">Create one?</a>', emailField);
    return;
  }

  
  if (user.password !== password) {
    showError("Wrong password", passwordField);
    return;
  }

  
  saveCurrentUser(user);
  window.location.href = "home.html";
});