import { config } from "../config.js";

export function loginUser(loginData) {
  return fetch(`${config.api.auth}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });
}

export function registerUser(registerData) {
  return fetch(`${config.api.auth}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerData),
  });
}