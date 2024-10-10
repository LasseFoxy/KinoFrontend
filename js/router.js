function initializeViewNavigation() {// Listen for hashchange event
  window.addEventListener("hashchange", handleViewChange);

  // Add event listeners to all navigation links
  document.querySelectorAll('.view-link').forEach(link => {
    link.addEventListener('click', handleClick);  // Always handle view change on click
  });

  handleViewChange();
}

function handleClick(event) {
  event.preventDefault();  // Prevent default link behavior (hash change)

  const targetHash = event.target.getAttribute('href');  // Get the target view from the href

  // Scroll to top every time the link is clicked
  window.scrollTo(0, 0);

  // Update the URL manually to trigger handleViewChange
  if (location.hash !== targetHash) {
    location.hash = targetHash;
  } else {
    handleViewChange();  // If the hash is the same, force the view to refresh
  }
}

function handleViewChange() {
  let defaultView = "#home";  // Default view

  if (location.hash) {
    defaultView = location.hash;  // Use the current hash
  }

  hideAllViews();  // Hide all other views

  // Show the selected view
  const activeView = document.querySelector(defaultView);
  if (activeView) {
    activeView.classList.add("active");
  }

  // Special case for home view
  if (defaultView === "#home") {
    document.getElementById('display-movies-seat-selector').classList.add('container-visible');
    document.getElementById('display-movies-seat-selector').classList.remove('container');
    document.getElementById('seat-selector-container').classList.add('container');
    document.getElementById('seat-selector-container').classList.remove('container-visible');
    document.getElementById('confirmation-container').classList.add('container');
    document.getElementById('confirmation-container').classList.remove('container-visible');
  }

  updateNavbarActiveLink(defaultView);
}

function updateNavbarActiveLink(view) {
  // Highlight the active link in the navbar
  document.querySelectorAll('.view-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === view) {
      link.classList.add('active');
    }
  });
}

function hideAllViews() {
  // Hide all views
  document.querySelectorAll(".view-content").forEach(view => view.classList.remove("active"));
}

export { initializeViewNavigation };
