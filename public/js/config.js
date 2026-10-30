const environment = "production";
const enableMockData = false;

const apiUrls = {
  development: {
    auth: "http://localhost:8282",
    graphql: "http://localhost:8383/graphql",
    bookSearch: "http://localhost:8484",
    backend: "http://localhost:8181",
  },
  production: {
    auth: "https://kapitelweise-auth-7bf808281135.herokuapp.com",
    graphql: "https://kapitelweise-graphql-f85172125d1d.herokuapp.com/graphql",
    bookSearch: "https://kapitelweise-bookapi-38e6cb97d9cf.herokuapp.com",
    backend: "https://kapitelweise-update-2dcfa83e8351.herokuapp.com",
  },
};

export const config = {
  environment,
  useMockData: environment === "development" && enableMockData,
  api: apiUrls[environment],
};
