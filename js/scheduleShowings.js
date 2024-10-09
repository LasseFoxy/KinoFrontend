document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const theaterSelect = document.getElementById('theaterSelect');
    const movieSelect = document.getElementById('movieSelect');
    const showingsContainer = document.getElementById('showings-container');
    const nextWeekButton = document.getElementById('nextWeekButton');
    const prevWeekButton = document.getElementById('prevWeekButton');
    const addShowingsButton = document.getElementById('addShowingsButton');
    const selectedShowings = new Set(); // Store selected showing IDs

    // Function to get the current week's Monday
    const getMondayOfCurrentWeek = () => {
        const today = new Date();
        const diff = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1); // Adjust if it's Sunday
        return new Date(today.setDate(diff));
    };

    // Set currentStartDate to the Monday of the current week
    let currentStartDate = getMondayOfCurrentWeek();

    // Event listeners
    nextWeekButton.addEventListener('click', () => changeWeek(7));
    prevWeekButton.addEventListener('click', () => changeWeek(-7));
    theaterSelect.addEventListener('change', loadShowingsForWeek);
    addShowingsButton.addEventListener('click', assignMovieToShowings);

    // Load initial data
    loadTheaters();
    loadMovies();

    // Load theaters from backend and populate the dropdown
    function loadTheaters() {
        fetch('http://localhost:8080/api/theater')
            .then(response => response.json())
            .then(theaters => populateSelect(theaterSelect, theaters, 'theaterId', 'name'))
            .catch(error => console.error('Error loading theaters:', error));
    }

    // Load movies from backend and populate the dropdown
    function loadMovies() {
        fetch('http://localhost:8080/api/movie')
            .then(response => response.json())
            .then(movies => populateSelect(movieSelect, movies, 'movieId', 'title'))
            .catch(error => console.error('Error loading movies:', error));
    }

    // Utility function to populate select elements
    function populateSelect(selectElement, items, itemIdField, itemTextField) {
        selectElement.innerHTML = ''; // Clear previous options
        selectElement.appendChild(new Option('-', '', true, true));
        items.forEach(item => selectElement.appendChild(new Option(item[itemTextField], item[itemIdField])));
    }

    // Fetch available showings for the selected week
    function loadShowingsForWeek() {
        const theaterId = theaterSelect.value;
        if (!theaterId) return;

        const startDate = currentStartDate.toISOString().split('T')[0];
        fetch(`http://localhost:8080/api/showings/${theaterId}/available-showings?startDate=${startDate}`)
            .then(response => response.json())
            .then(showings => renderShowings(showings))
            .catch(error => console.error('Error loading showings:', error));
    }

    // Render showings for each day of the week
    function renderShowings(showings) {
        showingsContainer.innerHTML = ''; // Clear container
        const daysOfWeek = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag', 'søndag'];
        const timeSlots = ['12:00', '16:00', '20:00'];
        const dayColumns = {};

        // Initialize columns for each day of the week
        daysOfWeek.forEach((day, index) => {
            const column = createDayColumn(day, index);
            dayColumns[day] = column;
            showingsContainer.appendChild(column);
        });

        // Process showings and map them to the correct day and time slots
        daysOfWeek.forEach((day, index) => {
            const currentDayShowings = showings.filter(showing => isShowingOnDate(showing.date, index));
            timeSlots.forEach(timeSlot => renderTimeSlot(day, timeSlot, currentDayShowings, dayColumns));
        });
    }

    // Create a column for a day
    function createDayColumn(day, index) {
        const column = document.createElement('div');
        column.classList.add('day-column');

        const dayDate = new Date(currentStartDate);
        dayDate.setDate(currentStartDate.getDate() + index);
        const formattedDate = `${dayDate.getDate()}.${dayDate.getMonth() + 1}`;

        const header = document.createElement('h3');
        header.textContent = `${day.charAt(0).toUpperCase() + day.slice(1)}, d. ${formattedDate}`;
        column.appendChild(header);

        return column;
    }

    // Check if a showing is on the current day
    function isShowingOnDate(showingDate, dayOffset) {
        const dayDate = new Date(currentStartDate);
        dayDate.setDate(currentStartDate.getDate() + dayOffset);
        return new Date(showingDate).toDateString() === dayDate.toDateString();
    }

    // Render time slot for a specific day
    function renderTimeSlot(day, timeSlot, currentDayShowings, dayColumns) {
        const matchingShowing = currentDayShowings.find(showing => showing.startTime.startsWith(timeSlot));
        const showingElement = document.createElement('div');
        showingElement.classList.add('showing');

        if (matchingShowing) {
            showingElement.textContent = matchingShowing.startTime.substring(0, 5);
            if (selectedShowings.has(matchingShowing.showingId)) showingElement.classList.add('selected');
            matchingShowing.movieTitle ? showingElement.classList.add('booked') : showingElement.classList.add('available');
            showingElement.addEventListener('click', () => toggleSelection(showingElement, matchingShowing.showingId));
        } else {
            showingElement.classList.add('booked');
            showingElement.textContent = `${timeSlot}`;
        }

        dayColumns[day].appendChild(showingElement);
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

    // Assign movie to selected showings
    function assignMovieToShowings() {
        const theaterId = theaterSelect.value;
        const movieId = movieSelect.value;

        if (selectedShowings.size === 0) return alert('Vælg mindst én ledig showing.');
        if (!movieId) return alert('Vælg en film for at tilføje den til de valgte visninger.');

        fetch(`http://localhost:8080/api/showings/${theaterId}/assign-movie/${movieId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Array.from(selectedShowings)) // Send showing IDs as JSON
        })
            .then(response => {
                if (response.ok) {
                    alert('Film tilføjet til showings med succes');
                    selectedShowings.clear();
                    loadShowingsForWeek(); // Reload the showings for the current week
                } else {
                    response.text().then(text => alert(text));
                }
            })
            .catch(error => console.error('Error assigning movie to showings:', error));
    }

    // Load showings for the current week when the page loads
    loadShowingsForWeek();
});
