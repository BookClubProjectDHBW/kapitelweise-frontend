const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", async function () {
  try {
    const response = await fetch("http://localhost:8181/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Logout fehlgeschlagen:", response.status);
      return;
    }

    window.location.href = "loginPage.html";
  } catch (error) {
    console.error("Logout-Anfrage fehlgeschlagen:", error);
  }
});
