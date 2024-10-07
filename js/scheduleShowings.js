document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const theaterSelect = document.getElementById('theaterSelect');
    const movieSelect = document.getElementById('movieSelect');
    const showingsContainer = document.getElementById('showings-container');
    const nextWeekButton = document.getElementById('nextWeekButton');
    const prevWeekButton = document.getElementById('prevWeekButton');
    const addShowingsButton = document.getElementById('addShowingsButton');
    const logContainer = document.getElementById('log-container'); // Container for logs
    const selectedShowings = new Set(); // Store selected showing IDs
    let currentStartDate = new Date();

    // Load theaters and movies when DOM is ready
    logMessage("Loading theaters...");
    loadTheaters();
    logMessage("Loading movies...");
    loadMovies();

    // Event listeners for week navigation buttons
    nextWeekButton.addEventListener('click', () => changeWeek(7));
    prevWeekButton.addEventListener('click', () => changeWeek(-7));

    // Event listener for theater dropdown changes to load showings
    theaterSelect.addEventListener('change', loadShowingsForWeek);

    // Utility function to populate select elements
    function populateSelectWithPlaceholder(selectElement, placeholderText, items, itemIdField, itemTextField) {
        selectElement.innerHTML = ''; // Clear previous options

        // Add placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = placeholderText;
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        selectElement.appendChild(placeholderOption);

        // Add options dynamically from items
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[itemIdField];
            option.textContent = item[itemTextField];
            selectElement.appendChild(option);
        });
    }

    // Load theaters from backend and populate the dropdown
    function loadTheaters() {
        fetch('http://localhost:8080/api/theater')
            .then(response => response.json())
            .then(theaters => {
                populateSelectWithPlaceholder(theaterSelect, '-', theaters, 'theaterId', 'name');
                logMessage("Theaters loaded successfully.");
            })
            .catch(error => {
                console.error('Error loading theaters:', error);
                logMessage('Error loading theaters.');
            });
    }

    // Load movies from backend and populate the dropdown
    function loadMovies() {
        fetch('http://localhost:8080/api/movie')
            .then(response => response.text()) // Brug .text() i stedet for .json() midlertidigt
            .then(data => {
                console.log('Raw movie data:', data); // Log den rå data for at inspicere den
                const movies = JSON.parse(data); // Parse den manuelt
                populateSelectWithPlaceholder(movieSelect, '-', movies, 'movieId', 'title');
                logMessage("Movies loaded successfully.");
            })
            .catch(error => {
                console.error('Error loading movies:', error);
                logMessage('Error loading movies.');
            });
    }

    // Load showings for the selected theater and week
    function loadShowingsForWeek() {
        const theaterId = theaterSelect.value;
        if (!theaterId) return; // Exit if no theater is selected

        const startDate = currentStartDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        logMessage(`Loading showings for theater ${theaterId} and week starting on ${startDate}...`);

        // Fetch available showings from the backend
        fetch(`http://localhost:8080/api/showings/${theaterId}/available-showings?startDate=${startDate}`)
            .then(response => response.json())
            .then(showings => {
                showingsContainer.innerHTML = ''; // Clear the container for new data

                const daysOfWeek = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag', 'søndag'];
                const dayColumns = {};

                // Initialize columns for each day of the week
                daysOfWeek.forEach(day => {
                    const column = document.createElement('div');
                    column.classList.add('day-column');
                    const header = document.createElement('h3');
                    header.textContent = day.charAt(0).toUpperCase() + day.slice(1); // Capitalize the first letter
                    column.appendChild(header);
                    dayColumns[day] = column;
                    showingsContainer.appendChild(column);
                });

                showings.forEach(showing => {
                    const showingElement = document.createElement('div');
                    showingElement.classList.add('showing');
                    showingElement.textContent = `${showing.date} - ${showing.startTime}`;

                    // Mark as booked or available based on movie status
                    if (showing.movieTitle) {
                        showingElement.classList.add('booked');
                    } else {
                        showingElement.classList.add('available');
                        showingElement.addEventListener('click', () => toggleSelection(showingElement, showing.showingId));
                    }

                    // Extract the weekday name in lowercase Danish
                    const showingDate = new Date(showing.date);
                    const showingDay = showingDate.toLocaleDateString('da-DK', { weekday: 'long' }).toLowerCase();

                    // Check if the day column exists before appending
                    if (dayColumns[showingDay]) {
                        dayColumns[showingDay].appendChild(showingElement);
                    } else {
                        console.error(`Unknown weekday: ${showingDay}`);
                    }
                });

                logMessage("Showings loaded successfully.");
            })
            .catch(error => {
                console.error('Error loading showings:', error);
                logMessage('Error loading showings.');
            });
    }

    // Change the week by adjusting the currentStartDate
    function changeWeek(days) {
        currentStartDate.setDate(currentStartDate.getDate() + days);
        loadShowingsForWeek();
    }

    // Toggle the selection of showings (highlight and store selected IDs)
    function toggleSelection(element, showingId) {
        if (selectedShowings.has(showingId)) {
            selectedShowings.delete(showingId);
            element.classList.remove('selected');
        } else {
            selectedShowings.add(showingId);
            element.classList.add('selected');
        }
    }

    // Add movie to the selected showings when the button is clicked
    addShowingsButton.addEventListener('click', () => {
        const theaterId = theaterSelect.value;
        const movieId = movieSelect.value;

        if (selectedShowings.size === 0) {
            alert('Vælg mindst én ledig showing.');
            return;
        }

        if (!movieId) {
            alert('Vælg en film for at tilføje den til de valgte visninger.');
            return;
        }

        fetch(`http://localhost:8080/api/showings/${theaterId}/assign-movie/${movieId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Array.from(selectedShowings)) // Send showing IDs as JSON
        })
            .then(response => {
                if (response.ok) {
                    alert('Film tilføjet til showings med succes');
                    selectedShowings.clear(); // Clear the selected showings
                    loadShowingsForWeek(); // Reload the showings for the current week
                } else {
                    response.text().then(text => alert(text));
                }
            })
            .catch(error => console.error('Error assigning movie to showings:', error));
    });

    // Function to log messages to the console and optionally to the page
    function logMessage(message) {
        console.log(message);
        if (logContainer) {
            const logElement = document.createElement('p');
            logElement.textContent = message;
            logContainer.appendChild(logElement);
        }
    }
});
