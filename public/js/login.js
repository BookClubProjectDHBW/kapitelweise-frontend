$("#loginForm").on("submit", async function (event) {
  event.preventDefault();

  const loginData = {
    username: $("#username").val(),
    password: $("#password").val(),
  };
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });
  console.log(response);

  if (response.ok) {
    console.log("Login erfolgreich");
  } else if (response.status === 400) {
    $("#loginError")
      .text("Benutzername oder Passwort ist falsch.")
      .removeClass("d-none");
    } else {
    $("#loginError")
      .text("Ein Fehler ist aufgetreten.")
      .removeClass("d-none");
  }
});
