$("#registerForm").submit(async function (event) {
  event.preventDefault();

  const password = $("#password").val();
  const confirmPassword = $("#confirmPassword").val();

  if (password !== confirmPassword) {
    $("#confirmPassword").addClass("is-invalid");
    return;
  } else {
    $("#confirmPassword").removeClass("is-invalid");
  }
  const registerData = {
    username: $("#username").val(),
    email: $("#email").val(),
    password: password,
  };
  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    if (response.ok) {
      sessionStorage.setItem("registered", "true");
      window.location.href = "loginPage.html";
    } else if (response.status === 409) {
      $("#username").addClass("is-invalid");
    } else {
      $("#registerError")
        .text("Ein Fehler ist aufgetreten. Bitte versuche es erneut.")
        .removeClass("d-none");
    }
    
  } catch (error) {
    console.error(error);

    $("#registerError")
    .text("Ein Fehler ist aufgetreten. Bitte versuche es erneut.")
    .removeClass("d-none");
  }
});

$("#username").on("input", function () {
  $("#username").removeClass("is-invalid");
});

$("#confirmPassword").on("input", function () {
  const password = $("#password").val();
  const confirmPassword = $("#confirmPassword").val();

  if (password === confirmPassword) {
    $("#confirmPassword").removeClass("is-invalid");
  }
});
