const environment = "development";
const useMockData = true;

const apiUrls = {
  development: {
    auth: "http://localhost:8282",
    graphql: "http://localhost:8383/graphql",
    bookSearch: "http://localhost:8383",
    backend: "http://localhost:8181",
  },

  production: {
    auth: "https://AUTH-HEROKU-URL",
    graphql: "https://GRAPHQL-HEROKU-URL/graphql",
    bookSearch: "https://OPENLIBRARY-HEROKU-URL",
    backend: "https://BACKEND-HEROKU-URL",
  },
};

export const config = {
  environment: environment,
  useMockData: environment === "development" && useMockData,
  api: apiUrls[environment],
};