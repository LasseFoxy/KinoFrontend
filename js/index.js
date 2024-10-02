document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
    // Check if the app is running locally or on Azure
    const isLocal = window.location.hostname === "localhost";

    // Set the correct path based on whether it's local or remote
    const routerPath = isLocal
        ? "../../KinoFrontend/js/router.js" // Local development path
        : "/js/router.js"; // Remote/Azure path

    // Dynamically import the router module
    import(routerPath)
        .then(({ initializeViewNavigation }) => {
            // Initialize the navigation once the router module is loaded
            initializeViewNavigation();
        })
        .catch(err => {
            console.error("Failed to load router module:", err);
        });
}
