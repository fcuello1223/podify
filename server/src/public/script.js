const getById = (id) => {
  return document.getElementById(id);
};

const password = getById("password");
const confirmPassword = getById("confirm-password");
const form = getById("form");
const container = getById("container");
const loader = getById("loader");
const button = getById("submit");
const error = getById("error");
const success = getById("success");

error.style.display = "none";
success.style.display = "none";
container.style.display = "none";

let token, userId;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z\d\S]+$/;

window.addEventListener("DOMContentLoaded", async () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => {
      return searchParams.get(prop);
    },
  });

  token = params.token;
  userId = params.userId;

  const response = await fetch("/auth/verify-password-reset-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      token,
      userId,
    }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    loader.innerText = error;
    return;
  }

  loader.style.display = "none";
  container.style.display = "block";
});

const displayError = (errorMsg) => {
  success.style.display = "none";
  error.innerText = errorMsg;
  error.style.display = "block";
};

const displaySuccess = (successMsg) => {
  error.style.display = "none";
  success.innerText = successMsg;
  success.style.display = "block";
};

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!password.value.trim()) {
    return displayError("Password Is Missing!");
  }

  if (!passwordRegex.test(password.value)) {
    return displayError(
      "Password Is Too Simple! It must include at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  }

  if (password.value !== confirmPassword.value) {
    return displayError("Passwords Do Not Match!");
  }

  button.disabled = true;
  button.innerText = "Please Wait...";

  const response = await fetch("/auth/update-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      token,
      userId,
      password: password.value,
    }),
  });

  button.disabled = false;
  button.innerText = "Reset Password";

  if (!response.ok) {
    const { error } = await response.json();
    return displayError(error);
  }

  displaySuccess("Your Password Has Been Reset Successfully!");

  password.value = "";
  confirmPassword.value = "";

  
};

form.addEventListener("submit", handleSubmit);
