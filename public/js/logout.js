const logoutButton = document.getElementById("logout");

logoutButton.addEventListener("click", async function () {
  try {
    const response = await fetch("http://localhost:8000/api/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Logout fehlgeschlagen:", response.status);
      return;
    }

    localStorage.removeItem("token");
    window.location.href = "loginPage.html";
  } catch (error) {
    console.error("Logout-Anfrage fehlgeschlagen:", error);
  }
});
