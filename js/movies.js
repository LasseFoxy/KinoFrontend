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
        this.fetchAndDisplayMovies();
    }

    // Fetch and display movies with showtimes
    fetchAndDisplayMovies() {
        fetch('http://localhost:8080/api/movie/movieDTOs')
            .then(response => response.json())
            .then(movies => {
                this.moviesContainer.innerHTML = '';  // Clear any existing content
                movies.forEach(movie => this.displayMovie(movie));
            })
            .catch(error => console.error('Error fetching movies:', error));
    }


    // Display individual movie with its showtimes
    displayMovie(movie) {
        try {
            console.log(`Processing movie: ${movie.title}`);

            // Get today's date in 'YYYY-MM-DD' format
            const today = new Date().toISOString().split('T')[0]; // Only get the date part as a string
            console.log(`Today's date: ${today}`);

            // Check if movie.showings exists and is an array
            if (!Array.isArray(movie.showings)) {
                console.error(`Error: Showings data for movie "${movie.title}" is not an array or is missing.`);
                return; // Skip this movie if showings are not valid
            }

            // Filter the showings that are on today's date (using 'date' field)
            const todaysShowings = movie.showings.filter(showing => {
                // Log the full showing object for debugging
                console.log(`Showing object for movie "${movie.title}":`, showing);

                // Ensure the 'date' field is present and valid
                if (!showing.date) {
                    console.error(`Error: Showing date is missing for movie "${movie.title}". Skipping this showing.`);
                    return false; // Skip this showing if the 'date' field is invalid
                }

                // Compare the 'date' field with today's date
                return showing.date.split('T')[0] === today;
            });

            // Log the number of showings for today
            console.log(`Number of showings for movie "${movie.title}" today: ${todaysShowings.length}`);

            // If there are no showings today, do not display the movie
            if (todaysShowings.length === 0) {
                console.log(`No showings today for movie: ${movie.title}`);
                return; // Skip this movie if there are no showings today
            }

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

            // Loop through the filtered showings for today
            todaysShowings.forEach(showing => {
                const showingDiv = document.createElement('div');
                showingDiv.classList.add('showing');

                // Check if necessary data for the showing exists (e.g., 'theaterName')
                if (!showing.theaterName) {
                    console.error(`Error: Missing data for a showing in movie "${movie.title}".`);
                    return; // Skip this showing if data is incomplete
                }

                // Extract the time portion from the 'date' field (assuming format like 'YYYY-MM-DDTHH:MM:SS')
                const showtime = showing.date.split('T')[1]; // This will give you the time portion

                console.log(`Creating button for showing on: ${showing.time} in theater: ${showing.theaterName} at ${showing.startTime}`);

                // Create a button element for the showing
                const showtimeButton = document.createElement('button');
                showtimeButton.classList.add('showtime-button');
                showtimeButton.innerText = `Showtime: ${showing.startTime} in ${showing.theaterName}`;

                // Set the necessary data attributes for the button
                showtimeButton.dataset.startTime = showing.startTime; // Using 'date' here instead of 'startTime'
                showtimeButton.dataset.movie = movie.title;
                showtimeButton.dataset.theaterId = showing.theaterId;
                showtimeButton.dataset.showingId = showing.showingId;

                // Append the button to the showingDiv
                showingDiv.appendChild(showtimeButton);
                movieDiv.appendChild(showingDiv);
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
    redirectToSeatSelection(movieTitle, time, theaterId, showingId) {
        clearSelectedSeats();
        // Set booking details based on movie selection
        this.setBookingDetails(movieTitle, time, theaterId, showingId);

        // Switch to the seat selection container
        switchContainer('seat-selector-container');

        // Only create an instance of Tickets if it doesn't already exist
        if (!window.tickets) {
            window.tickets = new Tickets(this.bookingDetails);
            console.log('Tickets instance created:', window.tickets);
            window.tickets.fetchAndDisplaySeats();  // Fetch and display seats for the selected showtime
        }
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