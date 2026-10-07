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
const createClubModal = document.getElementById("createClubModal");

createClubForm.addEventListener("submit", async function (event) {
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

  try {
    const response = await fetch("http://localhost:8181/clubs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(clubData),
    });
if (response.ok) {
  const createdClub = await response.json();
  console.log("Buchclub erstellt:", createdClub);

  const modal = bootstrap.Modal.getInstance(createClubModal);
  modal.hide();
}


  } catch (error) {
    console.error("Fehler beim Erstellen des Clubs:", error);
  }
});
createClubModal.addEventListener("hidden.bs.modal", function () {
  createClubForm.reset();
  clubNameInput.classList.remove("is-invalid");
});   
