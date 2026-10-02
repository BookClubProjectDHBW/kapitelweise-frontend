function showError(message) {
  $("#loginError").removeClass("d-none").text(message);

  setTimeout(function () {
    $("#loginError").addClass("d-none").text("");
  }, 4000);

}
$("#loginForm").on("submit", async function (event) {
  event.preventDefault();
  $("#loginError").addClass("d-none").text("");

  const loginData = {
    username: $("#username").val(),
    password: $("#password").val(),
  };

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });
    console.log(response);

    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else if (response.status === 401) {
      showError("Benutzername oder Passwort ist falsch.");
    } else {
      showError("Ein Fehler ist aufgetreten.");
    }
  } catch (error) {
    showError("Ein Fehler ist aufgetreten.");
  }
});
