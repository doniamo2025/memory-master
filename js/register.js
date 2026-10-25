const form = document.getElementById("registerForm");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm");
const message = document.getElementById("message");
const eyeBtn = document.getElementById("eyeBtn");
const submitBtn = document.getElementById("submitBtn");


eyeBtn.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    confirmInput.type = "text";
    eyeBtn.classList.add("visible");
  } else {
    passwordInput.type = "password";
    confirmInput.type = "password";
    eyeBtn.classList.remove("visible");
  }
});


function showError(text, fieldId) {
  
  const fields = document.querySelectorAll(".field");
  for (let i = 0; i < fields.length; i++) {
    fields[i].classList.remove("error");
  }

  document.getElementById(fieldId).classList.add("error");
  message.className = "message";   
  message.innerHTML = text;
}


form.addEventListener("submit", function (event) {
  event.preventDefault();   

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirm = confirmInput.value;

  
  if (firstName.length < 2) {
    showError("First name must be at least 2 characters", "firstNameField");
    return;
  }

  
  if (lastName.length < 2) {
    showError("Last name must be at least 2 characters", "lastNameField");
    return;
  }

  
  if (!email.includes("@") || !email.includes(".")) {
    showError("Please enter a valid email", "emailField");
    return;
  }

  
  if (password.length < 6) {
    showError("Password must be at least 6 characters", "passwordField");
    return;
  }

  
  if (password !== confirm) {
    showError("Passwords do not match", "confirmField");
    return;
  }

  
  if (findUserByEmail(email) !== null) {
    showError('This email is already registered. <a href="login.html">Log in?</a>', "emailField");
    return;
  }

  
  const newUser = {
    firstName: firstName,
    lastName: lastName,
    name: firstName + " " + lastName,
    email: email,
    password: password
  };

  const users = getUsers();
  users.push(newUser);
  saveUsers(users);

  
  const fields = document.querySelectorAll(".field");
  for (let i = 0; i < fields.length; i++) {
    fields[i].classList.remove("error");
  }
  message.className = "message success";
  message.textContent = "Account created! Taking you to login...";
  submitBtn.disabled = true;   
  setTimeout(function () {
    window.location.href = "login.html";
  }, 1500);
});