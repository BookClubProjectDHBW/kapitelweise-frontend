const routes = {
  "#clubs": "#clubs-pane",
  "#einladungen": "#invites-pane",
};

export function initHomeRouter() {
  function showRoute() {
    const target = routes[window.location.hash] ?? routes["#clubs"];
    const tab = document.querySelector(`[data-bs-target="${target}"]`);

    bootstrap.Tab.getOrCreateInstance(tab).show();
  }

  document.querySelectorAll('[data-bs-toggle="tab"]').forEach(function (tab) {
    tab.addEventListener("click", function () {
      const route = Object.keys(routes).find(function (key) {
        return routes[key] === tab.dataset.bsTarget;
      });

      if (route && window.location.hash !== route) {
        history.pushState(null, "", route);
      }
    });
  });

  window.addEventListener("popstate", showRoute);
  window.addEventListener("hashchange", showRoute);

  showRoute();
}

export function renderWelcome(username) {
  document.getElementById("username").textContent = username;
}