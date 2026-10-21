
import { config } from "../config.js";

export async function loginUser(loginData) {
  return await fetch(`${config.api.auth}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });
}

export async function registerUser(registerData) {
  return await fetch(`${config.api.auth}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerData),
  });
}
