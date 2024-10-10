document.addEventListener('DOMContentLoaded', () => {
    const genreFilter = document.getElementById('genre-filter');
    const ageLimitFilter = document.getElementById('age-limit-filter');

    genreFilter.addEventListener('change', fetchAndDisplayMovies);
    ageLimitFilter.addEventListener('change', fetchAndDisplayMovies);

    fetchAndDisplayMovies();
    fetchGenres();
    fetchAgeLimits();
});

async function fetchAndDisplayMovies() {
    try {
        const response = await fetch('https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net/api/movie');
        const movies = await response.json();

        const selectedGenre = document.getElementById('genre-filter').value;
        const selectedAgeLimit = document.getElementById('age-limit-filter').value;

        const filteredMovies = movies.filter(movie => {
            return (!selectedGenre || movie.genre === selectedGenre) &&
                (!selectedAgeLimit || movie.ageLimit.toString() === selectedAgeLimit);
        });

        const movieContainer = document.getElementById('movies-container2');
        movieContainer.innerHTML = '';  // Clear any previous content

        filteredMovies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            movieContainer.appendChild(movieCard);
        });

    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

async function fetchGenres() {
    try {
        const response = await fetch('https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net/api/movie');
        const movies = await response.json();
        const genres = [...new Set(movies.map(movie => movie.genre))];

        const genreFilter = document.getElementById('genre-filter');
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

async function fetchAgeLimits() {
    try {
        const response = await fetch('https://kino-ebgghmcxe2h0eeeg.northeurope-01.azurewebsites.net/api/movie');
        const movies = await response.json();
        const ageLimits = [...new Set(movies.map(movie => movie.ageLimit))];

        const ageLimitFilter = document.getElementById('age-limit-filter');
        ageLimits.forEach(ageLimit => {
            const option = document.createElement('option');
            option.value = ageLimit;
            option.textContent = ageLimit;
            ageLimitFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching age limits:', error);
    }
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.classList.add('movie-card');

    const poster = document.createElement('img');
    poster.src = movie.imageUrl || 'styles/images/fb4fc0dd-d8a2-4c0a-b4f7-32812b784e75.webp';
    poster.alt = `${movie.title} poster`;
    poster.classList.add('movie-poster');
    card.appendChild(poster);

    const title = document.createElement('h3');
    title.innerText = movie.title;
    card.appendChild(title);

    const genre = document.createElement('p');
    genre.innerText = `Genre: ${movie.genre}`;
    card.appendChild(genre);

    const description = document.createElement('p');
    description.innerText = `Beskrivelse: ${movie.description}`;
    card.appendChild(description);

    const duration = document.createElement('p');
    duration.innerText = `Spilletid: ${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`;
    card.appendChild(duration);

    const ageLimit = document.createElement('p');
    ageLimit.innerText = `Aldersgrænse: ${movie.ageLimit}`;
    card.appendChild(ageLimit);

    return card;
}