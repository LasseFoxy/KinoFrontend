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
        maxDate.setMonth(maxDate.getMonth() + 3);
        this.datePicker.min = today.toISOString().split('T')[0];
        this.datePicker.max = maxDate.toISOString().split('T')[0];
        this.datePicker.value = today.toISOString().split('T')[0];
        this.datePicker.addEventListener('change', (event) => {
            const selectedDate = event.target.value;
            this.fetchAndDisplayMovies(selectedDate);
        });
    }

    initResetButton() {
        this.resetButton.addEventListener('click', () => {
            const today = new Date().toISOString().split('T')[0];
            this.datePicker.value = today;
            this.fetchAndDisplayMovies(today);
        });
    }

    fetchAndDisplayMovies(selectedDate = null) {
        const dateToFetch = selectedDate || this.datePicker.value || new Date().toISOString().split('T')[0];
        this.moviesContainer.innerHTML = '';
        fetch('https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net/api/movie/movieDTOs')
            .then(response => response.json())
            .then(movies => {
                movies.forEach(movie => this.displayMovie(movie, dateToFetch));
            })
            .catch(error => console.error('Error fetching movies:', error));
    }

    displayMovie(movie, selectedDate) {
        try {
            if (!Array.isArray(movie.showings)) {
                return;
            }
            const showingsForDate = movie.showings.filter(showing => showing.date === selectedDate);
            if (showingsForDate.length === 0) {
                return;
            }
            const movieDiv = document.createElement('div');
            movieDiv.classList.add('movie');
            const posterImg = document.createElement('img');
            posterImg.src = movie.imageUrl;
            posterImg.alt = `${movie.title} Poster`;
            posterImg.onerror = function() {
                posterImg.src = 'styles/images/fb4fc0dd-d8a2-4c0a-b4f7-32812b784e75.webp';
            };
            const titleElement = document.createElement('h3');
            titleElement.innerText = movie.title;
            movieDiv.appendChild(posterImg);
            movieDiv.appendChild(titleElement);
            showingsForDate.forEach(showing => {
                const showingDiv = document.createElement('div');
                showingDiv.classList.add('showing');
                if (!showing.theaterName) {
                    return;
                }
                const formattedTime = showing.startTime.slice(0, 5);
                const showtimeButton = document.createElement('button');
                showtimeButton.classList.add('showtime-button');
                showtimeButton.innerText = `Klokken ${formattedTime} i ${showing.theaterName}`;
                showtimeButton.dataset.startTime = showing.startTime;
                showtimeButton.dataset.movie = movie.title;
                showtimeButton.dataset.theaterId = showing.theaterId;
                showtimeButton.dataset.showingId = showing.showingId;
                showingDiv.appendChild(showtimeButton);
                movieDiv.appendChild(showingDiv);
                showtimeButton.addEventListener('click', (e) => {
                    this.handleShowingClick(e);
                });
            });
            this.moviesContainer.appendChild(movieDiv);
        } catch (error) {
            console.error(`Error processing movie "${movie.title}":`, error);
        }
    }

    handleShowingClick(e) {
        try {
            if (e.target.classList.contains('showtime-button')) {
                const selectedTime = e.target.dataset.startTime;
                const selectedMovie = e.target.dataset.movie;
                const theaterId = e.target.dataset.theaterId;
                const showingId = e.target.dataset.showingId;
                this.redirectToSeatSelection(selectedMovie, selectedTime, theaterId, showingId);
            }
        } catch (error) {
            console.error('Error handling showtime click event:', error);
        }
    }

    redirectToSeatSelection(movieTitle, time, theaterId, showingId) {
        clearSelectedSeats();
        this.setBookingDetails(movieTitle, time, theaterId, showingId);
        switchContainer('seat-selector-container');
        window.tickets = new Tickets(this.bookingDetails);
        window.tickets.fetchAndDisplaySeats();
    }

    setBookingDetails(movieTitle, time, theaterId, showingId) {
        this.bookingDetails.movieTitle = movieTitle;
        this.bookingDetails.time = time;
        this.bookingDetails.theaterId = theaterId;
        this.bookingDetails.showingId = showingId;
    }
}

const movies = new Movies();
document.addEventListener('click', (e) =>
    movies.handleShowingClick(e),
);

function switchContainer(containerId) {
    const currentVisible = document.querySelector('.container-visible');
    if (currentVisible) {
        currentVisible.classList.remove('container-visible');
        currentVisible.classList.add('container');
    }
    const newContainer = document.getElementById(containerId);
    newContainer.classList.remove('container');
    newContainer.classList.add('container-visible');
}

function formatShowing(fullDateTime, theaterName) {
    const date = new Date(fullDateTime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} at ${theaterName}`;
}

let selectedSeats = [];

function clearSelectedSeats() {
    selectedSeats = [];
    const selectedSeatElements = document.querySelectorAll('.seat.selected');
    selectedSeatElements.forEach(seat => {
        seat.classList.remove('selected');
    });
}
