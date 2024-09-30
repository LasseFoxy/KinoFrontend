function initializeViewNavigation() {
  window.addEventListener("hashchange", handleViewChange);
  handleViewChange(); // set initial view
}

function handleViewChange() {
  let defaultView = "#home"; // default view

  if (location.hash) {
    defaultView = location.hash; // extract the hash from the URL
  }

  hideAllViews();

  // Set the selected view to active
  document.querySelector(defaultView).classList.add("active");
  updateNavbarActiveLink(defaultView); // update active link in navbar
}

function updateNavbarActiveLink(view) {
  // Set the corresponding navbar link to active
  const navbarLink = document.querySelector(`a.view-link[href="${view}"]`); // Get navbar element with href equal to view
  if (navbarLink) {
    navbarLink.classList.add("active"); // Add active class to the navbar element
  }
}

function hideAllViews() {
  // Remove 'active' class from all views and nav links
  document
    .querySelectorAll(".view-content")
    .forEach(content => content.classList.remove("active"));
  document
    .querySelectorAll(".view-link")
    .forEach(link => link.classList.remove("active"));
}

export { initializeViewNavigation };
