const navigationTabs = document.querySelectorAll(".nav-tab");

navigationTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    navigationTabs.forEach((currentTab) => {
      currentTab.classList.remove("active");
    });

    tab.classList.add("active");
  });
});
