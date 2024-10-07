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
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('movie');

        const posterImg = document.createElement('img');
        posterImg.src = `http://localhost:8080${movie.posterUrl}`;
        posterImg.alt = `${movie.title} Poster`;
        posterImg.width = 200;
        posterImg.height = 300;

        const titleElement = document.createElement('h3');
        titleElement.innerText = movie.title;

        movieDiv.appendChild(posterImg);
        movieDiv.appendChild(titleElement);

        movie.showings.forEach(showing => {
            const showingDiv = document.createElement('div');
            showingDiv.classList.add('showing');

            // Use the formatShowtime function to format the showtime
            const formattedShowing = formatShowing(showing.startTime, showing.theaterName);

            showingDiv.innerText = formattedShowing;
            showingDiv.dataset.startTime = showing.startTime;
            showingDiv.dataset.movie = movie.title;
            showingDiv.dataset.theaterId = showing.theaterId;
            showingDiv.dataset.showingId = showing.showingId;

            movieDiv.appendChild(showingDiv);
        });

        this.moviesContainer.appendChild(movieDiv);
    }

    // Function to handle clicking on a showtime
    handleShowingClick(e) {
        if (e.target.classList.contains('showing')) {
            const selectedTime = e.target.dataset.time;
            const selectedMovie = e.target.dataset.movie;
            const theaterId = e.target.dataset.theaterId;
            const showingId = e.target.dataset.showingId;

            // Call redirectToSeatSelection with the selected details
            this.redirectToSeatSelection(selectedMovie, selectedTime, theaterId, showingId);
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