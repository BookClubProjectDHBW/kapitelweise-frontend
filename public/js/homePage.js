async function loadUser() {
  const response = await fetch("http://localhost:8181/user", {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  document.getElementById("username").textContent = data.username;
}

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

loadUser();

const createClubForm = document.getElementById("createClubForm");
const clubNameInput = document.getElementById("clubNameInput");

createClubForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = clubNameInput.value.trim();
  const description = document
    .getElementById("clubDescriptionInput")
    .value.trim();

    clubNameInput.classList.remove("is-invalid");

  if (name === "") {
    clubNameInput.classList.add("is-invalid");
    return;
  }
  const clubData = {
    name: name,
    description: description,
  };
});
