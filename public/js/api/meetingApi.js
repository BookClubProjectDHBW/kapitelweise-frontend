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

async function meetingRequest(path, options = {}) {
  const response = await fetch(`${config.api.backend}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    window.location.href = "loginPage.html";
    throw new Error("Deine Anmeldung ist abgelaufen.");
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const fallback = {
      400: "Die Antwort ist ungültig.",
      403: "Du hast für diese Aktion keine Berechtigung.",
      404: "Das Treffen wurde in diesem Club nicht gefunden.",
      409: "Das Treffen hat bereits begonnen.",
    };
    throw new Error(
      data?.message ||
        fallback[response.status] ||
        `Meeting-Anfrage fehlgeschlagen (HTTP ${response.status}).`,
    );
  }
  return response.json();
}

export function getMeetings(clubId) {
  return meetingRequest(`/clubs/${encodeURIComponent(clubId)}/meetings`);
}

export function getAttendanceOverview(clubId, meetingId) {
  return meetingRequest(
    `/clubs/${encodeURIComponent(clubId)}/meetings/${encodeURIComponent(meetingId)}/attendance`,
  );
}

export function setMeetingAttendance(clubId, meetingId, status) {
  if (!["ACCEPTED", "DECLINED"].includes(status)) {
    throw new Error("Ungültiger Teilnahmestatus.");
  }
  return meetingRequest(
    `/clubs/${encodeURIComponent(clubId)}/meetings/${encodeURIComponent(meetingId)}/attendance`,
    { method: "PUT", body: JSON.stringify({ status }) },
  );
}
