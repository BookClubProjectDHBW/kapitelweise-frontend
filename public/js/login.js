function showError(message) {
  $("#loginError").removeClass("d-none").text(message);

  setTimeout(function () {
    $("#loginError").addClass("d-none").text("");
  }, 4000);
}
if (sessionStorage.getItem("registered") === "true") {
  $("#registered").removeClass("d-none");
  sessionStorage.removeItem("registered");
}

$("#loginForm").on("submit", async function (event) {
  event.preventDefault();
  $("#loginError").addClass("d-none").text("");

  const loginData = {
    username: $("#username").val(),
    password: $("#password").val(),
  };

  try {
    const response = await fetch("http://localhost:8181/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (response.ok) {
      window.location.href = "homePage.html";
    } else if (response.status === 401) {
      showError("Benutzername oder Passwort ist falsch.");
      $("#password").val("");
    } else {
      showError("Ein Fehler ist aufgetreten.");
    }
  } catch (error) {
    showError("Ein Fehler ist aufgetreten.");
  }
});
