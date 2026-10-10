// Zentrale Backend-Adresse: lokal das Backend auf Port 8181, auf Heroku die Backend-App.
const BACKEND_HEROKU_URL = "https://kapitelweise-backend-91d45346927c.herokuapp.com";

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8181"
    : BACKEND_HEROKU_URL;
