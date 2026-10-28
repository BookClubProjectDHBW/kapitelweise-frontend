import { config } from "../config.js";

export async function createMeeting(clubId, meeting) {
  const response = await fetch(
    `${config.api.backend}/clubs/${encodeURIComponent(clubId)}/meetings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(meeting),
    },
  );

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    window.location.href = "loginPage.html";
    throw new Error("Deine Anmeldung ist abgelaufen.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        `Treffen konnte nicht erstellt werden (HTTP ${response.status}).`,
    );
  }

  return response.json();
}