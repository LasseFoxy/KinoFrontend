import { Tickets } from './tickets.js';

export class Movies {
    constructor() {
        this.bookingDetails = {
            movieTitle: null,
            time: null,
            theaterId: null,
            showingId: null,
            seatIds: []
        };
        this.moviesContainer = document.getElementById('movies-container');
        this.datePicker = document.getElementById('movie-date-picker');
        this.resetButton = document.getElementById('reset-today-btn');
        this.fetchAndDisplayMovies();
        this.initDatePicker();
        this.initResetButton();
    }

    initDatePicker() {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3); // Set max date to 3 months from today

        // Restrict date picker to today and 3 months from now
        this.datePicker.min = today.toISOString().split('T')[0];
        this.datePicker.max = maxDate.toISOString().split('T')[0];
        this.datePicker.value = today.toISOString().split('T')[0]; // Default to today's date

        // Add an event listener to handle date changes
        this.datePicker.addEventListener('change', (event) => {
            const selectedDate = event.target.value; // This will be in 'YYYY-MM-DD' format
            console.log(`Selected date: ${selectedDate}`);
            this.fetchAndDisplayMovies(selectedDate); // Fetch and display movies for the selected date
        });
    }

    initResetButton() {
        // Add event listener for the reset button to reset to today's date
        this.resetButton.addEventListener('click', () => {
            const today = new Date().toISOString().split('T')[0]; // Get today's date
            this.datePicker.value = today;  // Reset the date picker to today
            console.log(`Date picker reset to today's date: ${today}`);
            this.fetchAndDisplayMovies(today);  // Fetch movies for today
        });
    }

    // Fetch and display movies based on the selected date
    fetchAndDisplayMovies(selectedDate = null) {
        const dateToFetch = selectedDate || this.datePicker.value || new Date().toISOString().split('T')[0];

        console.log(`Fetching movies for date: ${dateToFetch}`);

        // Clear the movie list content to allow reloading
        this.moviesContainer.innerHTML = '';

        fetch('http://localhost:8080/api/movie/movieDTOs')
            .then(response => response.json())
            .then(movies => {
                console.log('Movies fetched:', movies);
                movies.forEach(movie => this.displayMovie(movie, dateToFetch));
            })
            .catch(error => console.error('Error fetching movies:', error));
    }


    // Display individual movie and filter its showtimes by the selected date
    displayMovie(movie, selectedDate) {
        try {
            console.log(`Processing movie: ${movie.title} for date: ${selectedDate}`);

            // Check if movie.showings exists and is an array
            if (!Array.isArray(movie.showings)) {
                console.error(`Error: Showings data for movie "${movie.title}" is not an array or is missing.`);
                return; // Skip this movie if showings are not valid
            }

            // Filter the showings that are on the selected date
            const showingsForDate = movie.showings.filter(showing => {
                console.log(`Checking showing date "${showing.date}" against selected date "${selectedDate}"`);
                return showing.date === selectedDate;  // Filter showings based on the selected date
            });

            // If there are no showings on the selected date, skip this movie
            if (showingsForDate.length === 0) {
                console.log(`No showings for movie "${movie.title}" on ${selectedDate}`);
                return;
            }

            // Create the movie container
            const movieDiv = document.createElement('div');
            movieDiv.classList.add('movie');

            const posterImg = document.createElement('img');
            posterImg.src = movie.imageUrl;
            posterImg.alt = `${movie.title} Poster`;
            posterImg.width = 200;
            posterImg.height = 300;

            const titleElement = document.createElement('h3');
            titleElement.innerText = movie.title;

            movieDiv.appendChild(posterImg);
            movieDiv.appendChild(titleElement);

            // Loop through the filtered showings for the selected date
            showingsForDate.forEach(showing => {
                const showingDiv = document.createElement('div');
                showingDiv.classList.add('showing');

                // Check if necessary data for the showing exists
                if (!showing.theaterName) {
                    console.error(`Error: Missing data for a showing in movie "${movie.title}".`);
                    return; // Skip this showing if data is incomplete
                }

                // Extract and format the showing time
                const showtime = showing.startTime;  // Assuming startTime contains only the time (HH:MM:SS)
                console.log(`Creating button for showing at ${showtime} in theater ${showing.theaterName}`);

                // Create a button element for the showing
                const showtimeButton = document.createElement('button');
                showtimeButton.classList.add('showtime-button');
                showtimeButton.innerText = `Showtime: ${showtime} in ${showing.theaterName}`;

                // Set the necessary data attributes for the button
                showtimeButton.dataset.startTime = showing.startTime;
                showtimeButton.dataset.movie = movie.title;
                showtimeButton.dataset.theaterId = showing.theaterId;
                showtimeButton.dataset.showingId = showing.showingId;

                // Append the button to the showingDiv
                showingDiv.appendChild(showtimeButton);
                movieDiv.appendChild(showingDiv);

                // Add click handler for the button
                showtimeButton.addEventListener('click', (e) => {
                    this.handleShowingClick(e);
                });
            });

            // Append the movieDiv to the movies container
            this.moviesContainer.appendChild(movieDiv);
            console.log(`Movie "${movie.title}" with showings added to the container.`);

        } catch (error) {
            console.error(`Error processing movie "${movie.title}":`, error);
        }
    }




    // Function to handle clicking on a showtime
    handleShowingClick(e) {
        try {
            // Check if the clicked element is a button inside a showing div
            if (e.target.classList.contains('showtime-button')) {
                // Retrieve the data from the clicked button
                const selectedTime = e.target.dataset.startTime;
                const selectedMovie = e.target.dataset.movie;
                const theaterId = e.target.dataset.theaterId;
                const showingId = e.target.dataset.showingId;

                // Log the details of the selected showing
                console.log(`Selected Movie: ${selectedMovie}`);
                console.log(`Selected Showtime: ${selectedTime}`);
                console.log(`Theater ID: ${theaterId}`);
                console.log(`Showing ID: ${showingId}`);

                // Redirect to the seat selection view by updating the URL hash
                this.redirectToSeatSelection(selectedMovie, selectedTime, theaterId, showingId);
            } else {
                console.log('Clicked element is not a showtime button.');
            }
        } catch (error) {
            console.error('Error handling showtime click event:', error);
        }
    }

    // This function transitions to the seat selection page
    // This function transitions to the seat selection page
    redirectToSeatSelection(movieTitle, time, theaterId, showingId) {
        clearSelectedSeats();
        // Set booking details based on movie selection
        this.setBookingDetails(movieTitle, time, theaterId, showingId);

        // Switch to the seat selection container
        switchContainer('seat-selector-container');

        // Always create a new instance of Tickets for each new showing
        window.tickets = new Tickets(this.bookingDetails);  // Reinitialize the Tickets class with new booking details
        console.log('Tickets instance created:', window.tickets);
        window.tickets.fetchAndDisplaySeats();  // Fetch and display seats for the selected showtime
    }


    // Set booking details when transitioning from the movie selection page
    setBookingDetails(movieTitle, time, theaterId, showingId) {
        this.bookingDetails.movieTitle = movieTitle;
        this.bookingDetails.time = time;
        this.bookingDetails.theaterId = theaterId;
        this.bookingDetails.showingId = showingId;
        console.log("Booking Details:", this.bookingDetails);
    }
}

// Initialize Movies class and set up event listeners
const movies = new Movies();
document.addEventListener('click', (e) =>
    movies.handleShowingClick(e),
);

function switchContainer(containerId) {
    const currentVisible = document.querySelector('.container-visible');

    // Hide the current visible container
    if (currentVisible) {
        currentVisible.classList.remove('container-visible');
        currentVisible.classList.add('container');
    }

    // Show the new container
    const newContainer = document.getElementById(containerId);
    newContainer.classList.remove('container');
    newContainer.classList.add('container-visible');
}

// Function to format the date and time to show only the time and theater name
function formatShowing(fullDateTime, theaterName) {
    const date = new Date(fullDateTime); // Convert to a Date object
    const hours = String(date.getHours()).padStart(2, '0'); // Get hours and pad with 0 if needed
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes and pad with 0 if needed
    return `${hours}:${minutes} at ${theaterName}`;
}

// Track selected seats in an array
let selectedSeats = [];

// Function to clear selected seats
function clearSelectedSeats() {
    // Clear the selectedSeats array
    selectedSeats = [];
    // Find all seats with the 'selected' class and remove the class
    const selectedSeatElements = document.querySelectorAll('.seat.selected');
    selectedSeatElements.forEach(seat => {
        seat.classList.remove('selected');
    });
}

