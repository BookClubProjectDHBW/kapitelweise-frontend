$("#loginForm").on("submit", function (event) {
  event.preventDefault();

  const loginData = {
    username: $("#username").val(),
    password: $("#password").val(),
  };
  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  })
});
