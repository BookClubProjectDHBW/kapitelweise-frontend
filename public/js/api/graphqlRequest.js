import { config } from "../config.js";

export async function graphqlRequest(query, variables = {}) {
  const response = await fetch(config.api.graphql, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    window.location.href = "loginPage.html";
    throw new Error("Deine Anmeldung ist abgelaufen.");
  }

  if (!response.ok) {
    throw new Error(`HTTP-Fehler: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors?.length) {
    const graphqlError = result.errors[0];
    const error = new Error(graphqlError.message);
    error.code = graphqlError.extensions?.code;
    throw error;
  }

  return result.data;
}